import "server-only";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import { timeAgo } from "@/lib/activity-text";
import { ROLE_LABEL, type Role } from "@/lib/permissions";
import { supabaseAdmin } from "@/lib/supabase/server";

export type TeamMember = {
  userId: string;
  email: string | null;
  role: Role;
  /** "invited" until the person has chosen a password and signed in for the first time. */
  status: "active" | "invited";
  /** Already worded ("Last signed in 3 hours ago"), worked out on the server so the browser shows exactly the same text. */
  seen: string;
  isYou: boolean;
};

export type TeamResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export async function listTeam(currentUserId: string): Promise<TeamMember[]> {
  const profiles = await db.select().from(schema.adminProfiles);
  const { data } = await supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 200 });
  const users = new Map((data?.users ?? []).map((u) => [u.id, u]));
  return profiles
    .map((p) => {
      const u = users.get(p.userId);
      return {
        userId: p.userId,
        email: u?.email ?? null,
        role: p.role,
        status: u?.last_sign_in_at ? ("active" as const) : ("invited" as const),
        seen: u?.last_sign_in_at ? `Last signed in ${timeAgo(new Date(u.last_sign_in_at))}` : u?.invited_at || u?.created_at ? `Invited ${timeAgo(new Date((u.invited_at ?? u.created_at)!))}` : "",
        isYou: p.userId === currentUserId,
      };
    })
    .sort((a, b) => Number(b.isYou) - Number(a.isYou) || (a.email ?? "").localeCompare(b.email ?? ""));
}

async function ownerCount(): Promise<number> {
  const rows = await db.select({ id: schema.adminProfiles.userId }).from(schema.adminProfiles).where(eq(schema.adminProfiles.role, "owner"));
  return rows.length;
}

/** A one-time link, on this site, for the person to choose a password. The link carries a token, never a password. */
async function makeLink(email: string, origin: string): Promise<TeamResult<{ link: string; userId: string }>> {
  const admin = supabaseAdmin();
  // A new person is invited. Someone who was invited before and has not signed in yet gets a fresh sign-in link.
  let type: "invite" | "magiclink" = "invite";
  let result = await admin.auth.admin.generateLink({ type: "invite", email });
  if (result.error) {
    type = "magiclink";
    result = await admin.auth.admin.generateLink({ type: "magiclink", email });
  }
  const props = result.data?.properties;
  const user = result.data?.user;
  if (result.error || !props?.hashed_token || !user) {
    const taken = /already|registered|exists/i.test(result.error?.message ?? "");
    return { ok: false, error: taken ? "That email address already has an account." : "Could not create the invitation. Try again in a moment." };
  }
  return { ok: true, userId: user.id, link: `${origin}/admin/accept-invite?token_hash=${encodeURIComponent(props.hashed_token)}&type=${type}` };
}

async function sendInviteEmail(email: string, role: Role, link: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const from = process.env.CONTACT_FROM_EMAIL ?? "Idyllic Technologies <onboarding@resend.dev>";
    const { error } = await new Resend(key).emails.send({
      from,
      to: email,
      subject: "You have been invited to the Idyllic Technologies admin",
      text: [
        `You have been invited to the Idyllic Technologies website admin as ${ROLE_LABEL[role]}.`,
        "",
        "Open this link to choose your password and set up your sign in. It can be used once.",
        link,
        "",
        "If you were not expecting this, you can ignore this email.",
      ].join("\n"),
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error("Invitation email failed", error);
    return false;
  }
}

/** Creates the person's account and their role, and returns the link. It is emailed when email is set up, and always returned so it can be copied. */
export async function inviteMember(email: string, role: Role, actorId: string, origin: string): Promise<TeamResult<{ link: string; emailed: boolean }>> {
  const made = await makeLink(email, origin);
  if (!made.ok) return made;
  await db.insert(schema.adminProfiles).values({ userId: made.userId, role }).onConflictDoUpdate({ target: schema.adminProfiles.userId, set: { role } });
  await logActivity(actorId, "user.invite", "user", made.userId);
  const emailed = await sendInviteEmail(email, role, made.link);
  return { ok: true, link: made.link, emailed };
}

/** A new link for someone who has not signed in yet. */
export async function resendInvite(userId: string, origin: string): Promise<TeamResult<{ link: string; emailed: boolean; email: string }>> {
  const [profile] = await db.select().from(schema.adminProfiles).where(eq(schema.adminProfiles.userId, userId)).limit(1);
  const { data } = await supabaseAdmin().auth.admin.getUserById(userId);
  const email = data.user?.email;
  if (!profile || !email) return { ok: false, error: "That person could not be found." };
  if (data.user?.last_sign_in_at) return { ok: false, error: "They have already signed in." };
  const made = await makeLink(email, origin);
  if (!made.ok) return made;
  const emailed = await sendInviteEmail(email, profile.role, made.link);
  return { ok: true, link: made.link, emailed, email };
}

export async function changeRole(userId: string, role: Role, actorId: string): Promise<TeamResult> {
  if (userId === actorId) return { ok: false, error: "You cannot change your own role." };
  const [current] = await db.select().from(schema.adminProfiles).where(eq(schema.adminProfiles.userId, userId)).limit(1);
  if (!current) return { ok: false, error: "That person could not be found." };
  if (current.role === role) return { ok: true };
  if (current.role === "owner" && (await ownerCount()) <= 1) return { ok: false, error: "There must always be at least one Admin." };
  await db.update(schema.adminProfiles).set({ role }).where(eq(schema.adminProfiles.userId, userId));
  await logActivity(actorId, "user.role", "user", userId);
  return { ok: true };
}

export async function removeMember(userId: string, actorId: string): Promise<TeamResult> {
  if (userId === actorId) return { ok: false, error: "You cannot remove yourself." };
  const [current] = await db.select().from(schema.adminProfiles).where(eq(schema.adminProfiles.userId, userId)).limit(1);
  if (!current) return { ok: false, error: "That person could not be found." };
  if (current.role === "owner" && (await ownerCount()) <= 1) return { ok: false, error: "There must always be at least one Admin." };
  // Logged first, while the person can still be named. Then access is removed and the sign in account deleted.
  await logActivity(actorId, "user.remove", "user", userId);
  await db.delete(schema.adminProfiles).where(eq(schema.adminProfiles.userId, userId));
  const { error } = await supabaseAdmin().auth.admin.deleteUser(userId);
  if (error) console.error("Could not delete the sign in account", error.message);
  return { ok: true };
}

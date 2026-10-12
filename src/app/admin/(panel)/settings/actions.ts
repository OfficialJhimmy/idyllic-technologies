"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/seo";
import { changeRole, inviteMember, removeMember, resendInvite, type TeamResult } from "@/lib/team/team";
import { inviteSchema, roleChangeSchema, userIdSchema } from "@/lib/team/schemas";

/** The address the person is using now, so the invitation link opens the same site, such as a staging address. */
async function origin(): Promise<string> {
  const given = (await headers()).get("origin");
  try {
    if (given) return new URL(given).origin;
  } catch {
    // Fall through to the configured address.
  }
  return siteUrl();
}

const INVALID = { ok: false as const, error: "Check the details and try again." };

// Every action below is for Admins only. The check is repeated here because a page's own check does not protect an action.

export async function inviteAction(raw: unknown): Promise<TeamResult<{ link: string; emailed: boolean }>> {
  const session = await requireAdmin({ role: "owner", section: "team" });
  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? INVALID.error };
  const result = await inviteMember(parsed.data.email, parsed.data.role, session.userId, await origin());
  revalidatePath("/admin/settings");
  return result;
}

export async function resendInviteAction(userId: unknown): Promise<TeamResult<{ link: string; emailed: boolean; email: string }>> {
  await requireAdmin({ role: "owner", section: "team" });
  const parsed = userIdSchema.safeParse({ userId });
  if (!parsed.success) return INVALID;
  return resendInvite(parsed.data.userId, await origin());
}

export async function changeRoleAction(userId: unknown, role: unknown): Promise<TeamResult> {
  const session = await requireAdmin({ role: "owner", section: "team" });
  const parsed = roleChangeSchema.safeParse({ userId, role });
  if (!parsed.success) return INVALID;
  const result = await changeRole(parsed.data.userId, parsed.data.role, session.userId);
  revalidatePath("/admin/settings");
  return result;
}

export async function removeMemberAction(userId: unknown): Promise<TeamResult> {
  const session = await requireAdmin({ role: "owner", section: "team" });
  const parsed = userIdSchema.safeParse({ userId });
  if (!parsed.success) return INVALID;
  const result = await removeMember(parsed.data.userId, session.userId);
  revalidatePath("/admin/settings");
  return result;
}

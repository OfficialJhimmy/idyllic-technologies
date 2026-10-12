"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { inviteTokenSchema, newPasswordSchema } from "@/lib/team/schemas";
import { supabaseServer } from "@/lib/supabase/server";

export type AcceptState = { error?: string; fieldErrors?: { password?: string; confirm?: string } };

const EXPIRED = "This link has expired or was already used. Ask an Admin to send you a new one.";

/**
 * Turns the one-time link into a signed-in session and sets the person's password. The link only does anything
 * when this form is submitted, so an email scanner that merely opens the page cannot use it up. The person then
 * carries on to the sign in page, which asks them to set up their authenticator app.
 */
export async function acceptInviteAction(_prev: AcceptState, formData: FormData): Promise<AcceptState> {
  const token = inviteTokenSchema.safeParse({ tokenHash: formData.get("tokenHash"), type: formData.get("type") });
  if (!token.success) return { error: EXPIRED };

  const pw = newPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!pw.success) {
    const fieldErrors: NonNullable<AcceptState["fieldErrors"]> = {};
    for (const issue of pw.error.issues) {
      const key = issue.path[0] === "confirm" ? "confirm" : "password";
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: token.data.tokenHash, type: token.data.type });
  if (error || !data.user) return { error: EXPIRED };

  // Only people who were added to the admin list can use a link, whatever the link is.
  const [profile] = await db.select({ role: schema.adminProfiles.role }).from(schema.adminProfiles).where(eq(schema.adminProfiles.userId, data.user.id)).limit(1);
  if (!profile) {
    await supabase.auth.signOut();
    return { error: "This account is not on the admin list. Ask an Admin to invite you again." };
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password: pw.data.password });
  if (passwordError) return { error: "That password could not be used. Try a longer one that is not common." };

  redirect("/admin/login");
}

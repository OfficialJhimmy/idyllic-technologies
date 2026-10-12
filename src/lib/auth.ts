import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { canAccess, type Role, type Section } from "@/lib/permissions";
import { supabaseServer } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string | undefined;
  role: Role;
};

/**
 * Call at the top of every admin page, server action and admin route handler.
 * Requires a signed-in user, an admin_profiles row and a completed TOTP step (aal2).
 */
export async function requireAdmin(opts?: { role?: "owner"; section?: Section }): Promise<AdminSession> {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/admin/login");

  // Login decides between the TOTP code step and first-time enrolment from the session itself.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") redirect("/admin/login");

  const [profile] = await db
    .select()
    .from(schema.adminProfiles)
    .where(eq(schema.adminProfiles.userId, user.id))
    .limit(1);
  if (!profile) redirect("/admin/login?error=not-allowed");
  if (opts?.role === "owner" && profile.role !== "owner") redirect("/admin");
  // A section this role may not use sends the person back to the dashboard, on pages and in server actions alike.
  if (opts?.section && !canAccess(profile.role, opts.section)) redirect("/admin");

  return { userId: user.id, email: user.email, role: profile.role };
}

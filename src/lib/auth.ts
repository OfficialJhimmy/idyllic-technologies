import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "@/db";
import { canAccess, type Role, type Section } from "@/lib/permissions";
import { supabaseServer } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string | undefined;
  role: Role;
};

/**
 * The signed in person, checked once per request. The admin layout and the page both ask, and without sharing the
 * answer each of them would call Supabase's auth service and the database again.
 */
const loadSession = cache(async (): Promise<AdminSession> => {
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

  return { userId: user.id, email: user.email, role: profile.role };
});

/**
 * Call at the top of every admin page, server action and admin route handler.
 * Requires a signed-in user, an admin_profiles row and a completed TOTP step (aal2), and optionally a role or section.
 */
export async function requireAdmin(opts?: { role?: "owner"; section?: Section }): Promise<AdminSession> {
  const session = await loadSession();
  if (opts?.role === "owner" && session.role !== "owner") redirect("/admin");
  // A section this role may not use sends the person back to the dashboard, on pages and in server actions alike.
  if (opts?.section && !canAccess(session.role, opts.section)) redirect("/admin");
  return session;
}

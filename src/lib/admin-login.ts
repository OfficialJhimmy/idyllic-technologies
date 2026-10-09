import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { supabaseServer } from "@/lib/supabase/server";

export const passwordSchema = z.object({
  email: z.email("Enter a valid email address").max(254),
  password: z.string().min(1, "Enter your password").max(256),
});

export const totpSchema = z.object({
  factorId: z.uuid(),
  code: z.string().regex(/^\d{6}$/, "Enter the 6 digit code"),
});

/** Where the sign-in flow is for the current session. The login page renders from this. */
export type LoginState =
  | { kind: "password" }
  | { kind: "mfa"; factorId: string }
  | { kind: "enroll" }
  | { kind: "not-allowed" }
  | { kind: "done" };

export async function resolveLoginState(): Promise<LoginState> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { kind: "password" };

  const [profile] = await db
    .select({ role: schema.adminProfiles.role })
    .from(schema.adminProfiles)
    .where(eq(schema.adminProfiles.userId, user.id))
    .limit(1);
  if (!profile) return { kind: "not-allowed" };

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") return { kind: "done" };

  if (aal?.nextLevel === "aal2") {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp[0];
    if (factor) return { kind: "mfa", factorId: factor.id };
  }
  return { kind: "enroll" };
}

export type Enrollment = { factorId: string; qrCode: string; secret: string };

/** Starts TOTP enrolment, first removing abandoned unverified factors so retries do not pile up. */
export async function startTotpEnrollment(): Promise<Enrollment | null> {
  const supabase = await supabaseServer();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Authenticator ${new Date().toISOString()}`,
  });
  if (error || !data) return null;
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

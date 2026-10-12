"use server";

import { redirect } from "next/navigation";
import { passwordSchema, startTotpEnrollment, totpSchema, type Enrollment } from "@/lib/admin-login";
import { supabaseServer } from "@/lib/supabase/server";

export type FormState = { error?: string; enrollment?: Enrollment };

const BAD_CREDENTIALS = "The email or password is not correct.";
const BAD_CODE = "That code is not valid. Check your authenticator app and try again.";

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = passwordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? BAD_CREDENTIALS };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // A wrong password is a 400 from the service. Anything else (no answer, a server error) is not the person's mistake.
    const wrongPassword = error.status === 400 || error.code === "invalid_credentials";
    return { error: wrongPassword ? BAD_CREDENTIALS : "The sign in service did not answer in time. Wait a moment and try again." };
  }

  // The login page works out the next step (code, enrolment or dashboard) from the session.
  redirect("/admin/login");
}

export async function startEnrollmentAction(): Promise<FormState> {
  const enrollment = await startTotpEnrollment();
  if (!enrollment) return { error: "Could not start setup. Try again in a moment." };
  return { enrollment };
}

export async function verifyTotpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = totpSchema.safeParse({
    factorId: formData.get("factorId"),
    code: String(formData.get("code") ?? "").replace(/\s/g, ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? BAD_CODE };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { error: BAD_CODE };

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

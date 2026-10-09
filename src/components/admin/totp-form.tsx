"use client";

import { useActionState } from "react";
import { verifyTotpAction, type FormState } from "@/app/admin/(auth)/login/actions";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initial: FormState = {};

/** Six digit authenticator code. Used for the sign-in step and to finish first-time setup. */
export function TotpForm({ factorId }: { factorId: string }) {
  const [state, action] = useActionState(verifyTotpAction, initial);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="factorId" value={factorId} />
      <Field
        id="code"
        name="code"
        label="6 digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        required
        autoFocus
        error={state.error}
        className="tracking-[0.3em] tabular-nums"
      />
      <SubmitButton pendingLabel="Verifying">Verify</SubmitButton>
    </form>
  );
}

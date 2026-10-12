"use client";

import { useActionState } from "react";
import { acceptInviteAction, type AcceptState } from "@/app/admin/(auth)/accept-invite/actions";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";

const initial: AcceptState = {};

export function AcceptInviteForm({ tokenHash, type }: { tokenHash: string; type: string }) {
  const [state, action] = useActionState(acceptInviteAction, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="tokenHash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <PasswordField id="password" name="password" label="Choose a password" autoComplete="new-password" required autoFocus hint="At least 12 characters, with a letter and a number." error={state.fieldErrors?.password} />
      <PasswordField id="confirm" name="confirm" label="Type it again" autoComplete="new-password" required error={state.fieldErrors?.confirm} />
      {state.error ? (
        <p role="alert" className="rounded-input bg-error-soft px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Saving your password">Save password and continue</SubmitButton>
    </form>
  );
}

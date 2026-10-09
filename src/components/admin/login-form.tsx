"use client";

import { useActionState } from "react";
import { signInAction, type FormState } from "@/app/admin/(auth)/login/actions";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";

const initial: FormState = {};

export function LoginForm() {
  const [state, action] = useActionState(signInAction, initial);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field id="email" name="email" type="email" label="Email" autoComplete="username" required autoFocus />
      <PasswordField id="password" name="password" label="Password" autoComplete="current-password" required />
      {state.error ? (
        <p role="alert" className="rounded-input bg-error-soft px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Signing in">Sign in</SubmitButton>
    </form>
  );
}

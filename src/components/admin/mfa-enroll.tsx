"use client";

import { useActionState } from "react";
import { startEnrollmentAction, type FormState } from "@/app/admin/(auth)/login/actions";
import { TotpForm } from "@/components/admin/totp-form";
import { SubmitButton } from "@/components/ui/submit-button";

const initial: FormState = {};

/**
 * First-time authenticator setup. Enrolment starts on a button press and its result lives in
 * client state, so a page refresh cannot swap the secret while the person is scanning it.
 */
export function MfaEnroll() {
  const [state, action] = useActionState(
    (_prev: FormState) => startEnrollmentAction(),
    initial,
  );

  if (!state.enrollment) {
    return (
      <form action={action} className="flex flex-col gap-5">
        {state.error ? (
          <p role="alert" className="rounded-input bg-error-soft px-4 py-3 text-sm text-error">
            {state.error}
          </p>
        ) : null}
        <SubmitButton pendingLabel="Starting setup">Set up authenticator app</SubmitButton>
      </form>
    );
  }

  const { qrCode, secret, factorId } = state.enrollment;
  return (
    <div className="flex flex-col gap-6">
      {/* A plain img: the QR is an inline SVG data URI, so next/image has nothing to optimise and refuses it.
          Loaded through img, an SVG cannot run scripts. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrCode}
        alt="QR code to add this account to your authenticator app"
        width={192}
        height={192}
        className="h-48 w-48 rounded-card bg-white p-3"
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-ink-muted">Cannot scan the code? Enter this key in your app instead.</p>
        <p className="font-mono text-sm break-all text-ink select-all">{secret}</p>
      </div>
      <TotpForm factorId={factorId} />
    </div>
  );
}

"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitContactAction, type ContactState } from "@/app/(corporate)/contact/actions";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";
import { track } from "@/lib/analytics";

type Props = { initialType: "contact" | "quote"; productSlug: string | null; productName: string | null; turnstileSiteKey: string | null; /** Text the form starts with, for example the answers given to the Energy Assistant. */ initialMessage?: string; fromAssistant?: boolean };

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

const initial: ContactState = { status: "idle" };

/**
 * The contact and quote form. Validated again on the server, protected by Turnstile (when a site key is
 * set) and a hidden honeypot field. Shows loading, error and success states.
 */
export function ContactForm(props: Props) {
  // Each round is a fresh form with fresh action state, which is how "Send another message" starts clean.
  const [round, setRound] = useState(0);
  return <ContactFormRound key={round} {...props} onAnother={() => setRound((r) => r + 1)} />;
}

function ContactFormRound({ initialType, productSlug, productName, turnstileSiteKey, initialMessage = "", fromAssistant = false, onAnother }: Props & { onAnother: () => void }) {
  const [state, action] = useActionState(submitContactAction, initial);
  const [type, setType] = useState(initialType);
  const seen = useRef(state);

  // Report the result once, and let Turnstile issue a fresh token after a failed attempt.
  useEffect(() => {
    if (seen.current === state) return;
    seen.current = state;
    if (state.status === "success") track("contact_submit", { type, ok: true });
    if (state.status === "error") {
      track("contact_submit", { type, ok: false });
      window.turnstile?.reset();
    }
  }, [state, type]);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-5 rounded-container bg-surface p-8 sm:p-10">
        <h2 className="text-3xl font-medium">Thank you</h2>
        <p className="max-w-[48ch] text-lg text-ink-muted">Your message has been sent. We will get back to you as soon as we can.</p>
        <button type="button" onClick={onAnother} className="h-11 rounded-full border border-line-strong px-5 font-medium transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.97]">
          Send another message
        </button>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const kept = state.status === "error" ? state.values : { name: "", email: "", phone: "", message: initialMessage };

  return (
    <form action={action} className="flex flex-col gap-6 rounded-container bg-surface p-6 sm:p-10" noValidate>
      {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" /> : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">What is this about?</legend>
        <div className="flex flex-wrap gap-2">
          {([["contact", "General enquiry"], ["quote", "Request a quote"]] as const).map(([value, label]) => (
            <label key={value} className={`flex h-11 cursor-pointer items-center rounded-full border px-5 font-medium transition-[background-color,color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${type === value ? "border-transparent bg-primary text-on-primary" : "border-line-strong hover:bg-sunken"}`}>
              <input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {fromAssistant ? <input type="hidden" name="origin" value="assistant" /> : null}

      {productSlug ? (
        <>
          <input type="hidden" name="productSlug" value={productSlug} />
          {productName ? <p className="rounded-input bg-sunken px-4 py-3 text-ink-muted">About: <span className="font-medium text-ink">{productName}</span></p> : null}
        </>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" name="name" label="Name" autoComplete="name" required defaultValue={kept.name} error={errors.name} />
        <Field id="contact-email" name="email" type="email" label="Email" autoComplete="email" required defaultValue={kept.email} error={errors.email} />
      </div>
      <Field id="contact-phone" name="phone" type="tel" label="Phone (optional)" autoComplete="tel" defaultValue={kept.phone} error={errors.phone} />
      <TextareaField id="contact-message" name="message" label="Message" rows={6} required error={errors.message} defaultValue={kept.message} />

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="auto" /> : null}

      {state.status === "error" ? <FormBanner tone="error">{state.message}</FormBanner> : null}
      <div>
        <SubmitButton pendingLabel="Sending">Send message</SubmitButton>
      </div>
    </form>
  );
}

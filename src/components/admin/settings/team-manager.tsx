"use client";

import { Copy, EnvelopeSimple, PaperPlaneTilt, Plus, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeRoleAction, inviteAction, removeMemberAction, resendInviteAction } from "@/app/admin/(panel)/settings/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { FormBanner } from "@/components/ui/states";
import { ROLE_LABEL, ROLE_SUMMARY, type Role } from "@/lib/permissions";
import type { TeamMember } from "@/lib/team/team";

type Issued = { email: string; link: string; emailed: boolean };

const roleOptions = (["owner", "editor"] as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }));

/** The people who can use the admin: invite, change role, send a new link, remove. Admins only. */
export function TeamManager({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [inviting, setInviting] = useState(false);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      if (result.ok) {
        setMessage({ tone: "success", text: success });
        router.refresh();
      } else {
        setMessage({ tone: "error", text: result.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <section aria-labelledby="team-heading" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="team-heading" className="text-xl font-medium">
            Team
          </h2>
          <p className="text-ink-muted">{members.length} {members.length === 1 ? "person has" : "people have"} access.</p>
        </div>
        <Button onClick={() => setInviting(true)}>
          <Plus size={18} aria-hidden /> Invite a person
        </Button>
      </div>

      {message ? <FormBanner tone={message.tone}>{message.text}</FormBanner> : null}

      <ul className="divide-y divide-line rounded-card bg-surface">
        {members.map((m) => (
          <li key={m.userId} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-medium text-on-primary">
                {(m.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate font-medium">
                  {m.email ?? "Unknown account"}
                  {m.isYou ? <span className="ml-2 text-sm font-normal text-ink-muted">(you)</span> : null}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  <span className={`inline-flex h-6 items-center rounded-full px-2.5 font-medium ${m.status === "active" ? "bg-success-soft text-success" : "border border-line-strong text-ink-muted"}`}>
                    {m.status === "active" ? "Active" : "Invited"}
                  </span>
                  <span>{m.seen}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {m.isYou ? (
                <span className="inline-flex h-11 items-center rounded-full bg-sunken px-5 font-medium">{ROLE_LABEL[m.role]}</span>
              ) : (
                <div className="w-40">
                  <SelectField
                    id={`role-${m.userId}`}
                    label={`Role for ${m.email ?? "this person"}`}
                    hideLabel
                    options={roleOptions}
                    value={m.role}
                    disabled={pending}
                    className="h-11"
                    onChange={(e) => run(() => changeRoleAction(m.userId, e.target.value), `Role changed to ${ROLE_LABEL[e.target.value as Role]}.`)}
                  />
                </div>
              )}
              {m.status === "invited" ? (
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      setMessage(null);
                      const r = await resendInviteAction(m.userId);
                      if (r.ok) setIssued({ email: r.email, link: r.link, emailed: r.emailed });
                      else setMessage({ tone: "error", text: r.error });
                    })
                  }
                >
                  <PaperPlaneTilt size={18} aria-hidden /> New link
                </Button>
              ) : null}
              {!m.isYou ? (
                <Button variant="ghost" disabled={pending} onClick={() => setRemoving(m)} aria-label={`Remove ${m.email ?? "this person"}`}>
                  <Trash size={18} aria-hidden /> Remove
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <InviteDialog
        open={inviting}
        onOpenChange={setInviting}
        onIssued={(i) => {
          setInviting(false);
          setIssued(i);
          router.refresh();
        }}
      />

      <LinkDialog issued={issued} onClose={() => setIssued(null)} />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this person?"
        body={`${removing?.email ?? "This person"} will lose access straight away and their sign in account is deleted. The changes they made stay.`}
        confirmLabel="Remove access"
        pending={pending}
        onConfirm={() => {
          const target = removing;
          setRemoving(null);
          if (target) run(() => removeMemberAction(target.userId), "Access removed.");
        }}
      />
    </section>
  );
}

function InviteDialog({ open, onOpenChange, onIssued }: { open: boolean; onOpenChange: (o: boolean) => void; onIssued: (i: Issued) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await inviteAction({ email, role });
      if (!result.ok) return setError(result.error);
      setEmail("");
      onIssued({ email: email.trim().toLowerCase(), link: result.link, emailed: result.emailed });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Invite a person" description="They get a link to choose a password, then set up an authenticator app on their first sign in.">
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <Field id="invite-email" name="email" type="email" label="Email address" autoComplete="off" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">Role</legend>
          {roleOptions.map((o) => (
            <label key={o.value} className={`flex cursor-pointer flex-col gap-1 rounded-card border p-4 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${role === o.value ? "border-action bg-primary/25" : "border-line-strong hover:bg-sunken"}`}>
              <span className="flex items-center gap-3 font-medium">
                <input type="radio" name="role" value={o.value} checked={role === o.value} onChange={() => setRole(o.value as Role)} className="size-5 accent-[var(--action)]" />
                {o.label}
              </span>
              <span className="pl-8 text-sm text-ink-muted">{ROLE_SUMMARY[o.value as Role]}</span>
            </label>
          ))}
        </fieldset>
        {error ? <FormBanner tone="error">{error}</FormBanner> : null}
        <div>
          <Button type="submit" size="lg" loading={pending}>
            {pending ? "Creating the invitation" : "Send invitation"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Shows the link after an invitation, so it can be sent by hand when email is not set up or goes astray. */
function LinkDialog({ issued, onClose }: { issued: Issued | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={issued !== null} onOpenChange={(open) => !open && onClose()} title="Invitation ready" description={issued ? `For ${issued.email}` : undefined}>
      {issued ? (
        <div className="flex flex-col gap-4">
          <FormBanner tone={issued.emailed ? "success" : "info"}>
            {issued.emailed ? (
              <span className="flex items-center gap-2"><EnvelopeSimple size={18} aria-hidden /> We emailed them the link.</span>
            ) : (
              "Email is not set up here, so send them this link yourself, for example on WhatsApp."
            )}
          </FormBanner>
          <div className="flex flex-col gap-2">
            <label htmlFor="invite-link" className="text-sm font-medium">Invitation link</label>
            <input id="invite-link" readOnly value={issued.link} onFocus={(e) => e.currentTarget.select()} className="h-12 w-full rounded-input border border-line-strong bg-sunken px-4 text-sm" />
            <p className="text-sm text-ink-muted">It works once and stops working after a short time. Use New link to make another.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(issued.link);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2500);
                } catch {
                  setCopied(false);
                }
              }}
            >
              <Copy size={18} aria-hidden /> {copied ? "Copied" : "Copy link"}
            </Button>
            <Button variant="secondary" onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

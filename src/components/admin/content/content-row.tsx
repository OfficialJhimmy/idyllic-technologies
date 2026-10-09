"use client";

import { ArrowDown, ArrowUp, PencilSimple, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAction, moveAction, setStatusAction } from "@/app/admin/(panel)/content/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormBanner } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";

type Props = {
  kind: "faq" | "testimonial" | "client";
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  first: boolean;
  last: boolean;
  onEdit: () => void;
  children: React.ReactNode;
};

const icon = "flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95] disabled:opacity-40";

/** One item: what it says, whether it is live, and the controls. Publishing is the approval step. */
export function ContentRow({ kind, id, name, status, first, last, onEdit, children }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const live = status === "published";

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) setError(r.error ?? "That did not work");
      router.refresh();
    });

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
        <div className="min-w-0 flex-1">{children}</div>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <StatusBadge status={status} />
          <Button variant={live ? "secondary" : "primary"} loading={pending} onClick={() => run(() => setStatusAction(kind, id, live ? "draft" : "published"))}>
            {live ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1 self-end">
        <button type="button" aria-label={`Move ${name} up`} disabled={first || pending} onClick={() => run(() => moveAction(kind, id, "up"))} className={icon}><ArrowUp size={20} aria-hidden /></button>
        <button type="button" aria-label={`Move ${name} down`} disabled={last || pending} onClick={() => run(() => moveAction(kind, id, "down"))} className={icon}><ArrowDown size={20} aria-hidden /></button>
        <button type="button" aria-label={`Edit ${name}`} onClick={onEdit} className={icon}><PencilSimple size={20} aria-hidden /></button>
        <button type="button" aria-label={`Delete ${name}`} onClick={() => setConfirming(true)} className={icon}><Trash size={20} aria-hidden /></button>
      </div>
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <ConfirmDialog open={confirming} onOpenChange={setConfirming} title="Delete this item?" body="It is removed for good. If you only want it off the website, use Unpublish instead." confirmLabel="Delete" pending={pending} onConfirm={() => { setConfirming(false); run(() => deleteAction(kind, id)); }} />
    </li>
  );
}

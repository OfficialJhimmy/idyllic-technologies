"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormBanner } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PublishStatus, StatusAction } from "@/lib/catalogue/publish";

type Props = {
  /** What is being edited, used in the confirmation text. */
  noun?: "product" | "post";
  status: PublishStatus;
  isNew: boolean;
  dirty: boolean;
  pending: boolean;
  publishedAt: string | null;
  savedAt: string | null;
  issues: string[];
  message: { tone: "error" | "success"; text: string } | null;
  onSave: (action?: StatusAction) => void;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

/** Save and status buttons for the product. Unpublish and archive ask first. */
export function StatusPanel({ noun = "product", status, isNew, dirty, pending, publishedAt, savedAt, issues, message, onSave }: Props) {
  const [confirm, setConfirm] = useState<null | "unpublish" | "archive">(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={status} />
        <span className="text-sm text-ink-muted" aria-live="polite">
          {dirty ? "Unsaved changes" : isNew ? "Not saved yet" : savedAt ? `Saved ${dateFormat.format(new Date(savedAt))}` : "Saved"}
        </span>
      </div>
      {publishedAt ? <p className="hidden text-sm text-ink-muted lg:block">First published {dateFormat.format(new Date(publishedAt))}</p> : null}

      {issues.length > 0 ? (
        <div role="alert" className="rounded-input bg-error-soft px-4 py-3 text-sm text-error">
          <p className="font-medium">Saved, but not published yet. It still needs:</p>
          <ul className="mt-1 list-disc pl-5">
            {issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {message ? <FormBanner tone={message.tone}>{message.text}</FormBanner> : null}

      <div className="flex flex-wrap gap-2">
        {status === "draft" && (
          <>
            <Button size="lg" loading={pending} onClick={() => onSave("publish")}>
              {pending ? "Working" : "Publish"}
            </Button>
            <Button size="lg" variant="secondary" disabled={pending} onClick={() => onSave()}>
              Save draft
            </Button>
          </>
        )}
        {status === "published" && (
          <>
            <Button size="lg" loading={pending} disabled={!dirty} onClick={() => onSave()}>
              {pending ? "Working" : "Save changes"}
            </Button>
            <Button size="lg" variant="secondary" disabled={pending} onClick={() => setConfirm("unpublish")}>
              Unpublish
            </Button>
          </>
        )}
        {status === "archived" && (
          <Button size="lg" variant="secondary" disabled={pending} onClick={() => onSave("restore")}>
            Restore to draft
          </Button>
        )}
        {status !== "archived" && !isNew ? (
          <Button size="lg" variant="ghost" disabled={pending} onClick={() => setConfirm("archive")}>
            Archive
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "archive" ? `Archive this ${noun}?` : `Unpublish this ${noun}?`}
        body={
          confirm === "archive"
            ? `It is removed from the ${noun === "post" ? "website" : "marketplace and website"}. You can restore it to a draft later.`
            : `It is removed from the ${noun === "post" ? "website" : "marketplace and website"} and goes back to a draft.`
        }
        confirmLabel={confirm === "archive" ? `Archive ${noun}` : `Unpublish ${noun}`}
        pending={pending}
        onConfirm={() => {
          const action = confirm;
          setConfirm(null);
          if (action) onSave(action);
        }}
      />
    </div>
  );
}

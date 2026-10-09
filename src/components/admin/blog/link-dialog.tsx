"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { normaliseLinkUrl } from "@/lib/blog/links";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl: string;
  onApply: (url: string) => void;
  onRemove: () => void;
};

export function LinkDialog({ open, onOpenChange, initialUrl, onApply, onRemove }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add a link" description="Select the words you want to link first, then enter where they should go.">
      {open ? <LinkForm initialUrl={initialUrl} onApply={onApply} onRemove={onRemove} /> : null}
    </Dialog>
  );
}

// Mounted only while the dialog is open, so it always starts from the current link.
function LinkForm({ initialUrl, onApply, onRemove }: Pick<Props, "initialUrl" | "onApply" | "onRemove">) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | undefined>();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const clean = normaliseLinkUrl(url);
    if (!clean) return setError("Enter a web address, an email address or a phone number");
    onApply(clean);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Field id="link-url" label="Address" hint="For example idyllictechnologies.com or info@idyllictechnologies.com" value={url} error={error} autoFocus autoComplete="off" onChange={(e) => setUrl(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg">
          Apply link
        </Button>
        {initialUrl ? (
          <Button variant="ghost" size="lg" onClick={onRemove}>
            Remove link
          </Button>
        ) : null}
      </div>
    </form>
  );
}

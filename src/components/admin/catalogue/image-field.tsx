"use client";

import { useState } from "react";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { MediaThumb } from "@/components/admin/media/media-thumb";
import { Button } from "@/components/ui/button";
import type { MediaRef } from "@/lib/catalogue/types";

type Props = { label: string; value: MediaRef | null; onChange: (media: MediaRef | null) => void; hint?: string };

/** A single optional image: shows the current one with Change and Remove, or a button to choose. */
export function ImageField({ label, value, onChange, hint }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {value ? (
        <div className="flex items-center gap-4">
          <MediaThumb path={value.storagePath} alt={value.alt} width={value.width} height={value.height} className="w-28 shrink-0" sizes="7rem" />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setOpen(true)}>Change</Button>
            <Button variant="ghost" onClick={() => onChange(null)}>Remove</Button>
          </div>
        </div>
      ) : (
        <div>
          <Button variant="secondary" onClick={() => setOpen(true)}>Choose image</Button>
        </div>
      )}
      {hint ? <p className="text-sm text-ink-muted">{hint}</p> : null}
      <MediaPicker open={open} onOpenChange={setOpen} title={`Choose ${label.toLowerCase()}`} onPick={([m]) => m && onChange(m)} />
    </div>
  );
}

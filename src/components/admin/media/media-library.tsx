"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMediaAction, updateAltAction } from "@/app/admin/(panel)/media/actions";
import { ImageUploadForm } from "@/components/admin/media/image-upload-form";
import { MediaThumb } from "@/components/admin/media/media-thumb";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { EmptyState, FormBanner } from "@/components/ui/states";
import type { MediaRef } from "@/lib/catalogue/types";

type Item = MediaRef & { bytes: number };

export function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="upload-heading" className="flex max-w-xl flex-col gap-4">
        <h2 id="upload-heading" className="text-xl font-medium">
          Upload images
        </h2>
        <ImageUploadForm onUploaded={() => router.refresh()} />
      </section>

      <section aria-labelledby="library-heading" className="flex flex-col gap-4">
        <h2 id="library-heading" className="text-xl font-medium">
          Library
        </h2>
        {items.length === 0 ? (
          <EmptyState title="No images yet" body="Upload the first image above. Product, brand and category images are chosen from here." />
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MediaCard({ item }: { item: Item }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.alt);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function saveAlt() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateAltAction(item.id, alt);
      setMessage(result.ok ? { tone: "success", text: "Alt text saved" } : { tone: "error", text: result.error });
      if (result.ok) router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteMediaAction(item.id);
      setConfirming(false);
      if (!result.ok) return setMessage({ tone: "error", text: result.error });
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-3">
      <MediaThumb path={item.storagePath} alt={item.alt} width={item.width} height={item.height} />
      <p className="text-sm text-ink-muted tabular-nums">
        {item.width} x {item.height}, {Math.max(1, Math.round(item.bytes / 1024))} KB
      </p>
      <Field id={`alt-${item.id}`} label="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} />
      {message ? <FormBanner tone={message.tone}>{message.text}</FormBanner> : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={saveAlt} disabled={pending || alt === item.alt}>
          Save alt text
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(true)} disabled={pending}>
          Delete
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete this image?"
        body="The file is removed from storage. Images that are used by a product, brand or category cannot be deleted."
        confirmLabel="Delete image"
        onConfirm={remove}
        pending={pending}
      />
    </li>
  );
}

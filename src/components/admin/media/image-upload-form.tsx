"use client";

import { ImageSquare, Trash, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { uploadImageAction } from "@/app/admin/(panel)/media/actions";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { track } from "@/lib/analytics";
import type { UploadedImage } from "@/lib/media/upload";
import { UPLOAD_LIMITS, altFromFileName, checkImageFile, roomFor } from "@/lib/media/upload-batch";

type Props = {
  /** Called when a batch finishes with the images that uploaded. `remaining` is how many are still waiting because they failed. */
  onUploaded: (media: UploadedImage[], remaining: number) => void;
  /** One image or several. The picker sets this to match what the editor accepts. */
  multiple?: boolean;
};

type Item = { id: number; file: File; preview: string; alt: string; altError?: string; status: "ready" | "uploading" | "failed"; error?: string };

let nextId = 1;

/**
 * Choose or drop several images, describe each one, and upload them together. Alt text is required for every
 * image. Each is converted to WebP on the server. Images that fail stay in the list with the reason, so only
 * those need another try.
 */
export function ImageUploadForm({ onUploaded, multiple = true }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const previews = useRef<string[]>([]);

  // Free the preview pictures when the form goes away.
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function addFiles(list: FileList | File[]) {
    setNotice(null);
    const files = [...list];
    const room = multiple ? roomFor(items.length) : 1;
    const taken = files.slice(0, room);
    const problems: string[] = [];
    if (files.length > room) problems.push(multiple ? `Only ${UPLOAD_LIMITS.maxFiles} images can be uploaded at once. The rest were skipped.` : "Only one image can be chosen here.");

    const added: Item[] = [];
    for (const file of taken) {
      const check = checkImageFile(file);
      if (!check.ok) {
        problems.push(`${file.name}: ${check.error}.`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      added.push({ id: nextId++, file, preview, alt: altFromFileName(file.name), status: "ready" });
    }
    if (problems.length) setNotice(problems.join(" "));
    setItems((prev) => (multiple ? [...prev, ...added] : added.length ? added : prev));
    if (input.current) input.current.value = "";
  }

  function update(id: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function upload() {
    setNotice(null);
    // Every image needs a description before anything is sent.
    const tooShort = (alt: string) => alt.trim().length < 3;
    if (items.some((i) => tooShort(i.alt))) {
      setItems((prev) => prev.map((i) => ({ ...i, altError: tooShort(i.alt) ? "Describe the image in a few words" : undefined })));
      return;
    }

    const queue = items.filter((i) => i.status !== "uploading");
    startTransition(async () => {
      const done: UploadedImage[] = [];
      setProgress({ done: 0, total: queue.length });
      for (const item of queue) {
        update(item.id, { status: "uploading", error: undefined });
        const data = new FormData();
        data.set("file", item.file);
        data.set("alt", item.alt.trim());
        try {
          const result = await uploadImageAction(data);
          track("admin_media_upload", { ok: result.ok });
          if (result.ok) {
            done.push(result.media);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } else {
            update(item.id, { status: "failed", error: result.error });
          }
        } catch {
          track("admin_media_upload", { ok: false });
          update(item.id, { status: "failed", error: "The upload did not finish. Check your connection and try again" });
        }
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }
      setProgress(null);
      if (done.length > 0) onUploaded(done, queue.length - done.length);
    });
  }

  const failedCount = items.filter((i) => i.status === "failed").length;

  return (
    <div className="flex flex-col gap-5">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed px-6 py-8 text-center transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-action ${dragging ? "border-action bg-primary/30" : "border-line-strong hover:bg-sunken"}`}
      >
        <ImageSquare size={32} aria-hidden className="text-ink-muted" />
        <span className="font-medium">{multiple ? "Choose images, or drop them here" : "Choose an image, or drop it here"}</span>
        <span className="text-sm text-ink-muted">
          JPEG, PNG, WebP or AVIF, up to 4 MB each{multiple ? `, ${UPLOAD_LIMITS.maxFiles} at a time` : ""}. Each is converted to WebP and sized to at most 2000px.
        </span>
        <input
          ref={input}
          id={inputId}
          type="file"
          multiple={multiple}
          accept={UPLOAD_LIMITS.types.join(",")}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="sr-only"
        />
      </label>

      {notice ? (
        <p role="alert" className="flex gap-2 text-sm text-error">
          <WarningCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
          {notice}
        </p>
      ) : null}

      {items.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const altId = `${inputId}-alt-${item.id}`;
              return (
                <li key={item.id} className="flex gap-4 rounded-card border border-line p-3">
                  {/* A local preview of the file the person just chose, so a next/image would add nothing. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" width={80} height={80} className="size-20 shrink-0 rounded-input bg-sunken object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <label htmlFor={altId} className="truncate text-sm font-medium" title={item.file.name}>
                      Description of {item.file.name}
                    </label>
                    <input
                      id={altId}
                      value={item.alt}
                      maxLength={300}
                      disabled={item.status === "uploading" || pending}
                      aria-invalid={item.altError ? true : undefined}
                      aria-describedby={item.altError || item.error ? `${altId}-msg` : undefined}
                      onChange={(e) => update(item.id, { alt: e.target.value, altError: undefined })}
                      className={controlClass(Boolean(item.altError), "h-11")}
                    />
                    {item.altError || item.error ? (
                      <p id={`${altId}-msg`} className="text-sm text-error">
                        {item.altError ?? item.error}
                      </p>
                    ) : item.status === "uploading" ? (
                      <p className="flex items-center gap-2 text-sm text-ink-muted">
                        <Spinner /> Uploading
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.file.name}`}
                    disabled={item.status === "uploading" || pending}
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    className="flex size-11 shrink-0 items-center justify-center self-start rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95] disabled:opacity-40"
                  >
                    <Trash size={20} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-ink-muted">
            The description is read out for people who cannot see the image. It starts from the file name, so check each one.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={upload} loading={pending}>
              {pending && progress ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}` : failedCount > 0 ? `Try again (${failedCount})` : `Upload ${items.length} image${items.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImageAction } from "@/app/admin/(panel)/media/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormBanner } from "@/components/ui/states";
import { track } from "@/lib/analytics";
import type { UploadedImage } from "@/lib/media/upload";

type Props = { onUploaded: (media: UploadedImage) => void };

/** One image at a time, with alt text required. The server converts it to WebP and keeps no original. */
export function ImageUploadForm({ onUploaded }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [altError, setAltError] = useState<string | undefined>();
  const [fileName, setFileName] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    const alt = String(data.get("alt") ?? "").trim();

    setError(null);
    setAltError(undefined);
    if (!(file instanceof File) || file.size === 0) return setError("Choose an image to upload");
    if (alt.length < 3) return setAltError("Describe the image in a few words");

    startTransition(async () => {
      const result = await uploadImageAction(data);
      track("admin_media_upload", { ok: result.ok });
      if (!result.ok) return setError(result.error);
      formRef.current?.reset();
      setFileName("");
      onUploaded(result.media);
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="upload-file" className="text-sm font-medium">
          Image
        </label>
        <input
          id="upload-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          className="block w-full rounded-input border border-line-strong bg-surface p-2 text-sm text-ink file:mr-3 file:h-9 file:cursor-pointer file:rounded-full file:border-0 file:bg-sunken file:px-4 file:text-sm file:font-medium file:text-ink"
          aria-describedby="upload-file-hint"
        />
        <p id="upload-file-hint" className="text-sm text-ink-muted">
          JPEG, PNG, WebP or AVIF, up to 4 MB. It is converted to WebP and sized to at most 2000px.
          {fileName ? ` Selected: ${fileName}.` : ""}
        </p>
      </div>
      <Field
        id="upload-alt"
        name="alt"
        label="Alt text"
        hint="Describe what the image shows, for people who cannot see it."
        error={altError}
        maxLength={300}
        required
      />
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <div>
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Uploading" : "Upload image"}
        </Button>
      </div>
    </form>
  );
}

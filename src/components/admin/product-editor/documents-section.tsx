"use client";

import { LinkSimple, Trash, UploadSimple } from "@phosphor-icons/react";
import { useState, useTransition } from "react";
import { uploadDatasheetAction } from "@/app/admin/(panel)/products/actions";
import { Field } from "@/components/ui/field";
import { FormBanner } from "@/components/ui/states";
import { buttonStyles } from "@/components/ui/button";
import { mediaUrl } from "@/lib/media/url";
import { Section } from "@/components/admin/form-section";
import type { SectionProps } from "./types";

export function DocumentsSection({ draft, update, errors }: SectionProps) {
  const { documents } = draft;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File | undefined) {
    if (!file) return;
    setError(null);
    const data = new FormData();
    data.set("file", file);
    startTransition(async () => {
      const result = await uploadDatasheetAction(data);
      if (!result.ok) return setError(result.error);
      update({ documents: [...documents, { label: file.name.replace(/\.pdf$/i, ""), url: "", storagePath: result.storagePath }] });
    });
  }

  const set = (i: number, patch: Partial<(typeof documents)[number]>) =>
    update({ documents: documents.map((d, j) => (j === i ? { ...d, ...patch } : d)) });

  return (
    <Section id="documents" title="Datasheets" description="Upload the manufacturer's PDF or link to it. PDFs can be up to 4 MB.">
      {documents.length === 0 ? <p className="text-ink-muted">No documents added.</p> : null}
      <ul className="flex flex-col gap-5">
        {documents.map((doc, i) => (
          <li key={i} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <Field id={`doc-label-${i}`} label="Name" value={doc.label} maxLength={200} error={errors[`documents.${i}.label`]} onChange={(e) => set(i, { label: e.target.value })} />
              {doc.storagePath ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Uploaded file</span>
                  <a href={mediaUrl(doc.storagePath)} target="_blank" rel="noreferrer" className="flex h-12 items-center truncate text-action underline underline-offset-4">
                    {doc.storagePath.split("/").pop()}
                  </a>
                </div>
              ) : (
                <Field id={`doc-url-${i}`} label="Link" type="url" inputMode="url" value={doc.url} error={errors[`documents.${i}`] ?? errors[`documents.${i}.url`]} onChange={(e) => set(i, { url: e.target.value })} />
              )}
            </div>
            <button
              type="button"
              aria-label={`Remove document ${i + 1}`}
              onClick={() => update({ documents: documents.filter((_, j) => j !== i) })}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-sunken sm:mt-7"
            >
              <Trash size={20} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <div className="flex flex-wrap gap-2">
        <label className={`${buttonStyles({ variant: "secondary" })} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${pending ? "opacity-50" : ""}`}>
          <UploadSimple size={18} aria-hidden /> {pending ? "Uploading" : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            disabled={pending || documents.length >= 10}
            className="sr-only"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          disabled={documents.length >= 10}
          onClick={() => update({ documents: [...documents, { label: "", url: "", storagePath: "" }] })}
          className={buttonStyles({ variant: "secondary" })}
        >
          <LinkSimple size={18} aria-hidden /> Add a link
        </button>
      </div>
    </Section>
  );
}

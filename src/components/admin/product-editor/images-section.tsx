"use client";

import { ArrowLeft, ArrowRight, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { MediaThumb } from "@/components/admin/media/media-thumb";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/admin/form-section";
import type { SectionProps } from "./types";

const iconButton =
  "flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95] disabled:opacity-40";

export function ImagesSection({ draft, update, errors }: SectionProps) {
  const [picking, setPicking] = useState(false);
  const { images } = draft;

  const swap = (a: number, b: number) => {
    const next = [...images];
    [next[a], next[b]] = [next[b]!, next[a]!];
    update({ images: next });
  };

  return (
    <Section id="images" title="Images" description="The primary image is used on cards and in search. Cut out product photos on a plain background look best. Alt text is edited in Media.">
      {errors.images ? <p role="alert" className="text-sm text-error">{errors.images}</p> : null}
      {images.length === 0 ? <p className="text-ink-muted">No images added.</p> : null}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.media.id} className="flex flex-col gap-2">
            <MediaThumb path={img.media.storagePath} alt={img.media.alt} width={img.media.width} height={img.media.height} />
            <p className="line-clamp-2 text-sm text-ink-muted">{img.media.alt}</p>
            <div className="flex flex-wrap items-center gap-1">
              {img.isPrimary ? (
                <span className="inline-flex h-9 items-center rounded-full bg-primary px-3 text-sm font-medium text-on-primary">Primary</span>
              ) : (
                <Button variant="secondary" onClick={() => update({ images: images.map((x, j) => ({ ...x, isPrimary: j === i })) })}>
                  Make primary
                </Button>
              )}
              <button type="button" aria-label={`Move image ${i + 1} earlier`} disabled={i === 0} onClick={() => swap(i, i - 1)} className={iconButton}>
                <ArrowLeft size={20} aria-hidden />
              </button>
              <button type="button" aria-label={`Move image ${i + 1} later`} disabled={i === images.length - 1} onClick={() => swap(i, i + 1)} className={iconButton}>
                <ArrowRight size={20} aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Remove image ${i + 1}`}
                onClick={() => {
                  const rest = images.filter((_, j) => j !== i);
                  if (rest.length && !rest.some((x) => x.isPrimary)) rest[0] = { ...rest[0]!, isPrimary: true };
                  update({ images: rest });
                }}
                className={iconButton}
              >
                <Trash size={20} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <Button variant="secondary" onClick={() => setPicking(true)} disabled={images.length >= 20}>
          <Plus size={18} aria-hidden /> Add images
        </Button>
      </div>
      <MediaPicker
        open={picking}
        onOpenChange={setPicking}
        multiple
        title="Add product images"
        disabledIds={images.map((i) => i.media.id)}
        onPick={(items) => {
          const added = items.map((media) => ({ media, isPrimary: false }));
          const next = [...images, ...added].slice(0, 20);
          if (next.length && !next.some((x) => x.isPrimary)) next[0] = { ...next[0]!, isPrimary: true };
          update({ images: next });
        }}
      />
    </Section>
  );
}

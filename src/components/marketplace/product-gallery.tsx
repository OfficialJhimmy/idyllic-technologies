"use client";

import { useState } from "react";
import { MediaImage } from "@/components/corporate/media-image";
import type { PublicImage } from "@/db/queries/public";

/** The main picture on a soft plate with a row of thumbnails under it. The first picture is the primary one. */
export function ProductGallery({ images, name }: { images: PublicImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  if (!current) {
    return <div role="img" aria-label={`No photograph of ${name} yet`} className="aspect-square rounded-container bg-sunken" />;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-container bg-sunken">
        <MediaImage image={current} fill priority sizes="(min-width: 1024px) 40rem, 100vw" className="object-contain p-8 sm:p-12" />
      </div>
      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="More pictures">
          {images.map((img, i) => (
            <li key={`${i}-${img.storagePath}`} className="shrink-0">
              <button
                type="button"
                aria-label={`Show picture ${i + 1} of ${images.length}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`relative block h-20 w-20 overflow-hidden rounded-input bg-sunken transition-[transform,outline-color] duration-150 active:scale-[0.96] ${i === index ? "outline-2 outline-offset-2 outline-action" : "hover:opacity-80"}`}
              >
                <MediaImage image={img} fill sizes="80px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { listMediaAction } from "@/app/admin/(panel)/media/actions";
import { ImageUploadForm } from "@/components/admin/media/image-upload-form";
import { MediaThumb } from "@/components/admin/media/media-thumb";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import type { MediaRef } from "@/lib/catalogue/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (items: MediaRef[]) => void;
  multiple?: boolean;
  /** Images already in use are shown but cannot be chosen again. */
  disabledIds?: string[];
  title?: string;
};

/** Choose from the library or upload a new image without leaving the editor. */
export function MediaPicker({ open, onOpenChange, onPick, multiple = false, disabledIds = [], title = "Choose an image" }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description="Pick an image from the library, or upload a new one." size="lg">
      {/* Mounted only while open, so every opening starts with fresh state. */}
      <PickerBody onOpenChange={onOpenChange} onPick={onPick} multiple={multiple} disabledIds={disabledIds} />
    </Dialog>
  );
}

type BodyProps = Pick<Props, "onOpenChange" | "onPick" | "multiple" | "disabledIds">;

function PickerBody({ onOpenChange, onPick, multiple = false, disabledIds = [] }: BodyProps) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<MediaRef[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaRef[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback((query: string, nextPage: number, append: boolean) => {
    startTransition(async () => {
      try {
        const result = await listMediaAction(query, nextPage);
        setRows((prev) => (append ? [...prev, ...result.rows] : result.rows));
        setTotal(result.total);
        setPage(nextPage);
        setState("ready");
      } catch {
        setState("error");
      }
    });
  }, []);

  useEffect(() => {
    load("", 1, false);
  }, [load]);

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(value, 1, false), 250);
  }

  function toggle(item: MediaRef) {
    if (!multiple) {
      onPick([item]);
      onOpenChange(false);
      return;
    }
    setSelected((prev) => (prev.some((s) => s.id === item.id) ? prev.filter((s) => s.id !== item.id) : [...prev, item]));
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        <details className="rounded-card border border-line p-4" open={uploadOpen} onToggle={(e) => setUploadOpen(e.currentTarget.open)}>
          <summary className="cursor-pointer text-[0.9375rem] font-medium">{multiple ? "Upload new images" : "Upload a new image"}</summary>
          <div className="pt-4">
            <ImageUploadForm
              multiple={multiple}
              onUploaded={(media, remaining) => {
                // An uploaded image is added to the editor straight away. If some failed, the window stays open
                // so they can be fixed and tried again, and the ones that worked are already chosen.
                if (!multiple) {
                  onPick(media.slice(0, 1));
                  onOpenChange(false);
                  return;
                }
                const chosen = [...selected.filter((s) => !media.some((m) => m.id === s.id)), ...media];
                if (remaining === 0) {
                  onPick(chosen);
                  onOpenChange(false);
                } else {
                  setSelected(chosen);
                  load(q, 1, false);
                }
              }}
            />
          </div>
        </details>

        <div className="relative">
          <MagnifyingGlass size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            aria-label="Search images by alt text"
            placeholder="Search by alt text"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            className="h-12 w-full rounded-input border border-line-strong bg-surface pr-4 pl-11 text-base text-ink placeholder:text-ink-muted"
          />
        </div>

        {state === "loading" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : state === "error" ? (
          <ErrorState body="The image library could not be loaded." action={<Button variant="secondary" onClick={() => load(q, 1, false)}>Try again</Button>} />
        ) : rows.length === 0 ? (
          <EmptyState title={q ? "No images match" : "No images yet"} body={q ? "Try a different word from the alt text." : "Open Upload a new image above to add the first one."} />
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {rows.map((item) => {
                const used = disabledIds.includes(item.id);
                const picked = selected.some((s) => s.id === item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={used}
                      aria-pressed={multiple ? picked : undefined}
                      onClick={() => toggle(item)}
                      className={`group flex w-full flex-col gap-2 rounded-card text-left transition-transform duration-150 active:scale-[0.98] disabled:opacity-40 ${picked ? "outline-2 outline-offset-2 outline-action" : ""}`}
                    >
                      <MediaThumb path={item.storagePath} alt="" width={item.width} height={item.height} sizes="(min-width: 640px) 12rem, 45vw" />
                      <span className="line-clamp-2 text-sm text-ink-muted">{used ? "Already added. " : ""}{item.alt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {rows.length < total ? (
              <div>
                <Button variant="secondary" onClick={() => load(q, page + 1, true)} disabled={pending}>
                  {pending ? "Loading" : "Show more"}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
      {multiple ? (
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={selected.length === 0}
            onClick={() => {
              onPick(selected);
              onOpenChange(false);
            }}
          >
            {selected.length ? `Add ${selected.length} image${selected.length === 1 ? "" : "s"}` : "Add images"}
          </Button>
        </div>
      ) : null}
    </>
  );
}

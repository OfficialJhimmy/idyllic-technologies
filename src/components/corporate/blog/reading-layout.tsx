"use client";

import { Lightning } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { ShareLinks } from "@/components/corporate/blog/share-links";
import { minutesLeft } from "@/lib/blog/reading";

type Props = { children: React.ReactNode; minutes: number; url: string; title: string };

const STEPS = 25;

/**
 * The article with a reading meter and share links beside it. The meter is a battery that charges as you
 * read down the page. Progress comes from invisible markers spaced down the article: each one is watched
 * with an IntersectionObserver whose area reaches far above the screen, so a marker counts as read once
 * it is above the middle of the screen, even after a jump to the end. No scroll listener is used.
 */
export function ReadingLayout({ children, minutes, url, title }: Props) {
  const [read, setRead] = useState(0);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const passed = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.i);
          if (e.isIntersecting) passed.add(i);
          else passed.delete(i);
        }
        setRead(passed.size);
      },
      // Everything from far above the screen down to its middle counts as "already read".
      { rootMargin: "100000px 0px -50% 0px", threshold: 0 },
    );
    el.querySelectorAll("[data-i]").forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, []);

  const percent = Math.round((read / STEPS) * 100);
  const done = percent >= 100;

  return (
    <>
      {/* Phones and tablets: a thin line across the top of the screen. */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-40 h-1 bg-transparent lg:hidden">
        <div className="h-full origin-left bg-gradient-to-r from-action to-accent transition-transform duration-500 ease-[var(--ease-out-strong)] motion-reduce:transition-none" style={{ transform: `scaleX(${percent / 100})` }} />
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-16">
        <div ref={body} className="relative min-w-0">
          {children}
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} aria-hidden data-i={i} className="pointer-events-none absolute left-0 block size-px" style={{ top: `${((i + 1) / STEPS) * 100}%` }} />
          ))}
          <div className="mt-12 border-t border-line pt-8 lg:hidden">
            <ShareLinks url={url} title={title} layout="row" />
          </div>
        </div>

        <aside aria-label="Reading progress and sharing" className="hidden lg:block">
          <div className="sticky top-32 flex flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-ink-muted">Reading</p>
              {/* A battery: the cap, the case, and a charge that rises as you read. */}
              <div className="flex flex-col items-center" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                <span aria-hidden className="h-1.5 w-4 rounded-t-full bg-line-strong" />
                <div className="relative h-56 w-12 overflow-hidden rounded-[1.25rem] border-2 border-line-strong bg-surface p-1">
                  <div
                    className={`absolute inset-x-1 bottom-1 rounded-[0.9rem] bg-gradient-to-t from-action via-action to-accent transition-[height] duration-500 ease-[var(--ease-out-strong)] motion-reduce:transition-none ${done ? "shadow-[0_0_24px_rgb(247_201_20/0.6)]" : ""}`}
                    style={{ height: `${percent}%` }}
                  />
                  <Lightning size={20} weight="fill" aria-hidden className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors duration-300 ${percent > 50 ? "text-on-action" : "text-ink-muted"}`} />
                </div>
              </div>
              <p className="font-heading text-4xl font-medium tabular-nums">{percent}%</p>
              <p className="text-sm text-ink-muted tabular-nums" aria-live="off">
                {done ? "All read" : `${minutesLeft(minutes, percent)} min left`}
              </p>
            </div>
            <ShareLinks url={url} title={title} layout="column" />
          </div>
        </aside>
      </div>
    </>
  );
}

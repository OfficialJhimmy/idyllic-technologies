"use client";

import { CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const watchReduced = (notify: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
};

export type Slide = { src: string; alt: string; width: number; height: number; caption?: string; subcaption?: string };

type Props = {
  slides: readonly Slide[];
  /** Describes the carousel to screen readers, for example "Our team". */
  label: string;
  /** Tailwind aspect class for the frame. */
  aspect?: string;
  /** Milliseconds between slides. 0 turns automatic movement off. */
  interval?: number;
  sizes: string;
  /** How the picture fills the frame. Portraits of people use "top" so faces are never cut off. */
  position?: "center" | "top";
  className?: string;
};

/**
 * A swipeable row of photographs with snap, previous and next, dots, and optional automatic movement.
 * Automatic movement pauses on hover, on focus, when the tab is hidden, and has a pause button; it never
 * starts when the visitor asks for reduced motion. Native scrolling does the moving, so touch swipe just works.
 */
export function PhotoCarousel({ slides, label, aspect = "aspect-[4/3]", interval = 6000, sizes, position = "center", className = "" }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  // Assume reduced motion on the server, so nothing moves before the browser has said otherwise.
  const reduced = useSyncExternalStore(watchReduced, () => window.matchMedia(REDUCED).matches, () => true);
  const count = slides.length;

  const go = useCallback(
    (to: number) => {
      const el = track.current;
      if (!el) return;
      const next = (to + count) % count;
      el.scrollTo({ left: next * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [count, reduced],
  );

  // Which slide is showing, from what has scrolled into view. No scroll listener.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.slide));
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("[data-slide]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [count]);

  const auto = interval > 0 && count > 1 && !reduced && !paused && !hovering;
  useEffect(() => {
    if (!auto) return;
    const tick = () => {
      if (document.visibilityState === "visible") go(index + 1);
    };
    const id = window.setInterval(tick, interval);
    return () => window.clearInterval(id);
  }, [auto, go, index, interval]);

  const btn = "flex size-11 items-center justify-center rounded-full bg-surface/90 text-ink shadow-raised backdrop-blur transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] hover:bg-surface active:scale-[0.95]";

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className={`group/carousel relative ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <ul ref={track} className={`flex ${aspect} snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-container bg-sunken [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
        {slides.map((s, i) => (
          <li key={s.src} data-slide={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} className="relative h-full w-full flex-none snap-center">
            <Image src={s.src} alt={s.alt} fill sizes={sizes} className={`object-cover ${position === "top" ? "object-top" : "object-center"}`} />
            {s.caption ? (
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-[#0b1426]/85 via-[#0b1426]/45 to-transparent px-5 pt-16 pb-5 text-white">
                <span className="font-heading text-2xl font-medium">{s.caption}</span>
                {s.subcaption ? <span className="text-white/85">{s.subcaption}</span> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {count > 1 ? (
        <>
          <div className="absolute top-3 right-3 flex gap-2">
            {interval > 0 && !reduced ? (
              <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Start the slideshow" : "Pause the slideshow"} className={btn}>
                {paused ? <Play size={18} weight="fill" aria-hidden /> : <Pause size={18} weight="fill" aria-hidden />}
              </button>
            ) : null}
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={btn}>
              <CaretLeft size={20} aria-hidden />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={btn}>
              <CaretRight size={20} aria-hidden />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            {slides.map((s, i) => (
              <button key={s.src} type="button" onClick={() => go(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index ? "true" : undefined} className="group flex size-8 items-center justify-center">
                <span className={`block h-2 rounded-full transition-[width,background-color] duration-300 ease-[var(--ease-out-strong)] ${i === index ? "w-6 bg-action" : "w-2 bg-line-strong group-hover:bg-ink-muted"}`} />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

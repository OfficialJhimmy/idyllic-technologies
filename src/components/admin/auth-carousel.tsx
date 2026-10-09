"use client";

import { Pause, Play } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { AuthSlide } from "@/content/auth-slides";

const INTERVAL_MS = 7000;
const FADE = "900ms";
const EASE = "var(--ease-out-strong)";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (callback: () => void) => {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const prefersReducedMotion = () => window.matchMedia(REDUCED_QUERY).matches;

/**
 * Photographs that crossfade, each easing slowly from a slight zoom, with a caption box bottom left.
 * Motion is only opacity and transform. It pauses on hover and focus, has a pause button, and does
 * not auto-advance for people who prefer reduced motion.
 */
export function AuthCarousel({ slides }: { slides: readonly AuthSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const autoplay = !paused && !engaged && !reduced;

  // One frame after mount, so the first photograph also eases in instead of appearing settled.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [autoplay, index, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="About Idyllic Technologies"
      className="relative h-full overflow-hidden rounded-container bg-primary"
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={!active}
            className="absolute inset-0"
            style={{ opacity: active ? 1 : 0, transition: `opacity ${FADE} ${EASE}`, zIndex: active ? 1 : 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: active && ready ? "scale(1)" : "scale(1.07)",
                // Reset the zoom only after the photograph has faded out, so nothing jumps.
                transition: active ? `transform 9000ms ${EASE}` : `transform 0ms linear ${FADE}`,
              }}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 60vw, 1px"
                className="object-cover"
                style={{ objectPosition: slide.position }}
              />
            </div>
          </div>
        );
      })}

      {/* Soft shade under the caption so it sits on any photograph. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-gradient-to-t from-ink/45 to-transparent" />

      <div
        className="absolute bottom-6 left-6 z-20 flex w-[min(25rem,calc(100%-3rem))] flex-col gap-4 rounded-card bg-surface p-5 shadow-raised"
        onMouseEnter={() => setEngaged(true)}
        onMouseLeave={() => setEngaged(false)}
        onFocus={() => setEngaged(true)}
        onBlur={() => setEngaged(false)}
      >
        <div className="grid" aria-live={autoplay ? "off" : "polite"} aria-atomic="true">
          {slides.map((slide, i) => {
            const active = i === index;
            return (
              <div
                key={slide.id}
                aria-hidden={!active}
                className="col-start-1 row-start-1 flex flex-col gap-2"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? "translateY(0)" : "translateY(8px)",
                  transition: active
                    ? `opacity 500ms ${EASE} 250ms, transform 500ms ${EASE} 250ms`
                    : `opacity 200ms ${EASE}, transform 200ms ${EASE}`,
                }}
              >
                <h2 className="font-heading text-xl font-medium">{slide.title}</h2>
                <p className="text-[0.9375rem] leading-relaxed text-ink-muted">{slide.body}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="-ml-2 flex items-center">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${i + 1}: ${slide.title}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="group flex h-11 items-center px-1.5"
              >
                <span
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-[var(--ease-out-strong)] ${i === index ? "w-8 bg-action" : "w-2 bg-line-strong group-hover:bg-ink-muted"}`}
                />
              </button>
            ))}
          </div>
          {reduced ? null : (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95]"
            >
              {paused ? <Play size={18} weight="fill" aria-hidden /> : <Pause size={18} weight="fill" aria-hidden />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

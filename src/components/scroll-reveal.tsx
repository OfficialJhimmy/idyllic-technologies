"use client";

import { useEffect } from "react";

const SELECTOR = ".reveal";
const STAGGER_MS = 120;
const MAX_STAGGER = 5;

/**
 * Animate on scroll for every element with the .reveal class, on any page, with one observer.
 *
 * - Blocks already on screen (or above it, after a reload mid page) are left alone, so nothing flashes.
 * - Blocks below the fold are hidden, then eased up when they come into view. Blocks that appear in the
 *   same moment follow one another 120ms apart.
 * - Pages that arrive later, through a link, are picked up as they are added.
 * - Reduced motion, or a browser without IntersectionObserver, hides nothing.
 * Motion is only opacity and transform, so it never moves the layout.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finish = (el: HTMLElement) => {
      delete el.dataset.reveal;
      el.style.removeProperty("--reveal-delay");
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        visible.forEach((entry, i) => {
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.style.setProperty("--reveal-delay", `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`);
          el.dataset.reveal = "shown";
          const done = () => finish(el);
          el.addEventListener("transitionend", (e) => e.target === el && e.propertyName === "transform" && done(), { once: false });
          // If the transition never fires (the tab was hidden, say), clear it anyway.
          window.setTimeout(done, 2800 + i * STAGGER_MS);
        });
      },
      // Reveal once the top edge is 14% up from the bottom of the screen, so the move is seen from its start.
      // Threshold 0 so a block taller than the screen still reveals.
      { rootMargin: "0px 0px -14% 0px", threshold: 0 },
    );

    const prepare = (el: HTMLElement) => {
      if (el.dataset.reveal) return;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top < window.innerHeight * 0.86) return; // already seen or on screen
      el.dataset.reveal = "hidden";
      io.observe(el);
    };

    const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>(SELECTOR).forEach(prepare);
    // A beat after load, so React has finished hydrating before attributes are added to its elements.
    const first = window.setTimeout(() => scan(document), 60);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(SELECTOR)) prepare(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(first);
      mo.disconnect();
      io.disconnect();
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(finish);
    };
  }, []);

  return null;
}

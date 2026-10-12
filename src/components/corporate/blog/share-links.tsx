"use client";

import { InstagramLogo, WhatsappLogo, XLogo } from "@phosphor-icons/react";
import { useState } from "react";

type Props = { url: string; title: string; layout: "column" | "row" };

const button = "flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-strong)] hover:bg-action hover:text-on-action active:scale-[0.94]";

/**
 * Share on X, WhatsApp and Instagram. X and WhatsApp open a ready message. Instagram has no way to start a post
 * from a web address, so there the phone's share sheet opens where it exists, and otherwise the link is copied
 * for pasting into Instagram, and the visitor is told so.
 */
export function ShareLinks({ url, title, layout }: Props) {
  const [note, setNote] = useState("");
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);

  async function instagram() {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNote("Link copied. Paste it into Instagram.");
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    } catch {
      // The visitor closed the share sheet, or the browser blocked copying. Nothing to report.
      setNote("");
    }
  }

  return (
    <div className={`flex ${layout === "column" ? "flex-col items-center" : "flex-col items-start"} gap-3`}>
      <p className="text-sm font-medium text-ink-muted">Share this post</p>
      <ul className={`flex ${layout === "column" ? "flex-col" : "flex-row"} gap-2`}>
        <li>
          <a href={`https://twitter.com/intent/tweet?text=${text}&url=${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={button}>
            <XLogo size={20} aria-hidden />
          </a>
        </li>
        <li>
          <a href={`https://wa.me/?text=${text}%20${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={button}>
            <WhatsappLogo size={22} aria-hidden />
          </a>
        </li>
        <li>
          <button type="button" onClick={instagram} aria-label="Share on Instagram" className={button}>
            <InstagramLogo size={22} aria-hidden />
          </button>
        </li>
      </ul>
      <p role="status" className="max-w-40 text-center text-sm text-ink-muted empty:hidden">
        {note}
      </p>
    </div>
  );
}

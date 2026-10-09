"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { useState, useTransition } from "react";
import { bookOnWhatsAppAction } from "@/app/(marketplace)/shop-host/actions";
import { Spinner } from "@/components/ui/spinner";
import { track } from "@/lib/analytics";
import type { BookingResult } from "@/lib/marketplace/booking";

type Props = {
  ids: string[];
  source: "page" | "compare" | "assistant";
  /** Replaces the default booking call, for example the assistant's, which also sends the visitor's requirements. */
  perform?: () => Promise<BookingResult | { ok: false; reason: "invalid" }>;
  label?: string;
  size?: "md" | "lg";
  className?: string;
  /** Called after the WhatsApp link has opened, for example to clear a list. */
  onBooked?: () => void;
};

/**
 * Book on WhatsApp: logs the booking on the server, then opens one wa.me message listing every product.
 * If the browser blocks the new window, the link is shown so the visitor can open it themselves.
 */
export function BookButton({ ids, source, perform, label = "Book on WhatsApp", size = "lg", className = "", onBooked }: Props) {
  const [pending, startTransition] = useTransition();
  const [fallback, setFallback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function book() {
    setError(null);
    setFallback(null);
    startTransition(async () => {
      const result = await (perform ? perform() : bookOnWhatsAppAction({ productIds: ids, source }));
      if (!result.ok) {
        setError(result.reason === "no-products" ? "Those products are no longer available. Refresh the page and try again." : "Something went wrong. Please try again.");
        return;
      }
      track("booking_whatsapp", { source, product_count: result.count });
      const opened = window.open(result.url, "_blank", "noopener,noreferrer");
      if (!opened) setFallback(result.url);
      onBooked?.();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={book}
        disabled={pending || (!perform && ids.length === 0)}
        aria-busy={pending || undefined}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent font-medium whitespace-nowrap text-on-accent transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] hover:bg-accent-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${size === "lg" ? "h-12 px-7 text-base" : "h-11 px-5 text-[0.9375rem]"} ${className}`}
      >
        {pending ? <Spinner /> : <WhatsappLogo size={22} weight="fill" aria-hidden />}
        {label}
      </button>
      {fallback ? (
        <p role="status" className="text-sm">
          Your browser blocked the new window.{" "}
          <a href={fallback} target="_blank" rel="noopener noreferrer" className="font-medium text-action underline underline-offset-4">
            Open WhatsApp
          </a>
        </p>
      ) : null}
      {error ? <p role="alert" className="max-w-[40ch] text-sm text-error">{error}</p> : null}
    </div>
  );
}

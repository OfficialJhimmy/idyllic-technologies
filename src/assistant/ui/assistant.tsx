"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { ArrowCounterClockwise, ArrowLeft, Lightning, UserCircle, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Turn } from "@/assistant/engine/types";
import type { Origins } from "@/assistant/ui/links";
import { useShopOrigin, useSiteOrigin } from "@/components/corporate/shop-link";
import { ComparisonTurn, FailedLine, HandoffTurn, PendingLine, QuestionTurn, RecommendationTurn, UserLine } from "@/assistant/ui/turns";
import { announcementFor, useAssistant, type Entry } from "@/assistant/ui/use-assistant";
import { track } from "@/lib/analytics";

type Props = {
  /** The first question, rendered on the server with the page. */
  opening: Turn;
  host: "corporate" | "shop";
  origins: Origins;
};

const footerButton = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium whitespace-nowrap sm:px-3 sm:text-base text-ink transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] hover:bg-sunken active:scale-[0.97] disabled:opacity-50";

/**
 * The Energy Assistant: a persistent button that opens a side drawer on large screens and a full height
 * bottom sheet on phones. Focus is trapped while it is open, and every new message is announced.
 */
export function AssistantLauncher({ opening, host, origins: configured }: Props) {
  // An empty origin means "this site". Otherwise it is the configured address, replaced in the browser by the one matching the address in use.
  const shop = useShopOrigin(configured.shop);
  const site = useSiteOrigin(configured.site);
  const origins: Origins = { shop: configured.shop ? shop : "", site: configured.site ? site : "" };
  const [open, setOpen] = useState(false);
  const a = useAssistant(opening);
  const list = useRef<HTMLDivElement>(null);
  const seen = useRef(a.entries.length);

  const close = () => setOpen(false);

  // When something new arrives, bring it into view and move focus to its first control, so keyboard and screen reader users continue from it.
  useEffect(() => {
    if (!open || a.entries.length === seen.current) return;
    seen.current = a.entries.length;
    focusLatest(list.current, true);
  }, [a.entries.length, open]);

  const lastTurn = [...a.entries].reverse().find((e) => e.kind === "turn");
  const latestId = lastTurn?.id;

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) track("assistant_open", { host });
      }}
    >
      <RadixDialog.Trigger asChild>
        <button
          type="button"
          className="assistant-launcher fixed right-4 bottom-4 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-action px-5 font-medium text-on-action shadow-raised transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] hover:bg-action-hover active:scale-[0.97]"
        >
          <Lightning size={22} weight="fill" aria-hidden />
          Energy Assistant
        </button>
      </RadixDialog.Trigger>

      <RadixDialog.Portal>
        <RadixDialog.Overlay className="dialog-overlay fixed inset-0 z-40 bg-ink/40" />
        <RadixDialog.Content
          className="assistant-sheet bg-surface shadow-raised outline-none"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            focusLatest(list.current, false);
          }}
        >
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary" aria-hidden>
                <Lightning size={22} weight="fill" />
              </span>
              <RadixDialog.Title className="font-heading text-lg font-medium">Energy Assistant</RadixDialog.Title>
            </div>
            <RadixDialog.Close aria-label="Close the Energy Assistant" className="-mr-2 flex size-11 items-center justify-center rounded-full hover:bg-sunken active:scale-[0.97]">
              <X size={22} aria-hidden />
            </RadixDialog.Close>
          </header>
          <RadixDialog.Description className="sr-only">Answer a few questions and get suggestions from the marketplace, or ask to speak to a person.</RadixDialog.Description>

          <div ref={list} className="assistant-scroll flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 py-4">
            {a.entries.map((entry, i) => (
              <div key={entry.id} data-latest={entry.id === latestId && !a.pending ? "true" : undefined} className="flex flex-col">
                <EntryView entry={entry} answered={a.entries[i + 1]?.kind === "user"} busy={a.pending} origins={origins} onChoose={a.choose} onCompare={a.compare} onClose={close} />
              </div>
            ))}
            {a.pending ? <PendingLine /> : null}
            {a.failed ? <FailedLine onRetry={a.retry} /> : null}
          </div>

          {/* Announces each new message. Kept apart from the list so a screen reader reads it once. */}
          <div role="status" aria-live="polite" className="sr-only">
            {announcementFor(a.entries, a.pending, a.failed !== null)}
          </div>

          <footer className="flex items-center justify-between gap-1 border-t border-line px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center">
              {a.canGoBack ? (
                <button type="button" onClick={a.back} disabled={a.pending} className={footerButton}>
                  <ArrowLeft size={18} aria-hidden />
                  Back
                </button>
              ) : null}
              {a.canGoBack ? (
                <button type="button" onClick={a.restart} disabled={a.pending} className={footerButton}>
                  <ArrowCounterClockwise size={18} aria-hidden />
                  Start over
                </button>
              ) : null}
            </div>
            <button type="button" onClick={a.talkToAPerson} disabled={a.pending} className={footerButton}>
              <UserCircle size={20} aria-hidden />
              Talk to a person
            </button>
          </footer>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

function EntryView({ entry, answered, busy, origins, onChoose, onCompare, onClose }: { entry: Entry; answered: boolean; busy: boolean; origins: Origins; onChoose: Parameters<typeof QuestionTurn>[0]["onChoose"]; onCompare: (ids: string[]) => void; onClose: () => void }) {
  if (entry.kind === "user") return <UserLine text={entry.text} />;
  const { turn } = entry;
  switch (turn.kind) {
    case "question":
      return <QuestionTurn question={turn.question} answered={answered} disabled={busy} onChoose={onChoose} />;
    case "recommendation":
      return <RecommendationTurn turn={turn} origins={origins} busy={busy} onCompare={onCompare} onClose={onClose} />;
    case "comparison":
      return <ComparisonTurn turn={turn} origins={origins} onClose={onClose} />;
    case "handoff":
      return <HandoffTurn turn={turn} origins={origins} onClose={onClose} />;
  }
}

/** Focuses the first control of the newest message and, when asked, scrolls the message to the top of the list. */
function focusLatest(container: HTMLElement | null, scroll: boolean) {
  const latest = container?.querySelector<HTMLElement>("[data-latest='true']");
  if (!latest) return;
  latest.querySelector<HTMLElement>("button:not(:disabled), a[href]")?.focus({ preventScroll: true });
  if (scroll) latest.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

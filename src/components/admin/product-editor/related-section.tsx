"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { searchRelatedAction } from "@/app/admin/(panel)/products/actions";
import { Section } from "@/components/admin/form-section";
import type { SectionProps } from "./types";

type Result = { id: string; name: string; brand: string };

export function RelatedSection({ draft, update, errors }: SectionProps) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chosen = new Set(draft.related.map((r) => r.id));

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchRelatedAction(value.trim(), draft.id));
      } finally {
        setSearching(false);
      }
    }, 250);
  }

  const available = results.filter((r) => !chosen.has(r.id));

  return (
    <Section id="related" title="Related products" description="Shown on the product page, for example a compatible battery for a UPS. Up to 12.">
      {errors.related ? <p role="alert" className="text-sm text-error">{errors.related}</p> : null}
      {draft.related.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {draft.related.map((r) => (
            <li key={r.id} className="flex items-center gap-1 rounded-full bg-sunken py-1 pr-1 pl-4">
              <span>{r.name}</span>
              <button
                type="button"
                aria-label={`Remove ${r.name}`}
                onClick={() => update({ related: draft.related.filter((x) => x.id !== r.id) })}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-line"
              >
                <X size={16} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted">No related products added.</p>
      )}
      <div className="flex max-w-xl flex-col gap-2">
        <label htmlFor="related-search" className="text-sm font-medium">Find a product</label>
        <div className="relative">
          <MagnifyingGlass size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="related-search"
            type="search"
            value={q}
            disabled={draft.related.length >= 12}
            onChange={(e) => onSearch(e.target.value)}
            aria-describedby="related-status"
            className="h-12 w-full rounded-input border border-line-strong bg-surface pr-4 pl-11 text-base text-ink"
          />
        </div>
        <p id="related-status" role="status" className="text-sm text-ink-muted">
          {q.trim().length < 2 ? "Type at least two letters of the product name." : searching ? "Searching" : available.length === 0 ? "No other products match." : `${available.length} found`}
        </p>
        {available.length > 0 ? (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {available.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    update({ related: [...draft.related, { id: r.id, name: r.name }] });
                    setQ("");
                    setResults([]);
                  }}
                  className="flex min-h-12 w-full items-center justify-between gap-4 px-4 py-2 text-left hover:bg-sunken"
                >
                  <span>{r.name}</span>
                  <span className="text-sm text-ink-muted">{r.brand}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  );
}

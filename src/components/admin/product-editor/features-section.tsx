"use client";

import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/admin/form-section";
import type { SectionProps } from "./types";

const iconButton =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95] disabled:opacity-40";

export function FeaturesSection({ draft, update }: SectionProps) {
  const { features } = draft;

  const set = (next: string[]) => update({ features: next });
  const swap = (a: number, b: number) => {
    const next = [...features];
    [next[a], next[b]] = [next[b]!, next[a]!];
    set(next);
  };

  return (
    <Section id="features" title="Features" description="Short points, one per line. Copy them as the manufacturer states them.">
      {features.length === 0 ? <p className="text-ink-muted">No features added.</p> : null}
      <ol className="flex flex-col gap-2">
        {features.map((text, i) => (
          <li key={i} className="flex items-center gap-1">
            <input
              aria-label={`Feature ${i + 1}`}
              value={text}
              maxLength={300}
              onChange={(e) => set(features.map((f, j) => (j === i ? e.target.value : f)))}
              className="h-12 min-w-0 flex-1 rounded-input border border-line-strong bg-surface px-4 text-base text-ink"
            />
            <button type="button" aria-label={`Move feature ${i + 1} up`} disabled={i === 0} onClick={() => swap(i, i - 1)} className={iconButton}>
              <ArrowUp size={20} aria-hidden />
            </button>
            <button type="button" aria-label={`Move feature ${i + 1} down`} disabled={i === features.length - 1} onClick={() => swap(i, i + 1)} className={iconButton}>
              <ArrowDown size={20} aria-hidden />
            </button>
            <button type="button" aria-label={`Remove feature ${i + 1}`} onClick={() => set(features.filter((_, j) => j !== i))} className={iconButton}>
              <Trash size={20} aria-hidden />
            </button>
          </li>
        ))}
      </ol>
      <div>
        <Button variant="secondary" onClick={() => set([...features, ""])}>
          <Plus size={18} aria-hidden /> Add feature
        </Button>
      </div>
    </Section>
  );
}

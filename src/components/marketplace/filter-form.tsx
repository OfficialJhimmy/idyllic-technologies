"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import type { BrandOption, Facet } from "@/db/queries/shop";
import type { Filters } from "@/lib/marketplace/filters";

type Props = { formId?: string; action: string; brands: BrandOption[]; facets: Facet[]; filters: Filters; autoSubmit?: boolean; onApplied?: () => void };

const box = "flex min-h-11 cursor-pointer items-center gap-3 rounded-input px-2 hover:bg-sunken";

/**
 * The filters for a category: brands, then each filterable spec the category defines. A plain GET form
 * that writes the choices into the address. With JavaScript the choices apply as you tick them.
 */
export function FilterForm({ formId, action, brands, facets, filters, autoSubmit = true, onApplied }: Props) {
  const uid = useId();
  const submit = (e: React.ChangeEvent<HTMLFormElement>) => autoSubmit && e.currentTarget.requestSubmit();

  return (
    <form id={formId} action={action} method="get" onChange={submit} onSubmit={() => onApplied?.()} className="flex flex-col gap-7">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Sort by</span>
        <select name="sort" defaultValue={filters.sort} className="h-11 rounded-input border border-line-strong bg-surface px-3 text-base">
          <option value="newest">Newest</option>
          <option value="name">Name</option>
        </select>
      </label>

      {brands.length > 1 ? (
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-medium">Brand</legend>
          {brands.map((b) => (
            <label key={b.slug} className={box}>
              <input type="checkbox" name="brand" value={b.slug} defaultChecked={filters.brands.includes(b.slug)} className="h-5 w-5 accent-[var(--action)]" />
              <span className="flex-1">{b.name}</span>
              <span className="text-sm text-ink-muted tabular-nums">{b.count}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {facets.map((f) => {
        const current = filters.specs.find((s) => s.key === f.key);
        if (f.range) {
          return (
            <fieldset key={f.key} className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">{f.label}{f.unit ? ` (${f.unit})` : ""}</legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-sm text-ink-muted">
                  From
                  <input type="number" inputMode="decimal" name={`min.${f.key}`} defaultValue={current?.min} placeholder={String(f.range.min)} id={`${uid}-min-${f.key}`} className="h-11 rounded-input border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-muted" />
                </label>
                <label className="flex flex-col gap-1 text-sm text-ink-muted">
                  To
                  <input type="number" inputMode="decimal" name={`max.${f.key}`} defaultValue={current?.max} placeholder={String(f.range.max)} id={`${uid}-max-${f.key}`} className="h-11 rounded-input border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-muted" />
                </label>
              </div>
            </fieldset>
          );
        }
        return (
          <fieldset key={f.key} className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-medium">{f.label}</legend>
            {f.options?.map((o) => (
              <label key={o.value} className={box}>
                <input type="checkbox" name={`s.${f.key}`} value={o.value} defaultChecked={current?.values?.includes(o.value)} className="h-5 w-5 accent-[var(--action)]" />
                <span className="flex-1">{o.label}</span>
                <span className="text-sm text-ink-muted tabular-nums">{o.count}</span>
              </label>
            ))}
          </fieldset>
        );
      })}

      <noscript>
        <Button type="submit" size="lg">Apply filters</Button>
      </noscript>
    </form>
  );
}

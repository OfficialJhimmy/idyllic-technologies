"use client";

import { Funnel } from "@phosphor-icons/react";
import { useState } from "react";
import { FilterForm } from "@/components/marketplace/filter-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { BrandOption, Facet } from "@/db/queries/shop";
import type { Filters } from "@/lib/marketplace/filters";

type Props = { action: string; brands: BrandOption[]; facets: Facet[]; filters: Filters; activeCount: number; total: number };

/** A sidebar on large screens and a full height sheet on small ones, with the same form in both. */
export function FilterPanel({ action, brands, facets, filters, activeCount, total }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-40 flex max-h-[calc(100dvh-11rem)] flex-col gap-5 overflow-y-auto pr-2">
          <h2 className="text-xl font-medium">Filters</h2>
          <FilterForm action={action} brands={brands} facets={facets} filters={filters} />
        </div>
      </aside>

      <div className="lg:hidden">
        <Button variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <Funnel size={18} aria-hidden />
          Filters{activeCount ? ` (${activeCount})` : ""}
        </Button>
        <Dialog open={open} onOpenChange={setOpen} title="Filters" size="lg">
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
            <FilterForm formId="filters-sheet" action={action} brands={brands} facets={facets} filters={filters} autoSubmit={false} onApplied={() => setOpen(false)} />
          </div>
          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-surface pt-4">
            <a href={action} className="inline-flex h-11 items-center px-3 font-medium underline-offset-4 hover:underline">Clear all</a>
            <button type="submit" form="filters-sheet" className="h-12 rounded-full bg-action px-7 font-medium text-on-action transition-[background-color,transform] duration-150 hover:bg-action-hover active:scale-[0.97]">
              Show {total} {total === 1 ? "product" : "products"}
            </button>
          </div>
        </Dialog>
      </div>
    </>
  );
}

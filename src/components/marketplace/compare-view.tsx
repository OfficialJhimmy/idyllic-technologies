"use client";

import { X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCompareAction } from "@/app/(marketplace)/shop-host/actions";
import { BookButton } from "@/components/marketplace/book-button";
import { toListItem } from "@/components/marketplace/shop-product-card";
import { MediaImage } from "@/components/corporate/media-image";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import type { CompareData } from "@/db/queries/shop";
import { buildComparison } from "@/lib/marketplace/compare";
import { COMPARE_MAX } from "@/lib/marketplace/list-logic";
import { useCompareList } from "@/lib/marketplace/use-lists";

/**
 * Up to three products side by side. Only fields marked comparable that every product has are shown, so
 * the table has no gaps. On wide screens it is a table with the field names down the left. On phones it
 * becomes one block per field, listing each product's value under its name.
 */
export function CompareView() {
  const compare = useCompareList();
  const [data, setData] = useState<CompareData | null>(null);
  const [failed, setFailed] = useState(false);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const idsKey = compare.items.map((i) => i.id).join(",");
  const replace = compare.replace;

  useEffect(() => {
    if (!idsKey) return;
    let live = true;
    getCompareAction(idsKey.split(","))
      .then((fresh) => {
        if (!live) return;
        setData(fresh);
        setFailed(false);
        if (fresh.products.length !== idsKey.split(",").length) replace(fresh.products.map(toListItem));
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [idsKey, replace]);

  const comparison = useMemo(() => (data ? buildComparison(data.products, data.defs) : { rows: [], partial: [] }), [data]);

  if (compare.count === 0) {
    return <EmptyState title="Nothing to compare yet" body={`Choose Compare on up to ${COMPARE_MAX} products from one category and they appear here side by side.`} action={<Link href="/search" className="inline-flex h-12 items-center rounded-full bg-action px-6 font-medium text-on-action">Browse products</Link>} />;
  }
  if (failed) return <ErrorState body="The comparison could not be loaded just now." action={<Button onClick={() => setFailed(false)}>Try again</Button>} />;
  if (!data) return <div role="status" aria-label="Loading the comparison"><Skeleton className="h-96 w-full rounded-container" /></div>;

  const rows = onlyDifferences ? comparison.rows.filter((r) => r.differs) : comparison.rows;
  const products = data.products;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-muted">{products.length} of {COMPARE_MAX}{data.categoryName ? `, ${data.categoryName}` : ""}</p>
        <div className="flex flex-wrap items-center gap-4">
          {comparison.rows.length > 0 ? (
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" checked={onlyDifferences} onChange={(e) => setOnlyDifferences(e.target.checked)} className="h-5 w-5 accent-[var(--action)]" />
              Show only differences
            </label>
          ) : null}
          <button type="button" onClick={compare.clear} className="inline-flex min-h-11 items-center font-medium text-ink-muted underline underline-offset-4 hover:text-ink">Clear compare</button>
        </div>
      </div>

      {products.length < 2 ? <p className="rounded-card bg-sunken p-5">Add at least one more product from {data.categoryName ?? "the same category"} to compare.</p> : null}

      {/* Wide screens: a real table. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left">
          <caption className="sr-only">Comparison of {products.map((p) => p.name).join(", ")}</caption>
          <thead>
            <tr>
              <td className="sticky left-0 bg-canvas" />
              {products.map((p) => (
                <th key={p.id} scope="col" className="w-1/3 min-w-56 p-4 align-top font-normal">
                  <ProductHead p={p} onRemove={() => compare.remove(p.id)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.differs ? "bg-primary/20" : ""}>
                <th scope="row" className="sticky left-0 border-t border-line bg-canvas p-4 text-sm font-medium text-ink-muted">{r.label}</th>
                {r.values.map((v, i) => (
                  <td key={products[i]?.id} className={`border-t border-line p-4 text-lg tabular-nums ${r.differs ? "font-medium" : ""}`}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: one block per field, each product's value under its name. */}
      <div className="flex flex-col gap-8 md:hidden">
        <ul className="grid grid-cols-1 gap-4">
          {products.map((p) => (
            <li key={p.id} className="rounded-card bg-surface p-4"><ProductHead p={p} onRemove={() => compare.remove(p.id)} /></li>
          ))}
        </ul>
        <dl className="flex flex-col gap-4">
          {rows.map((r) => (
            <div key={r.id} className={`flex flex-col gap-2 rounded-card p-4 ${r.differs ? "bg-primary/20" : "bg-surface"}`}>
              <dt className="text-sm font-medium text-ink-muted">{r.label}</dt>
              {r.values.map((v, i) => (
                <dd key={products[i]?.id} className="flex items-baseline justify-between gap-4">
                  <span className="text-ink-muted">{products[i]?.name}</span>
                  <span className={`text-lg tabular-nums ${r.differs ? "font-medium" : ""}`}>{v}</span>
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </div>

      {comparison.rows.length === 0 && products.length >= 2 ? <p className="max-w-[60ch] text-ink-muted">These products do not share any specification that can be compared yet.</p> : null}
      {onlyDifferences && rows.length === 0 && comparison.rows.length > 0 ? <p className="text-ink-muted">These products match on every field shown.</p> : null}
      {comparison.partial.length > 0 ? <p className="max-w-[60ch] text-sm text-ink-muted">Not shown, because not every product has a value: {comparison.partial.join(", ")}.</p> : null}

      <div><BookButton ids={products.map((p) => p.id)} source="compare" label="Book these on WhatsApp" /></div>
    </div>
  );
}

function ProductHead({ p, onRemove }: { p: CompareData["products"][number]; onRemove: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-input bg-sunken">
        {p.image ? <MediaImage image={p.image} fill sizes="(min-width: 768px) 20rem, 90vw" className="object-contain p-4" /> : null}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">{p.brandName}</p>
          <Link href={`/product/${p.slug}`} className="font-heading text-xl font-medium underline-offset-4 hover:underline">{p.name}</Link>
        </div>
        <button type="button" aria-label={`Remove ${p.name} from the comparison`} onClick={onRemove} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95]">
          <X size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

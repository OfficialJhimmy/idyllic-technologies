import { X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { BrandOption, Facet } from "@/db/queries/shop";
import { toQuery, withoutBrand, withoutRange, withoutSpecValue, type Filters } from "@/lib/marketplace/filters";

const chip = "inline-flex h-10 items-center gap-2 rounded-full border border-line-strong pr-2 pl-4 text-[0.9375rem] transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.97]";

/** What is currently applied, each with a link that removes just that choice. */
export function ActiveFilters({ basePath, filters, brands, facets }: { basePath: string; filters: Filters; brands: BrandOption[]; facets: Facet[] }) {
  const chips: { key: string; label: string; href: string }[] = [];
  for (const slug of filters.brands) chips.push({ key: `b-${slug}`, label: brands.find((b) => b.slug === slug)?.name ?? slug, href: basePath + toQuery(withoutBrand(filters, slug)) });
  for (const sf of filters.specs) {
    const facet = facets.find((f) => f.key === sf.key);
    for (const v of sf.values ?? []) chips.push({ key: `s-${sf.key}-${v}`, label: `${facet?.label ?? sf.key}: ${facet?.options?.find((o) => o.value === v)?.label ?? v}`, href: basePath + toQuery(withoutSpecValue(filters, sf.key, v)) });
    if (sf.values === undefined) {
      const range = [sf.min !== undefined ? `from ${sf.min}` : "", sf.max !== undefined ? `to ${sf.max}` : ""].filter(Boolean).join(" ");
      chips.push({ key: `r-${sf.key}`, label: `${facet?.label ?? sf.key} ${range}${facet?.unit ? ` ${facet.unit}` : ""}`, href: basePath + toQuery(withoutRange(filters, sf.key)) });
    }
  }
  if (chips.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      {chips.map((c) => (
        <li key={c.key}>
          <Link href={c.href} className={chip} aria-label={`Remove filter ${c.label}`}>
            {c.label}
            <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-sunken"><X size={14} weight="bold" /></span>
          </Link>
        </li>
      ))}
      <li><Link href={basePath} className="inline-flex h-10 items-center px-3 font-medium underline-offset-4 hover:underline">Clear all</Link></li>
    </ul>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/corporate/container";
import { ShopProductCard } from "@/components/marketplace/shop-product-card";
import { ShopSearch } from "@/components/marketplace/shop-search";
import { TrackSearch } from "@/components/marketplace/track-search";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { getPublicCategories } from "@/db/queries/public";
import { browseAll, searchShop } from "@/db/queries/shop";
import { pageMetadata } from "@/lib/seo";

const PAGE_SIZE = 12;
type Props = { searchParams: Promise<{ q?: string; page?: string }> };

// Result pages are for people, not search engines: they would be an endless set of near duplicates.
export const metadata: Metadata = { ...pageMetadata({ host: "shop", title: "Search", path: "/search" }), robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [categories, results] = await Promise.all([getPublicCategories(), q ? searchShop(q).then((rows) => ({ rows, total: rows.length })) : browseAll(page, PAGE_SIZE)]);
  const pages = q ? 1 : Math.max(1, Math.ceil(results.total / PAGE_SIZE));

  return (
    <Container className="flex flex-col gap-8 pt-10 pb-24">
      <div className="flex flex-col gap-5">
        <h1 className="hero-rise text-5xl font-medium sm:text-6xl">{q ? "Search" : "All products"}</h1>
        <ShopSearch id="results-search" defaultValue={q} className="max-w-2xl" />
        <p className="text-ink-muted" role="status">{q ? `${results.total} ${results.total === 1 ? "result" : "results"} for “${q}”` : `${results.total} ${results.total === 1 ? "product" : "products"}`}</p>
      </div>

      {results.rows.length > 0 ? (
        <>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {results.rows.map((p) => (
              <li key={p.id}>
                <ShopProductCard product={p} />
              </li>
            ))}
          </ul>
          {!q ? <Pagination align="center" basePath="/search" page={page} pages={pages} /> : null}
        </>
      ) : (
        <EmptyState
          title={q ? `Nothing found for “${q}”` : "No products yet"}
          body={q ? "Check the spelling, try a shorter word, or browse by category." : "Products will appear here as they are added."}
          action={
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.id}><Link href={`/category/${c.slug}`} className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 font-medium hover:bg-sunken">{c.name}</Link></li>
              ))}
            </ul>
          }
        />
      )}
      {q ? <TrackSearch queryLength={q.length} resultCount={results.total} /> : null}
    </Container>
  );
}

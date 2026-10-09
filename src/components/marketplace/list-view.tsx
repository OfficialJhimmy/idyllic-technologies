"use client";

import { Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getListProductsAction } from "@/app/(marketplace)/shop-host/actions";
import { BookButton } from "@/components/marketplace/book-button";
import { toListItem } from "@/components/marketplace/shop-product-card";
import { MediaImage } from "@/components/corporate/media-image";
import { useSiteOrigin } from "@/components/corporate/shop-link";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import type { ProductCard } from "@/db/queries/public";
import { useBookingList } from "@/lib/marketplace/use-lists";

/**
 * The booking list. What is in it is remembered by the browser, then checked against the database here,
 * so a product that has since been unpublished drops out instead of being booked. No quantities, no totals.
 */
export function ListView({ quoteFallback }: { quoteFallback: string }) {
  const quoteUrl = `${useSiteOrigin(quoteFallback)}/contact?type=quote`;
  const list = useBookingList();
  const [products, setProducts] = useState<ProductCard[] | null>(null);
  const [failed, setFailed] = useState(false);
  const idsKey = list.items.map((i) => i.id).join(",");
  const replace = list.replace;

  useEffect(() => {
    if (!idsKey) return;
    let live = true;
    getListProductsAction(idsKey.split(","))
      .then((fresh) => {
        if (!live) return;
        setProducts(fresh);
        setFailed(false);
        // Drop what is gone, and keep names and pictures current.
        if (fresh.length !== idsKey.split(",").length) replace(fresh.map(toListItem));
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [idsKey, replace]);

  if (list.count === 0) {
    return (
      <EmptyState
        title="Your booking list is empty"
        body="Add the products you want, then book them all in one WhatsApp message. Your list stays in this browser."
        action={<Link href="/search" className="inline-flex h-12 items-center rounded-full bg-action px-6 font-medium text-on-action">Browse products</Link>}
      />
    );
  }
  if (failed) return <ErrorState body="Your list could not be checked just now. Please try again." action={<Button onClick={() => setFailed(false)}>Try again</Button>} />;
  if (products === null) {
    return (
      <div role="status" aria-label="Loading your list" className="flex flex-col gap-3">
        {list.items.map((i) => <Skeleton key={i.id} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
      <ul className="divide-y divide-line rounded-card bg-surface">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-input bg-sunken">
              {p.image ? <MediaImage image={p.image} fill sizes="80px" className="object-contain p-2" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-muted">{p.brandName}</p>
              <Link href={`/product/${p.slug}`} className="font-heading text-xl font-medium underline-offset-4 hover:underline">{p.name}</Link>
            </div>
            <button type="button" aria-label={`Remove ${p.name} from the booking list`} onClick={() => list.remove(p.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95]">
              <Trash size={20} aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <aside className="flex flex-col gap-5 self-start rounded-container bg-surface p-6 lg:sticky lg:top-40">
        <h2 className="text-2xl font-medium">{products.length} {products.length === 1 ? "product" : "products"}</h2>
        <p className="text-ink-muted">One WhatsApp message lists everything here with a link to each product.</p>
        <BookButton ids={products.map((p) => p.id)} source="page" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.9375rem]">
          <a href={quoteUrl} className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">Request a quote instead</a>
          <button type="button" onClick={list.clear} className="inline-flex min-h-11 items-center font-medium text-ink-muted underline underline-offset-4 hover:text-ink">Clear list</button>
        </div>
      </aside>
    </div>
  );
}

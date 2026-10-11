"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { getLatestProductsAction } from "@/app/(marketplace)/shop-host/actions";
import { ShopProductCard } from "@/components/marketplace/shop-product-card";
import { SeeMoreButton } from "@/components/ui/see-more-button";
import type { ProductCard } from "@/db/queries/public";

type Props = { initial: ProductCard[]; total: number };

/** The newest products, eight at a time. "See more" adds the next eight below, without leaving the page. */
export function NewestProducts({ initial, total }: Props) {
  const [items, setItems] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const list = useRef<HTMLUListElement>(null);
  const focusAt = useRef<number | null>(null);

  // Keyboard users carry on from the first product that was added.
  useEffect(() => {
    if (focusAt.current === null) return;
    list.current?.querySelectorAll<HTMLElement>("li")[focusAt.current]?.querySelector<HTMLElement>("a")?.focus();
    focusAt.current = null;
  }, [items.length]);

  function more() {
    setFailed(false);
    startTransition(async () => {
      const result = await getLatestProductsAction(items.length);
      if (!result.ok) {
        setFailed(true);
        return;
      }
      focusAt.current = items.length;
      // Never show the same product twice, even if the list changed while the visitor was reading.
      setItems((prev) => [...prev, ...result.rows.filter((r) => !prev.some((p) => p.id === r.id))]);
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <ul ref={list} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p, i) => (
          <li key={p.id} className={i < initial.length ? "reveal" : "assistant-line"}>
            <ShopProductCard product={p} />
          </li>
        ))}
      </ul>
      <SeeMoreButton shown={items.length} total={total} noun="products" onClick={more} pending={pending} />
      {failed ? (
        <p role="alert" className="text-center text-sm text-error">
          Could not load more products. Please try again.
        </p>
      ) : null}
    </div>
  );
}

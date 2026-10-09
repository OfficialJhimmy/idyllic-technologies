"use client";

import { ListChecks, Scales } from "@phosphor-icons/react";
import Link from "next/link";
import { useBookingList, useCompareList } from "@/lib/marketplace/use-lists";

function Counter({ href, label, count, children }: { href: string; label: string; count: number; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={`${label}, ${count} ${count === 1 ? "product" : "products"}`} className="relative flex h-11 items-center gap-2 rounded-full px-3 text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.96] sm:px-4">
      {children}
      <span className="hidden text-[0.9375rem] font-medium lg:inline">{label}</span>
      {count > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1.5 text-xs font-medium text-on-action tabular-nums">{count}</span> : null}
    </Link>
  );
}

/** Compare and booking list entries with live counts, kept in step with the buttons through local storage. */
export function HeaderCounters() {
  const compare = useCompareList();
  const booking = useBookingList();
  return (
    <div className="flex items-center">
      <Counter href="/compare" label="Compare" count={compare.count}>
        <Scales size={22} aria-hidden />
      </Counter>
      <Counter href="/list" label="Booking list" count={booking.count}>
        <ListChecks size={22} aria-hidden />
      </Counter>
    </div>
  );
}

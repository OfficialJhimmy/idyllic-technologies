"use client";

import { Check, Plus, Scales } from "@phosphor-icons/react";
import { useState } from "react";
import { track } from "@/lib/analytics";
import type { ListItem } from "@/lib/marketplace/list-logic";
import { useBookingList, useCompareList } from "@/lib/marketplace/use-lists";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-strong)] active:scale-[0.97]";

/** Adds a product to the booking list, and takes it off again. The state is always written out, not only coloured. */
export function AddToListButton({ item, size = "md", className = "" }: { item: ListItem; size?: "md" | "lg"; className?: string }) {
  const list = useBookingList();
  const inList = list.has(item.id);
  const [announce, setAnnounce] = useState("");

  function toggle() {
    if (inList) {
      list.remove(item.id);
      setAnnounce(`${item.name} removed from your booking list`);
      return;
    }
    const blocked = list.add(item);
    if (blocked === "full") return setAnnounce("Your booking list is full. Book these products first, or remove one.");
    track("list_add", { product_slug: item.slug });
    setAnnounce(`${item.name} added to your booking list`);
  }

  return (
    <>
      <button type="button" aria-pressed={inList} onClick={toggle} className={`${base} ${size === "lg" ? "h-12" : ""} ${inList ? "bg-primary text-on-primary" : "border border-line-strong bg-surface text-ink hover:bg-sunken"} ${className}`}>
        {inList ? <Check size={18} weight="bold" aria-hidden /> : <Plus size={18} aria-hidden />}
        {inList ? "In your booking list" : "Add to booking list"}
      </button>
      <span role="status" className="sr-only">{announce}</span>
    </>
  );
}

/** Adds a product to the compare list. Compare holds three products from one category, and says so when that stops an add. */
export function CompareButton({ item, size = "md", className = "" }: { item: ListItem; size?: "md" | "lg"; className?: string }) {
  const compare = useCompareList();
  const on = compare.has(item.id);
  const [message, setMessage] = useState("");

  function toggle() {
    if (on) {
      compare.remove(item.id);
      return setMessage("");
    }
    const blocked = compare.add(item);
    if (blocked === "full") return setMessage("You can compare up to 3 products. Remove one first.");
    if (blocked === "other-category") return setMessage("Compare works within one category. Clear the compare list to start another.");
    track("compare_add", { product_slug: item.slug });
    setMessage("");
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" aria-pressed={on} onClick={toggle} className={`${base} ${size === "lg" ? "h-12" : ""} ${on ? "bg-primary text-on-primary" : "border border-line-strong bg-surface text-ink hover:bg-sunken"} ${className}`}>
        <Scales size={18} aria-hidden />
        {on ? "Comparing" : "Compare"}
      </button>
      <p role="status" className="max-w-[28ch] text-sm text-error empty:hidden">{message}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BookButton } from "@/components/marketplace/book-button";
import { useBookingList } from "@/lib/marketplace/use-lists";

/** On phones, a bar at the bottom once the booking list has something in it, so booking is always one tap away. */
export function BookingBar() {
  const { items, count } = useBookingList();
  const pathname = usePathname();
  const showing = count > 0 && pathname !== "/list";

  // Lets the Energy Assistant button sit above this bar instead of behind it.
  useEffect(() => {
    if (!showing) return;
    document.documentElement.dataset.bookingBar = "";
    return () => {
      delete document.documentElement.dataset.bookingBar;
    };
  }, [showing]);

  if (!showing) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 py-3 shadow-raised lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <Link href="/list" className="flex h-11 items-center rounded-full px-4 font-medium underline-offset-4 hover:underline">
          Booking list ({count})
        </Link>
        <BookButton ids={items.map((i) => i.id)} source="page" size="md" label="Book on WhatsApp" />
      </div>
    </div>
  );
}

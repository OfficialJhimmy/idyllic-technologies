"use client";

import { useSyncExternalStore } from "react";
import { ArrowLink } from "@/components/corporate/arrow-link";
import { deriveShopOrigin, deriveSiteOrigin } from "@/lib/shop-origin";

const subscribe = () => () => {};

/**
 * The marketplace origin for the address in the browser. The server renders the configured address (right
 * for search engines and for the live site) and the browser swaps in the matching one, so on localhost or a
 * staging domain the link opens the marketplace that is running there.
 */
export function useShopOrigin(fallback: string): string {
  return useSyncExternalStore(
    subscribe,
    () => deriveShopOrigin(window.location.host, window.location.protocol, fallback),
    () => fallback,
  );
}

type Props = { fallback: string; path?: string; className?: string; children: React.ReactNode; arrow?: "accent" | "primary" | "secondary" | "light" };

/** A link to the marketplace. With `arrow` it is the pill with the arrow circle used for main actions. */
export function ShopLink({ fallback, path = "", className = "", children, arrow }: Props) {
  const href = `${useShopOrigin(fallback)}${path}`;
  if (arrow) {
    return (
      <ArrowLink href={href} external variant={arrow} className={className}>
        {children}
      </ArrowLink>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/** The main site origin for the address in the browser. The marketplace uses it for links back to the main site. */
export function useSiteOrigin(fallback: string): string {
  return useSyncExternalStore(
    subscribe,
    () => deriveSiteOrigin(window.location.host, window.location.protocol, fallback),
    () => fallback,
  );
}

/** A link from the marketplace to a page on the main site. */
export function SiteLink({ fallback, path = "", className = "", children }: { fallback: string; path?: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={`${useSiteOrigin(fallback)}${path}`} className={className}>
      {children}
    </a>
  );
}

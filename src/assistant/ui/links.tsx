"use client";

import Link from "next/link";
import type { Answers } from "@/assistant/engine/types";

/**
 * Where the assistant's links point. Each site shows the assistant, but products and the marketplace live
 * on the shop host and the contact form lives on the main site, so each prefix is empty on its own host.
 */
export type Origins = { shop: string; site: string };

export const productHref = (o: Origins, slug: string) => `${o.shop}/product/${slug}`;
export const marketplaceHref = (o: Origins, path: string) => `${o.shop}${path}`;

/** Answers travel as ids only. The contact page turns them back into a sentence. */
export function contactHref(o: Origins, answers: Answers): string {
  const q = new URLSearchParams({ from: "assistant" });
  for (const [key, value] of Object.entries(answers)) if (value) q.set(key, value);
  return `${o.site}/contact?${q.toString()}`;
}

type Props = React.ComponentProps<"a"> & { href: string; onNavigate?: () => void };

/** A client side link on the same site, a plain link across sites. */
export function SmartLink({ href, onNavigate, children, ...rest }: Props) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} onNavigate={onNavigate} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

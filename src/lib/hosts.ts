/** Host helpers shared by the proxy and server code. No secrets here. */

const SHOP_PREFIX = "shop.";

export function isShopHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const h = host.toLowerCase().split(":")[0] ?? "";
  return h.startsWith(SHOP_PREFIX);
}

export const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? "https://shop.idyllictechnologies.com";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idyllictechnologies.com";

/** Canonical product URL always points to the shop host. */
export function canonicalProductUrl(slug: string): string {
  return `${SHOP_URL}/product/${slug}`;
}

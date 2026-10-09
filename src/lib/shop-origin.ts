/**
 * Where the marketplace and the main site live, worked out from the address the visitor is using.
 * The environment values (NEXT_PUBLIC_SHOP_URL, NEXT_PUBLIC_SITE_URL) are the answer to give to search
 * engines and for a deployed site; this is the answer for a person clicking a link. On localhost it is
 * shop.localhost, on a staging domain it is shop.<that domain>, in production the same as the setting.
 * No secrets and no server imports, so the browser can use it.
 */

const isIp = (host: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host.split(":")[0] ?? "");
/** Vercel's own addresses cannot have a shop. in front of them. */
const hasNoSubdomains = (host: string) => host.split(":")[0]!.endsWith(".vercel.app") || isIp(host);

/** The marketplace origin for a visitor on `host`, or `fallback` when this address cannot have a shop subdomain. */
export function deriveShopOrigin(host: string | null | undefined, protocol: string, fallback: string): string {
  const h = (host ?? "").toLowerCase();
  if (!h || hasNoSubdomains(h)) return fallback;
  if (h.startsWith("shop.")) return `${protocol}//${h}`;
  return `${protocol}//shop.${h.replace(/^www\./, "")}`;
}

/** The main site origin for a visitor on `host`, or `fallback` when it cannot be worked out. */
export function deriveSiteOrigin(host: string | null | undefined, protocol: string, fallback: string): string {
  const h = (host ?? "").toLowerCase();
  if (!h || hasNoSubdomains(h)) return fallback;
  return `${protocol}//${h.replace(/^shop\./, "")}`;
}

export const protocolFor = (host: string | null | undefined, forwarded?: string | null): string => {
  if (forwarded === "http" || forwarded === "https") return `${forwarded}:`;
  return /^(localhost|127\.|\[::1\]|[^:/]+\.localhost)(:|$)/.test((host ?? "").toLowerCase()) ? "http:" : "https:";
};

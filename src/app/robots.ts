import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isShopHost } from "@/lib/hosts";
import { absoluteUrl, shopAbsoluteUrl } from "@/lib/seo";

// Next only allows one robots file, at the root, so it answers for both addresses by checking which one was asked.
// The marketplace keeps search results, compare and the booking list out of search engines: they are personal or endless.
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (isShopHost((await headers()).get("host"))) {
    return { rules: [{ userAgent: "*", allow: "/", disallow: ["/search", "/compare", "/list"] }], sitemap: shopAbsoluteUrl("/sitemap.xml") };
  }
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }], sitemap: absoluteUrl("/sitemap.xml") };
}

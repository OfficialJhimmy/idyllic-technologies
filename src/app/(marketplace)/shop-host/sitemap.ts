import type { MetadataRoute } from "next";
import { getShopSitemapData } from "@/db/queries/shop";
import { shopAbsoluteUrl } from "@/lib/seo";

// The marketplace's own sitemap, served at /sitemap.xml on the shop host. Search, compare and the
// booking list are left out: they are personal or endless.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const d = await getShopSitemapData();
    return [
      { url: shopAbsoluteUrl("/") },
      ...d.categories.map((slug) => ({ url: shopAbsoluteUrl(`/category/${slug}`) })),
      ...d.brands.map((slug) => ({ url: shopAbsoluteUrl(`/brand/${slug}`) })),
      ...d.products.map((p) => ({ url: shopAbsoluteUrl(`/product/${p.slug}`), lastModified: new Date(p.updatedAt) })),
    ];
  } catch (error) {
    console.error("shop sitemap: could not read the catalogue", error);
    return [{ url: shopAbsoluteUrl("/") }];
  }
}

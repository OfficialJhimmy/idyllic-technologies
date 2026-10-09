import type { MetadataRoute } from "next";
import { getPublishedPostSlugs } from "@/db/queries/public";
import { absoluteUrl } from "@/lib/seo";

// Product pages are not listed here: they declare the shop host as their canonical address, and the
// marketplace publishes its own sitemap. Blog posts and the main pages live on this host.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["/", "/about", "/industries", "/products", "/blog", "/faqs", "/contact"].map((path) => ({ url: absoluteUrl(path) }));
  let posts: MetadataRoute.Sitemap = [];
  try {
    posts = (await getPublishedPostSlugs()).map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: new Date(p.updatedAt) }));
  } catch (error) {
    console.error("sitemap: could not read posts", error);
  }
  return [...pages, ...posts];
}

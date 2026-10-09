import "server-only";
import { revalidatePath, updateTag } from "next/cache";

/**
 * On-demand revalidation after a catalogue change. Call from server actions only.
 * Public pages tag their cached catalogue reads with "catalogue". The paths cover the product page
 * on both hosts (the shop host is rewritten to /shop-host) and the marketplace and category lists.
 */
export function revalidateCatalogue(opts: { productSlugs?: string[] } = {}) {
  updateTag("catalogue");
  for (const slug of opts.productSlugs ?? []) {
    revalidatePath(`/product/${slug}`);
    revalidatePath(`/shop-host/product/${slug}`);
  }
  revalidatePath("/products");
  revalidatePath("/shop-host");
}

/**
 * On-demand revalidation after a blog change. Call from server actions only. Public blog pages tag
 * their cached reads with "blog". The home page lists the three newest posts, so it is refreshed too.
 */
export function revalidateBlog(opts: { postSlugs?: string[] } = {}) {
  updateTag("blog");
  for (const slug of opts.postSlugs ?? []) revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
  revalidatePath("/");
}

/** On-demand revalidation after FAQs, testimonials, clients or site values change. Server actions only. */
export function revalidateContent() {
  updateTag("content");
  for (const path of ["/", "/about", "/faqs", "/contact"]) revalidatePath(path);
}

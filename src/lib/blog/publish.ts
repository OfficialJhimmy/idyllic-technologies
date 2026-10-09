import { isBodyEmpty } from "@/lib/blog/sanitize";
import { isValidSlug } from "@/lib/catalogue/slug";

/** A publication date this far ahead counts as "now", to allow for clock differences between devices. */
export const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

/** Scheduling is not supported, so a date in the future is refused instead of silently ignored. */
export function isFutureDate(date: Date, now: Date): boolean {
  return date.getTime() > now.getTime() + FUTURE_TOLERANCE_MS;
}

export type PostPublishCandidate = {
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  authorId: string | null;
};

/**
 * Things that must be true before a post goes live, as plain sentences (empty when ready).
 * These rules are a choice made for Phase 3, see design/decisions.md. Category, tags and images are optional.
 */
export function postPublishIssues(p: PostPublishCandidate): string[] {
  const issues: string[] = [];
  if (!p.title.trim()) issues.push("Add a title");
  if (!isValidSlug(p.slug)) issues.push("Add a valid URL slug (lower case letters, digits and hyphens)");
  if (isBodyEmpty(p.body)) issues.push("Write the post body");
  if (!p.excerpt?.trim()) issues.push("Add an excerpt");
  if (!p.authorId) issues.push("Choose an author");
  return issues;
}

/**
 * The publication date to store. A date chosen by staff wins (this is how the existing posts are
 * back-dated). Otherwise the date already stored is kept, and publishing a post with no date uses now.
 */
export function resolvePublishedAt(opts: {
  requested: Date | null;
  existing: Date | null;
  publishing: boolean;
  now: Date;
}): Date | null {
  if (opts.requested) return opts.requested;
  if (opts.existing) return opts.existing;
  return opts.publishing ? opts.now : null;
}

/** Turns a tag the way staff typed it into its stored form. Returns null when nothing usable is left. */
export function normaliseTagName(input: string): string | null {
  const name = input.trim().replace(/\s+/g, " ").replace(/^#/, "");
  return name.length > 0 && name.length <= 40 ? name : null;
}

import { isValidSlug } from "@/lib/catalogue/slug";

export type PublishStatus = "draft" | "published" | "archived";
export type StatusAction = "publish" | "unpublish" | "archive" | "restore";

const TRANSITIONS: Record<StatusAction, { from: PublishStatus[]; to: PublishStatus }> = {
  publish: { from: ["draft"], to: "published" },
  unpublish: { from: ["published"], to: "draft" },
  archive: { from: ["draft", "published"], to: "archived" },
  restore: { from: ["archived"], to: "draft" },
};

/** The status an action leads to, or null if the action is not allowed from the current status. */
export function nextStatus(current: PublishStatus, action: StatusAction): PublishStatus | null {
  const t = TRANSITIONS[action];
  return t.from.includes(current) ? t.to : null;
}

export type PublishCandidate = {
  name: string;
  slug: string;
  brandId: string | null;
  categoryId: string | null;
  summary: string | null;
  imageCount: number;
  hasPrimaryImage: boolean;
};

/**
 * Things that must be true before a product goes live. Returns plain sentences, empty when ready.
 * These rules are a choice made for Phase 2 (the spec does not list them). See design/decisions.md.
 */
export function publishIssues(p: PublishCandidate): string[] {
  const issues: string[] = [];
  if (!p.name.trim()) issues.push("Add a product name");
  if (!isValidSlug(p.slug)) issues.push("Add a valid URL slug (lower case letters, digits and hyphens)");
  if (!p.brandId) issues.push("Choose a brand");
  if (!p.categoryId) issues.push("Choose a category");
  if (!p.summary?.trim()) issues.push("Add a short summary");
  if (p.imageCount === 0) issues.push("Add at least one image");
  else if (!p.hasPrimaryImage) issues.push("Choose a primary image");
  return issues;
}

export type StatusPatch = { status: PublishStatus; publishedAt: Date | null };

/**
 * The row changes for a status action. publishedAt is set the first time a product goes live and
 * kept afterwards, so unpublishing and republishing does not change the original publish date.
 */
export function statusPatch(
  current: PublishStatus,
  action: StatusAction,
  existingPublishedAt: Date | null,
  now: Date,
): StatusPatch | null {
  const status = nextStatus(current, action);
  if (!status) return null;
  const publishedAt = action === "publish" ? (existingPublishedAt ?? now) : existingPublishedAt;
  return { status, publishedAt };
}

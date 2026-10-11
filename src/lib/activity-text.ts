/** Turns an activity log entry into words for the dashboard. Pure, so it is tested. */

const verbs: Record<string, string> = {
  create: "Added",
  update: "Updated",
  delete: "Deleted",
  publish: "Published",
  unpublish: "Unpublished",
  archive: "Archived",
  restore: "Restored",
  reorder: "Reordered",
  upload: "Uploaded",
  read: "Opened",
  replied: "Marked as replied:",
  closed: "Closed",
  new: "Reopened",
};

const nouns: Record<string, string> = {
  product: "product",
  brand: "brand",
  category: "category",
  spec_definition: "spec",
  spec: "spec",
  media: "image",
  post: "blog post",
  post_category: "blog category",
  tag: "tag",
  author: "author",
  enquiry: "enquiry from",
  faq: "FAQ",
  testimonial: "testimonial",
  client: "client or partner",
  document: "datasheet",
};

export type ActivityText = { verb: string; noun: string; name: string | null };

/** `action` looks like "product.publish". The name is looked up from the record, and is null once it has been deleted. */
export function describeActivity(action: string, entity: string, name: string | null): ActivityText {
  const [kind = entity, verb = ""] = action.split(".");
  const noun = nouns[kind] ?? nouns[entity] ?? kind.replace(/_/g, " ");
  return { verb: verbs[verb] ?? "Changed", noun, name };
}

/** "just now", "5 minutes ago", "3 hours ago", "yesterday", "4 days ago", then a date. */
export function timeAgo(then: Date, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: then.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

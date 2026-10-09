import type { PostDraft } from "@/lib/blog/types";

export function emptyPostDraft(): PostDraft {
  return {
    id: null,
    title: "",
    slug: "",
    slugEdited: false,
    excerpt: "",
    body: "",
    featuredImage: null,
    categoryId: null,
    authorId: null,
    tags: [],
    publishedAtLocal: "",
    seoTitle: "",
    seoDescription: "",
    ogImage: null,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Date to the value a datetime-local input expects, in the viewer's own time zone. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The reverse: a datetime-local value to an ISO string with offset, or null when empty or invalid. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** What the editor sends to the server. The server validates again. */
export function postDraftToPayload(d: PostDraft) {
  return {
    id: d.id,
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt,
    body: d.body,
    featuredMediaId: d.featuredImage?.id ?? null,
    categoryId: d.categoryId,
    authorId: d.authorId,
    tags: d.tags,
    publishedAt: fromLocalInput(d.publishedAtLocal),
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    ogImageMediaId: d.ogImage?.id ?? null,
  };
}

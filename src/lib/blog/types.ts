import type { PublishStatus } from "@/lib/catalogue/publish";
import type { MediaRef } from "@/lib/catalogue/types";

/** Everything the post editor edits. `publishedAt` is the value of a datetime-local input. */
export type PostDraft = {
  id: string | null;
  title: string;
  slug: string;
  slugEdited: boolean;
  excerpt: string;
  body: string;
  featuredImage: MediaRef | null;
  categoryId: string | null;
  authorId: string | null;
  tags: string[];
  publishedAtLocal: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: MediaRef | null;
};

export type PostEditorData = {
  status: PublishStatus;
  publishedAt: string | null;
  updatedAt: string | null;
  draft: PostDraft;
};

export type PostListRow = {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
  authorName: string | null;
  categoryName: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type TaxonomyRow = { id: string; name: string; slug: string; postCount: number };
export type AuthorOption = { id: string; name: string };
export type CategoryOption = { id: string; name: string };

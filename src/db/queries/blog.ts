import "server-only";
import { and, asc, desc, eq, ilike, inArray, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { getMediaRef } from "@/db/queries/catalogue";
import { toLocalInput } from "@/lib/blog/draft";
import type { AuthorOption, CategoryOption, PostEditorData, PostListRow, TaxonomyRow } from "@/lib/blog/types";
import type { PublishStatus } from "@/lib/catalogue/publish";

const s = schema;
const count = sql<number>`count(*)::int`;
const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export type PostListFilters = { q?: string; status?: PublishStatus; categoryId?: string; page: number; pageSize: number };

export async function listPosts(f: PostListFilters): Promise<{ rows: PostListRow[]; total: number }> {
  const conditions: SQL[] = [];
  if (f.q) conditions.push(ilike(s.posts.title, likeTerm(f.q)));
  if (f.status) conditions.push(eq(s.posts.status, f.status));
  if (f.categoryId) conditions.push(eq(s.posts.categoryId, f.categoryId));
  const where = conditions.length ? and(...conditions) : undefined;

  const [{ n: total } = { n: 0 }] = await db.select({ n: count }).from(s.posts).where(where);
  const rows = await db
    .select({
      id: s.posts.id,
      title: s.posts.title,
      slug: s.posts.slug,
      status: s.posts.status,
      publishedAt: s.posts.publishedAt,
      updatedAt: s.posts.updatedAt,
      authorName: s.authors.name,
      categoryName: s.postCategories.name,
      imagePath: s.media.storagePath,
      imageAlt: s.media.alt,
    })
    .from(s.posts)
    .leftJoin(s.authors, eq(s.authors.id, s.posts.authorId))
    .leftJoin(s.postCategories, eq(s.postCategories.id, s.posts.categoryId))
    .leftJoin(s.media, eq(s.media.id, s.posts.featuredMediaId))
    .where(where)
    .orderBy(desc(s.posts.updatedAt))
    .limit(f.pageSize)
    .offset((f.page - 1) * f.pageSize);

  return {
    total,
    rows: rows.map((r) => ({
      ...r,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      updatedAt: r.updatedAt.toISOString(),
    })),
  };
}

export async function postStatusCounts(): Promise<Record<PublishStatus, number>> {
  const rows = await db.select({ status: s.posts.status, n: count }).from(s.posts).groupBy(s.posts.status);
  const out: Record<PublishStatus, number> = { draft: 0, published: 0, archived: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export async function getPostEditorData(id: string): Promise<PostEditorData | null> {
  const [p] = await db.select().from(s.posts).where(eq(s.posts.id, id)).limit(1);
  if (!p) return null;
  const [tagRows, featuredImage, ogImage] = await Promise.all([
    db
      .select({ name: s.tags.name })
      .from(s.postTags)
      .innerJoin(s.tags, eq(s.tags.id, s.postTags.tagId))
      .where(eq(s.postTags.postId, id))
      .orderBy(asc(s.tags.name)),
    p.featuredMediaId ? getMediaRef(p.featuredMediaId) : null,
    p.ogImageMediaId ? getMediaRef(p.ogImageMediaId) : null,
  ]);

  return {
    status: p.status,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    updatedAt: p.updatedAt.toISOString(),
    draft: {
      id: p.id,
      title: p.title,
      slug: p.slug,
      slugEdited: true,
      excerpt: p.excerpt ?? "",
      body: p.body,
      featuredImage,
      categoryId: p.categoryId,
      authorId: p.authorId,
      tags: tagRows.map((t) => t.name),
      publishedAtLocal: toLocalInput(p.publishedAt?.toISOString() ?? null),
      seoTitle: p.seoTitle ?? "",
      seoDescription: p.seoDescription ?? "",
      ogImage,
    },
  };
}

export async function postCategoryOptions(): Promise<CategoryOption[]> {
  return db.select({ id: s.postCategories.id, name: s.postCategories.name }).from(s.postCategories).orderBy(asc(s.postCategories.name));
}

export async function authorOptions(): Promise<AuthorOption[]> {
  return db.select({ id: s.authors.id, name: s.authors.name }).from(s.authors).orderBy(asc(s.authors.name));
}

export async function tagNames(): Promise<string[]> {
  const rows = await db.select({ name: s.tags.name }).from(s.tags).orderBy(asc(s.tags.name));
  return rows.map((r) => r.name);
}

export async function listPostCategories(): Promise<TaxonomyRow[]> {
  const rows = await db.select().from(s.postCategories).orderBy(asc(s.postCategories.name));
  const used = await db.select({ id: s.posts.categoryId, n: count }).from(s.posts).groupBy(s.posts.categoryId);
  const n = new Map(used.map((u) => [u.id, u.n]));
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, postCount: n.get(r.id) ?? 0 }));
}

export async function listTags(): Promise<TaxonomyRow[]> {
  const rows = await db.select().from(s.tags).orderBy(asc(s.tags.name));
  const used = await db.select({ id: s.postTags.tagId, n: count }).from(s.postTags).groupBy(s.postTags.tagId);
  const n = new Map(used.map((u) => [u.id, u.n]));
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, postCount: n.get(r.id) ?? 0 }));
}

export async function listAuthors() {
  const rows = await db.select().from(s.authors).orderBy(asc(s.authors.name));
  const used = await db.select({ id: s.posts.authorId, n: count }).from(s.posts).groupBy(s.posts.authorId);
  const n = new Map(used.map((u) => [u.id, u.n]));
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, postCount: n.get(r.id) ?? 0 }));
}

export async function getAuthor(id: string) {
  const [row] = await db.select().from(s.authors).where(eq(s.authors.id, id)).limit(1);
  if (!row) return null;
  const avatar = row.avatarMediaId ? await getMediaRef(row.avatarMediaId) : null;
  const [{ n } = { n: 0 }] = await db.select({ n: count }).from(s.posts).where(eq(s.posts.authorId, id));
  return { ...row, avatar, postCount: n };
}

/** Which of these tag names already exist, by slug. Used to suggest tags in the editor. */
export async function existingTagIds(slugs: string[]) {
  if (!slugs.length) return [];
  return db.select({ id: s.tags.id, slug: s.tags.slug }).from(s.tags).where(inArray(s.tags.slug, slugs));
}

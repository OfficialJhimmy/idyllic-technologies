import "server-only";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import { isFutureDate, normaliseTagName, postPublishIssues, resolvePublishedAt } from "@/lib/blog/publish";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import type { PostInput } from "@/lib/blog/schemas";
import { nextStatus, type PublishStatus, type StatusAction } from "@/lib/catalogue/publish";
import { slugify } from "@/lib/catalogue/slug";

const s = schema;

export type SavePostResult =
  | { ok: true; id: string; slug: string; status: PublishStatus; previousSlug: string | null; changedLive: boolean; issues: string[] }
  | { ok: false; error?: string; fieldErrors?: Record<string, string>; issues?: string[] };

/**
 * Creates or updates a post and its tags in one transaction. A status action is applied after the
 * save only when the post passes the publish checks. When it does not, the save still happens and the
 * problems come back in `issues`. A post that is already live cannot be saved in a state that fails the checks.
 */
export async function savePost(rawInput: PostInput, actorId: string, statusAction?: StatusAction): Promise<SavePostResult> {
  const now = new Date();
  // The body is cleaned before anything else reads it, so what is checked is what gets stored.
  const mediaBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;
  const input = { ...rawInput, body: sanitizePostHtml(rawInput.body, { mediaBaseUrl }) };
  const fieldErrors: Record<string, string> = {};

  const [existing] = input.id ? await db.select().from(s.posts).where(eq(s.posts.id, input.id)).limit(1) : [];
  if (input.id && !existing) return { ok: false, error: "This post no longer exists" };

  const [taken] = await db
    .select({ id: s.posts.id })
    .from(s.posts)
    .where(input.id ? and(eq(s.posts.slug, input.slug), ne(s.posts.id, input.id)) : eq(s.posts.slug, input.slug))
    .limit(1);
  if (taken) fieldErrors.slug = "Another post already uses this slug";

  const requested = input.publishedAt ? new Date(input.publishedAt) : null;
  if (requested && isFutureDate(requested, now)) {
    fieldErrors.publishedAt = "The publication date cannot be in the future. Scheduling is not available yet";
  }

  // Tags: tidy, then dedupe by slug so "Solar" and "solar" are one tag.
  const tagsBySlug = new Map<string, string>();
  for (const raw of input.tags) {
    const name = normaliseTagName(raw);
    const slug = name ? slugify(name) : "";
    if (!name || !slug) {
      fieldErrors.tags = `"${raw}" cannot be used as a tag`;
      continue;
    }
    if (!tagsBySlug.has(slug)) tagsBySlug.set(slug, name);
  }

  const refs = [
    input.authorId && { table: s.authors, id: input.authorId, field: "authorId", label: "author" },
    input.categoryId && { table: s.postCategories, id: input.categoryId, field: "categoryId", label: "category" },
  ].filter(Boolean) as { table: typeof s.authors | typeof s.postCategories; id: string; field: string; label: string }[];
  for (const ref of refs) {
    const [found] = await db.select({ id: ref.table.id }).from(ref.table).where(eq(ref.table.id, ref.id)).limit(1);
    if (!found) fieldErrors[ref.field] = `This ${ref.label} no longer exists`;
  }

  const mediaIds = [input.featuredMediaId, input.ogImageMediaId].filter((v): v is string => Boolean(v));
  if (mediaIds.length) {
    const found = await db.select({ id: s.media.id }).from(s.media).where(inArray(s.media.id, [...new Set(mediaIds)]));
    if (found.length !== new Set(mediaIds).size) fieldErrors.featuredMediaId = "One of the images no longer exists";
  }

  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const issues = postPublishIssues({ title: input.title, slug: input.slug, body: input.body, excerpt: input.excerpt, authorId: input.authorId });
  const currentStatus: PublishStatus = existing?.status ?? "draft";
  if (currentStatus === "published" && issues.length) {
    return { ok: false, error: "This post is live, so it needs these before it can be saved", issues };
  }

  let newStatus: PublishStatus = currentStatus;
  let statusIssues: string[] = [];
  if (statusAction) {
    const target = nextStatus(currentStatus, statusAction);
    if (!target) return { ok: false, error: "That status change is not available for this post" };
    if (statusAction === "publish" && issues.length) statusIssues = issues;
    else newStatus = target;
  }

  const publishing = newStatus === "published";
  const publishedAt = resolvePublishedAt({ requested, existing: existing?.publishedAt ?? null, publishing, now });

  const id = await db.transaction(async (tx) => {
    const values = {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      featuredMediaId: input.featuredMediaId,
      categoryId: input.categoryId,
      authorId: input.authorId,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      ogImageMediaId: input.ogImageMediaId,
      status: newStatus,
      publishedAt,
      updatedAt: now,
    };

    let postId: string;
    if (existing) {
      postId = existing.id;
      await tx.update(s.posts).set(values).where(eq(s.posts.id, postId));
    } else {
      const [row] = await tx.insert(s.posts).values(values).returning({ id: s.posts.id });
      postId = row!.id;
    }

    await tx.delete(s.postTags).where(eq(s.postTags.postId, postId));
    if (tagsBySlug.size) {
      await tx.insert(s.tags).values([...tagsBySlug].map(([slug, name]) => ({ slug, name }))).onConflictDoNothing();
      const rows = await tx.select({ id: s.tags.id }).from(s.tags).where(inArray(s.tags.slug, [...tagsBySlug.keys()]));
      await tx.insert(s.postTags).values(rows.map((r) => ({ postId, tagId: r.id })));
    }
    return postId;
  });

  const changed = newStatus !== currentStatus;
  await logActivity(actorId, changed ? `post.${statusAction}` : existing ? "post.update" : "post.create", "post", id);

  return {
    ok: true,
    id,
    slug: input.slug,
    status: newStatus,
    previousSlug: existing && existing.slug !== input.slug ? existing.slug : null,
    changedLive: newStatus === "published" || currentStatus === "published",
    issues: statusIssues,
  };
}

/** Status change on a saved post (used by the list). Uses the stored data. */
export async function changePostStatus(id: string, action: StatusAction, actorId: string) {
  const [p] = await db.select().from(s.posts).where(eq(s.posts.id, id)).limit(1);
  if (!p) return { ok: false as const, error: "This post no longer exists" };

  const target = nextStatus(p.status, action);
  if (!target) return { ok: false as const, error: "That status change is not available for this post" };

  if (action === "publish") {
    const issues = postPublishIssues({ title: p.title, slug: p.slug, body: p.body, excerpt: p.excerpt, authorId: p.authorId });
    if (issues.length) return { ok: false as const, error: "This post is not ready to publish", issues };
  }

  const now = new Date();
  const publishedAt = resolvePublishedAt({ requested: null, existing: p.publishedAt, publishing: target === "published", now });
  await db.update(s.posts).set({ status: target, publishedAt, updatedAt: now }).where(eq(s.posts.id, id));
  await logActivity(actorId, `post.${action}`, "post", id);
  return { ok: true as const, slug: p.slug, status: target, changedLive: target === "published" || p.status === "published" };
}

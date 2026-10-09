import "server-only";
import { and, count, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import type { AuthorInput, TaxonomyInput } from "@/lib/blog/schemas";

const s = schema;

type Fail = { ok: false; error?: string; fieldErrors?: Record<string, string> };
type Kind = "category" | "tag";

const tables = { category: s.postCategories, tag: s.tags } as const;
const entityOf = { category: "post_category", tag: "tag" } as const;

export async function saveTaxonomy(kind: Kind, input: TaxonomyInput, actorId: string): Promise<{ ok: true; id: string } | Fail> {
  const table = tables[kind];
  const [taken] = await db
    .select({ id: table.id })
    .from(table)
    .where(input.id ? and(eq(table.slug, input.slug), ne(table.id, input.id)) : eq(table.slug, input.slug))
    .limit(1);
  if (taken) return { ok: false, fieldErrors: { slug: `Another ${kind} already uses this slug` } };

  if (input.id) {
    const updated = await db.update(table).set({ name: input.name, slug: input.slug }).where(eq(table.id, input.id)).returning({ id: table.id });
    if (!updated.length) return { ok: false, error: `This ${kind} no longer exists` };
    await logActivity(actorId, `${kind}.update`, entityOf[kind], input.id);
    return { ok: true, id: input.id };
  }
  const [row] = await db.insert(table).values({ name: input.name, slug: input.slug }).returning({ id: table.id });
  await logActivity(actorId, `${kind}.create`, entityOf[kind], row!.id);
  return { ok: true, id: row!.id };
}

/** Deleting a category leaves its posts uncategorised. Deleting a tag removes it from its posts. */
export async function deleteTaxonomy(kind: Kind, id: string, actorId: string): Promise<{ ok: true } | Fail> {
  const table = tables[kind];
  const deleted = await db.delete(table).where(eq(table.id, id)).returning({ id: table.id });
  if (!deleted.length) return { ok: false, error: `This ${kind} no longer exists` };
  await logActivity(actorId, `${kind}.delete`, entityOf[kind], id);
  return { ok: true };
}

export async function saveAuthor(input: AuthorInput, actorId: string): Promise<{ ok: true; id: string } | Fail> {
  const [taken] = await db
    .select({ id: s.authors.id })
    .from(s.authors)
    .where(input.id ? and(eq(s.authors.slug, input.slug), ne(s.authors.id, input.id)) : eq(s.authors.slug, input.slug))
    .limit(1);
  if (taken) return { ok: false, fieldErrors: { slug: "Another author already uses this slug" } };

  const values = { name: input.name, slug: input.slug, bio: input.bio, avatarMediaId: input.avatarMediaId };
  if (input.id) {
    const updated = await db.update(s.authors).set(values).where(eq(s.authors.id, input.id)).returning({ id: s.authors.id });
    if (!updated.length) return { ok: false, error: "This author no longer exists" };
    await logActivity(actorId, "author.update", "author", input.id);
    return { ok: true, id: input.id };
  }
  const [row] = await db.insert(s.authors).values(values).returning({ id: s.authors.id });
  await logActivity(actorId, "author.create", "author", row!.id);
  return { ok: true, id: row!.id };
}

/** An author with posts cannot be deleted, so no live post ends up without a byline. */
export async function deleteAuthor(id: string, actorId: string): Promise<{ ok: true } | Fail> {
  const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(s.posts).where(eq(s.posts.authorId, id));
  if (n > 0) return { ok: false, error: `This author has ${n} post${n === 1 ? "" : "s"}. Choose another author for them first` };
  await db.delete(s.authors).where(eq(s.authors.id, id));
  await logActivity(actorId, "author.delete", "author", id);
  return { ok: true };
}

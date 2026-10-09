import "server-only";
import { and, asc, eq, max } from "drizzle-orm";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import type { ClientInput, ContentKind, FaqInput, TestimonialInput } from "@/lib/content/schemas";

const s = schema;
type Fail = { ok: false; error: string };
type Status = "draft" | "published";

const table = { faq: s.faqs, testimonial: s.testimonials, client: s.clientsPartners } as const;

/** New items go to the end, as drafts: nothing appears on the public site until staff publish it. */
async function nextSort(kind: ContentKind, clientKind?: string): Promise<number> {
  if (kind === "client") {
    const [{ top } = { top: null }] = await db.select({ top: max(s.clientsPartners.sort) }).from(s.clientsPartners).where(eq(s.clientsPartners.kind, clientKind ?? "client"));
    return (top ?? 0) + 1;
  }
  const t = table[kind];
  const [{ top } = { top: null }] = await db.select({ top: max(t.sort) }).from(t);
  return (top ?? 0) + 1;
}

export async function saveFaq(input: FaqInput, actor: string): Promise<{ ok: true; id: string } | Fail> {
  if (input.id) {
    const done = await db.update(s.faqs).set({ question: input.question, answer: input.answer, updatedAt: new Date() }).where(eq(s.faqs.id, input.id)).returning({ id: s.faqs.id });
    if (!done.length) return { ok: false, error: "This question no longer exists" };
    await logActivity(actor, "faq.update", "faq", input.id);
    return { ok: true, id: input.id };
  }
  const [row] = await db.insert(s.faqs).values({ question: input.question, answer: input.answer, sort: await nextSort("faq"), status: "draft" }).returning({ id: s.faqs.id });
  await logActivity(actor, "faq.create", "faq", row!.id);
  return { ok: true, id: row!.id };
}

export async function saveTestimonial(input: TestimonialInput, actor: string): Promise<{ ok: true; id: string } | Fail> {
  const values = { quote: input.quote, authorName: input.authorName, authorRole: input.authorRole, avatarMediaId: input.avatarMediaId };
  if (input.id) {
    const done = await db.update(s.testimonials).set(values).where(eq(s.testimonials.id, input.id)).returning({ id: s.testimonials.id });
    if (!done.length) return { ok: false, error: "This testimonial no longer exists" };
    await logActivity(actor, "testimonial.update", "testimonial", input.id);
    return { ok: true, id: input.id };
  }
  const [row] = await db.insert(s.testimonials).values({ ...values, sort: await nextSort("testimonial"), status: "draft" }).returning({ id: s.testimonials.id });
  await logActivity(actor, "testimonial.create", "testimonial", row!.id);
  return { ok: true, id: row!.id };
}

export async function saveClient(input: ClientInput, actor: string): Promise<{ ok: true; id: string } | Fail> {
  const values = { name: input.name, kind: input.kind, logoMediaId: input.logoMediaId, url: input.url };
  if (input.id) {
    const done = await db.update(s.clientsPartners).set(values).where(eq(s.clientsPartners.id, input.id)).returning({ id: s.clientsPartners.id });
    if (!done.length) return { ok: false, error: "This entry no longer exists" };
    await logActivity(actor, "client.update", "client", input.id);
    return { ok: true, id: input.id };
  }
  const [row] = await db.insert(s.clientsPartners).values({ ...values, sort: await nextSort("client", input.kind), status: "draft" }).returning({ id: s.clientsPartners.id });
  await logActivity(actor, "client.create", "client", row!.id);
  return { ok: true, id: row!.id };
}

/** Publishing a client or testimonial means Idyllic has agreed to it being shown. Only owners and editors can do it. */
export async function setContentStatus(kind: ContentKind, id: string, status: Status, actor: string): Promise<{ ok: true } | Fail> {
  const t = table[kind];
  const done = await db.update(t).set({ status }).where(eq(t.id, id)).returning({ id: t.id });
  if (!done.length) return { ok: false, error: "This item no longer exists" };
  await logActivity(actor, `${kind}.${status === "published" ? "publish" : "unpublish"}`, kind, id);
  return { ok: true };
}

/** Swaps places with the neighbour above or below, then renumbers the group so order stays clean. */
export async function moveContent(kind: ContentKind, id: string, direction: "up" | "down", actor: string): Promise<{ ok: true } | Fail> {
  const t = table[kind];
  const [row] = await db.select().from(t).where(eq(t.id, id)).limit(1);
  if (!row) return { ok: false, error: "This item no longer exists" };
  const group = kind === "client" ? and(eq(s.clientsPartners.kind, (row as typeof s.clientsPartners.$inferSelect).kind)) : undefined;
  const items = await db.select({ id: t.id }).from(t).where(group).orderBy(asc(t.sort));
  const index = items.findIndex((i) => i.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return { ok: true };
  const ids = items.map((i) => i.id);
  [ids[index], ids[target]] = [ids[target]!, ids[index]!];
  await db.transaction(async (tx) => {
    for (const [sort, itemId] of ids.entries()) await tx.update(t).set({ sort: sort + 1 }).where(eq(t.id, itemId));
  });
  await logActivity(actor, `${kind}.reorder`, kind, id);
  return { ok: true };
}

export async function deleteContent(kind: ContentKind, id: string, actor: string): Promise<{ ok: true } | Fail> {
  const t = table[kind];
  const done = await db.delete(t).where(eq(t.id, id)).returning({ id: t.id });
  if (!done.length) return { ok: false, error: "This item no longer exists" };
  await logActivity(actor, `${kind}.delete`, kind, id);
  return { ok: true };
}

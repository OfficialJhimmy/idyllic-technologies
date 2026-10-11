import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import { postStatusCounts } from "@/db/queries/blog";
import { statusCounts } from "@/db/queries/catalogue";
import { enquiryStatusCounts } from "@/db/queries/enquiries";
import { describeActivity, type ActivityText } from "@/lib/activity-text";
import { supabaseAdmin } from "@/lib/supabase/server";

const s = schema;

export type DashboardEnquiry = { id: string; name: string; type: "contact" | "quote" | "assistant"; message: string | null; createdAt: string };
export type DashboardActivity = ActivityText & { id: string; who: string | null; mine: boolean; at: string };

/** For each kind of record the log can point at: where its readable name lives. */
const nameSources: Record<string, [PgTable, AnyPgColumn, AnyPgColumn]> = {
  product: [s.products, s.products.id, s.products.name],
  brand: [s.brands, s.brands.id, s.brands.name],
  category: [s.productCategories, s.productCategories.id, s.productCategories.name],
  spec_definition: [s.specDefinitions, s.specDefinitions.id, s.specDefinitions.label],
  media: [s.media, s.media.id, s.media.alt],
  post: [s.posts, s.posts.id, s.posts.title],
  post_category: [s.postCategories, s.postCategories.id, s.postCategories.name],
  tag: [s.tags, s.tags.id, s.tags.name],
  author: [s.authors, s.authors.id, s.authors.name],
  enquiry: [s.enquiries, s.enquiries.id, s.enquiries.name],
  faq: [s.faqs, s.faqs.id, s.faqs.question],
  testimonial: [s.testimonials, s.testimonials.id, s.testimonials.authorName],
  client: [s.clientsPartners, s.clientsPartners.id, s.clientsPartners.name],
};

async function namesFor(entity: string, ids: string[]): Promise<Map<string, string>> {
  const source = nameSources[entity];
  if (!source || ids.length === 0) return new Map();
  const [table, idCol, nameCol] = source;
  const rows = (await db.select({ id: idCol, name: nameCol }).from(table).where(inArray(idCol, ids))) as { id: string; name: string }[];
  return new Map(rows.map((r) => [r.id, r.name]));
}

/** Email addresses of the people who made the changes. A failure only means their names are left out. */
async function emailsFor(userIds: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  await Promise.all(
    userIds.map(async (id) => {
      try {
        const { data } = await supabaseAdmin().auth.admin.getUserById(id);
        if (data.user?.email) out.set(id, data.user.email);
      } catch {
        // Leave this person unnamed.
      }
    }),
  );
  return out;
}

export async function recentActivity(limit: number, currentUserId: string): Promise<DashboardActivity[]> {
  const rows = await db.select().from(s.activityLog).orderBy(desc(s.activityLog.createdAt)).limit(limit);
  const byEntity = new Map<string, string[]>();
  for (const r of rows) if (r.entityId) byEntity.set(r.entity, [...(byEntity.get(r.entity) ?? []), r.entityId]);

  const [names, emails] = await Promise.all([
    Promise.all([...byEntity].map(async ([entity, ids]) => [entity, await namesFor(entity, ids)] as const)),
    emailsFor([...new Set(rows.flatMap((r) => (r.userId && r.userId !== currentUserId ? [r.userId] : [])))]),
  ]);
  const nameMap = new Map(names);

  return rows.map((r) => {
    const name = r.entityId ? (nameMap.get(r.entity)?.get(r.entityId) ?? null) : null;
    return {
      id: r.id,
      ...describeActivity(r.action, r.entity, name),
      who: r.userId ? (emails.get(r.userId) ?? null) : null,
      mine: r.userId === currentUserId,
      at: r.createdAt.toISOString(),
    };
  });
}

export async function newestEnquiries(limit: number): Promise<DashboardEnquiry[]> {
  const rows = await db
    .select({ id: s.enquiries.id, name: s.enquiries.name, type: s.enquiries.type, message: s.enquiries.message, createdAt: s.enquiries.createdAt })
    .from(s.enquiries)
    .where(eq(s.enquiries.status, "new"))
    .orderBy(desc(s.enquiries.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function getDashboard(currentUserId: string) {
  const [products, posts, enquiries, newest, activity] = await Promise.all([statusCounts(), postStatusCounts(), enquiryStatusCounts(), newestEnquiries(5), recentActivity(10, currentUserId)]);
  return { products, posts, enquiries, newest, activity };
}

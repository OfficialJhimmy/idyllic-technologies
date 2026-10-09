import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

const s = schema;
const imageCols = { id: s.media.id, storagePath: s.media.storagePath, alt: s.media.alt, width: s.media.width, height: s.media.height };

export async function listFaqsAdmin() {
  return db.select().from(s.faqs).orderBy(asc(s.faqs.sort));
}

export async function listTestimonialsAdmin() {
  const rows = await db
    .select({ t: s.testimonials, avatar: imageCols })
    .from(s.testimonials)
    .leftJoin(s.media, eq(s.media.id, s.testimonials.avatarMediaId))
    .orderBy(asc(s.testimonials.sort));
  return rows.map((r) => ({ ...r.t, avatar: r.avatar?.storagePath ? r.avatar : null }));
}

export async function listClientsAdmin() {
  const rows = await db
    .select({ c: s.clientsPartners, logo: imageCols })
    .from(s.clientsPartners)
    .leftJoin(s.media, eq(s.media.id, s.clientsPartners.logoMediaId))
    .orderBy(asc(s.clientsPartners.kind), asc(s.clientsPartners.sort));
  return rows.map((r) => ({ ...r.c, logo: r.logo?.storagePath ? r.logo : null }));
}

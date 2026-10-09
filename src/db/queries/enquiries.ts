import "server-only";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import type { EnquiryStatus, EnquiryType } from "@/lib/enquiries/status";

const s = schema;
const count = sql<number>`count(*)::int`;
const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export type EnquiryListRow = {
  id: string;
  type: EnquiryType;
  status: EnquiryStatus;
  name: string;
  email: string;
  message: string | null;
  productName: string | null;
  createdAt: string;
};

export type EnquiryFilters = { q?: string; type?: EnquiryType; status?: EnquiryStatus; page: number; pageSize: number };

export async function listEnquiries(f: EnquiryFilters): Promise<{ rows: EnquiryListRow[]; total: number }> {
  const conditions: SQL[] = [];
  if (f.q) conditions.push(or(ilike(s.enquiries.name, likeTerm(f.q)), ilike(s.enquiries.email, likeTerm(f.q)), ilike(s.enquiries.message, likeTerm(f.q))) as SQL);
  if (f.type) conditions.push(eq(s.enquiries.type, f.type));
  if (f.status) conditions.push(eq(s.enquiries.status, f.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const [{ n: total } = { n: 0 }] = await db.select({ n: count }).from(s.enquiries).where(where);
  const rows = await db
    .select({
      id: s.enquiries.id,
      type: s.enquiries.type,
      status: s.enquiries.status,
      name: s.enquiries.name,
      email: s.enquiries.email,
      message: s.enquiries.message,
      createdAt: s.enquiries.createdAt,
      productName: s.products.name,
    })
    .from(s.enquiries)
    .leftJoin(s.products, eq(s.products.id, s.enquiries.productId))
    .where(where)
    .orderBy(desc(s.enquiries.createdAt))
    .limit(f.pageSize)
    .offset((f.page - 1) * f.pageSize);

  return { total, rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) };
}

export async function enquiryStatusCounts(): Promise<Record<EnquiryStatus, number>> {
  const rows = await db.select({ status: s.enquiries.status, n: count }).from(s.enquiries).groupBy(s.enquiries.status);
  const out: Record<EnquiryStatus, number> = { new: 0, read: 0, replied: 0, closed: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export async function getEnquiry(id: string) {
  const [row] = await db
    .select({
      id: s.enquiries.id,
      type: s.enquiries.type,
      status: s.enquiries.status,
      name: s.enquiries.name,
      email: s.enquiries.email,
      phone: s.enquiries.phone,
      message: s.enquiries.message,
      payload: s.enquiries.payload,
      createdAt: s.enquiries.createdAt,
      productId: s.enquiries.productId,
      productName: s.products.name,
    })
    .from(s.enquiries)
    .leftJoin(s.products, eq(s.products.id, s.enquiries.productId))
    .where(eq(s.enquiries.id, id))
    .limit(1);
  return row ? { ...row, createdAt: row.createdAt.toISOString() } : null;
}

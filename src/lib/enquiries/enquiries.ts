import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import { canChangeStatus, statusOnOpen, type EnquiryStatus } from "@/lib/enquiries/status";

export async function updateEnquiryStatus(id: string, to: EnquiryStatus, actorId: string): Promise<{ ok: true; status: EnquiryStatus } | { ok: false; error: string }> {
  const [row] = await db.select({ status: schema.enquiries.status }).from(schema.enquiries).where(eq(schema.enquiries.id, id)).limit(1);
  if (!row) return { ok: false, error: "This enquiry no longer exists" };
  if (!canChangeStatus(row.status, to)) return { ok: true, status: to };
  await db.update(schema.enquiries).set({ status: to }).where(eq(schema.enquiries.id, id));
  await logActivity(actorId, `enquiry.${to}`, "enquiry", id);
  return { ok: true, status: to };
}

/** Called when staff open an enquiry. A new one becomes read, anything else is left alone. */
export async function markEnquiryOpened(id: string, actorId: string): Promise<EnquiryStatus | null> {
  const [row] = await db.select({ status: schema.enquiries.status }).from(schema.enquiries).where(eq(schema.enquiries.id, id)).limit(1);
  if (!row) return null;
  const next = statusOnOpen(row.status);
  if (next !== row.status) {
    await db.update(schema.enquiries).set({ status: next }).where(eq(schema.enquiries.id, id));
    await logActivity(actorId, "enquiry.read", "enquiry", id);
  }
  return next;
}

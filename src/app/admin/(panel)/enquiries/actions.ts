"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { idSchema } from "@/lib/catalogue/schemas";
import { markEnquiryOpened, updateEnquiryStatus } from "@/lib/enquiries/enquiries";
import { enquiryStatuses, type EnquiryStatus } from "@/lib/enquiries/status";

export async function setEnquiryStatusAction(id: string, status: string): Promise<{ ok: true; status: EnquiryStatus } | { ok: false; error: string }> {
  const session = await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = z.enum(enquiryStatuses).safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { ok: false, error: "Invalid request" };
  return updateEnquiryStatus(parsedId.data, parsedStatus.data, session.userId);
}

/** Opening a new enquiry marks it read. Called once when the detail page is shown. */
export async function markEnquiryOpenedAction(id: string): Promise<EnquiryStatus | null> {
  const session = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return markEnquiryOpened(parsed.data, session.userId);
}

import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getProductsByIds } from "@/db/queries/shop";
import { hashIp } from "@/lib/contact/rate-limit";
import { BOOKING_RATE, isBookingRateLimited } from "@/lib/marketplace/booking-rules";
import { BOOKING_LIST_MAX } from "@/lib/marketplace/list-logic";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const bookingInputSchema = z
  .object({
    productIds: z.array(z.uuid()).max(BOOKING_LIST_MAX),
    /** The booking list page counts as "page". The assistant sends its own requirements summary. */
    source: z.enum(["page", "compare", "assistant"]),
    summary: z.string().trim().max(1000).optional(),
  })
  // Only the assistant may book with no product, when its data was missing and it hands over the requirements instead.
  .refine((v) => v.productIds.length > 0 || (v.source === "assistant" && !!v.summary), { message: "Choose at least one product" });
export type BookingInput = z.infer<typeof bookingInputSchema>;

export type BookingResult = { ok: true; url: string; logged: boolean; count: number } | { ok: false; reason: "no-products" };

/**
 * Logs a booking intent, then returns the wa.me link. The names and addresses in the message come from
 * the database, never from the browser, and only published products are included.
 * The customer is never blocked: if the log is rate limited or the write fails, the link is still
 * returned (logged: false), because the booking itself happens on WhatsApp.
 */
export async function createBookingIntent(input: BookingInput, ip: string | null, shopOrigin?: string): Promise<BookingResult> {
  const unique = [...new Set(input.productIds)];
  const products = await getProductsByIds(unique);
  // Products that were asked for but are no longer published are not silently dropped into an empty booking.
  if (unique.length > 0 && products.length === 0) return { ok: false, reason: "no-products" };

  const note = input.summary ? `My requirements: ${input.summary}` : undefined;
  const url = buildWhatsAppLink(products.map((p) => ({ name: p.name.replace(/\s+/g, " "), slug: p.slug })), note, shopOrigin);
  const ipHash = ip ? hashIp(ip, process.env.REVALIDATE_SECRET ?? "dev-secret") : null;

  try {
    if (ipHash) {
      const since = new Date(Date.now() - BOOKING_RATE.windowMinutes * 60_000);
      const [{ n } = { n: 0 }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.bookingIntents).where(and(eq(schema.bookingIntents.ipHash, ipHash), gt(schema.bookingIntents.createdAt, since)));
      if (isBookingRateLimited(n)) return { ok: true, url, logged: false, count: products.length };
    }
    await db.insert(schema.bookingIntents).values({ productIds: products.map((p) => p.id), source: input.source, assistantSummary: input.summary ?? null, ipHash });
    return { ok: true, url, logged: true, count: products.length };
  } catch (error) {
    console.error("Could not log the booking intent", error);
    return { ok: true, url, logged: false, count: products.length };
  }
}

"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { HOME_LATEST_PAGE, getCompareData, getLatestProducts, getProductsByIds } from "@/db/queries/shop";
import { clientIp } from "@/lib/contact/rate-limit";
import { bookingInputSchema, createBookingIntent, type BookingResult } from "@/lib/marketplace/booking";
import { BOOKING_LIST_MAX } from "@/lib/marketplace/list-logic";
import { requestShopOrigin } from "@/lib/shop-origin.server";

const idsSchema = z.array(z.uuid()).max(BOOKING_LIST_MAX);

/** The products in a visitor's list, as they are now. Public: it only ever returns published products. */
export async function getListProductsAction(ids: unknown) {
  const parsed = idsSchema.safeParse(ids);
  return parsed.success ? getProductsByIds(parsed.data) : [];
}

export async function getCompareAction(ids: unknown) {
  const parsed = idsSchema.safeParse(ids);
  return getCompareData(parsed.success ? parsed.data.slice(0, 3) : []);
}

/** Logs the booking, then hands back the WhatsApp link for the browser to open. */
export async function bookOnWhatsAppAction(raw: unknown): Promise<BookingResult | { ok: false; reason: "invalid" }> {
  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  return createBookingIntent(parsed.data, clientIp(await headers()), await requestShopOrigin());
}

const offsetSchema = z.number().int().min(0).max(500);

/** The next batch of newest products for the "See more" button on the marketplace home. Published products only. */
export async function getLatestProductsAction(offset: unknown) {
  const parsed = offsetSchema.safeParse(offset);
  if (!parsed.success) return { ok: false as const };
  try {
    const { rows } = await getLatestProducts(parsed.data, HOME_LATEST_PAGE);
    return { ok: true as const, rows };
  } catch (error) {
    console.error("Could not load more products", error);
    return { ok: false as const };
  }
}

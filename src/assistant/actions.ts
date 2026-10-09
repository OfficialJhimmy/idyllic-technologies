"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { AUDIENCES, LOAD_BANDS, NEEDS, type Turn } from "@/assistant/engine";
import { summarizeAnswers } from "@/assistant/flows";
import { engine } from "@/assistant/server-engine";
import { clientIp } from "@/lib/contact/rate-limit";
import { createBookingIntent, type BookingResult } from "@/lib/marketplace/booking";
import { requestShopOrigin } from "@/lib/shop-origin.server";

// The browser sends the conversation state back, so it is checked like any other input.
const answersSchema = z.object({ audience: z.enum(AUDIENCES).optional(), need: z.enum(NEEDS).optional(), load: z.enum(LOAD_BANDS).optional() }).strict();
const stateSchema = z.object({ answers: answersSchema });
const inputSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("answer"), questionId: z.enum(["audience", "need", "load"]), optionId: z.string().max(40) }),
  z.object({ type: z.literal("compare"), productIds: z.array(z.uuid()).min(2).max(3) }),
  z.object({ type: z.literal("handoff") }),
]);

export type NextResult = { ok: true; turn: Turn } | { ok: false };

export async function assistantNextAction(rawState: unknown, rawInput: unknown): Promise<NextResult> {
  const state = stateSchema.safeParse(rawState);
  const input = inputSchema.safeParse(rawInput);
  if (!state.success || !input.success) return { ok: false };
  try {
    return { ok: true, turn: await engine.next(state.data, input.data) };
  } catch (error) {
    console.error("The assistant could not answer", error);
    return { ok: false };
  }
}

const bookSchema = z.object({ answers: answersSchema, productIds: z.array(z.uuid()).max(6) });

/**
 * Logs the booking with a requirements summary, then returns the WhatsApp link. The summary is rebuilt
 * here from the validated answers, so the browser cannot put its own text into a booking record.
 */
export async function assistantBookAction(raw: unknown): Promise<BookingResult | { ok: false; reason: "invalid" }> {
  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const summary = summarizeAnswers(parsed.data.answers);
  if (parsed.data.productIds.length === 0 && !summary) return { ok: false, reason: "invalid" };
  return createBookingIntent({ productIds: parsed.data.productIds, source: "assistant", summary: summary || undefined }, clientIp(await headers()), await requestShopOrigin());
}

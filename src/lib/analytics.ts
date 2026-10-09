/**
 * Vendor-neutral analytics. Components call track() only, never a vendor SDK.
 * GA4 is the first sink. track() never throws and does nothing on the server.
 */

export type AnalyticsEvents = {
  assistant_open: { host: "corporate" | "shop" };
  assistant_answer: { question_id: string; option_id: string };
  assistant_recommendation: { product_count: number };
  assistant_comparison: { product_count: number };
  assistant_handoff: { target: "product" | "marketplace" | "whatsapp" | "contact" };
  booking_whatsapp: { source: "page" | "compare" | "assistant"; product_count: number };
  compare_add: { product_slug: string };
  list_add: { product_slug: string };
  search: { query_length: number; result_count: number };
  admin_product_save: { status: "draft" | "published" | "archived"; ok: boolean };
  admin_media_upload: { ok: boolean };
  admin_post_save: { status: "draft" | "published" | "archived"; ok: boolean };
  contact_submit: { type: "contact" | "quote" | "assistant"; ok: boolean };
};

export type EventName = keyof AnalyticsEvents;

type Sink = <E extends EventName>(name: E, params: AnalyticsEvents[E]) => void;

type Gtag = (command: "event", name: string, params: Record<string, unknown>) => void;

const ga4Sink: Sink = (name, params) => {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", name, params);
};

const sinks: Sink[] = [ga4Sink];

export function track<E extends EventName>(name: E, params: AnalyticsEvents[E]): void {
  if (typeof window === "undefined") return;
  for (const sink of sinks) {
    try {
      sink(name, params);
    } catch {
      // Analytics must never break the page.
    }
  }
}

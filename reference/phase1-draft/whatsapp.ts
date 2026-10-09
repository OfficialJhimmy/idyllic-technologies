import { canonicalProductUrl } from "@/lib/hosts";

// TODO: Idyllic must confirm +2347037973666 is the WhatsApp number.
const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2347037973666";

export type BookingProduct = { name: string; slug: string };

/** Builds the wa.me link. One message lists every selected product. No prices. */
export function buildWhatsAppLink(products: BookingProduct[], note?: string): string {
  const lines = [
    products.length === 1
      ? "Hello Idyllic Technologies, I would like to book this product:"
      : "Hello Idyllic Technologies, I would like to book these products:",
    ...products.map((p, i) => `${i + 1}. ${p.name} ${canonicalProductUrl(p.slug)}`),
  ];
  if (note) lines.push("", note);
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

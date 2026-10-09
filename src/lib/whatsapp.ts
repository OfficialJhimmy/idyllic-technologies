import { SHOP_URL } from "@/lib/hosts";

// TODO: Idyllic must confirm +2347037973666 is the WhatsApp number.
const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2347037973666";

export type BookingProduct = { name: string; slug: string };

/** Builds the wa.me link. One message lists every selected product with its shop URL. No prices. */
export function buildWhatsAppLink(products: BookingProduct[], note?: string, shopOrigin: string = SHOP_URL): string {
  const lines =
    products.length === 0
      ? ["Hello Idyllic Technologies, I need help choosing a product."]
      : [
          products.length === 1
            ? "Hello Idyllic Technologies, I would like to book this product:"
            : "Hello Idyllic Technologies, I would like to book these products:",
          ...products.map((p, i) => `${i + 1}. ${p.name} ${shopOrigin}/product/${p.slug}`),
        ];
  if (note) lines.push("", note);
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

import "server-only";
import { headers } from "next/headers";
import { deriveShopOrigin, protocolFor } from "@/lib/shop-origin";
import { shopUrl } from "@/lib/seo";

/** The marketplace origin for the request being served, for links that leave the server, such as the WhatsApp message. */
export async function requestShopOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return deriveShopOrigin(host, protocolFor(host, h.get("x-forwarded-proto")), shopUrl());
}

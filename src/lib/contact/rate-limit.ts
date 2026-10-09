import { createHmac } from "node:crypto";

/** Limits chosen to stop floods and repeats without getting in a real customer's way. */
export const RATE_LIMITS = {
  perIp: { max: 5, windowMinutes: 60 },
  perEmail: { max: 3, windowMinutes: 15 },
} as const;

export function isOverLimit(count: number, max: number): boolean {
  return count >= max;
}

/** The first address in x-forwarded-for, which is the visitor. Falls back to x-real-ip. */
export function clientIp(headers: { get(name: string): string | null }): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || null;
}

/** A one way fingerprint of the address, so repeats can be counted without storing the address itself. */
export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

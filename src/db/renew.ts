/**
 * On Vercel a copy of the app is frozen between requests, sometimes for minutes. A database connection it was
 * holding can be dead by the time it wakes (the pooler dropped it, nothing told the sleeping copy), and the first
 * query sent down a dead connection can hang for minutes. So a connection that has sat unused for longer than this
 * is replaced before it is used. Pure, so it is tested.
 */
export const RENEW_AFTER_IDLE_MS = 4_000;

export function shouldRenew(lastUsedAt: number, now: number, onVercel: boolean): boolean {
  return onVercel && now - lastUsedAt > RENEW_AFTER_IDLE_MS;
}

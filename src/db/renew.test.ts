import { describe, expect, it } from "vitest";
import { RENEW_AFTER_IDLE_MS, shouldRenew } from "@/db/renew";

describe("shouldRenew", () => {
  it("keeps a connection that was used a moment ago", () => {
    expect(shouldRenew(1_000, 1_000 + RENEW_AFTER_IDLE_MS, true)).toBe(false);
    expect(shouldRenew(1_000, 1_500, true)).toBe(false);
  });
  it("replaces one that sat unused for longer, on Vercel", () => {
    expect(shouldRenew(1_000, 1_001 + RENEW_AFTER_IDLE_MS, true)).toBe(true);
    expect(shouldRenew(0, 10 * 60_000, true)).toBe(true);
  });
  it("never does so elsewhere", () => {
    expect(shouldRenew(0, 10 * 60_000, false)).toBe(false);
  });
});

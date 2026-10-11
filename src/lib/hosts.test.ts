import { describe, expect, it, vi } from "vitest";

describe("isShopHost", () => {
  it("recognises shop. addresses", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SHOP_URL", "");
    const { isShopHost } = await import("@/lib/hosts");
    expect(isShopHost("shop.localhost:3000")).toBe(true);
    expect(isShopHost("shop.idyllictechnologies.com")).toBe(true);
    expect(isShopHost("localhost:3000")).toBe(false);
    expect(isShopHost("idyllic-technologies.vercel.app")).toBe(false);
    expect(isShopHost(null)).toBe(false);
  });

  it("also recognises the address set in NEXT_PUBLIC_SHOP_URL", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SHOP_URL", "https://idyllic-shop.vercel.app");
    const { isShopHost } = await import("@/lib/hosts");
    expect(isShopHost("idyllic-shop.vercel.app")).toBe(true);
    expect(isShopHost("IDYLLIC-SHOP.vercel.app")).toBe(true);
    expect(isShopHost("idyllic-technologies.vercel.app")).toBe(false);
  });
});

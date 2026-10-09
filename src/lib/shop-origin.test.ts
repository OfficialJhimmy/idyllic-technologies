import { describe, expect, it } from "vitest";
import { deriveShopOrigin, deriveSiteOrigin, protocolFor } from "@/lib/shop-origin";

const live = "https://shop.idyllictechnologies.com";
const liveSite = "https://idyllictechnologies.com";

describe("deriveShopOrigin", () => {
  it("points localhost at shop.localhost on the same port", () => {
    expect(deriveShopOrigin("localhost:3000", "http:", live)).toBe("http://shop.localhost:3000");
  });
  it("points a deployed domain at its own shop subdomain, with or without www", () => {
    expect(deriveShopOrigin("idyllictechnologies.com", "https:", live)).toBe("https://shop.idyllictechnologies.com");
    expect(deriveShopOrigin("www.idyllictechnologies.com", "https:", live)).toBe("https://shop.idyllictechnologies.com");
    expect(deriveShopOrigin("new.example.com", "https:", live)).toBe("https://shop.new.example.com");
  });
  it("stays on the shop host when already there", () => {
    expect(deriveShopOrigin("shop.localhost:3000", "http:", live)).toBe("http://shop.localhost:3000");
  });
  it("falls back to the setting where a subdomain cannot exist", () => {
    expect(deriveShopOrigin("idyllic.vercel.app", "https:", live)).toBe(live);
    expect(deriveShopOrigin("192.168.1.20:3000", "http:", live)).toBe(live);
    expect(deriveShopOrigin("", "https:", live)).toBe(live);
  });
});

describe("deriveSiteOrigin", () => {
  it("removes the shop prefix", () => {
    expect(deriveSiteOrigin("shop.localhost:3000", "http:", liveSite)).toBe("http://localhost:3000");
    expect(deriveSiteOrigin("shop.idyllictechnologies.com", "https:", liveSite)).toBe("https://idyllictechnologies.com");
  });
  it("falls back where a subdomain cannot be worked out", () => {
    expect(deriveSiteOrigin("shop.idyllic.vercel.app", "https:", liveSite)).toBe(liveSite);
  });
});

describe("protocolFor", () => {
  it("uses http for local addresses and https otherwise, unless the proxy says", () => {
    expect(protocolFor("localhost:3000")).toBe("http:");
    expect(protocolFor("shop.localhost:3000")).toBe("http:");
    expect(protocolFor("idyllictechnologies.com")).toBe("https:");
    expect(protocolFor("localhost:3000", "https")).toBe("https:");
  });
});

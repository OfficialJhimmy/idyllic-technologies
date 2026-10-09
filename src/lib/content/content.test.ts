import { describe, expect, it } from "vitest";
import { clientInputSchema, faqInputSchema, testimonialInputSchema } from "./schemas";
import { parseSiteValue, contactSchema, statsSchema, workProcessSchema } from "@/lib/site-values";

describe("content schemas", () => {
  it("need the words that matter and trim the rest", () => {
    expect(faqInputSchema.safeParse({ id: null, question: " ", answer: "A" }).success).toBe(false);
    expect(faqInputSchema.parse({ id: null, question: " Q? ", answer: " A. " })).toMatchObject({ question: "Q?", answer: "A." });
    expect(testimonialInputSchema.safeParse({ id: null, quote: "x", authorName: "" }).success).toBe(false);
  });
  it("turn empty optional fields into null", () => {
    expect(testimonialInputSchema.parse({ id: null, quote: "q", authorName: "n", authorRole: "  " }).authorRole).toBeNull();
    expect(clientInputSchema.parse({ id: null, name: "Eaton", kind: "partner", url: "" }).url).toBeNull();
  });
  it("only allow web links and the two logo kinds", () => {
    expect(clientInputSchema.safeParse({ id: null, name: "x", kind: "partner", url: "javascript:alert(1)" }).success).toBe(false);
    expect(clientInputSchema.safeParse({ id: null, name: "x", kind: "supplier" }).success).toBe(false);
    expect(clientInputSchema.safeParse({ id: null, name: "x", kind: "client", url: "https://example.com" }).success).toBe(true);
  });
});

describe("site value parsing", () => {
  it("uses the stored value when it is valid", () => {
    expect(parseSiteValue(statsSchema, "home.stats", [{ display: "1+", label: "One" }])).toEqual([{ display: "1+", label: "One" }]);
  });
  it("falls back to the approved starting value when the stored one is missing or broken", () => {
    const stats = parseSiteValue(statsSchema, "home.stats", null);
    expect(stats.map((s) => s.display)).toEqual(["90+", "12k+", "72+", "20+"]);
    expect(parseSiteValue(workProcessSchema, "about.work_process", { nonsense: true }).map((w) => w.percent)).toEqual([85, 96, 74, 53]);
    expect(parseSiteValue(contactSchema, "contact.details", "oops").offices).toHaveLength(2);
  });
  it("keeps the source spelling of the work process label", () => {
    expect(parseSiteValue(workProcessSchema, "about.work_process", undefined).map((w) => w.label)).toContain("Planning & Stratergy");
  });
});

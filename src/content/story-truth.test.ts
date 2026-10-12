import { describe, expect, it } from "vitest";
import * as pages from "@/content/pages";
import { faqSeeds } from "@/content/faqs";
import { siteValueSeeds } from "@/content/site-values";
import { story } from "@/content/pages";

/** Every string in a value, however deeply it is nested. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

/**
 * The company story is the source of truth for who Idyllic is. These are claims it contradicts or does not
 * support (a global consultancy, figures about countries and consultants, "leading" superlatives in the
 * company's own voice). If one comes back in any seeded copy, this fails.
 */
const CONTRADICTED = [/global/i, /worldwide/i, /consult/i, /countries served/i, /accolades/i, /nigeria'?s leading/i, /nigeria leading/i, /alternative energy company/i];

describe("the story is the source of truth", () => {
  const copy = [...strings(pages), ...strings(faqSeeds), ...strings(siteValueSeeds)];

  it("keeps all seven paragraphs and the tagline", () => {
    expect(story.paragraphs).toHaveLength(7);
    expect(story.tagline).toBe("Powering Progress. Enabling Possibilities. Building a Sustainable Future.");
    expect(story.paragraphs[1]).toContain("2010");
  });

  it("has no seeded copy that the story contradicts", () => {
    for (const pattern of CONTRADICTED) {
      const hit = copy.find((text) => pattern.test(text));
      expect(hit, `${pattern} appears in: ${hit}`).toBeUndefined();
    }
  });

  it("names the brands the story names, in the brands answer", () => {
    const answer = faqSeeds.find((f) => f.question === "Which brands do you work with?")!.answer;
    for (const brand of ["Fullriver", "Eaton", "Solis", "Ecogreen", "BATTSYS"]) expect(answer).toContain(brand);
    expect(answer).not.toContain("Schneider");
  });

  it("uses no dashes in the story", () => {
    expect(strings(story).join(" ")).not.toMatch(/[\u2013\u2014]/);
  });
});

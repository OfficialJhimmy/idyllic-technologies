import { describe, expect, it } from "vitest";
import { draftToPayload, emptyDraft } from "./draft";
import { productInputSchema } from "./schemas";
import type { SpecDefinitionView } from "./types";

const cat = "11111111-1111-4111-8111-111111111111";
const otherCat = "22222222-2222-4222-8222-222222222222";
const specA = "33333333-3333-4333-8333-333333333333";
const specB = "44444444-4444-4444-8444-444444444444";
const media = { id: "55555555-5555-4555-8555-555555555555", storagePath: "images/a.webp", alt: "A", width: 1, height: 1 };

const def = (id: string, categoryId: string): SpecDefinitionView => ({
  id, categoryId, key: "k", label: "K", unit: null, valueType: "text", options: null, comparable: true, filterable: false, sort: 0,
});

describe("draftToPayload", () => {
  it("only sends specs of the chosen category and turns blanks into null", () => {
    const d = { ...emptyDraft(), name: "X", slug: "x", brandId: cat, categoryId: cat, specs: { [specA]: "", [specB]: "kept" } };
    const payload = draftToPayload(d, [def(specA, cat), def(specB, otherCat)]);
    expect(payload.specs).toEqual({ [specA]: null });
  });

  it("drops blank features and maps images, documents and related products", () => {
    const d = {
      ...emptyDraft(), name: "X", slug: "x", brandId: cat, categoryId: cat,
      features: ["  One ", "", "  "],
      images: [{ media, isPrimary: true }],
      documents: [{ label: "Sheet", url: "", storagePath: "documents/a.pdf" }, { label: "Site", url: " https://a.com ", storagePath: "" }],
      related: [{ id: specA, name: "R" }],
    };
    const p = draftToPayload(d, []);
    expect(p.features).toEqual(["One"]);
    expect(p.images).toEqual([{ mediaId: media.id, isPrimary: true }]);
    expect(p.documents).toEqual([
      { label: "Sheet", url: null, storagePath: "documents/a.pdf" },
      { label: "Site", url: "https://a.com", storagePath: null },
    ]);
    expect(p.relatedProductIds).toEqual([specA]);
  });

  it("produces something the server schema accepts", () => {
    const d = { ...emptyDraft(), name: "Eaton 9SX", slug: "eaton-9sx", brandId: cat, categoryId: cat, summary: "Online UPS" };
    expect(productInputSchema.safeParse(draftToPayload(d, [])).success).toBe(true);
  });

  it("never carries a price", () => {
    expect(Object.keys(draftToPayload(emptyDraft(), [])).some((k) => /price|cost|amount/i.test(k))).toBe(false);
  });
});

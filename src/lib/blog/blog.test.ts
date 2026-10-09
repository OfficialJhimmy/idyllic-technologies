import { describe, expect, it } from "vitest";
import { emptyPostDraft, fromLocalInput, postDraftToPayload, toLocalInput } from "./draft";
import { FUTURE_TOLERANCE_MS, isFutureDate, normaliseTagName, postPublishIssues, resolvePublishedAt } from "./publish";
import { authorInputSchema, postInputSchema, taxonomyInputSchema } from "./schemas";

const now = new Date("2026-10-07T10:00:00Z");
const ready = { title: "A post", slug: "a-post", body: "<p>Body text</p>", excerpt: "Short", authorId: "a" };
const uuid = "11111111-1111-4111-8111-111111111111";
const base = { id: null, title: "T", slug: "t", excerpt: "", body: "", featuredMediaId: null, categoryId: null, authorId: null, tags: [], publishedAt: null, seoTitle: "", seoDescription: "", ogImageMediaId: null };

describe("postPublishIssues", () => {
  it("is empty for a complete post", () => expect(postPublishIssues(ready)).toEqual([]));
  it("lists everything missing", () => {
    expect(postPublishIssues({ title: " ", slug: "Bad Slug", body: "  ", excerpt: null, authorId: null })).toHaveLength(5);
  });
  it("treats the editor's empty paragraph as no body", () => {
    expect(postPublishIssues({ ...ready, body: "<p></p>" })).toEqual(["Write the post body"]);
    expect(postPublishIssues({ ...ready, body: "<p>&nbsp;</p>" })).toEqual(["Write the post body"]);
  });
  it("does not require a category, tags or images", () => {
    expect(postPublishIssues(ready)).toEqual([]);
  });
});

describe("isFutureDate", () => {
  it("allows now, the past, and a few minutes of clock difference", () => {
    expect(isFutureDate(now, now)).toBe(false);
    expect(isFutureDate(new Date("2026-09-30T00:00:00Z"), now)).toBe(false);
    expect(isFutureDate(new Date(now.getTime() + FUTURE_TOLERANCE_MS - 1000), now)).toBe(false);
  });
  it("refuses a later date", () => {
    expect(isFutureDate(new Date(now.getTime() + FUTURE_TOLERANCE_MS + 1000), now)).toBe(true);
    expect(isFutureDate(new Date("2027-01-01T00:00:00Z"), now)).toBe(true);
  });
});

describe("resolvePublishedAt", () => {
  const earlier = new Date("2026-09-01T00:00:00Z");
  const chosen = new Date("2026-09-30T00:00:00Z");
  it("uses the date staff chose, so existing posts can be back-dated", () => {
    expect(resolvePublishedAt({ requested: chosen, existing: earlier, publishing: true, now })).toEqual(chosen);
  });
  it("keeps the stored date otherwise", () => {
    expect(resolvePublishedAt({ requested: null, existing: earlier, publishing: true, now })).toEqual(earlier);
  });
  it("uses now only when publishing with no date at all", () => {
    expect(resolvePublishedAt({ requested: null, existing: null, publishing: true, now })).toEqual(now);
    expect(resolvePublishedAt({ requested: null, existing: null, publishing: false, now })).toBeNull();
  });
});

describe("normaliseTagName", () => {
  it("tidies spaces and a leading hash", () => {
    expect(normaliseTagName("  #Solar   energy ")).toBe("Solar energy");
  });
  it("rejects empty and over long tags", () => {
    expect(normaliseTagName("   ")).toBeNull();
    expect(normaliseTagName("#")).toBeNull();
    expect(normaliseTagName("x".repeat(41))).toBeNull();
  });
});

describe("local date input helpers", () => {
  it("round trips through the datetime-local format", () => {
    const iso = "2026-09-30T08:15:00.000Z";
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
  });
  it("handles empty and invalid values", () => {
    expect(toLocalInput(null)).toBe("");
    expect(fromLocalInput("")).toBeNull();
    expect(fromLocalInput("not a date")).toBeNull();
  });
});

describe("schemas", () => {
  it("accepts a draft with only a title and slug", () => {
    expect(postInputSchema.safeParse(base).success).toBe(true);
  });
  it("turns empty optional text into null and ignores unknown fields", () => {
    const r = postInputSchema.parse({ ...base, excerpt: "  ", price: 5 });
    expect(r.excerpt).toBeNull();
    expect("price" in r).toBe(false);
  });
  it("rejects a bad slug, a bad date and too many tags", () => {
    expect(postInputSchema.safeParse({ ...base, slug: "Bad Slug" }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...base, publishedAt: "yesterday" }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...base, tags: Array.from({ length: 16 }, (_, i) => `t${i}`) }).success).toBe(false);
  });
  it("validates taxonomy and authors", () => {
    expect(taxonomyInputSchema.safeParse({ id: null, name: "General", slug: "general" }).success).toBe(true);
    expect(taxonomyInputSchema.safeParse({ id: null, name: "", slug: "general" }).success).toBe(false);
    expect(authorInputSchema.safeParse({ id: null, name: "Idyllic Team", slug: "idyllic-team", bio: "", avatarMediaId: uuid }).success).toBe(true);
  });
  it("accepts what the editor sends", () => {
    const d = { ...emptyPostDraft(), title: "T", slug: "t", publishedAtLocal: "2026-09-30T08:15" };
    expect(postInputSchema.safeParse(postDraftToPayload(d)).success).toBe(true);
  });
});

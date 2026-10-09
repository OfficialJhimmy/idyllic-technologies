import { describe, expect, it } from "vitest";
import { nextStatus, publishIssues, statusPatch, type PublishCandidate } from "./publish";

const ready: PublishCandidate = {
  name: "Eaton 9SX",
  slug: "eaton-9sx",
  brandId: "b",
  categoryId: "c",
  summary: "Online UPS",
  imageCount: 2,
  hasPrimaryImage: true,
};

describe("nextStatus", () => {
  it("allows the intended transitions", () => {
    expect(nextStatus("draft", "publish")).toBe("published");
    expect(nextStatus("published", "unpublish")).toBe("draft");
    expect(nextStatus("draft", "archive")).toBe("archived");
    expect(nextStatus("published", "archive")).toBe("archived");
    expect(nextStatus("archived", "restore")).toBe("draft");
  });
  it("blocks the rest", () => {
    expect(nextStatus("published", "publish")).toBeNull();
    expect(nextStatus("archived", "publish")).toBeNull();
    expect(nextStatus("draft", "unpublish")).toBeNull();
    expect(nextStatus("archived", "archive")).toBeNull();
    expect(nextStatus("draft", "restore")).toBeNull();
  });
});

describe("publishIssues", () => {
  it("is empty for a complete product", () => {
    expect(publishIssues(ready)).toEqual([]);
  });
  it("lists every missing piece", () => {
    const issues = publishIssues({ ...ready, name: " ", slug: "Bad Slug", brandId: null, categoryId: null, summary: "", imageCount: 0, hasPrimaryImage: false });
    expect(issues).toHaveLength(6);
  });
  it("asks for a primary image when there are images but none is primary", () => {
    expect(publishIssues({ ...ready, hasPrimaryImage: false })).toEqual(["Choose a primary image"]);
  });
});

describe("statusPatch", () => {
  const now = new Date("2026-10-06T10:00:00Z");
  const first = new Date("2026-09-01T09:00:00Z");

  it("sets publishedAt the first time a product is published", () => {
    expect(statusPatch("draft", "publish", null, now)).toEqual({ status: "published", publishedAt: now });
  });
  it("keeps the original publish date when republishing", () => {
    expect(statusPatch("draft", "publish", first, now)).toEqual({ status: "published", publishedAt: first });
  });
  it("keeps publishedAt when unpublishing or archiving", () => {
    expect(statusPatch("published", "unpublish", first, now)).toEqual({ status: "draft", publishedAt: first });
    expect(statusPatch("published", "archive", first, now)).toEqual({ status: "archived", publishedAt: first });
  });
  it("returns null for a blocked action", () => {
    expect(statusPatch("archived", "publish", null, now)).toBeNull();
  });
});

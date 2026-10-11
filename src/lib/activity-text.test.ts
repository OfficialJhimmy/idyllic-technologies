import { describe, expect, it } from "vitest";
import { describeActivity, timeAgo } from "@/lib/activity-text";

describe("describeActivity", () => {
  it("reads an action and an entity as a sentence", () => {
    expect(describeActivity("product.publish", "product", "Eaton 5E")).toEqual({ verb: "Published", noun: "product", name: "Eaton 5E" });
    expect(describeActivity("media.upload", "media", "Server hall")).toEqual({ verb: "Uploaded", noun: "image", name: "Server hall" });
    expect(describeActivity("enquiry.replied", "enquiry", "Ada").noun).toBe("enquiry from");
    expect(describeActivity("spec.create", "spec_definition", "Rating").noun).toBe("spec");
  });
  it("keeps a deleted record's name empty and copes with actions it does not know", () => {
    expect(describeActivity("brand.delete", "brand", null)).toEqual({ verb: "Deleted", noun: "brand", name: null });
    expect(describeActivity("widget.polish", "widget", null)).toEqual({ verb: "Changed", noun: "widget", name: null });
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-10-11T12:00:00Z");
  const ago = (s: number) => new Date(now.getTime() - s * 1000);
  it("gives plain relative times", () => {
    expect(timeAgo(ago(10), now)).toBe("just now");
    expect(timeAgo(ago(60), now)).toBe("1 minute ago");
    expect(timeAgo(ago(5 * 60), now)).toBe("5 minutes ago");
    expect(timeAgo(ago(2 * 3600), now)).toBe("2 hours ago");
    expect(timeAgo(ago(30 * 3600), now)).toBe("yesterday");
    expect(timeAgo(ago(4 * 86400), now)).toBe("4 days ago");
  });
  it("falls back to a date after a week, and never goes negative", () => {
    expect(timeAgo(ago(20 * 86400), now)).toMatch(/Sept|Sep/);
    expect(timeAgo(new Date(now.getTime() + 5000), now)).toBe("just now");
  });
});

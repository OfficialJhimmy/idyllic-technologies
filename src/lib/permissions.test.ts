import { describe, expect, it } from "vitest";
import { ROLE_LABEL, canAccess, isRole, type Section } from "@/lib/permissions";

const all: Section[] = ["dashboard", "activity", "products", "blog", "content", "media", "settings", "categories", "brands", "enquiries", "team"];

describe("permissions", () => {
  it("lets an admin into every section", () => {
    for (const s of all) expect(canAccess("owner", s)).toBe(true);
  });
  it("lets content staff into products, blog, content and media, and nothing that manages people or customers", () => {
    for (const s of ["dashboard", "activity", "products", "blog", "content", "media", "settings"] as const) expect(canAccess("editor", s)).toBe(true);
    for (const s of ["categories", "brands", "enquiries", "team"] as const) expect(canAccess("editor", s)).toBe(false);
  });
  it("names the roles for people", () => {
    expect(ROLE_LABEL).toEqual({ owner: "Admin", editor: "Content" });
    expect(isRole("owner") && isRole("editor")).toBe(true);
    expect(isRole("root")).toBe(false);
  });
});

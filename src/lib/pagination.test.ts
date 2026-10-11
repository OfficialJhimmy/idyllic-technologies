import { describe, expect, it } from "vitest";
import { pageItems, paginate, parsePage } from "@/lib/pagination";

describe("parsePage", () => {
  it("accepts whole numbers from 1 and falls back to 1", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(["2", "5"])).toBe(2);
    for (const bad of [undefined, "", "0", "-1", "1.5", "abc", "NaN"]) expect(parsePage(bad)).toBe(1);
  });
});

describe("paginate", () => {
  const list = Array.from({ length: 45 }, (_, i) => i + 1);
  it("slices a page and counts the pages", () => {
    const p = paginate(list, 2, 20);
    expect(p.rows[0]).toBe(21);
    expect(p.rows).toHaveLength(20);
    expect(p).toMatchObject({ page: 2, pages: 3, total: 45 });
  });
  it("keeps the page within range and handles an empty list", () => {
    expect(paginate(list, 99, 20).page).toBe(3);
    expect(paginate(list, 99, 20).rows).toHaveLength(5);
    expect(paginate([], 4, 20)).toEqual({ rows: [], page: 1, pages: 1, total: 0 });
  });
});

describe("pageItems", () => {
  it("shows every number when there are few", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("shows first, last and the neighbours with gaps", () => {
    expect(pageItems(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 4, "gap", 12]);
    expect(pageItems(12, 12)).toEqual([1, "gap", 9, 10, 11, 12]);
  });
  it("fills a gap of one number instead of showing a gap", () => {
    expect(pageItems(5, 12)).toEqual([1, "gap", 4, 5, 6, "gap", 12]);
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, "gap", 12]);
  });
  it("never repeats or goes out of range", () => {
    for (let pages = 1; pages <= 30; pages++) for (let page = 1; page <= pages; page++) {
      const nums = pageItems(page, pages).filter((x): x is number => x !== "gap");
      expect(new Set(nums).size).toBe(nums.length);
      expect(nums.every((n) => n >= 1 && n <= pages)).toBe(true);
      expect(nums).toContain(page);
      expect(pageItems(page, pages).length).toBeLessThanOrEqual(7);
    }
  });
});

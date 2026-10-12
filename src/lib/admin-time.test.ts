import { describe, expect, it } from "vitest";
import { clockTime, dayLabel, groupByDay, shortDate } from "@/lib/admin-time";

describe("admin time (Lagos, UTC+1)", () => {
  it("shows the clock in Lagos", () => {
    expect(clockTime(new Date("2026-10-11T08:22:00Z"))).toBe("9:22 am");
    expect(clockTime(new Date("2026-10-11T23:05:00Z"))).toBe("12:05 am");
    expect(clockTime(new Date("2026-10-11T12:30:00Z"))).toBe("1:30 pm");
  });
  it("formats a short date", () => {
    expect(shortDate(new Date("2026-10-11T08:22:00Z"))).toBe("11 Oct 2026");
  });
  it("labels days relative to now, in Lagos time", () => {
    const now = new Date("2026-10-11T10:00:00Z");
    expect(dayLabel(new Date("2026-10-11T07:00:00Z"), now)).toBe("Today");
    expect(dayLabel(new Date("2026-10-10T12:00:00Z"), now)).toBe("Yesterday");
    expect(dayLabel(new Date("2026-10-06T12:00:00Z"), now)).toBe("Tuesday 6 October");
    expect(dayLabel(new Date("2025-12-24T12:00:00Z"), now)).toContain("2025");
    // 11:30 pm UTC is already the next day in Lagos.
    expect(dayLabel(new Date("2026-10-10T23:30:00Z"), now)).toBe("Today");
  });
  it("groups neighbouring items by day", () => {
    const at = (s: string) => ({ at: new Date(s) });
    const groups = groupByDay([at("2026-10-11T09:00:00Z"), at("2026-10-11T07:00:00Z"), at("2026-10-10T09:00:00Z")], (x) => x.at);
    expect(groups.map((g) => g.items.length)).toEqual([2, 1]);
  });
});

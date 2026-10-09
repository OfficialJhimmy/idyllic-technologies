import { describe, expect, it } from "vitest";
import { addDays, addMonths, clampToNow, isSameDay, monthGrid, partOfDay, to12Hour, to24Hour, withDate, withTime } from "./date-picker";

describe("monthGrid", () => {
  it("always returns whole weeks, Monday first", () => {
    for (let m = 0; m < 12; m++) {
      const grid = monthGrid(2026, m);
      expect(grid.every((w) => w.length === 7)).toBe(true);
      expect(grid[0]![0]!.date.getDay()).toBe(1);
    }
  });
  it("places October 2026 correctly (1 October is a Thursday)", () => {
    const grid = monthGrid(2026, 9);
    const first = grid[0]!;
    expect(first.map((d) => d.inMonth)).toEqual([false, false, false, true, true, true, true]);
    expect(first[3]!.date.getDate()).toBe(1);
    expect(grid.flat().filter((d) => d.inMonth)).toHaveLength(31);
  });
  it("handles a February in a leap year and a month that starts on Monday", () => {
    expect(monthGrid(2028, 1).flat().filter((d) => d.inMonth)).toHaveLength(29);
    expect(monthGrid(2026, 5)[0]![0]!.inMonth).toBe(true); // 1 June 2026 is a Monday
  });
});

describe("date arithmetic", () => {
  it("moves by days across month and year ends", () => {
    expect(addDays(new Date(2026, 11, 31), 1).getFullYear()).toBe(2027);
    expect(isSameDay(addDays(new Date(2026, 2, 1), -1), new Date(2026, 1, 28))).toBe(true);
  });
  it("keeps the day of month inside shorter months", () => {
    const r = addMonths(new Date(2026, 0, 31), 1);
    expect([r.getMonth(), r.getDate()]).toEqual([1, 28]);
  });
});

describe("12 hour conversion", () => {
  it("round trips every hour", () => {
    for (let h = 0; h < 24; h++) {
      const { hour, pm } = to12Hour(h);
      expect(to24Hour(hour, pm)).toBe(h);
    }
  });
  it("handles midnight and noon", () => {
    expect(to12Hour(0)).toEqual({ hour: 12, pm: false });
    expect(to12Hour(12)).toEqual({ hour: 12, pm: true });
    expect(to24Hour(12, false)).toBe(0);
    expect(to24Hour(12, true)).toBe(12);
  });
});

describe("clampToNow", () => {
  const now = new Date(2026, 9, 7, 10, 30);
  it("never returns a later moment", () => {
    expect(clampToNow(new Date(2026, 9, 7, 11, 0), now).getTime()).toBe(now.getTime());
    expect(clampToNow(new Date(2027, 0, 1), now).getTime()).toBe(now.getTime());
  });
  it("leaves earlier moments alone", () => {
    const earlier = new Date(2026, 8, 30, 9, 0);
    expect(clampToNow(earlier, now)).toBe(earlier);
  });
});

describe("withTime and withDate", () => {
  it("change one part and keep the other", () => {
    const d = new Date(2026, 8, 30, 9, 15);
    expect(withTime(d, 14, 40).getDate()).toBe(30);
    expect(withTime(d, 14, 40).getHours()).toBe(14);
    expect(withDate(d, new Date(2026, 9, 2)).getHours()).toBe(9);
    expect(withDate(d, new Date(2026, 9, 2)).getDate()).toBe(2);
  });
});

describe("partOfDay", () => {
  it("names the part of the day", () => {
    expect([6, 12, 17, 22, 3].map(partOfDay)).toEqual(["morning", "afternoon", "evening", "night", "night"]);
  });
});

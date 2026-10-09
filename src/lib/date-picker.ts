/** Calendar and time maths for the date and time picker. Pure, so it can be tested without a browser. */

export type Day = { date: Date; inMonth: boolean };

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
export const addMonths = (d: Date, n: number) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last), d.getHours(), d.getMinutes());
};

/** Weeks of a month, Monday first, padded with days of the neighbouring months. Always whole weeks. */
export function monthGrid(year: number, month: number): Day[][] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((offset + daysInMonth) / 7) * 7;
  const weeks: Day[][] = [];
  for (let i = 0; i < total; i += 7) {
    weeks.push(
      Array.from({ length: 7 }, (_, j) => {
        const date = new Date(year, month, 1 - offset + i + j);
        return { date, inMonth: date.getMonth() === month };
      }),
    );
  }
  return weeks;
}

/** A moment later than `now` cannot be chosen (posts cannot be scheduled), so it is pulled back to now. */
export function clampToNow(date: Date, now: Date): Date {
  return date.getTime() > now.getTime() ? new Date(now.getTime()) : date;
}

export const to12Hour = (hour24: number) => ({ hour: hour24 % 12 === 0 ? 12 : hour24 % 12, pm: hour24 >= 12 });
export const to24Hour = (hour12: number, pm: boolean) => (hour12 % 12) + (pm ? 12 : 0);

/** The same day with a new time of day. */
export const withTime = (date: Date, hour24: number, minute: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour24, minute);

/** The same time of day on another date. */
export const withDate = (time: Date, day: Date) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes());

export type PartOfDay = "morning" | "afternoon" | "evening" | "night";
export function partOfDay(hour24: number): PartOfDay {
  if (hour24 >= 5 && hour24 < 12) return "morning";
  if (hour24 >= 12 && hour24 < 17) return "afternoon";
  if (hour24 >= 17 && hour24 < 21) return "evening";
  return "night";
}

export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

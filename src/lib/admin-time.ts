/** How the admin shows dates and times. The team is in Lagos, so that is the clock used wherever the server renders them. */

export const ADMIN_TIME_ZONE = "Africa/Lagos";

const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: ADMIN_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

/** "9:22 am" */
export function clockTime(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: ADMIN_TIME_ZONE, hour: "numeric", minute: "2-digit", hour12: true }).format(d).replace(/\s?([ap])m/i, (_, x: string) => ` ${x.toLowerCase()}m`);
}

/** "11 Oct 2026" */
export function shortDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: ADMIN_TIME_ZONE, day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** "Today", "Yesterday", or "Saturday 11 October". Used as the heading of a day in a timeline. */
export function dayLabel(d: Date, now: Date = new Date()): string {
  const key = dayKey(d);
  if (key === dayKey(now)) return "Today";
  if (key === dayKey(new Date(now.getTime() - 86_400_000))) return "Yesterday";
  const sameYear = key.slice(0, 4) === dayKey(now).slice(0, 4);
  return new Intl.DateTimeFormat("en-GB", { timeZone: ADMIN_TIME_ZONE, weekday: "long", day: "numeric", month: "long", ...(sameYear ? {} : { year: "numeric" }) }).format(d);
}

/** The calendar day in Lagos, for grouping. */
export const dayOf = (d: Date) => dayKey(d);

/** Items in the order given, grouped by calendar day. */
export function groupByDay<T>(items: T[], at: (item: T) => Date): { key: string; date: Date; items: T[] }[] {
  const groups: { key: string; date: Date; items: T[] }[] = [];
  for (const item of items) {
    const date = at(item);
    const key = dayKey(date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, date, items: [item] });
  }
  return groups;
}

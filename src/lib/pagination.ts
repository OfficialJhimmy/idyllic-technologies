/** Small helpers shared by every paged list. Pure, so they are tested. */

/** A page number from the address. Anything that is not a whole number of 1 or more becomes 1. */
export function parsePage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export type Paged<T> = { rows: T[]; page: number; pages: number; total: number };

/** Pages a list that is already in memory (the lists in the admin that stay small). The page is kept within range. */
export function paginate<T>(all: T[], page: number, pageSize: number): Paged<T> {
  const pages = Math.max(1, Math.ceil(all.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  return { rows: all.slice((current - 1) * pageSize, current * pageSize), page: current, pages, total: all.length };
}

export type PageItem = number | "gap";

/**
 * The numbers to show: always the first and last page, the current page with one on each side, and a gap
 * where numbers are skipped. At most seven entries, so it fits a phone: 1 … 4 5 6 … 12.
 */
export function pageItems(page: number, pages: number): PageItem[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page - 1, page, page + 1]);
  // Near an end, show a longer run so the row keeps a steady width.
  if (page <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (page >= pages - 2) [pages - 3, pages - 2, pages - 1].forEach((n) => keep.add(n));
  const sorted = [...keep].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((n, i) => {
    const before = sorted[i - 1];
    if (before !== undefined && n - before > 1) items.push(n - before === 2 ? n - 1 : "gap");
    items.push(n);
  });
  return items;
}

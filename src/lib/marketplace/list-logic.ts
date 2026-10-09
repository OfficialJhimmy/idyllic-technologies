import { z } from "zod";

/** What is remembered about a product in the booking list or compare list. Only for showing it quickly: names and pictures are refreshed from the database. */
export const listItemSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  brand: z.string().max(120),
  categorySlug: z.string().max(80),
  imagePath: z.string().max(500).nullable(),
  imageAlt: z.string().max(300).nullable(),
});
export type ListItem = z.infer<typeof listItemSchema>;

export const BOOKING_LIST_MAX = 20;
export const COMPARE_MAX = 3;

export type AddBlocked = "full" | "other-category" | null;

/** Parses what is in localStorage. Anything damaged is dropped, so a bad value can never break the page. */
export function parseStoredList(raw: string | null, max: number): ListItem[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  const items: ListItem[] = [];
  for (const entry of data) {
    const parsed = listItemSchema.safeParse(entry);
    if (parsed.success && !seen.has(parsed.data.id)) {
      seen.add(parsed.data.id);
      items.push(parsed.data);
    }
    if (items.length >= max) break;
  }
  return items;
}

export const hasItem = (list: ListItem[], id: string) => list.some((i) => i.id === id);

/** Why a product cannot be added, or null if it can. Compare only works inside one category. */
export function addBlocked(list: ListItem[], item: ListItem, max: number, sameCategoryOnly: boolean): AddBlocked {
  if (hasItem(list, item.id)) return null;
  if (list.length >= max) return "full";
  if (sameCategoryOnly && list.length > 0 && list[0]!.categorySlug !== item.categorySlug) return "other-category";
  return null;
}

export function addItem(list: ListItem[], item: ListItem, max: number, sameCategoryOnly: boolean): { list: ListItem[]; blocked: AddBlocked } {
  if (hasItem(list, item.id)) return { list, blocked: null };
  const blocked = addBlocked(list, item, max, sameCategoryOnly);
  return blocked ? { list, blocked } : { list: [...list, item], blocked: null };
}

export const removeItem = (list: ListItem[], id: string) => list.filter((i) => i.id !== id);

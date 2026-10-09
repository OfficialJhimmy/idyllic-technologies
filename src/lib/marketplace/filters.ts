/**
 * Filters live in the address, so a filtered page can be shared and works without JavaScript.
 * Only fields the category really offers as filterable are accepted: anything else in the address is ignored.
 *
 *   brand=eaton&brand=fullriver     brands
 *   s.topology=Online               values of a text, list or yes/no spec (repeat to allow several)
 *   min.voltage=6&max.voltage=12    range of a number spec
 *   sort=newest|name                order
 */

export type FilterableSpec = { key: string; label: string; unit: string | null; valueType: "number" | "text" | "enum" | "boolean" };

export type SpecFilter = { key: string; values?: string[]; min?: number; max?: number };
export type Filters = { brands: string[]; specs: SpecFilter[]; sort: "newest" | "name"; page: number };

type Params = Record<string, string | string[] | undefined>;

const all = (v: string | string[] | undefined): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const num = (v: string | string[] | undefined): number | undefined => {
  const s = Array.isArray(v) ? v[0] : v;
  if (s === undefined || s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export function parseFilters(params: Params, specs: FilterableSpec[], brandSlugs: string[]): Filters {
  const brands = [...new Set(all(params.brand))].filter((b) => brandSlugs.includes(b));
  const out: SpecFilter[] = [];
  for (const spec of specs) {
    if (spec.valueType === "number") {
      const min = num(params[`min.${spec.key}`]);
      const max = num(params[`max.${spec.key}`]);
      if (min !== undefined || max !== undefined) out.push({ key: spec.key, min, max });
    } else {
      const values = [...new Set(all(params[`s.${spec.key}`]).map((v) => v.trim()).filter(Boolean))].slice(0, 20);
      if (values.length) out.push({ key: spec.key, values });
    }
  }
  const page = Math.max(1, Number.parseInt(String(all(params.page)[0] ?? "1"), 10) || 1);
  return { brands, specs: out, sort: all(params.sort)[0] === "name" ? "name" : "newest", page };
}

/** The address query for a set of filters, used for links that add or remove one choice. */
export function toQuery(f: Filters, extra: Record<string, string | undefined> = {}): string {
  const q = new URLSearchParams();
  for (const b of f.brands) q.append("brand", b);
  for (const s of f.specs) {
    for (const v of s.values ?? []) q.append(`s.${s.key}`, v);
    if (s.min !== undefined) q.set(`min.${s.key}`, String(s.min));
    if (s.max !== undefined) q.set(`max.${s.key}`, String(s.max));
  }
  if (f.sort !== "newest") q.set("sort", f.sort);
  for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const withoutBrand = (f: Filters, slug: string): Filters => ({ ...f, page: 1, brands: f.brands.filter((b) => b !== slug) });
export const withoutSpecValue = (f: Filters, key: string, value: string): Filters => ({
  ...f,
  page: 1,
  specs: f.specs.map((s) => (s.key === key ? { ...s, values: s.values?.filter((v) => v !== value) } : s)).filter((s) => s.values === undefined || s.values.length > 0),
});
export const withoutRange = (f: Filters, key: string): Filters => ({ ...f, page: 1, specs: f.specs.filter((s) => !(s.key === key && s.values === undefined)) });
export const activeCount = (f: Filters) => f.brands.length + f.specs.reduce((n, s) => n + (s.values?.length ?? (s.min !== undefined || s.max !== undefined ? 1 : 0)), 0);

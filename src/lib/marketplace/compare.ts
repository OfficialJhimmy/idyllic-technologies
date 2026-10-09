/**
 * The comparison table. A row is only shown when the field is marked comparable AND every product in
 * the set has a value for it, so the table never has a gap and never guesses. Fields that only some
 * products have are reported separately, so the page can say why they are not shown.
 */

export type ComparableProduct = { id: string; specs: Record<string, string> };
export type ComparableSpec = { id: string; label: string; comparable: boolean; sort: number };

export type ComparisonRow = { id: string; label: string; values: string[]; differs: boolean };
export type Comparison = { rows: ComparisonRow[]; partial: string[] };

export function buildComparison(products: ComparableProduct[], defs: ComparableSpec[]): Comparison {
  if (products.length === 0) return { rows: [], partial: [] };
  const rows: ComparisonRow[] = [];
  const partial: string[] = [];
  for (const def of [...defs].sort((a, b) => a.sort - b.sort)) {
    if (!def.comparable) continue;
    const values = products.map((p) => p.specs[def.id]);
    const have = values.filter((v) => v !== undefined && v !== "");
    if (have.length === products.length) {
      const strings = values as string[];
      rows.push({ id: def.id, label: def.label, values: strings, differs: new Set(strings).size > 1 });
    } else if (have.length > 0) {
      partial.push(def.label);
    }
  }
  return { rows, partial };
}

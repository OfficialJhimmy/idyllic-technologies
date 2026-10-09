import type { ComparisonSource, ComparisonTurnRow } from "@/assistant/engine/types";
import { buildComparison } from "@/lib/marketplace/compare";

export type AssistantComparison = { rows: ComparisonTurnRow[]; notes: string[]; usable: boolean };

/**
 * Compares up to three products from one category using the same rule as the marketplace compare page:
 * a row only appears when the field is comparable and every product has a value for it.
 */
export function compareProducts(source: ComparisonSource): AssistantComparison {
  if (source.products.length < 2) {
    return { rows: [], notes: ["I need at least two available products to compare."], usable: false };
  }
  const { rows, partial } = buildComparison(source.products.map((p) => ({ id: p.id, specs: p.specs })), source.defs);
  const notes: string[] = [];
  if (rows.length === 0) notes.push("These products have no details in common to compare yet.");
  if (partial.length > 0) notes.push(`Not shown because not every product lists it: ${partial.join(", ")}.`);
  return { rows, notes, usable: rows.length > 0 };
}

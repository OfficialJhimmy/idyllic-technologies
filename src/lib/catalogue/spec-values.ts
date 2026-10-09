/**
 * Typed spec values. A spec definition has a value type (number, text, enum, boolean) and
 * product_spec_values stores either text_value or numeric_value. This module is the only place
 * that converts between what staff type and what is stored.
 */

export type SpecValueType = "number" | "text" | "enum" | "boolean";

export type SpecDefinitionLike = {
  valueType: SpecValueType;
  unit: string | null;
  options: string[] | null;
};

/** What the database holds. Exactly one field is set. */
export type StoredSpecValue = { textValue: string | null; numericValue: string | null };

export type ParseResult =
  | { ok: true; value: StoredSpecValue | null }
  | { ok: false; error: string };

export const TEXT_SPEC_MAX = 500;

const PLAIN_NUMBER = /^-?\d+(?:\.\d+)?$/;
const GROUPED_NUMBER = /^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;

/** Turns raw form input into a stored value. Empty input means "no value" and stores nothing. */
export function parseSpecValue(def: SpecDefinitionLike, raw: string | boolean | null | undefined): ParseResult {
  if (raw === null || raw === undefined) return { ok: true, value: null };

  if (def.valueType === "boolean") {
    if (raw === true || raw === "true") return { ok: true, value: { textValue: "true", numericValue: null } };
    if (raw === false || raw === "false") return { ok: true, value: { textValue: "false", numericValue: null } };
    if (raw === "") return { ok: true, value: null };
    return { ok: false, error: "Choose yes or no" };
  }

  const text = String(raw).trim();
  if (text === "") return { ok: true, value: null };

  switch (def.valueType) {
    case "number": {
      if (!PLAIN_NUMBER.test(text) && !GROUPED_NUMBER.test(text)) {
        return { ok: false, error: "Enter a number, for example 12 or 12.5" };
      }
      const n = Number(text.replace(/,/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: "Enter a number, for example 12 or 12.5" };
      return { ok: true, value: { textValue: null, numericValue: normaliseNumber(text.replace(/,/g, "")) } };
    }
    case "enum": {
      const options = def.options ?? [];
      if (!options.includes(text)) return { ok: false, error: "Choose one of the listed options" };
      return { ok: true, value: { textValue: text, numericValue: null } };
    }
    case "text": {
      if (text.length > TEXT_SPEC_MAX) return { ok: false, error: `Keep this under ${TEXT_SPEC_MAX} characters` };
      return { ok: true, value: { textValue: text, numericValue: null } };
    }
  }
}

/** Strips leading and trailing zeros so 012.50 and 12.5 are stored the same way. */
function normaliseNumber(text: string): string {
  const negative = text.startsWith("-");
  const [intPart = "0", fracPart = ""] = text.replace("-", "").split(".");
  const int = intPart.replace(/^0+(?=\d)/, "");
  const frac = fracPart.replace(/0+$/, "");
  const body = frac ? `${int}.${frac}` : int;
  return negative && body !== "0" ? `-${body}` : body;
}

/** Value as shown on a product page or in the editor, with its unit. Null when nothing is stored. */
export function formatSpecValue(def: SpecDefinitionLike, stored: StoredSpecValue | null): string | null {
  if (!stored) return null;
  if (def.valueType === "boolean") {
    if (stored.textValue === "true") return "Yes";
    if (stored.textValue === "false") return "No";
    return null;
  }
  if (def.valueType === "number") {
    if (stored.numericValue === null) return null;
    return def.unit ? `${stored.numericValue} ${def.unit}` : stored.numericValue;
  }
  if (!stored.textValue) return null;
  return def.unit ? `${stored.textValue} ${def.unit}` : stored.textValue;
}

/** What the editor puts back in an input when it loads a stored value. */
export function specValueToInput(def: SpecDefinitionLike, stored: StoredSpecValue | null): string {
  if (!stored) return "";
  if (def.valueType === "number") return stored.numericValue ?? "";
  return stored.textValue ?? "";
}

/**
 * A field can be compared or filtered only if every product in the set has a value for it.
 * Returns the ids of the specs that qualify.
 */
export function specsPresentInAll(productSpecIds: ReadonlyArray<ReadonlySet<string>>, candidateIds: string[]): string[] {
  if (productSpecIds.length === 0) return [];
  return candidateIds.filter((id) => productSpecIds.every((set) => set.has(id)));
}

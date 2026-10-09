import { describe, expect, it } from "vitest";
import { formatSpecValue, parseSpecValue, specsPresentInAll, specValueToInput, type SpecDefinitionLike } from "./spec-values";

const number: SpecDefinitionLike = { valueType: "number", unit: "kg", options: null };
const text: SpecDefinitionLike = { valueType: "text", unit: null, options: null };
const enumDef: SpecDefinitionLike = { valueType: "enum", unit: null, options: ["Single phase", "Three phase"] };
const bool: SpecDefinitionLike = { valueType: "boolean", unit: null, options: null };

describe("parseSpecValue", () => {
  it("stores nothing for empty input", () => {
    for (const raw of ["", "   ", null, undefined]) {
      expect(parseSpecValue(number, raw)).toEqual({ ok: true, value: null });
    }
  });

  it("parses numbers into numericValue only", () => {
    expect(parseSpecValue(number, "12.5")).toEqual({ ok: true, value: { textValue: null, numericValue: "12.5" } });
    expect(parseSpecValue(number, " 7 ")).toEqual({ ok: true, value: { textValue: null, numericValue: "7" } });
  });

  it("normalises zeros and grouped thousands", () => {
    expect(parseSpecValue(number, "12.50")).toMatchObject({ value: { numericValue: "12.5" } });
    expect(parseSpecValue(number, "012")).toMatchObject({ value: { numericValue: "12" } });
    expect(parseSpecValue(number, "1,200.5")).toMatchObject({ value: { numericValue: "1200.5" } });
    expect(parseSpecValue(number, "-0.0")).toMatchObject({ value: { numericValue: "0" } });
    expect(parseSpecValue(number, "-3")).toMatchObject({ value: { numericValue: "-3" } });
  });

  it("rejects text, bad grouping and special values for numbers", () => {
    for (const raw of ["abc", "12kg", "1,20", "1e3", "Infinity", "NaN", "--1", "1.2.3"]) {
      expect(parseSpecValue(number, raw).ok).toBe(false);
    }
  });

  it("accepts only listed enum options", () => {
    expect(parseSpecValue(enumDef, "Three phase")).toEqual({ ok: true, value: { textValue: "Three phase", numericValue: null } });
    expect(parseSpecValue(enumDef, "Two phase").ok).toBe(false);
    expect(parseSpecValue({ ...enumDef, options: null }, "Three phase").ok).toBe(false);
  });

  it("handles booleans from strings and booleans", () => {
    expect(parseSpecValue(bool, true)).toMatchObject({ value: { textValue: "true" } });
    expect(parseSpecValue(bool, "false")).toMatchObject({ value: { textValue: "false" } });
    expect(parseSpecValue(bool, "maybe").ok).toBe(false);
  });

  it("trims text and enforces the length limit", () => {
    expect(parseSpecValue(text, "  M8 stud ")).toMatchObject({ value: { textValue: "M8 stud" } });
    expect(parseSpecValue(text, "x".repeat(501)).ok).toBe(false);
  });
});

describe("formatSpecValue and specValueToInput", () => {
  it("adds the unit", () => {
    expect(formatSpecValue(number, { textValue: null, numericValue: "12.5" })).toBe("12.5 kg");
    expect(formatSpecValue(text, { textValue: "M8", numericValue: null })).toBe("M8");
  });
  it("shows booleans as Yes and No", () => {
    expect(formatSpecValue(bool, { textValue: "true", numericValue: null })).toBe("Yes");
    expect(formatSpecValue(bool, { textValue: "false", numericValue: null })).toBe("No");
  });
  it("returns null when nothing is stored", () => {
    expect(formatSpecValue(number, null)).toBeNull();
    expect(specValueToInput(number, null)).toBe("");
  });
  it("round trips through the editor input", () => {
    const parsed = parseSpecValue(number, "1,200.50");
    if (!parsed.ok) throw new Error("should parse");
    expect(specValueToInput(number, parsed.value)).toBe("1200.5");
  });
});

describe("specsPresentInAll", () => {
  it("keeps only specs every product has", () => {
    const sets = [new Set(["a", "b", "c"]), new Set(["a", "c"]), new Set(["c", "a", "z"])];
    expect(specsPresentInAll(sets, ["a", "b", "c"])).toEqual(["a", "c"]);
  });
  it("returns nothing for an empty set of products", () => {
    expect(specsPresentInAll([], ["a"])).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { BOOKING_RATE, isBookingRateLimited } from "./booking-rules";
import { buildComparison, type ComparableProduct } from "./compare";
import { activeCount, parseFilters, toQuery, withoutBrand, withoutRange, withoutSpecValue, type FilterableSpec } from "./filters";
import { addBlocked, addItem, BOOKING_LIST_MAX, COMPARE_MAX, hasItem, parseStoredList, removeItem, type ListItem } from "./list-logic";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const item = (n: number, cat = "ups"): ListItem => ({ id: id(n), slug: `p-${n}`, name: `Product ${n}`, brand: "Eaton", categorySlug: cat, imagePath: null, imageAlt: null });

describe("list logic", () => {
  it("adds once and ignores a second add", () => {
    const a = addItem([], item(1), 3, true);
    const b = addItem(a.list, item(1), 3, true);
    expect(b.list).toHaveLength(1);
    expect(b.blocked).toBeNull();
  });
  it("stops at the maximum", () => {
    let list: ListItem[] = [];
    for (let n = 1; n <= COMPARE_MAX; n++) list = addItem(list, item(n), COMPARE_MAX, true).list;
    const r = addItem(list, item(9), COMPARE_MAX, true);
    expect(r.blocked).toBe("full");
    expect(r.list).toHaveLength(COMPARE_MAX);
  });
  it("compare accepts one category only, the booking list does not mind", () => {
    const list = [item(1, "ups")];
    expect(addBlocked(list, item(2, "inverters"), 3, true)).toBe("other-category");
    expect(addBlocked(list, item(2, "inverters"), BOOKING_LIST_MAX, false)).toBeNull();
  });
  it("removes and reports membership", () => {
    const list = [item(1), item(2)];
    expect(hasItem(list, id(2))).toBe(true);
    expect(removeItem(list, id(2)).map((i) => i.id)).toEqual([id(1)]);
  });
});

describe("parseStoredList", () => {
  it("survives anything in storage", () => {
    for (const bad of [null, "", "not json", "{}", "42", '"x"', "[null]", '[{"id":"x"}]']) expect(parseStoredList(bad, 5)).toEqual([]);
  });
  it("keeps valid items, drops damaged ones and duplicates, and respects the cap", () => {
    const raw = JSON.stringify([item(1), { id: "bad" }, item(1), item(2), item(3), item(4)]);
    expect(parseStoredList(raw, 3).map((i) => i.id)).toEqual([id(1), id(2), id(3)]);
  });
  it("never stores or accepts a price", () => {
    const raw = JSON.stringify([{ ...item(1), price: 100 }]);
    expect("price" in parseStoredList(raw, 3)[0]!).toBe(false);
  });
});

describe("buildComparison", () => {
  const defs = [
    { id: "w", label: "Weight", comparable: true, sort: 2 },
    { id: "v", label: "Voltage", comparable: true, sort: 1 },
    { id: "t", label: "Terminal", comparable: true, sort: 3 },
    { id: "x", label: "Internal", comparable: false, sort: 0 },
  ];
  const products: ComparableProduct[] = [
    { id: "a", specs: { w: "10 kg", v: "12 V", t: "M8", x: "1" } },
    { id: "b", specs: { w: "10 kg", v: "6 V", x: "2" } },
  ];
  it("shows only comparable fields that every product has, in template order", () => {
    const c = buildComparison(products, defs);
    expect(c.rows.map((r) => r.label)).toEqual(["Voltage", "Weight"]);
  });
  it("marks rows where the values differ", () => {
    const c = buildComparison(products, defs);
    expect(c.rows.find((r) => r.label === "Voltage")?.differs).toBe(true);
    expect(c.rows.find((r) => r.label === "Weight")?.differs).toBe(false);
  });
  it("reports fields only some products have, so the page can say why they are missing", () => {
    expect(buildComparison(products, defs).partial).toEqual(["Terminal"]);
  });
  it("hides fields nobody has, and handles nothing to compare", () => {
    expect(buildComparison([{ id: "a", specs: {} }], defs).rows).toEqual([]);
    expect(buildComparison([], defs)).toEqual({ rows: [], partial: [] });
  });
});

describe("filters", () => {
  const specs: FilterableSpec[] = [
    { key: "voltage", label: "Voltage", unit: "V", valueType: "number" },
    { key: "topology", label: "Topology", unit: null, valueType: "text" },
  ];
  const brands = ["eaton", "fullriver"];
  it("accepts only known brands and filterable fields", () => {
    const f = parseFilters({ brand: ["eaton", "nope"], "s.topology": "Online", "s.secret": "x", "min.voltage": "6", "max.weight": "9" }, specs, brands);
    expect(f.brands).toEqual(["eaton"]);
    expect(f.specs).toEqual([{ key: "voltage", min: 6, max: undefined }, { key: "topology", values: ["Online"] }]);
  });
  it("ignores junk numbers, blanks and bad pages", () => {
    const f = parseFilters({ "min.voltage": "abc", "max.voltage": "", "s.topology": "  ", page: "-4", sort: "weird" }, specs, brands);
    expect(f.specs).toEqual([]);
    expect(f.page).toBe(1);
    expect(f.sort).toBe("newest");
  });
  it("round trips through the address", () => {
    const f = parseFilters({ brand: "eaton", "s.topology": ["Online", "Line interactive"], "min.voltage": "6", sort: "name" }, specs, brands);
    const q = toQuery(f);
    const back = parseFilters(Object.fromEntries(new URLSearchParams(q).entries()) && Object.fromEntries([...new Set([...new URLSearchParams(q).keys()])].map((k) => [k, new URLSearchParams(q).getAll(k)])), specs, brands);
    expect(back).toEqual(f);
  });
  it("removes one choice at a time", () => {
    const f = parseFilters({ brand: ["eaton", "fullriver"], "s.topology": ["Online", "Line"], "min.voltage": "6", page: "3" }, specs, brands);
    expect(withoutBrand(f, "eaton").brands).toEqual(["fullriver"]);
    expect(withoutBrand(f, "eaton").page).toBe(1);
    expect(withoutSpecValue(f, "topology", "Online").specs.find((s) => s.key === "topology")?.values).toEqual(["Line"]);
    expect(withoutSpecValue(withoutSpecValue(f, "topology", "Online"), "topology", "Line").specs.some((s) => s.key === "topology")).toBe(false);
    expect(withoutRange(f, "voltage").specs.some((s) => s.key === "voltage")).toBe(false);
    expect(activeCount(f)).toBe(5);
  });
});

describe("booking rate and WhatsApp message", () => {
  it("limits at the maximum", () => {
    expect(isBookingRateLimited(BOOKING_RATE.max - 1)).toBe(false);
    expect(isBookingRateLimited(BOOKING_RATE.max)).toBe(true);
  });
  it("lists every product with its shop address, numbered, with no price", () => {
    process.env.NEXT_PUBLIC_SHOP_URL = "https://shop.idyllictechnologies.com";
    const url = buildWhatsAppLink([{ name: "Eaton 9SX", slug: "eaton-9sx" }, { name: "Fullriver DC", slug: "fullriver-dc" }]);
    const text = decodeURIComponent(url.split("?text=")[1]!);
    expect(url.startsWith("https://wa.me/")).toBe(true);
    expect(text).toContain("these products");
    expect(text).toContain("1. Eaton 9SX https://shop.idyllictechnologies.com/product/eaton-9sx");
    expect(text).toContain("2. Fullriver DC https://shop.idyllictechnologies.com/product/fullriver-dc");
    expect(text).not.toMatch(/₦|\bNGN\b|price|\$\d/i);
  });
  it("uses the singular for one product and appends a note", () => {
    const text = decodeURIComponent(buildWhatsAppLink([{ name: "A", slug: "a" }], "Needs: 3 kVA").split("?text=")[1]!);
    expect(text).toContain("this product");
    expect(text.endsWith("Needs: 3 kVA")).toBe(true);
  });
  it("asks for help when the assistant hands over requirements with no product", () => {
    const text = decodeURIComponent(buildWhatsAppLink([], "My requirements: Looking to power: Home.").split("?text=")[1]!);
    expect(text).toContain("I need help choosing a product.");
    expect(text).not.toContain("book this product");
    expect(text.endsWith("My requirements: Looking to power: Home.")).toBe(true);
  });
});

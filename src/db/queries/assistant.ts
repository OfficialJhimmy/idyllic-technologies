import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db, schema } from "@/db";
import { withImages } from "@/db/queries/shop";
import type { AssistantProduct } from "@/assistant/engine/types";
import { formatSpecValue } from "@/lib/catalogue/spec-values";

const s = schema;
const MAX_PRODUCTS = 300;

/**
 * Published products in the given categories, with their curated tags and the spec values that have one.
 * Drizzle bypasses row level security, so the published filter is written here. Cached and tagged
 * "catalogue", so publishing or unpublishing in the admin refreshes it.
 */
const read = unstable_cache(
  async (slugKey: string): Promise<AssistantProduct[]> => {
    const slugs = slugKey.split(",").filter(Boolean);
    if (slugs.length === 0) return [];

    const rows = await db
      .select({ id: s.products.id, slug: s.products.slug, name: s.products.name, brandName: s.brands.name, categorySlug: s.productCategories.slug, categoryName: s.productCategories.name })
      .from(s.products)
      .innerJoin(s.brands, eq(s.brands.id, s.products.brandId))
      .innerJoin(s.productCategories, eq(s.productCategories.id, s.products.categoryId))
      .where(and(eq(s.products.status, "published"), inArray(s.productCategories.slug, slugs)))
      .orderBy(asc(s.products.name))
      .limit(MAX_PRODUCTS);
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const [withPictures, tags, defs, values] = await Promise.all([
      withImages(rows),
      db.select({ productId: s.productTags.productId, tag: s.productTags.suitableFor }).from(s.productTags).where(inArray(s.productTags.productId, ids)),
      db.select({ def: s.specDefinitions }).from(s.specDefinitions).innerJoin(s.productCategories, eq(s.productCategories.id, s.specDefinitions.categoryId)).where(inArray(s.productCategories.slug, slugs)),
      db.select().from(s.productSpecValues).where(inArray(s.productSpecValues.productId, ids)),
    ]);
    const defById = new Map(defs.map((d) => [d.def.id, d.def]));

    return withPictures.map((row) => {
      const specs: AssistantProduct["specs"] = {};
      for (const v of values) {
        if (v.productId !== row.id) continue;
        const def = defById.get(v.specId);
        if (!def) continue;
        const display = formatSpecValue({ valueType: def.valueType, unit: def.unit, options: def.options ?? null }, { textValue: v.textValue, numericValue: v.numericValue });
        if (!display) continue;
        const numeric = def.valueType === "number" && v.numericValue !== null ? Number(v.numericValue) : null;
        specs[def.key] = { label: def.label, unit: def.unit, display, numeric: numeric !== null && Number.isFinite(numeric) ? numeric : null };
      }
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        brandName: row.brandName,
        categorySlug: row.categorySlug,
        categoryName: row.categoryName,
        image: row.image,
        tags: tags.filter((t) => t.productId === row.id).map((t) => t.tag),
        specs,
      };
    });
  },
  ["assistant-products"],
  { tags: ["catalogue"], revalidate: 3600 },
);

export const getAssistantProducts = (categorySlugs: string[]) => read([...new Set(categorySlugs)].sort().join(","));

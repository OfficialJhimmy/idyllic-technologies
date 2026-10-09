import "server-only";
import type { CatalogueSource } from "@/assistant/engine/types";
import { getAssistantProducts } from "@/db/queries/assistant";
import { getCompareData } from "@/db/queries/shop";

/** The real catalogue: published products from the database. */
export const databaseSource: CatalogueSource = {
  productsInCategories: getAssistantProducts,
  async compare(productIds) {
    const data = await getCompareData(productIds);
    return {
      categoryName: data.categoryName,
      defs: data.defs,
      products: data.products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, brandName: p.brandName, categorySlug: p.categorySlug, specs: p.specs })),
    };
  },
};

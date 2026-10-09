import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "./schema";
import { brandSeeds, categorySeeds, specTemplateSeeds } from "../content/catalogue";
import { faqSeeds } from "../content/faqs";
import { siteValueSeeds } from "../content/site-values";

/** Idempotent. Never overwrites rows that staff have already edited. */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema: s });

  await db.insert(s.productCategories).values([...categorySeeds]).onConflictDoNothing();
  await db.insert(s.brands).values([...brandSeeds]).onConflictDoNothing();

  const cats = await db.select().from(s.productCategories);
  for (const cat of cats) {
    const specs = specTemplateSeeds[cat.slug as keyof typeof specTemplateSeeds] ?? [];
    if (!specs.length) continue;
    await db
      .insert(s.specDefinitions)
      .values(
        specs.map((sp, i) => ({
          categoryId: cat.id,
          key: sp.key,
          label: sp.label,
          unit: sp.unit,
          valueType: sp.valueType,
          comparable: sp.comparable ?? true,
          filterable: sp.filterable ?? false,
          sort: i,
        })),
      )
      .onConflictDoNothing();
  }

  const existingFaqs = await db.select({ n: sql<number>`count(*)` }).from(s.faqs);
  if (Number(existingFaqs[0]?.n ?? 0) === 0) {
    await db.insert(s.faqs).values(faqSeeds.map((f) => ({ ...f, status: "draft" as const })));
  }

  await db
    .insert(s.siteValues)
    .values(siteValueSeeds.map((v) => ({ key: v.key, value: v.value ?? null, todo: v.todo })))
    .onConflictDoNothing();

  await client.end();
  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

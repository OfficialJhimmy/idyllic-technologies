import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { brandSeeds, categorySeeds, specTemplateSeeds } from "../content/catalogue";
import { faqSeeds } from "../content/faqs";
import { siteValueSeeds } from "../content/site-values";
import * as s from "./schema";


// Load .env.local when run from the CLI. Next.js does this itself for the app.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local. Rely on the real environment.
}

const FAQ_MARKER = "seed.faqs.v1";

/**
 * Idempotent. Never overwrites rows that staff have edited: every insert is conflict-do-nothing,
 * and FAQs are inserted once, guarded by a marker row, so staff deletions are not undone.
 */
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

  await db
    .insert(s.siteValues)
    .values(siteValueSeeds.map((v) => ({ key: v.key, value: v.value ?? null, todo: v.todo ?? null })))
    .onConflictDoNothing();

  const [marker] = await db.select().from(s.siteValues).where(eq(s.siteValues.key, FAQ_MARKER));
  if (!marker) {
    await db.transaction(async (tx) => {
      await tx.insert(s.faqs).values(faqSeeds.map((f) => ({ ...f, status: "draft" as const })));
      await tx.insert(s.siteValues).values({ key: FAQ_MARKER, value: true });
    });
  }

  await client.end();
  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

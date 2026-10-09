/**
 * Seeds the public content that needs files: client and partner logos, and the pictures for the six
 * product categories. Testimonials are seeded here too, as drafts. Safe to run again: each group is
 * guarded by a marker row in site_values, and nothing staff have edited is overwritten.
 *
 * Run with: pnpm db:seed:assets   (uses the service role, so it needs .env.local)
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq, isNull } from "drizzle-orm";
import sharp from "sharp";
import { db, schema as s } from "@/db";
import { categoryImageSeeds, clientSeeds, testimonialSeeds } from "@/content/public-seeds";
import { uploadImage } from "@/lib/media/upload";

async function marker(key: string) {
  const [row] = await db.select().from(s.siteValues).where(eq(s.siteValues.key, key));
  return Boolean(row);
}
const setMarker = (key: string) => db.insert(s.siteValues).values({ key, value: true }).onConflictDoNothing();

async function upload(file: string, alt: string, actor: string) {
  let buffer = await readFile(path.join("public", "images", file));
  // The originals are large camera files. Shrink them first, as staff would, to fit the 4 MB upload limit.
  if (buffer.length > 3 * 1024 * 1024) buffer = await sharp(buffer).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  const result = await uploadImage(new File([new Uint8Array(buffer)], file), alt, actor);
  if (!result.ok) throw new Error(`${file}: ${result.error}`);
  return result.media.id;
}

async function main() {
  const [owner] = await db.select({ id: s.adminProfiles.userId }).from(s.adminProfiles).limit(1);
  if (!owner) throw new Error("No admin profile found. Add the owner to admin_profiles first.");

  if (!(await marker("seed.testimonials.v1"))) {
    await db.insert(s.testimonials).values(testimonialSeeds.map((t) => ({ ...t, status: "draft" as const })));
    await setMarker("seed.testimonials.v1");
    console.log(`testimonials: ${testimonialSeeds.length} added as drafts`);
  }

  if (!(await marker("seed.clients.v1"))) {
    for (const c of clientSeeds) {
      const logoMediaId = await upload(c.file, c.alt, owner.id);
      await db.insert(s.clientsPartners).values({ name: c.name, kind: c.kind, logoMediaId, sort: c.sort, status: "draft" });
    }
    await setMarker("seed.clients.v1");
    console.log(`clients and partners: ${clientSeeds.length} added as drafts`);
  }

  if (!(await marker("seed.category-images.v1"))) {
    const cats = await db.select().from(s.productCategories).where(isNull(s.productCategories.imageMediaId));
    for (const cat of cats) {
      const seed = categoryImageSeeds[cat.slug];
      if (!seed) continue;
      const mediaId = await upload(seed.file, seed.alt, owner.id);
      await db.update(s.productCategories).set({ imageMediaId: mediaId }).where(eq(s.productCategories.id, cat.id));
    }
    await setMarker("seed.category-images.v1");
    console.log(`category images: ${cats.length} set`);
  }
  console.log("Asset seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

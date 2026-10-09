import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import type { BrandInput } from "@/lib/catalogue/schemas";

const s = schema;

export type SaveResult = { ok: true; id: string } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

export async function saveBrand(input: BrandInput, actorId: string): Promise<SaveResult> {
  const [taken] = await db
    .select({ id: s.brands.id })
    .from(s.brands)
    .where(input.id ? and(eq(s.brands.slug, input.slug), ne(s.brands.id, input.id)) : eq(s.brands.slug, input.slug))
    .limit(1);
  if (taken) return { ok: false, fieldErrors: { slug: "Another brand already uses this slug" } };

  const values = { name: input.name, slug: input.slug, description: input.description, logoMediaId: input.logoMediaId, updatedAt: new Date() };
  if (input.id) {
    const updated = await db.update(s.brands).set(values).where(eq(s.brands.id, input.id)).returning({ id: s.brands.id });
    if (!updated.length) return { ok: false, error: "This brand no longer exists" };
    await logActivity(actorId, "brand.update", "brand", input.id);
    return { ok: true, id: input.id };
  }
  const [row] = await db.insert(s.brands).values(values).returning({ id: s.brands.id });
  await logActivity(actorId, "brand.create", "brand", row!.id);
  return { ok: true, id: row!.id };
}

export async function deleteBrand(id: string, actorId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const used = await db.select({ id: s.products.id }).from(s.products).where(eq(s.products.brandId, id)).limit(1);
  if (used.length) return { ok: false, error: "This brand has products. Move or archive them first" };
  await db.delete(s.brands).where(eq(s.brands.id, id));
  await logActivity(actorId, "brand.delete", "brand", id);
  return { ok: true };
}

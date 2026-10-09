import "server-only";
import { and, asc, count, eq, max } from "drizzle-orm";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import type { CategoryInput, SpecDefinitionInput } from "@/lib/catalogue/schemas";
import { parseSpecValue } from "@/lib/catalogue/spec-values";

const s = schema;

type Fail = { ok: false; error?: string; fieldErrors?: Record<string, string> };

/** Categories are fixed at six. Only the description and image can change. */
export async function saveCategory(input: CategoryInput, actorId: string): Promise<{ ok: true } | Fail> {
  const updated = await db
    .update(s.productCategories)
    .set({ description: input.description, imageMediaId: input.imageMediaId })
    .where(eq(s.productCategories.id, input.id))
    .returning({ id: s.productCategories.id });
  if (!updated.length) return { ok: false, error: "This category does not exist" };
  await logActivity(actorId, "category.update", "category", input.id);
  return { ok: true };
}

export async function saveSpecDefinition(input: SpecDefinitionInput, actorId: string): Promise<{ ok: true; id: string } | Fail> {
  const [category] = await db.select({ id: s.productCategories.id }).from(s.productCategories).where(eq(s.productCategories.id, input.categoryId)).limit(1);
  if (!category) return { ok: false, error: "This category does not exist" };

  const options = input.valueType === "enum" ? input.options : null;
  const unit = input.valueType === "boolean" ? null : input.unit;

  if (!input.id) {
    const [dup] = await db
      .select({ id: s.specDefinitions.id })
      .from(s.specDefinitions)
      .where(and(eq(s.specDefinitions.categoryId, input.categoryId), eq(s.specDefinitions.key, input.key)))
      .limit(1);
    if (dup) return { ok: false, fieldErrors: { key: "This category already has a spec with this key" } };

    const [{ top } = { top: null }] = await db.select({ top: max(s.specDefinitions.sort) }).from(s.specDefinitions).where(eq(s.specDefinitions.categoryId, input.categoryId));
    const [row] = await db
      .insert(s.specDefinitions)
      .values({
        categoryId: input.categoryId,
        key: input.key,
        label: input.label,
        unit,
        valueType: input.valueType,
        options,
        comparable: input.comparable,
        filterable: input.filterable,
        sort: (top ?? -1) + 1,
      })
      .returning({ id: s.specDefinitions.id });
    await logActivity(actorId, "spec.create", "spec_definition", row!.id);
    return { ok: true, id: row!.id };
  }

  const [current] = await db.select().from(s.specDefinitions).where(eq(s.specDefinitions.id, input.id)).limit(1);
  if (!current || current.categoryId !== input.categoryId) return { ok: false, error: "This spec no longer exists" };

  // The key is used by compare, filters and the assistant, so it never changes after creation.
  if (current.key !== input.key) return { ok: false, fieldErrors: { key: "The key cannot change once the spec exists" } };

  const values = await db.select().from(s.productSpecValues).where(eq(s.productSpecValues.specId, input.id));
  if (values.length && current.valueType !== input.valueType) {
    return { ok: false, fieldErrors: { valueType: `${values.length} product(s) already have a value. Remove those values before changing the type` } };
  }
  if (values.length && input.valueType === "enum") {
    const allowed = new Set(options ?? []);
    const stranded = values.filter((v) => v.textValue && !allowed.has(v.textValue));
    if (stranded.length) {
      return { ok: false, fieldErrors: { options: `${stranded.length} product(s) use an option you removed. Change those products first` } };
    }
  }
  // Re-check stored values still parse under the new settings (for example text rules).
  for (const v of values) {
    const parsed = parseSpecValue({ valueType: input.valueType, unit, options }, input.valueType === "number" ? v.numericValue : v.textValue);
    if (!parsed.ok) return { ok: false, error: "Existing values do not fit these settings" };
  }

  await db
    .update(s.specDefinitions)
    .set({ label: input.label, unit, options, comparable: input.comparable, filterable: input.filterable, valueType: input.valueType })
    .where(eq(s.specDefinitions.id, input.id));
  await logActivity(actorId, "spec.update", "spec_definition", input.id);
  return { ok: true, id: input.id };
}

/** Deleting a spec also removes its values from every product. The caller shows that count first. */
export async function deleteSpecDefinition(id: string, actorId: string): Promise<{ ok: true; removedValues: number } | Fail> {
  const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(s.productSpecValues).where(eq(s.productSpecValues.specId, id));
  const deleted = await db.delete(s.specDefinitions).where(eq(s.specDefinitions.id, id)).returning({ id: s.specDefinitions.id });
  if (!deleted.length) return { ok: false, error: "This spec no longer exists" };
  await logActivity(actorId, "spec.delete", "spec_definition", id);
  return { ok: true, removedValues: n };
}

export async function reorderSpecDefinitions(categoryId: string, orderedIds: string[], actorId: string): Promise<{ ok: true } | Fail> {
  const existing = await db.select({ id: s.specDefinitions.id }).from(s.specDefinitions).where(eq(s.specDefinitions.categoryId, categoryId)).orderBy(asc(s.specDefinitions.sort));
  const same = existing.length === orderedIds.length && existing.every((e) => orderedIds.includes(e.id)) && new Set(orderedIds).size === orderedIds.length;
  if (!same) return { ok: false, error: "The list changed. Reload and try again" };

  await db.transaction(async (tx) => {
    for (const [sort, id] of orderedIds.entries()) {
      await tx.update(s.specDefinitions).set({ sort }).where(and(eq(s.specDefinitions.id, id), eq(s.specDefinitions.categoryId, categoryId)));
    }
  });
  await logActivity(actorId, "spec.reorder", "category", categoryId);
  return { ok: true };
}

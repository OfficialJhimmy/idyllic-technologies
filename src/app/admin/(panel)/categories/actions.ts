"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { deleteSpecDefinition, reorderSpecDefinitions, saveCategory, saveSpecDefinition } from "@/lib/catalogue/categories";
import { categoryInputSchema, idSchema, specDefinitionInputSchema } from "@/lib/catalogue/schemas";
import { revalidateCatalogue } from "@/lib/revalidate";
import { fieldErrorsFromZod } from "@/lib/validation";

type Result = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

export async function saveCategoryAction(raw: unknown): Promise<Result> {
  const session = await requireAdmin({ section: "categories" });
  const parsed = categoryInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const result = await saveCategory(parsed.data, session.userId);
  if (result.ok) revalidateCatalogue();
  return result;
}

export async function saveSpecAction(raw: unknown): Promise<Result> {
  const session = await requireAdmin({ section: "categories" });
  const parsed = specDefinitionInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const result = await saveSpecDefinition(parsed.data, session.userId);
  if (result.ok) revalidateCatalogue();
  return result.ok ? { ok: true } : result;
}

export async function deleteSpecAction(id: string): Promise<{ ok: true; removedValues: number } | { ok: false; error?: string }> {
  const session = await requireAdmin({ section: "categories" });
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const result = await deleteSpecDefinition(parsed.data, session.userId);
  if (result.ok) revalidateCatalogue();
  return result;
}

const reorderSchema = z.object({ categoryId: z.uuid(), orderedIds: z.array(z.uuid()).max(100) });

export async function reorderSpecsAction(categoryId: string, orderedIds: string[]): Promise<Result> {
  const session = await requireAdmin({ section: "categories" });
  const parsed = reorderSchema.safeParse({ categoryId, orderedIds });
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const result = await reorderSpecDefinitions(parsed.data.categoryId, parsed.data.orderedIds, session.userId);
  if (result.ok) revalidateCatalogue();
  return result;
}

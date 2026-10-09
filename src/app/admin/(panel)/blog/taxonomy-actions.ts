"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { authorInputSchema, taxonomyInputSchema } from "@/lib/blog/schemas";
import { deleteAuthor, deleteTaxonomy, saveAuthor, saveTaxonomy } from "@/lib/blog/taxonomy";
import { idSchema } from "@/lib/catalogue/schemas";
import { revalidateBlog } from "@/lib/revalidate";
import { fieldErrorsFromZod } from "@/lib/validation";

type Result = { ok: true; id?: string } | { ok: false; error?: string; fieldErrors?: Record<string, string> };
const kindSchema = z.enum(["category", "tag"]);

export async function saveTaxonomyAction(kind: string, raw: unknown): Promise<Result> {
  const session = await requireAdmin();
  const k = kindSchema.safeParse(kind);
  const parsed = taxonomyInputSchema.safeParse(raw);
  if (!k.success) return { ok: false, error: "Invalid request" };
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const result = await saveTaxonomy(k.data, parsed.data, session.userId);
  if (result.ok) revalidateBlog();
  return result;
}

export async function deleteTaxonomyAction(kind: string, id: string): Promise<Result> {
  const session = await requireAdmin();
  const k = kindSchema.safeParse(kind);
  const parsedId = idSchema.safeParse(id);
  if (!k.success || !parsedId.success) return { ok: false, error: "Invalid request" };
  const result = await deleteTaxonomy(k.data, parsedId.data, session.userId);
  if (result.ok) revalidateBlog();
  return result;
}

export async function saveAuthorAction(raw: unknown): Promise<Result> {
  const session = await requireAdmin();
  const parsed = authorInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const result = await saveAuthor(parsed.data, session.userId);
  if (result.ok) revalidateBlog();
  return result;
}

export async function deleteAuthorAction(id: string): Promise<{ ok: false; error?: string }> {
  const session = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const result = await deleteAuthor(parsed.data, session.userId);
  if (!result.ok) return result;
  revalidateBlog();
  redirect("/admin/blog/authors");
}

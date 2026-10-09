"use server";

import { z } from "zod";
import { searchProductsForRelation } from "@/db/queries/catalogue";
import { requireAdmin } from "@/lib/auth";
import { changeProductStatus, saveProduct } from "@/lib/catalogue/save-product";
import { idSchema, productInputSchema, statusActions } from "@/lib/catalogue/schemas";
import type { StatusAction } from "@/lib/catalogue/publish";
import { uploadPdf } from "@/lib/media/upload";
import { revalidateCatalogue } from "@/lib/revalidate";
import { fieldErrorsFromZod } from "@/lib/validation";

export type SaveProductActionResult =
  | { ok: true; id: string; status: "draft" | "published" | "archived"; issues: string[] }
  | { ok: false; error?: string; fieldErrors?: Record<string, string>; issues?: string[] };

export async function saveProductAction(raw: unknown, statusAction?: StatusAction): Promise<SaveProductActionResult> {
  const session = await requireAdmin();

  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const action = statusAction ? z.enum(statusActions).safeParse(statusAction) : null;
  if (action && !action.success) return { ok: false, error: "Unknown status change" };

  const result = await saveProduct(parsed.data, session.userId, action?.data);
  if (!result.ok) return result;

  if (result.changedLive) {
    revalidateCatalogue({ productSlugs: [result.slug, ...(result.previousSlug ? [result.previousSlug] : [])] });
  }
  return { ok: true, id: result.id, status: result.status, issues: result.issues };
}

export type ChangeStatusResult = { ok: true; status: "draft" | "published" | "archived" } | { ok: false; error: string; issues?: string[] };

export async function changeStatusAction(id: string, action: StatusAction): Promise<ChangeStatusResult> {
  const session = await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsedAction = z.enum(statusActions).safeParse(action);
  if (!parsedId.success || !parsedAction.success) return { ok: false, error: "Invalid request" };

  const result = await changeProductStatus(parsedId.data, parsedAction.data, session.userId);
  if (!result.ok) return result;
  if (result.changedLive) revalidateCatalogue({ productSlugs: [result.slug] });
  return { ok: true, status: result.status };
}

const searchSchema = z.object({ q: z.string().trim().max(100), excludeId: z.uuid().nullable() });

export async function searchRelatedAction(q: string, excludeId: string | null) {
  await requireAdmin();
  const parsed = searchSchema.safeParse({ q, excludeId });
  if (!parsed.success) return [];
  return searchProductsForRelation(parsed.data.q, parsed.data.excludeId);
}

export async function uploadDatasheetAction(formData: FormData): Promise<{ ok: true; storagePath: string } | { ok: false; error: string }> {
  const session = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a PDF to upload" };
  return uploadPdf(file, session.userId);
}

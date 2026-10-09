"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { deleteBrand, saveBrand } from "@/lib/catalogue/brands";
import { brandInputSchema, idSchema } from "@/lib/catalogue/schemas";
import { revalidateCatalogue } from "@/lib/revalidate";
import { fieldErrorsFromZod } from "@/lib/validation";

export type BrandActionResult = { ok: true; id: string } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

export async function saveBrandAction(raw: unknown): Promise<BrandActionResult> {
  const session = await requireAdmin();
  const parsed = brandInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const result = await saveBrand(parsed.data, session.userId);
  if (result.ok) revalidateCatalogue();
  return result;
}

export async function deleteBrandAction(id: string): Promise<{ ok: false; error: string }> {
  const session = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const result = await deleteBrand(parsed.data, session.userId);
  if (!result.ok) return result;
  revalidateCatalogue();
  redirect("/admin/brands");
}

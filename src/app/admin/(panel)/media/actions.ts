"use server";

import { z } from "zod";
import { listMedia } from "@/db/queries/catalogue";
import { requireAdmin } from "@/lib/auth";
import { idSchema } from "@/lib/catalogue/schemas";
import { deleteMedia, updateMediaAlt, uploadImage, type UploadedImage } from "@/lib/media/upload";

export type UploadResult = { ok: true; media: UploadedImage } | { ok: false; error: string };

export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  const session = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image to upload" };
  return uploadImage(file, String(formData.get("alt") ?? ""), session.userId);
}

export async function updateAltAction(id: string, alt: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  return updateMediaAlt(parsed.data, alt, session.userId);
}

export async function deleteMediaAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  return deleteMedia(parsed.data, session.userId);
}

const listSchema = z.object({ q: z.string().trim().max(100), page: z.number().int().min(1).max(1000) });

/** Used by the image picker. */
export async function listMediaAction(q: string, page: number) {
  await requireAdmin();
  const parsed = listSchema.safeParse({ q, page });
  if (!parsed.success) return { rows: [], total: 0 };
  return listMedia({ q: parsed.data.q || undefined, page: parsed.data.page, pageSize: 24 });
}

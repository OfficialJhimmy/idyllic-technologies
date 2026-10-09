import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { logActivity } from "@/lib/activity";
import { mediaAltSchema } from "@/lib/catalogue/schemas";
import { slugify } from "@/lib/catalogue/slug";
import { ImageRejected, processImage, validatePdf } from "@/lib/media/process-image";
import { mediaUsageCount } from "@/db/queries/catalogue";
import { supabaseAdmin } from "@/lib/supabase/server";

const BUCKET = "media";
const ONE_YEAR = "31536000";

const datePath = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

type Failure = { ok: false; error: string };

export type UploadedImage = { id: string; storagePath: string; alt: string; width: number; height: number };

/** Validates, converts to WebP, uploads with the service role and records the media row. */
export async function uploadImage(file: File, alt: string, actorId: string): Promise<{ ok: true; media: UploadedImage } | Failure> {
  const altResult = mediaAltSchema.safeParse(alt);
  if (!altResult.success) return { ok: false, error: altResult.error.issues[0]?.message ?? "Add alt text" };

  let processed;
  try {
    processed = await processImage(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    if (error instanceof ImageRejected) return { ok: false, error: error.message };
    throw error;
  }

  const storagePath = `images/${datePath()}/${randomUUID()}.webp`;
  const { error } = await supabaseAdmin().storage.from(BUCKET).upload(storagePath, processed.buffer, {
    contentType: "image/webp",
    cacheControl: ONE_YEAR,
    upsert: false,
  });
  if (error) {
    console.error("media upload failed", error.message);
    return { ok: false, error: "The upload failed. Check that the media bucket exists and try again" };
  }

  try {
    const [row] = await db
      .insert(schema.media)
      .values({ storagePath, alt: altResult.data, width: processed.width, height: processed.height, bytes: processed.bytes })
      .returning({ id: schema.media.id });
    await logActivity(actorId, "media.upload", "media", row!.id);
    return { ok: true, media: { id: row!.id, storagePath, alt: altResult.data, width: processed.width, height: processed.height } };
  } catch (e) {
    await supabaseAdmin().storage.from(BUCKET).remove([storagePath]);
    throw e;
  }
}

/** Datasheets. Stored as supplied under documents/. Returns the storage path for product_documents. */
export async function uploadPdf(file: File, actorId: string): Promise<{ ok: true; storagePath: string } | Failure> {
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    validatePdf(buffer);
  } catch (error) {
    if (error instanceof ImageRejected) return { ok: false, error: error.message };
    throw error;
  }

  const base = slugify(file.name.replace(/\.pdf$/i, "")) || "datasheet";
  const storagePath = `documents/${datePath()}/${randomUUID().slice(0, 8)}-${base}.pdf`;
  const { error } = await supabaseAdmin().storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "application/pdf",
    cacheControl: ONE_YEAR,
    upsert: false,
  });
  if (error) {
    console.error("pdf upload failed", error.message);
    return { ok: false, error: "The upload failed. Check that the media bucket exists and try again" };
  }
  await logActivity(actorId, "document.upload", "media", null);
  return { ok: true, storagePath };
}

export async function updateMediaAlt(id: string, alt: string, actorId: string): Promise<{ ok: true } | Failure> {
  const parsed = mediaAltSchema.safeParse(alt);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Add alt text" };
  const updated = await db.update(schema.media).set({ alt: parsed.data }).where(eq(schema.media.id, id)).returning({ id: schema.media.id });
  if (!updated.length) return { ok: false, error: "This image no longer exists" };
  await logActivity(actorId, "media.update", "media", id);
  return { ok: true };
}

export async function deleteMedia(id: string, actorId: string): Promise<{ ok: true } | Failure> {
  const uses = await mediaUsageCount(id);
  if (uses > 0) return { ok: false, error: `This image is used in ${uses} place(s). Remove it from them first` };
  const [row] = await db.select({ storagePath: schema.media.storagePath }).from(schema.media).where(eq(schema.media.id, id)).limit(1);
  if (!row) return { ok: false, error: "This image no longer exists" };
  await db.delete(schema.media).where(eq(schema.media.id, id));
  await supabaseAdmin().storage.from(BUCKET).remove([row.storagePath]);
  await logActivity(actorId, "media.delete", "media", id);
  return { ok: true };
}

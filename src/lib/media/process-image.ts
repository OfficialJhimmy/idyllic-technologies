import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel rejects request bodies above 4.5 MB.
export const MAX_EDGE_PX = 2000;
const MAX_INPUT_PIXELS = 50_000_000;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

export type ProcessedImage = { buffer: Buffer; width: number; height: number; bytes: number };

export class ImageRejected extends Error {}

/**
 * Validates an uploaded image by reading its real format (not its file name or declared type) and
 * converts it to WebP, rotated upright, metadata removed, longest edge capped at 2000px.
 * The original is never kept.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.length === 0) throw new ImageRejected("The file is empty");
  if (input.length > MAX_UPLOAD_BYTES) {
    throw new ImageRejected("The file is larger than 4 MB. Resize it and try again");
  }

  let format: string | undefined;
  try {
    format = (await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata()).format;
  } catch {
    throw new ImageRejected("That file is not an image we can read");
  }
  if (!format || !ALLOWED_FORMATS.has(format)) {
    throw new ImageRejected("Use a JPEG, PNG, WebP or AVIF image");
  }

  try {
    const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, width: info.width, height: info.height, bytes: data.length };
  } catch {
    throw new ImageRejected("That image could not be processed");
  }
}

/** PDFs are stored as supplied. They are checked by their first bytes, not their name. */
export function validatePdf(input: Buffer): void {
  if (input.length === 0) throw new ImageRejected("The file is empty");
  if (input.length > MAX_UPLOAD_BYTES) throw new ImageRejected("The file is larger than 4 MB");
  if (input.subarray(0, 5).toString("latin1") !== "%PDF-") throw new ImageRejected("That file is not a PDF");
}

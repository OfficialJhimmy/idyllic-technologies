/** Rules for choosing several images to upload at once. Pure, so they are tested. */

export const UPLOAD_LIMITS = { maxFiles: 20, maxBytes: 4 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp", "image/avif"] } as const;

export type FileCheck = { ok: true } | { ok: false; error: string };

/** Checks one file in the browser before it is sent. The server checks again, because it cannot trust the browser. */
export function checkImageFile(file: { name: string; size: number; type: string }): FileCheck {
  if (!(UPLOAD_LIMITS.types as readonly string[]).includes(file.type)) return { ok: false, error: "Use a JPEG, PNG, WebP or AVIF image" };
  if (file.size === 0) return { ok: false, error: "This file is empty" };
  if (file.size > UPLOAD_LIMITS.maxBytes) return { ok: false, error: `Too large (${(file.size / 1024 / 1024).toFixed(1)} MB). The limit is 4 MB` };
  return { ok: true };
}

/** A starting description from the file name, for staff to correct: "server-hall_01.jpg" becomes "Server hall 01". */
export function altFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}

/** How many more files fit in this batch. */
export const roomFor = (current: number) => Math.max(0, UPLOAD_LIMITS.maxFiles - current);

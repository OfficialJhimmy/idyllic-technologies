"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { postInputSchema } from "@/lib/blog/schemas";
import { savePost } from "@/lib/blog/save-post";
import { statusActions } from "@/lib/catalogue/schemas";
import type { StatusAction } from "@/lib/catalogue/publish";
import { revalidateBlog } from "@/lib/revalidate";
import { fieldErrorsFromZod } from "@/lib/validation";

export type SavePostActionResult =
  | { ok: true; id: string; status: "draft" | "published" | "archived"; issues: string[] }
  | { ok: false; error?: string; fieldErrors?: Record<string, string>; issues?: string[] };

export async function savePostAction(raw: unknown, statusAction?: StatusAction): Promise<SavePostActionResult> {
  const session = await requireAdmin();

  const parsed = postInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const action = statusAction ? z.enum(statusActions).safeParse(statusAction) : null;
  if (action && !action.success) return { ok: false, error: "Unknown status change" };

  const result = await savePost(parsed.data, session.userId, action?.data);
  if (!result.ok) return result;

  if (result.changedLive) {
    revalidateBlog({ postSlugs: [result.slug, ...(result.previousSlug ? [result.previousSlug] : [])] });
  }
  return { ok: true, id: result.id, status: result.status, issues: result.issues };
}

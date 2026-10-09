"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { idSchema } from "@/lib/catalogue/schemas";
import { deleteContent, moveContent, saveClient, saveFaq, saveTestimonial, setContentStatus } from "@/lib/content/content";
import { clientInputSchema, contentKinds, contentStatuses, faqInputSchema, testimonialInputSchema } from "@/lib/content/schemas";
import { revalidateContent } from "@/lib/revalidate";
import { fieldErrorsFromZod } from "@/lib/validation";

type Result = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

export async function saveFaqAction(raw: unknown): Promise<Result> {
  const session = await requireAdmin();
  const parsed = faqInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const r = await saveFaq(parsed.data, session.userId);
  if (r.ok) revalidateContent();
  return r.ok ? { ok: true } : r;
}

export async function saveTestimonialAction(raw: unknown): Promise<Result> {
  const session = await requireAdmin();
  const parsed = testimonialInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const r = await saveTestimonial(parsed.data, session.userId);
  if (r.ok) revalidateContent();
  return r.ok ? { ok: true } : r;
}

export async function saveClientAction(raw: unknown): Promise<Result> {
  const session = await requireAdmin();
  const parsed = clientInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  const r = await saveClient(parsed.data, session.userId);
  if (r.ok) revalidateContent();
  return r.ok ? { ok: true } : r;
}

const kindId = z.object({ kind: z.enum(contentKinds), id: idSchema });

export async function setStatusAction(kind: string, id: string, status: string): Promise<Result> {
  const session = await requireAdmin();
  const a = kindId.safeParse({ kind, id });
  const b = z.enum(contentStatuses).safeParse(status);
  if (!a.success || !b.success) return { ok: false, error: "Invalid request" };
  const r = await setContentStatus(a.data.kind, a.data.id, b.data, session.userId);
  if (r.ok) revalidateContent();
  return r;
}

export async function moveAction(kind: string, id: string, direction: string): Promise<Result> {
  const session = await requireAdmin();
  const a = kindId.safeParse({ kind, id });
  const d = z.enum(["up", "down"]).safeParse(direction);
  if (!a.success || !d.success) return { ok: false, error: "Invalid request" };
  const r = await moveContent(a.data.kind, a.data.id, d.data, session.userId);
  if (r.ok) revalidateContent();
  return r;
}

export async function deleteAction(kind: string, id: string): Promise<Result> {
  const session = await requireAdmin();
  const a = kindId.safeParse({ kind, id });
  if (!a.success) return { ok: false, error: "Invalid request" };
  const r = await deleteContent(a.data.kind, a.data.id, session.userId);
  if (r.ok) revalidateContent();
  return r;
}

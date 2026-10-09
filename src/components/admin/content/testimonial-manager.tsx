"use client";

import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveTestimonialAction } from "@/app/admin/(panel)/content/actions";
import { ImageField } from "@/components/admin/catalogue/image-field";
import { ContentRow } from "@/components/admin/content/content-row";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { EmptyState, FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";
import type { MediaRef } from "@/lib/catalogue/types";

type Item = { id: string; quote: string; authorName: string; authorRole: string | null; status: "draft" | "published" | "archived"; avatar: MediaRef | null };

export function TestimonialManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  return (
    <section className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[56ch] text-ink-muted">Publishing a testimonial confirms the person has agreed to it being shown.</p>
        <Button onClick={() => setEditing("new")}><Plus size={18} aria-hidden /> Add a testimonial</Button>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No testimonials yet" body="Add the first one. It stays a draft until you publish it." />
      ) : (
        <ul className="divide-y divide-line rounded-card bg-surface">
          {items.map((t, i) => (
            <ContentRow key={t.id} kind="testimonial" id={t.id} name={t.authorName} status={t.status} first={i === 0} last={i === items.length - 1} onEdit={() => setEditing(t)}>
              <p>“{t.quote}”</p>
              <p className="mt-2 font-medium">{t.authorName}{t.authorRole ? <span className="font-normal text-ink-muted">, {t.authorRole}</span> : null}</p>
            </ContentRow>
          ))}
        </ul>
      )}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? "Add a testimonial" : "Edit testimonial"}>
        {editing !== null ? <TestimonialForm key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : editing} onSaved={() => { setEditing(null); router.refresh(); }} /> : null}
      </Dialog>
    </section>
  );
}

function TestimonialForm({ item, onSaved }: { item: Item | null; onSaved: () => void }) {
  const [quote, setQuote] = useState(item?.quote ?? "");
  const [authorName, setAuthorName] = useState(item?.authorName ?? "");
  const [authorRole, setAuthorRole] = useState(item?.authorRole ?? "");
  const [avatar, setAvatar] = useState<MediaRef | null>(item?.avatar ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); setError(null); startTransition(async () => { const r = await saveTestimonialAction({ id: item?.id ?? null, quote, authorName, authorRole, avatarMediaId: avatar?.id ?? null }); if (!r.ok) { setErrors(r.fieldErrors ?? {}); return setError(r.error ?? "Check the highlighted fields"); } onSaved(); }); }} className="flex min-h-0 flex-col gap-5 overflow-y-auto" noValidate>
      <TextareaField id="t-quote" label="Quote" hint="Shown exactly as written here." value={quote} error={errors.quote} maxLength={1500} rows={5} onChange={(e) => setQuote(e.target.value)} />
      <Field id="t-name" label="Name" value={authorName} error={errors.authorName} maxLength={120} required onChange={(e) => setAuthorName(e.target.value)} />
      <Field id="t-role" label="Role or place (optional)" value={authorRole} error={errors.authorRole} maxLength={120} onChange={(e) => setAuthorRole(e.target.value)} />
      <ImageField label="Photo (optional)" value={avatar} onChange={setAvatar} />
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <div><Button type="submit" size="lg" loading={pending}>{pending ? "Saving" : "Save"}</Button></div>
    </form>
  );
}

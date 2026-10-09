"use client";

import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveFaqAction } from "@/app/admin/(panel)/content/actions";
import { ContentRow } from "@/components/admin/content/content-row";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { EmptyState, FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";

type Faq = { id: string; question: string; answer: string; status: "draft" | "published" | "archived" };

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Faq | "new" | null>(null);
  return (
    <section className="flex max-w-4xl flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}><Plus size={18} aria-hidden /> Add a question</Button>
      </div>
      {faqs.length === 0 ? (
        <EmptyState title="No questions yet" body="Add the first question. It stays a draft until you publish it." />
      ) : (
        <ul className="divide-y divide-line rounded-card bg-surface">
          {faqs.map((f, i) => (
            <ContentRow key={f.id} kind="faq" id={f.id} name={f.question} status={f.status} first={i === 0} last={i === faqs.length - 1} onEdit={() => setEditing(f)}>
              <p className="font-medium">{f.question}</p>
              <p className="mt-1 text-ink-muted">{f.answer}</p>
            </ContentRow>
          ))}
        </ul>
      )}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? "Add a question" : "Edit question"}>
        {editing !== null ? <FaqForm key={editing === "new" ? "new" : editing.id} faq={editing === "new" ? null : editing} onSaved={() => { setEditing(null); router.refresh(); }} /> : null}
      </Dialog>
    </section>
  );
}

function FaqForm({ faq, onSaved }: { faq: Faq | null; onSaved: () => void }) {
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); setError(null); startTransition(async () => { const r = await saveFaqAction({ id: faq?.id ?? null, question, answer }); if (!r.ok) { setErrors(r.fieldErrors ?? {}); return setError(r.error ?? "Check the highlighted fields"); } onSaved(); }); }} className="flex min-h-0 flex-col gap-5 overflow-y-auto" noValidate>
      <Field id="faq-question" label="Question" value={question} error={errors.question} maxLength={300} required autoFocus onChange={(e) => setQuestion(e.target.value)} />
      <TextareaField id="faq-answer" label="Answer" hint="Shown exactly as written here." value={answer} error={errors.answer} maxLength={4000} rows={6} onChange={(e) => setAnswer(e.target.value)} />
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <div><Button type="submit" size="lg" loading={pending}>{pending ? "Saving" : "Save"}</Button></div>
    </form>
  );
}

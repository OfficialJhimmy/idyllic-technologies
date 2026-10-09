"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAuthorAction, saveAuthorAction } from "@/app/admin/(panel)/blog/taxonomy-actions";
import { ImageField } from "@/components/admin/catalogue/image-field";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";
import { slugify } from "@/lib/catalogue/slug";
import type { MediaRef } from "@/lib/catalogue/types";

type Props = {
  author: { id: string | null; name: string; slug: string; bio: string; avatar: MediaRef | null };
  postCount: number;
};

export function AuthorForm({ author, postCount }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(author);
  const [slugEdited, setSlugEdited] = useState(author.id !== null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage(null);
    startTransition(async () => {
      const result = await saveAuthorAction({ id: draft.id, name: draft.name, slug: draft.slug, bio: draft.bio, avatarMediaId: draft.avatar?.id ?? null });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        return setMessage({ tone: "error", text: result.error ?? "Check the highlighted fields" });
      }
      if (!draft.id && result.id) return router.replace(`/admin/blog/authors/${result.id}`);
      setMessage({ tone: "success", text: "Author saved" });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      if (!draft.id) return;
      const result = await deleteAuthorAction(draft.id);
      setConfirming(false);
      if (result && !result.ok) setMessage({ tone: "error", text: result.error ?? "Could not delete" });
    });
  }

  return (
    <form onSubmit={save} className="flex max-w-xl flex-col gap-6" noValidate>
      <Field
        id="author-name"
        label="Name"
        value={draft.name}
        error={errors.name}
        maxLength={120}
        required
        onChange={(e) => {
          const name = e.target.value;
          setDraft((d) => ({ ...d, name, slug: slugEdited ? d.slug : slugify(name) }));
        }}
      />
      <Field id="author-slug" label="Slug" hint="Used in the author page address." value={draft.slug} error={errors.slug} required onChange={(e) => { setSlugEdited(true); setDraft((d) => ({ ...d, slug: e.target.value })); }} />
      <TextareaField id="author-bio" label="Bio" value={draft.bio} maxLength={2000} error={errors.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} />
      <ImageField label="Photo" value={draft.avatar} onChange={(avatar) => setDraft((d) => ({ ...d, avatar }))} />
      {message ? <FormBanner tone={message.tone}>{message.text}</FormBanner> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Saving" : draft.id ? "Save author" : "Create author"}
        </Button>
        {draft.id ? (
          <Button variant="ghost" size="lg" onClick={() => setConfirming(true)} disabled={pending || postCount > 0}>
            Delete author
          </Button>
        ) : null}
      </div>
      {draft.id && postCount > 0 ? <p className="text-sm text-ink-muted">This author has {postCount} post{postCount === 1 ? "" : "s"}, so it cannot be deleted. Choose another author on those posts first.</p> : null}
      <ConfirmDialog open={confirming} onOpenChange={setConfirming} title="Delete this author?" body="This cannot be undone." confirmLabel="Delete author" onConfirm={remove} pending={pending} />
    </form>
  );
}

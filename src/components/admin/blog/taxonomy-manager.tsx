"use client";

import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTaxonomyAction, saveTaxonomyAction } from "@/app/admin/(panel)/blog/taxonomy-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { EmptyState, FormBanner } from "@/components/ui/states";
import { slugify } from "@/lib/catalogue/slug";
import type { TaxonomyRow } from "@/lib/blog/types";

type Props = { kind: "category" | "tag"; rows: TaxonomyRow[] };

const copy = {
  category: {
    singular: "category",
    plural: "categories",
    empty: "Categories group posts, for example by topic. Posts do not need one.",
    deleteBody: (n: number) => (n > 0 ? `${n} post${n === 1 ? "" : "s"} will be left without a category. The posts are not deleted.` : "No posts use it."),
  },
  tag: {
    singular: "tag",
    plural: "tags",
    empty: "Tags are created when you add them to a post. You can also add them here.",
    deleteBody: (n: number) => (n > 0 ? `It will be removed from ${n} post${n === 1 ? "" : "s"}. The posts are not deleted.` : "No posts use it."),
  },
} as const;

/** Shared screen for categories and tags: name and slug, add, edit and delete. */
export function TaxonomyManager({ kind, rows }: Props) {
  const router = useRouter();
  const c = copy[kind];
  const [editing, setEditing] = useState<TaxonomyRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<TaxonomyRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteTaxonomyAction(kind, deleting.id);
      setDeleting(null);
      if (!result.ok) setError(result.error ?? "Could not delete");
      router.refresh();
    });
  }

  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus size={18} aria-hidden /> Add {c.singular}
        </Button>
      </div>
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}

      {rows.length === 0 ? (
        <EmptyState title={`No ${c.plural} yet`} body={c.empty} action={<Button variant="secondary" onClick={() => setEditing("new")}>Add the first {c.singular}</Button>} />
      ) : (
        <ul className="divide-y divide-line rounded-card bg-surface">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.name}</p>
                <p className="truncate text-sm text-ink-muted">
                  <span className="font-mono">{row.slug}</span>, {row.postCount} post{row.postCount === 1 ? "" : "s"}
                </p>
              </div>
              <button type="button" aria-label={`Edit ${row.name}`} onClick={() => setEditing(row)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunken">
                <PencilSimple size={20} aria-hidden />
              </button>
              <button type="button" aria-label={`Delete ${row.name}`} onClick={() => setDeleting(row)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunken">
                <Trash size={20} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title={editing === "new" ? `Add ${c.singular}` : `Edit ${c.singular}`}>
        {editing !== null ? (
          <TaxonomyForm
            key={editing === "new" ? "new" : editing.id}
            kind={kind}
            row={editing === "new" ? null : editing}
            onSaved={() => {
              setEditing(null);
              setError(null);
              router.refresh();
            }}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Delete ${deleting.name}?` : `Delete ${c.singular}?`}
        body={deleting ? c.deleteBody(deleting.postCount) : ""}
        confirmLabel={`Delete ${c.singular}`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </section>
  );
}

function TaxonomyForm({ kind, row, onSaved }: { kind: "category" | "tag"; row: TaxonomyRow | null; onSaved: () => void }) {
  const [name, setName] = useState(row?.name ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(row !== null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setError(null);
    startTransition(async () => {
      const result = await saveTaxonomyAction(kind, { id: row?.id ?? null, name, slug });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        return setError(result.error ?? "Check the highlighted fields");
      }
      onSaved();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Field
        id="taxonomy-name"
        label="Name"
        value={name}
        error={errors.name}
        maxLength={80}
        required
        autoFocus
        onChange={(e) => {
          setName(e.target.value);
          if (!slugEdited) setSlug(slugify(e.target.value));
        }}
      />
      <Field
        id="taxonomy-slug"
        label="Slug"
        hint="Used in the address. Lower case letters, digits and hyphens."
        value={slug}
        error={errors.slug}
        required
        onChange={(e) => {
          setSlugEdited(true);
          setSlug(e.target.value);
        }}
      />
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <div>
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Saving" : row ? "Save" : "Add"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteBrandAction, saveBrandAction } from "@/app/admin/(panel)/brands/actions";
import { ImageField } from "@/components/admin/catalogue/image-field";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";
import { slugify } from "@/lib/catalogue/slug";
import type { MediaRef } from "@/lib/catalogue/types";

type Props = {
  brand: { id: string | null; name: string; slug: string; description: string; logo: MediaRef | null };
  productCount: number;
};

export function BrandForm({ brand, productCount }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(brand);
  const [slugEdited, setSlugEdited] = useState(brand.id !== null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage(null);
    startTransition(async () => {
      const result = await saveBrandAction({
        id: draft.id,
        name: draft.name,
        slug: draft.slug,
        description: draft.description,
        logoMediaId: draft.logo?.id ?? null,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        return setMessage({ tone: "error", text: result.error ?? "Check the highlighted fields" });
      }
      if (!draft.id) return router.replace(`/admin/brands/${result.id}`);
      setMessage({ tone: "success", text: "Brand saved" });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      if (!draft.id) return;
      const result = await deleteBrandAction(draft.id);
      setConfirming(false);
      if (result && !result.ok) setMessage({ tone: "error", text: result.error });
    });
  }

  return (
    <form onSubmit={save} className="flex max-w-xl flex-col gap-6" noValidate>
      <Field
        id="brand-name"
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
      <Field
        id="brand-slug"
        label="Slug"
        hint="Used in the brand page address. Lower case letters, digits and hyphens."
        value={draft.slug}
        error={errors.slug}
        required
        onChange={(e) => {
          setSlugEdited(true);
          setDraft((d) => ({ ...d, slug: e.target.value }));
        }}
      />
      <TextareaField id="brand-description" label="Description" value={draft.description} maxLength={2000} error={errors.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
      <ImageField label="Logo" value={draft.logo} onChange={(logo) => setDraft((d) => ({ ...d, logo }))} hint="A logo with a transparent background works best." />
      {message ? <FormBanner tone={message.tone}>{message.text}</FormBanner> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Saving" : draft.id ? "Save brand" : "Create brand"}
        </Button>
        {draft.id ? (
          <Button variant="ghost" size="lg" onClick={() => setConfirming(true)} disabled={pending || productCount > 0}>
            Delete brand
          </Button>
        ) : null}
      </div>
      {draft.id && productCount > 0 ? <p className="text-sm text-ink-muted">This brand has {productCount} product{productCount === 1 ? "" : "s"}, so it cannot be deleted.</p> : null}
      <ConfirmDialog open={confirming} onOpenChange={setConfirming} title="Delete this brand?" body="This cannot be undone." confirmLabel="Delete brand" onConfirm={remove} pending={pending} />
    </form>
  );
}

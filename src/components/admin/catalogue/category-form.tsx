"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveCategoryAction } from "@/app/admin/(panel)/categories/actions";
import { ImageField } from "@/components/admin/catalogue/image-field";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";
import type { MediaRef } from "@/lib/catalogue/types";

type Props = { category: { id: string; name: string; slug: string; description: string; image: MediaRef | null } };

/** Name and slug are fixed (there are exactly six categories). Description and image can change. */
export function CategoryForm({ category }: Props) {
  const router = useRouter();
  const [description, setDescription] = useState(category.description);
  const [image, setImage] = useState(category.image);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage(null);
    startTransition(async () => {
      const result = await saveCategoryAction({ id: category.id, description, imageMediaId: image?.id ?? null });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        return setMessage({ tone: "error", text: result.error ?? "Check the highlighted fields" });
      }
      setMessage({ tone: "success", text: "Category saved" });
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} className="flex max-w-xl flex-col gap-6" noValidate>
      <TextareaField id="category-description" label="Description" value={description} maxLength={2000} error={errors.description} onChange={(e) => setDescription(e.target.value)} />
      <ImageField label="Category image" value={image} onChange={setImage} />
      {message ? <FormBanner tone={message.tone}>{message.text}</FormBanner> : null}
      <div>
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Saving" : "Save category"}
        </Button>
      </div>
    </form>
  );
}

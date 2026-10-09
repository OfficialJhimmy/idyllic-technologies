"use client";

import { ImageField } from "@/components/admin/catalogue/image-field";
import { Field } from "@/components/ui/field";
import { TextareaField } from "@/components/ui/textarea-field";
import { Section } from "@/components/admin/form-section";
import type { SectionProps } from "./types";

export function SeoSection({ draft, update, errors }: SectionProps) {
  return (
    <Section id="seo" title="Search and sharing" description="Leave these blank to use the product name and summary.">
      <Field
        id="seo-title"
        label="Search title"
        hint="About 60 characters or fewer reads best in search results."
        meta={`${draft.seoTitle.length}/120`}
        value={draft.seoTitle}
        error={errors.seoTitle}
        maxLength={120}
        onChange={(e) => update({ seoTitle: e.target.value })}
      />
      <TextareaField
        id="seo-description"
        label="Search description"
        hint="About 160 characters or fewer."
        value={draft.seoDescription}
        error={errors.seoDescription}
        maxLength={300}
        rows={3}
        onChange={(e) => update({ seoDescription: e.target.value })}
      />
      <ImageField label="Sharing image" value={draft.ogImage} onChange={(ogImage) => update({ ogImage })} hint="Shown when the product link is shared. Leave blank to use the primary image." />
    </Section>
  );
}

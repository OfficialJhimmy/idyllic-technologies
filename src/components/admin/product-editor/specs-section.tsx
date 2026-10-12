"use client";

import Link from "next/link";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import type { CategoryOption, SpecDefinitionView } from "@/lib/catalogue/types";
import { Section } from "@/components/admin/form-section";
import type { SectionProps } from "./types";

type Props = SectionProps & { defs: SpecDefinitionView[]; categories: CategoryOption[] };

/** Fields come from the chosen category's spec template. Leave a spec blank when it is not known. */
export function SpecsSection({ draft, update, errors, defs, categories }: Props) {
  const category = categories.find((c) => c.id === draft.categoryId);
  const template = defs.filter((d) => d.categoryId === draft.categoryId);

  function setSpec(id: string, value: string | boolean | null) {
    update({ specs: { ...draft.specs, [id]: value } });
  }

  return (
    <Section id="specs" title="Specifications" description="Leave a field blank when the value is not known. Nothing is filled in for you.">
      {!category ? (
        <p className="text-ink-muted">Choose a category above to see its specs.</p>
      ) : template.length === 0 ? (
        <p className="max-w-[65ch] text-ink-muted">
          {category.name} has no specs yet.{" "}
          <Link prefetch={false} href={`/admin/categories/${category.slug}`} className="text-action underline underline-offset-4">
            Define them in the category
          </Link>{" "}
          once the manufacturer data is to hand.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {template.map((def) => {
            const id = `spec-${def.id}`;
            const label = def.unit ? `${def.label} (${def.unit})` : def.label;
            const error = errors[`specs.${def.id}`];
            const value = draft.specs[def.id];

            if (def.valueType === "enum") {
              return (
                <SelectField key={def.id} id={id} label={label} emptyLabel="Not set" options={(def.options ?? []).map((o) => ({ value: o, label: o }))} value={typeof value === "string" ? value : ""} error={error} onChange={(e) => setSpec(def.id, e.target.value)} />
              );
            }
            if (def.valueType === "boolean") {
              return (
                <SelectField
                  key={def.id}
                  id={id}
                  label={label}
                  emptyLabel="Not set"
                  options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]}
                  value={value === true ? "true" : value === false ? "false" : ""}
                  error={error}
                  onChange={(e) => setSpec(def.id, e.target.value === "" ? null : e.target.value === "true")}
                />
              );
            }
            return (
              <Field
                key={def.id}
                id={id}
                label={label}
                inputMode={def.valueType === "number" ? "decimal" : undefined}
                value={typeof value === "string" ? value : ""}
                error={error}
                hint={def.valueType === "number" ? "Numbers only" : undefined}
                onChange={(e) => setSpec(def.id, e.target.value)}
              />
            );
          })}
        </div>
      )}
    </Section>
  );
}

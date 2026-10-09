"use client";

import { useState, useTransition } from "react";
import { saveSpecAction } from "@/app/admin/(panel)/categories/actions";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";
import type { SpecValueType } from "@/lib/catalogue/spec-values";
import type { SpecDefinitionView } from "@/lib/catalogue/types";

const typeOptions: { value: SpecValueType; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "text", label: "Text" },
  { value: "enum", label: "One of a list" },
  { value: "boolean", label: "Yes or no" },
];

type Props = {
  categoryId: string;
  spec: SpecDefinitionView | null;
  /** Products that already hold a value. Locks the key and type, which the server also enforces. */
  valueCount: number;
  onSaved: () => void;
};

export function SpecForm({ categoryId, spec, valueCount, onSaved }: Props) {
  const editing = spec !== null;
  const [key, setKey] = useState(spec?.key ?? "");
  const [label, setLabel] = useState(spec?.label ?? "");
  const [valueType, setValueType] = useState<SpecValueType>(spec?.valueType ?? "number");
  const [unit, setUnit] = useState(spec?.unit ?? "");
  const [options, setOptions] = useState((spec?.options ?? []).join("\n"));
  const [comparable, setComparable] = useState(spec?.comparable ?? true);
  const [filterable, setFilterable] = useState(spec?.filterable ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setError(null);
    startTransition(async () => {
      const result = await saveSpecAction({
        id: spec?.id ?? null,
        categoryId,
        key,
        label,
        unit,
        valueType,
        options: valueType === "enum" ? options.split("\n").map((o) => o.trim()).filter(Boolean) : null,
        comparable,
        filterable,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        return setError(result.error ?? "Check the highlighted fields");
      }
      onSaved();
    });
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-col gap-5 overflow-y-auto" noValidate>
      <Field id="spec-label" label="Label" hint="What staff and customers see, for example Rating." value={label} error={errors.label} maxLength={120} required onChange={(e) => setLabel(e.target.value)} />
      <Field
        id="spec-key"
        label="Key"
        hint={editing ? "The key cannot change once the spec exists." : "A short code name, for example rating_va. It cannot be changed later."}
        value={key}
        error={errors.key}
        disabled={editing}
        required
        onChange={(e) => setKey(e.target.value)}
      />
      <SelectField
        id="spec-type"
        label="Type"
        options={typeOptions}
        value={valueType}
        error={errors.valueType}
        disabled={editing && valueCount > 0}
        hint={editing && valueCount > 0 ? `${valueCount} product(s) already have a value, so the type is locked.` : undefined}
        onChange={(e) => setValueType(e.target.value as SpecValueType)}
      />
      {valueType !== "boolean" ? (
        <Field id="spec-unit" label="Unit (optional)" hint="For example kg, mm, VA or V." value={unit} error={errors.unit} maxLength={20} onChange={(e) => setUnit(e.target.value)} />
      ) : null}
      {valueType === "enum" ? (
        <TextareaField id="spec-options" label="Options" hint="One option per line." value={options} error={errors.options} rows={5} onChange={(e) => setOptions(e.target.value)} />
      ) : null}
      <fieldset className="flex flex-col">
        <legend className="mb-1 text-sm font-medium">Use on the marketplace</legend>
        <CheckboxField label="Comparable" hint="Shown in the compare table when every product being compared has a value." checked={comparable} onChange={(e) => setComparable(e.target.checked)} />
        <CheckboxField label="Filterable" hint="Offered as a filter on the category page." checked={filterable} onChange={(e) => setFilterable(e.target.checked)} />
      </fieldset>
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <div>
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Saving" : editing ? "Save spec" : "Add spec"}
        </Button>
      </div>
    </form>
  );
}

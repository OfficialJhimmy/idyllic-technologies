import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import type { SelectHTMLAttributes } from "react";
import { controlClass, FieldShell } from "@/components/ui/field";

type Option = { value: string; label: string };

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children"> & {
  id: string;
  label: string;
  options: Option[];
  /** Label of the empty choice. Leave out when a choice is always required. */
  emptyLabel?: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
};

/** Native select. It gives phones their own picker and keeps keyboard and screen reader behaviour. */
export function SelectField({ id, label, options, emptyLabel, hint, error, hideLabel, className = "", ...rest }: Props) {
  return (
    <FieldShell id={id} label={hideLabel ? "" : label} hint={hint} error={error}>
      {(aria) => (
        <div className="relative">
          <select
            id={id}
            aria-label={hideLabel ? label : undefined}
            {...aria}
            className={controlClass(Boolean(error), `h-12 appearance-none pr-11 ${className}`)}
            {...rest}
          >
            {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <CaretDown size={18} aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-muted" />
        </div>
      )}
    </FieldShell>
  );
}

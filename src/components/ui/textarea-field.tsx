import type { TextareaHTMLAttributes } from "react";
import { controlClass, FieldShell } from "@/components/ui/field";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Shows "used / max" beside the label. */
  maxLength?: number;
  /** Leave out for an uncontrolled field. The character count then only shows once a value is passed. */
  value?: string;
};

export function TextareaField({ id, label, hint, error, maxLength, value, className = "", rows = 4, ...rest }: Props) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} meta={maxLength && value !== undefined ? `${value.length}/${maxLength}` : undefined}>
      {(aria) => (
        <textarea
          id={id}
          {...aria}
          rows={rows}
          value={value}
          maxLength={maxLength}
          className={controlClass(Boolean(error), `py-3 leading-relaxed ${className}`)}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

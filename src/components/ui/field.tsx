import type { InputHTMLAttributes } from "react";

/** Shared look of every text control, so inputs, textareas and selects match. */
export function controlClass(hasError: boolean, extra = "") {
  return (
    "w-full rounded-input border bg-surface px-4 text-base text-ink placeholder:text-ink-muted " +
    "transition-colors duration-150 disabled:opacity-60 " +
    (hasError ? "border-error " : "border-line-strong ") +
    extra
  );
}

type ShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (aria: { "aria-invalid"?: true; "aria-describedby"?: string }) => React.ReactNode;
  /** Shown to the right of the label, for example a character count. */
  meta?: React.ReactNode;
};

/** Label above the control, hint and error below. Never uses the placeholder as the label. */
export function FieldShell({ id, label, hint, error, meta, children }: ShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {meta ? <span className="text-sm text-ink-muted tabular-nums">{meta}</span> : null}
      </div>
      {children({ "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  meta?: React.ReactNode;
};

export function Field({ id, label, hint, error, meta, className = "", ...input }: FieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} meta={meta}>
      {(aria) => <input id={id} {...aria} className={controlClass(Boolean(error), `h-12 ${className}`)} {...input} />}
    </FieldShell>
  );
}

import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; hint?: string };

/** The whole row is the click target, so it stays at least 44px tall. */
export function CheckboxField({ label, hint, className = "", ...input }: Props) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-start gap-3 py-2 ${className}`}>
      <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--action)]" {...input} />
      <span className="flex flex-col">
        <span className="text-[0.9375rem] text-ink">{label}</span>
        {hint ? <span className="text-sm text-ink-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

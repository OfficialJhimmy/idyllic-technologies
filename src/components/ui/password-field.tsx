"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState, type InputHTMLAttributes } from "react";
import { controlClass, FieldShell } from "@/components/ui/field";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

/** Password input with a show and hide button. The button is part of the field, so it keeps a 44px target. */
export function PasswordField({ id, label, hint, error, className = "", ...input }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      {(aria) => (
        <div className="relative">
          <input
            id={id}
            {...aria}
            type={visible ? "text" : "password"}
            autoCapitalize="none"
            spellCheck={false}
            className={controlClass(Boolean(error), `h-12 pr-14 ${className}`)}
            {...input}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-[background-color,color,transform] duration-150 hover:bg-sunken hover:text-ink active:scale-[0.95]"
          >
            {visible ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
          </button>
        </div>
      )}
    </FieldShell>
  );
}

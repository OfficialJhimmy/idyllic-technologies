"use client";

import { Desktop, Moon, Sun } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import { nextTheme, readTheme, setTheme, subscribeTheme, type ThemePreference } from "@/lib/theme";

const options: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Desktop },
];

const useTheme = () => useSyncExternalStore(subscribeTheme, readTheme, (): ThemePreference => "light");

const press = "transition-[background-color,color,transform] duration-150 active:scale-[0.95]";

/** Three buttons: Light, Dark, or follow the system. Use `compact` on narrow bars for a single cycling button. */
export function ThemeToggle({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const theme = useTheme();

  if (compact) {
    const current = options.find((o) => o.value === theme)!;
    const next = options.find((o) => o.value === nextTheme[theme])!;
    return (
      <button
        type="button"
        onClick={() => setTheme(next.value)}
        aria-label={`Theme: ${current.label}. Switch to ${next.label}`}
        className={`flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-sunken ${press} ${className}`}
      >
        <current.Icon size={20} aria-hidden />
      </button>
    );
  }

  return (
    <div role="radiogroup" aria-label="Theme" className={`inline-flex w-fit rounded-full border border-line-strong p-0.5 ${className}`}>
      {options.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${press} ${selected ? "bg-primary text-on-primary" : "text-ink-muted hover:bg-sunken hover:text-ink"}`}
          >
            <Icon size={18} weight={selected ? "fill" : "regular"} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] active:scale-[0.97] " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-action text-on-action hover:bg-action-hover",
  accent: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-sunken",
  ghost: "text-ink hover:bg-sunken",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-12 px-6 text-base",
};

/** Class string for anything that should look like a button, such as a link. */
export function buttonStyles({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner before the label, disables the button and marks it busy. */
  loading?: boolean;
};

export function Button({ variant, size, className = "", type = "button", loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonStyles({ variant, size })} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

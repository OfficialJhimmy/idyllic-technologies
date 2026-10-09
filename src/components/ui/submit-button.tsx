"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "accent" | "secondary" | "ghost";
  className?: string;
};

/** Submit button that disables itself and swaps its label while the parent form is pending. */
export function SubmitButton({ children, pendingLabel, variant, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size="lg" loading={pending} className={className}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** "sheet" fills the screen on phones and centres on large screens. */
  size?: "sm" | "lg";
  children: React.ReactNode;
};

/**
 * Radix dialog with the project's look. Focus is trapped and returned to the trigger by Radix.
 * A small dialog never grows past the screen: its header stays put and the content scrolls.
 * A form inside a dialog must not submit the form the dialog was opened from. React passes events up through
 * a portal as if the dialog were still inside it, so submit events are stopped at the dialog's edge.
 */
export function Dialog({ open, onOpenChange, title, description, size = "sm", children }: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="dialog-overlay fixed inset-0 z-40 bg-ink/40" />
        <RadixDialog.Content
          onSubmit={(event) => event.stopPropagation()}
          className={
            "dialog-content fixed z-50 flex flex-col gap-5 bg-surface p-5 shadow-raised outline-none " +
            (size === "lg"
              ? "inset-0 sm:inset-x-6 sm:inset-y-8 sm:mx-auto sm:max-w-4xl sm:rounded-container sm:p-8"
              : "top-1/2 left-1/2 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card sm:p-6")
          }
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <RadixDialog.Title className="font-heading text-xl font-medium">{title}</RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="text-ink-muted">{description}</RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              aria-label="Close"
              className="-mt-1 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-sunken"
            >
              <X size={20} aria-hidden />
            </RadixDialog.Close>
          </div>
          {size === "lg" ? children : <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-1">{children}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

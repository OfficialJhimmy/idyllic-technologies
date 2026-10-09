"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { NavLinks } from "@/components/corporate/nav-links";
import { ShopLink } from "@/components/corporate/shop-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Phone navigation: a full height sheet from the right. Radix handles focus, Escape and scroll lock. */
export function MobileMenu({ marketplaceFallback, marketplaceLabel }: { marketplaceFallback: string; marketplaceLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label="Open menu" className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95] lg:hidden">
        <List size={24} aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content className="sheet-right fixed inset-y-0 right-0 z-50 flex w-[min(24rem,100vw)] flex-col gap-8 bg-surface p-5 shadow-raised outline-none">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-heading text-xl font-medium">Menu</Dialog.Title>
            <Dialog.Close aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunken">
              <X size={22} aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
          <NavLinks orientation="column" onNavigate={() => setOpen(false)} />
          <div className="mt-auto flex flex-col gap-4">
            <ShopLink fallback={marketplaceFallback} className="flex h-12 items-center justify-center rounded-full bg-accent font-medium text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.97]">
              {marketplaceLabel}
            </ShopLink>
            <ThemeToggle />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

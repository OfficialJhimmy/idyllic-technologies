"use client";

import {
  Article,
  Envelope,
  FolderSimple,
  GearSix,
  Image as ImageIcon,
  Question,
  Package,
  SquaresFour,
  Tag,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { label: string; href: string; icon: Icon; ready: boolean };

// Sections are switched on as their phase ships. Settings arrives later.
const items: Item[] = [
  { label: "Dashboard", href: "/admin", icon: SquaresFour, ready: true },
  { label: "Products", href: "/admin/products", icon: Package, ready: true },
  { label: "Categories", href: "/admin/categories", icon: FolderSimple, ready: true },
  { label: "Brands", href: "/admin/brands", icon: Tag, ready: true },
  { label: "Blog", href: "/admin/blog", icon: Article, ready: true },
  { label: "Content", href: "/admin/content", icon: Question, ready: true },
  { label: "Media", href: "/admin/media", icon: ImageIcon, ready: true },
  { label: "Enquiries", href: "/admin/enquiries", icon: Envelope, ready: true },
  { label: "Settings", href: "/admin/settings", icon: GearSix, ready: false },
];

const row =
  "flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-[0.9375rem] font-medium whitespace-nowrap " +
  "transition-colors duration-150";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map(({ label, href, icon: IconComponent, ready }) => {
          const current = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          const content = (
            <>
              <IconComponent size={20} weight={current ? "fill" : "regular"} aria-hidden />
              {label}
            </>
          );
          return (
            <li key={href}>
              {ready ? (
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={`${row} ${current ? "bg-primary text-on-primary" : "text-ink hover:bg-sunken"}`}
                >
                  {content}
                </Link>
              ) : (
                <span aria-disabled="true" className={`${row} cursor-not-allowed text-ink-muted opacity-70`}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

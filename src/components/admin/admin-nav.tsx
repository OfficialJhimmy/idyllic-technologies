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
import { canAccess, type Role, type Section } from "@/lib/permissions";

type Item = { label: string; href: string; icon: Icon; ready: boolean; section: Section };

// A person only sees the sections their role can use (see src/lib/permissions.ts).
const items: Item[] = [
  { label: "Dashboard", href: "/admin", icon: SquaresFour, ready: true, section: "dashboard" },
  { label: "Products", href: "/admin/products", icon: Package, ready: true, section: "products" },
  { label: "Categories", href: "/admin/categories", icon: FolderSimple, ready: true, section: "categories" },
  { label: "Brands", href: "/admin/brands", icon: Tag, ready: true, section: "brands" },
  { label: "Blog", href: "/admin/blog", icon: Article, ready: true, section: "blog" },
  { label: "Content", href: "/admin/content", icon: Question, ready: true, section: "content" },
  { label: "Media", href: "/admin/media", icon: ImageIcon, ready: true, section: "media" },
  { label: "Enquiries", href: "/admin/enquiries", icon: Envelope, ready: true, section: "enquiries" },
  { label: "Settings", href: "/admin/settings", icon: GearSix, ready: true, section: "settings" },
];

const row =
  "flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-[0.9375rem] font-medium whitespace-nowrap " +
  "transition-colors duration-150";

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.filter((item) => canAccess(role, item.section)).map(({ label, href, icon: IconComponent, ready }) => {
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

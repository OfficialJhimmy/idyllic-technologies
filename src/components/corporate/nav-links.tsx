"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/content/navigation";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** The main navigation as a pill group. The current page is filled and marked for screen readers. */
export function NavLinks({ onNavigate, orientation = "row" }: { onNavigate?: () => void; orientation?: "row" | "column" }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className={orientation === "row" ? "flex items-center gap-1" : "flex flex-col gap-1"}>
        {mainNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center rounded-full px-4 font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${orientation === "column" ? "text-xl" : "text-[0.9375rem]"} ${active ? "bg-primary text-on-primary" : "text-ink-muted hover:bg-sunken hover:text-ink"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

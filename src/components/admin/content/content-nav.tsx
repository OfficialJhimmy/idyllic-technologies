"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "FAQs", href: "/admin/content/faqs" },
  { label: "Testimonials", href: "/admin/content/testimonials" },
  { label: "Clients and partners", href: "/admin/content/clients" },
] as const;

export function ContentNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Content" className="mb-8 flex justify-center">
      <ul className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className={`flex h-11 items-center rounded-full px-3 font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 active:scale-[0.97] min-[400px]:px-4 sm:px-5 ${active ? "bg-primary text-on-primary" : "text-ink-muted hover:bg-sunken hover:text-ink"}`}>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

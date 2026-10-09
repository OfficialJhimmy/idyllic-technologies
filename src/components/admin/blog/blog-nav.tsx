"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Posts", href: "/admin/blog" },
  { label: "Categories", href: "/admin/blog/categories" },
  { label: "Tags", href: "/admin/blog/tags" },
  { label: "Authors", href: "/admin/blog/authors" },
] as const;

/** Sub navigation for the blog. Posts stays active on the editor pages too. */
export function BlogNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin/blog"
      ? pathname === href || (pathname.startsWith("/admin/blog/") && !tabs.slice(1).some((t) => pathname.startsWith(t.href)))
      : pathname.startsWith(href);

  return (
    <nav aria-label="Blog" className="mb-8 flex justify-center">
      <ul className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={isActive(t.href) ? "page" : undefined}
              className={`flex h-11 items-center rounded-full px-3 font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 active:scale-[0.97] min-[400px]:px-4 sm:px-5 ${isActive(t.href) ? "bg-primary text-on-primary" : "text-ink-muted hover:bg-sunken hover:text-ink"}`}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

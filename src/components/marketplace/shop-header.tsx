import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Container } from "@/components/corporate/container";
import { SiteLink } from "@/components/corporate/shop-link";
import { HeaderCounters } from "@/components/marketplace/header-counters";
import { ShopSearch } from "@/components/marketplace/shop-search";
import { Wordmark } from "@/components/ui/wordmark";
import type { PublicCategory } from "@/db/queries/public";
import { siteUrl } from "@/lib/seo";

/** Marketplace header: name, search, compare and booking list with counts, and the six categories underneath. */
export function ShopHeader({ categories }: { categories: PublicCategory[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <Container className="flex h-[4.5rem] items-center gap-3 sm:gap-6">
        <Link href="/" aria-label="Idyllic Technologies Marketplace, home" className="flex min-h-11 shrink-0 items-center gap-3 rounded-full">
          <Wordmark />
        </Link>
        <span className="hidden text-ink-muted xl:inline">Marketplace</span>
        <ShopSearch className="hidden max-w-xl flex-1 md:block" />
        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunken md:hidden" aria-label="Search products">
            <MagnifyingGlass size={22} aria-hidden />
          </Link>
          <HeaderCounters />
          <SiteLink fallback={siteUrl()} path="/" className="hidden h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium text-ink-muted transition-colors duration-150 hover:bg-sunken hover:text-ink xl:flex">
            Main site
          </SiteLink>
        </div>
      </Container>
      <nav aria-label="Categories" className="border-t border-line">
        <Container>
          <ul className="flex gap-1 overflow-x-auto py-1.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="flex h-10 items-center rounded-full px-4 text-[0.9375rem] font-medium whitespace-nowrap text-ink-muted transition-[background-color,color] duration-150 hover:bg-sunken hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  );
}

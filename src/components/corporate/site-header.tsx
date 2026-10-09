import Link from "next/link";
import { Container } from "@/components/corporate/container";
import { MobileMenu } from "@/components/corporate/mobile-menu";
import { ShopLink } from "@/components/corporate/shop-link";
import { NavLinks } from "@/components/corporate/nav-links";
import { Wordmark } from "@/components/ui/wordmark";
import { marketplaceLabel } from "@/content/navigation";
import { shopUrl } from "@/lib/seo";

/** One line, 72px, sticky. A floating pill so the page is never hidden behind a heavy bar. */
export function SiteHeader() {
  const shop = shopUrl();
  return (
    <header className="sticky top-0 z-30 pt-3">
      <Container>
        <div className="flex h-[4.5rem] items-center justify-between gap-4 rounded-full border border-line bg-surface pr-3 pl-5 shadow-raised">
          <Link href="/" aria-label="Idyllic Technologies, home" className="flex min-h-11 items-center rounded-full">
            <Wordmark />
          </Link>
          <div className="hidden lg:block">
            <NavLinks />
          </div>
          <div className="flex items-center gap-1">
            <ShopLink fallback={shop} className="hidden h-12 items-center rounded-full bg-accent px-6 font-medium whitespace-nowrap text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.97] sm:flex">
              {marketplaceLabel}
            </ShopLink>
            <MobileMenu marketplaceFallback={shop} marketplaceLabel={marketplaceLabel} />
          </div>
        </div>
      </Container>
    </header>
  );
}

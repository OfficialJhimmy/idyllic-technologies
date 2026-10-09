import { getOpeningTurn } from "@/assistant/server-engine";
import { AssistantLauncher } from "@/assistant/ui/assistant";
import { AnalyticsScript } from "@/components/analytics-script";
import { ScrollReveal } from "@/components/scroll-reveal";
import { JsonLd } from "@/components/corporate/json-ld";
import { SiteFooter } from "@/components/corporate/site-footer";
import { SiteHeader } from "@/components/corporate/site-header";
import { getPublicCategories, getSiteContent } from "@/db/queries/public";
import { organizationJsonLd, SITE_NAME, absoluteUrl, shopUrl } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  };
}

export default async function CorporateLayout({ children }: { children: React.ReactNode }) {
  const [content, categories, opening] = await Promise.all([getSiteContent(), getPublicCategories(), getOpeningTurn()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-5 focus:py-3 focus:font-medium focus:shadow-raised">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter contact={content.contact} categories={categories} />
      <AssistantLauncher opening={opening} host="corporate" origins={{ shop: shopUrl(), site: "" }} />
      <JsonLd data={organizationJsonLd(content.contact)} />
      <ScrollReveal />
      <AnalyticsScript />
    </>
  );
}

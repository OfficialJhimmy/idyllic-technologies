import type { Metadata } from "next";
import { Container } from "@/components/corporate/container";
import { CompareView } from "@/components/marketplace/compare-view";
import { pageMetadata } from "@/lib/seo";

// Personal to each visitor, so not for search engines.
export const metadata: Metadata = { ...pageMetadata({ host: "shop", title: "Compare", path: "/compare" }), robots: { index: false, follow: true } };

export default function ComparePage() {
  return (
    <Container className="flex flex-col gap-8 pt-10 pb-24">
      <h1 className="hero-rise text-5xl font-medium sm:text-6xl">Compare</h1>
      <CompareView />
    </Container>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/corporate/container";
import { ListView } from "@/components/marketplace/list-view";
import { pageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = { ...pageMetadata({ host: "shop", title: "Booking list", path: "/list" }), robots: { index: false, follow: true } };

export default function BookingListPage() {
  return (
    <Container className="flex flex-col gap-8 pt-10 pb-24">
      <h1 className="hero-rise text-5xl font-medium sm:text-6xl">Booking list</h1>
      <ListView quoteFallback={siteUrl()} />
    </Container>
  );
}

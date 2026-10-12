import type { Metadata } from "next";
import { CtaBand } from "@/components/corporate/cta-band";
import { CategoryBento } from "@/components/corporate/home/category-bento";
import { Hero } from "@/components/corporate/home/hero";
import { IndustriesSection } from "@/components/corporate/home/industries-section";
import { LogoWall } from "@/components/corporate/home/logo-wall";
import { News } from "@/components/corporate/home/news";
import { Principles } from "@/components/corporate/home/principles";
import { Responsibility } from "@/components/corporate/home/responsibility";
import { TeamProcess } from "@/components/corporate/home/team-process";
import { Testimonials } from "@/components/corporate/home/testimonials";
import { TrustStats } from "@/components/corporate/home/trust-stats";
import { WhoWeAre } from "@/components/corporate/home/who-we-are";
import { hero, story } from "@/content/pages";
import { getPublicCategories, getPublishedClients, getPublishedPosts, getPublishedTestimonials, getSiteContent } from "@/db/queries/public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Idyllic Technologies", description: story.tagline, path: "/" });

export default async function HomePage() {
  const [content, categories, clients, testimonials, news] = await Promise.all([
    getSiteContent(),
    getPublicCategories(),
    getPublishedClients(),
    getPublishedTestimonials(),
    getPublishedPosts({ page: 1, pageSize: 3 }),
  ]);

  return (
    <>
      <Hero />
      <TrustStats stats={content.stats} />
      <WhoWeAre />
      <CategoryBento categories={categories} />
      <IndustriesSection />
      <Principles />
      <LogoWall clients={clients} />
      <TeamProcess members={content.team} process={content.workProcess} />
      <Responsibility />
      <Testimonials items={testimonials} />
      <News posts={news.rows} />
      <CtaBand contact={content.contact} />
    </>
  );
}

import type { Metadata } from "next";
import { CompanyOverview, MissionValues, OurStory } from "@/components/corporate/about-sections";
import { CtaBand } from "@/components/corporate/cta-band";
import { TeamProcess } from "@/components/corporate/home/team-process";
import { Testimonials } from "@/components/corporate/home/testimonials";
import { PageHero } from "@/components/corporate/page-hero";
import { about } from "@/content/pages";
import { getPublishedTestimonials, getSiteContent } from "@/db/queries/public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: about.title, description: about.headline, path: "/about" });

export default async function AboutPage() {
  const [content, testimonials] = await Promise.all([getSiteContent(), getPublishedTestimonials()]);
  return (
    <>
      <PageHero title={about.title} body={about.headline} />
      <OurStory />
      <CompanyOverview />
      <TeamProcess members={content.team} process={content.workProcess} />
      <MissionValues />
      <Testimonials items={testimonials} />
      <CtaBand contact={content.contact} />
    </>
  );
}

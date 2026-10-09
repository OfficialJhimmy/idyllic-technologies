import { Container } from "@/components/corporate/container";
import { IndustriesExplorer } from "@/components/corporate/home/industries-explorer";
import { SectionHeading } from "@/components/corporate/section-heading";
import { industries, industriesIntro } from "@/content/pages";

export function IndustriesSection() {
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="reveal flex flex-col gap-12">
        <SectionHeading title={industriesIntro.title} />
        <IndustriesExplorer industries={industries} />
      </div>
    </Container>
  );
}

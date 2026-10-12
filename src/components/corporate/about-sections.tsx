import Image from "next/image";
import { Container } from "@/components/corporate/container";
import { about, mission, story } from "@/content/pages";

/** The full company story, with the tagline beside it. This is where "Read our full story" on the home page lands. */
export function OurStory() {
  const [lead, ...rest] = story.paragraphs;
  return (
    <Container as="section" id="our-story" className="scroll-mt-28 py-12 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="reveal flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
          <h2 className="text-4xl font-medium sm:text-5xl lg:text-6xl">{story.title}</h2>
          <p className="font-heading text-2xl leading-snug font-medium sm:text-3xl">{story.tagline}</p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="reveal max-w-[62ch] text-2xl leading-snug">{lead}</p>
          {rest.map((p) => (
            <p key={p.slice(0, 24)} className="reveal max-w-[62ch] text-lg leading-relaxed text-ink-muted">
              {p}
            </p>
          ))}
          <p className="reveal flex flex-col gap-1 border-t border-line pt-6">
            <span className="font-heading text-2xl font-medium">{story.signature.name}</span>
            <span className="text-lg text-ink-muted">{story.signature.line}</span>
          </p>
        </div>
      </div>
    </Container>
  );
}

/** Company overview: the approved culture paragraphs beside a photograph, and the founder's name. */
export function CompanyOverview() {
  return (
    <Container as="section" className="py-12 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
        <div className="reveal flex flex-col gap-6">
          {about.culture.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-[62ch] text-lg leading-relaxed text-ink-muted first:text-2xl first:leading-snug first:text-ink">
              {p}
            </p>
          ))}
          <p className="flex flex-col pt-2">
            <span className="font-heading text-2xl font-medium">{about.ceo.name}</span>
            <span className="text-ink-muted">{about.ceo.role}</span>
          </p>
        </div>
        <div className="reveal relative aspect-[4/3] overflow-hidden rounded-container bg-sunken">
          <Image src={about.image.src} alt={about.image.alt} fill sizes="(min-width: 1024px) 36rem, 100vw" className="object-cover" style={{ objectPosition: "30% 50%" }} />
        </div>
      </div>
    </Container>
  );
}

/** Mission, vision and the five core values, all as approved. */
export function MissionValues() {
  const blocks = [mission.mission, mission.vision];
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="flex flex-col gap-14">
        <h2 className="reveal text-4xl font-medium sm:text-5xl lg:text-6xl">{mission.title}</h2>
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {blocks.map((b) => (
            <div key={b.title} className="reveal flex flex-col gap-4 border-t border-line pt-6">
              <h3 className="text-xl font-medium">{b.title}</h3>
              <p className="font-heading text-2xl leading-snug font-medium sm:text-3xl">{b.quote}</p>
              <p className="max-w-[56ch] text-lg leading-relaxed text-ink-muted">{b.body}</p>
            </div>
          ))}
        </div>
        <div className="reveal flex flex-col gap-6 rounded-container bg-footer p-8 text-on-footer sm:p-12">
          <h3 className="text-xl font-medium">{mission.values.title}</h3>
          <p className="max-w-[40ch] font-heading text-2xl leading-snug font-medium sm:text-4xl">{mission.values.quote}</p>
          <ul className="flex flex-wrap gap-3 pt-2">
            {mission.values.items.map((v) => (
              <li key={v} className="rounded-full border border-footer-line px-5 py-2.5 text-lg">
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}

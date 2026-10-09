import Image from "next/image";
import { Container } from "@/components/corporate/container";
import { about, mission } from "@/content/pages";

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

import Image from "next/image";
import { Container } from "@/components/corporate/container";
import { responsibility } from "@/content/pages";

/** The approved statement and the pillars that have copy. A pillar with no approved text is left out, not invented. */
export function Responsibility() {
  const pillars = responsibility.pillars.filter((p) => p.body);
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div className="reveal relative aspect-[4/5] overflow-hidden rounded-container bg-sunken lg:aspect-[3/4]">
          <Image src={responsibility.image.src} alt={responsibility.image.alt} fill sizes="(min-width: 1024px) 34rem, 100vw" className="object-cover" />
        </div>
        <div className="reveal flex flex-col gap-8">
          <h2 className="text-4xl font-medium sm:text-5xl lg:text-6xl">{responsibility.title}</h2>
          <p className="max-w-[52ch] text-2xl leading-snug">{responsibility.body}</p>
          <ul className="flex flex-col border-t border-line">
            {pillars.map((p) => (
              <li key={p.title} className="flex flex-col gap-2 border-b border-line py-6">
                <h3 className="text-xl font-medium">{p.title}</h3>
                <p className="max-w-[56ch] text-ink-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}

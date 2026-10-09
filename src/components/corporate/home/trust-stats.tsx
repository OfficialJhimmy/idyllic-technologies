import Image from "next/image";
import { Container } from "@/components/corporate/container";
import { about } from "@/content/pages";
import type { Stats } from "@/lib/site-values";

const tones = [
  "bg-action text-on-action",
  "bg-primary text-on-primary",
  "bg-sunken text-ink",
  "bg-footer text-on-footer",
] as const;

/**
 * The four approved figures in a bento with a photograph: five cells, no gaps. The figures are editable
 * values. Tiles differ in size and colour on purpose, so they do not read as a row of identical boxes.
 */
export function TrustStats({ stats }: { stats: Stats }) {
  const four = stats.slice(0, 4);
  // Row one: photo, wide tile, narrow tile. Row two: photo continues, narrow tile, wide tile.
  const spans = ["lg:col-span-4", "lg:col-span-3", "lg:col-span-3", "lg:col-span-4"];
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="grid gap-3 lg:grid-cols-12 lg:grid-rows-2">
        <div className="reveal relative min-h-72 overflow-hidden rounded-container lg:col-span-5 lg:row-span-2">
          <Image src={about.image.src} alt={about.image.alt} fill sizes="(min-width: 1024px) 34rem, 100vw" className="object-cover" style={{ objectPosition: "30% 50%" }} />
        </div>
        {four.map((stat, i) => (
          <div key={stat.label} className={`reveal flex min-h-44 flex-col justify-between gap-8 rounded-container p-6 sm:p-8 ${tones[i]} ${spans[i]}`}>
            <p className="font-heading text-6xl leading-none font-medium tabular-nums sm:text-7xl">{stat.display}</p>
            <p className="text-lg">{stat.label}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}

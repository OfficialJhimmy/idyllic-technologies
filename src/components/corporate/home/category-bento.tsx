import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/corporate/container";
import { MediaImage } from "@/components/corporate/media-image";
import { SectionHeading } from "@/components/corporate/section-heading";
import { productsIntro } from "@/content/pages";
import type { PublicCategory } from "@/db/queries/public";

// Four columns, three rows, six tiles, no gaps: one large, one wide, two small, then two wide.
const cells = [
  "sm:col-span-2 sm:row-span-2 min-h-96",
  "sm:col-span-2 min-h-56",
  "min-h-72",
  "min-h-72",
  "sm:col-span-2 min-h-64",
  "sm:col-span-2 min-h-64",
];

/** The six categories as photographs with their approved descriptions, each linking to its products. */
export function CategoryBento({ categories, showHeading = true }: { categories: PublicCategory[]; showHeading?: boolean }) {
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="reveal flex flex-col gap-12">
        {showHeading ? <SectionHeading title={productsIntro.title} body={productsIntro.body} /> : null}
        <ul className="grid gap-3 sm:grid-cols-4">
          {categories.map((c, i) => (
            <li key={c.id} className={cells[i] ?? "min-h-56"}>
              <Link href={`/products?category=${c.slug}`} className="group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-container p-6 text-white transition-transform duration-200 ease-[var(--ease-out-strong)] active:scale-[0.99]">
                {c.image ? <MediaImage image={c.image} fill sizes="(min-width: 640px) 40vw, 100vw" className="-z-20 object-cover transition-transform duration-700 ease-[var(--ease-out-strong)] group-hover:scale-[1.05]" /> : <div aria-hidden className="absolute inset-0 -z-20 bg-footer" />}
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1426]/85 via-[#0b1426]/35 to-transparent" />
                <div className="flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-medium sm:text-3xl">{c.name}</h3>
                    {c.description ? <p className="max-w-[40ch] text-[0.9375rem] text-white/85">{c.description}</p> : null}
                  </div>
                  <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0b1426] transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:rotate-45">
                    <ArrowUpRight size={20} weight="bold" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

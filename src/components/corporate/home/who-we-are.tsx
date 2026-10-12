import { Container } from "@/components/corporate/container";
import { PhotoCarousel } from "@/components/corporate/photo-carousel";
import { Wordmark } from "@/components/ui/wordmark";
import { about, company, hero } from "@/content/pages";
import { whoWeAreSlides } from "@/content/team-photos";

/** The company in its own words: a lead line, the two approved paragraphs, and the two promises. */
export function WhoWeAre() {
  return (
    <Container as="section" className="py-12 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="reveal flex flex-col gap-5">
          <h2 className="text-4xl font-medium sm:text-5xl lg:text-6xl">{about.whoWeAre.title}</h2>
          <p className="text-xl text-ink-muted">{about.whoWeAre.body}</p>
          <div className="mt-6 flex flex-col gap-6">
            <Wordmark className="[&_img]:h-12 [&_img]:w-12 [&_span]:text-2xl" />
            <PhotoCarousel slides={whoWeAreSlides} label="Idyllic Technologies at work" aspect="aspect-[5/4]" interval={7000} sizes="(min-width: 1024px) 34rem, 100vw" />
          </div>
        </div>
        <div className="reveal flex flex-col gap-8">
          <p className="text-2xl leading-snug sm:text-3xl">{company.overview}</p>
          <p className="max-w-[62ch] text-lg leading-relaxed text-ink-muted">{hero.detail}</p>
          <dl className="grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
            {[about.valueProposition, about.qualityAssurance].map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <dt className="text-sm font-medium text-ink-muted">{f.title}</dt>
                <dd className="font-heading text-2xl font-medium">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Container>
  );
}

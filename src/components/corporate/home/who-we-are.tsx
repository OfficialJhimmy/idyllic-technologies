import { ArrowLink } from "@/components/corporate/arrow-link";
import { Container } from "@/components/corporate/container";
import { PhotoCarousel } from "@/components/corporate/photo-carousel";
import { Wordmark } from "@/components/ui/wordmark";
import { about, story } from "@/content/pages";
import { whoWeAreSlides } from "@/content/team-photos";

/** The company in its own words: the tagline, the opening of the story, a way to read all of it, and the two promises. */
export function WhoWeAre() {
  return (
    <Container as="section" className="py-12 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="reveal flex flex-col gap-5">
          <h2 className="text-4xl font-medium sm:text-5xl lg:text-6xl">{story.title}</h2>
          <div className="mt-6 flex flex-col gap-6">
            <Wordmark className="[&_img]:h-12 [&_img]:w-12 [&_span]:text-2xl" />
            <PhotoCarousel slides={whoWeAreSlides} label="Idyllic Technologies at work" aspect="aspect-[5/4]" interval={7000} sizes="(min-width: 1024px) 34rem, 100vw" />
          </div>
        </div>
        <div className="reveal flex flex-col gap-8">
          <p className="text-2xl leading-snug sm:text-3xl">{story.tagline}</p>
          <div className="flex flex-col gap-4">
            {story.paragraphs.slice(0, 2).map((p) => (
              <p key={p.slice(0, 24)} className="max-w-[62ch] text-lg leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
          </div>
          <div>
            <ArrowLink href="/about#our-story" variant="secondary">
              Read our full story
            </ArrowLink>
          </div>
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

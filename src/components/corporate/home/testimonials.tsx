import { Container } from "@/components/corporate/container";

type Testimonial = { id: string; quote: string; authorName: string; authorRole: string | null };

/**
 * Published testimonials in a row that scrolls sideways and snaps. Quotes are shown exactly as supplied,
 * spelling included. With none published the section does not appear.
 */
export function Testimonials({ items, title = "Client Testimonials" }: { items: Testimonial[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="py-16 sm:py-24" aria-labelledby="testimonials-heading">
      <Container className="mb-10">
        <h2 id="testimonials-heading" className="reveal text-4xl font-medium sm:text-5xl">
          {title}
        </h2>
      </Container>
      <div tabIndex={0} role="region" aria-label="Testimonials, scroll sideways for more" className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:scroll-pl-8 sm:px-8 lg:scroll-pl-[max(3rem,calc((100vw-80rem)/2+3rem))] lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))]">
        {items.map((t) => (
          <figure key={t.id} className="flex w-[min(26rem,85vw)] shrink-0 snap-start flex-col justify-between gap-8 rounded-container bg-surface p-7 sm:p-8">
            <blockquote className="text-xl leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="flex flex-col">
              <span className="font-medium">{t.authorName}</span>
              {t.authorRole ? <span className="text-ink-muted">{t.authorRole}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

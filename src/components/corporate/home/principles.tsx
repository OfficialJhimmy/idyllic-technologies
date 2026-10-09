import { Container } from "@/components/corporate/container";
import { whyIdyllic } from "@/content/pages";

/** The three approved principles as a list: a large title beside its sentence, divided by hairlines. */
export function Principles() {
  return (
    <Container as="section" className="py-16 sm:py-24">
      <ul className="border-t border-line">
        {whyIdyllic.map((p) => (
          <li key={p.title} className="reveal grid gap-4 border-b border-line py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16 md:py-14">
            <h2 className="text-3xl font-medium sm:text-4xl lg:text-5xl">{p.title}</h2>
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-muted md:text-xl">{p.body}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}

import { Container } from "@/components/corporate/container";

/** Top of every inner page: the title, and one line if there is one. Calm, so the content leads. */
export function PageHero({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <Container as="section" className="pt-16 pb-10 sm:pt-24 sm:pb-14">
      <div className="hero-rise flex max-w-4xl flex-col gap-5">
        <h1 className="text-5xl font-medium sm:text-6xl lg:text-7xl">{title}</h1>
        {body ? <p className="max-w-[60ch] text-lg leading-relaxed text-ink-muted sm:text-xl">{body}</p> : null}
        {children}
      </div>
    </Container>
  );
}

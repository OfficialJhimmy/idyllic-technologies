import { Container } from "@/components/corporate/container";
import { PhotoCarousel, type Slide } from "@/components/corporate/photo-carousel";
import { team, workProcess } from "@/content/pages";
import { staffPhotos } from "@/content/team-photos";
import type { Team, WorkProcess } from "@/lib/site-values";

/**
 * The team statement with the CEO's portrait, then the work process: four approved figures drawn as a
 * bar with no track behind it, and the three approved steps. Figures and names are editable values.
 */
export function TeamProcess({ members, process }: { members: Team; process: WorkProcess }) {
  const ceo = members[0];
  // The CEO first, with the name and role from the editable team values, then the staff portraits supplied so far.
  const slides: Slide[] = [
    { src: team.ceoPhoto.src, alt: team.ceoPhoto.alt, width: team.ceoPhoto.width, height: team.ceoPhoto.height, caption: ceo?.name, subcaption: ceo?.role },
    ...staffPhotos.map((p) => ({ src: p.src, alt: p.alt, width: p.width, height: p.height, caption: p.name, subcaption: p.role })),
  ];
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="reveal">
          <PhotoCarousel slides={slides} label="Our team" aspect="aspect-[3/4]" position="top" interval={6500} sizes="(min-width: 1024px) 34rem, 100vw" />
        </div>

        <div className="flex flex-col gap-14">
          <div className="reveal flex flex-col gap-5">
            <h2 className="text-4xl font-medium sm:text-5xl">{team.title}</h2>
            <p className="max-w-[56ch] text-xl leading-relaxed text-ink-muted">{team.body}</p>
          </div>

          <div className="reveal flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-medium sm:text-4xl">{workProcess.title}</h2>
              <p className="max-w-[56ch] text-ink-muted">{workProcess.body}</p>
            </div>
            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {process.map((item) => (
                <div key={item.label} className="flex flex-col gap-3">
                  <dt className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-heading text-3xl font-medium tabular-nums">{item.percent}%</span>
                  </dt>
                  <div aria-hidden className="h-1.5 rounded-full bg-action" style={{ width: `${item.percent}%` }} />
                  <dd className="text-ink-muted">{item.description}</dd>
                </div>
              ))}
            </dl>
            <ul className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {workProcess.steps.map((step) => (
                <li key={step.title} className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className="text-ink-muted">{step.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}

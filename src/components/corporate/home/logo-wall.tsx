import { Container } from "@/components/corporate/container";
import { MediaImage } from "@/components/corporate/media-image";
import type { PublicClient } from "@/db/queries/public";

function Logo({ client }: { client: PublicClient }) {
  if (!client.logo) return <span className="px-4 font-heading text-xl font-medium text-ink-muted">{client.name}</span>;
  const img = <MediaImage image={client.logo} sizes="120px" className="h-16 w-auto rounded-input object-contain" />;
  return client.url ? (
    <a href={client.url} target="_blank" rel="noopener noreferrer" className="rounded-input">
      {img}
    </a>
  ) : (
    img
  );
}

/**
 * Only published logos are shown, and a group with none is left out entirely. Clients scroll slowly
 * (the page's one marquee, paused on hover and focus, still for reduced motion). Partners sit still.
 * Logos carry no labels, the image alone is the name.
 */
export function LogoWall({ clients }: { clients: PublicClient[] }) {
  const clientLogos = clients.filter((c) => c.kind === "client");
  const partners = clients.filter((c) => c.kind === "partner");
  if (clients.length === 0) return null;

  return (
    <section className="py-12 sm:py-20" aria-label="Clients and partners">
      <Container className="flex flex-col gap-12">
        {clientLogos.length > 0 ? (
          <div className="reveal flex flex-col gap-6">
            <h2 className="text-3xl font-medium sm:text-4xl">Our Clients</h2>
            <div className="marquee relative overflow-hidden" tabIndex={0} role="group" aria-label="Our clients">
              <ul className="marquee-track flex w-max items-center gap-10 py-2 motion-reduce:w-auto motion-reduce:flex-wrap">
                {[...clientLogos, ...clientLogos].map((c, i) => (
                  <li key={`${c.id}-${i}`} aria-hidden={i >= clientLogos.length ? true : undefined} inert={i >= clientLogos.length ? true : undefined} className="shrink-0">
                    <Logo client={c} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {partners.length > 0 ? (
          <div className="reveal flex flex-col gap-6">
            <h2 className="text-3xl font-medium sm:text-4xl">Our Partners</h2>
            <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
              {partners.map((c) => (
                <li key={c.id}>
                  <Logo client={c} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

import Image from "next/image";
import { ArrowLink } from "@/components/corporate/arrow-link";
import { Container } from "@/components/corporate/container";
import { cta } from "@/content/pages";
import { phoneHref, type ContactDetails } from "@/lib/site-values";

/**
 * The closing call to action: approved copy over a photograph. The phone number comes from the editable
 * contact value, so changing it in the admin changes it here.
 */
export function CtaBand({ contact }: { contact: ContactDetails }) {
  // The approved sentence names the number, so the editable number is spliced into it.
  const before = cta.body.split("+2347037973666")[0] ?? "";
  const after = cta.body.split("+2347037973666")[1] ?? "";
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="relative isolate overflow-hidden rounded-container">
        <Image src={cta.image.src} alt={cta.image.alt} width={cta.image.width} height={cta.image.height} sizes="(min-width: 1280px) 1200px, 100vw" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b1426]/85 via-[#0b1426]/60 to-[#0b1426]/20" />
        <div className="flex flex-col items-start gap-8 px-6 py-16 text-white sm:px-14 sm:py-24">
          <h2 className="reveal max-w-2xl text-4xl font-medium sm:text-6xl">{cta.title}</h2>
          <p className="reveal max-w-xl text-lg leading-relaxed text-white/90">
            {before}
            <a href={phoneHref(contact.phone)} className="underline underline-offset-4">
              {contact.phone}
            </a>
            {after}
          </p>
          <ArrowLink href="/contact?type=quote" variant="accent">
            Get a quote
          </ArrowLink>
        </div>
      </div>
    </Container>
  );
}

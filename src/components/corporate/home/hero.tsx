import Image from "next/image";
import { ArrowLink } from "@/components/corporate/arrow-link";
import { Container } from "@/components/corporate/container";
import { ShopLink } from "@/components/corporate/shop-link";
import { marketplaceLabel } from "@/content/navigation";
import { hero } from "@/content/pages";
import { shopUrl } from "@/lib/seo";

/** One headline, one sentence, two actions, over a full photograph. Fits the first screen. */
export function Hero() {
  return (
    <Container as="section" className="pt-3 sm:pt-4">
      <div className="relative isolate flex min-h-[min(44rem,calc(100dvh-7.5rem))] items-end overflow-hidden rounded-container">
        <Image src={hero.image.src} alt={hero.image.alt} width={hero.image.width} height={hero.image.height} priority sizes="(min-width: 1280px) 1200px, 100vw" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1426]/80 via-[#0b1426]/35 to-transparent" />
        <div className="flex w-full flex-col items-start gap-8 p-6 pb-10 text-white sm:p-12 sm:pb-14">
          <div className="flex max-w-3xl flex-col gap-5">
            <h1 className="hero-rise text-5xl leading-[1.02] font-medium sm:text-7xl lg:text-[5.5rem]" style={{ ["--i" as string]: 0 }}>
              {hero.title}
            </h1>
            <p className="hero-rise max-w-xl text-xl leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
              {hero.body}
            </p>
          </div>
          <div className="hero-rise flex flex-wrap gap-3" style={{ ["--i" as string]: 2 }}>
            <ShopLink fallback={shopUrl()} arrow="accent">
              {marketplaceLabel}
            </ShopLink>
            <ArrowLink href="/contact?type=quote" variant="light">
              Get a quote
            </ArrowLink>
          </div>
        </div>
      </div>
    </Container>
  );
}

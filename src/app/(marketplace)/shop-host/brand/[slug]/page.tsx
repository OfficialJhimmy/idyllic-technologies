import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/corporate/container";
import { JsonLd } from "@/components/corporate/json-ld";
import { MediaImage } from "@/components/corporate/media-image";
import { ShopProductCard } from "@/components/marketplace/shop-product-card";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { getBrandListing } from "@/db/queries/shop";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PAGE_SIZE = 12;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ category?: string; page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getBrandListing((await params).slug, undefined, 1, 1);
  if (!data) return { title: "Brand not found" };
  return pageMetadata({ host: "shop", title: data.brand.name, description: data.brand.description, path: `/brand/${data.brand.slug}`, image: data.brand.logo });
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const data = await getBrandListing(slug, sp.category, page, PAGE_SIZE);
  if (!data) notFound();
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const chip = (active: boolean) => `inline-flex h-11 items-center rounded-full px-5 font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${active ? "bg-primary text-on-primary" : "border border-line-strong hover:bg-sunken"}`;

  return (
    <>
      <Container className="flex flex-col gap-5 pt-10 pb-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-x-2 text-sm text-ink-muted">
            <li><Link href="/" className="underline-offset-4 hover:underline">Marketplace</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{data.brand.name}</li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-center gap-6">
          {data.brand.logo ? <MediaImage image={data.brand.logo} sizes="160px" className="h-16 w-auto rounded-input object-contain" /> : null}
          <h1 className="hero-rise text-5xl font-medium sm:text-6xl">{data.brand.name}</h1>
        </div>
        {data.brand.description ? <p className="max-w-[60ch] text-lg leading-relaxed text-ink-muted">{data.brand.description}</p> : null}
      </Container>
      <Container className="flex flex-col gap-8 pb-24">
        {data.categories.length > 1 ? (
          <nav aria-label="Categories">
            <ul className="flex flex-wrap gap-2">
              <li><Link href={`/brand/${slug}`} className={chip(!data.activeCategory)}>All</Link></li>
              {data.categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/brand/${slug}?category=${c.slug}`} className={chip(c.slug === data.activeCategory)} aria-current={c.slug === data.activeCategory ? "page" : undefined}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {data.rows.length > 0 ? (
          <>
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {data.rows.map((p) => (
                <li key={p.id}>
                  <ShopProductCard product={p} />
                </li>
              ))}
            </ul>
            <Pagination basePath={`/brand/${slug}`} page={page} pages={pages} params={{ category: data.activeCategory }} />
          </>
        ) : (
          <EmptyState title={`No ${data.brand.name} products yet`} body="They will appear here as they are added." action={<Link href="/" className="inline-flex h-12 items-center rounded-full bg-action px-6 font-medium text-on-action">Back to the marketplace</Link>} />
        )}
      </Container>
      <JsonLd data={breadcrumbJsonLd([{ name: "Marketplace", path: "/" }, { name: data.brand.name, path: `/brand/${slug}` }], "shop")} />
    </>
  );
}

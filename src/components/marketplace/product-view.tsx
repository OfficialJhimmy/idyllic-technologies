import { FilePdf, LinkSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ArrowLink } from "@/components/corporate/arrow-link";
import { SiteLink } from "@/components/corporate/shop-link";
import { Container } from "@/components/corporate/container";
import { ProductCard } from "@/components/corporate/product-card";
import { BookButton } from "@/components/marketplace/book-button";
import { AddToListButton, CompareButton } from "@/components/marketplace/list-buttons";
import { ProductGallery } from "@/components/marketplace/product-gallery";
import { ShopProductCard } from "@/components/marketplace/shop-product-card";
import { marketplaceLabel } from "@/content/navigation";
import type { ProductDetail } from "@/db/queries/public";
import type { ListItem } from "@/lib/marketplace/list-logic";
import { canonicalProductUrl, mediaFileUrl, siteUrl } from "@/lib/seo";

const suitableLabels: Record<string, string> = { home: "Home", office: "Office", business: "Business", industrial: "Industrial" };

/**
 * One product page, used on the corporate site now and the marketplace in Phase 5. It never shows a
 * price. Every value comes from the database: if a spec, feature or datasheet was not entered it is
 * simply not shown, and nothing is filled in on staff's behalf.
 */
export function ProductView({ product, mode = "corporate" }: { product: ProductDetail; mode?: "corporate" | "shop" }) {
  const shop = mode === "shop";
  const item: ListItem = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand.name,
    categorySlug: product.category.slug,
    imagePath: product.images[0]?.storagePath ?? null,
    imageAlt: product.images[0]?.alt ?? null,
  };
  const categoryHref = shop ? `/category/${product.category.slug}` : `/products?category=${product.category.slug}`;
  return (
    <>
      <Container className="pt-8 pb-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
            <li><Link href={shop ? "/" : "/products"} className="underline-offset-4 hover:underline">{shop ? "Marketplace" : "Products"}</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={categoryHref} className="underline-offset-4 hover:underline">{product.category.name}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>
      </Container>

      <Container as="section" className="grid gap-10 pb-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Link href={shop ? `/brand/${product.brand.slug}` : `/products?brand=${product.brand.slug}`} className="w-fit text-ink-muted underline-offset-4 hover:underline">
              {product.brand.name}
            </Link>
            <h1 className="text-4xl font-medium sm:text-5xl">{product.name}</h1>
            {product.summary ? <p className="max-w-[56ch] text-xl leading-relaxed text-ink-muted">{product.summary}</p> : null}
          </div>

          {shop ? (
            <div className="flex flex-col gap-4">
              <BookButton ids={[product.id]} source="page" />
              <div className="flex flex-wrap items-start gap-2">
                <AddToListButton item={item} size="lg" />
                <CompareButton item={item} size="lg" />
              </div>
              <SiteLink fallback={siteUrl()} path={`/contact?type=quote&product=${product.slug}`} className="inline-flex min-h-11 w-fit items-center font-medium underline underline-offset-4">
                Request a quote instead
              </SiteLink>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <ArrowLink href={`/contact?type=quote&product=${product.slug}`} variant="primary">
                Request a quote
              </ArrowLink>
              <ArrowLink href={canonicalProductUrl(product.slug)} external variant="secondary">
                {marketplaceLabel}
              </ArrowLink>
            </div>
          )}

          {product.suitableFor.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-ink-muted">Suitable for</h2>
              <ul className="flex flex-wrap gap-2">
                {product.suitableFor.map((s) => (
                  <li key={s} className="rounded-full border border-line-strong px-4 py-1.5">{suitableLabels[s] ?? s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.features.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-medium">Features</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-lg marker:text-ink-muted">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>

      {product.specs.length > 0 || product.description || product.documents.length > 0 ? (
        <Container as="section" className="flex flex-col gap-14 border-t border-line py-16">
          {product.specs.length > 0 ? (
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-medium">Specifications</h2>
              <dl className="grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <dt className="text-sm text-ink-muted">{s.label}</dt>
                    <dd className="text-lg font-medium tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {product.description ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-medium">Description</h2>
              <p className="max-w-[68ch] text-lg leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          ) : null}

          {product.documents.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-medium">Datasheets</h2>
              <ul className="flex flex-wrap gap-3">
                {product.documents.map((d) => {
                  const href = d.storagePath ? mediaFileUrl(d.storagePath) : d.url;
                  if (!href) return null;
                  return (
                    <li key={`${d.label}-${href}`}>
                      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-3 rounded-full border border-line-strong px-5 font-medium transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.97]">
                        {d.storagePath ? <FilePdf size={20} aria-hidden /> : <LinkSimple size={20} aria-hidden />}
                        {d.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </Container>
      ) : null}

      {product.related.length > 0 ? (
        <Container as="section" className="flex flex-col gap-8 border-t border-line py-16">
          <h2 className="text-3xl font-medium">Related products</h2>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {product.related.map((p) => (
              <li key={p.id}>
                {shop ? <ShopProductCard product={p} /> : <ProductCard product={p} />}
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
    </>
  );
}

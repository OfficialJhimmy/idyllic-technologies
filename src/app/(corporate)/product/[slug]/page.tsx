import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/corporate/json-ld";
import { ProductView } from "@/components/marketplace/product-view";
import { getPublicProduct } from "@/db/queries/public";
import { breadcrumbJsonLd, canonicalProductUrl, pageMetadata, productJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getPublicProduct((await params).slug);
  if (!product) return { title: "Product not found" };
  return pageMetadata({
    title: product.seoTitle ?? `${product.name} by ${product.brand.name}`,
    description: product.seoDescription ?? product.summary,
    path: `/product/${product.slug}`,
    // The marketplace is the home of product pages, so search engines are pointed there.
    canonical: canonicalProductUrl(product.slug),
    image: product.ogImage ?? product.images[0] ?? null,
  });
}

export default async function ProductPage({ params }: Params) {
  const product = await getPublicProduct((await params).slug);
  if (!product) notFound();
  return (
    <>
      <ProductView product={product} />
      <JsonLd data={productJsonLd({ name: product.name, slug: product.slug, summary: product.summary, brand: product.brand.name, category: product.category.name, images: product.images })} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Products", path: "/products" }, { name: product.category.name, path: `/products?category=${product.category.slug}` }, { name: product.name, path: `/product/${product.slug}` }])} />
    </>
  );
}

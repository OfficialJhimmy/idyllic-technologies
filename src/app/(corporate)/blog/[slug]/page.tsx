import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/corporate/container";
import { formatDate } from "@/components/corporate/format";
import { JsonLd } from "@/components/corporate/json-ld";
import { MediaImage } from "@/components/corporate/media-image";
import { getPublishedPost } from "@/db/queries/public";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import { articleJsonLd, breadcrumbJsonLd, mediaFileUrl, pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return { title: "Post not found" };
  return pageMetadata({ title: post.seoTitle ?? post.title, description: post.seoDescription ?? post.excerpt, path: `/blog/${post.slug}`, image: post.ogImage ?? post.image, type: "article", publishedAt: post.publishedAt });
}

export default async function PostPage({ params }: Params) {
  const post = await getPublishedPost((await params).slug);
  if (!post) notFound();
  // Cleaned when saved, and cleaned again here, so nothing stored can ever reach a visitor unchecked.
  const body = sanitizePostHtml(post.body, { mediaBaseUrl: mediaFileUrl("").replace(/\/$/, "") });

  return (
    <>
      <Container as="header" className="flex flex-col gap-6 pt-16 pb-10 sm:pt-24">
        <Link href="/blog" className="w-fit text-ink-muted underline-offset-4 hover:underline">All posts</Link>
        <h1 className="hero-rise max-w-4xl text-4xl font-medium sm:text-6xl">{post.title}</h1>
        <p className="text-ink-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.authorName ? `, by ${post.authorName}` : ""}
          {post.categoryName ? (
            <>
              {", "}
              <Link href={`/blog?category=${post.categorySlug}`} className="underline-offset-4 hover:underline">{post.categoryName}</Link>
            </>
          ) : null}
        </p>
      </Container>

      {post.image ? (
        <Container className="pb-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-container bg-sunken">
            <MediaImage image={post.image} fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
          </div>
        </Container>
      ) : null}

      <Container as="article" className="pb-16">
        <div className="prose-public" dangerouslySetInnerHTML={{ __html: body }} />
        {post.tags.length > 0 ? (
          <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t.slug}>
                <Link href={`/blog?tag=${t.slug}`} className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.97]">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {post.authorName && post.authorBio ? (
          <aside className="mt-14 flex max-w-[68ch] flex-col gap-2 border-t border-line pt-8">
            <h2 className="text-xl font-medium">{post.authorName}</h2>
            <p className="text-ink-muted">{post.authorBio}</p>
          </aside>
        ) : null}
      </Container>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])} />
    </>
  );
}

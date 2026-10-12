import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { PostMeta } from "@/components/corporate/blog/post-meta";
import { ReadingLayout } from "@/components/corporate/blog/reading-layout";
import { Container } from "@/components/corporate/container";
import { JsonLd } from "@/components/corporate/json-ld";
import { MediaImage } from "@/components/corporate/media-image";
import { PostCard } from "@/components/corporate/post-card";
import { getPublishedPost, getRelatedPosts } from "@/db/queries/public";
import { readingMinutes } from "@/lib/blog/reading";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd, mediaFileUrl, pageMetadata } from "@/lib/seo";

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

  const minutes = readingMinutes(body);
  const related = await getRelatedPosts(post.id, 3);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <>
      <Container as="header" className="flex flex-col gap-7 pt-16 pb-10 sm:pt-24">
        <Link href="/blog" className="inline-flex min-h-11 w-fit items-center gap-2 text-ink-muted underline-offset-4 hover:text-ink hover:underline">
          <ArrowLeft size={18} aria-hidden />
          All posts
        </Link>
        <h1 className="hero-rise text-4xl leading-[1.05] font-medium text-balance sm:text-6xl lg:text-7xl">{post.title}</h1>
        <PostMeta publishedAt={post.publishedAt} authorName={post.authorName} categoryName={post.categoryName} categorySlug={post.categorySlug} minutes={minutes} />
      </Container>

      {post.image ? (
        <Container className="pb-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-container bg-sunken">
            <MediaImage image={post.image} fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
          </div>
        </Container>
      ) : null}

      <Container as="article" className="pb-16">
        <ReadingLayout minutes={minutes} url={url} title={post.title}>
          <div className="prose-public prose-wide" dangerouslySetInnerHTML={{ __html: body }} />
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
        </ReadingLayout>
      </Container>

      {related.length > 0 ? (
        <Container as="section" className="flex flex-col gap-8 border-t border-line pt-14 pb-24" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-3xl font-medium sm:text-4xl">
            Related posts
          </h2>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.id} className="reveal">
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])} />
    </>
  );
}

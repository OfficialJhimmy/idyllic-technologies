import Link from "next/link";
import { formatDate } from "@/components/corporate/format";
import { MediaImage } from "@/components/corporate/media-image";
import type { PostCard as Card } from "@/db/queries/public";

/** A post. `large` is used for the first post on a list, with a taller picture and bigger title. */
export function PostCard({ post, large = false }: { post: Card; large?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col gap-4">
      <div className={`relative overflow-hidden rounded-card bg-sunken ${large ? "aspect-[16/10]" : "aspect-[16/10] lg:aspect-[3/2]"}`}>
        {post.image ? (
          <MediaImage image={post.image} fill sizes={large ? "(min-width: 1024px) 50rem, 100vw" : "(min-width: 1024px) 24rem, 100vw"} className="object-cover transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:scale-[1.03]" />
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.categoryName ? `, ${post.categoryName}` : ""}
        </p>
        <h3 className={`${large ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} font-medium`}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className={`${large ? "line-clamp-3" : "line-clamp-2"} max-w-[60ch] text-ink-muted`}>{post.excerpt}</p> : null}
      </div>
    </article>
  );
}

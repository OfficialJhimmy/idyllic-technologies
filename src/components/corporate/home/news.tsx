import { ArrowLink } from "@/components/corporate/arrow-link";
import { Container } from "@/components/corporate/container";
import { PostCard } from "@/components/corporate/post-card";
import { blogPage } from "@/content/pages";
import type { PostCard as Card } from "@/db/queries/public";

/** The three newest posts: one large, the rest beside it. Not shown when nothing is published. */
export function News({ posts }: { posts: Card[] }) {
  if (posts.length === 0) return null;
  const [first, ...rest] = posts;
  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="reveal flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-4xl font-medium sm:text-5xl">{blogPage.title}</h2>
          <ArrowLink href="/blog" variant="secondary">
            All posts
          </ArrowLink>
        </div>
        <div className={`grid gap-8 ${rest.length ? "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : ""}`}>
          {first ? <PostCard post={first} large /> : null}
          {rest.length ? <div className="flex flex-col gap-8">{rest.map((p) => <PostCard key={p.id} post={p} />)}</div> : null}
        </div>
      </div>
    </Container>
  );
}

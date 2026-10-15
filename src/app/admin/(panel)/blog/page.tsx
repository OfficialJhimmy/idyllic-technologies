import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { PostFilters } from "@/components/admin/blog/post-filters";
import { PostList } from "@/components/admin/blog/post-list";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { listPosts, postCategoryOptions, postStatusCounts } from "@/db/queries/blog";
import type { PublishStatus } from "@/lib/catalogue/publish";
import { idSchema } from "@/lib/catalogue/schemas";

export const metadata: Metadata = { title: "Blog" };

const PAGE_SIZE = 25;
const statuses: PublishStatus[] = ["draft", "published", "archived"];

type SearchParams = { q?: string; status?: string; category?: string; page?: string };

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // Checked first, so a signed out visitor is sent to sign in before any query is started.
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = statuses.find((s) => s === sp.status);
  const categoryId = idSchema.safeParse(sp.category).data;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, categories, counts] = await Promise.all([
    listPosts({ q: q || undefined, status, categoryId, page, pageSize: PAGE_SIZE }),
    postCategoryOptions(),
    postStatusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(q || status || categoryId);
  const totalAll = counts.draft + counts.published + counts.archived;
  const create = (
    <Link prefetch={false} href="/admin/blog/new" className={buttonStyles()}>
      New post
    </Link>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Blog" description={totalAll ? `${counts.published} published, ${counts.draft} draft, ${counts.archived} archived.` : undefined} actions={create} />
      {totalAll > 0 ? <PostFilters q={q} status={status ?? ""} categoryId={categoryId ?? ""} categories={categories} /> : null}

      {rows.length === 0 ? (
        filtered ? (
          <EmptyState title="No posts match" body="Change or clear the filters to see more." action={<Link prefetch={false} href="/admin/blog" className={buttonStyles({ variant: "secondary" })}>Clear filters</Link>} />
        ) : (
          <EmptyState title="No posts yet" body="Add an author first (every published post needs one), then write the first post. It stays a draft until you publish it." action={<div className="flex flex-wrap gap-2">{create}<Link prefetch={false} href="/admin/blog/authors/new" className={buttonStyles({ variant: "secondary" })}>Add an author</Link></div>} />
        )
      ) : (
        <>
          <p className="text-sm text-ink-muted tabular-nums" role="status">{total} post{total === 1 ? "" : "s"}</p>
          <PostList rows={rows} />
          <Pagination basePath="/admin/blog" page={page} pages={pages} params={{ q: q || undefined, status, category: categoryId }} />
        </>
      )}
    </div>
  );
}

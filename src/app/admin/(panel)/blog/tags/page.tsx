import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/blog/taxonomy-manager";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { paginate, parsePage } from "@/lib/pagination";
import { listTags } from "@/db/queries/blog";

export const metadata: Metadata = { title: "Blog tags" };

const PAGE_SIZE = 20;

export default async function BlogTagsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { rows, page, pages } = paginate(await listTags(), parsePage((await searchParams).page), PAGE_SIZE);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Blog tags" description="Tags are also created when you type a new one in a post." />
      <TaxonomyManager kind="tag" rows={rows} />
      <Pagination basePath="/admin/blog/tags" page={page} pages={pages} />
    </div>
  );
}

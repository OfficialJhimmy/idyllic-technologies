import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/blog/taxonomy-manager";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { paginate, parsePage } from "@/lib/pagination";
import { listPostCategories } from "@/db/queries/blog";

export const metadata: Metadata = { title: "Blog categories" };

const PAGE_SIZE = 20;

export default async function BlogCategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { rows, page, pages } = paginate(await listPostCategories(), parsePage((await searchParams).page), PAGE_SIZE);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Blog categories" description="Group posts by topic. A post can have one category." />
      <TaxonomyManager kind="category" rows={rows} />
      <Pagination basePath="/admin/blog/categories" page={page} pages={pages} />
    </div>
  );
}

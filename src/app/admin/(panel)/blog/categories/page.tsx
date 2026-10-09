import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/blog/taxonomy-manager";
import { PageHeader } from "@/components/ui/page-header";
import { listPostCategories } from "@/db/queries/blog";

export const metadata: Metadata = { title: "Blog categories" };

export default async function BlogCategoriesPage() {
  const rows = await listPostCategories();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Blog categories" description="Group posts by topic. A post can have one category." />
      <TaxonomyManager kind="category" rows={rows} />
    </div>
  );
}

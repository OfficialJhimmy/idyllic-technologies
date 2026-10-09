import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/blog/taxonomy-manager";
import { PageHeader } from "@/components/ui/page-header";
import { listTags } from "@/db/queries/blog";

export const metadata: Metadata = { title: "Blog tags" };

export default async function BlogTagsPage() {
  const rows = await listTags();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Blog tags" description="Tags are also created when you type a new one in a post." />
      <TaxonomyManager kind="tag" rows={rows} />
    </div>
  );
}

import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media/media-library";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { listMedia } from "@/db/queries/catalogue";

export const metadata: Metadata = { title: "Media" };

const PAGE_SIZE = 40;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { rows, total } = await listMedia({ page, pageSize: PAGE_SIZE });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Media" description="Images are converted to WebP when uploaded. Every image needs alt text." />
      <MediaLibrary items={rows} />
      <Pagination basePath="/admin/media" page={page} pages={pages} />
    </div>
  );
}

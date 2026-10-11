import { PageNumbers } from "@/components/ui/page-numbers";
import { toQuery, type Filters } from "@/lib/marketplace/filters";

/** Numbered pages that keep every applied filter. */
export function ShopPagination({ basePath, filters, pages }: { basePath: string; filters: Filters; pages: number }) {
  return <PageNumbers page={filters.page} pages={pages} hrefFor={(page) => basePath + toQuery(filters, { page: page > 1 ? String(page) : undefined })} />;
}

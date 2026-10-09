import Link from "next/link";
import { toQuery, type Filters } from "@/lib/marketplace/filters";

/** Previous and next that keep every applied filter. */
export function ShopPagination({ basePath, filters, pages }: { basePath: string; filters: Filters; pages: number }) {
  if (pages <= 1) return null;
  const href = (page: number) => basePath + toQuery(filters, { page: page > 1 ? String(page) : undefined });
  const link = "inline-flex h-11 items-center rounded-full px-4 font-medium hover:bg-sunken";
  return (
    <nav aria-label="Pages" className="flex items-center gap-2">
      {filters.page > 1 ? <Link className={link} href={href(filters.page - 1)}>Previous</Link> : null}
      <span className="px-2 text-ink-muted tabular-nums">Page {filters.page} of {pages}</span>
      {filters.page < pages ? <Link className={link} href={href(filters.page + 1)}>Next</Link> : null}
    </nav>
  );
}

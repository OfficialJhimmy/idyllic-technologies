import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { pageItems } from "@/lib/pagination";

type Props = {
  page: number;
  pages: number;
  /** The address of a page, with every filter that is applied kept. */
  hrefFor: (page: number) => string;
};

const base = "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 font-medium tabular-nums transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] active:scale-[0.97]";

/**
 * Previous, numbered pages and next. The current page is marked for screen readers, and every number is a
 * real link, so a page can be opened in a new tab, shared, and found by search engines. Renders nothing for one page.
 */
export function PageNumbers({ page, pages, hrefFor }: Props) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" aria-label="Previous page" className={`${base} gap-1 hover:bg-sunken sm:pr-4`}>
          <CaretLeft size={18} aria-hidden />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : null}
      <ul className="flex items-center gap-1">
        {pageItems(page, pages).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-ink-muted">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span aria-current="page" className={`${base} bg-primary text-on-primary`}>
                  <span className="sr-only">Page </span>
                  {item}
                </span>
              ) : (
                <Link href={hrefFor(item)} aria-label={`Page ${item}`} className={`${base} text-ink hover:bg-sunken`}>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} rel="next" aria-label="Next page" className={`${base} gap-1 hover:bg-sunken sm:pl-4`}>
          <span className="hidden sm:inline">Next</span>
          <CaretRight size={18} aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}

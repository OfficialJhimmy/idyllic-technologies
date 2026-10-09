import Link from "next/link";

type Props = { basePath: string; page: number; pages: number; params?: Record<string, string | undefined> };

/** Previous and next links that keep the current filters. Renders nothing for a single page. */
export function Pagination({ basePath, page, pages, params = {} }: Props) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const link = "inline-flex h-11 items-center rounded-full px-4 font-medium text-ink hover:bg-sunken";
  return (
    <nav aria-label="Pages" className="flex items-center gap-2">
      {page > 1 ? <Link className={link} href={href(page - 1)}>Previous</Link> : null}
      <span className="px-2 text-ink-muted tabular-nums">Page {page} of {pages}</span>
      {page < pages ? <Link className={link} href={href(page + 1)}>Next</Link> : null}
    </nav>
  );
}

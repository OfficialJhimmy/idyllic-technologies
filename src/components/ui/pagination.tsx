import { PageNumbers } from "@/components/ui/page-numbers";

type Props = { basePath: string; page: number; pages: number; params?: Record<string, string | undefined> };

/** Numbered pages that keep the current filters. Used by the public site and the admin. */
export function Pagination({ basePath, page, pages, params = {} }: Props) {
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return <PageNumbers page={page} pages={pages} hrefFor={href} />;
}

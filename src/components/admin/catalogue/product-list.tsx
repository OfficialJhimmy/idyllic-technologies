import Link from "next/link";
import { MediaThumb } from "@/components/admin/media/media-thumb";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProductListRow } from "@/lib/catalogue/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

/** One row per product. Whole row is the link, with the image on a product plate. */
export function ProductList({ rows }: { rows: ProductListRow[] }) {
  return (
    <ul className="divide-y divide-line rounded-card bg-surface">
      {rows.map((p) => (
        <li key={p.id}>
          <Link prefetch={false} href={`/admin/products/${p.id}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 py-4 hover:bg-sunken md:grid-cols-[3.5rem_minmax(0,1fr)_12rem_7rem_8rem]">
            {p.imagePath ? (
              <MediaThumb path={p.imagePath} alt={p.imageAlt ?? ""} width={112} height={112} sizes="3.5rem" className="!rounded-input" />
            ) : (
              <div aria-hidden className="aspect-square rounded-input bg-sunken" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{p.name}</p>
              <p className="truncate text-sm text-ink-muted">{p.brandName}, {p.categoryName}</p>
            </div>
            <p className="col-start-2 text-sm text-ink-muted md:col-start-auto">Updated {dateFormat.format(new Date(p.updatedAt))}</p>
            <div className="col-start-2 md:col-start-auto">
              <StatusBadge status={p.status} />
            </div>
            <span className="hidden truncate text-sm text-ink-muted md:block">/product/{p.slug}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

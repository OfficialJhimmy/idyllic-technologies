import Link from "next/link";
import { MediaThumb } from "@/components/admin/media/media-thumb";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PostListRow } from "@/lib/blog/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export function PostList({ rows }: { rows: PostListRow[] }) {
  return (
    <ul className="divide-y divide-line rounded-card bg-surface">
      {rows.map((p) => (
        <li key={p.id}>
          <Link prefetch={false} href={`/admin/blog/${p.id}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 py-4 hover:bg-sunken md:grid-cols-[3.5rem_minmax(0,1fr)_11rem_7rem]">
            {p.imagePath ? (
              <MediaThumb path={p.imagePath} alt={p.imageAlt ?? ""} width={112} height={112} sizes="3.5rem" className="!rounded-input" />
            ) : (
              <div aria-hidden className="aspect-square rounded-input bg-sunken" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{p.title}</p>
              <p className="truncate text-sm text-ink-muted">
                {[p.authorName ?? "No author", p.categoryName].filter(Boolean).join(", ")}
              </p>
            </div>
            <p className="col-start-2 text-sm text-ink-muted md:col-start-auto">
              {p.publishedAt ? `Dated ${dateFormat.format(new Date(p.publishedAt))}` : `Updated ${dateFormat.format(new Date(p.updatedAt))}`}
            </p>
            <div className="col-start-2 md:col-start-auto">
              <StatusBadge status={p.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

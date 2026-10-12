import Link from "next/link";
import { EnquiryStatusBadge, EnquiryTypeBadge } from "@/components/admin/enquiries/enquiry-badges";
import type { EnquiryListRow } from "@/db/queries/enquiries";

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

/** New enquiries are set in a heavier weight so they stand out without relying on colour. */
export function EnquiryList({ rows }: { rows: EnquiryListRow[] }) {
  return (
    <ul className="divide-y divide-line rounded-card bg-surface">
      {rows.map((e) => (
        <li key={e.id}>
          <Link prefetch={false} href={`/admin/enquiries/${e.id}`} className="flex flex-col gap-2 px-5 py-4 hover:bg-sunken md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
            <div className="min-w-0">
              <p className={`truncate ${e.status === "new" ? "font-semibold" : "font-medium"}`}>{e.name}</p>
              <p className="truncate text-sm text-ink-muted">{e.email}{e.productName ? `, about ${e.productName}` : ""}</p>
              {e.message ? <p className="mt-1 line-clamp-1 text-ink-muted">{e.message}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <EnquiryTypeBadge type={e.type} />
              <EnquiryStatusBadge status={e.status} />
              <span className="text-sm text-ink-muted tabular-nums">{dateFormat.format(new Date(e.createdAt))}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

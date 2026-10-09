import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryFilters } from "@/components/admin/enquiries/enquiry-filters";
import { EnquiryList } from "@/components/admin/enquiries/enquiry-list";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { enquiryStatusCounts, listEnquiries } from "@/db/queries/enquiries";
import { enquiryStatuses, enquiryTypes } from "@/lib/enquiries/status";

export const metadata: Metadata = { title: "Enquiries" };

const PAGE_SIZE = 25;

type SearchParams = { q?: string; type?: string; status?: string; page?: string };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const type = enquiryTypes.find((t) => t === sp.type);
  const status = enquiryStatuses.find((s) => s === sp.status);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, counts] = await Promise.all([
    listEnquiries({ q: q || undefined, type, status, page, pageSize: PAGE_SIZE }),
    enquiryStatusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(q || type || status);
  const totalAll = counts.new + counts.read + counts.replied + counts.closed;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Enquiries"
        description={totalAll ? `${counts.new} new, ${counts.read} read, ${counts.replied} replied, ${counts.closed} closed.` : "Messages from the contact form, quote requests and the Energy Assistant."}
      />
      {totalAll > 0 ? <EnquiryFilters q={q} type={type ?? ""} status={status ?? ""} /> : null}

      {rows.length === 0 ? (
        filtered ? (
          <EmptyState title="No enquiries match" body="Change or clear the filters to see more." action={<Link href="/admin/enquiries" className={buttonStyles({ variant: "secondary" })}>Clear filters</Link>} />
        ) : (
          <EmptyState title="No enquiries yet" body="They appear here once the contact form and quote requests are live on the website." />
        )
      ) : (
        <>
          <p className="text-sm text-ink-muted tabular-nums" role="status">{total} enquir{total === 1 ? "y" : "ies"}</p>
          <EnquiryList rows={rows} />
          <Pagination basePath="/admin/enquiries" page={page} pages={pages} params={{ q: q || undefined, type, status }} />
        </>
      )}
    </div>
  );
}

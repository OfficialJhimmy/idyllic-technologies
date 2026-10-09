import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryStatusControl } from "@/components/admin/enquiries/enquiry-status-control";
import { EnquiryTypeBadge } from "@/components/admin/enquiries/enquiry-badges";
import { PageHeader } from "@/components/ui/page-header";
import { getEnquiry } from "@/db/queries/enquiries";
import { idSchema } from "@/lib/catalogue/schemas";

export const metadata: Metadata = { title: "Enquiry" };

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short" });

/** Payload is whatever the form or assistant attached. Shown as plain text, never as markup. */
function payloadRows(payload: unknown): { key: string; value: string }[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload ? [{ key: "Details", value: JSON.stringify(payload, null, 2) }] : [];
  return Object.entries(payload as Record<string, unknown>).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value, null, 2),
  }));
}

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const enquiry = await getEnquiry(parsed.data);
  if (!enquiry) notFound();
  const extra = payloadRows(enquiry.payload);

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <PageHeader
        title={enquiry.name}
        description={dateFormat.format(new Date(enquiry.createdAt))}
        back={<Link href="/admin/enquiries" className="inline-flex h-11 items-center text-ink-muted underline-offset-4 hover:underline">All enquiries</Link>}
        actions={<EnquiryTypeBadge type={enquiry.type} />}
      />

      <EnquiryStatusControl id={enquiry.id} initial={enquiry.status} />

      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <dt className="text-sm font-medium text-ink-muted">Email</dt>
        <dd><a href={`mailto:${enquiry.email}`} className="text-action underline underline-offset-4 break-all">{enquiry.email}</a></dd>
        {enquiry.phone ? (
          <>
            <dt className="text-sm font-medium text-ink-muted">Phone</dt>
            <dd><a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`} className="text-action underline underline-offset-4">{enquiry.phone}</a></dd>
          </>
        ) : null}
        {enquiry.productName ? (
          <>
            <dt className="text-sm font-medium text-ink-muted">Product</dt>
            <dd>{enquiry.productId ? <Link href={`/admin/products/${enquiry.productId}`} className="text-action underline underline-offset-4">{enquiry.productName}</Link> : enquiry.productName}</dd>
          </>
        ) : null}
        <dt className="text-sm font-medium text-ink-muted">Message</dt>
        <dd className="max-w-[65ch] whitespace-pre-wrap">{enquiry.message?.trim() ? enquiry.message : <span className="text-ink-muted">No message.</span>}</dd>
        {extra.map((row) => (
          <div key={row.key} className="contents">
            <dt className="text-sm font-medium text-ink-muted capitalize">{row.key.replace(/[_-]/g, " ")}</dt>
            <dd className="max-w-[65ch] whitespace-pre-wrap break-words">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

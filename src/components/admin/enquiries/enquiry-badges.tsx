import { enquiryStatusLabels, enquiryTypeLabels, type EnquiryStatus, type EnquiryType } from "@/lib/enquiries/status";

const statusStyles: Record<EnquiryStatus, string> = {
  new: "bg-primary text-on-primary",
  read: "border border-line-strong text-ink-muted",
  replied: "bg-success-soft text-success",
  closed: "bg-sunken text-ink-muted",
};

/** Status is always written out, never colour alone. */
export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return <span className={`inline-flex h-7 items-center rounded-full px-3 text-sm font-medium ${statusStyles[status]}`}>{enquiryStatusLabels[status]}</span>;
}

export function EnquiryTypeBadge({ type }: { type: EnquiryType }) {
  return <span className="inline-flex h-7 items-center rounded-full border border-line px-3 text-sm text-ink-muted">{enquiryTypeLabels[type]}</span>;
}

export const enquiryTypes = ["contact", "quote", "assistant"] as const;
export const enquiryStatuses = ["new", "read", "replied", "closed"] as const;

export type EnquiryType = (typeof enquiryTypes)[number];
export type EnquiryStatus = (typeof enquiryStatuses)[number];

export const enquiryTypeLabels: Record<EnquiryType, string> = { contact: "Contact", quote: "Quote", assistant: "Assistant" };
export const enquiryStatusLabels: Record<EnquiryStatus, string> = { new: "New", read: "Read", replied: "Replied", closed: "Closed" };

/**
 * Staff can move an enquiry to any status, so a mistake or a reopened conversation is easy to fix.
 * Opening a new enquiry marks it read, and nothing else changes status automatically.
 */
export function canChangeStatus(from: EnquiryStatus, to: EnquiryStatus): boolean {
  return from !== to;
}

/** Status after staff open an enquiry. Only a new enquiry changes. */
export function statusOnOpen(current: EnquiryStatus): EnquiryStatus {
  return current === "new" ? "read" : current;
}

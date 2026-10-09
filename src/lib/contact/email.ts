import type { ContactInput } from "@/lib/contact/schemas";

const labels = { contact: "Contact form", quote: "Quote request" } as const;

/** Plain text notification for the team. Header injection is not possible: nothing user supplied goes into a header except reply-to, which Resend validates. */
export function buildNotification(input: ContactInput, productName: string | null, enquiryId: string, adminUrl: string) {
  const label = input.origin === "assistant" ? "Energy Assistant enquiry" : labels[input.type];
  const subject = `${label}: ${input.name}${productName ? ` about ${productName}` : ""}`.replace(/[\r\n]+/g, " ").slice(0, 150);
  const lines = [
    `${label} from the Idyllic Technologies website`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    ...(input.phone ? [`Phone: ${input.phone}`] : []),
    ...(productName ? [`Product: ${productName}`] : []),
    "",
    input.message,
    "",
    `Open in the admin: ${adminUrl}/admin/enquiries/${enquiryId}`,
  ];
  return { subject, text: lines.join("\n") };
}

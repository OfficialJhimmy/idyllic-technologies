import type { Metadata } from "next";
import { FaqManager } from "@/components/admin/content/faq-manager";
import { PageHeader } from "@/components/ui/page-header";
import { listFaqsAdmin } from "@/db/queries/content";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsAdminPage() {
  const faqs = await listFaqsAdmin();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="FAQs" description="Only published questions appear on the website. The refund question stays out until Idyllic supplies the Terms and Conditions." />
      <FaqManager faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, status: f.status }))} />
    </div>
  );
}

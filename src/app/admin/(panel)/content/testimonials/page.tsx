import type { Metadata } from "next";
import { TestimonialManager } from "@/components/admin/content/testimonial-manager";
import { PageHeader } from "@/components/ui/page-header";
import { listTestimonialsAdmin } from "@/db/queries/content";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsAdminPage() {
  const items = await listTestimonialsAdmin();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Testimonials" description="Only published testimonials appear on the website." />
      <TestimonialManager items={items.map((t) => ({ id: t.id, quote: t.quote, authorName: t.authorName, authorRole: t.authorRole, status: t.status, avatar: t.avatar }))} />
    </div>
  );
}

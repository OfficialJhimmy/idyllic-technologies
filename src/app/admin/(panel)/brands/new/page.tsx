import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { BrandForm } from "@/components/admin/catalogue/brand-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "New brand" };

export default async function NewBrandPage() {
  await requireAdmin({ section: "brands" });
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="New brand" />
      <BrandForm brand={{ id: null, name: "", slug: "", description: "", logo: null }} productCount={0} />
    </div>
  );
}

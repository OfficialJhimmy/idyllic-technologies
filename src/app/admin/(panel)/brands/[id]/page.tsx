import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/catalogue/brand-form";
import { PageHeader } from "@/components/ui/page-header";
import { getBrand } from "@/db/queries/catalogue";
import { idSchema } from "@/lib/catalogue/schemas";

export const metadata: Metadata = { title: "Edit brand" };

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const brand = await getBrand(parsed.data);
  if (!brand) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={brand.name} />
      <BrandForm
        brand={{ id: brand.id, name: brand.name, slug: brand.slug, description: brand.description ?? "", logo: brand.logo }}
        productCount={brand.productCount}
      />
    </div>
  );
}

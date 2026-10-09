import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/product-editor/product-editor";
import { PageHeader } from "@/components/ui/page-header";
import { brandOptions, categoryOptions, listSpecDefinitions } from "@/db/queries/catalogue";
import { emptyDraft } from "@/lib/catalogue/draft";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const [brands, categories, specDefs] = await Promise.all([brandOptions(), categoryOptions(), listSpecDefinitions()]);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="New product" description="It stays a draft until you publish it." />
      <ProductEditor
        initial={emptyDraft()}
        status="draft"
        publishedAt={null}
        updatedAt={null}
        brands={brands}
        categories={categories}
        specDefs={specDefs}
        shopUrl={process.env.NEXT_PUBLIC_SHOP_URL ?? ""}
      />
    </div>
  );
}

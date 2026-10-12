import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/catalogue/category-form";
import { SpecTemplateManager } from "@/components/admin/catalogue/spec-template-manager";
import { PageHeader } from "@/components/ui/page-header";
import { getCategoryBySlug, listSpecDefinitions, specValueCounts } from "@/db/queries/catalogue";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin({ section: "categories" });
  const category = await getCategoryBySlug((await params).slug);
  if (!category) notFound();
  const [specs, valueCounts] = await Promise.all([listSpecDefinitions(category.id), specValueCounts(category.id)]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={category.name}
        back={
          <Link href="/admin/categories" className="inline-flex h-11 items-center text-ink-muted underline-offset-4 hover:underline">
            All categories
          </Link>
        }
      />
      <CategoryForm category={{ id: category.id, name: category.name, slug: category.slug, description: category.description ?? "", image: category.image }} />
      <SpecTemplateManager categoryId={category.id} categoryName={category.name} specs={specs} valueCounts={valueCounts} />
    </div>
  );
}

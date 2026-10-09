import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { listCategories } from "@/db/queries/catalogue";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title="Categories" description="There are exactly six. You can edit their description and image, and define the specs each one records." />
      <ul className="divide-y divide-line rounded-card bg-surface">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/categories/${c.slug}`} className="flex min-h-16 flex-col gap-1 px-5 py-4 hover:bg-sunken sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="font-medium">{c.name}</span>
              <span className="text-ink-muted tabular-nums">
                {c.specCount} spec{c.specCount === 1 ? "" : "s"}, {c.productCount} product{c.productCount === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

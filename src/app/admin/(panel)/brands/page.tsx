import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { listBrands } from "@/db/queries/catalogue";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const brands = await listBrands();
  const create = (
    <Link href="/admin/brands/new" className={buttonStyles()}>
      New brand
    </Link>
  );

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title="Brands" description="The manufacturers whose products Idyllic distributes." actions={create} />
      {brands.length === 0 ? (
        <EmptyState title="No brands yet" body="Add a brand before adding products, because every product belongs to one." action={create} />
      ) : (
        <ul className="divide-y divide-line rounded-card bg-surface">
          {brands.map((b) => (
            <li key={b.id}>
              <Link href={`/admin/brands/${b.id}`} className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 hover:bg-sunken">
                <span className="font-medium">{b.name}</span>
                <span className="text-ink-muted tabular-nums">{b.productCount} product{b.productCount === 1 ? "" : "s"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { paginate, parsePage } from "@/lib/pagination";
import { EmptyState } from "@/components/ui/states";
import { listBrands } from "@/db/queries/catalogue";

export const metadata: Metadata = { title: "Brands" };

const PAGE_SIZE = 20;

export default async function BrandsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin({ section: "brands" });
  const all = await listBrands();
  const { rows: brands, page, pages } = paginate(all, parsePage((await searchParams).page), PAGE_SIZE);
  const create = (
    <Link prefetch={false} href="/admin/brands/new" className={buttonStyles()}>
      New brand
    </Link>
  );

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title="Brands" description="The manufacturers whose products Idyllic distributes." actions={create} />
      {all.length === 0 ? (
        <EmptyState title="No brands yet" body="Add a brand before adding products, because every product belongs to one." action={create} />
      ) : (
        <ul className="divide-y divide-line rounded-card bg-surface">
          {brands.map((b) => (
            <li key={b.id}>
              <Link prefetch={false} href={`/admin/brands/${b.id}`} className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 hover:bg-sunken">
                <span className="font-medium">{b.name}</span>
                <span className="text-ink-muted tabular-nums">{b.productCount} product{b.productCount === 1 ? "" : "s"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination basePath="/admin/brands" page={page} pages={pages} />
    </div>
  );
}

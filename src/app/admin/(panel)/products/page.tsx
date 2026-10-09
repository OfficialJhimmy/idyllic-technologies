import type { Metadata } from "next";
import Link from "next/link";
import { ProductFilters } from "@/components/admin/catalogue/product-filters";
import { ProductList } from "@/components/admin/catalogue/product-list";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { brandOptions, categoryOptions, listProducts, statusCounts } from "@/db/queries/catalogue";
import { idSchema } from "@/lib/catalogue/schemas";
import type { PublishStatus } from "@/lib/catalogue/publish";

export const metadata: Metadata = { title: "Products" };

const PAGE_SIZE = 25;
const statuses: PublishStatus[] = ["draft", "published", "archived"];

type SearchParams = { q?: string; status?: string; category?: string; brand?: string; page?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = statuses.find((s) => s === sp.status);
  const categoryId = idSchema.safeParse(sp.category).data;
  const brandId = idSchema.safeParse(sp.brand).data;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, categories, brands, counts] = await Promise.all([
    listProducts({ q: q || undefined, status, categoryId, brandId, page, pageSize: PAGE_SIZE }),
    categoryOptions(),
    brandOptions(),
    statusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(q || status || categoryId || brandId);
  const totalAll = counts.draft + counts.published + counts.archived;

  const create = (
    <Link href="/admin/products/new" className={buttonStyles()}>
      New product
    </Link>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Products"
        description={totalAll ? `${counts.published} published, ${counts.draft} draft, ${counts.archived} archived.` : undefined}
        actions={create}
      />
      {totalAll > 0 ? <ProductFilters q={q} status={status ?? ""} categoryId={categoryId ?? ""} brandId={brandId ?? ""} categories={categories} brands={brands} /> : null}

      {rows.length === 0 ? (
        filtered ? (
          <EmptyState title="No products match" body="Change or clear the filters to see more." action={<Link href="/admin/products" className={buttonStyles({ variant: "secondary" })}>Clear filters</Link>} />
        ) : brands.length === 0 ? (
          <EmptyState title="No products yet" body="Add a brand first, because every product belongs to one. Then add the first product." action={<Link href="/admin/brands/new" className={buttonStyles()}>Add a brand</Link>} />
        ) : (
          <EmptyState title="No products yet" body="Add the first product. It stays a draft until you publish it." action={create} />
        )
      ) : (
        <>
          <p className="text-sm text-ink-muted tabular-nums" role="status">{total} product{total === 1 ? "" : "s"}</p>
          <ProductList rows={rows} />
          <Pagination basePath="/admin/products" page={page} pages={pages} params={{ q: q || undefined, status, category: categoryId, brand: brandId }} />
        </>
      )}
    </div>
  );
}

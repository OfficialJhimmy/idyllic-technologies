import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import type { CategoryOption } from "@/lib/blog/types";

type Props = { q: string; status: string; categoryId: string; categories: CategoryOption[] };

/** A plain GET form, so filters live in the address and work without JavaScript. */
export function PostFilters({ q, status, categoryId, categories }: Props) {
  return (
    <form method="get" role="search" aria-label="Filter posts" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto] lg:items-end">
      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
        <label htmlFor="filter-q" className="text-sm font-medium">Search</label>
        <input id="filter-q" name="q" type="search" defaultValue={q} placeholder="Title" className="h-12 w-full rounded-input border border-line-strong bg-surface px-4 text-base text-ink placeholder:text-ink-muted" />
      </div>
      <SelectField id="filter-status" name="status" label="Status" emptyLabel="All" defaultValue={status} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} />
      <SelectField id="filter-category" name="category" label="Category" emptyLabel="All" defaultValue={categoryId} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <Button type="submit" size="lg">Apply</Button>
        <Link href="/admin/blog" className="inline-flex h-12 items-center px-4 text-ink-muted underline-offset-4 hover:underline">Clear</Link>
      </div>
    </form>
  );
}

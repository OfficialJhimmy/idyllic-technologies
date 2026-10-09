import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { enquiryStatuses, enquiryStatusLabels, enquiryTypes, enquiryTypeLabels } from "@/lib/enquiries/status";

type Props = { q: string; type: string; status: string };

export function EnquiryFilters({ q, type, status }: Props) {
  return (
    <form method="get" role="search" aria-label="Filter enquiries" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto] lg:items-end">
      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
        <label htmlFor="filter-q" className="text-sm font-medium">Search</label>
        <input id="filter-q" name="q" type="search" defaultValue={q} placeholder="Name, email or message" className="h-12 w-full rounded-input border border-line-strong bg-surface px-4 text-base text-ink placeholder:text-ink-muted" />
      </div>
      <SelectField id="filter-type" name="type" label="Type" emptyLabel="All" defaultValue={type} options={enquiryTypes.map((t) => ({ value: t, label: enquiryTypeLabels[t] }))} />
      <SelectField id="filter-status" name="status" label="Status" emptyLabel="All" defaultValue={status} options={enquiryStatuses.map((s) => ({ value: s, label: enquiryStatusLabels[s] }))} />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <Button type="submit" size="lg">Apply</Button>
        <Link href="/admin/enquiries" className="inline-flex h-12 items-center px-4 text-ink-muted underline-offset-4 hover:underline">Clear</Link>
      </div>
    </form>
  );
}

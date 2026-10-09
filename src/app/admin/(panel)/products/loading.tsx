import { Skeleton } from "@/components/ui/states";

export default function ProductsLoading() {
  return (
    <div role="status" aria-label="Loading products" className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="flex flex-col gap-px overflow-hidden rounded-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}

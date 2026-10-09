import { Skeleton } from "@/components/ui/states";

export default function PanelLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex max-w-3xl flex-col gap-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

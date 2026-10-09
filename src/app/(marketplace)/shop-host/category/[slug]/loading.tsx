import { Container } from "@/components/corporate/container";
import { Skeleton } from "@/components/ui/states";

export default function CategoryLoading() {
  return (
    <Container className="pt-10 pb-24">
      <div role="status" aria-label="Loading products" className="flex flex-col gap-8">
        <Skeleton className="h-14 w-72" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-card" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

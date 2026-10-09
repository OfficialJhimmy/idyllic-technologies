import type { PublishStatus } from "@/lib/catalogue/publish";

const styles: Record<PublishStatus, string> = {
  draft: "border border-line-strong text-ink-muted",
  published: "bg-success-soft text-success",
  archived: "bg-sunken text-ink-muted line-through decoration-ink-muted/60",
};

const labels: Record<PublishStatus, string> = { draft: "Draft", published: "Published", archived: "Archived" };

/** Status is always written out, never colour alone. */
export function StatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span className={`inline-flex h-7 items-center rounded-full px-3 text-sm font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

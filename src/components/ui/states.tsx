import type { ReactNode } from "react";

/** Shown when a list has nothing in it. Always says how to fill it. */
export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-card bg-surface px-6 py-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="max-w-[65ch] text-ink-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}

/** Shown when loading a list failed. Says what happened and offers a retry. */
export function ErrorState({ title = "Something went wrong", body, action }: { title?: string; body: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-card bg-error-soft px-6 py-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium text-error">{title}</h2>
        <p className="max-w-[65ch] text-ink">{body}</p>
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-input bg-sunken ${className}`} />;
}

type BannerProps = { tone: "error" | "success" | "info"; children: ReactNode };

const tones = { error: "bg-error-soft text-error", success: "bg-success-soft text-success", info: "bg-sunken text-ink" };

/** Inline message for the result of a save. Errors interrupt screen readers, successes do not. */
export function FormBanner({ tone, children }: BannerProps) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-input px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

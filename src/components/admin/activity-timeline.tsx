import { ArrowsDownUp, CloudArrowUp, EyeSlash, Globe, PencilSimple, Plus, Trash, Lightning } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ActivityKind } from "@/lib/activity-text";
import { timeAgo } from "@/lib/activity-text";
import { clockTime, dayLabel, groupByDay, shortDate } from "@/lib/admin-time";
import type { DashboardActivity } from "@/db/queries/dashboard";

const looks: Record<ActivityKind, { icon: Icon; tone: string }> = {
  create: { icon: Plus, tone: "bg-success-soft text-success" },
  update: { icon: PencilSimple, tone: "bg-primary text-on-primary" },
  delete: { icon: Trash, tone: "bg-error-soft text-error" },
  publish: { icon: Globe, tone: "bg-success-soft text-success" },
  unpublish: { icon: EyeSlash, tone: "bg-sunken text-ink-muted" },
  upload: { icon: CloudArrowUp, tone: "bg-primary text-on-primary" },
  reorder: { icon: ArrowsDownUp, tone: "bg-sunken text-ink-muted" },
  other: { icon: Lightning, tone: "bg-sunken text-ink-muted" },
};

/**
 * Changes grouped by day on a vertical line. Each has an icon for the kind of change, what happened to what,
 * who did it, and the exact time with how long ago it was. Times are in Lagos.
 */
export function ActivityTimeline({ items, compact = false }: { items: DashboardActivity[]; compact?: boolean }) {
  const now = new Date();
  const groups = groupByDay(items, (a) => new Date(a.at));
  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section key={g.key} aria-label={dayLabel(g.date, now)} className="flex flex-col gap-3">
          <h3 className="flex items-baseline gap-3 text-sm font-medium text-ink-muted">
            <span className="text-ink">{dayLabel(g.date, now)}</span>
            <span className="tabular-nums">{shortDate(g.date)}</span>
          </h3>
          <ol className="relative flex flex-col gap-4 before:absolute before:top-3 before:bottom-3 before:left-[1.125rem] before:w-px before:bg-line">
            {g.items.map((a) => {
              const { icon: Glyph, tone } = looks[a.kind];
              const at = new Date(a.at);
              return (
                <li key={a.id} className="relative flex gap-4">
                  <span className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${tone}`}>
                    <Glyph size={18} weight="bold" aria-hidden />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                    <p className={`break-words ${compact ? "line-clamp-2" : ""}`}>
                      {a.verb} {a.noun}
                      {a.name ? <span className="font-medium"> {a.name}</span> : null}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
                      <span>{a.mine ? "You" : (a.who ?? "A team member")}</span>
                      <span aria-hidden>·</span>
                      <time dateTime={a.at} className="tabular-nums" title={`${shortDate(at)}, ${clockTime(at)}`}>
                        {clockTime(at)}
                      </time>
                      <span aria-hidden>·</span>
                      <span>{timeAgo(at)}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

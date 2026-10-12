import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { buttonStyles } from "@/components/ui/button";
import { getDashboard } from "@/db/queries/dashboard";
import { requireAdmin } from "@/lib/auth";
import { timeAgo } from "@/lib/activity-text";
import { enquiryTypeLabels } from "@/lib/enquiries/status";

export const metadata: Metadata = { title: "Dashboard" };

type Counts = { draft: number; published: number; archived: number };

/** A count with the places it leads to. Each figure is a link to the list filtered the same way. */
function StatCard({ title, total, href, parts }: { title: string; total: number; href: string; parts: { label: string; n: number; status: string }[] }) {
  return (
    <section aria-label={title} className="flex flex-col gap-4 rounded-card bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-medium">{title}</h2>
        <Link href={href} className="inline-flex min-h-11 items-center text-sm font-medium text-action underline-offset-4 hover:underline">
          View all
        </Link>
      </div>
      <p className="font-heading text-5xl font-medium tabular-nums">{total}</p>
      <ul className="flex flex-wrap gap-2">
        {parts.map((p) => (
          <li key={p.status}>
            <Link href={`${href}?status=${p.status}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm transition-colors duration-150 hover:bg-sunken">
              <span className="font-medium tabular-nums">{p.n}</span>
              <span className="text-ink-muted">{p.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const parts = (c: Counts) => [
  { label: "published", n: c.published, status: "published" },
  { label: "draft", n: c.draft, status: "draft" },
  { label: "archived", n: c.archived, status: "archived" },
];
const sum = (c: Counts) => c.draft + c.published + c.archived;

export default async function DashboardPage() {
  const session = await requireAdmin();
  const { products, posts, enquiries, newest, activity, activityTotal } = await getDashboard(session.userId);

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <h1 className="text-3xl font-medium sm:text-4xl">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Products" total={sum(products)} href="/admin/products" parts={parts(products)} />
        <StatCard title="Blog posts" total={sum(posts)} href="/admin/blog" parts={parts(posts)} />
        <section aria-label="Enquiries" className="flex flex-col gap-4 rounded-card bg-surface p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-medium">New enquiries</h2>
            <Link href="/admin/enquiries" className="inline-flex min-h-11 items-center text-sm font-medium text-action underline-offset-4 hover:underline">
              View all
            </Link>
          </div>
          <p className="font-heading text-5xl font-medium tabular-nums">{enquiries.new}</p>
          <p className="text-sm text-ink-muted tabular-nums">
            {enquiries.read} read, {enquiries.replied} replied, {enquiries.closed} closed
          </p>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="new-enquiries" className="flex flex-col gap-2 rounded-card bg-surface p-5">
          <h2 id="new-enquiries" className="text-base font-medium">
            Waiting for a reply
          </h2>
          {newest.length === 0 ? (
            <p className="py-4 text-ink-muted">Nothing is waiting. New contact and quote requests appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {newest.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="-mx-2 flex min-h-16 flex-col justify-center gap-0.5 rounded-input px-2 py-3 hover:bg-sunken">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="truncate font-medium">{e.name}</span>
                      <span className="shrink-0 text-sm text-ink-muted">{timeAgo(new Date(e.createdAt))}</span>
                    </span>
                    <span className="line-clamp-1 text-sm text-ink-muted">
                      {enquiryTypeLabels[e.type]}
                      {e.message ? `: ${e.message}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-activity" className="flex flex-col gap-5 rounded-card bg-surface p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="recent-activity" className="text-base font-medium">
              Recent activity
            </h2>
            {activityTotal > 7 ? <span className="text-sm text-ink-muted tabular-nums">Latest 7 of {activityTotal}</span> : null}
          </div>
          {activity.length === 0 ? (
            <p className="py-4 text-ink-muted">No activity yet. Changes made in the admin are listed here.</p>
          ) : (
            <>
              <ActivityTimeline items={activity} compact />
              <Link href="/admin/activity" className={buttonStyles({ variant: "secondary" })}>
                See all activity
                <ArrowRight size={18} aria-hidden />
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

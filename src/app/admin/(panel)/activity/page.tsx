import type { Metadata } from "next";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { activityCount, recentActivity } from "@/db/queries/dashboard";
import { requireAdmin } from "@/lib/auth";
import { parsePage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Activity" };

const PAGE_SIZE = 20;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await requireAdmin();
  const total = await activityCount();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(parsePage((await searchParams).page), pages);
  const items = await recentActivity(PAGE_SIZE, session.userId, (page - 1) * PAGE_SIZE);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title="Activity" description={total ? `Every change made in the admin, newest first. Times are in Lagos. ${total} in all.` : undefined} />
      {items.length === 0 ? (
        <EmptyState title="No activity yet" body="Changes made in the admin are listed here." />
      ) : (
        <div className="rounded-card bg-surface p-5 sm:p-8">
          <ActivityTimeline items={items} />
        </div>
      )}
      <Pagination basePath="/admin/activity" page={page} pages={pages} />
    </div>
  );
}

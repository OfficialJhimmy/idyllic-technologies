import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// Empty by design in Phase 1. Counts, recent activity and new enquiries arrive with their data in Phases 2 and 3.
const sections = [
  { title: "Products", empty: "No products yet. Total, published and draft counts appear here." },
  { title: "Blog posts", empty: "No posts yet. Total, published and draft counts appear here." },
  { title: "Recent activity", empty: "No activity yet. Changes made in the admin are listed here." },
  { title: "New enquiries", empty: "No enquiries yet. New contact and quote requests appear here." },
];

export default function DashboardPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-3xl font-medium sm:text-4xl">Dashboard</h1>
      <ul className="divide-y divide-line rounded-card bg-surface">
        {sections.map(({ title, empty }) => (
          <li key={title} className="flex flex-col gap-1 px-5 py-5 sm:flex-row sm:items-baseline sm:gap-8">
            <h2 className="w-44 shrink-0 text-base font-medium">{title}</h2>
            <p className="text-ink-muted">{empty}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

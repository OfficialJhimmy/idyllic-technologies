import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { listAuthors } from "@/db/queries/blog";

export const metadata: Metadata = { title: "Blog authors" };

export default async function AuthorsPage() {
  const authors = await listAuthors();
  const create = <Link href="/admin/blog/authors/new" className={buttonStyles()}>New author</Link>;
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title="Authors" description="Every published post needs an author." actions={create} />
      {authors.length === 0 ? (
        <EmptyState title="No authors yet" body="Add the first author, then choose them when you write a post." action={create} />
      ) : (
        <ul className="divide-y divide-line rounded-card bg-surface">
          {authors.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/blog/authors/${a.id}`} className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 hover:bg-sunken">
                <span className="font-medium">{a.name}</span>
                <span className="text-ink-muted tabular-nums">{a.postCount} post{a.postCount === 1 ? "" : "s"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

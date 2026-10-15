import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/blog/post-editor";
import { PageHeader } from "@/components/ui/page-header";
import { authorOptions, getPostEditorData, postCategoryOptions, tagNames } from "@/db/queries/blog";
import { idSchema } from "@/lib/catalogue/schemas";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  // Checked first, so a signed out visitor is sent to sign in before any query is started.
  await requireAdmin();
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const [data, authors, categories, tags] = await Promise.all([getPostEditorData(parsed.data), authorOptions(), postCategoryOptions(), tagNames()]);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={data.draft.title}
        back={<Link prefetch={false} href="/admin/blog" className="inline-flex h-11 items-center text-ink-muted underline-offset-4 hover:underline">All posts</Link>}
      />
      <PostEditor key={data.draft.id} initial={data.draft} status={data.status} publishedAt={data.publishedAt} updatedAt={data.updatedAt} authors={authors} categories={categories} tagSuggestions={tags} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />
    </div>
  );
}

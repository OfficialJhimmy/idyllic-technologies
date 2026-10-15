import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/blog/post-editor";
import { PageHeader } from "@/components/ui/page-header";
import { authorOptions, postCategoryOptions, tagNames } from "@/db/queries/blog";
import { emptyPostDraft } from "@/lib/blog/draft";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  // Checked first, so a signed out visitor is sent to sign in before any query is started.
  await requireAdmin();
  const [authors, categories, tags] = await Promise.all([authorOptions(), postCategoryOptions(), tagNames()]);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="New post" description="It stays a draft until you publish it." />
      <PostEditor initial={emptyPostDraft()} status="draft" publishedAt={null} updatedAt={null} authors={authors} categories={categories} tagSuggestions={tags} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />
    </div>
  );
}

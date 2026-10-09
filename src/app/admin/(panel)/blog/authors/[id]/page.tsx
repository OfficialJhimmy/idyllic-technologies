import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorForm } from "@/components/admin/blog/author-form";
import { PageHeader } from "@/components/ui/page-header";
import { getAuthor } from "@/db/queries/blog";
import { idSchema } from "@/lib/catalogue/schemas";

export const metadata: Metadata = { title: "Edit author" };

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const author = await getAuthor(parsed.data);
  if (!author) notFound();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={author.name} />
      <AuthorForm author={{ id: author.id, name: author.name, slug: author.slug, bio: author.bio ?? "", avatar: author.avatar }} postCount={author.postCount} />
    </div>
  );
}

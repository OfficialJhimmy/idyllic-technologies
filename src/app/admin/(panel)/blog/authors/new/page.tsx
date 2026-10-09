import type { Metadata } from "next";
import { AuthorForm } from "@/components/admin/blog/author-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "New author" };

export default function NewAuthorPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="New author" />
      <AuthorForm author={{ id: null, name: "", slug: "", bio: "", avatar: null }} postCount={0} />
    </div>
  );
}

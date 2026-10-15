import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { AuthorForm } from "@/components/admin/blog/author-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "New author" };

export default async function NewAuthorPage() {
  // Checked first, so a signed out visitor is sent to sign in before any query is started.
  await requireAdmin();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="New author" />
      <AuthorForm author={{ id: null, name: "", slug: "", bio: "", avatar: null }} postCount={0} />
    </div>
  );
}

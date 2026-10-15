import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ContentIndex() {
  // Checked first, so a signed out visitor is sent to sign in before any query is started.
  await requireAdmin();
  redirect("/admin/content/faqs");
}

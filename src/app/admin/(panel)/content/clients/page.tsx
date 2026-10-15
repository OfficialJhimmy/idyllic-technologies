import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { ClientManager } from "@/components/admin/content/client-manager";
import { PageHeader } from "@/components/ui/page-header";
import { listClientsAdmin } from "@/db/queries/content";

export const metadata: Metadata = { title: "Clients and partners" };

export default async function ClientsAdminPage() {
  // Checked first, so a signed out visitor is sent to sign in before any query is started.
  await requireAdmin();
  const items = await listClientsAdmin();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Clients and partners" description="Only published logos appear on the website." />
      <ClientManager items={items.map((c) => ({ id: c.id, name: c.name, kind: c.kind, url: c.url, status: c.status, logo: c.logo }))} />
    </div>
  );
}

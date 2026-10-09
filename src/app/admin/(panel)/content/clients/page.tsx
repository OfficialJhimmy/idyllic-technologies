import type { Metadata } from "next";
import { ClientManager } from "@/components/admin/content/client-manager";
import { PageHeader } from "@/components/ui/page-header";
import { listClientsAdmin } from "@/db/queries/content";

export const metadata: Metadata = { title: "Clients and partners" };

export default async function ClientsAdminPage() {
  const items = await listClientsAdmin();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Clients and partners" description="Only published logos appear on the website." />
      <ClientManager items={items.map((c) => ({ id: c.id, name: c.name, kind: c.kind, url: c.url, status: c.status, logo: c.logo }))} />
    </div>
  );
}

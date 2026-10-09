import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin | Idyllic Technologies", template: "%s | Idyllic admin" },
  robots: { index: false, follow: false },
};

// Every page under this layout is behind requireAdmin(). Server actions must call it again.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <AdminShell email={session.email} role={session.role}>
      {children}
    </AdminShell>
  );
}

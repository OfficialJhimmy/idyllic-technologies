import type { Metadata } from "next";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { TeamManager } from "@/components/admin/settings/team-manager";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth";
import { ROLE_LABEL, ROLE_SUMMARY, type Role } from "@/lib/permissions";
import { listTeam } from "@/lib/team/team";

export const metadata: Metadata = { title: "Settings" };

const abilities: { label: string; owner: boolean; editor: boolean }[] = [
  { label: "Products", owner: true, editor: true },
  { label: "Blog posts", owner: true, editor: true },
  { label: "Website content (FAQs, testimonials, clients)", owner: true, editor: true },
  { label: "Media library", owner: true, editor: true },
  { label: "Brands and categories", owner: true, editor: false },
  { label: "Enquiries", owner: true, editor: false },
  { label: "Invite and manage people", owner: true, editor: false },
];

export default async function SettingsPage() {
  const session = await requireAdmin({ section: "settings" });
  const isAdmin = session.role === "owner";
  const team = isAdmin ? await listTeam(session.userId) : [];

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <PageHeader title="Settings" description="Your account, and who can use this admin." />

      <section aria-labelledby="account-heading" className="flex flex-col gap-4 rounded-card bg-surface p-6">
        <h2 id="account-heading" className="text-xl font-medium">
          Your account
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-muted">Email</dt>
            <dd className="font-medium break-all">{session.email ?? "Not available"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-ink-muted">Role</dt>
            <dd>
              <span className="font-medium">{ROLE_LABEL[session.role]}</span>
              <span className="block text-ink-muted">{ROLE_SUMMARY[session.role]}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="roles-heading" className="flex flex-col gap-4">
        <h2 id="roles-heading" className="text-xl font-medium">
          What each role can do
        </h2>
        <div className="overflow-x-auto rounded-card bg-surface">
          <table className="w-full min-w-[28rem] text-left">
            <caption className="sr-only">What Admins and Content staff can do</caption>
            <thead>
              <tr className="border-b border-line text-sm text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">Area</th>
                {(["owner", "editor"] as Role[]).map((r) => (
                  <th key={r} scope="col" className="px-5 py-3 text-center font-medium">{ROLE_LABEL[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {abilities.map((a) => (
                <tr key={a.label}>
                  <th scope="row" className="px-5 py-3 font-normal">{a.label}</th>
                  {([a.owner, a.editor] as boolean[]).map((yes, i) => (
                    <td key={i} className="px-5 py-3 text-center">
                      {yes ? <Check size={20} weight="bold" className="mx-auto text-success" aria-label="Yes" /> : <X size={20} className="mx-auto text-ink-muted" aria-label="No" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin ? (
        <TeamManager members={team} />
      ) : (
        <section aria-labelledby="team-heading" className="flex flex-col gap-2 rounded-card bg-surface p-6">
          <h2 id="team-heading" className="text-xl font-medium">
            Team
          </h2>
          <p className="text-ink-muted">Only Admins can invite people or change who has access.</p>
        </section>
      )}
    </div>
  );
}

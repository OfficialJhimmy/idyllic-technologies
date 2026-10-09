"use client";

import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveClientAction } from "@/app/admin/(panel)/content/actions";
import { ImageField } from "@/components/admin/catalogue/image-field";
import { ContentRow } from "@/components/admin/content/content-row";
import { MediaThumb } from "@/components/admin/media/media-thumb";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { EmptyState, FormBanner } from "@/components/ui/states";
import type { MediaRef } from "@/lib/catalogue/types";

type Item = { id: string; name: string; kind: string; url: string | null; status: "draft" | "published" | "archived"; logo: MediaRef | null };

export function ClientManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const groups = [["client", "Clients"], ["partner", "Partners"]] as const;
  return (
    <section className="flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[56ch] text-ink-muted">Publish a logo only once the organisation has agreed. Logos should be vector or high resolution files.</p>
        <Button onClick={() => setEditing("new")}><Plus size={18} aria-hidden /> Add a logo</Button>
      </div>
      {items.length === 0 ? <EmptyState title="Nothing here yet" body="Add the first client or partner. It stays a draft until you publish it." /> : null}
      {groups.map(([kind, title]) => {
        const rows = items.filter((i) => i.kind === kind);
        if (rows.length === 0) return null;
        return (
          <div key={kind} className="flex flex-col gap-3">
            <h2 className="text-xl font-medium">{title}</h2>
            <ul className="divide-y divide-line rounded-card bg-surface">
              {rows.map((c, i) => (
                <ContentRow key={c.id} kind="client" id={c.id} name={c.name} status={c.status} first={i === 0} last={i === rows.length - 1} onEdit={() => setEditing(c)}>
                  <div className="flex items-center gap-4">
                    {c.logo ? <MediaThumb path={c.logo.storagePath} alt={c.logo.alt} width={c.logo.width} height={c.logo.height} className="w-16 shrink-0" sizes="4rem" /> : <div aria-hidden className="h-16 w-16 shrink-0 rounded-card bg-sunken" />}
                    <div className="min-w-0"><p className="font-medium">{c.name}</p>{c.url ? <p className="truncate text-sm text-ink-muted">{c.url}</p> : null}</div>
                  </div>
                </ContentRow>
              ))}
            </ul>
          </div>
        );
      })}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? "Add a logo" : "Edit logo"}>
        {editing !== null ? <ClientForm key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : editing} onSaved={() => { setEditing(null); router.refresh(); }} /> : null}
      </Dialog>
    </section>
  );
}

function ClientForm({ item, onSaved }: { item: Item | null; onSaved: () => void }) {
  const [name, setName] = useState(item?.name ?? "");
  const [kind, setKind] = useState(item?.kind ?? "client");
  const [url, setUrl] = useState(item?.url ?? "");
  const [logo, setLogo] = useState<MediaRef | null>(item?.logo ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); setError(null); startTransition(async () => { const r = await saveClientAction({ id: item?.id ?? null, name, kind, url, logoMediaId: logo?.id ?? null }); if (!r.ok) { setErrors(r.fieldErrors ?? {}); return setError(r.error ?? "Check the highlighted fields"); } onSaved(); }); }} className="flex min-h-0 flex-col gap-5 overflow-y-auto" noValidate>
      <Field id="c-name" label="Name" value={name} error={errors.name} maxLength={120} required autoFocus onChange={(e) => setName(e.target.value)} />
      <SelectField id="c-kind" label="Type" options={[{ value: "client", label: "Client" }, { value: "partner", label: "Partner" }]} value={kind} onChange={(e) => setKind(e.target.value)} />
      <ImageField label="Logo" value={logo} onChange={setLogo} hint="Without a logo the name is shown as text." />
      <Field id="c-url" label="Link (optional)" type="url" inputMode="url" value={url} error={errors.url} onChange={(e) => setUrl(e.target.value)} />
      {error ? <FormBanner tone="error">{error}</FormBanner> : null}
      <div><Button type="submit" size="lg" loading={pending}>{pending ? "Saving" : "Save"}</Button></div>
    </form>
  );
}

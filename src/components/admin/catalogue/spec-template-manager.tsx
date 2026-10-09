"use client";

import { ArrowDown, ArrowUp, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteSpecAction, reorderSpecsAction } from "@/app/admin/(panel)/categories/actions";
import { SpecForm } from "@/components/admin/catalogue/spec-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, FormBanner } from "@/components/ui/states";
import type { SpecDefinitionView } from "@/lib/catalogue/types";

type Props = { categoryId: string; categoryName: string; specs: SpecDefinitionView[]; valueCounts: Record<string, number> };

const typeLabels = { number: "Number", text: "Text", enum: "List", boolean: "Yes or no" } as const;

/** The spec template for one category: what every product in it can record. */
export function SpecTemplateManager({ categoryId, categoryName, specs, valueCounts }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<SpecDefinitionView | "new" | null>(null);
  const [deleting, setDeleting] = useState<SpecDefinitionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function move(index: number, delta: -1 | 1) {
    const ids = specs.map((s) => s.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    setError(null);
    startTransition(async () => {
      const result = await reorderSpecsAction(categoryId, ids);
      if (!result.ok) setError(result.error ?? "Could not change the order");
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteSpecAction(deleting.id);
      setDeleting(null);
      if (!result.ok) setError(result.error ?? "Could not delete this spec");
      router.refresh();
    });
  }

  const deleteCount = deleting ? (valueCounts[deleting.id] ?? 0) : 0;

  return (
    <section aria-labelledby="template-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="template-heading" className="text-xl font-medium">Spec template</h2>
          <p className="max-w-[65ch] text-ink-muted">
            What every {categoryName} product can record. The order here is the order in the product editor.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus size={18} aria-hidden /> Add spec
        </Button>
      </div>

      {error ? <FormBanner tone="error">{error}</FormBanner> : null}

      {specs.length === 0 ? (
        <EmptyState
          title="No specs yet"
          body="Define the specs from Eaton or the manufacturer's data. Products in this category cannot record specs until at least one exists."
          action={<Button variant="secondary" onClick={() => setEditing("new")}>Add the first spec</Button>}
        />
      ) : (
        <ol className="divide-y divide-line rounded-card bg-surface">
          {specs.map((spec, index) => (
            <li key={spec.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="font-medium">
                  {spec.label}
                  {spec.unit ? <span className="font-normal text-ink-muted">, {spec.unit}</span> : null}
                </p>
                <p className="text-sm text-ink-muted">
                  {typeLabels[spec.valueType]}, key <span className="font-mono">{spec.key}</span>
                  {spec.comparable ? ", comparable" : ""}
                  {spec.filterable ? ", filterable" : ""}
                  {valueCounts[spec.id] ? `, used by ${valueCounts[spec.id]} product${valueCounts[spec.id] === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton label={`Move ${spec.label} up`} disabled={index === 0 || pending} onClick={() => move(index, -1)}>
                  <ArrowUp size={20} aria-hidden />
                </IconButton>
                <IconButton label={`Move ${spec.label} down`} disabled={index === specs.length - 1 || pending} onClick={() => move(index, 1)}>
                  <ArrowDown size={20} aria-hidden />
                </IconButton>
                <IconButton label={`Edit ${spec.label}`} onClick={() => setEditing(spec)}>
                  <PencilSimple size={20} aria-hidden />
                </IconButton>
                <IconButton label={`Delete ${spec.label}`} onClick={() => setDeleting(spec)}>
                  <Trash size={20} aria-hidden />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title={editing === "new" ? "Add a spec" : "Edit spec"}>
        {editing !== null ? (
          <SpecForm
            key={editing === "new" ? "new" : editing.id}
            categoryId={categoryId}
            spec={editing === "new" ? null : editing}
            valueCount={editing === "new" ? 0 : (valueCounts[editing.id] ?? 0)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Delete ${deleting.label}?` : "Delete spec?"}
        body={deleteCount > 0 ? `This also removes the value from ${deleteCount} product${deleteCount === 1 ? "" : "s"}. This cannot be undone.` : "No products use this spec yet. This cannot be undone."}
        confirmLabel="Delete spec"
        onConfirm={confirmDelete}
        pending={pending}
      />
    </section>
  );
}

function IconButton({ label, children, ...props }: { label: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.95] disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

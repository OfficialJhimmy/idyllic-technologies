"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
};

/** For actions that are hard to undo. The confirm button names the action, never just "OK". */
export function ConfirmDialog({ open, onOpenChange, title, body, confirmLabel, onConfirm, pending }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={body}>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={pending}>
          {pending ? "Working" : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

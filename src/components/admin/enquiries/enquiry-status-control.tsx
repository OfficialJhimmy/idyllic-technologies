"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { markEnquiryOpenedAction, setEnquiryStatusAction } from "@/app/admin/(panel)/enquiries/actions";
import { EnquiryStatusBadge } from "@/components/admin/enquiries/enquiry-badges";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/states";
import { enquiryStatuses, enquiryStatusLabels, type EnquiryStatus } from "@/lib/enquiries/status";

/** Shows the status and lets staff change it. Opening a new enquiry marks it read, once. */
export function EnquiryStatusControl({ id, initial }: { id: string; initial: EnquiryStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<EnquiryStatus>(initial);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (initial !== "new") return;
    markEnquiryOpenedAction(id).then((next) => {
      if (next) {
        setStatus(next);
        router.refresh();
      }
    });
  }, [id, initial, router]);

  function change(next: EnquiryStatus) {
    setMessage(null);
    startTransition(async () => {
      const result = await setEnquiryStatusAction(id, next);
      if (!result.ok) return setMessage({ tone: "error", text: result.error });
      setStatus(result.status);
      setMessage({ tone: "success", text: `Marked ${enquiryStatusLabels[result.status].toLowerCase()}` });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Status</span>
        <EnquiryStatusBadge status={status} />
      </div>
      <div role="group" aria-label="Change status" className="flex flex-wrap gap-2">
        {enquiryStatuses.map((s) => (
          <Button key={s} variant={s === status ? "primary" : "secondary"} aria-pressed={s === status} disabled={pending} onClick={() => s !== status && change(s)}>
            {enquiryStatusLabels[s]}
          </Button>
        ))}
      </div>
      {message ? <FormBanner tone={message.tone}>{message.text}</FormBanner> : null}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

// Catches a failed load anywhere in the admin panel. The sidebar and header stay in place.
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      body="This page could not be loaded. Your changes elsewhere are safe. Try again, and if it keeps happening check the database connection."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}

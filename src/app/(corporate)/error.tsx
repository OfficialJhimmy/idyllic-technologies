"use client";

import { useEffect } from "react";
import { PageHero } from "@/components/corporate/page-hero";
import { Button } from "@/components/ui/button";

export default function CorporateError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <PageHero title="Something went wrong" body="This page could not be loaded. Please try again, and if it keeps happening call us.">
      <div className="pt-2">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </PageHero>
  );
}

"use client";

import { useEffect } from "react";
import { Container } from "@/components/corporate/container";
import { Button } from "@/components/ui/button";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Container className="flex flex-col items-start gap-6 pt-20 pb-32">
      <h1 className="text-5xl font-medium sm:text-6xl">Something went wrong</h1>
      <p className="max-w-[52ch] text-lg text-ink-muted">This page could not be loaded. Please try again, and if it keeps happening call us.</p>
      <Button size="lg" onClick={reset}>Try again</Button>
    </Container>
  );
}

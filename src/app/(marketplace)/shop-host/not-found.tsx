import Link from "next/link";
import { Container } from "@/components/corporate/container";

export default function ShopNotFound() {
  return (
    <Container className="flex flex-col items-start gap-6 pt-20 pb-32">
      <h1 className="text-5xl font-medium sm:text-6xl">Page not found</h1>
      <p className="max-w-[52ch] text-lg text-ink-muted">That page is not here. The product may have been removed, or the address may have a typo.</p>
      <Link href="/" className="inline-flex h-12 items-center rounded-full bg-action px-6 font-medium text-on-action">Back to the marketplace</Link>
    </Container>
  );
}

import { Spinner } from "@/components/ui/spinner";

// Shown while the sign-in step is worked out (session and admin list lookups) and after each redirect.
export default function LoginLoading() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <div role="status" className="flex items-center gap-3 text-ink-muted">
        <Spinner className="h-6 w-6 text-action" />
        <span>Loading</span>
      </div>
    </main>
  );
}

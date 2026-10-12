import type { Metadata } from "next";
import Link from "next/link";
import { AcceptInviteForm } from "@/components/admin/accept-invite-form";
import { AuthCarousel } from "@/components/admin/auth-carousel";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wordmark } from "@/components/ui/wordmark";
import { authSlides } from "@/content/auth-slides";
import { inviteTokenSchema } from "@/lib/team/schemas";

export const metadata: Metadata = {
  title: "Accept your invitation | Idyllic admin",
  robots: { index: false, follow: false },
};

type SearchParams = { token_hash?: string; type?: string };

export default async function AcceptInvitePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const token = inviteTokenSchema.safeParse({ tokenHash: sp.token_hash, type: sp.type });

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex flex-col gap-10 px-4 py-6 sm:px-10 lg:px-16 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <Wordmark />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 pb-8">
          {token.success ? (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-medium">Welcome to the admin</h1>
                <p className="max-w-[65ch] text-ink-muted">Choose a password for your account. Next you will set up an authenticator app, which is asked for each time you sign in.</p>
              </div>
              <AcceptInviteForm tokenHash={token.data.tokenHash} type={token.data.type} />
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-medium">This link does not work</h1>
              <p className="max-w-[65ch] text-ink-muted">It may be incomplete, or it was already used. Ask an Admin to send you a new invitation.</p>
              <Link prefetch={false} href="/admin/login" className="inline-flex min-h-11 w-fit items-center font-medium text-action underline underline-offset-4">
                Go to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="hidden p-4 lg:block">
        <AuthCarousel slides={authSlides} />
      </div>
    </main>
  );
}

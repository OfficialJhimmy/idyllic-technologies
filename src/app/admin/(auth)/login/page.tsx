import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCarousel } from "@/components/admin/auth-carousel";
import { LoginForm } from "@/components/admin/login-form";
import { MfaEnroll } from "@/components/admin/mfa-enroll";
import { TotpForm } from "@/components/admin/totp-form";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wordmark } from "@/components/ui/wordmark";
import { authSlides } from "@/content/auth-slides";
import { resolveLoginState } from "@/lib/admin-login";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Sign in | Idyllic admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const state = await resolveLoginState();
  if (state.kind === "done") redirect("/admin");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex flex-col gap-10 px-4 py-6 sm:px-10 lg:px-16 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <Wordmark />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 pb-8">
          {state.kind === "password" && (
            <>
              <Heading title="Sign in" body="Use your Idyllic admin account." />
              <LoginForm />
            </>
          )}
          {state.kind === "mfa" && (
            <>
              <Heading title="Enter your code" body="Open your authenticator app and enter the 6 digit code for this account." />
              <TotpForm factorId={state.factorId} />
            </>
          )}
          {state.kind === "enroll" && (
            <>
              <Heading
                title="Set up two step verification"
                body="Admin accounts need an authenticator app. Scan the code it gives you, then enter the 6 digit code the app shows."
              />
              <MfaEnroll />
            </>
          )}
          {state.kind === "not-allowed" && (
            <>
              <Heading title="No admin access" body="This account is signed in but is not on the admin list. Ask an owner to add it." />
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="lg">
                  Sign out
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
      <div className="hidden p-4 lg:block">
        <AuthCarousel slides={authSlides} />
      </div>
    </main>
  );
}

function Heading({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-medium">{title}</h1>
      <p className="max-w-[65ch] text-ink-muted">{body}</p>
    </div>
  );
}

import { signOutAction } from "@/app/admin/(auth)/login/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wordmark } from "@/components/ui/wordmark";

type Props = { email: string | undefined; role: "owner" | "editor"; children: React.ReactNode };

/** Frame for every signed-in admin page: sidebar on large screens, top bar and scrolling nav below. */
export function AdminShell({ email, role, children }: Props) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4 border-b border-line bg-surface px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:gap-8 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-3">
          <Wordmark />
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle compact />
            <form action={signOutAction}>
              <Button type="submit" variant="ghost">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-3 lg:flex">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{email ?? "Signed in"}</p>
            <p className="text-sm text-ink-muted capitalize">{role}</p>
          </div>
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}

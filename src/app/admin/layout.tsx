// Rendered when asked for, never at build time. Every admin page reads the database and the signed in session, and a
// deploy must not wait on either: when the database was slow, admin pages ran past the 60 second build limit and failed it.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

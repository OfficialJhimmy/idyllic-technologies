/**
 * Which Supabase pooler the app uses on Vercel.
 *
 * The Session pooler (port 5432) is used. The Transaction pooler (port 6543) was tried and does not work with this
 * database driver: reproduced against the real project, a connection that is used again for several queries at once
 * stalls (the first batch works, the next hangs until the database gives up after 2 minutes), with every setting tried.
 * The Session pooler never stalled. Its limit is 15 connections in total, so each copy of the app takes only 1
 * (see ./index.ts) and closes it quickly.
 *
 * A Supabase pooler address on port 6543 is moved to 5432 when the app runs on Vercel, so a setting copied from
 * advice that said "use 6543" cannot cause an outage. Anywhere else it changes nothing.
 */
export function serverlessConnectionUrl(url: string, onVercel: boolean): string {
  if (!onVercel) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".pooler.supabase.com") && parsed.port === "6543") {
      parsed.port = "5432";
      return parsed.toString();
    }
  } catch {
    // Not a URL we can read: use it as it is.
  }
  return url;
}

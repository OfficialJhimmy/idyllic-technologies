/**
 * Supabase's Session pooler (port 5432) allows 15 connections in total, and every serverless copy of the
 * app holds some, so on Vercel it runs out ("EMAXCONNSESSION max clients reached"). The Transaction pooler
 * (port 6543, same host and credentials) is built for this. This swaps the port for a Supabase pooler address
 * when the app runs on Vercel, so a copied local value cannot cause an outage. Anywhere else it changes nothing.
 */
export function serverlessConnectionUrl(url: string, onVercel: boolean): string {
  if (!onVercel) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".pooler.supabase.com") && parsed.port === "5432") {
      parsed.port = "6543";
      return parsed.toString();
    }
  } catch {
    // Not a URL we can read: use it as it is.
  }
  return url;
}

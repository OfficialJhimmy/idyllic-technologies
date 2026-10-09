import { createBrowserClient } from "@supabase/ssr";

/** Browser client. Anon key only. The service role key must never reach client code. */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase public environment variables are not set");
  return createBrowserClient(url, anonKey);
}

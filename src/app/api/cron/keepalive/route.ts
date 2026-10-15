import { sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";

// Rendered on every request, never cached.
export const dynamic = "force-dynamic";

/**
 * Supabase's free plan pauses a project that sees no activity for a week. Vercel calls this address once a day (see
 * vercel.json), and it touches the database and the Supabase API, so the project never counts as idle. It changes nothing.
 *
 * When CRON_SECRET is set (Vercel then sends it as "Authorization: Bearer ..."), only that is accepted, so strangers
 * cannot trigger it. Without it the address still only reads one row, so nothing is exposed either way.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const started = Date.now();
  const result: Record<string, unknown> = {};

  try {
    await db.execute(sql`select 1`);
    const [row] = await db.execute<{ n: number }>(sql`select count(*)::int as n from product_categories`);
    result.database = { ok: true, categories: row?.n ?? null };
  } catch (error) {
    result.database = { ok: false, error: String((error as { code?: string }).code ?? (error as Error).message).slice(0, 120) };
  }

  // A call to the Supabase API too (public data only), so API activity is recorded as well as database activity.
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const response = await fetch(`${base}/rest/v1/product_categories?select=id&limit=1`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, signal: AbortSignal.timeout(15_000) });
    result.api = { ok: response.ok, status: response.status };
  } catch (error) {
    result.api = { ok: false, error: String((error as Error).message).slice(0, 120) };
  }

  const ok = (result.database as { ok: boolean }).ok && (result.api as { ok: boolean }).ok;
  return NextResponse.json({ ok, ms: Date.now() - started, at: new Date().toISOString(), ...result }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}

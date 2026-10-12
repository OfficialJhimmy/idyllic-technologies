import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { serverlessConnectionUrl } from "@/db/connection-url";
import { supabaseAdmin } from "@/lib/supabase/server";

// Rendered on every request, never cached.
export const dynamic = "force-dynamic";

const LIMIT_MS = 20_000;

async function timed(label: string, task: () => PromiseLike<unknown>) {
  const started = Date.now();
  try {
    await Promise.race([task(), new Promise((_, reject) => setTimeout(() => reject(new Error(`no answer in ${LIMIT_MS / 1000}s`)), LIMIT_MS))]);
    return { step: label, ms: Date.now() - started, ok: true as const };
  } catch (error) {
    return { step: label, ms: Date.now() - started, ok: false as const, error: String((error as { code?: string }).code ?? (error as Error).message).slice(0, 120) };
  }
}

/**
 * Where the app runs and how quickly it reaches the database and Supabase's auth service, measured from inside
 * Vercel. It reveals no secrets: the address is described, never printed. Open /api/health on the live site.
 */
export async function GET() {
  const raw = process.env.DATABASE_URL ?? "";
  let described = "DATABASE_URL is not set";
  try {
    const set = new URL(raw);
    const used = new URL(serverlessConnectionUrl(raw, Boolean(process.env.VERCEL)));
    const kind = set.hostname.endsWith(".pooler.supabase.com") ? "Supabase pooler" : set.hostname.startsWith("db.") ? "Supabase direct connection" : "other host";
    described = `${kind}, port in the setting ${set.port || "default"}, port used ${used.port || "default"}`;
  } catch {
    described = raw ? "DATABASE_URL could not be read" : described;
  }

  const first = await timed("database: first query (includes connecting)", () => db.execute(sql`select 1`));
  const second = await timed("database: second query, same connection", () => db.execute(sql`select 1`));
  const real = await timed("database: product_categories", () => db.execute(sql`select id, slug, name from product_categories order by sort asc`));
  const auth = await timed("supabase auth service", () => supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 1 }));

  return NextResponse.json(
    {
      region: process.env.VERCEL_REGION ?? "not on Vercel",
      database: described,
      poolMax: Number(process.env.DB_POOL_MAX) || (process.env.VERCEL ? 2 : 3),
      steps: [first, second, real, auth],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

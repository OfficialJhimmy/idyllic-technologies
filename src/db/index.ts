import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverlessConnectionUrl } from "./connection-url";
import * as schema from "./schema";

declare global {
  var __pg: ReturnType<typeof postgres> | undefined;
}

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Supabase pooler (transaction mode) does not support prepared statements.
  // Serverless: many copies of the app run at once, so connections must not linger. Idle ones are closed after
  // 20 seconds, and a connection that cannot be made fails fast instead of hanging the page.
  return postgres(serverlessConnectionUrl(url, Boolean(process.env.VERCEL)), { prepare: false, max: Number(process.env.DB_POOL_MAX) || 3, idle_timeout: 20, connect_timeout: 10 });
}

const sql = globalThis.__pg ?? client();
if (process.env.NODE_ENV !== "production") globalThis.__pg = sql;

/** Server-only. Connects as the database owner, so RLS does not apply here. */
export const db = drizzle(sql, { schema });
export { schema };

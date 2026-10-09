import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __pg: ReturnType<typeof postgres> | undefined;
}

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Supabase pooler (transaction mode) does not support prepared statements.
  return postgres(url, { prepare: false, max: 5 });
}

const sql = globalThis.__pg ?? client();
if (process.env.NODE_ENV !== "production") globalThis.__pg = sql;

/** Server-only. Connects as the database owner, so RLS does not apply here. */
export const db = drizzle(sql, { schema });
export { schema };

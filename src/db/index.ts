import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverlessConnectionUrl } from "./connection-url";
import { shouldRenew } from "./renew";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;
type Open = { sql: ReturnType<typeof postgres>; db: Db; lastUsed: number };

declare global {
  var __dbOpen: Open | undefined;
}

const onVercel = Boolean(process.env.VERCEL);

function open(): Open {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // The Session pooler allows 15 connections in total, so each copy of the app takes only 1 and gives it back after 5
  // seconds idle (20 elsewhere). The Transaction pooler stalls with this driver (see ./connection-url).
  // prepare false and a connect timeout keep a failed connection from hanging the page.
  const sql = postgres(serverlessConnectionUrl(url, onVercel), { prepare: false, max: Number(process.env.DB_POOL_MAX) || (onVercel ? 1 : 3), idle_timeout: onVercel ? 5 : 20, connect_timeout: 10 });
  return { sql, db: drizzle(sql, { schema }), lastUsed: Date.now() };
}

/** The connection to use now. One that sat unused while the copy was paused is replaced first (see ./renew). */
function current(): Db {
  const now = Date.now();
  const existing = globalThis.__dbOpen;
  if (!existing) {
    globalThis.__dbOpen = open();
  } else if (shouldRenew(existing.lastUsed, now, onVercel)) {
    globalThis.__dbOpen = open();
    // Let anything still running on the old connection finish (up to 30 seconds), then close it.
    void existing.sql.end({ timeout: 30 }).catch(() => {});
  }
  globalThis.__dbOpen!.lastUsed = now;
  return globalThis.__dbOpen!.db;
}

/**
 * Server-only. Connects as the database owner, so RLS does not apply here.
 * Every use goes through `current()`, so callers keep writing `db.select()...` as before.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const live = current() as unknown as Record<string | symbol, unknown>;
    const value = live[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(live) : value;
  },
});
export { schema };

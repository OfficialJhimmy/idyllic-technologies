/**
 * Dumps every table in the public schema to JSON and uploads it to the private "backups" bucket.
 * Also writes the files to ./backups/<stamp>/ so the GitHub workflow can keep them as an artifact.
 * Needs DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Does not import server-only modules, so it runs under tsx.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";


// Load .env.local when run from the CLI. Next.js does this itself for the app.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local. Rely on the real environment.
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

async function main() {
  const sql = postgres(required("DATABASE_URL"), { prepare: false, max: 1 });
  const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join("backups", stamp);
  await mkdir(outDir, { recursive: true });

  const tables = await sql<{ table_name: string }[]>`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name`;

  let failed = 0;
  for (const { table_name } of tables) {
    const rows = await sql.unsafe(`select * from public."${table_name.replace(/"/g, '""')}"`);
    const body = JSON.stringify(rows, replacer, 2);
    await writeFile(path.join(outDir, `${table_name}.json`), body);

    const { error } = await supabase.storage
      .from("backups")
      .upload(`${stamp}/${table_name}.json`, body, { contentType: "application/json", upsert: false });
    if (error) {
      failed += 1;
      console.error(`Upload failed for ${table_name}: ${error.message}`);
    } else {
      console.log(`${table_name}: ${rows.length} rows`);
    }
  }

  await sql.end();
  if (failed > 0) throw new Error(`${failed} table upload(s) failed`);
  console.log(`Backup complete: ${tables.length} tables, ${stamp}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

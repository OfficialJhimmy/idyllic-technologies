import { defineConfig } from "drizzle-kit";

// Load .env.local when run from the CLI. Next.js does this itself for the app.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local. Rely on the real environment.
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});

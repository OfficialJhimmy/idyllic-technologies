import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  REVALIDATE_SECRET: z.string().min(16),
  WHATSAPP_NUMBER: z.string().regex(/^\d{10,15}$/),
});

let cached: z.infer<typeof schema> | undefined;

/** Parsed server environment. Throws with the names of missing variables. */
export function serverEnv() {
  cached ??= schema.parse(process.env);
  return cached;
}

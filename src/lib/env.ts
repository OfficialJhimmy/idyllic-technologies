import "server-only";
import { z } from "zod";

const supabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const schema = supabaseSchema.extend({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SHOP_URL: z.url(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().regex(/^\d{10,15}$/, "digits only, no plus sign"),
  DATABASE_URL: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  REVALIDATE_SECRET: z.string().min(16),
});

export type ServerEnv = z.infer<typeof schema>;
export type SupabaseEnv = z.infer<typeof supabaseSchema>;

function parse<T extends z.ZodType>(s: T): z.infer<T> {
  const result = s.safeParse(process.env);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((i) => i.path.join(".")))].join(", ");
    throw new Error(`Invalid environment. Check: ${names}`);
  }
  return result.data;
}

let cached: ServerEnv | undefined;
let cachedSupabase: SupabaseEnv | undefined;

/** Full server environment. Throws listing the variables that are missing or invalid. */
export function serverEnv(): ServerEnv {
  cached ??= parse(schema);
  return cached;
}

/** Only the Supabase variables, so auth works before every other service is configured. */
export function supabaseEnv(): SupabaseEnv {
  cachedSupabase ??= parse(supabaseSchema);
  return cachedSupabase;
}

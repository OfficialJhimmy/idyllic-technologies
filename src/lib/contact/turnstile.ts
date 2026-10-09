import "server-only";

type Result = { ok: true } | { ok: false; reason: "missing" | "failed" | "unavailable" };

/**
 * Checks the Cloudflare Turnstile token. With no secret configured it only passes outside production,
 * so local work is easy and a forgotten production setting fails closed instead of open.
 */
export async function verifyTurnstile(token: string, ip: string | null): Promise<Result> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") return { ok: true };
    console.error("TURNSTILE_SECRET_KEY is not set, so the contact form is refusing submissions.");
    return { ok: false, reason: "unavailable" };
  }
  if (!token) return { ok: false, reason: "missing" };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { success?: boolean };
    return data.success ? { ok: true } : { ok: false, reason: "failed" };
  } catch (error) {
    console.error("Turnstile check failed to run", error);
    return { ok: false, reason: "unavailable" };
  }
}

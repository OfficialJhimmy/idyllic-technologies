/**
 * Calls to Supabase's auth service give up after 15 seconds. Without a limit, a call that never answers holds the
 * page for minutes (the library also retries some failures), and the person sees a sign in that never finishes.
 */
export const AUTH_TIMEOUT_MS = 15_000;

export const authFetch: typeof fetch = (input, init) => {
  const limit = AbortSignal.timeout(AUTH_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, limit]) : limit;
  return fetch(input, { ...init, signal });
};

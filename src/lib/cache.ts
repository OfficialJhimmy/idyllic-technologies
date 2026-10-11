/**
 * How long a cached public read may be served before it is refreshed in the background.
 * Publishing in the admin refreshes the cache straight away, so this is the safety net: if that refresh
 * is ever missed (it was, once, on Vercel), a list is at most this old instead of up to an hour old.
 */
export const PUBLIC_CACHE_SECONDS = 60;

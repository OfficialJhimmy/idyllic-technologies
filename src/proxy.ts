import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isShopHost } from "@/lib/hosts";

/**
 * 1. Host routing: shop.* requests are rewritten to /shop-host/..., which lives in
 *    src/app/(marketplace)/shop-host. Both groups cannot own "/", so the marketplace
 *    needs a real path segment.
 * 2. /admin is blocked on the shop host.
 * 3. Supabase session cookies are refreshed on admin requests.
 *
 * TODO(phase 4/5): DB-backed redirects table lookup (old WordPress URLs).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const shop = isShopHost(request.headers.get("host"));

  if (shop && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  // The marketplace lives under /shop-host internally. It is never reachable by that path.
  if (pathname === "/shop-host" || pathname.startsWith("/shop-host/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  let response: NextResponse;
  // robots.txt is one file at the root that answers for both hosts, so it is not rewritten.
  if (shop && !pathname.startsWith("/api") && !pathname.startsWith("/_next") && pathname !== "/robots.txt") {
    const url = request.nextUrl.clone();
    url.pathname = `/shop-host${pathname === "/" ? "" : pathname}`;
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (pathname.startsWith("/admin") && supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) =>
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|woff2|ico)$).*)"],
};

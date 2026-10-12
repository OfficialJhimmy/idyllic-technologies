import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Image uploads go through server actions. The app caps files at 4 MB, this leaves room for form overhead.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // The public pages are rendered on request, so without this every visit waits for the database. This lets Vercel's
  // CDN keep each page for 60 seconds (and serve the old copy for another 60 while it fetches a new one). The admin,
  // the API, Next's own files and anything with a file extension are left alone.
  async headers() {
    return [
      {
        source: "/((?!admin|api|_next|.*\\.[A-Za-z0-9]+$).*)",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=60" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      // Supabase Storage public bucket. Host is set from env at build time.
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

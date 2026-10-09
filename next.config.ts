import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Image uploads go through server actions. The app caps files at 4 MB, this leaves room for form overhead.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
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

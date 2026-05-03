import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImagePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] =
  (() => {
    if (!supabaseUrl) return [];
    try {
      const host = new URL(supabaseUrl).hostname;
      return [
        {
          protocol: "https" as const,
          hostname: host,
          pathname: "/storage/v1/object/public/**",
        },
      ];
    } catch {
      return [];
    }
  })();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePatterns,
  },
};

export default nextConfig;

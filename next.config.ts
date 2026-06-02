import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Allow all HTTPS sources — covers Unsplash, Wikimedia, Supabase, and any
    // user-uploaded images from third-party domains.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    // Wikimedia and some Vietnamese sites block the Next.js image proxy.
    // Using unoptimized serves images directly from their origin URL,
    // avoiding the /_next/image proxying step entirely.
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@radix-ui/react-dialog"],
  },
};

export default withNextIntl(nextConfig);

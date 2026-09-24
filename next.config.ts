import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloud.appwrite.io", pathname: "/v1/storage/**" },
      { protocol: "https", hostname: "cloud.appwrite.io", pathname: "/v1/storage/**" },
    ],
    formats: ["image/webp"],
    // Photos are immutable (a changed photo gets a new file ID), so cache long.
    minimumCacheTTL: 2678400,
  },
  experimental: {
    serverActions: {
      // Photos are resized in the browser before upload; Vercel caps bodies at 4.5 MB.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
    // Photos uploaded from the site manager live in Convex file storage.
    remotePatterns: [{ protocol: "https", hostname: "**.convex.cloud", pathname: "/api/storage/**" }],
  },
};

export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // serve locally-hosted photos via next/image (no remote domains needed)
    unoptimized: false,
  },
};

export default nextConfig;

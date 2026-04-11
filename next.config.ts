import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/landing-assets/img/:path*",
        destination:
          "https://bootstrapmade.com/content/demo/Spotlight/assets/img/:path*",
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      {
        source: "/forum",
        destination: "/discussion",
        permanent: true,
      },
      {
        source: "/forum/:path*",
        destination: "/discussion/:path*",
        permanent: true,
      },
    ];
  },
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

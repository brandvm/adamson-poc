import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the www and preview servers run side by side from one folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // WordPress media is served through this app (see lib/wp.ts), so the site
  // also works from other devices on the network.
  // /wp-admin and the login page live on WordPress, not on this site: send people there.
  async redirects() {
    if (process.env.WP_SNAPSHOT === "1") return [];
    const wp = process.env.WP_URL ?? "http://127.0.0.1:9400";
    return [
      { source: "/wp-admin", destination: `${wp}/wp-admin/`, permanent: false },
      { source: "/wp-admin/:path*", destination: `${wp}/wp-admin/:path*`, permanent: false },
      { source: "/wp-login.php", destination: `${wp}/wp-login.php`, permanent: false },
    ];
  },
  // In snapshot mode (WP_SNAPSHOT=1) the media files are in public/wp-content instead.
  async rewrites() {
    if (process.env.WP_SNAPSHOT === "1") return [];
    return []; // /wp-content is served by app/wp-content/[...path]/route.ts (byte ranges for video)
  },
  // Snapshot data is read from disk at runtime by the API routes: ship it.
  outputFileTracingIncludes: { "/**": ["./snapshot/**"] },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

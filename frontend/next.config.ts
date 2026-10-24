import type { NextConfig } from "next";

// Express API (../backend). Proxied so the refresh cookie is first-party and phones on the LAN reach it too.
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
  experimental: {
    agentFeedback: true,
    // Every page sits behind the client-side sign-in check (RequireAuth), so the server never renders
    // them and implicit instant-navigation validation has nothing to check. Validate only segments
    // that opt in with `export const instant`.
    instantInsights: { validationLevel: "manual-warning" },
  },
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

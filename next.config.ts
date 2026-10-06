import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  // Content JSON is read from disk at runtime; make sure it ships with standalone builds.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};

export default nextConfig;

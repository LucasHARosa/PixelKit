import type { NextConfig } from "next";

// Static export: no server, no API routes. Cache Components is left off
// because it needs the Node.js runtime, which a static host doesn't have.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    // mupdf imports "module" only when running in Node; browsers never reach it.
    resolveAlias: {
      module: { browser: "./lib/node-stub.ts" },
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

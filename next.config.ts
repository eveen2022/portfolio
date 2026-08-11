import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" bundles a minimal self-contained server for Docker
  // deployment (see Dockerfile/docker-compose.yml) — Vercel has its own
  // build/tracing pipeline that conflicts with this output mode (it's the
  // cause of a "next-server.js.nft.json" ENOENT build error). Vercel sets
  // the VERCEL env var automatically during its builds, so this only
  // applies when building for Docker, not when building on Vercel.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;

import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import packageJson from "./package.json";

/** Short commit SHA: Vercel provides it; locally fall back to git. */
function resolveCommit(): string {
  const fromCi = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (fromCi) return fromCi.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}

function resolveChannel(): string {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

const nextConfig: NextConfig = {
  // Inlined into the client bundle; read via src/lib/version.ts.
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_BUILD_SHA: resolveCommit(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_CHANNEL: resolveChannel(),
  },
};

export default nextConfig;

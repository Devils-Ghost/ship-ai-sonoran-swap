import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import { parseServerEnv } from "./lib/env";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // guides are MDX in content/guides (imported by app/guides/[slug]); pages stay .ts/.tsx only.
  pageExtensions: ["ts", "tsx"],
  // The gallery/mock image providers read public/samples from disk inside the render function.
  outputFileTracingIncludes: { "/api/render": ["./public/samples/*.jpg"] },
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

export default function config(phase: string): NextConfig {
  // a missing or malformed variable stops dev and build with a readable list.
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_DEVELOPMENT_SERVER) {
    parseServerEnv(process.env);
  }
  return withMDX(nextConfig);
}

const withMDX = createMDX();

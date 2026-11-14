import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Agent docs live at the repo root (CLAUDE.md, .claude/); don't let `next dev` write AGENTS.md.
  agentRules: false,
  cacheComponents: true,
  reactCompiler: true,
  typedRoutes: false,
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

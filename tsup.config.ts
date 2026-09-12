import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "index.ts",
    "smart-edges": "app/smart-edges/index.tsx",
    hooks: "lib/hooks.ts",
    layout: "lib/hierarchical-layout.ts",
    router: "lib/smart-router.ts",
  },
  tsconfig: "tsconfig.build.json",
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "@xyflow/react",
    "@xyflow/system",
    "next",
    "@teispace/next-themes",
    "lucide-react",
    "clsx",
    "tailwind-merge",
    "pathfinding",
    "@clarkmcc/ngraph",
  ],
  banner: {
    js: '"use client";',
  },
});

import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next-intl": path.resolve(__dirname, "./src/lib/shims/next-intl.tsx"),
      "next-intl/server": path.resolve(
        __dirname,
        "./src/lib/shims/next-intl.tsx",
      ),
      "next/link": path.resolve(__dirname, "./src/lib/shims/next-link.tsx"),
      "next/navigation": path.resolve(
        __dirname,
        "./src/lib/shims/next-navigation.ts",
      ),
      "next/dynamic": path.resolve(
        __dirname,
        "./src/lib/shims/next-dynamic.ts",
      ),
      "@clerk/nextjs": path.resolve(__dirname, "./src/lib/shims/clerk.ts"),
      "next/image": path.resolve(__dirname, "./src/lib/shims/next-image.tsx"),
      "@google/generative-ai": path.resolve(
        __dirname,
        "./src/lib/shims/google-ai.ts",
      ),
    },
  },
  test: {
    environment: "node",
  },
});

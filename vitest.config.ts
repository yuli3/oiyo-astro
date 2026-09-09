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
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      // repo 안에 워크트리가 생기면 그 안의 테스트까지 수집된다. 워크트리는
      // 자체 node_modules 를 갖고 있어 React 인스턴스가 둘이 되고, useMemo /
      // useRef 가 null 을 돌려주며 실패한다. 이 실패는 코드가 아니라 배치의
      // 문제인데도 매번 "무관한 기존 실패"로 읽어내야 했다. (2026-09-09)
      "**/.worktrees/**",
    ],
  },
});

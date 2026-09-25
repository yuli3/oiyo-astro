/**
 * Runtime `OntologyNode.i18nKey` → localized string resolver.
 *
 * Mirrors `resolveI18nKey()` in `nodes.test.ts` — same dotted
 * "namespace.path.to.key" lookup against the real
 * `src/i18n/messages/<locale>/<namespace>.json` files, just usable outside
 * tests. This intentionally doesn't go through `src/lib/i18n/registry.ts`
 * (its relative import paths don't resolve — see AGENT_WORKLOG) or
 * `src/i18n/index.ts` (its `files` allowlist doesn't include domain
 * namespaces like `big5`/`elements`/`zodiac`/`hobby`/`career`).
 */
// `import(\`@/i18n/...\`)` 로 두면 Vite 가 별칭 경로를 템플릿 import 로 풀지 못해
// 빌드 산출물에 문자열 그대로 남고, 브라우저에서 늘 실패해 라벨이 id 로 보였다
// (2026-09-25 확인: dist 에 `import(\`@/i18n/messages/${e}/${a}.json\`)`).
// glob 은 빌드가 파일마다 chunk 를 만들어 두고, 필요한 것만 받아 온다.
const MESSAGE_MODULES = import.meta.glob("../../../i18n/messages/*/*.json");

export async function resolveNodeLabel(locale: string, i18nKey: string): Promise<string | undefined> {
  const [namespace, ...path] = i18nKey.split(".");
  try {
    const load = MESSAGE_MODULES[`../../../i18n/messages/${locale}/${namespace}.json`];
    if (!load) return undefined;
    const mod = (await load()) as { default?: unknown };
    let cur: unknown = mod.default ?? mod;
    for (const part of path) {
      if (cur == null || typeof cur !== "object") return undefined;
      cur = (cur as Record<string, unknown>)[part];
    }
    return typeof cur === "string" ? cur : undefined;
  } catch {
    return undefined;
  }
}

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
export async function resolveNodeLabel(locale: string, i18nKey: string): Promise<string | undefined> {
  const [namespace, ...path] = i18nKey.split(".");
  try {
    const mod = await import(`@/i18n/messages/${locale}/${namespace}.json`);
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

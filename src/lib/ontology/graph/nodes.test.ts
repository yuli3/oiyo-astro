import { describe, expect, it } from "vitest";

import { LOCALES } from "@/i18n";

import { getNode, NODES } from "./nodes";

/**
 * Resolves `node.i18nKey` (a dotted "namespace.path.to.key" string) against
 * the real `src/i18n/messages/<locale>/<namespace>.json` files — the same
 * files every namespace-scoped translator in this app ultimately reads
 * from. This intentionally doesn't go through `src/lib/i18n/registry.ts`
 * (its relative import paths don't resolve — see AGENT_WORKLOG) or
 * `src/i18n/index.ts` (its `files` allowlist doesn't include domain
 * namespaces like `big5`/`elements`/`zodiac`/`hobby`/`career`).
 */
async function resolveI18nKey(locale: string, i18nKey: string): Promise<unknown> {
  const [namespace, ...path] = i18nKey.split(".");
  const mod = await import(`@/i18n/messages/${locale}/${namespace}.json`);
  let cur: unknown = mod.default ?? mod;
  for (const part of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

describe("ontology graph node ids", () => {
  it("has no duplicate node ids", () => {
    const ids = NODES.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves getNode() for every known id", () => {
    for (const node of NODES) {
      expect(getNode(node.id)).toBe(node);
    }
  });
});

describe("ontology graph node i18nKey coverage", () => {
  for (const locale of LOCALES) {
    it(`resolves every node's i18nKey to a non-empty string in ${locale}`, async () => {
      for (const node of NODES) {
        const value = await resolveI18nKey(locale, node.i18nKey);
        expect(
          typeof value === "string" && value.length > 0,
          `${node.id} (${node.i18nKey}) missing in ${locale}`,
        ).toBe(true);
      }
    });
  }
});

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(new URL("./PoliticalCompassTest.tsx", import.meta.url), "utf8");

describe("PoliticalCompassTest privacy contract", () => {
  it("scores locally without an external Worker request", () => {
    expect(SOURCE).toContain("scorePoliticalCompass(answers)");
    expect(SOURCE).not.toContain("workers.dev");
    expect(SOURCE).not.toMatch(/\bfetch\s*\(/);
  });

  it("stores only the result code, not item-level political answers", () => {
    expect(SOURCE).toContain("result: { code, instrumentVersion: POLITICAL_INSTRUMENT_VERSION }");
    expect(SOURCE).toContain("political-compass-oiyo-41-v2");
    expect(SOURCE).not.toContain("inputs: { answers }");
  });

  it("keeps analytics payloads limited to stable identifiers", () => {
    const calls = [...SOURCE.matchAll(/gaEvent\(\s*['"]([^'"]+)['"]\s*,\s*\{([^}]*)\}\s*\)/g)];
    expect(calls.map((match) => match[1])).toEqual(["test_started", "test_completed"]);
    for (const call of calls) {
      const keys = [...call[2].matchAll(/([a-z_]+)\s*:/g)].map((match) => match[1]);
      expect(keys.every((key) => ["test_id", "instrument_version"].includes(key))).toBe(true);
    }
  });
});

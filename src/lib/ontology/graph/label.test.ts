import { describe, expect, it } from "vitest";

import { resolveNodeLabel } from "./label";

describe("resolveNodeLabel", () => {
  it("resolves a known ontology node i18nKey to a non-empty string", async () => {
    const label = await resolveNodeLabel("ko", "elements.wood.name");
    expect(typeof label).toBe("string");
    expect((label ?? "").length).toBeGreaterThan(0);
  });

  it("resolves RIASEC orbit labels in every active locale", async () => {
    expect(await resolveNodeLabel("ko", "career.types.artistic.name")).toBe("예술형 (창작가)");
    for (const locale of ["en", "ja", "zh", "fr", "es"]) {
      const label = await resolveNodeLabel(locale, "career.types.artistic.name");
      expect(label, locale).toBeTruthy();
      expect(label, locale).not.toBe("artistic");
    }
  });

  it("returns undefined for an unknown namespace", async () => {
    expect(await resolveNodeLabel("ko", "does-not-exist.foo")).toBeUndefined();
  });

  it("returns undefined for a key that doesn't resolve inside a real namespace", async () => {
    expect(await resolveNodeLabel("ko", "elements.does-not-exist.name")).toBeUndefined();
  });
});

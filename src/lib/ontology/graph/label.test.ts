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

  it("resolves ontology recommendation card copy in every active locale", async () => {
    expect(await resolveNodeLabel("ko", "recommendations.cards.matchLabel")).toBe("맞음");
    expect(await resolveNodeLabel("ko", "recommendations.cards.categories.science")).toBe("과학");
    expect(await resolveNodeLabel("ko", "recommendations.science.dopamine_fast.title")).toBe("도파민 휴식");
    const keys = [
      "recommendations.cards.why",
      "recommendations.cards.explore",
      "recommendations.cards.reasonTemplate",
      "recommendations.cards.reasonFallback",
      "recommendations.cards.categories.career",
      "recommendations.cards.sources.riasec",
      "recommendations.science.dopamine_fast.title",
    ];
    for (const locale of ["ko", "en", "ja", "zh", "fr", "es"]) {
      for (const key of keys) {
        const label = await resolveNodeLabel(locale, key);
        expect(label, `${locale} ${key}`).toBeTruthy();
        expect(label, `${locale} ${key}`).not.toContain("recommendations.");
      }
    }
  });

  it("returns undefined for an unknown namespace", async () => {
    expect(await resolveNodeLabel("ko", "does-not-exist.foo")).toBeUndefined();
  });

  it("returns undefined for a key that doesn't resolve inside a real namespace", async () => {
    expect(await resolveNodeLabel("ko", "elements.does-not-exist.name")).toBeUndefined();
  });
});

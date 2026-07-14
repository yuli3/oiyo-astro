import { describe, expect, it } from "vitest";
import { CAREER_VALUE_IDS, CAREER_VALUES_INSTRUMENT, buildCareerValuesResult, careerValuesPlugin, rankedCareerValueGroups } from ".";

function responses(values: Record<string, number> = {}) { return Object.fromEntries(CAREER_VALUES_INSTRUMENT.items.map((item) => [item.id, values[item.id] ?? 3])); }

describe("career values plugin", () => {
  it("defines exactly 18 original items across six dimensions and six locales", () => {
    expect(CAREER_VALUES_INSTRUMENT.items).toHaveLength(18);
    expect(CAREER_VALUE_IDS.every((id) => CAREER_VALUES_INSTRUMENT.items.filter((item) => item.constructId === `values.work.${id}`).length === 3)).toBe(true);
    expect(Object.keys(careerValuesPlugin.locale).sort()).toEqual(["en", "es", "fr", "ja", "ko", "zh"]);
    expect(Object.values(careerValuesPlugin.locale).every((entry) => Object.keys(entry.content.strings).length === 18)).toBe(true);
  });

  it("rejects missing, out-of-range, and unknown responses", () => {
    expect(() => buildCareerValuesResult({})).toThrow("q1 must be an integer from 1 to 5");
    expect(() => buildCareerValuesResult({ ...responses(), q1: 6 })).toThrow("q1 must be an integer from 1 to 5");
    expect(() => buildCareerValuesResult({ ...responses(), email: 3 })).toThrow("Unknown career-values item: email");
  });

  it("scores 3–15 as 0–100 without percentile claims or raw responses", () => {
    const result = buildCareerValuesResult(responses({ q1: 5, q2: 5, q3: 5 }));
    expect(result.scores).toMatchObject({ raw: { security: 15, achievement: 9 }, normalized: { security: 100, achievement: 50 } });
    expect(result.scores.percentile).toBeUndefined();
    expect(result.responses).toBeUndefined();
    expect(result.quality.responseWarnings.join(" ")).toContain("not norms");
  });

  it("preserves ties instead of selecting arbitrary first and second dimensions", () => {
    const result = buildCareerValuesResult(responses());
    expect(rankedCareerValueGroups(result.scores.normalized)).toEqual([CAREER_VALUE_IDS]);
    expect(result.classifications).toHaveLength(6);
  });

  it("keeps official sources as concept references only", () => {
    expect(careerValuesPlugin.manifest).toMatchObject({ evidenceTier: "reflective-framework", indexable: false, status: "draft" });
    expect(careerValuesPlugin.sources.license.status).toBe("original");
    expect(careerValuesPlugin.sources.records.every((source) => source.citation.includes("reference only") || source.citation.includes("Concept reference only"))).toBe(true);
  });
});

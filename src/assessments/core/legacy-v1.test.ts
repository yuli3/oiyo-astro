import { describe, expect, it } from "vitest";

import { adaptLegacyV1StoredTestResult } from "./legacy-v1";

const LEGACY = {
  createdAt: "2026-07-13T00:00:00.000Z",
  id: "big5:2026-07-13T00:00:00.000Z",
  kind: "psychometric",
  locale: "ko",
  result: {
    percentages: { openness: 80 },
    rawScores: { openness: 12 },
  },
  resultLabel: "Openness 80%",
  sourcePath: "/ko/big5/test",
  testId: "big5",
  title: "Big Five",
};

describe("legacy v1 assessment adapter", () => {
  it("preserves provenance and produces a canonical v2 result", () => {
    const result = adaptLegacyV1StoredTestResult(LEGACY);
    expect(result.schema).toBe("oiyo.assessment-result");
    expect(result.schemaVersion).toBe(2);
    expect(result.assessmentId).toBe("big5");
    expect(result.resultId).toBe(LEGACY.id);
    expect(result.locale).toBe("ko");
    expect(result.scores.raw).toEqual({ openness: 12 });
    expect(result.scores.normalized).toEqual({ openness: 80 });
    expect(result.legacy?.payload).toBe(LEGACY.result);
    expect(result.versions.scoring).toBe("legacy-v1");
  });

  it("does not guess scores from an arbitrary flat payload", () => {
    const result = adaptLegacyV1StoredTestResult({
      ...LEGACY,
      result: { O: 80, type: "example" },
    });
    expect(result.scores).toEqual({
      normalized: {},
      percentile: undefined,
      raw: {},
    });
  });

  it("supports a plugin-specific score extractor", () => {
    const result = adaptLegacyV1StoredTestResult(LEGACY, {
      evidenceTier: "validated-scale",
      extractScores: () => ({ normalized: { O: 80 }, raw: { O: 16 } }),
      scoringVersion: "2.1.0",
    });
    expect(result.scores.normalized).toEqual({ O: 80 });
    expect(result.evidenceTier).toBe("validated-scale");
    expect(result.versions.scoring).toBe("2.1.0");
  });

  it("maps legacy ontology/fortune kinds without failing on unknown locale", () => {
    const result = adaptLegacyV1StoredTestResult({
      ...LEGACY,
      kind: "fortune",
      locale: "de",
    });
    expect(result.kind).toBe("mystic");
    expect(result.locale).toBeUndefined();
  });
});

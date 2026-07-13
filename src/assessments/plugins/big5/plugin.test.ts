import { describe, expect, it } from "vitest";

import { buildAssessmentResult } from "../../core";
import { bigFiveClassifications, bigFivePlugin } from "./plugin";
import { bigFiveResponsesFromAnswers, scoreLegacyBigFiveAnswers } from "./scoring";

describe("Big Five reference plugin", () => {
  it.each([
    [1, { O: 0, C: 0, E: 0, A: 0, N: 0 }],
    [3, { O: 50, C: 50, E: 50, A: 50, N: 50 }],
    [5, { O: 100, C: 100, E: 100, A: 100, N: 100 }],
  ])("keeps the live 20-item %i fixture", (answer, expected) => {
    expect(scoreLegacyBigFiveAnswers(Array(20).fill(answer))).toEqual(expected);
  });

  it("scores a mixed profile deterministically", () => {
    const answers = [
      ...Array(4).fill(5), ...Array(4).fill(4), ...Array(4).fill(3),
      ...Array(4).fill(2), ...Array(4).fill(1),
    ];
    expect(scoreLegacyBigFiveAnswers(answers)).toEqual({ O: 100, C: 75, E: 50, A: 25, N: 0 });
  });

  it("builds versioned results and ontology signals without percentiles", () => {
    const result = buildAssessmentResult(
      bigFivePlugin,
      bigFiveResponsesFromAnswers(Array(20).fill(3)),
      { classifications: bigFiveClassifications({ O: 50, C: 50, E: 50, A: 50, N: 50 }), completedAt: "2026-07-13T00:00:00.000Z" },
    );
    expect(result.versions.instrument).toBe("big5-ocean-20-v1");
    expect(result.scores.percentile).toBeUndefined();
    expect(bigFivePlugin.ontology.toSignals(result)).toHaveLength(5);
  });

  it("rejects incomplete answers", () => {
    expect(() => buildAssessmentResult(bigFivePlugin, bigFiveResponsesFromAnswers([5]))).toThrow("incomplete big5");
  });
});

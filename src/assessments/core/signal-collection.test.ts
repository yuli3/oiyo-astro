import { describe, expect, it } from "vitest";

import type { AssessmentPlugin } from "./plugin";
import type { CanonicalAssessmentResult } from "./result";
import { ontologySignalsFromResults } from "./signal-collection";

function result(resultId: string, completedAt: string): CanonicalAssessmentResult {
  return {
    assessmentId: "example",
    classifications: [],
    completedAt,
    evidenceTier: "educational",
    kind: "other",
    quality: { completionRate: 1, responseWarnings: [] },
    resultId,
    schema: "oiyo.assessment-result",
    schemaVersion: 2,
    scores: { dimensions: {} },
    versions: { instrument: "i1", interpretation: "x1", scoring: "s1" },
  };
}

describe("ontologySignalsFromResults", () => {
  it("uses only the newest result for each assessment", () => {
    const plugin = {
      ontology: {
        toSignals: (value: CanonicalAssessmentResult) => [{
          confidence: 0.5,
          constructId: "example.construct",
          evidenceTier: value.evidenceTier,
          id: `signal:${value.resultId}`,
          observedAt: value.completedAt,
          provenance: {
            instrumentVersion: value.versions.instrument,
            resultId: value.resultId,
            scoringVersion: value.versions.scoring,
          },
          sourceAssessmentId: value.assessmentId,
          value: 50,
        }],
      },
    } as AssessmentPlugin;

    const signals = ontologySignalsFromResults(
      [result("old", "2026-01-01T00:00:00.000Z"), result("new", "2026-02-01T00:00:00.000Z")],
      () => plugin,
    );

    expect(signals.map((signal) => signal.id)).toEqual(["signal:new"]);
  });

  it("skips unknown plugins", () => {
    expect(ontologySignalsFromResults([result("one", "2026-01-01T00:00:00.000Z")], () => undefined)).toEqual([]);
  });

  it("drops contextual signals after their explicit expiry", () => {
    const value = result("expired", "2026-01-01T00:00:00.000Z");
    const plugin = {
      ontology: {
        toSignals: () => [{
          confidence: 0.5,
          constructId: "relationship.contextual",
          evidenceTier: "research-inspired",
          expiresAt: "2026-04-01T00:00:00.000Z",
          id: "signal:expired",
          observedAt: value.completedAt,
          provenance: { instrumentVersion: "i1", resultId: value.resultId, scoringVersion: "s1" },
          sourceAssessmentId: "example",
          value: 50,
        }],
      },
    } as AssessmentPlugin;

    expect(ontologySignalsFromResults(
      [value],
      () => plugin,
      new Date("2026-04-02T00:00:00.000Z"),
    )).toEqual([]);
  });

  it("prefers the higher-confidence instrument for the same construct", () => {
    const quick = result("quick", "2026-03-01T00:00:00.000Z");
    quick.assessmentId = "quick";
    const full = result("full", "2026-02-01T00:00:00.000Z");
    full.assessmentId = "full";

    const plugin = (confidence: number) => ({
      ontology: {
        toSignals: (value: CanonicalAssessmentResult) => [{
          confidence,
          constructId: "vocation.riasec.R",
          evidenceTier: value.evidenceTier,
          id: `signal:${value.resultId}`,
          observedAt: value.completedAt,
          provenance: {
            instrumentVersion: value.versions.instrument,
            resultId: value.resultId,
            scoringVersion: value.versions.scoring,
          },
          sourceAssessmentId: value.assessmentId,
          value: 50,
        }],
      },
    } as AssessmentPlugin);

    const signals = ontologySignalsFromResults(
      [quick, full],
      (id) => id === "full" ? plugin(0.7) : plugin(0.5),
    );

    expect(signals.map((signal) => signal.id)).toEqual(["signal:full"]);
  });
});

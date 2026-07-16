import { describe, expect, it } from "vitest";

import type {
  AssessmentPlugin,
  CanonicalAssessmentResult,
  ScoreSet,
} from "../core";
import { adaptLegacyV1StoredTestResult } from "../core";
import {
  attachmentPlugin,
  bigFivePlugin,
  careerValuesPlugin,
  mbtiPlugin,
  riasecFullPlugin,
} from "../plugins";
import {
  PERSONAL_PROFILE_V1_INSTRUMENTS,
  projectPersonalProfileSnapshot,
} from "./projection";
import fixtures from "../../../config/personal-profile-snapshot-v1.fixtures.json";

const plugins = new Map<string, AssessmentPlugin>([
  bigFivePlugin,
  mbtiPlugin,
  riasecFullPlugin,
  careerValuesPlugin,
  attachmentPlugin,
].map((plugin) => [plugin.id, plugin]));

function result(
  plugin: AssessmentPlugin,
  normalized: Record<string, number>,
  completedAt: string,
  responses?: Record<string, number | string | boolean | string[]>,
): CanonicalAssessmentResult {
  const scores: ScoreSet = { normalized, raw: { ...normalized } };
  return {
    assessmentId: plugin.id,
    classifications: [],
    completedAt,
    evidenceTier: plugin.manifest.evidenceTier,
    kind: plugin.manifest.kind,
    quality: { completionRate: 1, responseWarnings: [] },
    responses,
    resultId: `${plugin.id}:${completedAt}`,
    schema: "oiyo.assessment-result",
    schemaVersion: 2,
    scores,
    versions: {
      instrument: plugin.instrument.version,
      interpretation: plugin.interpreter.version,
      scoring: plugin.scorer.version,
    },
  };
}

const lookup = (assessmentId: string) => plugins.get(assessmentId);
const NOW = new Date("2026-07-16T00:00:00.000Z");

function fiveResults(): CanonicalAssessmentResult[] {
  return [
    result(bigFivePlugin, { O: 80, C: 70, E: 45, A: 60, N: 25 }, "2026-07-01T00:00:00.000Z", { q1: "RAW_SENTINEL" }),
    result(mbtiPlugin, { EI: 50, SN: 75, TF: 25, JP: 50 }, "2026-07-02T00:00:00.000Z"),
    result(riasecFullPlugin, { R: 90, I: 80, A: 70, S: 60, E: 50, C: 40 }, "2026-07-03T00:00:00.000Z"),
    result(careerValuesPlugin, { security: 50, achievement: 60, autonomy: 90, service: 60, creativity: 90, status: 40 }, "2026-07-04T00:00:00.000Z"),
    result(attachmentPlugin, { anxiety: 70, avoidance: 30 }, "2026-07-05T00:00:00.000Z"),
  ];
}

describe("PersonalProfileSnapshot v1 projection", () => {
  it("projects five instruments into independent lanes with complete provenance", () => {
    const snapshot = projectPersonalProfileSnapshot(fiveResults(), { lookup, now: NOW });

    expect(snapshot).toMatchObject({
      schema: "oiyo.personal-profile-snapshot",
      schemaVersion: 1,
      generatedAt: NOW.toISOString(),
    });
    expect(snapshot.instruments).toHaveLength(5);
    expect(snapshot.instruments.every((item) => item.availability === "present")).toBe(true);
    expect(snapshot.lanes.map((lane) => lane.id)).toEqual(PERSONAL_PROFILE_V1_INSTRUMENTS.map((item) => item.lane));

    const projections = snapshot.lanes.flatMap((lane) => lane.projections);
    expect(new Set(projections.map((item) => item.sourceAssessmentId))).toEqual(
      new Set(PERSONAL_PROFILE_V1_INSTRUMENTS.map((item) => item.assessmentId)),
    );
    expect(projections.every((item) => item.measuredAt && item.provenance.instrumentVersion && item.provenance.scoringVersion && item.provenance.interpretationVersion)).toBe(true);
    expect(JSON.stringify(snapshot)).not.toContain("RAW_SENTINEL");
    expect(JSON.stringify(snapshot)).not.toContain("responses");
  });

  it("keeps the checked synthetic fixture inventory aligned with live plugins", () => {
    const byAssessment = new Map(fiveResults().map((item) => [item.assessmentId, item]));

    for (const fixture of fixtures.instruments) {
      const source = byAssessment.get(fixture.assessmentId);
      expect(source, fixture.assessmentId).toBeDefined();
      const adjusted = { ...source!, completedAt: fixture.measuredAt, resultId: `${fixture.assessmentId}:${fixture.measuredAt}` };
      const snapshot = projectPersonalProfileSnapshot([adjusted], { lookup, now: NOW });
      const constructs = snapshot.lanes.find((lane) => lane.id === fixture.lane)?.projections.map((item) => item.constructId) ?? [];
      expect(new Set(constructs)).toEqual(new Set(fixture.expectedConstructs));
      if ("expectedFreshness" in fixture) {
        expect(snapshot.lanes.find((lane) => lane.id === fixture.lane)?.projections.every((item) => item.freshness === fixture.expectedFreshness)).toBe(true);
      }
    }
  });

  it("keeps missing instruments explicit instead of inventing fallback values", () => {
    const snapshot = projectPersonalProfileSnapshot([fiveResults()[0]], { lookup, now: NOW });

    expect(snapshot.instruments.filter((item) => item.availability === "missing")).toHaveLength(4);
    expect(snapshot.instruments.find((item) => item.assessmentId === "mbti")).toMatchObject({
      availability: "missing",
      missingReason: "no-result",
      projectionCount: 0,
    });
    expect(snapshot.lanes.find((lane) => lane.id === "preference")?.projections).toEqual([]);
  });

  it("uses the newest result per instrument and preserves tied values as separate constructs", () => {
    const old = result(careerValuesPlugin, { security: 100, achievement: 0, autonomy: 0, service: 0, creativity: 0, status: 0 }, "2026-06-01T00:00:00.000Z");
    const tied = fiveResults()[3];
    const snapshot = projectPersonalProfileSnapshot([tied, old], { lookup, now: NOW });
    const values = snapshot.lanes.find((lane) => lane.id === "chosen-value")?.projections ?? [];

    expect(values.map((item) => item.constructId)).toEqual([
      "values.work.autonomy",
      "values.work.creativity",
    ]);
    expect(values.map((item) => item.value)).toEqual([90, 90]);
    expect(values.every((item) => item.provenance.resultId === tied.resultId)).toBe(true);
  });

  it("retains stale and low-confidence evidence with explicit flags", () => {
    const stale = result(attachmentPlugin, { anxiety: 80, avoidance: 20 }, "2026-01-01T00:00:00.000Z");
    const snapshot = projectPersonalProfileSnapshot([stale], { lookup, now: NOW });
    const status = snapshot.instruments.find((item) => item.assessmentId === "adult-attachment");
    const projections = snapshot.lanes.find((lane) => lane.id === "reflective-signal")?.projections ?? [];

    expect(status).toMatchObject({ availability: "present", hasLowConfidence: true, hasStale: true });
    expect(projections).toHaveLength(2);
    expect(projections.every((item) => item.freshness === "stale" && item.confidenceBand === "low")).toBe(true);
  });

  it("never aggregates the same construct across instruments", () => {
    const first = result(bigFivePlugin, { O: 10, C: 20, E: 30, A: 40, N: 50 }, "2026-07-01T00:00:00.000Z");
    const second = { ...result(mbtiPlugin, { EI: 90 }, "2026-07-02T00:00:00.000Z"), assessmentId: "second" };
    const signalPlugin = (id: string, value: number): AssessmentPlugin => ({
      ...bigFivePlugin,
      id,
      ontology: {
        edges: [],
        nodes: [],
        toSignals: (source) => [{
          confidence: 0.5,
          constructId: "shared.construct",
          evidenceTier: "educational",
          id: `${source.resultId}:shared`,
          observedAt: source.completedAt,
          provenance: {
            instrumentVersion: source.versions.instrument,
            resultId: source.resultId,
            scoringVersion: source.versions.scoring,
          },
          sourceAssessmentId: id,
          value,
        }],
      },
    });
    const localPlugins = new Map([
      ["big5", signalPlugin("big5", 10)],
      ["second", signalPlugin("second", 90)],
    ]);
    const snapshot = projectPersonalProfileSnapshot([first, second], {
      instruments: [
        { assessmentId: "big5", lane: "trait" },
        { assessmentId: "second", lane: "preference" },
      ],
      lookup: (id) => localPlugins.get(id),
      now: NOW,
    });

    expect(snapshot.lanes.flatMap((lane) => lane.projections).filter((item) => item.constructId === "shared.construct").map((item) => item.value)).toEqual([10, 90]);
  });

  it("accepts canonicalized legacy results without exposing their payload", () => {
    const legacy = adaptLegacyV1StoredTestResult({
      createdAt: "2026-07-01T00:00:00.000Z",
      id: "legacy-big5",
      kind: "psychometric",
      result: { percentages: { O: 80, C: 70, E: 60, A: 50, N: 40 }, secretAnswer: "LEGACY_RAW_SENTINEL" },
      resultLabel: "legacy",
      testId: "big5",
      title: "Legacy Big Five",
    });
    const snapshot = projectPersonalProfileSnapshot([legacy], { lookup, now: NOW });

    expect(snapshot.instruments[0]).toMatchObject({ assessmentId: "big5", availability: "present" });
    expect(snapshot.lanes[0].projections[0].provenance).toMatchObject({
      instrumentVersion: "legacy-v1",
      resultId: "legacy-big5",
      scoringVersion: "legacy-v1",
    });
    expect(JSON.stringify(snapshot)).not.toContain("LEGACY_RAW_SENTINEL");
    expect(JSON.stringify(snapshot)).not.toContain("secretAnswer");
  });

  it("gives ontology plugins an allowlisted result view without raw or legacy fields", () => {
    const source = {
      ...fiveResults()[0],
      classifications: [{ id: "RAW_CLASSIFICATION", label: "RAW_CLASSIFICATION" }],
      legacy: { payload: "LEGACY_PLUGIN_SENTINEL", sourceSchema: "oiyo:test-results:v1" as const },
      extraRawField: "EXTRA_PLUGIN_SENTINEL",
    };
    const probingPlugin: AssessmentPlugin = {
      ...bigFivePlugin,
      ontology: {
        edges: [],
        nodes: [],
        toSignals: (safe) => [{
          confidence: 0.6,
          constructId: "privacy.probe",
          evidenceTier: "educational",
          id: `${safe.resultId}:probe`,
          observedAt: safe.completedAt,
          provenance: {
            instrumentVersion: safe.versions.instrument,
            resultId: safe.resultId,
            scoringVersion: safe.versions.scoring,
          },
          sourceAssessmentId: safe.assessmentId,
          value: String(
            safe.responses?.q1 ??
            safe.legacy?.payload ??
            safe.classifications[0]?.label ??
            (safe as CanonicalAssessmentResult & { extraRawField?: string }).extraRawField ??
            "redacted",
          ),
        }],
      },
    };

    const snapshot = projectPersonalProfileSnapshot([source], {
      instruments: [{ assessmentId: "big5", lane: "trait" }],
      lookup: () => probingPlugin,
      now: NOW,
    });
    const serialized = JSON.stringify(snapshot);

    expect(snapshot.lanes[0].projections[0].value).toBe("redacted");
    expect(serialized).not.toContain("RAW_SENTINEL");
    expect(serialized).not.toContain("RAW_CLASSIFICATION");
    expect(serialized).not.toContain("LEGACY_PLUGIN_SENTINEL");
    expect(serialized).not.toContain("EXTRA_PLUGIN_SENTINEL");
  });

  it("ignores malformed runtime inputs without letting them shadow a valid result", () => {
    const valid = fiveResults()[0];
    const malformedNewer = {
      ...valid,
      completedAt: "2026-07-15T00:00:00.000Z",
      versions: { instrument: "", interpretation: "", scoring: "" },
    };

    const snapshot = projectPersonalProfileSnapshot(
      [null, "unknown", malformedNewer, valid],
      { lookup, now: NOW },
    );

    expect(snapshot.instruments[0]).toMatchObject({
      assessmentId: "big5",
      availability: "present",
      measuredAt: valid.completedAt,
    });
    expect(snapshot.lanes[0].projections).toHaveLength(5);
  });

  it("marks a known malformed result invalid and rejects malformed plugin signals", () => {
    const malformed = { assessmentId: "big5", schema: "unexpected", schemaVersion: 99 };
    const invalidSnapshot = projectPersonalProfileSnapshot([malformed], { lookup, now: NOW });
    expect(invalidSnapshot.instruments[0]).toMatchObject({
      availability: "missing",
      missingReason: "invalid-result",
    });

    const unsafePlugin = {
      ...bigFivePlugin,
      ontology: {
        edges: [],
        nodes: [],
        toSignals: () => [null, { value: Number.NaN }] as unknown as ReturnType<AssessmentPlugin["ontology"]["toSignals"]>,
      },
    };
    const unsafeSnapshot = projectPersonalProfileSnapshot([fiveResults()[0]], {
      instruments: [{ assessmentId: "big5", lane: "trait" }],
      lookup: () => unsafePlugin,
      now: NOW,
    });
    expect(unsafeSnapshot.instruments[0]).toMatchObject({
      availability: "missing",
      missingReason: "no-signals",
    });
  });

  it("rejects incomplete known-instrument scores instead of projecting plugin fallback zeros", () => {
    const incomplete = result(bigFivePlugin, { O: 80 }, "2026-07-01T00:00:00.000Z");
    const snapshot = projectPersonalProfileSnapshot([incomplete], { lookup, now: NOW });

    expect(snapshot.instruments[0]).toMatchObject({
      availability: "missing",
      missingReason: "invalid-result",
      projectionCount: 0,
    });
    expect(snapshot.lanes[0].projections).toEqual([]);
  });

  it("rejects duplicate or unknown instrument lane specifications", () => {
    expect(() => projectPersonalProfileSnapshot([], {
      instruments: [
        { assessmentId: "big5", lane: "trait" },
        { assessmentId: "big5", lane: "preference" },
      ],
      now: NOW,
    })).toThrow(TypeError);
    expect(() => projectPersonalProfileSnapshot([], {
      instruments: [{ assessmentId: "big5", lane: "unknown" as "trait" }],
      now: NOW,
    })).toThrow(TypeError);
  });
});

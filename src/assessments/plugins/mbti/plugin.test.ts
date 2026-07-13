import { describe, expect, it } from "vitest";

import { adaptLegacyV1StoredTestResult, type AssessmentResponses } from "../../core";
import { MBTI_AXES, MBTI_INSTRUMENT, MBTI_POLES } from "./data";
import { buildMbtiResult, mbtiPlugin, mbtiType } from "./plugin";

function responsesFor(firstPoleCounts: Record<string, number>): AssessmentResponses {
  const seen: Record<string, number> = {};
  return Object.fromEntries(MBTI_INSTRUMENT.items.map((item) => {
    const axis = item.constructId.split(".").at(-1) as (typeof MBTI_AXES)[number];
    const index = seen[axis] ?? 0;
    seen[axis] = index + 1;
    return [item.id, index < firstPoleCounts[axis] ? MBTI_POLES[axis][0] : MBTI_POLES[axis][1]];
  }));
}

describe("MBTI V2 plugin", () => {
  it("matches the live 16-item q1..q16 instrument and metadata", () => {
    expect(mbtiPlugin.id).toBe("mbti");
    expect(mbtiPlugin.instrument.version).toBe("mbti-oiyo-preference-16-v1");
    expect(mbtiPlugin.instrument.items.map((item) => item.id)).toEqual(
      Array.from({ length: 16 }, (_, index) => `q${index + 1}`),
    );
    expect(mbtiPlugin.manifest.evidenceTier).toBe("reflective-framework");
    expect(mbtiPlugin.manifest.kind).toBe("preference");
    expect(mbtiPlugin.manifest.status).toBe("review");
  });

  it("produces golden raw counts, normalized first-pole percentages, and type", () => {
    const result = buildMbtiResult(responsesFor({ EI: 3, SN: 1, TF: 4, JP: 0 }), {
      completedAt: "2026-07-13T00:00:00.000Z",
      resultId: "mbti:golden",
    });
    expect(result.scores.raw).toEqual({ EI: 3, SN: 1, TF: 4, JP: 0 });
    expect(result.scores.normalized).toEqual({ EI: 75, SN: 25, TF: 100, JP: 0 });
    expect(mbtiType(result)).toBe("ENTP");
    expect(result.classifications).toEqual([{ id: "mbti-ENTP", label: "ENTP" }]);
    expect(result.versions.instrument).toBe("mbti-oiyo-preference-16-v1");
  });

  it("breaks every 2-2 tie toward E, S, T, and J", () => {
    const result = buildMbtiResult(responsesFor({ EI: 2, SN: 2, TF: 2, JP: 2 }));
    expect(result.scores.normalized).toEqual({ EI: 50, SN: 50, TF: 50, JP: 50 });
    expect(mbtiType(result)).toBe("ESTJ");
    expect(result.quality.uncertainty).toEqual({ EI: 1, SN: 1, TF: 1, JP: 1 });
  });

  it.each([
    [{ EI: 4, SN: 4, TF: 4, JP: 4 }, "ESTJ"],
    [{ EI: 0, SN: 0, TF: 0, JP: 0 }, "INFP"],
    [{ EI: 0, SN: 0, TF: 0, JP: 4 }, "INFJ"],
  ])("keeps the live pole fixtures for %j", (counts, expectedType) => {
    const result = buildMbtiResult(responsesFor(counts));
    expect(mbtiType(result)).toBe(expectedType);
  });

  it("emits four versioned ontology preference signals", () => {
    const result = buildMbtiResult(responsesFor({ EI: 2, SN: 2, TF: 2, JP: 2 }));
    const signals = mbtiPlugin.ontology.toSignals(result);
    expect(signals.map((signal) => signal.constructId)).toEqual(
      MBTI_AXES.map((axis) => `personality.mbti.preference.${axis}`),
    );
    expect(signals.every((signal) => signal.evidenceTier === "reflective-framework")).toBe(true);
    expect(signals.every((signal) => signal.confidence === 0.25)).toBe(true);
    expect(signals[0].provenance.instrumentVersion).toBe("mbti-oiyo-preference-16-v1");
  });

  it("raises signal confidence for a clear preference without claiming a percentile", () => {
    const result = buildMbtiResult(responsesFor({ EI: 4, SN: 0, TF: 4, JP: 0 }));
    expect(mbtiPlugin.ontology.toSignals(result).every((signal) => signal.confidence === 0.5)).toBe(true);
    expect(result.scores.percentile).toBeUndefined();
    expect(result.quality.uncertainty).toEqual({ EI: 0, SN: 0, TF: 0, JP: 0 });
  });

  it("marks only ko/en reviewed and uses English fallback strings elsewhere", () => {
    expect(mbtiPlugin.locale.ko.status).toBe("reviewed");
    expect(mbtiPlugin.locale.en.status).toBe("reviewed");
    for (const locale of ["ja", "zh", "fr", "es"] as const) {
      expect(mbtiPlugin.locale[locale].status).toBe("draft");
      expect(mbtiPlugin.locale[locale].content.strings["items.q1.prompt"]).toBe(
        mbtiPlugin.locale.en.content.strings["items.q1.prompt"],
      );
    }
  });

  it("resolves renderer keys and source references without a nonexistent blog bridge", () => {
    const strings = mbtiPlugin.locale.en.content.strings;
    expect(mbtiPlugin.manifest.routes.blog).toBeUndefined();
    for (const axis of MBTI_AXES) {
      expect(strings[`mbti.axis.${axis}`]).toBeTruthy();
      for (const pole of MBTI_POLES[axis]) expect(strings[`preferences.${pole}`]).toBeTruthy();
    }
    const result = buildMbtiResult(responsesFor({ EI: 4, SN: 4, TF: 4, JP: 4 }));
    const fragments = mbtiPlugin.interpreter.compose(result);
    const sourceIds = new Set(mbtiPlugin.sources.records.map((source) => source.id));
    expect(fragments.every((fragment) => strings[fragment.titleKey] && strings[fragment.bodyKey])).toBe(true);
    expect(fragments.every((fragment) => !fragment.caveatKey || strings[fragment.caveatKey])).toBe(true);
    expect(fragments.flatMap((fragment) => fragment.sourceRefs).every((ref) => sourceIds.has(ref))).toBe(true);
  });

  it("does not invent strong axis signals from a type-only legacy v1 result", () => {
    const legacy = adaptLegacyV1StoredTestResult({
      createdAt: "2026-07-13T00:00:00.000Z",
      id: "legacy-mbti",
      kind: "preference",
      result: { type: "INTJ" },
      resultLabel: "INTJ",
      testId: "mbti",
      title: "MBTI",
    });
    expect(mbtiPlugin.ontology.toSignals(legacy)).toEqual([]);
  });

  it("rejects missing and cross-axis answers", () => {
    const responses = responsesFor({ EI: 2, SN: 2, TF: 2, JP: 2 });
    delete responses.q1;
    responses.q2 = "E";
    responses.unknown = "E";
    expect(() => buildMbtiResult(responses)).toThrow("Cannot build incomplete mbti result");
  });

  it("states that the OIYO items are not the official MBTI instrument", () => {
    expect(mbtiPlugin.sources.license.status).toBe("original");
    expect(mbtiPlugin.sources.license.note).toContain("original OIYO-authored items");
    expect(mbtiPlugin.sources.license.note).toContain("not the official MBTI® instrument");
  });
});

import { describe, expect, it } from "vitest";

import type { AssessmentPlugin } from "./plugin";
import {
  buildAssessmentResult,
  listAssessmentResults,
  OIYO_ASSESSMENT_RESULTS_STORAGE_KEY,
  recordAssessmentResult,
  type StorageLike,
} from "./persistence";

function memoryStorage(): StorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

function plugin(): AssessmentPlugin {
  const locale = Object.fromEntries(
    ["ko", "en", "ja", "zh", "fr", "es"].map((key) => [
      key,
      {
        content: { description: "", disclaimer: "", name: "", seoDescription: "", seoTitle: "", strings: {} },
        status: "draft",
      },
    ]),
  ) as AssessmentPlugin["locale"];
  return {
    exportPolicy: { allowedFormats: ["json"], includeResponsesByDefault: false, sensitiveConstructs: [] },
    id: "example",
    instrument: {
      items: [{ constructId: "example.score", id: "q1", promptKey: "q1", required: true, responseScaleId: "five" }],
      responseScales: [{ id: "five", kind: "likert", min: 1, max: 5 }],
      version: "1.0.0",
    },
    interpreter: { compose: () => [], version: "1.0.0" },
    locale,
    manifest: { analyticsId: "example", category: "test", clinical: false, evidenceTier: "educational", estimatedMinutes: 1, id: "example", indexable: true, kind: "psychometric", routes: { execution: "/example" }, status: "draft", tags: [] },
    migrations: [],
    ontology: { edges: [], nodes: [], toSignals: () => [] },
    schemaVersion: 2,
    scorer: {
      version: "1.0.0",
      validateResponses: (responses) => ({ complete: typeof responses.q1 === "number", errors: typeof responses.q1 === "number" ? [] : ["q1"], responses, warnings: [] }),
      score: (responses) => ({ raw: { score: Number(responses.q1) }, normalized: { score: Number(responses.q1) * 20 } }),
    },
    sources: { itemRefs: [], license: { note: "test", status: "original" }, normRefs: [], records: [], scoringRefs: [], theoryRefs: [] },
  };
}

describe("assessment result persistence", () => {
  it("builds a versioned V2 result and round-trips it", () => {
    const storage = memoryStorage();
    const result = buildAssessmentResult(plugin(), { q1: 4 }, { completedAt: "2026-07-13T00:00:00.000Z" });
    expect(result.schemaVersion).toBe(2);
    expect(result.scores.normalized.score).toBe(80);
    recordAssessmentResult(result, storage);
    expect(listAssessmentResults(storage)).toEqual([result]);
    expect(storage.getItem(OIYO_ASSESSMENT_RESULTS_STORAGE_KEY)).toContain("oiyo.assessment-result");
  });

  it("rejects incomplete responses", () => {
    expect(() => buildAssessmentResult(plugin(), {})).toThrow("Cannot build incomplete example result");
  });
});

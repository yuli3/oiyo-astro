import { describe, expect, it } from "vitest";

import type { OntologyExport } from "./export";
import {
  captureExportPng,
  collectExportLabelKeys,
  serializeExportCsv,
  serializeExportJson,
  serializeExportMarkdown,
  serializeExportSoul,
} from "./export-serializers";

const EMPTY: OntologyExport = {
  exportedAt: "2026-07-09T00:00:00.000Z",
  signals: {},
  testResults: [],
  assessmentResults: [],
  recommendations: [],
  graphSnapshot: [],
};

const RICH: OntologyExport = {
  exportedAt: "2026-07-09T00:00:00.000Z",
  signals: {
    mbti: { type: "ENTJ", traits: ["E", "N", "T", "J"] },
    big5: { O: 80, C: 40, E: 70, A: 30, N: 20 },
    riasec: { code: "AIS", scores: { A: 18, I: 16, S: 14, R: 5, E: 4, C: 2 } },
    enneagram: "8",
    zodiac: "Leo",
    saju: { element: "Fire", tenGods: ["FriendGod", "OfficerGod"] },
  },
  testResults: [
    { id: "riasec:1", kind: "psychometric", testId: "riasec", title: "RIASEC", resultLabel: "AIS", createdAt: "2026-07-08T00:00:00.000Z" },
  ],
  assessmentResults: [{
    assessmentId: "big5-ocean-20",
    classifications: [],
    completedAt: "2026-07-08T00:00:00.000Z",
    evidenceTier: "research-inspired",
    kind: "psychometric",
    quality: { completionRate: 1, responseWarnings: [] },
    resultId: "big5:v2:1",
    schema: "oiyo.assessment-result",
    schemaVersion: 2,
    scores: { normalized: { O: 80, C: 40 }, raw: { O: 16, C: 8 } },
    versions: { instrument: "big5-ocean-20-v1", interpretation: "big5-ocean-20-interpretation-v1", scoring: "big5-ocean-20-scoring-v1" },
  }],
  recommendations: [
    { category: "hobby", description: "d", icon: "Compass", id: "hobby-1", matchScore: 72, reasoning: { explanation: "e", primarySource: "big5" }, tags: [], title: "recommendations.hobby.woodworking.title" },
    { category: "career", description: "d", icon: "Compass", id: "career-1", matchScore: 61, reasoning: { explanation: "e", primarySource: "mbti" }, tags: [], title: "recommendations.career.architect.title" },
  ],
  graphSnapshot: [
    { nodeId: "woodworking", kind: "hobby", i18nKey: "hobby.nodes.woodworking.name", hop: 1, edgeKind: "related", weight: 0.8 },
    { nodeId: "gardening", kind: "hobby", i18nKey: "hobby.nodes.gardening.name", hop: 1, edgeKind: "stress-relief", weight: 0.6 },
    { nodeId: "astrophotography", kind: "hobby", i18nKey: "hobby.nodes.astrophotography.name", hop: 2, edgeKind: "divergent", weight: 0.4 },
  ],
};

describe("serializeExportJson", () => {
  it("produces valid, re-parseable JSON that round-trips the data", () => {
    const json = serializeExportJson(RICH);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toEqual(RICH);
  });

  it("handles an empty profile without throwing", () => {
    expect(() => JSON.parse(serializeExportJson(EMPTY))).not.toThrow();
  });
});

describe("serializeExportCsv", () => {
  it("emits a valid header row and one row per datum", () => {
    const csv = serializeExportCsv(RICH);
    const lines = csv.split("\n");
    expect(lines[0]).toBe('"section","key","value"');
    // Every subsequent line has exactly 3 quoted, comma-separated cells.
    for (const line of lines.slice(1)) {
      const cells = line.match(/"(?:[^"]|"")*"/g);
      expect(cells).not.toBeNull();
      expect(cells!.length).toBe(3);
      expect(cells![0]).toMatch(/^"(signal|testResult|assessmentResult|assessmentScore|recommendation|graphSnapshot)"$/);
    }
    expect(lines.length).toBeGreaterThan(1);
  });

  it("degrades to just the header for an empty profile", () => {
    expect(serializeExportCsv(EMPTY)).toBe('"section","key","value"');
  });
});

describe("serializeExportMarkdown", () => {
  it("renders every required section", () => {
    const md = serializeExportMarkdown(RICH);
    expect(md).toContain("## Identity Signals");
    expect(md).toContain("## Test History");
    expect(md).toContain("## Versioned Assessment Results");
    expect(md).toContain("big5-ocean-20-v1");
    expect(md).toContain("## Recommendations");
    expect(md).toContain("## Relationship Graph Snapshot");
    expect(md).toContain("ENTJ");
  });

  it("resolves labels when a labels map is supplied, falls back to raw keys otherwise", () => {
    const withLabels = serializeExportMarkdown(RICH, { "recommendations.hobby.woodworking.title": "Woodworking" });
    expect(withLabels).toContain("Woodworking");

    const withoutLabels = serializeExportMarkdown(RICH);
    expect(withoutLabels).toContain("recommendations.hobby.woodworking.title");
  });

  it("renders gracefully for an empty profile (no crash, placeholder copy)", () => {
    const md = serializeExportMarkdown(EMPTY);
    expect(md).toContain("no signals recorded yet");
    expect(md).toContain("no recommendations yet");
  });
});

describe("serializeExportSoul", () => {
  it("follows the AI-persona spec headings", () => {
    const soul = serializeExportSoul(RICH);
    expect(soul).toContain("## Identity signals");
    expect(soul).toContain("## Preferences");
    expect(soul).toContain("## How to treat me");
    expect(soul).toContain("## Assessment provenance");
    expect(soul).toContain("big5-ocean-20-v1");
  });

  it("generates reasonable tone hints from mbti/big5/enneagram/saju signals", () => {
    const soul = serializeExportSoul(RICH);
    // ENTJ -> E, N, T, J hint lines should all be present.
    expect(soul).toContain("real time"); // E
    expect(soul).toContain("big picture"); // N
    expect(soul).toContain("direct, unpadded feedback"); // T
    expect(soul).toContain("clear plans"); // J
    expect(soul).toContain("Openness"); // big5 O >= 60
    expect(soul).toContain("direct with me"); // enneagram 8
    expect(soul).toContain("Fire"); // saju element
  });

  it("falls back to a blank-slate line for an empty profile instead of crashing", () => {
    const soul = serializeExportSoul(EMPTY);
    expect(soul).toContain("No signals recorded yet");
  });
});

describe("collectExportLabelKeys", () => {
  it("collects zodiac/saju node keys, every graph-snapshot i18nKey, and every recommendation title key", () => {
    const keys = collectExportLabelKeys(RICH);
    expect(keys).toContain("hobby.nodes.woodworking.name");
    expect(keys).toContain("hobby.nodes.gardening.name");
    expect(keys).toContain("hobby.nodes.astrophotography.name");
    expect(keys).toContain("recommendations.hobby.woodworking.title");
    expect(keys).toContain("recommendations.career.architect.title");
  });

  it("returns [] for an empty profile", () => {
    expect(collectExportLabelKeys(EMPTY)).toEqual([]);
  });
});

describe("captureExportPng", () => {
  it("returns null on the server (no DOM) instead of throwing — this repo's vitest environment is node, no jsdom", async () => {
    await expect(captureExportPng("some-element-id")).resolves.toBeNull();
  });
});

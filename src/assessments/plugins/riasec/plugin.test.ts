import { describe, expect, it } from "vitest";

import { ontologySignalsFromResults, type AssessmentResponses, type InstrumentDefinition } from "../../core";
import { buildRiasecResult, riasecCode, riasecFullPlugin, riasecQuickPlugin } from "./plugin";
import { RIASEC_DIMENSIONS } from "./data";

const LEVELS: Record<string, number> = { R: 5, I: 4, A: 3, S: 2, E: 1, C: 3 };

function fixture(instrument: InstrumentDefinition, values = LEVELS): AssessmentResponses {
  return Object.fromEntries(
    instrument.items.map((item) => [item.id, values[item.constructId.at(-1) ?? ""]]),
  );
}

describe.each([
  ["full", riasecFullPlugin, { raw: { R: 20, I: 16, A: 12, S: 8, E: 4, C: 12 } }],
  ["quick", riasecQuickPlugin, { raw: { R: 15, I: 12, A: 9, S: 6, E: 3, C: 9 } }],
] as const)("RIASEC %s golden fixture", (_name, plugin, golden) => {
  it("calculates raw and min-max normalized scores and a stable top-three code", () => {
    const result = buildRiasecResult(plugin, fixture(plugin.instrument), {
      completedAt: "2026-07-13T00:00:00.000Z",
      resultId: `${plugin.id}:golden`,
    });
    expect(result.scores.raw).toEqual(golden.raw);
    expect(result.scores.normalized).toEqual({ R: 100, I: 75, A: 50, S: 25, E: 0, C: 50 });
    expect(result.classifications.map((item) => item.constructId)).toEqual([
      "vocation.riasec.R",
      "vocation.riasec.I",
      "vocation.riasec.A",
    ]);
    expect(riasecCode(result)).toBe("RIA");
    expect(result.versions.instrument).toBe(plugin.instrument.version);
    expect(result.versions.scoring).toBe("riasec-minmax-scoring-v1");
  });
});

describe("RIASEC plugin contracts", () => {
  it("keeps full and quick instruments separate", () => {
    expect(riasecFullPlugin.id).toBe("riasec");
    expect(riasecFullPlugin.instrument.version).toBe("riasec-oiyo-24-v1");
    expect(riasecFullPlugin.instrument.items).toHaveLength(24);
    expect(riasecQuickPlugin.id).toBe("riasec-quick");
    expect(riasecQuickPlugin.instrument.version).toBe("riasec-oiyo-18-v1");
    expect(riasecQuickPlugin.instrument.items).toHaveLength(18);
  });

  it("maps all six dimensions to ontology signals with higher full confidence", () => {
    const full = buildRiasecResult(riasecFullPlugin, fixture(riasecFullPlugin.instrument));
    const quick = buildRiasecResult(riasecQuickPlugin, fixture(riasecQuickPlugin.instrument));
    const fullSignals = riasecFullPlugin.ontology.toSignals(full);
    const quickSignals = riasecQuickPlugin.ontology.toSignals(quick);
    expect(fullSignals.map((signal) => signal.constructId)).toEqual(
      RIASEC_DIMENSIONS.map((dimension) => `vocation.riasec.${dimension}`),
    );
    expect(fullSignals.every((signal) => signal.confidence === 0.65)).toBe(true);
    expect(quickSignals.every((signal) => signal.confidence === 0.5)).toBe(true);
    expect(fullSignals[0].provenance.instrumentVersion).toBe("riasec-oiyo-24-v1");
  });

  it("documents OIYO-authored item provenance without validated-scale claims", () => {
    expect(riasecFullPlugin.manifest.evidenceTier).toBe("research-inspired");
    expect(riasecFullPlugin.manifest.status).toBe("review");
    expect(riasecFullPlugin.sources.license.status).toBe("original");
    expect(riasecFullPlugin.sources.license.note).toContain("original OIYO-authored prompts");
  });

  it("rejects incomplete or out-of-range responses", () => {
    const incomplete = fixture(riasecFullPlugin.instrument);
    delete incomplete.R1;
    incomplete.I1 = 6;
    expect(() => buildRiasecResult(riasecFullPlugin, incomplete)).toThrow("Cannot build incomplete riasec result");
  });

  it("uses canonical RIASEC order to break an all-tied profile", () => {
    const result = buildRiasecResult(
      riasecQuickPlugin,
      fixture(riasecQuickPlugin.instrument, Object.fromEntries(RIASEC_DIMENSIONS.map((dimension) => [dimension, 3]))),
    );
    expect(riasecCode(result)).toBe("RIA");
  });

  it("keeps the detailed form canonical even when a quick result is newer", () => {
    const full = buildRiasecResult(riasecFullPlugin, fixture(riasecFullPlugin.instrument), {
      completedAt: "2026-07-13T01:00:00.000Z",
      resultId: "riasec:full",
    });
    const quick = buildRiasecResult(riasecQuickPlugin, fixture(riasecQuickPlugin.instrument), {
      completedAt: "2026-07-13T02:00:00.000Z",
      resultId: "riasec:quick",
    });

    const plugins = new Map([
      [riasecFullPlugin.id, riasecFullPlugin],
      [riasecQuickPlugin.id, riasecQuickPlugin],
    ]);
    const signals = ontologySignalsFromResults([quick, full], (id) => plugins.get(id));

    expect(signals).toHaveLength(6);
    expect(signals.every((signal) => signal.sourceAssessmentId === "riasec")).toBe(true);
  });

  it("marks unsupported full-form question locales as draft", () => {
    expect(riasecFullPlugin.locale.ko.status).toBe("reviewed");
    expect(riasecFullPlugin.locale.zh.status).toBe("draft");
    expect(riasecQuickPlugin.locale.zh.status).toBe("reviewed");
  });
});

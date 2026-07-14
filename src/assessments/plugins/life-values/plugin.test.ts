import { describe, expect, it } from "vitest";

import { ontologySignalsFromResults } from "../../core";
import {
  LIFE_VALUE_IDS,
  LIFE_VALUES_INSTRUMENT,
  buildLifeValuesResult,
  lifeValuesPlugin,
} from ".";

function rankedResponses(order: readonly string[]) {
  return Object.fromEntries(LIFE_VALUE_IDS.map((id) => [
    id,
    order.indexOf(id) === -1 ? 0 : order.indexOf(id) + 1,
  ]));
}

describe("life values card-sort plugin", () => {
  const topFive = ["integrity", "meaning", "autonomy", "contribution", "curiosity"] as const;

  it("registers 18 original cards as a draft reflective preference activity", () => {
    expect(LIFE_VALUES_INSTRUMENT.items.map((item) => item.id)).toEqual(LIFE_VALUE_IDS);
    expect(LIFE_VALUES_INSTRUMENT.responseScales).toEqual([
      { id: "top-five-rank", kind: "numeric", min: 0, max: 5 },
    ]);
    expect(lifeValuesPlugin.manifest).toMatchObject({
      evidenceTier: "reflective-framework",
      id: "life-values-card-sort",
      indexable: false,
      kind: "preference",
      status: "draft",
    });
    expect(Object.values(lifeValuesPlugin.locale).every((entry) => entry.status === "draft")).toBe(true);
    expect(lifeValuesPlugin.sources.license.status).toBe("original");
    expect(lifeValuesPlugin.sources.itemRefs).toEqual([]);
    expect(lifeValuesPlugin.exportPolicy.includeResponsesByDefault).toBe(false);
    expect(lifeValuesPlugin.exportPolicy.permalinkConstructs).toEqual([]);
    expect(lifeValuesPlugin.exportPolicy.allowedFormats).not.toContain("permalink");
  });

  it("requires exactly one of each rank 1–5 and thirteen unselected cards", () => {
    expect(() => buildLifeValuesResult({})).toThrow("must be an integer from 0 to 5");

    const duplicate = rankedResponses(topFive);
    duplicate.autonomy = 1;
    expect(() => buildLifeValuesResult(duplicate)).toThrow("Rank 1 must be assigned to exactly one card");

    const unknown = { ...rankedResponses(topFive), email: 0 };
    expect(() => buildLifeValuesResult(unknown)).toThrow("Unknown life-values card: email");
  });

  it("scores relative priority without percentiles and returns five ranked classifications", () => {
    const result = buildLifeValuesResult(rankedResponses(topFive));
    expect(result.scores.normalized).toMatchObject({
      integrity: 100,
      meaning: 80,
      autonomy: 60,
      contribution: 40,
      curiosity: 20,
      security: 0,
    });
    expect(result.scores.percentile).toBeUndefined();
    expect(result.classifications.map((classification) => classification.constructId)).toEqual(
      topFive.map((id) => `values.chosen.${id}`),
    );
    expect(result.classifications).toHaveLength(5);
    expect(result.responses).toBeUndefined();
    expect(result.quality.responseWarnings.join(" ")).toContain("not percentiles");
  });

  it("uses one localized card source for plugin strings and stored classification labels", () => {
    expect(lifeValuesPlugin.locale.ko.content.strings["cards.autonomy.title"]).toBe("자율");
    expect(lifeValuesPlugin.locale.ja.content.strings["cards.autonomy.title"]).toBe("自律");
    expect(lifeValuesPlugin.locale.zh.content.strings["cards.financial-freedom.title"]).toBe("财务余裕");

    const result = buildLifeValuesResult(rankedResponses(topFive), { locale: "ko" });
    expect(result.classifications.map((classification) => classification.label)).toEqual([
      "진실성",
      "의미",
      "자율",
      "기여",
      "호기심",
    ]);
  });

  it("emits only chosen values as low-confidence signals that expire after 365 days", () => {
    const result = buildLifeValuesResult(rankedResponses(topFive), {
      completedAt: "2099-01-01T00:00:00.000Z",
      resultId: "life-values:test",
    });
    const signals = lifeValuesPlugin.ontology.toSignals(result);
    expect(signals.map((signal) => signal.constructId)).toEqual(
      topFive.map((id) => `values.chosen.${id}`),
    );
    expect(signals.every((signal) => signal.confidence === 0.35)).toBe(true);
    expect(signals.every((signal) => signal.expiresAt === "2100-01-01T00:00:00.000Z")).toBe(true);
    expect(ontologySignalsFromResults(
      [result],
      (id) => id === lifeValuesPlugin.id ? lifeValuesPlugin : undefined,
    )).toHaveLength(5);
  });

  it("keeps cited publications theory-only and makes no validation claim", () => {
    expect(lifeValuesPlugin.sources.theoryRefs).toEqual([
      "schwartz-1992-values-theory",
      "wilson-murrell-2004-values-work",
    ]);
    expect(lifeValuesPlugin.sources.scoringRefs).toEqual([]);
    expect(lifeValuesPlugin.sources.normRefs).toEqual([]);
    expect(lifeValuesPlugin.sources.license.note).toContain("not a validated instrument");
    expect(lifeValuesPlugin.sources.records.every((source) => source.citation.includes("does not validate"))).toBe(true);
  });
});

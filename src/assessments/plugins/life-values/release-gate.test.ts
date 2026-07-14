import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  LIFE_VALUES_CARD_SORT_RELEASE_GATE,
  assertAssessmentReleaseGate,
  isAssessmentRouteExcludedFromSitemap,
  localizedAssessmentPath,
} from "../../../../config/assessment-release-gates.js";
import { ASSESSMENT_LOCALES, getAssessmentPlugin } from "../../core";
import { registerBuiltinAssessments } from "../index";
import { lifeValuesPlugin } from ".";

const ROOT_OWNERSHIP_PATH = new URL("../../../../../docs/route-ownership.json", import.meta.url);

describe("life values card-sort release gate", () => {
  it("keeps gate, plugin, registry, and locale contracts aligned", () => {
    expect(assertAssessmentReleaseGate(LIFE_VALUES_CARD_SORT_RELEASE_GATE)).toBe(true);
    expect(LIFE_VALUES_CARD_SORT_RELEASE_GATE.locales).toEqual([...ASSESSMENT_LOCALES]);
    expect(Object.keys(lifeValuesPlugin.locale)).toEqual([...ASSESSMENT_LOCALES]);
    expect(lifeValuesPlugin.manifest).toMatchObject({
      id: LIFE_VALUES_CARD_SORT_RELEASE_GATE.assessmentId,
      indexable: LIFE_VALUES_CARD_SORT_RELEASE_GATE.indexable,
      status: LIFE_VALUES_CARD_SORT_RELEASE_GATE.assessmentStatus,
    });
    expect(lifeValuesPlugin.manifest.routes.execution).toBe(LIFE_VALUES_CARD_SORT_RELEASE_GATE.executionRoutePattern);
    registerBuiltinAssessments();
    expect(getAssessmentPlugin("life-values-card-sort")).toBe(lifeValuesPlugin);
  });

  it("derives all draft sitemap exclusions from the gate", () => {
    for (const locale of LIFE_VALUES_CARD_SORT_RELEASE_GATE.locales) {
      const path = localizedAssessmentPath(locale, LIFE_VALUES_CARD_SORT_RELEASE_GATE);
      expect(path).toBe(`/${locale}/life-values-test`);
      expect(isAssessmentRouteExcludedFromSitemap(path)).toBe(true);
      expect(isAssessmentRouteExcludedFromSitemap(`${path}/`)).toBe(true);
    }
  });

  it("matches root ownership when the cross-project SSOT is available", () => {
    if (!existsSync(ROOT_OWNERSHIP_PATH)) return;
    const ownership = JSON.parse(readFileSync(ROOT_OWNERSHIP_PATH, "utf8"));
    const route = ownership.routes.find((entry: { id: string }) => entry.id === LIFE_VALUES_CARD_SORT_RELEASE_GATE.ownershipId);
    expect(route).toBeDefined();
    expect(route.indexable).toBe(LIFE_VALUES_CARD_SORT_RELEASE_GATE.indexable);
    expect(route.locales).toEqual(LIFE_VALUES_CARD_SORT_RELEASE_GATE.locales);
    expect(route.sourcePath).toBe(LIFE_VALUES_CARD_SORT_RELEASE_GATE.sourcePath);
    expect(route.canonicalPattern).toBe(LIFE_VALUES_CARD_SORT_RELEASE_GATE.canonicalPattern);
  });
});

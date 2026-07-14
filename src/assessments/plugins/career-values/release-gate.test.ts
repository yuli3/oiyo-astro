import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { CAREER_VALUES_RELEASE_GATE, assertAssessmentReleaseGate, isAssessmentRouteExcludedFromSitemap, localizedAssessmentPath } from "../../../../config/assessment-release-gates.js";
import { ASSESSMENT_LOCALES, getAssessmentPlugin } from "../../core";
import { registerBuiltinAssessments } from "../index";
import { careerValuesPlugin } from ".";

const ROOT_OWNERSHIP_PATH = new URL("../../../../../docs/route-ownership.json", import.meta.url);

describe("career values release gate", () => {
  it("aligns gate, plugin, registry, and every locale", () => {
    expect(assertAssessmentReleaseGate(CAREER_VALUES_RELEASE_GATE)).toBe(true);
    expect(CAREER_VALUES_RELEASE_GATE.locales).toEqual([...ASSESSMENT_LOCALES]);
    expect(Object.keys(careerValuesPlugin.locale)).toEqual([...ASSESSMENT_LOCALES]);
    expect(careerValuesPlugin.manifest).toMatchObject({ id: CAREER_VALUES_RELEASE_GATE.assessmentId, indexable: false, status: "draft" });
    registerBuiltinAssessments();
    expect(getAssessmentPlugin("career-values")).toBe(careerValuesPlugin);
  });

  it("excludes every draft locale from the sitemap", () => {
    for (const locale of CAREER_VALUES_RELEASE_GATE.locales) {
      const path = localizedAssessmentPath(locale, CAREER_VALUES_RELEASE_GATE);
      expect(path).toBe(`/${locale}/career-values-test`);
      expect(isAssessmentRouteExcludedFromSitemap(path)).toBe(true);
      expect(isAssessmentRouteExcludedFromSitemap(`${path}/`)).toBe(true);
    }
  });

  it("matches the cross-project ownership SSOT", () => {
    if (!existsSync(ROOT_OWNERSHIP_PATH)) return;
    const ownership = JSON.parse(readFileSync(ROOT_OWNERSHIP_PATH, "utf8"));
    const route = ownership.routes.find((entry: { id: string }) => entry.id === CAREER_VALUES_RELEASE_GATE.ownershipId);
    expect(route).toBeDefined();
    expect(route.indexable).toBe(CAREER_VALUES_RELEASE_GATE.indexable);
    expect(route.locales).toEqual(CAREER_VALUES_RELEASE_GATE.locales);
    expect(route.sourcePath).toBe(CAREER_VALUES_RELEASE_GATE.sourcePath);
    expect(route.canonicalPattern).toBe(CAREER_VALUES_RELEASE_GATE.canonicalPattern);
  });
});

import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  ADULT_ATTACHMENT_RELEASE_GATE,
  assertAssessmentReleaseGate,
  isAssessmentRouteExcludedFromSitemap,
  localizedAssessmentPath,
} from "../../../../config/assessment-release-gates.js";
import { ASSESSMENT_LOCALES } from "../../core";
import { attachmentPlugin } from "./plugin";

const ROOT_OWNERSHIP_PATH = new URL("../../../../../docs/route-ownership.json", import.meta.url);

describe("adult attachment release gate", () => {
  it("keeps manifest and locale contracts aligned", () => {
    expect(assertAssessmentReleaseGate()).toBe(true);
    expect(ADULT_ATTACHMENT_RELEASE_GATE).toMatchObject({
      assessmentId: "adult-attachment",
      assessmentStatus: "draft",
      indexable: false,
    });
    expect(ADULT_ATTACHMENT_RELEASE_GATE.locales).toEqual([...ASSESSMENT_LOCALES]);
    expect(Object.keys(attachmentPlugin.locale)).toEqual([...ASSESSMENT_LOCALES]);
    expect(attachmentPlugin.manifest.indexable).toBe(false);
    expect(attachmentPlugin.manifest.status).toBe("draft");
    expect(attachmentPlugin.manifest.routes.execution).toBe(ADULT_ATTACHMENT_RELEASE_GATE.executionRoutePattern);
    expect(Object.values(attachmentPlugin.locale).every((entry) => entry.status === "draft")).toBe(true);
  });

  it("rejects indexability before production and reviewed locales", () => {
    expect(() => assertAssessmentReleaseGate({ ...ADULT_ATTACHMENT_RELEASE_GATE, indexable: true })).toThrow("production status");
    expect(() => assertAssessmentReleaseGate({
      ...ADULT_ATTACHMENT_RELEASE_GATE,
      assessmentStatus: "production",
      indexable: true,
    })).toThrow("every released locale");
    expect(assertAssessmentReleaseGate({
      ...ADULT_ATTACHMENT_RELEASE_GATE,
      assessmentStatus: "production",
      indexable: true,
      localeStatuses: Object.fromEntries(ADULT_ATTACHMENT_RELEASE_GATE.locales.map((locale) => [locale, "reviewed"])),
    })).toBe(true);
  });

  it("derives every sitemap exclusion from the execution route", () => {
    for (const locale of ADULT_ATTACHMENT_RELEASE_GATE.locales) {
      const path = localizedAssessmentPath(locale);
      expect(path).toBe(`/${locale}/attachment-style/test`);
      expect(isAssessmentRouteExcludedFromSitemap(path)).toBe(true);
      expect(isAssessmentRouteExcludedFromSitemap(`${path}/`)).toBe(true);
    }
    expect(isAssessmentRouteExcludedFromSitemap("/ko/mbti/test/")).toBe(false);
  });

  it("matches root route ownership when the cross-project SSOT is available", () => {
    if (!existsSync(ROOT_OWNERSHIP_PATH)) {
      expect(ADULT_ATTACHMENT_RELEASE_GATE.ownershipId).toBe("oiyo.attachment-style.test");
      return;
    }
    const ownership = JSON.parse(readFileSync(ROOT_OWNERSHIP_PATH, "utf8"));
    const route = ownership.routes.find((entry: { id: string }) => entry.id === ADULT_ATTACHMENT_RELEASE_GATE.ownershipId);
    expect(route).toBeDefined();
    expect(route.indexable).toBe(ADULT_ATTACHMENT_RELEASE_GATE.indexable);
    expect(route.locales).toEqual(ADULT_ATTACHMENT_RELEASE_GATE.locales);
    expect(route.sourcePath).toBe(ADULT_ATTACHMENT_RELEASE_GATE.sourcePath);
    expect(route.canonicalPattern).toBe(ADULT_ATTACHMENT_RELEASE_GATE.canonicalPattern);
  });
});

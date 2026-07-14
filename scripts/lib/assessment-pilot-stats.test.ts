import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ASSESSMENT_LOCALES } from "../../src/assessments/core";
import { ATTACHMENT_INSTRUMENT } from "../../src/assessments/plugins/attachment/data";
import { COPY, QUESTION_COPY } from "../../src/components/tests/AttachmentStyleTest";
import { analyzePilotRows, parsePilotJsonLines, validatePilotBatchManifest } from "./assessment-pilot-stats.mjs";

const instrument = JSON.parse(readFileSync(new URL("../../config/pilot-instruments/adult-attachment.json", import.meta.url), "utf8"));
const manifest = {
  assessmentId: "adult-attachment",
  instrumentVersion: "attachment-oiyo-anxiety-avoidance-12-v1",
  locale: "ko",
  promptRevision: "2026-07-14-r1",
  administeredFormHashSha256: "pending",
  consentProtocolVersion: "synthetic-fixture-only",
  collectionStart: "2026-07-14",
  collectionEnd: "2026-07-14",
};

describe("de-identified assessment pilot input QC", () => {
  it("locks the pilot contract to the product instrument and displayed prompts", () => {
    expect(instrument.instrumentVersion).toBe(ATTACHMENT_INSTRUMENT.version);
    expect(instrument.canonicalSourceLanguage).toBe("en");
    expect(instrument.allowedLocales).toEqual([...ASSESSMENT_LOCALES]);
    expect(instrument.responseScale).toEqual({ min: 1, max: 5 });
    expect(instrument.items).toEqual(ATTACHMENT_INSTRUMENT.items.map((item) => ({
      id: item.id,
      dimension: item.constructId.endsWith("anxiety") ? "anxiety" : "avoidance",
      reverse: Boolean(item.reverse),
    })));
    const actualHashes = Object.fromEntries(ASSESSMENT_LOCALES.map((locale) => [
      locale,
      createHash("sha256").update(JSON.stringify(QUESTION_COPY[locale])).digest("hex"),
    ]));
    for (const locale of ASSESSMENT_LOCALES) {
      expect(instrument.localeVersions[locale].promptRevision).toBe("2026-07-14-r1");
    }
    expect(Object.fromEntries(ASSESSMENT_LOCALES.map((locale) => [locale, instrument.localeVersions[locale].promptHashSha256]))).toEqual(actualHashes);
    const administeredFormHashes = Object.fromEntries(ASSESSMENT_LOCALES.map((locale) => [
      locale,
      createHash("sha256").update(JSON.stringify({
        context: COPY[locale].context,
        questions: QUESTION_COPY[locale],
        safety: COPY[locale].safety,
        scale: COPY[locale].scale,
      })).digest("hex"),
    ]));
    expect(Object.fromEntries(ASSESSMENT_LOCALES.map((locale) => [locale, instrument.localeVersions[locale].administeredFormHashSha256]))).toEqual(administeredFormHashes);
  });

  it("produces QC aggregates without participant-level or psychometric output", () => {
    const rows = Array.from({ length: 6 }, (_, rowIndex) => ({
      locale: "ko",
      responses: Object.fromEntries(instrument.items.map((item: { id: string }, itemIndex: number) => [item.id, ((rowIndex + itemIndex) % 5) + 1])),
    }));
    const report = analyzePilotRows(rows, instrument, { ...manifest, administeredFormHashSha256: instrument.localeVersions.ko.administeredFormHashSha256 });
    expect(report.participants).toBe(6);
    expect(report.locale).toBe("ko");
    expect(report.dimensions.anxiety.completeCases).toBe(6);
    expect(report.dimensions.avoidance.responseCountsByItem["avoidance-1"]).toBeDefined();
    expect(JSON.stringify(report)).not.toMatch(/responses|alpha|correlation|mean|standardDeviation/i);
  });

  it("reports missingness and refuses identifiers, invalid locales, values, or locale pooling", () => {
    const responses = Object.fromEntries(instrument.items.map((item: { id: string }) => [item.id, 3]));
    delete responses["anxiety-1"];
    const batchManifest = { ...manifest, administeredFormHashSha256: instrument.localeVersions.ko.administeredFormHashSha256 };
    const report = analyzePilotRows([{ locale: "ko", responses }], instrument, batchManifest);
    expect(report.dimensions.anxiety.missingByItem["anxiety-1"]).toBe(1);
    expect(() => analyzePilotRows([{ locale: "ko", participantId: "person-1", responses }], instrument, batchManifest)).toThrow("disallowed fields");
    expect(() => analyzePilotRows([{ locale: "person@example.com", responses }], instrument, batchManifest)).toThrow("locale must be one of");
    expect(() => analyzePilotRows([{ locale: "ko", responses: { "anxiety-1": 9 } }], instrument, batchManifest)).toThrow("must be an integer");
    expect(() => analyzePilotRows([{ locale: "ko", responses }, { locale: "en", responses }], instrument, batchManifest)).toThrow("one locale per pilot file");
    expect(() => analyzePilotRows([{ locale: "en", responses }], instrument, batchManifest)).toThrow("does not match batch manifest");
    expect(validatePilotBatchManifest(batchManifest, instrument)).toBe(true);
    expect(() => validatePilotBatchManifest({ ...batchManifest, promptRevision: "wrong" }, instrument)).toThrow("promptRevision");
  });

  it("parses JSONL with useful line errors", () => {
    expect(parsePilotJsonLines('{"locale":"ko","responses":{}}\n')).toHaveLength(1);
    expect(() => parsePilotJsonLines("not-json")).toThrow("line 1");
  });
});

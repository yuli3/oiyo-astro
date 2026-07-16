import { describe, expect, it } from "vitest";
import fixtureJson from "../../../config/personal-profile-export-v2.fixture.json";
import {
  buildSampleReport,
  renderSampleReportHtml,
  SAMPLE_REPORT_FORBIDDEN_CLAIM_PATTERNS,
  SAMPLE_REPORT_SCHEMA,
  SAMPLE_REPORT_SCHEMA_VERSION,
} from "./sample-report";
import type { PersonalProfileExportV2 } from "./export-v2";

const FIXED_AT = "2026-07-17T00:00:00.000Z";

function currentExport(): PersonalProfileExportV2 {
  return structuredClone(fixtureJson) as unknown as PersonalProfileExportV2;
}

function previousExport(mutate?: (data: PersonalProfileExportV2) => void): PersonalProfileExportV2 {
  const data = currentExport();
  data.exportedAt = "2026-06-01T00:00:00.000Z";
  const projection = data.sections.assessmentDerived.lanes[0].projections[0];
  projection.value = 65;
  projection.measuredAt = "2026-06-01T00:00:00.000Z";
  mutate?.(data);
  return data;
}

describe("sample-report v1 (C4 Wave 0)", () => {
  it("builds a deterministic derived report with lifecycle and privacy contracts", () => {
    const input = { export: currentExport(), generatedAt: FIXED_AT };
    const report = buildSampleReport(input);
    expect(report.schema).toBe(SAMPLE_REPORT_SCHEMA);
    expect(report.schemaVersion).toBe(SAMPLE_REPORT_SCHEMA_VERSION);
    expect(report.lifecycle).toEqual({
      deletion: "discard-file-only",
      derived: true,
      regeneration: "recompute-from-export",
      storage: "none",
    });
    expect(report.privacy).toEqual({ rawResponsesIncluded: false, serverTransmission: "none" });
    expect(report.evidence).toHaveLength(1);
    expect(report.evidence[0]).toMatchObject({ constructId: "psychology.big5.O", lane: "trait", value: 80 });
    expect(renderSampleReportHtml(report)).toBe(renderSampleReportHtml(buildSampleReport(input)));
  });

  it("rejects inputs that are not the canonical export v2 contract", () => {
    const wrongSchema = currentExport();
    (wrongSchema as { schemaVersion: number }).schemaVersion = 1;
    expect(() => buildSampleReport({ export: wrongSchema })).toThrow(/PersonalProfileExportV2/);

    const wrongPrivacy = currentExport();
    (wrongPrivacy.privacy as { serverTransmission: string }).serverTransmission = "https";
    expect(() => buildSampleReport({ export: wrongPrivacy })).toThrow(/privacy/);

    const withRaw = currentExport();
    (withRaw.sections.assessmentDerived.lanes[0].projections[0] as unknown as Record<string, unknown>).responses = [1];
    expect(() => buildSampleReport({ export: withRaw })).toThrow(/원응답/);
  });

  it("compares only the same assessment/instrument/scoring across different measurements", () => {
    const comparable = buildSampleReport({
      export: currentExport(),
      previousExport: previousExport(),
      generatedAt: FIXED_AT,
    });
    expect(comparable.changes).toEqual([
      expect.objectContaining({ comparable: true, delta: 15, from: 65, to: 80 }),
    ]);

    const versionMismatch = buildSampleReport({
      export: currentExport(),
      previousExport: previousExport((data) => {
        data.sections.assessmentDerived.lanes[0].projections[0].provenance.instrumentVersion = "big5-ocean-20-v2";
      }),
      generatedAt: FIXED_AT,
    });
    expect(versionMismatch.changes[0]).toMatchObject({ comparable: false, delta: null, reason: "version-mismatch" });

    const sameMeasurement = buildSampleReport({
      export: currentExport(),
      previousExport: previousExport((data) => {
        const projection = data.sections.assessmentDerived.lanes[0].projections[0];
        projection.measuredAt = "2026-07-01T00:00:00.000Z";
      }),
      generatedAt: FIXED_AT,
    });
    expect(sameMeasurement.changes[0]).toMatchObject({ comparable: false, reason: "same-measurement" });

    const nonNumeric = (() => {
      const current = currentExport();
      current.sections.assessmentDerived.lanes[0].projections[0].value = "high";
      return buildSampleReport({
        export: current,
        previousExport: previousExport((data) => {
          data.sections.assessmentDerived.lanes[0].projections[0].value = "mid";
        }),
        generatedAt: FIXED_AT,
      });
    })();
    expect(nonNumeric.changes[0]).toMatchObject({ comparable: false, reason: "non-numeric" });

    const noPrevious = buildSampleReport({ export: currentExport(), generatedAt: FIXED_AT });
    expect(noPrevious.changes[0]).toMatchObject({ comparable: false, reason: "no-previous" });
    expect(renderSampleReportHtml(noPrevious)).toContain("변화 비교를 건너뜁니다");
  });

  it("escapes user-authored notes and never emits scripts or external requests", () => {
    const report = buildSampleReport({
      export: currentExport(),
      userNotes: ['<script>alert("x")</script>', "평범한 메모 & 기록"],
      generatedAt: FIXED_AT,
    });
    expect(report.userAuthored).toMatchObject({ provenance: "user-authored" });
    const html = renderSampleReportHtml(report);
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("평범한 메모 &amp; 기록");
    expect(html).not.toMatch(/src=|href=|https?:\/\//);
  });

  it("renders an accessible, self-contained, non-diagnostic document", () => {
    const html = renderSampleReportHtml(
      buildSampleReport({ export: currentExport(), previousExport: previousExport(), generatedAt: FIXED_AT }),
    );
    expect(html).toContain('<html lang="ko">');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('th scope="col"');
    expect(html).toContain("성격이 변했다는 증명이 아닙니다");
    expect(html).toContain("파일을 지우면 리포트도 사라집니다");
    expect(html).toContain("직접 적어 보세요");
    expect(html).toContain("@media print");
    for (const pattern of SAMPLE_REPORT_FORBIDDEN_CLAIM_PATTERNS) {
      expect(html).not.toMatch(pattern);
    }
  });
});

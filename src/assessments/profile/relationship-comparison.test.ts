import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import { describe, expect, it } from "vitest";

import exportFixture from "../../../config/personal-profile-export-v2.fixture.json";
import comparisonFixture from "../../../config/relationship-comparison-v1.fixture.json";
import relationshipSchema from "../../../config/relationship-comparison-v1.schema.json";
import {
  buildRelationshipResultCode,
  compareRelationshipResultCodes,
  decodeRelationshipResultCode,
  encodeRelationshipResultCode,
  sanitizeRelationshipResultCode,
  withdrawRelationshipComparison,
  type RelationshipComparisonInput,
  type RelationshipResultCodeV1,
} from "./relationship-comparison";
import type { PersonalProfileExportV2 } from "./export-v2";

const BASE_EXPORT = exportFixture as PersonalProfileExportV2;
const FIXTURE = comparisonFixture;

const ajv = new Ajv2020({ allErrors: true, strict: true });
ajv.addFormat("date-time", (value: string) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
});
ajv.addSchema(relationshipSchema);

function schemaValidator(definition: "comparisonInput" | "comparisonReport" | "resultCode" | "withdrawalReceipt"): ValidateFunction {
  return ajv.compile({ $ref: `${relationshipSchema.$id}#/$defs/${definition}` });
}

function exportFor(openness: number, conscientiousness: number): PersonalProfileExportV2 {
  const value = structuredClone(BASE_EXPORT);
  const trait = value.sections.assessmentDerived.lanes.find((lane) => lane.id === "trait")!;
  trait.projections[0].value = openness;
  trait.projections.push({
    ...structuredClone(trait.projections[0]),
    constructId: "psychology.big5.C",
    value: conscientiousness,
  });
  const big5 = value.sections.assessmentDerived.instruments.find((instrument) => instrument.assessmentId === "big5")!;
  big5.projectionCount = 2;
  return value;
}

function resultCodes(): { A: RelationshipResultCodeV1; B: RelationshipResultCodeV1 } {
  const A = buildRelationshipResultCode(
    exportFor(FIXTURE.participantA.openness, FIXTURE.participantA.conscientiousness),
    {
      adultConfirmed: true,
      codeId: FIXTURE.participantA.codeId,
      consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
    },
  );
  const B = buildRelationshipResultCode(
    exportFor(FIXTURE.participantB.openness, FIXTURE.participantB.conscientiousness),
    {
      adultConfirmed: true,
      codeId: FIXTURE.participantB.codeId,
      consentAcknowledgedAt: FIXTURE.participantB.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
    },
  );
  return { A, B };
}

function consent(A: RelationshipResultCodeV1, B: RelationshipResultCodeV1): RelationshipComparisonInput {
  return {
    consent: {
      analyticsPayload: "none",
      localOnlyUnderstood: true,
      participantA: { acknowledgedAt: FIXTURE.compareAt, codeId: A.codeId, mayWithdraw: true, ownerPresent: true },
      participantB: { acknowledgedAt: FIXTURE.compareAt, codeId: B.codeId, mayWithdraw: true, ownerPresent: true },
      purpose: "mutual-reflection",
      serverTransmission: "none",
    },
    context: "couple",
    now: FIXTURE.compareAt,
    revokedCodeIds: [],
  };
}

describe("stateless relationship comparison v1", () => {
  it("derives a minimal code only through the canonical A3 export v2 parser", () => {
    const { A } = resultCodes();

    expect(A.origin).toEqual({
      exportSchema: "oiyo.personal-profile-export",
      exportSchemaVersion: 2,
      exportedAt: BASE_EXPORT.exportedAt,
      profileGeneratedAt: BASE_EXPORT.source.generatedAt,
    });
    expect(A.provenance).toEqual([{
      assessmentId: "big5",
      instrumentVersion: "big5-ocean-20-v1",
      interpretationVersion: "big5-ocean-20-interpretation-v1",
      measuredAt: "2026-07-01T00:00:00.000Z",
      scoringVersion: "big5-ocean-20-scoring-v1",
    }]);
    expect(A.signals).toHaveLength(2);
    expect(JSON.stringify(A)).not.toContain("fixture:big5:1");
    expect(JSON.stringify(A)).not.toContain("responses");
    expect(A.privacy).toEqual({ analyticsPayload: "none", rawResponsesIncluded: false, resultIdIncluded: false, serverTransmission: "none" });
  });

  it("round-trips the UTF-8 browser code without storage or transport adapters", () => {
    const unicodeExport = exportFor(80, 60);
    unicodeExport.sections.assessmentDerived.lanes[0].projections.forEach((projection) => {
      projection.provenance.instrumentVersion = "탐험가 🧭 自己理解";
    });
    const A = buildRelationshipResultCode(unicodeExport, {
      adultConfirmed: true,
      codeId: FIXTURE.participantA.codeId,
      consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
    });
    const encoded = encodeRelationshipResultCode(A);

    expect(encoded.startsWith("OIYO-RC1.")).toBe(true);
    expect(decodeRelationshipResultCode(encoded)).toEqual(sanitizeRelationshipResultCode(A));
  });

  it("accepts the canonical construct namespaces for all five A1/A3 lanes", () => {
    const allLanes = structuredClone(BASE_EXPORT);
    const specs = [
      { assessmentId: "mbti", constructId: "personality.mbti.preference.EI", lane: "preference", value: 55 },
      { assessmentId: "riasec", constructId: "vocation.riasec.I", lane: "interest", value: 70 },
      { assessmentId: "career-values", constructId: "values.work.autonomy", lane: "chosen-value", value: 85 },
      { assessmentId: "adult-attachment", constructId: "relationship.attachment.anxiety", lane: "reflective-signal", value: 35 },
    ] as const;
    for (const [index, spec] of specs.entries()) {
      const measuredAt = `2026-07-0${index + 2}T00:00:00.000Z`;
      const lane = allLanes.sections.assessmentDerived.lanes.find((item) => item.id === spec.lane)!;
      lane.projections.push({
        ...structuredClone(allLanes.sections.assessmentDerived.lanes[0].projections[0]),
        constructId: spec.constructId,
        measuredAt,
        provenance: {
          assessmentId: spec.assessmentId,
          assessmentResultSchema: "oiyo.assessment-result",
          assessmentResultSchemaVersion: 2,
          instrumentVersion: `${spec.assessmentId}-instrument-v1`,
          interpretationVersion: `${spec.assessmentId}-interpretation-v1`,
          resultId: `fixture:${spec.assessmentId}:1`,
          scoringVersion: `${spec.assessmentId}-scoring-v1`,
        },
        sourceAssessmentId: spec.assessmentId,
        value: spec.value,
      });
      const status = allLanes.sections.assessmentDerived.instruments.find((item) => item.assessmentId === spec.assessmentId)!;
      status.availability = "present";
      status.measuredAt = measuredAt;
      status.projectionCount = 1;
      delete status.missingReason;
    }

    const code = buildRelationshipResultCode(allLanes, {
      adultConfirmed: true,
      codeId: "all_lanes_01",
      consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
    });
    expect(new Set(code.signals.map((signal) => signal.sourceAssessmentId))).toEqual(new Set(["big5", "mbti", "riasec", "career-values", "adult-attachment"]));
  });

  it("returns only item-level common ground, differences, and conversation questions", () => {
    const { A, B } = resultCodes();
    const report = compareRelationshipResultCodes(encodeRelationshipResultCode(A), encodeRelationshipResultCode(B), consent(A, B));

    expect(report.shared.map((item) => item.constructId)).toEqual(FIXTURE.expected.sharedConstructs);
    expect(report.differences.map((item) => item.constructId)).toEqual(FIXTURE.expected.differentConstructs);
    expect(report.questions).toHaveLength(FIXTURE.expected.questionCount);
    expect(report.unmatched).toEqual(FIXTURE.expected.unmatched);
    expect(report.participants.A.origin).toEqual(A.origin);
    expect(report.participants.B.provenance).toEqual(B.provenance);
    expect(report.guardrails).toEqual({
      artifactAuthenticity: "not-provided",
      careerOrJobJudgment: "prohibited",
      compatibilityJudgment: "none",
      employmentOrHiringUse: "prohibited",
      healthOrPoliticalInference: "prohibited",
      minorUse: "prohibited",
      scoreAggregation: "none",
      successRate: "none",
    });
    expect(report.privacy).toEqual({ analyticsPayload: "none", persistedByEngine: false, rawResponsesIncluded: false, serverTransmission: "none" });
    expect(Object.keys(report)).not.toContain("score");
    expect(Object.keys(report)).not.toContain("compatibility");
    expect(Object.keys(report)).not.toContain("successRate");
  });

  it("requires two independent codes and current acknowledgement from both owners", () => {
    const { A, B } = resultCodes();
    expect(() => compareRelationshipResultCodes(A, A, consent(A, A))).toThrow("independently exported");

    const duplicated = buildRelationshipResultCode(
      exportFor(FIXTURE.participantA.openness, FIXTURE.participantA.conscientiousness),
      {
        adultConfirmed: true,
        codeId: "duplicate_01",
        consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
        createdAt: FIXTURE.createdAt,
        ownerSelfExported: true,
        reflectionOnly: true,
      },
    );
    expect(() => compareRelationshipResultCodes(A, duplicated, consent(A, duplicated))).toThrow("distinct canonical profile payloads");

    const missingOwner = consent(A, B);
    missingOwner.consent.participantB.ownerPresent = false as true;
    expect(() => compareRelationshipResultCodes(A, B, missingOwner)).toThrow("active owner acknowledgement");

    const mismatchedCode = consent(A, B);
    mismatchedCode.consent.participantA.codeId = B.codeId;
    expect(() => compareRelationshipResultCodes(A, B, mismatchedCode)).toThrow("active owner acknowledgement");

    const staleAcknowledgement = consent(A, B);
    staleAcknowledgement.consent.participantA.acknowledgedAt = "2026-07-16T09:59:59.999Z";
    expect(() => compareRelationshipResultCodes(A, B, staleAcknowledgement)).toThrow("must be current");
  });

  it("expires codes deterministically and bounds their local lifetime", () => {
    const { A, B } = resultCodes();
    const expired = consent(A, B);
    expired.now = A.expiresAt;
    expired.consent.participantA.acknowledgedAt = A.expiresAt;
    expired.consent.participantB.acknowledgedAt = B.expiresAt;
    expect(() => compareRelationshipResultCodes(A, B, expired)).toThrow("expired");

    expect(() => buildRelationshipResultCode(BASE_EXPORT, {
      adultConfirmed: true,
      codeId: "too_long_ttl",
      consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
      ttlDays: 31,
    })).toThrow("1-30 days");
  });

  it("blocks minors, workplace or hiring use, and non-reflection purposes", () => {
    expect(() => buildRelationshipResultCode(BASE_EXPORT, {
      adultConfirmed: false,
      codeId: "minor_code_1",
      consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
    } as unknown as Parameters<typeof buildRelationshipResultCode>[1])).toThrow("adults-only");

    const { A, B } = resultCodes();
    const workplace = consent(A, B);
    workplace.context = "workplace" as never;
    expect(() => compareRelationshipResultCodes(A, B, workplace)).toThrow("Workplace, hiring");

    const hiring = consent(A, B);
    hiring.consent.purpose = "hiring" as never;
    expect(() => compareRelationshipResultCodes(A, B, hiring)).toThrow("mutual-reflection consent");
  });

  it.each([
    "psychology.big5.political-party",
    "psychology.big5.politicalPreference",
    "psychology.big5.health-diagnosis",
    "psychology.big5.healthStatus",
  ])("rejects restricted political or health construct %s", (constructId) => {
    const unsafe = exportFor(80, 60);
    unsafe.sections.assessmentDerived.lanes[0].projections[0].constructId = constructId;
    expect(() => buildRelationshipResultCode(unsafe, {
      adultConfirmed: true,
      codeId: "unsafe_code_1",
      consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
    })).toThrow("Restricted relationship construct");
  });

  it("keeps scale mismatches visible instead of normalizing or aggregating them", () => {
    const { A } = resultCodes();
    const scaleExport = exportFor(FIXTURE.participantB.openness, FIXTURE.participantB.conscientiousness);
    const openness = scaleExport.sections.assessmentDerived.lanes[0].projections.find((projection) => projection.constructId === "psychology.big5.O")!;
    openness.scale = { min: 0, max: 10 };
    openness.value = 5.5;
    const B = buildRelationshipResultCode(scaleExport, {
      adultConfirmed: true,
      codeId: FIXTURE.participantB.codeId,
      consentAcknowledgedAt: FIXTURE.participantB.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: true,
      reflectionOnly: true,
    });
    const report = compareRelationshipResultCodes(A, B, consent(A, B));

    expect(report.differences.find((item) => item.constructId === "psychology.big5.O")?.kind).toBe("different-scale");
  });

  it("returns an honest local withdrawal/delete receipt without remote revocation claims", () => {
    const { A, B } = resultCodes();
    const receipt = withdrawRelationshipComparison("B", B.codeId, [], "2026-07-16T12:00:00.000Z");
    expect(receipt).toEqual({
      action: "revoke-for-active-session-and-delete-local-code-and-derived-report",
      codeId: "fixture_B_01",
      deletionStatus: "caller-action-required",
      participant: "B",
      propagation: "not-available-for-exported-copies",
      remoteRevocation: "not-applicable-no-server-copy",
      revokedCodeIds: ["fixture_B_01"],
      status: "revoked-for-active-session",
      withdrawnAt: "2026-07-16T12:00:00.000Z",
    });
    const afterWithdrawal = consent(A, B);
    afterWithdrawal.revokedCodeIds = receipt.revokedCodeIds;
    expect(() => compareRelationshipResultCodes(A, B, afterWithdrawal)).toThrow("withdrawn");
  });

  it("rejects tampered prefixes, payloads, privacy, and provenance", () => {
    const { A } = resultCodes();
    expect(() => decodeRelationshipResultCode("OTHER." + encodeRelationshipResultCode(A))).toThrow("prefix");
    expect(() => decodeRelationshipResultCode("OIYO-RC1.not+base64")).toThrow("base64url");

    const unsafe = structuredClone(A) as RelationshipResultCodeV1;
    unsafe.privacy.serverTransmission = "remote" as never;
    expect(() => sanitizeRelationshipResultCode(unsafe)).toThrow("privacy contract");

    const missingProvenance = structuredClone(A) as RelationshipResultCodeV1;
    missingProvenance.provenance = [];
    expect(() => sanitizeRelationshipResultCode(missingProvenance)).toThrow("missing provenance");

    const mismatchedProvenance = structuredClone(A) as RelationshipResultCodeV1;
    mismatchedProvenance.provenance[0].measuredAt = "2026-06-01T00:00:00.000Z";
    expect(() => sanitizeRelationshipResultCode(mismatchedProvenance)).toThrow("missing provenance");

    const futureOrigin = structuredClone(A) as RelationshipResultCodeV1;
    futureOrigin.origin.exportedAt = "2026-07-16T10:00:00.001Z";
    expect(() => sanitizeRelationshipResultCode(futureOrigin)).toThrow("origin ordering");

    const changedValue = structuredClone(A) as RelationshipResultCodeV1;
    changedValue.signals[0].value += 1;
    expect(() => sanitizeRelationshipResultCode(changedValue)).toThrow("integrity check failed");

    const changedVersion = structuredClone(A) as RelationshipResultCodeV1;
    changedVersion.provenance[0].scoringVersion = "forged-scoring-v99";
    expect(() => sanitizeRelationshipResultCode(changedVersion)).toThrow("integrity check failed");
  });

  it("requires explicit owner self-export and reflection-only consent", () => {
    expect(() => buildRelationshipResultCode(BASE_EXPORT, {
      adultConfirmed: true,
      codeId: "not_self_01",
      consentAcknowledgedAt: FIXTURE.participantA.consentAcknowledgedAt,
      createdAt: FIXTURE.createdAt,
      ownerSelfExported: false,
      reflectionOnly: true,
    } as unknown as Parameters<typeof buildRelationshipResultCode>[1])).toThrow("explicit owner self-export");
  });

  it("executes JSON Schema validation for codes, consent input, reports, receipts, and mutations", () => {
    const { A, B } = resultCodes();
    const input = consent(A, B);
    const report = compareRelationshipResultCodes(A, B, input);
    const receipt = withdrawRelationshipComparison("B", B.codeId, [], "2026-07-16T12:00:00.000Z");
    const validators = {
      code: schemaValidator("resultCode"),
      input: schemaValidator("comparisonInput"),
      report: schemaValidator("comparisonReport"),
      receipt: schemaValidator("withdrawalReceipt"),
    };

    expect(validators.code(A), JSON.stringify(validators.code.errors)).toBe(true);
    expect(validators.input(input), JSON.stringify(validators.input.errors)).toBe(true);
    expect(validators.report(report), JSON.stringify(validators.report.errors)).toBe(true);
    expect(validators.receipt(receipt), JSON.stringify(validators.receipt.errors)).toBe(true);

    const extra = { ...structuredClone(A), unexpected: true };
    expect(validators.code(extra)).toBe(false);
    const forbiddenConstruct = structuredClone(A);
    forbiddenConstruct.signals[0].constructId = "psychology.big5.politicalPreference";
    expect(validators.code(forbiddenConstruct)).toBe(false);
    const missingRevocations = structuredClone(input) as Partial<RelationshipComparisonInput>;
    delete missingRevocations.revokedCodeIds;
    expect(validators.input(missingRevocations)).toBe(false);
    const forgedGuardrail = structuredClone(report);
    forgedGuardrail.guardrails.artifactAuthenticity = "verified" as never;
    expect(validators.report(forgedGuardrail)).toBe(false);
    const falseDeletion = structuredClone(receipt);
    falseDeletion.deletionStatus = "deleted" as never;
    expect(validators.receipt(falseDeletion)).toBe(false);
  });
});

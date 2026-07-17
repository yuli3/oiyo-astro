import {
  parsePersonalProfileExportJson,
  serializePersonalProfileExportJson,
  type PersonalProfileExportSource,
  type PersonalProfileExportV2,
} from "./export-v2";
import type {
  PersonalProfileConfidenceBand,
  PersonalProfileFreshness,
  PersonalProfileLaneId,
  PersonalProfileProjection,
} from "./schema";

export const RELATIONSHIP_RESULT_CODE_SCHEMA = "oiyo.relationship-result-code" as const;
export const RELATIONSHIP_RESULT_CODE_SCHEMA_VERSION = 1 as const;
export const RELATIONSHIP_COMPARISON_SCHEMA = "oiyo.relationship-comparison" as const;
export const RELATIONSHIP_COMPARISON_SCHEMA_VERSION = 1 as const;
export const RELATIONSHIP_RESULT_CODE_PREFIX = "OIYO-RC1." as const;
export const RELATIONSHIP_RESULT_CODE_DEFAULT_TTL_DAYS = 7 as const;
export const RELATIONSHIP_RESULT_CODE_MAX_TTL_DAYS = 30 as const;

export type RelationshipContext = "couple" | "family" | "friend";
export type RelationshipParticipant = "A" | "B";

export interface RelationshipResultCodeSource {
  assessmentId: string;
  instrumentVersion: string;
  interpretationVersion: string;
  measuredAt: string;
  scoringVersion: string;
}

export interface RelationshipResultCodeSignal {
  confidenceBand: PersonalProfileConfidenceBand;
  constructId: string;
  evidenceTier: PersonalProfileProjection["evidenceTier"];
  freshness: PersonalProfileFreshness;
  lane: PersonalProfileLaneId;
  measuredAt: string;
  scale?: { max: number; min: number };
  sourceAssessmentId: string;
  value: number;
}

export interface RelationshipResultCodeV1 {
  codeId: string;
  consent: {
    adultConfirmed: true;
    acknowledgedAt: string;
    ownerSelfExported: true;
    reflectionOnly: true;
  };
  createdAt: string;
  expiresAt: string;
  integrity: {
    artifact: "unsigned-self-asserted-local";
    authenticity: "not-provided";
    canonicalPayloadHash: string;
    hashAlgorithm: "fnv1a-64";
    payloadFingerprint: string;
    purpose: "integrity-and-error-detection-only";
  };
  origin: {
    exportSchema: "oiyo.personal-profile-export";
    exportSchemaVersion: 2;
    exportedAt: string;
    profileGeneratedAt: string;
  };
  privacy: {
    analyticsPayload: "none";
    rawResponsesIncluded: false;
    resultIdIncluded: false;
    serverTransmission: "none";
  };
  provenance: RelationshipResultCodeSource[];
  schema: typeof RELATIONSHIP_RESULT_CODE_SCHEMA;
  schemaVersion: typeof RELATIONSHIP_RESULT_CODE_SCHEMA_VERSION;
  signals: RelationshipResultCodeSignal[];
}

export interface RelationshipComparisonAcknowledgement {
  acknowledgedAt: string;
  codeId: string;
  mayWithdraw: true;
  ownerPresent: true;
}

export interface RelationshipComparisonInput {
  consent: {
    analyticsPayload: "none";
    localOnlyUnderstood: true;
    participantA: RelationshipComparisonAcknowledgement;
    participantB: RelationshipComparisonAcknowledgement;
    purpose: "mutual-reflection";
    serverTransmission: "none";
  };
  context: RelationshipContext;
  now?: string;
  revokedCodeIds: readonly string[];
}

export interface RelationshipComparisonItem {
  constructId: string;
  kind: "different-scale" | "different-value" | "exact";
  lane: PersonalProfileLaneId;
  participantAValue: number;
  participantBValue: number;
}

export interface RelationshipComparisonReportV1 {
  comparedAt: string;
  consent: {
    bothOwnersAcknowledged: true;
    context: RelationshipContext;
    purpose: "mutual-reflection";
    withdrawalEndsComparison: true;
  };
  differences: RelationshipComparisonItem[];
  guardrails: {
    artifactAuthenticity: "not-provided";
    careerOrJobJudgment: "prohibited";
    compatibilityJudgment: "none";
    employmentOrHiringUse: "prohibited";
    healthOrPoliticalInference: "prohibited";
    minorUse: "prohibited";
    scoreAggregation: "none";
    successRate: "none";
  };
  participants: {
    A: Pick<RelationshipResultCodeV1, "codeId" | "origin" | "provenance">;
    B: Pick<RelationshipResultCodeV1, "codeId" | "origin" | "provenance">;
  };
  privacy: {
    analyticsPayload: "none";
    persistedByEngine: false;
    rawResponsesIncluded: false;
    serverTransmission: "none";
  };
  questions: Array<{ constructId: string; lane: PersonalProfileLaneId; prompt: string; promptId: string }>;
  schema: typeof RELATIONSHIP_COMPARISON_SCHEMA;
  schemaVersion: typeof RELATIONSHIP_COMPARISON_SCHEMA_VERSION;
  shared: RelationshipComparisonItem[];
  unmatched: { A: string[]; B: string[] };
}

export interface RelationshipWithdrawalReceipt {
  action: "revoke-for-active-session-and-delete-local-code-and-derived-report";
  codeId: string;
  participant: RelationshipParticipant;
  propagation: "not-available-for-exported-copies";
  remoteRevocation: "not-applicable-no-server-copy";
  deletionStatus: "caller-action-required";
  revokedCodeIds: string[];
  status: "revoked-for-active-session";
  withdrawnAt: string;
}

const ALLOWED_ASSESSMENTS = new Set(["adult-attachment", "big5", "career-values", "mbti", "riasec"]);
const ALLOWED_CONSTRUCTS: Record<string, ReadonlySet<string>> = {
  "adult-attachment": new Set(["relationship.attachment.anxiety", "relationship.attachment.avoidance"]),
  big5: new Set(["psychology.big5.O", "psychology.big5.C", "psychology.big5.E", "psychology.big5.A", "psychology.big5.N"]),
  "career-values": new Set(["values.work.security", "values.work.achievement", "values.work.autonomy", "values.work.service", "values.work.creativity", "values.work.status"]),
  mbti: new Set(["personality.mbti.preference.EI", "personality.mbti.preference.SN", "personality.mbti.preference.TF", "personality.mbti.preference.JP"]),
  riasec: new Set(["vocation.riasec.R", "vocation.riasec.I", "vocation.riasec.A", "vocation.riasec.S", "vocation.riasec.E", "vocation.riasec.C"]),
};
const FORBIDDEN_FIELDS = new Set([
  "age", "answers", "birthdate", "classifications", "dateofbirth", "dob", "legacy",
  "minor", "raw", "responses", "workplaceevaluation",
]);
const CODE_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const HASH_PATTERN = /^[0-9a-f]{16}$/;
const MILLISECONDS_PER_DAY = 86_400_000;
const EVIDENCE_TIERS = new Set(["validated-scale", "research-inspired", "reflective-framework", "symbolic-tradition", "educational", "entertainment"]);
const LANES = new Set(["trait", "preference", "interest", "chosen-value", "reflective-signal"]);
const LANE_PROMPTS: Record<PersonalProfileLaneId, string> = {
  "chosen-value": "Where could both priorities fit, and what trade-off needs an explicit conversation?",
  interest: "Which activity could each person try without expecting identical enthusiasm?",
  preference: "When do these preferences help communication, and when should you ask instead of assume?",
  "reflective-signal": "What helps each person feel heard, while treating this result as a prompt rather than a diagnosis?",
  trait: "In which situations does each pattern feel useful, and where might you need different support?",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function containsForbiddenField(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenField);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, nested]) =>
    FORBIDDEN_FIELDS.has(key.replace(/[^a-z]/gi, "").toLowerCase()) || containsForbiddenField(nested));
}

function assertAllowedSignal(assessmentId: string, constructId: string): void {
  if (!ALLOWED_ASSESSMENTS.has(assessmentId)) throw new TypeError(`Unsupported relationship assessment: ${assessmentId}`);
  if (!ALLOWED_CONSTRUCTS[assessmentId]?.has(constructId)) {
    throw new TypeError(`Restricted relationship construct: ${constructId}`);
  }
}

function fnv1a64(value: string): string {
  let hash = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(value)) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

function canonicalPayloadHash(value: Omit<RelationshipResultCodeV1, "integrity">): string {
  return fnv1a64(JSON.stringify(value));
}

function payloadFingerprint(value: Pick<RelationshipResultCodeV1, "origin" | "provenance" | "signals">): string {
  return fnv1a64(JSON.stringify({ origin: value.origin, provenance: value.provenance, signals: value.signals }));
}

function integrityFor(value: Omit<RelationshipResultCodeV1, "integrity">): RelationshipResultCodeV1["integrity"] {
  return {
    artifact: "unsigned-self-asserted-local",
    authenticity: "not-provided",
    canonicalPayloadHash: canonicalPayloadHash(value),
    hashAlgorithm: "fnv1a-64",
    payloadFingerprint: payloadFingerprint(value),
    purpose: "integrity-and-error-detection-only",
  };
}

function toSource(source: PersonalProfileExportSource): RelationshipResultCodeSource {
  return {
    assessmentId: source.assessmentId,
    instrumentVersion: source.instrumentVersion,
    interpretationVersion: source.interpretationVersion,
    measuredAt: source.measuredAt,
    scoringVersion: source.scoringVersion,
  };
}

function toSignal(lane: PersonalProfileLaneId, projection: PersonalProfileProjection): RelationshipResultCodeSignal {
  assertAllowedSignal(projection.sourceAssessmentId, projection.constructId);
  if (typeof projection.value !== "number" || !Number.isFinite(projection.value)) {
    throw new TypeError(`Relationship comparison accepts numeric canonical signals only: ${projection.constructId}`);
  }
  return {
    confidenceBand: projection.confidenceBand,
    constructId: projection.constructId,
    evidenceTier: projection.evidenceTier,
    freshness: projection.freshness,
    lane,
    measuredAt: projection.measuredAt,
    scale: projection.scale ? { max: projection.scale.max, min: projection.scale.min } : undefined,
    sourceAssessmentId: projection.sourceAssessmentId,
    value: projection.value,
  };
}

function sortSignals(a: RelationshipResultCodeSignal, b: RelationshipResultCodeSignal): number {
  return a.lane.localeCompare(b.lane) || a.constructId.localeCompare(b.constructId) || a.sourceAssessmentId.localeCompare(b.sourceAssessmentId);
}

function canonicalizeExport(value: string | PersonalProfileExportV2): PersonalProfileExportV2 {
  return parsePersonalProfileExportJson(typeof value === "string" ? value : serializePersonalProfileExportJson(value));
}

export function buildRelationshipResultCode(
  personalProfileExport: string | PersonalProfileExportV2,
  input: { adultConfirmed: true; codeId: string; consentAcknowledgedAt: string; createdAt?: string; ownerSelfExported: true; reflectionOnly: true; ttlDays?: number },
): RelationshipResultCodeV1 {
  const profileExport = canonicalizeExport(personalProfileExport);
  const createdAt = input.createdAt ?? new Date().toISOString();
  const ttlDays = input.ttlDays ?? RELATIONSHIP_RESULT_CODE_DEFAULT_TTL_DAYS;
  if (!CODE_ID_PATTERN.test(input.codeId)) throw new TypeError("Result codeId must be an opaque 8-64 character identifier");
  if (input.adultConfirmed !== true) throw new TypeError("Relationship comparison is adults-only");
  if (input.ownerSelfExported !== true || input.reflectionOnly !== true) throw new TypeError("Result code requires explicit owner self-export and reflection-only consent");
  if (!isIsoTimestamp(createdAt) || !isIsoTimestamp(input.consentAcknowledgedAt)) throw new TypeError("Result code timestamps must be canonical ISO UTC");
  if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > RELATIONSHIP_RESULT_CODE_MAX_TTL_DAYS) throw new TypeError("Result code TTL must be 1-30 days");
  if (Date.parse(input.consentAcknowledgedAt) > Date.parse(createdAt)) throw new TypeError("Consent acknowledgement cannot follow code creation");
  if (Date.parse(profileExport.source.generatedAt) > Date.parse(profileExport.exportedAt) || Date.parse(profileExport.exportedAt) > Date.parse(createdAt)) throw new TypeError("A3 profile/export origin cannot be after result code creation");
  if (containsForbiddenField(profileExport)) throw new TypeError("A3 export contains a prohibited field");

  const signals = profileExport.sections.assessmentDerived.lanes
    .flatMap((lane) => lane.projections.map((projection) => toSignal(lane.id, projection)))
    .sort(sortSignals);
  if (signals.length < 1 || signals.length > 64) throw new TypeError("Result code needs 1-64 eligible signals");
  const usedAssessments = new Set(signals.map((signal) => signal.sourceAssessmentId));
  const provenance = profileExport.provenance
    .filter((source) => usedAssessments.has(source.assessmentId))
    .map(toSource)
    .sort((a, b) => a.assessmentId.localeCompare(b.assessmentId));
  const sourceKeys = new Set(provenance.map((source) => `${source.assessmentId}:${source.measuredAt}`));
  if (signals.some((signal) => !sourceKeys.has(`${signal.sourceAssessmentId}:${signal.measuredAt}`))) throw new TypeError("Result code signal has no matching A3 provenance");

  const payload: Omit<RelationshipResultCodeV1, "integrity"> = {
    codeId: input.codeId,
    consent: { adultConfirmed: true, acknowledgedAt: input.consentAcknowledgedAt, ownerSelfExported: true, reflectionOnly: true },
    createdAt,
    expiresAt: new Date(Date.parse(createdAt) + ttlDays * MILLISECONDS_PER_DAY).toISOString(),
    origin: {
      exportSchema: profileExport.schema,
      exportSchemaVersion: profileExport.schemaVersion,
      exportedAt: profileExport.exportedAt,
      profileGeneratedAt: profileExport.source.generatedAt,
    },
    privacy: { analyticsPayload: "none", rawResponsesIncluded: false, resultIdIncluded: false, serverTransmission: "none" },
    provenance,
    schema: RELATIONSHIP_RESULT_CODE_SCHEMA,
    schemaVersion: RELATIONSHIP_RESULT_CODE_SCHEMA_VERSION,
    signals,
  };
  return { ...payload, integrity: integrityFor(payload) };
}

function sanitizeSource(value: unknown): RelationshipResultCodeSource | null {
  if (!isRecord(value) || !ALLOWED_ASSESSMENTS.has(String(value.assessmentId)) || !isIsoTimestamp(value.measuredAt)) return null;
  for (const key of ["instrumentVersion", "interpretationVersion", "scoringVersion"] as const) {
    if (typeof value[key] !== "string" || value[key].length === 0) return null;
  }
  return {
    assessmentId: String(value.assessmentId),
    instrumentVersion: String(value.instrumentVersion),
    interpretationVersion: String(value.interpretationVersion),
    measuredAt: String(value.measuredAt),
    scoringVersion: String(value.scoringVersion),
  };
}

function sanitizeSignal(value: unknown): RelationshipResultCodeSignal | null {
  if (!isRecord(value) || !LANES.has(String(value.lane)) || !["low", "medium", "high"].includes(String(value.confidenceBand)) || !EVIDENCE_TIERS.has(String(value.evidenceTier)) || !["current", "stale"].includes(String(value.freshness)) || !isIsoTimestamp(value.measuredAt)) return null;
  if (typeof value.constructId !== "string" || typeof value.sourceAssessmentId !== "string") return null;
  if (typeof value.value !== "number" || !Number.isFinite(value.value)) return null;
  assertAllowedSignal(value.sourceAssessmentId, value.constructId);
  let scale: { max: number; min: number } | undefined;
  if (value.scale !== undefined) {
    if (!isRecord(value.scale) || typeof value.scale.min !== "number" || typeof value.scale.max !== "number" || value.scale.min >= value.scale.max) return null;
    scale = { max: value.scale.max, min: value.scale.min };
    if (typeof value.value === "number" && (value.value < scale.min || value.value > scale.max)) return null;
  }
  return {
    confidenceBand: value.confidenceBand as PersonalProfileConfidenceBand,
    constructId: value.constructId,
    evidenceTier: value.evidenceTier as PersonalProfileProjection["evidenceTier"],
    freshness: value.freshness as PersonalProfileFreshness,
    lane: value.lane as PersonalProfileLaneId,
    measuredAt: value.measuredAt,
    scale,
    sourceAssessmentId: value.sourceAssessmentId,
    value: value.value,
  };
}

export function sanitizeRelationshipResultCode(value: unknown): RelationshipResultCodeV1 {
  if (!isRecord(value) || containsForbiddenField(value)) throw new TypeError("Invalid or restricted relationship result code");
  if (value.schema !== RELATIONSHIP_RESULT_CODE_SCHEMA || value.schemaVersion !== 1) throw new TypeError("Unsupported relationship result code schema");
  if (!CODE_ID_PATTERN.test(String(value.codeId)) || !isIsoTimestamp(value.createdAt) || !isIsoTimestamp(value.expiresAt)) throw new TypeError("Invalid result code identity or timestamps");
  const lifetime = Date.parse(value.expiresAt) - Date.parse(value.createdAt);
  if (lifetime < MILLISECONDS_PER_DAY || lifetime > RELATIONSHIP_RESULT_CODE_MAX_TTL_DAYS * MILLISECONDS_PER_DAY) throw new TypeError("Invalid result code lifetime");
  if (!isRecord(value.consent) || value.consent.adultConfirmed !== true || value.consent.ownerSelfExported !== true || value.consent.reflectionOnly !== true || !isIsoTimestamp(value.consent.acknowledgedAt) || Date.parse(value.consent.acknowledgedAt) > Date.parse(value.createdAt)) throw new TypeError("Invalid result code consent");
  if (!isRecord(value.privacy) || value.privacy.analyticsPayload !== "none" || value.privacy.rawResponsesIncluded !== false || value.privacy.resultIdIncluded !== false || value.privacy.serverTransmission !== "none") throw new TypeError("Invalid result code privacy contract");
  if (!isRecord(value.origin) || value.origin.exportSchema !== "oiyo.personal-profile-export" || value.origin.exportSchemaVersion !== 2 || !isIsoTimestamp(value.origin.exportedAt) || !isIsoTimestamp(value.origin.profileGeneratedAt)) throw new TypeError("Invalid A3 export origin");
  if (Date.parse(value.origin.profileGeneratedAt) > Date.parse(value.origin.exportedAt) || Date.parse(value.origin.exportedAt) > Date.parse(value.createdAt)) throw new TypeError("Invalid A3 export origin ordering");
  if (!Array.isArray(value.provenance) || !Array.isArray(value.signals) || value.signals.length < 1 || value.signals.length > 64) throw new TypeError("Invalid result code evidence collections");
  const provenance = value.provenance.map(sanitizeSource);
  const signals = value.signals.map(sanitizeSignal);
  if (provenance.some((item) => !item) || signals.some((item) => !item)) throw new TypeError("Invalid result code evidence");
  const safeProvenance = provenance as RelationshipResultCodeSource[];
  const safeSignals = signals as RelationshipResultCodeSignal[];
  if (safeProvenance.some((source) => Date.parse(source.measuredAt) > Date.parse(String(value.origin.profileGeneratedAt)))) throw new TypeError("Relationship provenance cannot follow the profile snapshot");
  const sourceKeys = new Set(safeProvenance.map((source) => `${source.assessmentId}:${source.measuredAt}`));
  if (sourceKeys.size !== safeProvenance.length) throw new TypeError("Duplicate relationship provenance");
  if (safeSignals.some((signal) => !sourceKeys.has(`${signal.sourceAssessmentId}:${signal.measuredAt}`))) throw new TypeError("Relationship signal is missing provenance");
  if (new Set(safeSignals.map((signal) => `${signal.lane}:${signal.constructId}:${signal.sourceAssessmentId}`)).size !== safeSignals.length) throw new TypeError("Duplicate relationship signal");
  const payload: Omit<RelationshipResultCodeV1, "integrity"> = {
    codeId: String(value.codeId),
    consent: { adultConfirmed: true, acknowledgedAt: String(value.consent.acknowledgedAt), ownerSelfExported: true, reflectionOnly: true },
    createdAt: String(value.createdAt),
    expiresAt: String(value.expiresAt),
    origin: { exportSchema: "oiyo.personal-profile-export", exportSchemaVersion: 2, exportedAt: String(value.origin.exportedAt), profileGeneratedAt: String(value.origin.profileGeneratedAt) },
    privacy: { analyticsPayload: "none", rawResponsesIncluded: false, resultIdIncluded: false, serverTransmission: "none" },
    provenance: safeProvenance.sort((a, b) => a.assessmentId.localeCompare(b.assessmentId)),
    schema: RELATIONSHIP_RESULT_CODE_SCHEMA,
    schemaVersion: RELATIONSHIP_RESULT_CODE_SCHEMA_VERSION,
    signals: safeSignals.sort(sortSignals),
  };
  if (!isRecord(value.integrity) || value.integrity.artifact !== "unsigned-self-asserted-local" || value.integrity.authenticity !== "not-provided" || value.integrity.hashAlgorithm !== "fnv1a-64" || value.integrity.purpose !== "integrity-and-error-detection-only" || !HASH_PATTERN.test(String(value.integrity.canonicalPayloadHash)) || !HASH_PATTERN.test(String(value.integrity.payloadFingerprint))) {
    throw new TypeError("Invalid unsigned local artifact integrity contract");
  }
  if (value.integrity.canonicalPayloadHash !== canonicalPayloadHash(payload) || value.integrity.payloadFingerprint !== payloadFingerprint(payload)) {
    throw new TypeError("Relationship result code integrity check failed; authenticity is not provided");
  }
  return { ...payload, integrity: integrityFor(payload) };
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new TypeError("Result code payload is not base64url");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function encodeRelationshipResultCode(value: RelationshipResultCodeV1): string {
  return `${RELATIONSHIP_RESULT_CODE_PREFIX}${encodeBase64Url(JSON.stringify(sanitizeRelationshipResultCode(value)))}`;
}

export function decodeRelationshipResultCode(value: string): RelationshipResultCodeV1 {
  if (!value.startsWith(RELATIONSHIP_RESULT_CODE_PREFIX)) throw new TypeError("Unknown relationship result code prefix");
  return sanitizeRelationshipResultCode(JSON.parse(decodeBase64Url(value.slice(RELATIONSHIP_RESULT_CODE_PREFIX.length))));
}

function compareValues(a: RelationshipResultCodeSignal, b: RelationshipResultCodeSignal): Pick<RelationshipComparisonItem, "kind"> {
  if (a.scale || b.scale) {
    if (!a.scale || !b.scale || a.scale.min !== b.scale.min || a.scale.max !== b.scale.max) return { kind: "different-scale" };
  }
  return Object.is(a.value, b.value) ? { kind: "exact" } : { kind: "different-value" };
}

function assertAcknowledgement(code: RelationshipResultCodeV1, acknowledgement: RelationshipComparisonAcknowledgement, now: string): void {
  if (acknowledgement.codeId !== code.codeId || acknowledgement.mayWithdraw !== true || acknowledgement.ownerPresent !== true || !isIsoTimestamp(acknowledgement.acknowledgedAt)) throw new TypeError(`Missing active owner acknowledgement for ${code.codeId}`);
  if (Date.parse(acknowledgement.acknowledgedAt) > Date.parse(now)) throw new TypeError("Comparison acknowledgement cannot be in the future");
  if (Date.parse(acknowledgement.acknowledgedAt) < Date.parse(code.createdAt)) throw new TypeError("Comparison acknowledgement must be current for this result code");
  if (Date.parse(now) >= Date.parse(code.expiresAt)) throw new TypeError(`Relationship result code expired: ${code.codeId}`);
}

export function compareRelationshipResultCodes(
  participantA: string | RelationshipResultCodeV1,
  participantB: string | RelationshipResultCodeV1,
  input: RelationshipComparisonInput,
): RelationshipComparisonReportV1 {
  const codeA = typeof participantA === "string" ? decodeRelationshipResultCode(participantA) : sanitizeRelationshipResultCode(participantA);
  const codeB = typeof participantB === "string" ? decodeRelationshipResultCode(participantB) : sanitizeRelationshipResultCode(participantB);
  const now = input.now ?? new Date().toISOString();
  if (!isIsoTimestamp(now)) throw new TypeError("Comparison time must be canonical ISO UTC");
  if (!(["couple", "family", "friend"] as string[]).includes(input.context)) throw new TypeError("Workplace, hiring, and unsupported contexts are prohibited");
  if (!isRecord(input.consent) || input.consent.analyticsPayload !== "none" || input.consent.localOnlyUnderstood !== true || input.consent.purpose !== "mutual-reflection" || input.consent.serverTransmission !== "none") throw new TypeError("Comparison requires the local-only mutual-reflection consent contract");
  if (codeA.codeId === codeB.codeId) throw new TypeError("Comparison requires two independently exported result codes");
  if (codeA.integrity.payloadFingerprint === codeB.integrity.payloadFingerprint) throw new TypeError("Comparison requires two distinct canonical profile payloads, not duplicated codes");
  if (!Array.isArray(input.revokedCodeIds) || input.revokedCodeIds.some((codeId) => !CODE_ID_PATTERN.test(codeId)) || new Set(input.revokedCodeIds).size !== input.revokedCodeIds.length) throw new TypeError("Comparison requires a valid active revocation set");
  if (input.revokedCodeIds.includes(codeA.codeId) || input.revokedCodeIds.includes(codeB.codeId)) throw new TypeError("A participant has withdrawn this code from the active comparison session");
  assertAcknowledgement(codeA, input.consent.participantA, now);
  assertAcknowledgement(codeB, input.consent.participantB, now);

  const bByConstruct = new Map(codeB.signals.map((signal) => [`${signal.lane}:${signal.constructId}`, signal]));
  const matchedB = new Set<string>();
  const shared: RelationshipComparisonItem[] = [];
  const differences: RelationshipComparisonItem[] = [];
  const questions: RelationshipComparisonReportV1["questions"] = [];
  const unmatchedA: string[] = [];
  for (const signalA of codeA.signals) {
    const key = `${signalA.lane}:${signalA.constructId}`;
    const signalB = bByConstruct.get(key);
    if (!signalB) { unmatchedA.push(signalA.constructId); continue; }
    matchedB.add(key);
    const comparison = compareValues(signalA, signalB);
    const item: RelationshipComparisonItem = {
      constructId: signalA.constructId,
      kind: comparison.kind,
      lane: signalA.lane,
      participantAValue: signalA.value,
      participantBValue: signalB.value,
    };
    (comparison.kind === "exact" ? shared : differences).push(item);
    questions.push({ constructId: signalA.constructId, lane: signalA.lane, prompt: LANE_PROMPTS[signalA.lane], promptId: `conversation.${signalA.lane}` });
  }
  const unmatchedB = codeB.signals.filter((signal) => !matchedB.has(`${signal.lane}:${signal.constructId}`)).map((signal) => signal.constructId);
  const participantSummary = (code: RelationshipResultCodeV1) => ({ codeId: code.codeId, origin: code.origin, provenance: code.provenance });
  return {
    comparedAt: now,
    consent: { bothOwnersAcknowledged: true, context: input.context, purpose: "mutual-reflection", withdrawalEndsComparison: true },
    differences,
    guardrails: { artifactAuthenticity: "not-provided", careerOrJobJudgment: "prohibited", compatibilityJudgment: "none", employmentOrHiringUse: "prohibited", healthOrPoliticalInference: "prohibited", minorUse: "prohibited", scoreAggregation: "none", successRate: "none" },
    participants: { A: participantSummary(codeA), B: participantSummary(codeB) },
    privacy: { analyticsPayload: "none", persistedByEngine: false, rawResponsesIncluded: false, serverTransmission: "none" },
    questions,
    schema: RELATIONSHIP_COMPARISON_SCHEMA,
    schemaVersion: RELATIONSHIP_COMPARISON_SCHEMA_VERSION,
    shared,
    unmatched: { A: unmatchedA, B: unmatchedB },
  };
}

export function withdrawRelationshipComparison(participant: RelationshipParticipant, codeId: string, activeRevokedCodeIds: readonly string[], withdrawnAt = new Date().toISOString()): RelationshipWithdrawalReceipt {
  if (!(["A", "B"] as string[]).includes(participant) || !CODE_ID_PATTERN.test(codeId) || !isIsoTimestamp(withdrawnAt)) throw new TypeError("Invalid local withdrawal request");
  if (!Array.isArray(activeRevokedCodeIds) || activeRevokedCodeIds.some((item) => !CODE_ID_PATTERN.test(item))) throw new TypeError("Invalid active revocation set");
  const revokedCodeIds = [...new Set([...activeRevokedCodeIds, codeId])].sort();
  return {
    action: "revoke-for-active-session-and-delete-local-code-and-derived-report",
    codeId,
    participant,
    propagation: "not-available-for-exported-copies",
    remoteRevocation: "not-applicable-no-server-copy",
    deletionStatus: "caller-action-required",
    revokedCodeIds,
    status: "revoked-for-active-session",
    withdrawnAt,
  };
}

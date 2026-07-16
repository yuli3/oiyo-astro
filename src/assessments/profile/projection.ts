import type {
  AssessmentPlugin,
  CanonicalAssessmentResult,
  EvidenceTier,
  OntologySignal,
} from "../core";
import { getAssessmentPlugin } from "../core";
import {
  PERSONAL_PROFILE_LANES,
  PERSONAL_PROFILE_LOW_CONFIDENCE_THRESHOLD,
  PERSONAL_PROFILE_SNAPSHOT_SCHEMA,
  PERSONAL_PROFILE_SNAPSHOT_SCHEMA_VERSION,
  type PersonalProfileConfidenceBand,
  type PersonalProfileInstrumentStatus,
  type PersonalProfileLaneId,
  type PersonalProfileMissingReason,
  type PersonalProfileProjection,
  type PersonalProfileSnapshot,
} from "./schema";

export interface PersonalProfileInstrumentSpec {
  assessmentId: string;
  lane: PersonalProfileLaneId;
}

export const PERSONAL_PROFILE_V1_INSTRUMENTS: readonly PersonalProfileInstrumentSpec[] = [
  { assessmentId: "big5", lane: "trait" },
  { assessmentId: "mbti", lane: "preference" },
  { assessmentId: "riasec", lane: "interest" },
  { assessmentId: "career-values", lane: "chosen-value" },
  { assessmentId: "adult-attachment", lane: "reflective-signal" },
];

export interface PersonalProfileProjectionOptions {
  instruments?: readonly PersonalProfileInstrumentSpec[];
  lookup?: (assessmentId: string) => AssessmentPlugin | undefined;
  now?: Date;
}

const EVIDENCE_TIERS = new Set<EvidenceTier>([
  "validated-scale",
  "research-inspired",
  "reflective-framework",
  "symbolic-tradition",
  "educational",
  "entertainment",
]);
const ASSESSMENT_KINDS = new Set([
  "psychometric",
  "mystic",
  "preference",
  "skill",
  "wellness",
  "other",
]);
const REQUIRED_NORMALIZED_SCORE_IDS: Readonly<Record<string, readonly string[]>> = {
  "adult-attachment": ["anxiety", "avoidance"],
  big5: ["O", "C", "E", "A", "N"],
  "career-values": ["security", "achievement", "autonomy", "service", "creativity", "status"],
  mbti: ["EI", "SN", "TF", "JP"],
  riasec: ["R", "I", "A", "S", "E", "C"],
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function isFiniteRecord(value: unknown, allowEmpty = false): value is Record<string, number> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) &&
    (allowEmpty || Object.keys(value as Record<string, unknown>).length > 0) &&
    Object.values(value as Record<string, unknown>).every(
      (item) => typeof item === "number" && Number.isFinite(item),
    );
}

function isCanonicalProjectionInput(value: unknown): value is CanonicalAssessmentResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as Partial<CanonicalAssessmentResult>;
  const normalized = result.scores?.normalized;
  const requiredScores = isNonEmptyString(result.assessmentId)
    ? REQUIRED_NORMALIZED_SCORE_IDS[result.assessmentId]
    : undefined;
  return (
    result.schema === "oiyo.assessment-result" &&
    result.schemaVersion === 2 &&
    isNonEmptyString(result.assessmentId) &&
    isNonEmptyString(result.resultId) &&
    isIsoTimestamp(result.completedAt) &&
    EVIDENCE_TIERS.has(result.evidenceTier as EvidenceTier) &&
    ASSESSMENT_KINDS.has(result.kind as string) &&
    Boolean(result.versions) &&
    isNonEmptyString(result.versions?.instrument) &&
    isNonEmptyString(result.versions?.interpretation) &&
    isNonEmptyString(result.versions?.scoring) &&
    Boolean(result.scores) &&
    isFiniteRecord(normalized) &&
    (!requiredScores || requiredScores.every((id) => Number.isFinite(normalized?.[id]))) &&
    isFiniteRecord(result.scores?.raw, true)
  );
}

/**
 * Plugins only need scored evidence and version metadata to create ontology
 * signals. Build an explicit allowlisted view so a buggy plugin cannot echo
 * responses, classifications, legacy payloads, source paths, or extra fields
 * into a profile projection.
 */
function projectionInput(result: CanonicalAssessmentResult): CanonicalAssessmentResult {
  return {
    assessmentId: result.assessmentId,
    classifications: [],
    completedAt: result.completedAt,
    evidenceTier: result.evidenceTier,
    kind: result.kind,
    quality: { completionRate: result.quality?.completionRate ?? 0, responseWarnings: [] },
    resultId: result.resultId,
    schema: "oiyo.assessment-result",
    schemaVersion: 2,
    scores: {
      normalized: { ...result.scores.normalized },
      raw: { ...result.scores.raw },
    },
    versions: { ...result.versions },
  };
}

function confidenceBand(confidence: number): PersonalProfileConfidenceBand {
  if (confidence < PERSONAL_PROFILE_LOW_CONFIDENCE_THRESHOLD) return "low";
  return confidence < 0.7 ? "medium" : "high";
}

function isUsableSignal(signal: unknown, result: CanonicalAssessmentResult): signal is OntologySignal {
  if (!signal || typeof signal !== "object" || Array.isArray(signal)) return false;
  const candidate = signal as OntologySignal;
  const valueIsUsable =
    (typeof candidate.value === "number" && Number.isFinite(candidate.value)) ||
    (typeof candidate.value === "string" && candidate.value.length > 0) ||
    (Array.isArray(candidate.value) && candidate.value.length > 0 && candidate.value.every(isNonEmptyString));
  const scaleIsUsable = !candidate.scale || (
    Number.isFinite(candidate.scale.min) &&
    Number.isFinite(candidate.scale.max) &&
    candidate.scale.min < candidate.scale.max &&
    (typeof candidate.value !== "number" ||
      (candidate.value >= candidate.scale.min && candidate.value <= candidate.scale.max))
  );
  return (
    Number.isFinite(candidate.confidence) &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 1 &&
    isNonEmptyString(candidate.constructId) &&
    EVIDENCE_TIERS.has(candidate.evidenceTier) &&
    isIsoTimestamp(candidate.observedAt) &&
    Boolean(candidate.provenance) &&
    candidate.provenance.instrumentVersion === result.versions.instrument &&
    candidate.provenance.resultId === result.resultId &&
    candidate.provenance.scoringVersion === result.versions.scoring &&
    candidate.sourceAssessmentId === result.assessmentId &&
    (!candidate.expiresAt || isIsoTimestamp(candidate.expiresAt)) &&
    valueIsUsable &&
    scaleIsUsable
  );
}

function projectSignal(
  signal: OntologySignal,
  result: CanonicalAssessmentResult,
  nowMs: number,
): PersonalProfileProjection {
  return {
    confidence: signal.confidence,
    confidenceBand: confidenceBand(signal.confidence),
    constructId: signal.constructId,
    evidenceTier: signal.evidenceTier,
    expiresAt: signal.expiresAt,
    freshness: signal.expiresAt && Date.parse(signal.expiresAt) <= nowMs ? "stale" : "current",
    measuredAt: signal.observedAt,
    provenance: {
      assessmentId: result.assessmentId,
      assessmentResultSchema: result.schema,
      assessmentResultSchemaVersion: result.schemaVersion,
      instrumentVersion: signal.provenance.instrumentVersion,
      interpretationVersion: result.versions.interpretation,
      resultId: signal.provenance.resultId,
      scoringVersion: signal.provenance.scoringVersion,
    },
    scale: signal.scale,
    sourceAssessmentId: signal.sourceAssessmentId,
    value: signal.value,
  };
}

function missingStatus(
  spec: PersonalProfileInstrumentSpec,
  missingReason: PersonalProfileMissingReason,
): PersonalProfileInstrumentStatus {
  return {
    assessmentId: spec.assessmentId,
    availability: "missing",
    hasLowConfidence: false,
    hasStale: false,
    lane: spec.lane,
    missingReason,
    projectionCount: 0,
  };
}

/**
 * Projects independent assessment results into five evidence lanes.
 *
 * This adapter deliberately does not read `responses`, classifications, or
 * legacy payloads. It never averages, sums, or otherwise combines values from
 * separate instruments. A stale projection remains visible and labelled so a
 * consumer can offer a retake instead of silently replacing evidence.
 */
export function projectPersonalProfileSnapshot(
  results: readonly unknown[],
  options: PersonalProfileProjectionOptions = {},
): PersonalProfileSnapshot {
  const instruments = options.instruments ?? PERSONAL_PROFILE_V1_INSTRUMENTS;
  const lookup = options.lookup ?? getAssessmentPlugin;
  const now = options.now ?? new Date();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError("PersonalProfileSnapshot now must be a valid Date");
  }
  const seenInstrumentIds = new Set<string>();
  for (const spec of instruments) {
    if (
      !spec ||
      !isNonEmptyString(spec.assessmentId) ||
      !PERSONAL_PROFILE_LANES.includes(spec.lane) ||
      seenInstrumentIds.has(spec.assessmentId)
    ) {
      throw new TypeError("PersonalProfileSnapshot instruments must have unique known assessment lanes");
    }
    seenInstrumentIds.add(spec.assessmentId);
  }
  const nowIso = now.toISOString();
  const latestByAssessment = new Map<string, CanonicalAssessmentResult>();
  const invalidAssessmentIds = new Set<string>();

  for (const candidate of results) {
    if (!isCanonicalProjectionInput(candidate)) {
      if (
        candidate &&
        typeof candidate === "object" &&
        !Array.isArray(candidate) &&
        isNonEmptyString((candidate as { assessmentId?: unknown }).assessmentId)
      ) {
        invalidAssessmentIds.add((candidate as { assessmentId: string }).assessmentId);
      }
      continue;
    }
    const result = candidate;
    const current = latestByAssessment.get(result.assessmentId);
    if (!current || result.completedAt > current.completedAt) {
      latestByAssessment.set(result.assessmentId, result);
    }
  }

  const laneProjections = new Map<PersonalProfileLaneId, PersonalProfileProjection[]>(
    PERSONAL_PROFILE_LANES.map((lane) => [lane, []]),
  );
  const statuses: PersonalProfileInstrumentStatus[] = [];

  for (const spec of instruments) {
    const result = latestByAssessment.get(spec.assessmentId);
    if (!result) {
      statuses.push(missingStatus(
        spec,
        invalidAssessmentIds.has(spec.assessmentId) ? "invalid-result" : "no-result",
      ));
      continue;
    }

    const plugin = lookup(spec.assessmentId);
    if (!plugin) {
      statuses.push(missingStatus(spec, "unknown-instrument"));
      continue;
    }

    let signals: OntologySignal[];
    try {
      const projected = plugin.ontology.toSignals(projectionInput(result));
      signals = Array.isArray(projected)
        ? projected.filter((signal) => isUsableSignal(signal, result))
        : [];
    } catch {
      statuses.push(missingStatus(spec, "projection-error"));
      continue;
    }

    if (signals.length === 0) {
      statuses.push(missingStatus(spec, "no-signals"));
      continue;
    }

    const projections = signals
      .map((signal) => projectSignal(signal, result, now.getTime()))
      .sort((a, b) => a.constructId.localeCompare(b.constructId));
    laneProjections.get(spec.lane)?.push(...projections);
    statuses.push({
      assessmentId: spec.assessmentId,
      availability: "present",
      hasLowConfidence: projections.some((item) => item.confidenceBand === "low"),
      hasStale: projections.some((item) => item.freshness === "stale"),
      lane: spec.lane,
      measuredAt: result.completedAt,
      projectionCount: projections.length,
    });
  }

  return {
    generatedAt: nowIso,
    instruments: statuses,
    lanes: PERSONAL_PROFILE_LANES.map((id) => ({
      id,
      projections: laneProjections.get(id) ?? [],
    })),
    schema: PERSONAL_PROFILE_SNAPSHOT_SCHEMA,
    schemaVersion: PERSONAL_PROFILE_SNAPSHOT_SCHEMA_VERSION,
  };
}

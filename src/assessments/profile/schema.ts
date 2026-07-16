import type { EvidenceTier } from "../core";

export const PERSONAL_PROFILE_SNAPSHOT_SCHEMA = "oiyo.personal-profile-snapshot" as const;
export const PERSONAL_PROFILE_SNAPSHOT_SCHEMA_VERSION = 1 as const;
export const PERSONAL_PROFILE_LOW_CONFIDENCE_THRESHOLD = 0.4 as const;

export const PERSONAL_PROFILE_LANES = [
  "trait",
  "preference",
  "interest",
  "chosen-value",
  "reflective-signal",
] as const;

export type PersonalProfileLaneId = (typeof PERSONAL_PROFILE_LANES)[number];
export type PersonalProfileAvailability = "missing" | "present";
export type PersonalProfileFreshness = "current" | "stale";
export type PersonalProfileConfidenceBand = "low" | "medium" | "high";
export type PersonalProfileMissingReason =
  | "no-result"
  | "invalid-result"
  | "unknown-instrument"
  | "projection-error"
  | "no-signals";

export interface PersonalProfileProvenance {
  assessmentId: string;
  assessmentResultSchema: "oiyo.assessment-result";
  assessmentResultSchemaVersion: 2;
  instrumentVersion: string;
  interpretationVersion: string;
  resultId: string;
  scoringVersion: string;
}

export interface PersonalProfileProjection {
  confidence: number;
  confidenceBand: PersonalProfileConfidenceBand;
  constructId: string;
  evidenceTier: EvidenceTier;
  expiresAt?: string;
  freshness: PersonalProfileFreshness;
  measuredAt: string;
  provenance: PersonalProfileProvenance;
  scale?: { max: number; min: number };
  sourceAssessmentId: string;
  value: number | string | string[];
}

export interface PersonalProfileInstrumentStatus {
  assessmentId: string;
  availability: PersonalProfileAvailability;
  hasLowConfidence: boolean;
  hasStale: boolean;
  lane: PersonalProfileLaneId;
  measuredAt?: string;
  missingReason?: PersonalProfileMissingReason;
  projectionCount: number;
}

export interface PersonalProfileLane {
  id: PersonalProfileLaneId;
  projections: PersonalProfileProjection[];
}

export interface PersonalProfileSnapshot {
  generatedAt: string;
  instruments: PersonalProfileInstrumentStatus[];
  lanes: PersonalProfileLane[];
  schema: typeof PERSONAL_PROFILE_SNAPSHOT_SCHEMA;
  schemaVersion: typeof PERSONAL_PROFILE_SNAPSHOT_SCHEMA_VERSION;
}

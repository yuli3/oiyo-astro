import {
  PERSONAL_PROFILE_LANES,
  PERSONAL_PROFILE_LOW_CONFIDENCE_THRESHOLD,
  PERSONAL_PROFILE_SNAPSHOT_SCHEMA,
  PERSONAL_PROFILE_SNAPSHOT_SCHEMA_VERSION,
  type PersonalProfileInstrumentStatus,
  type PersonalProfileLane,
  type PersonalProfileLaneId,
  type PersonalProfileProjection,
  type PersonalProfileSnapshot,
} from "./schema";

export const PERSONAL_PROFILE_EXPORT_SCHEMA = "oiyo.personal-profile-export" as const;
export const PERSONAL_PROFILE_EXPORT_SCHEMA_VERSION = 2 as const;

export type PersonalProfileExportFormat = "json" | "markdown" | "soul" | "obsidian";

export interface PersonalProfileExportSource {
  assessmentId: string;
  instrumentVersion: string;
  interpretationVersion: string;
  measuredAt: string;
  resultId: string;
  scoringVersion: string;
}

export interface PersonalProfileExportV2 {
  exportedAt: string;
  originPolicy: {
    assessmentDerived: "measured-or-reflective-result";
    userAuthored: "none-in-v2";
  };
  privacy: {
    rawResponsesIncluded: false;
    serverTransmission: "none";
  };
  provenance: PersonalProfileExportSource[];
  schema: typeof PERSONAL_PROFILE_EXPORT_SCHEMA;
  schemaVersion: typeof PERSONAL_PROFILE_EXPORT_SCHEMA_VERSION;
  sections: {
    assessmentDerived: PersonalProfileSnapshot;
    userAuthored: [];
  };
  source: {
    generatedAt: string;
    schema: typeof PERSONAL_PROFILE_SNAPSHOT_SCHEMA;
    schemaVersion: typeof PERSONAL_PROFILE_SNAPSHOT_SCHEMA_VERSION;
  };
}

export interface PersonalProfileExportV1 {
  exportedAt: string;
  profile: PersonalProfileSnapshot;
  schema: typeof PERSONAL_PROFILE_EXPORT_SCHEMA;
  schemaVersion: 1;
}

export interface PersonalProfileObsidianFile {
  content: string;
  path: string;
}

export interface PersonalProfileObsidianBundle {
  files: PersonalProfileObsidianFile[];
  root: "OIYO Personal Profile";
}

export interface PersonalProfileDeliveryAdapter {
  copyText?: (text: string) => boolean | Promise<boolean>;
  createObjectUrl?: (blob: Blob) => string;
  download?: (objectUrl: string, filename: string) => boolean | Promise<boolean>;
  revokeObjectUrl?: (objectUrl: string) => void;
  saveFiles?: (
    root: string,
    files: readonly PersonalProfileObsidianFile[],
  ) => boolean | Promise<boolean>;
}

export interface PersonalProfileDeliveryResult {
  fallbackUsed: boolean;
  filename: string;
  format: PersonalProfileExportFormat;
  outcome: "copied" | "copied-index" | "downloaded" | "saved-files";
}

const FORBIDDEN_RAW_KEYS = new Set(["answers", "classifications", "legacy", "raw", "responses"]);
const EVIDENCE_TIERS = new Set([
  "validated-scale",
  "research-inspired",
  "reflective-framework",
  "symbolic-tradition",
  "educational",
  "entertainment",
]);
const MISSING_REASONS = new Set(["no-result", "invalid-result", "unknown-instrument", "projection-error", "no-signals"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function hasForbiddenRawKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasForbiddenRawKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, nested]) => FORBIDDEN_RAW_KEYS.has(key) || hasForbiddenRawKey(nested));
}

function sanitizeProjection(value: unknown): PersonalProfileProjection | null {
  if (!isRecord(value)) return null;
  if (
    !isNonEmptyString(value.constructId) ||
    !isNonEmptyString(value.sourceAssessmentId) ||
    typeof value.confidence !== "number" || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1 ||
    !["low", "medium", "high"].includes(String(value.confidenceBand)) ||
    !["current", "stale"].includes(String(value.freshness)) ||
    !EVIDENCE_TIERS.has(String(value.evidenceTier)) ||
    !isIsoTimestamp(value.measuredAt) ||
    !isRecord(value.provenance)
  ) return null;
  const provenance = value.provenance;
  if (
    !isNonEmptyString(provenance.assessmentId) ||
    provenance.assessmentResultSchema !== "oiyo.assessment-result" ||
    provenance.assessmentResultSchemaVersion !== 2 ||
    !isNonEmptyString(provenance.instrumentVersion) ||
    !isNonEmptyString(provenance.interpretationVersion) ||
    !isNonEmptyString(provenance.resultId) ||
    !isNonEmptyString(provenance.scoringVersion)
  ) return null;
  if (value.sourceAssessmentId !== provenance.assessmentId) return null;
  if (typeof value.value !== "number" && typeof value.value !== "string" && !Array.isArray(value.value)) return null;
  if (typeof value.value === "number" && !Number.isFinite(value.value)) return null;
  if (typeof value.value === "string" && !value.value.trim()) return null;
  if (Array.isArray(value.value) && (value.value.length === 0 || !value.value.every(isNonEmptyString))) return null;
  if (value.expiresAt !== undefined && !isIsoTimestamp(value.expiresAt)) return null;
  let scale: { min: number; max: number } | undefined;
  if (value.scale !== undefined) {
    if (
      !isRecord(value.scale) ||
      typeof value.scale.min !== "number" || !Number.isFinite(value.scale.min) ||
      typeof value.scale.max !== "number" || !Number.isFinite(value.scale.max) ||
      value.scale.min >= value.scale.max
    ) return null;
    scale = { min: value.scale.min, max: value.scale.max };
    if (typeof value.value === "number" && (value.value < scale.min || value.value > scale.max)) return null;
  }
  return {
    confidence: value.confidence,
    confidenceBand: value.confidenceBand as PersonalProfileProjection["confidenceBand"],
    constructId: value.constructId,
    evidenceTier: value.evidenceTier as PersonalProfileProjection["evidenceTier"],
    expiresAt: value.expiresAt as string | undefined,
    freshness: value.freshness as PersonalProfileProjection["freshness"],
    measuredAt: value.measuredAt,
    provenance: {
      assessmentId: provenance.assessmentId,
      assessmentResultSchema: "oiyo.assessment-result",
      assessmentResultSchemaVersion: 2,
      instrumentVersion: provenance.instrumentVersion,
      interpretationVersion: provenance.interpretationVersion,
      resultId: provenance.resultId,
      scoringVersion: provenance.scoringVersion,
    },
    scale,
    sourceAssessmentId: value.sourceAssessmentId,
    value: value.value as PersonalProfileProjection["value"],
  };
}

function sanitizeInstrument(value: unknown): PersonalProfileInstrumentStatus | null {
  if (!isRecord(value)) return null;
  if (
    !isNonEmptyString(value.assessmentId) ||
    !["missing", "present"].includes(String(value.availability)) ||
    typeof value.hasLowConfidence !== "boolean" ||
    typeof value.hasStale !== "boolean" ||
    !PERSONAL_PROFILE_LANES.includes(value.lane as PersonalProfileLaneId) ||
    typeof value.projectionCount !== "number" || !Number.isInteger(value.projectionCount) || value.projectionCount < 0
  ) return null;
  if (value.missingReason !== undefined && !MISSING_REASONS.has(String(value.missingReason))) return null;
  return {
    assessmentId: value.assessmentId,
    availability: value.availability as PersonalProfileInstrumentStatus["availability"],
    hasLowConfidence: value.hasLowConfidence,
    hasStale: value.hasStale,
    lane: value.lane as PersonalProfileLaneId,
    measuredAt: isIsoTimestamp(value.measuredAt) ? value.measuredAt : undefined,
    missingReason: typeof value.missingReason === "string"
      ? value.missingReason as PersonalProfileInstrumentStatus["missingReason"]
      : undefined,
    projectionCount: value.projectionCount,
  };
}

export function sanitizePersonalProfileSnapshot(value: unknown): PersonalProfileSnapshot {
  if (!isRecord(value) || value.schema !== PERSONAL_PROFILE_SNAPSHOT_SCHEMA || value.schemaVersion !== 1 || !isIsoTimestamp(value.generatedAt)) {
    throw new TypeError("Invalid PersonalProfileSnapshot v1");
  }
  if (!Array.isArray(value.instruments) || !Array.isArray(value.lanes)) throw new TypeError("Invalid PersonalProfileSnapshot collections");
  const instruments = value.instruments.map(sanitizeInstrument);
  if (instruments.some((item) => !item)) throw new TypeError("Invalid PersonalProfileSnapshot instrument status");
  const lanes: PersonalProfileLane[] = value.lanes.map((lane) => {
    if (!isRecord(lane) || !PERSONAL_PROFILE_LANES.includes(lane.id as PersonalProfileLaneId) || !Array.isArray(lane.projections)) {
      throw new TypeError("Invalid PersonalProfileSnapshot lane");
    }
    const projections = lane.projections.map(sanitizeProjection);
    if (projections.some((item) => !item)) throw new TypeError("Invalid PersonalProfileSnapshot projection");
    return { id: lane.id as PersonalProfileLaneId, projections: projections as PersonalProfileProjection[] };
  });
  if (lanes.length !== PERSONAL_PROFILE_LANES.length || new Set(lanes.map((lane) => lane.id)).size !== PERSONAL_PROFILE_LANES.length) {
    throw new TypeError("PersonalProfileSnapshot must contain each v1 lane exactly once");
  }
  const safeInstruments = instruments as PersonalProfileInstrumentStatus[];
  if (new Set(safeInstruments.map((item) => item.assessmentId)).size !== safeInstruments.length) {
    throw new TypeError("PersonalProfileSnapshot instrument statuses must be unique");
  }
  for (const instrument of safeInstruments) {
    const projections = (lanes.find((lane) => lane.id === instrument.lane)?.projections ?? [])
      .filter((projection) => projection.sourceAssessmentId === instrument.assessmentId);
    const expectedLow = projections.some((projection) => projection.confidence < PERSONAL_PROFILE_LOW_CONFIDENCE_THRESHOLD);
    const expectedStale = projections.some((projection) => projection.freshness === "stale");
    if (
      instrument.projectionCount !== projections.length ||
      instrument.hasLowConfidence !== expectedLow ||
      instrument.hasStale !== expectedStale ||
      (instrument.availability === "present" && (!isIsoTimestamp(instrument.measuredAt) || projections.length === 0)) ||
      (instrument.availability === "present" && Boolean(instrument.missingReason)) ||
      (instrument.availability === "missing" && (projections.length !== 0 || !instrument.missingReason || Boolean(instrument.measuredAt))) ||
      projections.some((projection) => projection.measuredAt !== instrument.measuredAt)
    ) throw new TypeError(`PersonalProfileSnapshot status/projection mismatch: ${instrument.assessmentId}`);
  }
  for (const lane of lanes) {
    for (const projection of lane.projections) {
      const status = safeInstruments.find((item) => item.assessmentId === projection.sourceAssessmentId && item.lane === lane.id);
      if (!status || status.availability !== "present") throw new TypeError(`PersonalProfileSnapshot projection has no present source: ${projection.sourceAssessmentId}`);
      const expectedBand = projection.confidence < PERSONAL_PROFILE_LOW_CONFIDENCE_THRESHOLD ? "low" : projection.confidence < 0.7 ? "medium" : "high";
      const expectedFreshness = projection.expiresAt && Date.parse(projection.expiresAt) <= Date.parse(value.generatedAt) ? "stale" : "current";
      if (projection.confidenceBand !== expectedBand || projection.freshness !== expectedFreshness) {
        throw new TypeError(`PersonalProfileSnapshot derived state mismatch: ${projection.constructId}`);
      }
    }
  }
  return {
    generatedAt: value.generatedAt,
    instruments: safeInstruments,
    lanes: PERSONAL_PROFILE_LANES.map((id) => lanes.find((lane) => lane.id === id)!),
    schema: PERSONAL_PROFILE_SNAPSHOT_SCHEMA,
    schemaVersion: PERSONAL_PROFILE_SNAPSHOT_SCHEMA_VERSION,
  };
}

function provenanceFrom(snapshot: PersonalProfileSnapshot): PersonalProfileExportSource[] {
  const sources = new Map<string, PersonalProfileExportSource>();
  for (const projection of snapshot.lanes.flatMap((lane) => lane.projections)) {
    const key = `${projection.provenance.assessmentId}:${projection.provenance.resultId}`;
    sources.set(key, {
      assessmentId: projection.provenance.assessmentId,
      instrumentVersion: projection.provenance.instrumentVersion,
      interpretationVersion: projection.provenance.interpretationVersion,
      measuredAt: projection.measuredAt,
      resultId: projection.provenance.resultId,
      scoringVersion: projection.provenance.scoringVersion,
    });
  }
  return [...sources.values()].sort((a, b) => a.assessmentId.localeCompare(b.assessmentId));
}

export function buildPersonalProfileExportV2(snapshot: unknown, exportedAt = new Date().toISOString()): PersonalProfileExportV2 {
  if (!isIsoTimestamp(exportedAt)) throw new TypeError("Personal profile export time must be an ISO timestamp");
  const safeSnapshot = sanitizePersonalProfileSnapshot(snapshot);
  return {
    exportedAt,
    originPolicy: { assessmentDerived: "measured-or-reflective-result", userAuthored: "none-in-v2" },
    privacy: { rawResponsesIncluded: false, serverTransmission: "none" },
    provenance: provenanceFrom(safeSnapshot),
    schema: PERSONAL_PROFILE_EXPORT_SCHEMA,
    schemaVersion: PERSONAL_PROFILE_EXPORT_SCHEMA_VERSION,
    sections: { assessmentDerived: safeSnapshot, userAuthored: [] },
    source: { generatedAt: safeSnapshot.generatedAt, schema: safeSnapshot.schema, schemaVersion: safeSnapshot.schemaVersion },
  };
}

function migrateV1(value: PersonalProfileExportV1): PersonalProfileExportV2 {
  return buildPersonalProfileExportV2(value.profile, value.exportedAt);
}

export function parsePersonalProfileExportJson(json: string): PersonalProfileExportV2 {
  const value: unknown = JSON.parse(json);
  if (!isRecord(value) || value.schema !== PERSONAL_PROFILE_EXPORT_SCHEMA) throw new TypeError("Unknown personal profile export schema");
  if (hasForbiddenRawKey(value)) throw new TypeError("Personal profile export contains forbidden raw-response fields");
  if (value.schemaVersion === 1 && isRecord(value.profile)) return migrateV1(value as unknown as PersonalProfileExportV1);
  if (value.schemaVersion !== 2 || !isRecord(value.sections)) throw new TypeError("Unsupported personal profile export version");
  if (
    !Array.isArray(value.sections.userAuthored) || value.sections.userAuthored.length !== 0 ||
    !isRecord(value.originPolicy) ||
    value.originPolicy.assessmentDerived !== "measured-or-reflective-result" ||
    value.originPolicy.userAuthored !== "none-in-v2"
  ) throw new TypeError("Invalid personal profile export origin contract");
  const rebuilt = buildPersonalProfileExportV2(value.sections.assessmentDerived, String(value.exportedAt));
  if (!isRecord(value.privacy) || value.privacy.rawResponsesIncluded !== false || value.privacy.serverTransmission !== "none") {
    throw new TypeError("Invalid personal profile export privacy contract");
  }
  return rebuilt;
}

export function serializePersonalProfileExportJson(data: PersonalProfileExportV2): string {
  return JSON.stringify(parsePersonalProfileExportJson(JSON.stringify(data)), null, 2);
}

function renderValue(value: PersonalProfileProjection["value"]): string {
  return markdownText(Array.isArray(value) ? value.join(", ") : String(value));
}

function markdownText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\r\n\u2028\u2029]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/([\\`*_[\]{}()#+!|<>])/g, "\\$1");
}

function laneMarkdown(lane: PersonalProfileLane): string {
  if (lane.projections.length === 0) return "_No evidence recorded._";
  return lane.projections.map((item) =>
    `- **${markdownText(item.constructId)}**: ${renderValue(item.value)} · ${item.confidenceBand} confidence · ${item.freshness} · measured ${item.measuredAt.slice(0, 10)}\n  - source: ${markdownText(item.provenance.assessmentId)} / ${markdownText(item.provenance.instrumentVersion)} / ${markdownText(item.provenance.scoringVersion)}`,
  ).join("\n");
}

export function serializePersonalProfileExportMarkdown(data: PersonalProfileExportV2): string {
  const safe = parsePersonalProfileExportJson(JSON.stringify(data));
  return `---\nschema: ${safe.schema}\nschemaVersion: ${safe.schemaVersion}\nsourceSchema: ${safe.source.schema}\nsourceSchemaVersion: ${safe.source.schemaVersion}\nexportedAt: ${safe.exportedAt}\nrawResponsesIncluded: false\n---\n\n# OIYO Personal Profile\n\n> Assessment-derived evidence only. No user-authored claims are included in v2. Raw item responses are excluded.\n\n${safe.sections.assessmentDerived.lanes.map((lane) => `## ${lane.id}\n\n${laneMarkdown(lane)}`).join("\n\n")}\n`;
}

export function serializePersonalProfileExportSoul(data: PersonalProfileExportV2): string {
  const safe = parsePersonalProfileExportJson(JSON.stringify(data));
  return `# SOUL.md\n\n> Schema ${safe.schema} v${safe.schemaVersion}, exported ${safe.exportedAt}.\n> This file contains assessment-derived, point-in-time evidence—not fixed identity or user-authored instructions. Ask before assuming.\n> Raw item responses are excluded. Stale or low-confidence evidence must be treated cautiously.\n\n## Evidence lanes\n\n${safe.sections.assessmentDerived.lanes.map((lane) => `### ${lane.id}\n\n${laneMarkdown(lane)}`).join("\n\n")}\n\n## Provenance\n\n${safe.provenance.map((source) => `- ${markdownText(source.assessmentId)}: ${markdownText(source.instrumentVersion)}; scoring ${markdownText(source.scoringVersion)}; measured ${source.measuredAt}`).join("\n") || "- No assessment sources recorded."}\n`;
}

export function serializePersonalProfileExportObsidian(data: PersonalProfileExportV2): PersonalProfileObsidianBundle {
  const safe = parsePersonalProfileExportJson(JSON.stringify(data));
  const laneFiles = safe.sections.assessmentDerived.lanes.map((lane) => ({
    content: `---\ntype: oiyo-profile-lane\nlane: ${lane.id}\nschemaVersion: ${safe.schemaVersion}\n---\n\n# ${lane.id}\n\n[[OIYO Personal Profile|Back to profile]]\n\n${laneMarkdown(lane)}\n`,
    path: `lanes/${lane.id}.md`,
  }));
  const index = `---\ntype: oiyo-personal-profile\nschema: ${safe.schema}\nschemaVersion: ${safe.schemaVersion}\nexportedAt: ${safe.exportedAt}\n---\n\n# OIYO Personal Profile\n\nRaw responses are excluded. Evidence is assessment-derived, not user-authored.\n\n${safe.sections.assessmentDerived.lanes.map((lane) => `- [[lanes/${lane.id}|${lane.id}]]`).join("\n")}\n\n- [[_data/profile.json|Machine-readable profile data]]\n`;
  return {
    files: [
      { content: index, path: "OIYO Personal Profile.md" },
      ...laneFiles,
      { content: serializePersonalProfileExportJson(safe), path: "_data/profile.json" },
    ],
    root: "OIYO Personal Profile",
  };
}

export const PERSONAL_PROFILE_EXPORT_FILENAMES: Record<PersonalProfileExportFormat, string> = {
  json: "oiyo-personal-profile-v2.json",
  markdown: "oiyo-personal-profile-v2.md",
  obsidian: "oiyo-personal-profile-obsidian-v2",
  soul: "SOUL.md",
};

const PERSONAL_PROFILE_EXPORT_MIME: Record<Exclude<PersonalProfileExportFormat, "obsidian">, string> = {
  json: "application/json;charset=utf-8",
  markdown: "text/markdown;charset=utf-8",
  soul: "text/markdown;charset=utf-8",
};

function serializeTextFormat(
  format: Exclude<PersonalProfileExportFormat, "obsidian">,
  data: PersonalProfileExportV2,
): string {
  if (format === "json") return serializePersonalProfileExportJson(data);
  if (format === "markdown") return serializePersonalProfileExportMarkdown(data);
  return serializePersonalProfileExportSoul(data);
}

async function tryAdapterAction(action: (() => boolean | Promise<boolean>) | undefined): Promise<boolean> {
  if (!action) return false;
  try {
    return await action() === true;
  } catch {
    return false;
  }
}

/**
 * Delivers an export without assuming that downloads or directory handles are
 * available. Browser/UI consumers may inject their own adapter; every failed
 * primary action falls back to copying a complete textual artifact.
 */
export async function deliverPersonalProfileExport(
  format: PersonalProfileExportFormat,
  data: PersonalProfileExportV2,
  adapter: PersonalProfileDeliveryAdapter,
): Promise<PersonalProfileDeliveryResult> {
  const filename = PERSONAL_PROFILE_EXPORT_FILENAMES[format];
  if (format === "obsidian") {
    const bundle = serializePersonalProfileExportObsidian(data);
    if (await tryAdapterAction(adapter.saveFiles && (() => adapter.saveFiles!(bundle.root, bundle.files)))) {
      return { fallbackUsed: false, filename, format, outcome: "saved-files" };
    }
    const index = bundle.files.find((file) => file.path === "OIYO Personal Profile.md");
    if (index && await tryAdapterAction(adapter.copyText && (() => adapter.copyText!(index.content)))) {
      return { fallbackUsed: true, filename, format, outcome: "copied-index" };
    }
    throw new Error("Unable to save or copy the Obsidian profile export");
  }

  const text = serializeTextFormat(format, data);
  if (adapter.createObjectUrl && adapter.download && adapter.revokeObjectUrl) {
    let objectUrl: string | undefined;
    try {
      objectUrl = adapter.createObjectUrl(new Blob([text], { type: PERSONAL_PROFILE_EXPORT_MIME[format] }));
      if (await adapter.download(objectUrl, filename) === true) {
        return { fallbackUsed: false, filename, format, outcome: "downloaded" };
      }
    } catch {
      // Copy below is the capability fallback for restricted/mobile browsers.
    } finally {
      if (objectUrl) adapter.revokeObjectUrl(objectUrl);
    }
  }
  if (await tryAdapterAction(adapter.copyText && (() => adapter.copyText!(text)))) {
    return { fallbackUsed: true, filename, format, outcome: "copied" };
  }
  throw new Error(`Unable to download or copy the ${format} profile export`);
}

/** A minimal browser adapter; directory saving stays an explicit consumer capability. */
export function createBrowserPersonalProfileDeliveryAdapter(): PersonalProfileDeliveryAdapter {
  if (typeof document === "undefined" || typeof URL === "undefined") return {};
  return {
    copyText: async (text) => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          // Insecure contexts and several mobile webviews reject Clipboard API.
        }
      }
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.readOnly = true;
      textarea.setAttribute("aria-hidden", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = typeof document.execCommand === "function" && document.execCommand("copy");
      textarea.remove();
      return copied;
    },
    createObjectUrl: (blob) => URL.createObjectURL(blob),
    download: (objectUrl, filename) => {
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      return true;
    },
    revokeObjectUrl: (objectUrl) => URL.revokeObjectURL(objectUrl),
  };
}

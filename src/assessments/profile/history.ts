import {
  PERSONAL_PROFILE_LANES,
  type PersonalProfileLaneId,
  type PersonalProfileProjection,
  type PersonalProfileSnapshot,
} from "./schema";
import { sanitizePersonalProfileSnapshot } from "./export-v2";

export const PERSONAL_PROFILE_HISTORY_STORAGE_KEY = "oiyo:personal-profile-history:v1" as const;
export const PERSONAL_PROFILE_HISTORY_SCHEMA = "oiyo.personal-profile-history" as const;
export const PERSONAL_PROFILE_HISTORY_SCHEMA_VERSION = 1 as const;
export const PERSONAL_PROFILE_HISTORY_MAX_TOTAL = 100 as const;
export const PERSONAL_PROFILE_HISTORY_MAX_PER_INSTRUMENT_VERSION = 12 as const;
export const PERSONAL_PROFILE_HISTORY_FRESH_DAYS = 365 as const;
export const PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION = "none" as const;

const DAY_MS = 86_400_000;
const FORBIDDEN_KEYS = new Set(["answers", "legacy", "raw", "responses"]);

export interface PersonalProfileHistoryStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface PersonalProfileHistoryPoint {
  assessmentId: string;
  historyId: string;
  instrumentVersion: string;
  interpretationVersion: string;
  lane: PersonalProfileLaneId;
  measuredAt: string;
  projections: PersonalProfileProjection[];
  recordedAt: string;
  resultId: string;
  scoringVersion: string;
}

export interface PersonalProfileHistoryStore {
  entries: PersonalProfileHistoryPoint[];
  privacy: {
    rawResponsesIncluded: false;
    serverTransmission: typeof PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION;
    storage: "browser-local-only";
  };
  savedAt: string;
  schema: typeof PERSONAL_PROFILE_HISTORY_SCHEMA;
  schemaVersion: typeof PERSONAL_PROFILE_HISTORY_SCHEMA_VERSION;
}

interface PersonalProfileHistoryV0 {
  schema: typeof PERSONAL_PROFILE_HISTORY_SCHEMA;
  schemaVersion: 0;
  snapshots: unknown[];
}

export type PersonalProfileHistoryUxState =
  | "ready"
  | "empty"
  | "storage-disabled"
  | "read-failed"
  | "corrupt"
  | "write-failed"
  | "delete-failed"
  | "export-failed";

export interface PersonalProfileHistoryUxContract {
  canClear: boolean;
  canDelete: boolean;
  canExport: boolean;
  canRetry: boolean;
  messageKey: `profileHistory.${PersonalProfileHistoryUxState}`;
  serverTransmission: typeof PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION;
  state: PersonalProfileHistoryUxState;
}

export interface PersonalProfileHistoryResult {
  changed: boolean;
  duplicateCount: number;
  evictedCount: number;
  migratedFromVersion?: 0;
  ok: boolean;
  store: PersonalProfileHistoryStore;
  ux: PersonalProfileHistoryUxContract;
}

export interface PersonalProfileHistoryOptions {
  maxPerInstrumentVersion?: number;
  maxTotal?: number;
  now?: Date;
}

export interface PersonalProfileHistoryFreshness {
  ageDays: number;
  clockSkewDetected: boolean;
  state: "current" | "stale";
}

export interface PersonalProfileHistoryChange {
  constructId: string;
  kind: "added" | "removed" | "numeric" | "text" | "set";
  newerValue?: PersonalProfileProjection["value"];
  numericDelta?: number;
  olderValue?: PersonalProfileProjection["value"];
  setAdded?: string[];
  setRemoved?: string[];
}

export interface PersonalProfileHistoryComparison {
  assessmentId: string;
  changes: PersonalProfileHistoryChange[];
  disclaimer: "Differences are point-in-time self-report evidence, not proof that personality changed.";
  instrumentVersion: string;
  newer?: PersonalProfileHistoryPoint & { historyFreshness: PersonalProfileHistoryFreshness };
  older?: PersonalProfileHistoryPoint & { historyFreshness: PersonalProfileHistoryFreshness };
  status: "comparable" | "insufficient-history" | "scoring-version-mismatch";
}

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

function assertNow(now = new Date()): Date {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError("Personal profile history now must be a valid Date");
  }
  return now;
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 1) throw new TypeError("Personal profile history limits must be positive integers");
  return value;
}

function containsForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, nested]) => {
    const normalizedKey = key.toLowerCase();
    return FORBIDDEN_KEYS.has(normalizedKey) || normalizedKey.includes("classification") || containsForbiddenKey(nested);
  });
}

function historyId(assessmentId: string, instrumentVersion: string, resultId: string): string {
  return [assessmentId, instrumentVersion, resultId].map(encodeURIComponent).join(":");
}

function emptyStore(now: Date): PersonalProfileHistoryStore {
  return {
    entries: [],
    privacy: {
      rawResponsesIncluded: false,
      serverTransmission: PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION,
      storage: "browser-local-only",
    },
    savedAt: now.toISOString(),
    schema: PERSONAL_PROFILE_HISTORY_SCHEMA,
    schemaVersion: PERSONAL_PROFILE_HISTORY_SCHEMA_VERSION,
  };
}

export function personalProfileHistoryUx(
  state: PersonalProfileHistoryUxState,
  hasEntries = false,
): PersonalProfileHistoryUxContract {
  return {
    canClear: state === "corrupt" || (["ready", "empty", "write-failed", "delete-failed", "export-failed"].includes(state) && hasEntries),
    canDelete: ["ready", "write-failed", "delete-failed", "export-failed"].includes(state) && hasEntries,
    canExport: ["ready", "write-failed", "delete-failed", "export-failed"].includes(state) && hasEntries,
    canRetry: ["storage-disabled", "read-failed", "write-failed", "delete-failed", "export-failed"].includes(state),
    messageKey: `profileHistory.${state}`,
    serverTransmission: PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION,
    state,
  };
}

function result(
  store: PersonalProfileHistoryStore,
  state: PersonalProfileHistoryUxState,
  overrides: Partial<Omit<PersonalProfileHistoryResult, "store" | "ux">> = {},
): PersonalProfileHistoryResult {
  return {
    changed: false,
    duplicateCount: 0,
    evictedCount: 0,
    ok: state === "ready" || state === "empty",
    store,
    ux: personalProfileHistoryUx(state, store.entries.length > 0),
    ...overrides,
  };
}

function cloneProjection(projection: PersonalProfileProjection): PersonalProfileProjection {
  return {
    ...projection,
    provenance: { ...projection.provenance },
    scale: projection.scale ? { ...projection.scale } : undefined,
    value: Array.isArray(projection.value) ? [...projection.value] : projection.value,
  };
}

function pointsFromSnapshot(snapshot: unknown, recordedAt?: string): PersonalProfileHistoryPoint[] {
  const safe = sanitizePersonalProfileSnapshot(snapshot);
  const byAssessment = new Map(safe.instruments.map((instrument) => [instrument.assessmentId, instrument]));
  const points: PersonalProfileHistoryPoint[] = [];
  for (const lane of safe.lanes) {
    const grouped = new Map<string, PersonalProfileProjection[]>();
    for (const projection of lane.projections) {
      const list = grouped.get(projection.sourceAssessmentId) ?? [];
      list.push(projection);
      grouped.set(projection.sourceAssessmentId, list);
    }
    for (const [assessmentId, projections] of grouped) {
      const status = byAssessment.get(assessmentId);
      if (!status || status.availability !== "present" || !status.measuredAt) continue;
      const first = projections[0];
      if (!first || projections.some((item) =>
        item.provenance.resultId !== first.provenance.resultId ||
        item.provenance.instrumentVersion !== first.provenance.instrumentVersion ||
        item.provenance.interpretationVersion !== first.provenance.interpretationVersion ||
        item.provenance.scoringVersion !== first.provenance.scoringVersion
      )) throw new TypeError(`Mixed provenance in profile history point: ${assessmentId}`);
      points.push({
        assessmentId,
        historyId: historyId(assessmentId, first.provenance.instrumentVersion, first.provenance.resultId),
        instrumentVersion: first.provenance.instrumentVersion,
        interpretationVersion: first.provenance.interpretationVersion,
        lane: lane.id,
        measuredAt: status.measuredAt,
        projections: projections.map(cloneProjection).sort((a, b) => a.constructId.localeCompare(b.constructId)),
        recordedAt: recordedAt ?? safe.generatedAt,
        resultId: first.provenance.resultId,
        scoringVersion: first.provenance.scoringVersion,
      });
    }
  }
  return points;
}

function pointToSnapshot(point: PersonalProfileHistoryPoint): PersonalProfileSnapshot {
  return {
    generatedAt: point.recordedAt,
    instruments: [{
      assessmentId: point.assessmentId,
      availability: "present",
      hasLowConfidence: point.projections.some((item) => item.confidenceBand === "low"),
      hasStale: point.projections.some((item) => item.freshness === "stale"),
      lane: point.lane,
      measuredAt: point.measuredAt,
      projectionCount: point.projections.length,
    }],
    lanes: PERSONAL_PROFILE_LANES.map((id) => ({
      id,
      projections: id === point.lane ? point.projections : [],
    })),
    schema: "oiyo.personal-profile-snapshot",
    schemaVersion: 1,
  };
}

function sanitizePoint(value: unknown): PersonalProfileHistoryPoint {
  if (!isRecord(value) || !PERSONAL_PROFILE_LANES.includes(value.lane as PersonalProfileLaneId)) {
    throw new TypeError("Invalid personal profile history point");
  }
  for (const field of ["assessmentId", "historyId", "instrumentVersion", "interpretationVersion", "resultId", "scoringVersion"] as const) {
    if (!isNonEmptyString(value[field])) throw new TypeError(`Invalid personal profile history ${field}`);
  }
  if (!isIsoTimestamp(value.measuredAt) || !isIsoTimestamp(value.recordedAt) || !Array.isArray(value.projections) || value.projections.length === 0) {
    throw new TypeError("Invalid personal profile history timing/projections");
  }
  const candidate = value as unknown as PersonalProfileHistoryPoint;
  const safeSnapshot = sanitizePersonalProfileSnapshot(pointToSnapshot(candidate));
  const safe = pointsFromSnapshot(safeSnapshot, candidate.recordedAt)[0];
  if (!safe || safe.historyId !== candidate.historyId) throw new TypeError("Personal profile history id/provenance mismatch");
  return safe;
}

function sortPoints(entries: PersonalProfileHistoryPoint[]): PersonalProfileHistoryPoint[] {
  return [...entries].sort((a, b) =>
    b.measuredAt.localeCompare(a.measuredAt) || b.recordedAt.localeCompare(a.recordedAt) || a.historyId.localeCompare(b.historyId),
  );
}

function applyRetention(
  entries: PersonalProfileHistoryPoint[],
  maxPerInstrumentVersion: number,
  maxTotal: number,
): { entries: PersonalProfileHistoryPoint[]; evictedCount: number } {
  const sorted = sortPoints(entries);
  const counts = new Map<string, number>();
  const kept: PersonalProfileHistoryPoint[] = [];
  for (const entry of sorted) {
    const key = `${entry.assessmentId}\u0000${entry.instrumentVersion}`;
    const count = counts.get(key) ?? 0;
    if (count >= maxPerInstrumentVersion || kept.length >= maxTotal) continue;
    counts.set(key, count + 1);
    kept.push(entry);
  }
  return { entries: kept, evictedCount: entries.length - kept.length };
}

function migrateV0(value: PersonalProfileHistoryV0, now: Date): PersonalProfileHistoryStore {
  if (!Array.isArray(value.snapshots)) throw new TypeError("Invalid personal profile history v0 snapshots");
  const points = sortPoints(value.snapshots.flatMap((snapshot) => pointsFromSnapshot(snapshot)));
  const seenIds = new Set<string>();
  const seenCompletions = new Set<string>();
  const unique = points.filter((point) => {
    const completionKey = `${point.assessmentId}\u0000${point.instrumentVersion}\u0000${point.measuredAt}`;
    if (seenIds.has(point.historyId) || seenCompletions.has(completionKey)) return false;
    seenIds.add(point.historyId);
    seenCompletions.add(completionKey);
    return true;
  });
  const retained = applyRetention(unique, PERSONAL_PROFILE_HISTORY_MAX_PER_INSTRUMENT_VERSION, PERSONAL_PROFILE_HISTORY_MAX_TOTAL);
  // Re-enter the v1 parser so a migration can never return an envelope that
  // bypasses the current duplicate, privacy, timestamp, or retention invariants.
  return parsePersonalProfileHistory({ ...emptyStore(now), entries: retained.entries }, now);
}

export function parsePersonalProfileHistory(value: unknown, now = new Date()): PersonalProfileHistoryStore {
  const safeNow = assertNow(now);
  if (containsForbiddenKey(value)) throw new TypeError("Personal profile history contains forbidden raw-response fields");
  if (!isRecord(value) || value.schema !== PERSONAL_PROFILE_HISTORY_SCHEMA) throw new TypeError("Unknown personal profile history schema");
  if (value.schemaVersion === 0) return migrateV0(value as unknown as PersonalProfileHistoryV0, safeNow);
  if (
    value.schemaVersion !== PERSONAL_PROFILE_HISTORY_SCHEMA_VERSION ||
    !isIsoTimestamp(value.savedAt) ||
    !Array.isArray(value.entries) ||
    !isRecord(value.privacy) ||
    value.privacy.rawResponsesIncluded !== false ||
    value.privacy.serverTransmission !== PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION ||
    value.privacy.storage !== "browser-local-only"
  ) throw new TypeError("Invalid personal profile history v1 envelope");
  const entries = value.entries.map(sanitizePoint);
  if (new Set(entries.map((entry) => entry.historyId)).size !== entries.length) throw new TypeError("Duplicate personal profile history id");
  const completionKeys = entries.map((entry) => `${entry.assessmentId}\u0000${entry.instrumentVersion}\u0000${entry.measuredAt}`);
  if (new Set(completionKeys).size !== completionKeys.length) throw new TypeError("Duplicate personal profile history completion");
  if (entries.length > PERSONAL_PROFILE_HISTORY_MAX_TOTAL) throw new TypeError("Personal profile history exceeds total retention cap");
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = `${entry.assessmentId}\u0000${entry.instrumentVersion}`;
    const count = (counts.get(key) ?? 0) + 1;
    if (count > PERSONAL_PROFILE_HISTORY_MAX_PER_INSTRUMENT_VERSION) {
      throw new TypeError("Personal profile history exceeds instrument-version retention cap");
    }
    counts.set(key, count);
  }
  return {
    entries: sortPoints(entries),
    privacy: {
      rawResponsesIncluded: false,
      serverTransmission: PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION,
      storage: "browser-local-only",
    },
    savedAt: value.savedAt,
    schema: PERSONAL_PROFILE_HISTORY_SCHEMA,
    schemaVersion: PERSONAL_PROFILE_HISTORY_SCHEMA_VERSION,
  };
}

function browserStorage(): PersonalProfileHistoryStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPersonalProfileHistory(
  storage: PersonalProfileHistoryStorage | null = browserStorage(),
  options: PersonalProfileHistoryOptions = {},
): PersonalProfileHistoryResult {
  const now = assertNow(options.now);
  const empty = emptyStore(now);
  if (!storage) return result(empty, "storage-disabled");
  let raw: string | null;
  try {
    raw = storage.getItem(PERSONAL_PROFILE_HISTORY_STORAGE_KEY);
  } catch {
    return result(empty, "read-failed");
  }
  if (!raw) return result(empty, "empty");
  try {
    const parsed = JSON.parse(raw) as unknown;
    const store = parsePersonalProfileHistory(parsed, now);
    const migratedFromVersion = isRecord(parsed) && parsed.schemaVersion === 0 ? 0 as const : undefined;
    return result(store, store.entries.length ? "ready" : "empty", {
      changed: migratedFromVersion === 0,
      migratedFromVersion,
    });
  } catch {
    return result(empty, "corrupt");
  }
}

export function recordPersonalProfileSnapshot(
  snapshot: unknown,
  storage: PersonalProfileHistoryStorage | null = browserStorage(),
  options: PersonalProfileHistoryOptions = {},
): PersonalProfileHistoryResult {
  const now = assertNow(options.now);
  const loaded = loadPersonalProfileHistory(storage, { now });
  if (!loaded.ok || !storage) return loaded;
  const incoming = pointsFromSnapshot(snapshot, now.toISOString());
  const existingIds = new Set(loaded.store.entries.map((entry) => entry.historyId));
  const completionKeys = new Set(loaded.store.entries.map((entry) => `${entry.assessmentId}\u0000${entry.instrumentVersion}\u0000${entry.measuredAt}`));
  let duplicateCount = 0;
  const additions = incoming.filter((entry) => {
    const completionKey = `${entry.assessmentId}\u0000${entry.instrumentVersion}\u0000${entry.measuredAt}`;
    if (existingIds.has(entry.historyId) || completionKeys.has(completionKey)) {
      duplicateCount += 1;
      return false;
    }
    existingIds.add(entry.historyId);
    completionKeys.add(completionKey);
    return true;
  });
  const maxPer = Math.min(
    positiveInteger(options.maxPerInstrumentVersion, PERSONAL_PROFILE_HISTORY_MAX_PER_INSTRUMENT_VERSION),
    PERSONAL_PROFILE_HISTORY_MAX_PER_INSTRUMENT_VERSION,
  );
  const maxTotal = Math.min(
    positiveInteger(options.maxTotal, PERSONAL_PROFILE_HISTORY_MAX_TOTAL),
    PERSONAL_PROFILE_HISTORY_MAX_TOTAL,
  );
  const retained = applyRetention([...additions, ...loaded.store.entries], maxPer, maxTotal);
  const savedAt = new Date(Math.max(Date.parse(loaded.store.savedAt), now.getTime())).toISOString();
  const store: PersonalProfileHistoryStore = { ...loaded.store, entries: retained.entries, savedAt };
  if (additions.length === 0 && retained.evictedCount === 0 && loaded.migratedFromVersion !== 0) {
    return result(store, store.entries.length ? "ready" : "empty", { duplicateCount, ok: true });
  }
  try {
    storage.setItem(PERSONAL_PROFILE_HISTORY_STORAGE_KEY, JSON.stringify(store));
    return result(store, store.entries.length ? "ready" : "empty", {
      changed: true,
      duplicateCount,
      evictedCount: retained.evictedCount,
      ok: true,
    });
  } catch {
    return result(loaded.store, "write-failed", { duplicateCount });
  }
}

export function deletePersonalProfileHistoryPoint(
  historyIdToDelete: string,
  storage: PersonalProfileHistoryStorage | null = browserStorage(),
  options: PersonalProfileHistoryOptions = {},
): PersonalProfileHistoryResult {
  const now = assertNow(options.now);
  const loaded = loadPersonalProfileHistory(storage, { now });
  if (!loaded.ok || !storage) return loaded;
  const entries = loaded.store.entries.filter((entry) => entry.historyId !== historyIdToDelete);
  if (entries.length === loaded.store.entries.length) return loaded;
  const store = { ...loaded.store, entries, savedAt: new Date(Math.max(Date.parse(loaded.store.savedAt), now.getTime())).toISOString() };
  try {
    storage.setItem(PERSONAL_PROFILE_HISTORY_STORAGE_KEY, JSON.stringify(store));
    return result(store, entries.length ? "ready" : "empty", { changed: true, ok: true });
  } catch {
    return result(loaded.store, "delete-failed");
  }
}

export function clearPersonalProfileHistory(
  storage: PersonalProfileHistoryStorage | null = browserStorage(),
  options: PersonalProfileHistoryOptions = {},
): PersonalProfileHistoryResult {
  const now = assertNow(options.now);
  const empty = emptyStore(now);
  if (!storage) return result(empty, "storage-disabled");
  try {
    storage.removeItem(PERSONAL_PROFILE_HISTORY_STORAGE_KEY);
    return result(empty, "empty", { changed: true, ok: true });
  } catch {
    const loaded = loadPersonalProfileHistory(storage, { now });
    return result(loaded.store, "delete-failed");
  }
}

export function serializePersonalProfileHistory(store: unknown): string {
  const safe = parsePersonalProfileHistory(store);
  return JSON.stringify(safe, null, 2);
}

export function withPersonalProfileHistoryUxState(
  current: PersonalProfileHistoryResult,
  state: PersonalProfileHistoryUxState,
): PersonalProfileHistoryResult {
  return result(current.store, state, {
    changed: current.changed,
    duplicateCount: current.duplicateCount,
    evictedCount: current.evictedCount,
    migratedFromVersion: current.migratedFromVersion,
  });
}

export function personalProfileHistoryFreshness(
  measuredAt: string,
  now = new Date(),
): PersonalProfileHistoryFreshness {
  const safeNow = assertNow(now);
  if (!isIsoTimestamp(measuredAt)) throw new TypeError("History freshness requires an ISO measurement timestamp");
  const ageMs = safeNow.getTime() - Date.parse(measuredAt);
  return {
    ageDays: Math.max(0, ageMs / DAY_MS),
    clockSkewDetected: ageMs < 0,
    state: ageMs <= PERSONAL_PROFILE_HISTORY_FRESH_DAYS * DAY_MS ? "current" : "stale",
  };
}

function changeFor(
  constructId: string,
  older: PersonalProfileProjection | undefined,
  newer: PersonalProfileProjection | undefined,
): PersonalProfileHistoryChange | null {
  if (!older && newer) return { constructId, kind: "added", newerValue: newer.value };
  if (older && !newer) return { constructId, kind: "removed", olderValue: older.value };
  if (!older || !newer) return null;
  if (typeof older.value === "number" && typeof newer.value === "number") {
    const sameScale = JSON.stringify(older.scale ?? null) === JSON.stringify(newer.scale ?? null);
    if (!sameScale) return { constructId, kind: "text", newerValue: newer.value, olderValue: older.value };
    return { constructId, kind: "numeric", newerValue: newer.value, numericDelta: newer.value - older.value, olderValue: older.value };
  }
  if (Array.isArray(older.value) && Array.isArray(newer.value)) {
    const olderValues = older.value;
    const newerValues = newer.value;
    return {
      constructId,
      kind: "set",
      newerValue: newerValues,
      olderValue: olderValues,
      setAdded: newerValues.filter((item) => !olderValues.includes(item)),
      setRemoved: olderValues.filter((item) => !newerValues.includes(item)),
    };
  }
  return { constructId, kind: "text", newerValue: newer.value, olderValue: older.value };
}

export function comparePersonalProfileHistory(
  store: unknown,
  assessmentId: string,
  instrumentVersion: string,
  now = new Date(),
): PersonalProfileHistoryComparison {
  const safeNow = assertNow(now);
  const safe = parsePersonalProfileHistory(store, safeNow);
  const points = safe.entries.filter((entry) => entry.assessmentId === assessmentId && entry.instrumentVersion === instrumentVersion);
  const disclaimer = "Differences are point-in-time self-report evidence, not proof that personality changed." as const;
  if (points.length < 2) return { assessmentId, changes: [], disclaimer, instrumentVersion, status: "insufficient-history" };
  const [newer, older] = points;
  const withFreshness = (point: PersonalProfileHistoryPoint) => ({
    ...point,
    historyFreshness: personalProfileHistoryFreshness(point.measuredAt, safeNow),
  });
  if (newer.scoringVersion !== older.scoringVersion) {
    return { assessmentId, changes: [], disclaimer, instrumentVersion, newer: withFreshness(newer), older: withFreshness(older), status: "scoring-version-mismatch" };
  }
  const olderByConstruct = new Map(older.projections.map((projection) => [projection.constructId, projection]));
  const newerByConstruct = new Map(newer.projections.map((projection) => [projection.constructId, projection]));
  const constructIds = [...new Set([...olderByConstruct.keys(), ...newerByConstruct.keys()])].sort();
  return {
    assessmentId,
    changes: constructIds.map((id) => changeFor(id, olderByConstruct.get(id), newerByConstruct.get(id))).filter(Boolean) as PersonalProfileHistoryChange[],
    disclaimer,
    instrumentVersion,
    newer: withFreshness(newer),
    older: withFreshness(older),
    status: "comparable",
  };
}

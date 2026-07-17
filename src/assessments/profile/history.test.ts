import { describe, expect, it, vi } from "vitest";

import exportFixture from "../../../config/personal-profile-export-v2.fixture.json";
import historyFixture from "../../../config/personal-profile-history-v1.fixture.json";
import type { PersonalProfileSnapshot } from "./schema";
import { browserDownload } from "../../components/ontology/PersonalProfileHistoryPreview";
import {
  PERSONAL_PROFILE_HISTORY_FRESH_DAYS,
  PERSONAL_PROFILE_HISTORY_SCHEMA,
  PERSONAL_PROFILE_HISTORY_STORAGE_KEY,
  clearPersonalProfileHistory,
  comparePersonalProfileHistory,
  deletePersonalProfileHistoryPoint,
  loadPersonalProfileHistory,
  parsePersonalProfileHistory,
  personalProfileHistoryFreshness,
  recordPersonalProfileSnapshot,
  serializePersonalProfileHistory,
  type PersonalProfileHistoryStorage,
  type PersonalProfileHistoryStore,
} from "./history";

const DAY_MS = 86_400_000;
const BASE = exportFixture.sections.assessmentDerived as PersonalProfileSnapshot;
const NOW = new Date("2026-07-16T12:00:00.000Z");
// Executable coverage IDs consumed by audit-personal-profile-history.mjs:
// v0-migration, corrupt-json, duplicate-result-id, duplicate-completion-time,
// clock-rollback, fresh-at-365-days, stale-after-365-days, individual-delete,
// clear-all, retention-cap, storage-disabled, storage-failure.

class MemoryStorage implements PersonalProfileHistoryStorage {
  value: string | null = null;
  fail: "get" | "set" | "remove" | null = null;
  getItem(key: string) {
    if (this.fail === "get") throw new Error("blocked read");
    return key === PERSONAL_PROFILE_HISTORY_STORAGE_KEY ? this.value : null;
  }
  removeItem(key: string) {
    if (this.fail === "remove") throw new Error("blocked delete");
    if (key === PERSONAL_PROFILE_HISTORY_STORAGE_KEY) this.value = null;
  }
  setItem(key: string, value: string) {
    if (this.fail === "set") throw new Error("quota");
    if (key === PERSONAL_PROFILE_HISTORY_STORAGE_KEY) this.value = value;
  }
}

function snapshot(
  resultId: string,
  measuredAt: string,
  value: number,
  options: { generatedAt?: string; instrumentVersion?: string; scoringVersion?: string } = {},
): PersonalProfileSnapshot {
  const next = structuredClone(BASE);
  next.generatedAt = options.generatedAt ?? measuredAt;
  next.instruments[0].measuredAt = measuredAt;
  const projection = next.lanes[0].projections[0];
  projection.measuredAt = measuredAt;
  projection.value = value;
  projection.provenance.resultId = resultId;
  projection.provenance.instrumentVersion = options.instrumentVersion ?? "big5-ocean-20-v1";
  projection.provenance.scoringVersion = options.scoringVersion ?? "big5-ocean-20-scoring-v1";
  return next;
}

function read(storage: MemoryStorage): PersonalProfileHistoryStore {
  return parsePersonalProfileHistory(JSON.parse(storage.value!));
}

describe("PersonalProfileHistory v1", () => {
  it("[fixture-comparison] parses the two-point synthetic fixture and produces a neutral delta", () => {
    const store = parsePersonalProfileHistory(historyFixture);
    const comparison = comparePersonalProfileHistory(store, "big5", "big5-ocean-20-v1", NOW);
    expect(store.entries).toHaveLength(2);
    expect(comparison.status).toBe("comparable");
    expect(comparison.changes[0]).toMatchObject({ numericDelta: 24, olderValue: 48, newerValue: 72 });
  });

  it("[allowlist-export] stores only allowlisted projections locally and exports a schema-versioned envelope", () => {
    const storage = new MemoryStorage();
    const input = { ...snapshot("result-1", "2026-07-01T00:00:00.000Z", 70), responses: { q1: "RAW_SENTINEL" } };
    const saved = recordPersonalProfileSnapshot(input, storage, { now: NOW });
    const json = serializePersonalProfileHistory(saved.store);

    expect(saved.ok).toBe(true);
    expect(saved.changed).toBe(true);
    expect(saved.store.schema).toBe(PERSONAL_PROFILE_HISTORY_SCHEMA);
    expect(saved.store.schemaVersion).toBe(1);
    expect(saved.store.privacy).toEqual({ rawResponsesIncluded: false, serverTransmission: "none", storage: "browser-local-only" });
    expect(json).not.toContain("RAW_SENTINEL");
    expect(JSON.parse(json)).toEqual(saved.store);
  });

  it("[same-instrument-version] compares the newest two points only for the same assessment and instrument version", () => {
    const storage = new MemoryStorage();
    recordPersonalProfileSnapshot(snapshot("old", "2026-01-01T00:00:00.000Z", 40), storage, { now: NOW });
    recordPersonalProfileSnapshot(snapshot("other-version", "2026-06-01T00:00:00.000Z", 99, { instrumentVersion: "big5-ocean-20-v2" }), storage, { now: NOW });
    const saved = recordPersonalProfileSnapshot(snapshot("new", "2026-07-01T00:00:00.000Z", 65), storage, { now: NOW });
    const comparison = comparePersonalProfileHistory(saved.store, "big5", "big5-ocean-20-v1", NOW);

    expect(comparison.status).toBe("comparable");
    expect(comparison.older?.resultId).toBe("old");
    expect(comparison.newer?.resultId).toBe("new");
    expect(comparison.changes[0]).toMatchObject({ kind: "numeric", numericDelta: 25, olderValue: 40, newerValue: 65 });
    expect(comparison.disclaimer).toContain("not proof that personality changed");
  });

  it("[same-scoring-version] blocks numeric comparison when scoring versions differ", () => {
    const storage = new MemoryStorage();
    recordPersonalProfileSnapshot(snapshot("old", "2026-01-01T00:00:00.000Z", 40), storage, { now: NOW });
    const saved = recordPersonalProfileSnapshot(snapshot("new", "2026-07-01T00:00:00.000Z", 65, { scoringVersion: "big5-ocean-20-scoring-v2" }), storage, { now: NOW });

    expect(comparePersonalProfileHistory(saved.store, "big5", "big5-ocean-20-v1", NOW)).toMatchObject({
      changes: [],
      status: "scoring-version-mismatch",
    });
  });

  it("[duplicate-result-id] [duplicate-completion-time] deduplicates both repeated result IDs and duplicate completion timestamps", () => {
    const storage = new MemoryStorage();
    recordPersonalProfileSnapshot(snapshot("first", "2026-07-01T00:00:00.000Z", 50), storage, { now: NOW });
    const repeatedId = recordPersonalProfileSnapshot(snapshot("first", "2026-07-02T00:00:00.000Z", 60), storage, { now: NOW });
    const repeatedCompletion = recordPersonalProfileSnapshot(snapshot("second-id", "2026-07-01T00:00:00.000Z", 70), storage, { now: NOW });

    expect(repeatedId.duplicateCount).toBe(1);
    expect(repeatedCompletion.duplicateCount).toBe(1);
    expect(read(storage).entries).toHaveLength(1);
    expect(read(storage).entries[0].resultId).toBe("first");
  });

  it("[retention-cap] enforces per-version and total retention caps using measurement chronology", () => {
    const storage = new MemoryStorage();
    let last;
    for (let day = 1; day <= 5; day += 1) {
      last = recordPersonalProfileSnapshot(snapshot(`r${day}`, `2026-07-0${day}T00:00:00.000Z`, day), storage, {
        maxPerInstrumentVersion: 2,
        maxTotal: 2,
        now: NOW,
      });
    }
    expect(last?.store.entries.map((entry) => entry.resultId)).toEqual(["r5", "r4"]);
    expect(last?.evictedCount).toBe(1);
  });

  it("[individual-delete] [clear-all] [explicit-rerecord-only] supports deletion, corrupt recovery, and explicit re-record only", () => {
    const storage = new MemoryStorage();
    recordPersonalProfileSnapshot(snapshot("old", "2026-01-01T00:00:00.000Z", 40), storage, { now: NOW });
    const saved = recordPersonalProfileSnapshot(snapshot("new", "2026-07-01T00:00:00.000Z", 65), storage, { now: NOW });
    const deleted = deletePersonalProfileHistoryPoint(saved.store.entries[0].historyId, storage, { now: NOW });
    expect(deleted.changed).toBe(true);
    expect(deleted.store.entries).toHaveLength(1);

    storage.value = "{broken";
    expect(loadPersonalProfileHistory(storage, { now: NOW }).ux.state).toBe("corrupt");
    const cleared = clearPersonalProfileHistory(storage, { now: NOW });
    expect(cleared).toMatchObject({ changed: true, ok: true });
    expect(storage.value).toBeNull();

    // A reload/storage event only loads the history key; it cannot recreate a
    // deleted point. The user must explicitly opt in to record current results.
    expect(loadPersonalProfileHistory(storage, { now: NOW }).store.entries).toHaveLength(0);
    const explicitlyRecorded = recordPersonalProfileSnapshot(snapshot("explicit", "2026-07-02T00:00:00.000Z", 70), storage, { now: NOW });
    expect(explicitlyRecorded.store.entries.map((entry) => entry.resultId)).toEqual(["explicit"]);
  });

  it("[v0-migration] migrates and validates a deduplicated v0 snapshot envelope without raw responses", () => {
    const storage = new MemoryStorage();
    storage.value = JSON.stringify({
      schema: PERSONAL_PROFILE_HISTORY_SCHEMA,
      schemaVersion: 0,
      snapshots: [
        snapshot("legacy", "2026-01-01T00:00:00.000Z", 45),
        snapshot("legacy", "2026-01-01T00:00:00.000Z", 45),
        snapshot("same-completion", "2026-01-01T00:00:00.000Z", 99),
      ],
    });
    const loaded = loadPersonalProfileHistory(storage, { now: NOW });

    expect(loaded.ok).toBe(true);
    expect(loaded.migratedFromVersion).toBe(0);
    expect(loaded.changed).toBe(true);
    expect(loaded.store.schemaVersion).toBe(1);
    expect(loaded.store.entries).toHaveLength(1);
    expect(loaded.store.entries[0].resultId).toBe("legacy");
    expect(() => parsePersonalProfileHistory(loaded.store)).not.toThrow();
  });

  it("[storage-disabled] [storage-failure] reports storage-disabled and read/write/delete failures as explicit local UX states", () => {
    expect(loadPersonalProfileHistory(null, { now: NOW }).ux).toMatchObject({
      canRetry: true,
      serverTransmission: "none",
      state: "storage-disabled",
    });

    const storage = new MemoryStorage();
    storage.fail = "get";
    expect(loadPersonalProfileHistory(storage, { now: NOW }).ux.state).toBe("read-failed");
    storage.fail = "set";
    expect(recordPersonalProfileSnapshot(snapshot("r", "2026-07-01T00:00:00.000Z", 50), storage, { now: NOW }).ux.state).toBe("write-failed");
    storage.fail = null;
    recordPersonalProfileSnapshot(snapshot("r", "2026-07-01T00:00:00.000Z", 50), storage, { now: NOW });
    storage.fail = "remove";
    expect(clearPersonalProfileHistory(storage, { now: NOW }).ux.state).toBe("delete-failed");
  });

  it("[corrupt-json] does not overwrite corrupt storage during a record attempt", () => {
    const storage = new MemoryStorage();
    storage.value = "{corrupt";
    const saved = recordPersonalProfileSnapshot(snapshot("r", "2026-07-01T00:00:00.000Z", 50), storage, { now: NOW });
    expect(saved.ok).toBe(false);
    expect(saved.ux.state).toBe("corrupt");
    expect(storage.value).toBe("{corrupt");
  });

  it("[clock-rollback] keeps monotonic savedAt and orders by measuredAt when the device clock rolls backward", () => {
    const storage = new MemoryStorage();
    recordPersonalProfileSnapshot(snapshot("first", "2026-07-01T00:00:00.000Z", 40), storage, {
      now: new Date("2026-07-10T00:00:00.000Z"),
    });
    const rollback = recordPersonalProfileSnapshot(snapshot("second", "2026-07-05T00:00:00.000Z", 50), storage, {
      now: new Date("2026-06-01T00:00:00.000Z"),
    });

    expect(rollback.store.savedAt).toBe("2026-07-10T00:00:00.000Z");
    expect(rollback.store.entries.map((entry) => entry.resultId)).toEqual(["second", "first"]);
    expect(personalProfileHistoryFreshness("2026-07-05T00:00:00.000Z", new Date("2026-06-01T00:00:00.000Z"))).toMatchObject({
      clockSkewDetected: true,
      state: "current",
    });
  });

  it("[fresh-at-365-days] [stale-after-365-days] treats exactly 365 days as current and the next millisecond as stale", () => {
    const measuredAt = "2025-07-16T12:00:00.000Z";
    const exact = new Date(Date.parse(measuredAt) + PERSONAL_PROFILE_HISTORY_FRESH_DAYS * DAY_MS);
    const after = new Date(exact.getTime() + 1);
    expect(personalProfileHistoryFreshness(measuredAt, exact).state).toBe("current");
    expect(personalProfileHistoryFreshness(measuredAt, after).state).toBe("stale");
  });

  it("[classification-strict-exclusion] rejects raw/classification fields, duplicate completions, and malformed privacy", () => {
    const storage = new MemoryStorage();
    const saved = recordPersonalProfileSnapshot(snapshot("r", "2026-07-01T00:00:00.000Z", 50), storage, { now: NOW });
    expect(() => parsePersonalProfileHistory({ ...saved.store, responses: ["secret"] })).toThrow("forbidden raw-response");
    expect(() => parsePersonalProfileHistory({ ...saved.store, classification: "secret" })).toThrow("forbidden raw-response");
    expect(() => parsePersonalProfileHistory({ ...saved.store, classifications: ["secret"] })).toThrow("forbidden raw-response");
    expect(() => parsePersonalProfileHistory({ ...saved.store, classificationLabel: "secret" })).toThrow("forbidden raw-response");
    expect(() => parsePersonalProfileHistory({ ...saved.store, privacy: { ...saved.store.privacy, serverTransmission: "api" } })).toThrow("envelope");
    expect(() => parsePersonalProfileHistory({ ...saved.store, entries: [saved.store.entries[0], saved.store.entries[0]] })).toThrow("Duplicate personal profile history id");
  });

  it("[export-failure-retry-revoke] revokes a generated object URL even when the download click fails", () => {
    const revokeObjectUrl = vi.fn();
    const click = vi.fn(() => { throw new Error("download blocked"); });
    expect(() => browserDownload("{}", {
      createAnchor: () => ({ click, download: "", href: "", rel: "" }),
      createObjectUrl: () => "blob:history",
      revokeObjectUrl,
    })).toThrow("download blocked");
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledExactlyOnceWith("blob:history");
  });
});

import {
  birthCivilToInstant,
  instantToBirthCivil,
  type CivilDateTime,
} from "@/lib/ontology/kernel/time";
import { civilDateToLocalNoon } from "@/lib/ontology/kernel/civil-date";

export { civilDateToLocalNoon } from "@/lib/ontology/kernel/civil-date";

export const BIRTH_RECORD_SCHEMA_VERSION = 2 as const;
export const DEFAULT_BIRTH_LONGITUDE = 135;
export const DEFAULT_BIRTH_UTC_OFFSET_MINUTES = 540;

/** Adapter for existing numeric tool inputs; omitted minutes preserve legacy :00. */
export function createBirthRecordFromParts(input: {
  year: number; month: number; day: number;
  hour?: number | null; minute?: number | null;
}): BirthRecordV2 {
  const { year, month, day, hour } = input;
  const civilDate = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const civilTime = hour == null ? null
    : `${String(hour).padStart(2, "0")}:${String(input.minute ?? 0).padStart(2, "0")}`;
  return createBirthRecord({ civilDate, civilTime, needsConfirmation: true, provenance: "user-confirmed-v2" });
}

export interface BirthRecordV2 {
  schemaVersion: typeof BIRTH_RECORD_SCHEMA_VERSION;
  civilDate: string;
  civilTime: null | string;
  timeKnown: boolean;
  zoneId: null | string;
  utcOffsetMinutesAtBirth: null | number;
  longitude: null | number;
  provenance: "legacy-date" | "legacy-iso" | "user-confirmed-v2";
  needsConfirmation: boolean;
}

export interface LegacyBirthProfile {
  birthDate?: null | string;
  birthRecord?: BirthRecordV2 | null;
  birthTime?: null | string;
}

export type BirthInstantResolution =
  | { status: "date-only"; reason: "time-unknown" }
  | { status: "needs-confirmation"; reason: "legacy-or-missing-location" }
  | { status: "resolved"; instant: Date; longitude: number; offsetMinutes: number };

export type ZonedCivilResolution =
  | { status: "ambiguous"; candidates: Array<{ instant: Date; offsetMinutes: number }> }
  | { status: "invalid-zone" }
  | { status: "nonexistent" }
  | { status: "resolved"; instant: Date; offsetMinutes: number };

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isCivilDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const probe = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return probe.getUTCFullYear() === Number(year)
    && probe.getUTCMonth() === Number(month) - 1
    && probe.getUTCDate() === Number(day);
}

export function isCivilTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

function civilParts(civilDate: string, civilTime: null | string): CivilDateTime {
  if (!isCivilDate(civilDate)) throw new RangeError("Invalid civil birth date");
  if (civilTime !== null && !isCivilTime(civilTime)) throw new RangeError("Invalid civil birth time");
  const [year, month, day] = civilDate.split("-").map(Number);
  const [hour, minute] = civilTime ? civilTime.split(":").map(Number) : [12, 0];
  return { day, hour, minute, month, year };
}

function formatCivilDate(civil: CivilDateTime): string {
  return `${String(civil.year).padStart(4, "0")}-${String(civil.month).padStart(2, "0")}-${String(civil.day).padStart(2, "0")}`;
}

export function createBirthRecord(input: {
  civilDate: string;
  civilTime?: null | string;
  longitude?: null | number;
  needsConfirmation?: boolean;
  provenance?: BirthRecordV2["provenance"];
  utcOffsetMinutesAtBirth?: null | number;
  zoneId?: null | string;
}): BirthRecordV2 {
  const civilTime = input.civilTime ?? null;
  civilParts(input.civilDate, civilTime);
  if (input.longitude != null && (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180)) {
    throw new RangeError("Invalid birth longitude");
  }
  if (input.utcOffsetMinutesAtBirth != null && (!Number.isInteger(input.utcOffsetMinutesAtBirth) || input.utcOffsetMinutesAtBirth < -840 || input.utcOffsetMinutesAtBirth > 840)) {
    throw new RangeError("Invalid birth UTC offset");
  }
  return {
    schemaVersion: BIRTH_RECORD_SCHEMA_VERSION,
    civilDate: input.civilDate,
    civilTime,
    timeKnown: civilTime !== null,
    zoneId: input.zoneId ?? null,
    utcOffsetMinutesAtBirth: input.utcOffsetMinutesAtBirth ?? null,
    longitude: input.longitude ?? null,
    provenance: input.provenance ?? "user-confirmed-v2",
    needsConfirmation: input.needsConfirmation ?? false,
  };
}

export function isBirthRecordV2(value: unknown): value is BirthRecordV2 {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<BirthRecordV2>;
  return record.schemaVersion === BIRTH_RECORD_SCHEMA_VERSION
    && isCivilDate(record.civilDate)
    && (record.civilTime === null || isCivilTime(record.civilTime))
    && record.timeKnown === (record.civilTime !== null)
    && (record.longitude === null || (typeof record.longitude === "number" && Number.isFinite(record.longitude) && record.longitude >= -180 && record.longitude <= 180))
    && (record.utcOffsetMinutesAtBirth === null || (typeof record.utcOffsetMinutesAtBirth === "number" && Number.isInteger(record.utcOffsetMinutesAtBirth) && record.utcOffsetMinutesAtBirth >= -840 && record.utcOffsetMinutesAtBirth <= 840))
    && (record.zoneId === null || typeof record.zoneId === "string")
    && ["legacy-date", "legacy-iso", "user-confirmed-v2"].includes(record.provenance ?? "")
    && typeof record.needsConfirmation === "boolean";
}

function formattedCivilParts(instant: Date, zoneId: string): CivilDateTime {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: zoneId,
    year: "numeric",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  return {
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    month: Number(parts.month),
    year: Number(parts.year),
  };
}

/**
 * Resolve a birthplace wall-clock reading against the IANA timezone database.
 *
 * A DST spring-forward gap has no matching instant; a fall-back overlap has two.
 * Both states are returned explicitly so callers never guess an offset.
 */
export function resolveZonedCivilTime(input: {
  civilDate: string;
  civilTime: string;
  zoneId: string;
}): ZonedCivilResolution {
  const civil = civilParts(input.civilDate, input.civilTime);
  try {
    // Validate before the scan so an unsupported IANA identifier has its own state.
    new Intl.DateTimeFormat("en", { timeZone: input.zoneId }).format(0);
  } catch {
    return { status: "invalid-zone" };
  }

  const civilAsUtc = Date.UTC(
    civil.year,
    civil.month - 1,
    civil.day,
    civil.hour,
    civil.minute,
  );
  const candidates: Array<{ instant: Date; offsetMinutes: number }> = [];

  // IANA contains historical offsets that are not quarter-hour aligned. Minute
  // precision matches the input contract and keeps those records resolvable.
  for (let offsetMinutes = -840; offsetMinutes <= 840; offsetMinutes += 1) {
    const instant = new Date(civilAsUtc - offsetMinutes * 60_000);
    const local = formattedCivilParts(instant, input.zoneId);
    if (
      local.year === civil.year
      && local.month === civil.month
      && local.day === civil.day
      && local.hour === civil.hour
      && local.minute === civil.minute
    ) {
      candidates.push({ instant, offsetMinutes });
    }
  }

  if (candidates.length === 0) return { status: "nonexistent" };
  if (candidates.length > 1) return { status: "ambiguous", candidates };
  return { status: "resolved", ...candidates[0] };
}

export function migrateLegacyBirth(profile: LegacyBirthProfile): BirthRecordV2 | null {
  if (isBirthRecordV2(profile.birthRecord)) return profile.birthRecord;
  if (!profile.birthDate) return null;
  const civilTime = isCivilTime(profile.birthTime) ? profile.birthTime : null;
  if (isCivilDate(profile.birthDate)) {
    return createBirthRecord({
      civilDate: profile.birthDate,
      civilTime,
      longitude: null,
      needsConfirmation: true,
      provenance: "legacy-date",
      utcOffsetMinutesAtBirth: null,
      zoneId: null,
    });
  }
  const instant = new Date(profile.birthDate);
  if (Number.isNaN(instant.getTime())) return null;
  const civil = instantToBirthCivil(instant, DEFAULT_BIRTH_UTC_OFFSET_MINUTES);
  return createBirthRecord({
    civilDate: formatCivilDate(civil),
    civilTime: civilTime ?? `${String(civil.hour).padStart(2, "0")}:${String(civil.minute).padStart(2, "0")}`,
    longitude: null,
    needsConfirmation: true,
    provenance: "legacy-iso",
    utcOffsetMinutesAtBirth: null,
    zoneId: null,
  });
}

export function resolveBirthRecord(profile: LegacyBirthProfile): BirthRecordV2 | null {
  return isBirthRecordV2(profile.birthRecord) ? profile.birthRecord : migrateLegacyBirth(profile);
}

export function birthRecordToInstant(record: BirthRecordV2): Date {
  return birthCivilToInstant(
    civilParts(record.civilDate, record.civilTime),
    record.utcOffsetMinutesAtBirth ?? DEFAULT_BIRTH_UTC_OFFSET_MINUTES,
  );
}

export function resolveBirthInstant(record: BirthRecordV2): BirthInstantResolution {
  if (!record.timeKnown || !record.civilTime) return { status: "date-only", reason: "time-unknown" };
  if (record.needsConfirmation || record.utcOffsetMinutesAtBirth === null || record.longitude === null) {
    return { status: "needs-confirmation", reason: "legacy-or-missing-location" };
  }
  return {
    status: "resolved",
    instant: birthRecordToInstant(record),
    longitude: record.longitude,
    offsetMinutes: record.utcOffsetMinutesAtBirth,
  };
}

export function birthRecordToCivilDate(record: BirthRecordV2): Date {
  return civilDateToLocalNoon(record.civilDate);
}

/**
 * Compatibility adapter for legacy date-only calculators that still accept a
 * `Date` and read local calendar getters. The input remains an explicit civil
 * date; callers must not use the returned value as a real birth instant.
 */
export function birthRecordProfilePatch(record: BirthRecordV2) {
  return {
    birthDate: record.civilDate,
    birthRecord: record,
    birthTime: record.civilTime,
  };
}

export function birthRecordLongitude(record: BirthRecordV2): number {
  return record.longitude ?? DEFAULT_BIRTH_LONGITUDE;
}

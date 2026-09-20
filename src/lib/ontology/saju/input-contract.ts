import {
  isBirthRecordV2,
  isCivilDate,
  isCivilTime,
  resolveZonedCivilTime,
  type BirthRecordV2,
} from "../../user/birth-record";

/** Tool-state version, independent of the shared #r=1 transport version. */
interface SajuInputFields {
  day: number;
  gender: "male" | "female";
  hour: number | null;
  minute: number | null;
  month: number;
  year: number;
}

export interface LegacySajuInputState extends SajuInputFields {
  schemaVersion: 2;
}

/**
 * Encrypted-share payload. The location is part of the calculation contract:
 * without its historical UTC offset, a solar-term boundary cannot be replayed.
 */
export interface LocatedSajuInputState extends SajuInputFields {
  schemaVersion: 3;
  birthRecord: BirthRecordV2;
}

export type SajuInputState = LegacySajuInputState | LocatedSajuInputState;

export function parseSajuTime(value: string): { hour: number | null; minute: number | null } | null {
  if (value === "") return { hour: null, minute: null };
  if (!isCivilTime(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

/** Read existing hour-only links and new minute-preserving links safely. */
export function parseSajuInputState(value: unknown): SajuInputState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const s = value as Record<string, unknown>;
  const schemaVersion = s.schemaVersion ?? 2;
  if (schemaVersion !== 2 && schemaVersion !== 3) return null;
  if (![s.year, s.month, s.day].every(Number.isInteger)) return null;
  const year = s.year as number, month = s.month as number, day = s.day as number;
  const date = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (!isCivilDate(date)) return null;
  if (s.gender !== "male" && s.gender !== "female") return null;
  const hour = s.hour == null ? null : s.hour;
  const minute = hour === null ? null : (s.minute ?? 0);
  if (hour !== null && (!Number.isInteger(hour) || (hour as number) < 0 || (hour as number) > 23)) return null;
  if (minute !== null && (!Number.isInteger(minute) || (minute as number) < 0 || (minute as number) > 59)) return null;
  const fields: SajuInputFields = { year, month, day, hour: hour as number | null, minute: minute as number | null, gender: s.gender };
  if (schemaVersion === 2) return { schemaVersion: 2, ...fields };
  if (!isBirthRecordV2(s.birthRecord)) return null;
  const [recordYear, recordMonth, recordDay] = s.birthRecord.civilDate.split("-").map(Number);
  const [recordHour, recordMinute] = s.birthRecord.civilTime
    ? s.birthRecord.civilTime.split(":").map(Number)
    : [null, null];
  if (
    recordYear !== year
    || recordMonth !== month
    || recordDay !== day
    || recordHour !== fields.hour
    || recordMinute !== fields.minute
  ) return null;
  if (s.birthRecord.timeKnown) {
    if (
      s.birthRecord.needsConfirmation
      || s.birthRecord.zoneId === null
      || s.birthRecord.longitude === null
      || s.birthRecord.utcOffsetMinutesAtBirth === null
    ) return null;
    const zone = resolveZonedCivilTime({
      civilDate: s.birthRecord.civilDate,
      civilTime: s.birthRecord.civilTime!,
      zoneId: s.birthRecord.zoneId,
    });
    if (zone.status !== "resolved" || zone.offsetMinutes !== s.birthRecord.utcOffsetMinutesAtBirth) return null;
  }
  return { schemaVersion: 3, ...fields, birthRecord: s.birthRecord };
}

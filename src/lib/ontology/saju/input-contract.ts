import { isCivilDate, isCivilTime } from "../../user/birth-record";

/** Tool-state version, independent of the shared #r=1 transport version. */
export interface SajuInputState {
  schemaVersion: 2;
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
  gender: "male" | "female";
}

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
  if (s.schemaVersion !== undefined && s.schemaVersion !== 2) return null;
  if (![s.year, s.month, s.day].every(Number.isInteger)) return null;
  const year = s.year as number, month = s.month as number, day = s.day as number;
  const date = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (!isCivilDate(date)) return null;
  if (s.gender !== "male" && s.gender !== "female") return null;
  const hour = s.hour == null ? null : s.hour;
  const minute = hour === null ? null : (s.minute ?? 0);
  if (hour !== null && (!Number.isInteger(hour) || (hour as number) < 0 || (hour as number) > 23)) return null;
  if (minute !== null && (!Number.isInteger(minute) || (minute as number) < 0 || (minute as number) > 59)) return null;
  return { schemaVersion: 2, year, month, day, hour: hour as number | null, minute: minute as number | null, gender: s.gender };
}

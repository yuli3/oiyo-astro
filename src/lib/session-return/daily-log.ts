/**
 * Local-first daily session log. Dates are civil YYYY-MM-DD in the
 * browser's local timezone. No account, no server.
 */

export const PRANAYAMA_LOG_KEY = "oiyo.pranayama.v1";
export const BREATHING_LOG_KEY = "oiyo.breathing.v1";
export const ROUTINE_LOG_KEY = "oiyo.routine.v1";
export const HABIT_LOG_KEY = "oiyo.habit.v1";
const DAY_CAP = 60;

export function localDay(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previousDay(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const prior = new Date(utc - 24 * 60 * 60 * 1000);
  return `${prior.getUTCFullYear()}-${String(prior.getUTCMonth() + 1).padStart(2, "0")}-${String(prior.getUTCDate()).padStart(2, "0")}`;
}

export function consecutiveStreak(days: string[], today: string): number {
  const unique = [...new Set(days.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)))].sort();
  if (!unique.includes(today)) return 0;
  let count = 0;
  let cursor: string | null = today;
  const set = new Set(unique);
  while (cursor && set.has(cursor)) {
    count += 1;
    cursor = previousDay(cursor);
  }
  return count;
}

export function recordToday(days: string[], today: string, cap = DAY_CAP): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return days.slice(-cap);
  const unique = [...new Set([...days.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)), today])].sort();
  return unique.slice(-cap);
}

export interface DailyLog {
  days: string[];
}

export function parseDailyLog(raw: string | null): DailyLog {
  if (!raw) return { days: [] };
  try {
    const parsed = JSON.parse(raw) as { days?: unknown };
    if (!Array.isArray(parsed.days)) return { days: [] };
    return {
      days: parsed.days.filter((day): day is string => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)),
    };
  } catch {
    return { days: [] };
  }
}

export function serializeDailyLog(log: DailyLog): string {
  const unique = [...new Set(log.days.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)))].sort();
  return JSON.stringify({ days: unique.slice(-DAY_CAP) });
}

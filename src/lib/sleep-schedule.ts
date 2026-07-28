export const SLEEP_DURATIONS_MINUTES = [420, 450, 480, 510, 540] as const;

export function parseClock(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

export function formatClock(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

export function sleepSchedule(value: string, direction: "bedtime" | "wake") {
  const clock = parseClock(value);
  if (clock === null) return null;
  return SLEEP_DURATIONS_MINUTES.map((duration) => ({ duration, time: formatClock(direction === "bedtime" ? clock - duration : clock + duration) }));
}

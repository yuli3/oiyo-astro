/**
 * Astrology Lookup Table
 * Static data for planetary events (2025-2026).
 * This avoids heavy orbital calculation libraries for the MVP.
 */

export interface RetrogradePeriod {
  body: "Mars" | "Mercury" | "Venus";
  end: string;
  start: string; // ISO Date "YYYY-MM-DD"
}

// Data sourced from standard Ephemeris
export const RETROGRADES: RetrogradePeriod[] = [
  // 2025
  { body: "Mercury", end: "2025-04-07", start: "2025-03-15" },
  { body: "Mercury", end: "2025-08-11", start: "2025-07-18" },
  { body: "Mercury", end: "2025-11-29", start: "2025-11-09" },
  { body: "Venus", end: "2025-04-13", start: "2025-03-02" }, // Rare Venus Rx!
  { body: "Mars", end: "2025-02-24", start: "2025-01-01" }, // Continues from late 2024

  // 2026 (Proactive)
  { body: "Mercury", end: "2026-03-20", start: "2026-02-26" },
  { body: "Mercury", end: "2026-07-23", start: "2026-06-29" },
  { body: "Mercury", end: "2026-11-13", start: "2026-10-24" },
];

export interface MoonPhaseData {
  age: number; // days since new moon
  illumination: number; // 0.0 to 1.0
  phase:
    | "First Quarter"
    | "Full"
    | "Last Quarter"
    | "New"
    | "Waning Crescent"
    | "Waning Gibbous"
    | "Waxing Crescent"
    | "Waxing Gibbous";
}

/**
 * Calculates Moon Phase
 * @param date
 * @returns MoonPhaseData
 */
export function getMoonPhase(date: Date): MoonPhaseData {
  // Known New Moon: Jan 11, 2024 11:57 UTC
  // Synodic Month: 29.53058867 days
  const knownNewMoon = new Date("2024-01-11T11:57:00Z").getTime();
  const now = date.getTime();
  const diffMs = now - knownNewMoon;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const cycle = 29.53058867;

  let age = diffDays % cycle;
  if (age < 0) age += cycle;

  const illumination = 0.5 * (1 - Math.cos((age / cycle) * 2 * Math.PI));

  let phase: MoonPhaseData["phase"] = "New";

  if (age < 1.84) phase = "New";
  else if (age < 5.53) phase = "Waxing Crescent";
  else if (age < 9.22) phase = "First Quarter";
  else if (age < 12.91) phase = "Waxing Gibbous";
  else if (age < 16.61) phase = "Full";
  else if (age < 20.3) phase = "Waning Gibbous";
  else if (age < 23.99) phase = "Last Quarter";
  else if (age < 27.68) phase = "Waning Crescent";
  else phase = "New";

  return { age, illumination, phase };
}

export function getRetrogrades(date: Date): string[] {
  const dateStr = date.toISOString().split("T")[0];
  const active: string[] = [];

  RETROGRADES.forEach((rx) => {
    if (dateStr >= rx.start && dateStr <= rx.end) {
      active.push(rx.body);
    }
  });

  return active;
}

/**
 * Existing public calculator civil-calendar formulas, extracted unchanged.
 * This is NOT the solar-term/true-solar-time engine in logic.ts.
 * Year/month approximations and whole-hour convention remain until the UI
 * input and migration policy have been validated. Do not use as a new default.
 */

// ─── Sexagenary year cycle ─────────────────────────────────────────────────────
// Epoch: 1984 is 甲子 (Stem 0, Branch 0)
const SEXAGENARY_EPOCH = 1984;

export function getYearStem(year: number): number {
  return ((year - SEXAGENARY_EPOCH) % 10 + 10) % 10;
}
export function getYearBranch(year: number): number {
  return ((year - SEXAGENARY_EPOCH) % 12 + 12) % 12;
}

// Month pillar: stems cycle by 5 per year-stem group; branches = (month + 1) % 12
export function getMonthBranch(month: number): number {
  // Months 1-12 → branches 2 (寅) to 1 (丑) — Chinese solar calendar approximation
  return (month + 1) % 12;
}
export function getMonthStem(yearStem: number, month: number): number {
  // Starting stem for the year depends on year stem parity group
  const base = (yearStem % 5) * 2;
  return (base + (month - 1)) % 10;
}

// Day pillar: use a known epoch
// January 1, 1900 = 甲戌 day → stem 0, branch 10
const DAY_EPOCH_JD = 2415021; // Julian Day for 1900-01-01
function julianDay(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}
export function getDayStem(y: number, m: number, d: number): number {
  const jd = julianDay(y, m, d);
  return ((jd - DAY_EPOCH_JD) % 10 + 10) % 10;
}
export function getDayBranch(y: number, m: number, d: number): number {
  const jd = julianDay(y, m, d);
  // Epoch day 1900-01-01 is 甲戌: stem 0 but branch 10, so the branch cycle
  // needs the +10 offset (verified: 2000-01-01 = 戊午, 2024-01-01 = 甲子).
  return ((jd - DAY_EPOCH_JD + 10) % 12 + 12) % 12;
}

// Hour pillar: branches go in 2-hour segments starting at 23:00 (子)
export function getHourBranch(hour: number): number {
  // 23-01: 子(0), 01-03: 丑(1), 03-05: 寅(2), 05-07: 卯(3), ...
  return Math.floor((hour + 1) / 2) % 12;
}
export function getHourStem(dayStem: number, hourBranch: number): number {
  const base = (dayStem % 5) * 2;
  return (base + hourBranch) % 10;
}

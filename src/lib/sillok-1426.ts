/**
 * "내 생일의 실록" — your birthday in the Sejong Sillok, year 世宗 8 (lunar year beginning early 1426).
 *
 * The Sillok dates entries by lunar month and sexagenary day (干支). Each month's first day (朔) is known
 * from the text, and the day cycle is continuous, so a solar date maps to a lunar date by Julian Day Number:
 * ganzhi index = (JDN − 11) mod 60 (0 = 甲子). Solar dates are proleptic Gregorian, i.e. the same point in
 * the seasons as your birthday; a date before the lunar new year falls in early 1427 instead.
 */
export const STEMS = "甲乙丙丁戊己庚辛壬癸";
export const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
export const ganzhi = (i: number) => STEMS[((i % 10) + 10) % 10] + BRANCHES[((i % 12) + 12) % 12];
export const ganzhiIndex = (gz: string) => {
  for (let i = 0; i < 60; i += 1) if (ganzhi(i) === gz) return i;
  return -1;
};

/** Julian Day Number of a proleptic Gregorian date. */
export function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function fromJdn(j: number): { y: number; m: number; d: number } {
  const a = j + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return { y: 100 * b + d - 4800 + Math.floor(m / 10), m: m + 3 - 12 * Math.floor(m / 10), d: e - Math.floor((153 * m + 2) / 5) + 1 };
}

export const dayGanzhi = (j: number) => ganzhi(j - 11);

/** JDN of the first day of each lunar month of 世宗 8, from the 朔 ganzhi of each month (no leap month this year). */
export function monthStarts(shuo: readonly string[]): number[] {
  const out: number[] = [];
  // Lunar new year falls between 21 Jan and 20 Feb (Gregorian); search that window for the first 朔.
  let j = jdn(1426, 1, 21);
  while (dayGanzhi(j) !== shuo[0]) j += 1;
  out.push(j);
  for (let k = 1; k < shuo.length; k += 1) {
    let n = out[k - 1] + 29;
    while (dayGanzhi(n) !== shuo[k]) n += 1;
    if (n - out[k - 1] > 30) throw new Error(`month ${k + 1} does not start 29–30 days after the previous`);
    out.push(n);
  }
  return out;
}

/** outside: the solar date falls in the ~11-day gap between this lunar year's end and its next new year,
 * so it is moved to the closest day of 世宗 8 (the lunar year is about 354 days). */
export type LunarDay = { month: number; day: number; jdn: number; outside: boolean };

/** Lunar day of 世宗 8 for a solar month/day, using 1426 or (before the new year) 1427. */
export function solarToLunar(month: number, day: number, starts: readonly number[]): LunarDay {
  const end = starts[starts.length - 1] + 30;
  let j = jdn(1426, month, day);
  let outside = false;
  if (j < starts[0]) {
    const late = jdn(1427, month, day);
    if (late < end) j = late;
    else {
      outside = true;
      j = starts[0] - j <= late - (end - 1) ? starts[0] : end - 1;
    }
  }
  let k = starts.length - 1;
  while (k > 0 && starts[k] > j) k -= 1;
  return { month: k + 1, day: j - starts[k] + 1, jdn: j, outside };
}

export function lunarToJdn(month: number, day: number, starts: readonly number[]): number {
  return starts[month - 1] + day - 1;
}

export const monthLength = (month: number, starts: readonly number[]) => (month < starts.length ? starts[month] - starts[month - 1] : 30);

/** The recorded day closest to the wanted one (same day if it exists), searching both ways. */
export function nearestRecorded(month: number, day: number, starts: readonly number[], has: (key: string) => boolean): { month: number; day: number; offset: number } | null {
  const target = lunarToJdn(month, day, starts);
  for (let off = 0; off < 20; off += 1) {
    for (const sign of off === 0 ? [0] : [-1, 1]) {
      const j = target + sign * off;
      let k = starts.length - 1;
      while (k > 0 && starts[k] > j) k -= 1;
      if (j < starts[0]) continue;
      const d = j - starts[k] + 1;
      if (d > monthLength(k + 1, starts)) continue;
      if (has(`${k + 1}-${d}`)) return { month: k + 1, day: d, offset: sign * off };
    }
  }
  return null;
}

export type SillokQuery = { kind: "solar" | "lunar"; month: number; day: number };

export function formatSillok(q: SillokQuery): string {
  return new URLSearchParams({ c: q.kind === "lunar" ? "l" : "s", m: String(q.month), d: String(q.day) }).toString();
}

export function parseSillok(search: string): SillokQuery | null {
  const p = new URLSearchParams(search);
  const month = Number(p.get("m"));
  const day = Number(p.get("d"));
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { kind: p.get("c") === "l" ? "lunar" : "solar", month, day };
}

/** Weather, quake and rain-prayer notices: [lunar month, day, kind, original text]. */
export type WeatherKind = "pray" | "thanks" | "quake" | "hail" | "storm" | "thunder" | "fog" | "wind" | "drought" | "rain";
export type WeatherNote = [number, number, WeatherKind, string];

/** Notices within `span` days of a day (by JDN), nearest first; if none, the single nearest one. */
export function weatherNear(j: number, notes: readonly WeatherNote[], starts: readonly number[], span = 10, max = 4): { note: WeatherNote; delta: number }[] {
  const all = notes.map((note) => ({ note, delta: lunarToJdn(note[0], note[1], starts) - j })).sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta) || a.delta - b.delta);
  const close = all.filter((x) => Math.abs(x.delta) <= span);
  return (close.length ? close : all.slice(0, 1)).slice(0, max);
}

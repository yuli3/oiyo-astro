// One birthday in seven calendars. Pure arithmetic on the Julian Day Number
// (integer day count, noon-based). Algorithms follow Fourmilab's calendar
// converter / convertdate; tests cross-check against convertdate outputs.

import { zodiacYearOf } from "./almanac/zodiac-year";

export type Ymd = { y: number; m: number; d: number };

export function parseYmd(s: string): Ymd | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const v = { y: +m[1]!, m: +m[2]!, d: +m[3]! };
  const t = new Date(Date.UTC(v.y, v.m - 1, v.d));
  return t.getUTCFullYear() === v.y && t.getUTCMonth() === v.m - 1 && t.getUTCDate() === v.d ? v : null;
}

/** Gregorian date → Julian Day Number. */
export function jdn({ y, m, d }: Ymd): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

/** JDN → Julian-calendar date. */
export function julianFromJdn(j: number): Ymd {
  const c = j + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return { d: e - Math.floor((153 * m + 2) / 5) + 1, m: m + 3 - 12 * Math.floor(m / 10), y: d - 4800 + Math.floor(m / 10) };
}

// ── French Republican (Romme's rule) ─────────────────────────────────────────

const FR_EPOCH = 2375840; // 1 Vendémiaire an I = 22 September 1792
export function republicanLeap(y: number): boolean {
  if (y === 3 || y === 7 || y === 11) return true;
  if (y < 16) return false;
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
/** month 13 = sansculottides. */
export function republicanFromJdn(j: number): { y: number; m: number; d: number; dayOfYear: number } | null {
  if (j < FR_EPOCH) return null;
  let y = 1;
  let start = FR_EPOCH;
  for (;;) {
    const len = republicanLeap(y) ? 366 : 365;
    if (j < start + len) break;
    start += len;
    y += 1;
  }
  const doy = j - start; // 0-based
  return { y, m: Math.floor(doy / 30) + 1, d: (doy % 30) + 1, dayOfYear: doy };
}

const ROMAN: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function roman(n: number): string {
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}

export const REPUBLICAN_MONTHS = ["Vendémiaire", "Brumaire", "Frimaire", "Nivôse", "Pluviôse", "Ventôse", "Germinal", "Floréal", "Prairial", "Messidor", "Thermidor", "Fructidor", "Sansculottides"];
export const DECADE_DAYS = ["Primidi", "Duodi", "Tridi", "Quartidi", "Quintidi", "Sextidi", "Septidi", "Octidi", "Nonidi", "Décadi"];

// ── Islamic (tabular, civil epoch) ───────────────────────────────────────────

const ISL_EPOCH = 1948439.5;
function islamicToJd(y: number, m: number, d: number): number {
  return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + ISL_EPOCH - 1;
}
export function islamicFromJdn(j: number): Ymd {
  const x = j - 0.5; // JD at the start of this civil day
  const y = Math.floor((30 * (x - ISL_EPOCH) + 10646) / 10631);
  const m = Math.min(12, Math.ceil((x - (29 + islamicToJd(y, 1, 1))) / 29.5) + 1);
  const d = x - islamicToJd(y, m, 1) + 1;
  return { y, m, d };
}
export const ISLAMIC_MONTHS = ["Muḥarram", "Ṣafar", "Rabīʿ al-awwal", "Rabīʿ al-thānī", "Jumādā al-ūlā", "Jumādā al-ākhira", "Rajab", "Shaʿbān", "Ramaḍān", "Shawwāl", "Dhū al-Qaʿda", "Dhū al-Ḥijja"];

// ── Hebrew ───────────────────────────────────────────────────────────────────

const HEB_EPOCH = 347995.5;
export const hebrewLeap = (y: number) => ((7 * y + 1) % 19) < 7;
const hebrewMonths = (y: number) => (hebrewLeap(y) ? 13 : 12);
function delay1(y: number): number {
  const months = Math.floor((235 * y - 234) / 19);
  const parts = 12084 + 13753 * months;
  let day = months * 29 + Math.floor(parts / 25920);
  if ((3 * (day + 1)) % 7 < 3) day += 1;
  return day;
}
function delay2(y: number): number {
  const last = delay1(y - 1);
  const present = delay1(y);
  const next = delay1(y + 1);
  if (next - present === 356) return 2;
  if (present - last === 382) return 1;
  return 0;
}
const yearDays = (y: number) => hebrewToJd(y + 1, 7, 1) - hebrewToJd(y, 7, 1);
function monthDays(y: number, m: number): number {
  if (m === 2 || m === 4 || m === 6 || m === 10 || m === 13) return 29;
  if (m === 12 && !hebrewLeap(y)) return 29;
  if (m === 8 && yearDays(y) % 10 !== 5) return 29;
  if (m === 9 && yearDays(y) % 10 === 3) return 29;
  return 30;
}
function hebrewToJd(y: number, m: number, d: number): number {
  const months = hebrewMonths(y);
  let jd = HEB_EPOCH + delay1(y) + delay2(y) + d + 1;
  if (m < 7) {
    for (let mm = 7; mm <= months; mm += 1) jd += monthDays(y, mm);
    for (let mm = 1; mm < m; mm += 1) jd += monthDays(y, mm);
  } else {
    for (let mm = 7; mm < m; mm += 1) jd += monthDays(y, mm);
  }
  return jd;
}
/** month: 1 = Nisan … 7 = Tishrei … 12 = Adar (Adar I in a leap year), 13 = Adar II. */
export function hebrewFromJdn(j: number): Ymd {
  const x = j - 0.5; // JD at the start of this civil day
  const count = Math.floor(((x - HEB_EPOCH) * 98496.0) / 35975351.0);
  let y = count - 1;
  for (let i = count; x >= hebrewToJd(i, 7, 1); i += 1) y += 1;
  let m = x < hebrewToJd(y, 1, 1) ? 7 : 1;
  while (x > hebrewToJd(y, m, monthDays(y, m))) m += 1;
  return { y, m, d: x - hebrewToJd(y, m, 1) + 1 };
}
export function hebrewMonthName(y: number, m: number): string {
  const names = ["Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul", "Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", hebrewLeap(y) ? "Adar I" : "Adar", "Adar II"];
  return names[m - 1]!;
}

// ── Maya long count (GMT correlation 584283) ────────────────────────────────

const MAYA_EPOCH = 584283;
export const TZOLKIN = ["Imix", "Ik'", "Ak'b'al", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat", "Muluk", "Ok", "Chuwen", "Eb'", "B'en", "Ix", "Men", "K'ib'", "Kab'an", "Etz'nab'", "Kawak", "Ajaw"];
export const HAAB = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax", "Sak'", "Keh", "Mak", "K'ank'in", "Muwan", "Pax", "K'ayab", "Kumk'u", "Wayeb'"];
export function mayaFromJdn(j: number) {
  const days = j - MAYA_EPOCH;
  const parts = [144000, 7200, 360, 20, 1].map((unit, i, all) => {
    const above = i === 0 ? Infinity : all[i - 1]!;
    return Math.floor((days % above) / unit);
  });
  const tz = { n: ((days + 3) % 13) + 1, name: TZOLKIN[(days + 19) % 20]! };
  const h = (days + 348) % 365;
  return { days, longCount: parts.join("."), tzolkin: tz, haab: { d: h % 20, month: HAAB[Math.floor(h / 20)]! } };
}

// ── Japanese era ────────────────────────────────────────────────────────────

const ERAS: { kanji: string; romaji: string; start: Ymd }[] = [
  { kanji: "令和", romaji: "Reiwa", start: { y: 2019, m: 5, d: 1 } },
  { kanji: "平成", romaji: "Heisei", start: { y: 1989, m: 1, d: 8 } },
  { kanji: "昭和", romaji: "Shōwa", start: { y: 1926, m: 12, d: 25 } },
  { kanji: "大正", romaji: "Taishō", start: { y: 1912, m: 7, d: 30 } },
  { kanji: "明治", romaji: "Meiji", start: { y: 1873, m: 1, d: 1 } }, // Gregorian dates in Japan begin 1873
];
export function japaneseEra(g: Ymd): { kanji: string; romaji: string; year: number; text: string } | null {
  const j = jdn(g);
  const era = ERAS.find((e) => j >= jdn(e.start));
  if (!era) return null;
  const year = g.y - era.start.y + (era.kanji === "明治" ? 6 : 1);
  return { kanji: era.kanji, romaji: era.romaji, year, text: `${era.kanji}${year === 1 ? "元" : year}年${g.m}月${g.d}日` };
}

// ── Sexagenary (간지) ────────────────────────────────────────────────────────

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const cycle = (i: number) => `${STEMS[i % 10]}${BRANCHES[i % 12]}`;
/** Day pillar: JDN 2451545 (2000-01-01) = 戊午, i.e. index (JDN + 49) mod 60. */
export function dayGanzhi(j: number): { hanja: string; index: number } {
  const i = (((j + 49) % 60) + 60) % 60;
  return { hanja: cycle(i), index: i };
}
export function yearGanzhi(g: Ymd) {
  const z = zodiacYearOf(new Date(Date.UTC(g.y, g.m - 1, g.d)));
  const i = (y: number) => (((y - 4) % 60) + 60) % 60;
  return {
    lichun: { year: z.byConvention.lichun.year, hanja: cycle(i(z.byConvention.lichun.year)), animal: z.byConvention.lichun.animalIndex },
    lunar: { year: z.byConvention.lunarNewYear.year, hanja: cycle(i(z.byConvention.lunarNewYear.year)), animal: z.byConvention.lunarNewYear.animalIndex },
    agree: z.byConvention.lichun.year === z.byConvention.lunarNewYear.year,
  };
}

// ── Everything at once ──────────────────────────────────────────────────────

export function allCalendars(g: Ymd) {
  const j = jdn(g);
  return {
    jdn: j,
    republican: republicanFromJdn(j),
    ganzhi: { year: yearGanzhi(g), day: dayGanzhi(j) },
    maya: mayaFromJdn(j),
    julian: julianFromJdn(j),
    islamic: islamicFromJdn(j),
    hebrew: hebrewFromJdn(j),
    japan: japaneseEra(g),
  };
}
export type AllCalendars = ReturnType<typeof allCalendars>;

/** Days lived on `today` (both Gregorian). */
export const daysBetween = (a: Ymd, b: Ymd) => jdn(b) - jdn(a);

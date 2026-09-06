/**
 * Birth-date 절기 badge for the public saju calculator.
 *
 * Prefers the KASI SpcdeInfo golden fixture (`solar-terms-kasi.json`, sampled
 * years inside 2000–2028). Years inside that API range but missing from the
 * fixture fall back to the local astronomy kernel (`getSolarTermDate`) for the
 * term *name* only — no live Spcde traffic. Outside 2000–2028 → `unavailable`
 * ("미제공"). Lookup exceptions → `null` so the UI can hide the badge.
 *
 * Holidays (`getRestDeInfo` / `getHoliDeInfo`) are intentionally out of scope.
 */
import golden from "./solar-terms-kasi.json";
import { getSolarTermDate } from "../kernel/astronomy";

/** API / fixture coverage (실측: totalCount 0 outside this window). */
export const KASI_YEAR_MIN = 2000;
export const KASI_YEAR_MAX = 2028;

/** termIndex 0..23 matching `getSolarTermDate` (입춘=0 … 대한=23). */
export const TERM_NAMES_KO = [
  "입춘", "우수", "경칩", "춘분", "청명", "곡우",
  "입하", "소만", "망종", "하지", "소서", "대서",
  "입추", "처서", "백로", "추분", "한로", "상강",
  "입동", "소설", "대설", "동지", "소한", "대한",
] as const;

/** 節 (month-pillar boundaries): even termIndex — 입춘·경칩·청명…소한. */
export const MONTH_BOUNDARY_TERM_INDEXES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22] as const;

/** Month branch for a 節 termIndex: 입춘→인(2) … 소한→축(1). */
export function monthBranchForTermIndex(termIndex: number): number {
  // Even indexes only; mid-qi terms inherit the preceding 節.
  const jie = termIndex % 2 === 0 ? termIndex : termIndex - 1;
  return (Math.floor(jie / 2) + 2) % 12;
}

export type JeolgiBadgeSource = "kasi" | "local";

export type JeolgiBadgeResult =
  | { status: "unavailable" }
  | {
      status: "ok";
      /** Korean canonical name (fixture / kernel). */
      nameKo: string;
      termIndex: number;
      /** KST calendar date of 절입 (YYYY-MM-DD), if known. */
      onsetDate: string | null;
      /** Optional KST clock HH:MM when from fixture. */
      onsetKst: string | null;
      source: JeolgiBadgeSource;
      /** Preceding 節 (month-pillar boundary) name — for engine consistency checks. */
      monthBoundaryNameKo: string;
      monthBoundaryTermIndex: number;
    };

interface FixtureTerm {
  date: string;
  kst: string;
  name: string;
}

const FIXTURE_TERMS = (golden.terms as FixtureTerm[]).filter((t) =>
  (TERM_NAMES_KO as readonly string[]).includes(t.name),
);

const NAME_TO_INDEX: Record<string, number> = Object.fromEntries(
  TERM_NAMES_KO.map((name, i) => [name, i]),
);

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function kstToInstant(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - KST_OFFSET_MS);
}

function fixtureOnset(t: FixtureTerm): Date {
  const [y, m, d] = t.date.split("-").map(Number);
  const [hh, mm] = t.kst.split(":").map(Number);
  return kstToInstant(y, m, d, hh, mm);
}

function formatKstDate(instant: Date): string {
  const shifted = new Date(instant.getTime() + KST_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yearsInFixture(): Set<number> {
  return new Set(FIXTURE_TERMS.map((t) => Number(t.date.slice(0, 4))));
}

function fromFixture(birth: Date): JeolgiBadgeResult | null {
  let best: FixtureTerm | null = null;
  let bestTime = -Infinity;
  for (const t of FIXTURE_TERMS) {
    const onset = fixtureOnset(t).getTime();
    if (onset <= birth.getTime() && onset >= bestTime) {
      best = t;
      bestTime = onset;
    }
  }
  if (!best) return null;
  const termIndex = NAME_TO_INDEX[best.name];
  if (termIndex === undefined) return null;
  const monthBoundaryTermIndex = termIndex % 2 === 0 ? termIndex : termIndex - 1;
  return {
    status: "ok",
    nameKo: best.name,
    termIndex,
    onsetDate: best.date,
    onsetKst: best.kst,
    source: "kasi",
    monthBoundaryNameKo: TERM_NAMES_KO[monthBoundaryTermIndex],
    monthBoundaryTermIndex,
  };
}

/**
 * Local kernel: scan term onsets for birthYear-1 .. birthYear+1 and pick the
 * latest onset ≤ birth. Same ordering as KASI names via TERM_NAMES_KO.
 */
function fromLocal(birth: Date, civilYear: number): JeolgiBadgeResult | null {
  let bestIndex = -1;
  let bestTime = -Infinity;
  let bestOnset: Date | null = null;
  for (const y of [civilYear - 1, civilYear, civilYear + 1]) {
    for (let i = 0; i < 24; i++) {
      const onset = getSolarTermDate(y, i);
      const t = onset.getTime();
      if (t <= birth.getTime() && t >= bestTime) {
        bestTime = t;
        bestIndex = i;
        bestOnset = onset;
      }
    }
  }
  if (bestIndex < 0 || !bestOnset) return null;
  const monthBoundaryTermIndex = bestIndex % 2 === 0 ? bestIndex : bestIndex - 1;
  return {
    status: "ok",
    nameKo: TERM_NAMES_KO[bestIndex],
    termIndex: bestIndex,
    onsetDate: formatKstDate(bestOnset),
    onsetKst: null,
    source: "local",
    monthBoundaryNameKo: TERM_NAMES_KO[monthBoundaryTermIndex],
    monthBoundaryTermIndex,
  };
}

/**
 * Resolve the 해당·직전 절기 for a civil KST birth. Never throws to callers —
 * failures become `null` (hide badge). Outside KASI years → `unavailable`.
 */
export function resolveJeolgiBadge(
  year: number,
  month: number,
  day: number,
  hour: number | null,
): JeolgiBadgeResult | null {
  try {
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }
    if (year < KASI_YEAR_MIN || year > KASI_YEAR_MAX) {
      return { status: "unavailable" };
    }

    const birth = kstToInstant(year, month, day, hour ?? 12, 0);
    const fixtureYears = yearsInFixture();

    // Prefer fixture when this civil year (or neighbours for New-Year edge) is sampled.
    const neighbours = [year - 1, year, year + 1];
    if (neighbours.some((y) => fixtureYears.has(y))) {
      const fromKasi = fromFixture(birth);
      if (fromKasi) return fromKasi;
    }

    return fromLocal(birth, year);
  } catch {
    return null;
  }
}

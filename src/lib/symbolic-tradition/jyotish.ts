import { getAscendantLongitude, getLunarLongitude } from "@/lib/ontology/natal/calculator";
import { getSolarLongitude } from "@/lib/ontology/kernel/astronomy";
import { getJulianDay } from "@/lib/ontology/kernel/time";

/**
 * 인도 점성(조티샤)의 출생 좌표 — 낙샤트라·라시·티티·요가·카라나·라그나.
 *
 * 2026-09-22 전 `ontology/vedic` 은 스스로 "간이 근사"라 적은 계산이었다.
 * 달 위치를 근사식으로 셈했고, 요가·카라나는 값이 고정("Vishkumbha", "Bava")
 * 이었으며, 인도식 황도로 옮기는 보정(아야남샤)이 없었다. 새로 세운다.
 *
 * - **사이더리얼 황도**: 회귀 황경에서 라히리(치트라팍샤) 아야남샤를 뺀다.
 *   인도 정부 공식 역법(Rashtriya Panchang)이 쓰는 보정이다. J2000 에서
 *   23°51′(23.853°), 해마다 세차 50.29″씩 는다 — 낙샤트라 폭(13°20′)에 비해
 *   오차가 무시할 만큼 작다.
 * - **달·해 위치**는 natal 엔진의 천문 계산(달은 미어스 급수, 약 0.1°)을 쓴다.
 * - **시각이 없으면** 그 달력 날짜가 걸칠 수 있는 모든 순간을 창으로 잡고,
 *   그동안 달이 지난 낙샤트라·라시를 모두 **후보**로 남긴다(달은 하루 약 13°).
 *   라그나(상승궁)는 시각과 도시가 모두 있을 때만.
 */

export const NAKSHATRA_SPAN = 360 / 27; // 13°20′
const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3°20′

/** 라히리 아야남샤(도). */
export function lahiriAyanamsa(date: Date): number {
  const years = (getJulianDay(date) - 2451545.0) / 365.25;
  return 23.853 + years * (50.29 / 3600);
}

const norm = (x: number) => ((x % 360) + 360) % 360;

export function siderealMoon(date: Date): number {
  return norm(getLunarLongitude(date) - lahiriAyanamsa(date));
}

export function siderealSun(date: Date): number {
  return norm(getSolarLongitude(date) - lahiriAyanamsa(date));
}

/** 낙샤트라 1~27, 파다 1~4 */
export function nakshatraOf(moonSidereal: number): { nakshatra: number; pada: number } {
  const n = Math.floor(moonSidereal / NAKSHATRA_SPAN);
  const pada = Math.floor((moonSidereal - n * NAKSHATRA_SPAN) / PADA_SPAN);
  return { nakshatra: n + 1, pada: pada + 1 };
}

/** 라시(인도식 궁) 1~12, 1 = 메샤(양) */
export function rashiOf(longitude: number): number {
  return Math.floor(norm(longitude) / 30) + 1;
}

/** 티티 1~30 (1~15 슈클라, 16~30 크리슈나). 달과 해의 거리를 12°씩 */
export function tithiOf(moonSid: number, sunSid: number): number {
  return Math.floor(norm(moonSid - sunSid) / 12) + 1;
}

/** 요가 1~27. 해와 달 황경의 합을 13°20′씩 */
export function yogaOf(moonSid: number, sunSid: number): number {
  return Math.floor(norm(moonSid + sunSid) / NAKSHATRA_SPAN) + 1;
}

/**
 * 카라나 — 티티의 반(6°)마다 하나. 한 달 60칸 중
 * 0 = 킴스투그나(고정), 1~56 = 움직이는 일곱이 여덟 번 돈다,
 * 57 샤쿠니 · 58 차투시파다 · 59 나가(고정).
 */
export type KaranaId =
  | "kimstughna" | "bava" | "balava" | "kaulava" | "taitila" | "garaja" | "vanija" | "vishti"
  | "shakuni" | "chatushpada" | "naga";
const MOVABLE: KaranaId[] = ["bava", "balava", "kaulava", "taitila", "garaja", "vanija", "vishti"];

export function karanaOf(moonSid: number, sunSid: number): KaranaId {
  const k = Math.floor(norm(moonSid - sunSid) / 6);
  if (k === 0) return "kimstughna";
  if (k === 57) return "shakuni";
  if (k === 58) return "chatushpada";
  if (k === 59) return "naga";
  return MOVABLE[(k - 1) % 7];
}

/** 낙샤트라의 주인 행성(빔쇼타리 순서) — 케투부터 아홉이 세 번 돈다 */
export type Graha = "ketu" | "venus" | "sun" | "moon" | "mars" | "rahu" | "jupiter" | "saturn" | "mercury";
const LORDS: Graha[] = ["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury"];
export function nakshatraLord(nakshatra: number): Graha {
  return LORDS[(nakshatra - 1) % 9];
}

export interface JyotishCoordinates {
  /** 달의 낙샤트라. 시각을 알면 하나, 모르면 그날 걸친 것 전부 */
  nakshatra: number[];
  /** 시각을 알 때만 */
  pada: number | null;
  /** 달의 라시(찬드라 라시) 후보 */
  moonRashi: number[];
  /** 해의 라시 — 하루에 1° 남짓 움직여 날짜만으로 거의 정해진다 */
  sunRashi: number;
  /** 시각을 알 때만 */
  tithi: number | null;
  yoga: number | null;
  karana: KaranaId | null;
  /** 라그나(인도식 상승궁) — 시각과 도시가 모두 있을 때만 */
  lagna: number | null;
}

const HOUR = 3_600_000;

function civilToUtc(civilDate: string, civilTime: string, offsetMinutes: number): number {
  const [y, m, d] = civilDate.split("-").map(Number);
  const [hh, mm] = civilTime.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) - offsetMinutes * 60_000;
}

export function jyotishCoordinates(input: {
  civilDate: string;
  civilTime: string | null;
  utcOffsetMinutes: number | null;
  latitude: number | null;
  longitude: number | null;
}): JyotishCoordinates {
  const { civilDate, civilTime, utcOffsetMinutes, latitude, longitude } = input;
  if (civilTime && utcOffsetMinutes !== null) {
    const at = new Date(civilToUtc(civilDate, civilTime, utcOffsetMinutes));
    const moon = siderealMoon(at);
    const sun = siderealSun(at);
    const { nakshatra, pada } = nakshatraOf(moon);
    return {
      nakshatra: [nakshatra],
      pada,
      moonRashi: [rashiOf(moon)],
      sunRashi: rashiOf(sun),
      tithi: tithiOf(moon, sun),
      yoga: yogaOf(moon, sun),
      karana: karanaOf(moon, sun),
      lagna: latitude !== null && longitude !== null
        ? rashiOf(getAscendantLongitude(at, latitude, longitude) - lahiriAyanamsa(at))
        : null,
    };
  }
  // 시각이 없으면 그 날짜가 걸칠 수 있는 모든 순간 — 도시가 있으면 현지 하루,
  // 없으면 지구상 어느 시간대의 하루든(UTC+14 ~ UTC−12).
  const start = utcOffsetMinutes !== null ? civilToUtc(civilDate, "00:00", utcOffsetMinutes) : civilToUtc(civilDate, "00:00", 14 * 60);
  const end = utcOffsetMinutes !== null ? start + 24 * HOUR : civilToUtc(civilDate, "00:00", -12 * 60) + 24 * HOUR;
  const nak: number[] = [];
  const ras: number[] = [];
  // 달은 2시간에 최대 1.3° — 낙샤트라(13.3°)를 건너뛸 수 없다
  for (let t = start; ; t = Math.min(t + 2 * HOUR, end)) {
    const moon = siderealMoon(new Date(t));
    const n = nakshatraOf(moon).nakshatra;
    const r = rashiOf(moon);
    if (!nak.includes(n)) nak.push(n);
    if (!ras.includes(r)) ras.push(r);
    if (t >= end) break;
  }
  return {
    nakshatra: nak,
    pada: null,
    moonRashi: ras,
    sunRashi: rashiOf(siderealSun(new Date((start + end) / 2))),
    tithi: null,
    yoga: null,
    karana: null,
    lagna: null,
  };
}

export function isJyotishCoordinates(value: unknown): value is JyotishCoordinates {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<JyotishCoordinates>;
  const intIn = (n: unknown, lo: number, hi: number) => Number.isInteger(n) && (n as number) >= lo && (n as number) <= hi;
  const listIn = (l: unknown, lo: number, hi: number) => Array.isArray(l) && l.length >= 1 && l.length <= 4 && l.every((n) => intIn(n, lo, hi));
  const nullOr = (n: unknown, lo: number, hi: number) => n === null || intIn(n, lo, hi);
  return listIn(v.nakshatra, 1, 27) && nullOr(v.pada, 1, 4) && listIn(v.moonRashi, 1, 12) && intIn(v.sunRashi, 1, 12)
    && nullOr(v.tithi, 1, 30) && nullOr(v.yoga, 1, 27) && nullOr(v.lagna, 1, 12)
    && (v.karana === null || (typeof v.karana === "string"));
}

/**
 * 참가자에게 싣는 몫 — 달의 낙샤트라·라시 후보와 라그나.
 * 티티·요가·카라나는 태어난 순간의 하늘이라 두 사람을 견주는 데 쓰지 않는다.
 */
export type JyotishProfile = Pick<JyotishCoordinates, "nakshatra" | "moonRashi" | "lagna">;

export function jyotishProfile(coordinates: JyotishCoordinates): JyotishProfile {
  return { nakshatra: coordinates.nakshatra, moonRashi: coordinates.moonRashi, lagna: coordinates.lagna };
}

/**
 * 타라(Tara) — 한 사람의 낙샤트라에서 상대의 낙샤트라까지 세어(자기 자리가 1)
 * 아홉으로 나눈 나머지. 고전 궁합(아슈타쿠타)의 타라 쿠타가 두 방향으로 센다.
 * 1 잔마 · 2 삼파트 · 3 비파트 · 4 크셰마 · 5 프라티야리 · 6 사다나 · 7 나이다나
 * · 8 미트라 · 9 파라마 미트라. 전통은 3·5·7 을 어려운 자리로 본다.
 */
export function taraOf(from: number, to: number): number {
  const count = ((((to - from) % 27) + 27) % 27) + 1;
  return ((count - 1) % 9) + 1;
}

export const DIFFICULT_TARA = new Set([3, 5, 7]);

export function isJyotishProfile(value: unknown): value is JyotishProfile {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<JyotishProfile>;
  const intIn = (n: unknown, lo: number, hi: number) => Number.isInteger(n) && (n as number) >= lo && (n as number) <= hi;
  const listIn = (l: unknown, lo: number, hi: number) => Array.isArray(l) && l.length >= 1 && l.length <= 4 && l.every((n) => intIn(n, lo, hi));
  return listIn(v.nakshatra, 1, 27) && listIn(v.moonRashi, 1, 12) && (v.lagna === null || intIn(v.lagna, 1, 12));
}

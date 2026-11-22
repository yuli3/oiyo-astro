// 지금 시각을 조선 시각으로 — 12시·초정·96각/100각·경점·인정/파루.
// 근거: 한국민족문화대백과 E0080838(12시·100각), E0080839(시헌력 96각), E0047016(인정·파루),
// E0047854(자격루), E0035191(앙부일구), 실록위키 「인정」「파루」「주야시각」, 한국천문연구원 천문학습관.
// 계산은 한양(서울) 시태양시 기준 근사치다. 혼각·효각은 세종 때 규칙(일몰 후·일출 전 2.5각)을 쓴다.

export const SEOUL = { lat: 37.5665, lon: 126.978 } as const;
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const ANIMALS = ["🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑", "🐵", "🐔", "🐶", "🐷"] as const;
export const KAK_NAMES = ["초", "일", "이", "삼"] as const;
/** 세종 때 1각(하루 100각) = 14.4분, 시헌력 1각(하루 96각) = 15분 */
export const KAK100 = 14.4;
export const KAK96 = 15;
const HON = 2.5 * KAK100; // 혼각·효각: 일몰 후·일출 전 2.5각

const rad = Math.PI / 180;
const mod = (a: number, m: number) => ((a % m) + m) % m;

function dayOfYear(month: number, day: number): number {
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[month - 1]! + day;
}

/** NOAA 근사식: 균시차(분)와 적위(라디안) */
export function sunParams(doy: number): { eqTime: number; decl: number } {
  const g = ((2 * Math.PI) / 365) * (doy - 1);
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  return { eqTime, decl };
}

/** 한국 표준시(분) → 한양 시태양시(분). 표준시는 동경 135°, 서울은 약 127°라 30분 남짓 늦다. */
export const kstToSolar = (kst: number, eqTime: number) => mod(kst - 540 + 4 * SEOUL.lon + eqTime, 1440);
export const solarToKst = (solar: number, eqTime: number) => mod(solar + 540 - 4 * SEOUL.lon - eqTime, 1440);

export type Strike = { kind: "bell" | "drum" | "gong"; at: number; label: string };

export type JoseonTime = {
  kst: number;
  solar: number;
  si: number; // 0=자 … 11=해
  half: "초" | "정";
  kak96: number; // 0..3
  sinceSi: number; // 시 시작 뒤 분
  kak100: number; // 0..8 (이 시 안에서)
  sunrise: number; // 시태양시
  sunset: number;
  night: null | { gyeong: number; jeom: number };
  dusk: boolean; // 일몰 뒤 혼각 전·효각 뒤 일출 전
  injeong: number; // 시태양시
  paru: number;
  curfew: boolean;
  last: Strike;
  eqTime: number;
};

export function sunTimes(doy: number): { sunrise: number; sunset: number; eqTime: number } {
  const { eqTime, decl } = sunParams(doy);
  const phi = SEOUL.lat * rad;
  const cosH = Math.cos(90.833 * rad) / (Math.cos(phi) * Math.cos(decl)) - Math.tan(phi) * Math.tan(decl);
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;
  return { sunrise: 720 - 4 * H, sunset: 720 + 4 * H, eqTime };
}

/** kst: 0..1439분, month/day: 양력 날짜 */
export function joseonTime(kst: number, month: number, day: number): JoseonTime {
  const { sunrise, sunset, eqTime } = sunTimes(dayOfYear(month, day));
  const solar = kstToSolar(kst, eqTime);
  const fromJa = mod(solar + 60, 1440); // 자초(23시) 기준
  const si = Math.floor(fromJa / 120);
  const sinceSi = fromJa - si * 120;
  const half = sinceSi < 60 ? "초" : "정";
  const kak96 = Math.min(3, Math.floor((sinceSi % 60) / KAK96));
  const kak100 = Math.min(8, Math.floor(sinceSi / KAK100));

  const hon = sunset + HON;
  const hyo = sunrise - HON;
  const nightLen = mod(hyo - hon, 1440);
  const gLen = nightLen / 5;
  const jLen = gLen / 5;
  const injeong = mod(hon + 3 * jLen, 1440); // 1경 3점이 끝날 때 종 28번
  const paru = mod(hon + 4 * gLen + 2 * jLen, 1440); // 5경 3점 시작에 33번
  const sinceHon = mod(solar - hon, 1440);
  const inNight = sinceHon < nightLen;
  const night = inNight ? { gyeong: Math.min(5, Math.floor(sinceHon / gLen) + 1), jeom: Math.min(5, Math.floor((sinceHon % gLen) / jLen) + 1) } : null;
  const dusk = !inNight && (solar > sunset || solar < sunrise);
  const curfew = mod(solar - injeong, 1440) < mod(paru - injeong, 1440);

  // 자격루: 시는 종, 경은 북, 점은 징
  const events: Strike[] = [];
  const siStart = mod(solar - sinceSi, 1440);
  events.push({ kind: "bell", at: siStart, label: `${BRANCHES[si]}시` });
  if (night) {
    const gStart = hon + (night.gyeong - 1) * gLen;
    const jStart = gStart + (night.jeom - 1) * jLen;
    if (night.jeom === 1) events.push({ kind: "drum", at: mod(gStart, 1440), label: `${night.gyeong}경` });
    else events.push({ kind: "gong", at: mod(jStart, 1440), label: `${night.gyeong}경 ${night.jeom}점` });
  }
  const ago = (e: Strike) => mod(solar - e.at, 1440);
  const last = events.reduce((a, b) => (ago(b) < ago(a) ? b : a));
  return { kst, solar, si, half, kak96, sinceSi, kak100, sunrise, sunset, night, dusk, injeong, paru, curfew, last, eqTime };
}

export const siName = (t: JoseonTime) => `${BRANCHES[t.si]}시 ${t.half}${KAK_NAMES[t.kak96]}각`;
export const hhmm = (m: number) => {
  const r = Math.round(mod(m, 1440)) % 1440;
  return `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
};

export type Pick = { kst: number; month: number; day: number };
export const formatPick = (p: Pick) => `t=${hhmm(p.kst).replace(":", "")}&d=${String(p.month).padStart(2, "0")}${String(p.day).padStart(2, "0")}`;
export function parsePick(search: string): Pick | null {
  const q = new URLSearchParams(search);
  const t = q.get("t");
  const d = q.get("d");
  if (!t || !d || !/^\d{4}$/.test(t) || !/^\d{4}$/.test(d)) return null;
  const hh = Number(t.slice(0, 2));
  const mi = Number(t.slice(2));
  if (hh > 23 || mi > 59) return null;
  const kst = hh * 60 + mi;
  const month = Number(d.slice(0, 2));
  const day = Number(d.slice(2));
  const dim = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > dim[month - 1]!) return null;
  return { kst, month, day };
}

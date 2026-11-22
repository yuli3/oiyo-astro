// 내 생일 밤 1426 하늘 — 1426년 같은 날 한양의 밤하늘.
// 행성: JPL "Approximate Positions of the Planets" 표 2a(기원전 3000~서기 3000년용 케플러 요소).
// 달: Meeus 『Astronomical Algorithms』 저정밀 식(주요 항만). 수백 년 전이라 위치 오차는 1~2° 안팎이다.
// 날짜는 sillok-1426과 같이 그레고리력을 거꾸로 늘린 날짜(계절상 같은 날)를 쓴다.

import { jdn } from "./sillok-1426";
import { SEOUL, sunParams } from "./joseon-time";

const rad = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;
const sin = (d: number) => Math.sin(d * rad);
const cos = (d: number) => Math.cos(d * rad);

type El = [number, number]; // value at J2000, rate per Julian century
type Elements = { a: El; e: El; I: El; L: El; w: El; O: El; x?: [number, number, number, number] };

// a(au), e, I(°), L(°), ϖ(°), Ω(°); x = b, c, s, f extra terms for M (Jupiter, Saturn)
const PLANETS: Record<"mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn", Elements> = {
  mercury: { a: [0.38709843, 0], e: [0.20563661, 0.00002123], I: [7.00559432, -0.00590158], L: [252.25166724, 149472.67486623], w: [77.45771895, 0.15940013], O: [48.33961819, -0.12214182] },
  venus: { a: [0.72332102, -0.00000026], e: [0.00676399, -0.00005107], I: [3.39777545, 0.00043494], L: [181.9797085, 58517.8156026], w: [131.76755713, 0.05679648], O: [76.67261496, -0.27274174] },
  earth: { a: [1.00000018, -0.00000003], e: [0.01673163, -0.00003661], I: [-0.00054346, -0.01337178], L: [100.46691572, 35999.37306329], w: [102.93005885, 0.3179526], O: [-5.11260389, -0.24123856] },
  mars: { a: [1.52371243, 0.00000097], e: [0.09336511, 0.00009149], I: [1.85181869, -0.00724757], L: [-4.56813164, 19140.29934243], w: [-23.91744784, 0.45223625], O: [49.71320984, -0.26852431] },
  jupiter: { a: [5.20248019, -0.00002864], e: [0.0485359, 0.00018026], I: [1.29861416, -0.00322699], L: [34.33479152, 3034.90371757], w: [14.27495244, 0.18199196], O: [100.29282654, 0.13024619], x: [-0.00012452, 0.0606406, -0.35635438, 38.35125] },
  saturn: { a: [9.54149883, -0.00003065], e: [0.05550825, -0.00032044], I: [2.49424102, 0.00451969], L: [50.07571329, 1222.11494724], w: [92.86136063, 0.54179478], O: [113.63998702, -0.25015002], x: [0.00025899, -0.13434469, 0.87320147, 38.35125] },
};

/** Heliocentric ecliptic (J2000) rectangular coordinates, au. */
export function helio(p: Elements, T: number): [number, number, number] {
  const v = (k: El) => k[0] + k[1] * T;
  const a = v(p.a);
  const e = v(p.e);
  const I = v(p.I);
  const L = v(p.L);
  const w = v(p.w);
  const O = v(p.O);
  let M = L - w;
  if (p.x) {
    const [b, c, s, f] = p.x;
    M += b * T * T + c * cos(f * T) + s * sin(f * T);
  }
  M = norm(M + 180) - 180;
  const eDeg = e / rad;
  let E = M + eDeg * sin(M);
  for (let k = 0; k < 8; k += 1) E += (M - (E - eDeg * sin(E))) / (1 - e * cos(E));
  const xp = a * (cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * sin(E);
  const om = w - O;
  const x = (cos(om) * cos(O) - sin(om) * sin(O) * cos(I)) * xp + (-sin(om) * cos(O) - cos(om) * sin(O) * cos(I)) * yp;
  const y = (cos(om) * sin(O) + sin(om) * cos(O) * cos(I)) * xp + (-sin(om) * sin(O) + cos(om) * cos(O) * cos(I)) * yp;
  const z = sin(om) * sin(I) * xp + cos(om) * sin(I) * yp;
  return [x, y, z];
}

const PRECESSION = 1.396971; // general precession in longitude, ° per century (J2000 → date)

export type Body = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";
export const PLANET_KEYS = ["mercury", "venus", "mars", "jupiter", "saturn"] as const;

/** Geocentric ecliptic longitude and latitude, equinox of date, degrees. */
export function eclipticOf(body: Body, jd: number): { lon: number; lat: number } {
  const T = (jd - 2451545) / 36525;
  if (body === "moon") {
    const d = jd - 2451545;
    const Lp = 218.316 + 13.176396 * d;
    const Mp = 134.963 + 13.064993 * d;
    const F = 93.272 + 13.22935 * d;
    const D = 297.85 + 12.190749 * d;
    const M = 357.529 + 0.98560028 * d;
    const lon = Lp + 6.289 * sin(Mp) + 1.274 * sin(2 * D - Mp) + 0.658 * sin(2 * D) + 0.214 * sin(2 * Mp) - 0.186 * sin(M) - 0.114 * sin(2 * F);
    return { lon: norm(lon), lat: 5.128 * sin(F) };
  }
  const [ex, ey, ez] = helio(PLANETS.earth, T);
  let x = -ex;
  let y = -ey;
  let z = -ez;
  if (body !== "sun") {
    const [px, py, pz] = helio(PLANETS[body], T);
    x += px;
    y += py;
    z += pz;
  }
  const lon = Math.atan2(y, x) / rad + PRECESSION * T;
  const lat = Math.atan2(z, Math.hypot(x, y)) / rad;
  return { lon: norm(lon), lat };
}

/** Altitude and azimuth (from north, clockwise) seen from Hanyang. */
export function horizontal(lon: number, lat: number, jd: number): { alt: number; az: number } {
  const T = (jd - 2451545) / 36525;
  const eps = 23.439291 - 0.0130042 * T;
  const ra = Math.atan2(sin(lon) * cos(eps) - Math.tan(lat * rad) * sin(eps), cos(lon)) / rad;
  const dec = Math.asin(sin(lat) * cos(eps) + cos(lat) * sin(eps) * sin(lon)) / rad;
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T);
  const H = norm(gmst + SEOUL.lon - ra);
  const phi = SEOUL.lat;
  const alt = Math.asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)) / rad;
  const az = norm(Math.atan2(-cos(dec) * sin(H), sin(dec) * cos(phi) - cos(dec) * sin(phi) * cos(H)) / rad);
  return { alt, az };
}

/** JD at a given Hanyang local apparent solar time (minutes) on a proleptic Gregorian date. */
export function jdAtSolar(year: number, month: number, day: number, solarMin: number, doy: number): number {
  const { eqTime } = sunParams(doy);
  const utMin = solarMin - 4 * SEOUL.lon - eqTime;
  return jdn(year, month, day) - 0.5 + utMin / 1440;
}

/** 24절기 index (0 = 춘분 at 0°), by the sun's ecliptic longitude; each 15°. */
export const SOLAR_TERMS_KO = ["춘분", "청명", "곡우", "입하", "소만", "망종", "하지", "소서", "대서", "입추", "처서", "백로", "추분", "한로", "상강", "입동", "소설", "대설", "동지", "소한", "대한", "입춘", "우수", "경칩"] as const;
export const SOLAR_TERMS_HANJA = ["春分", "淸明", "穀雨", "立夏", "小滿", "芒種", "夏至", "小暑", "大暑", "立秋", "處暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "驚蟄"] as const;
export const termIndex = (sunLon: number) => Math.floor(norm(sunLon) / 15);

/** Moon's elongation east of the sun, 0..360 (0 = new, 180 = full). */
export const elongation = (moonLon: number, sunLon: number) => norm(moonLon - sunLon);
export function phaseKey(elong: number): "new" | "waxingCrescent" | "firstQuarter" | "waxingGibbous" | "full" | "waningGibbous" | "lastQuarter" | "waningCrescent" {
  const k = Math.floor(norm(elong + 22.5) / 45);
  return (["new", "waxingCrescent", "firstQuarter", "waxingGibbous", "full", "waningGibbous", "lastQuarter", "waningCrescent"] as const)[k]!;
}
export const PHASE_EMOJI = { new: "🌑", waxingCrescent: "🌒", firstQuarter: "🌓", waxingGibbous: "🌔", full: "🌕", waningGibbous: "🌖", lastQuarter: "🌗", waningCrescent: "🌘" } as const;

export type SkyObject = { body: Body; alt: number; az: number };
export type Sky = { jd: number; sunAlt: number; objects: SkyObject[] };

export function skyAt(jd: number): Sky {
  const sunE = eclipticOf("sun", jd);
  const sun = horizontal(sunE.lon, sunE.lat, jd);
  const objects: SkyObject[] = (["moon", ...PLANET_KEYS] as const).map((b) => {
    const e = eclipticOf(b, jd);
    const h = horizontal(e.lon, e.lat, jd);
    return { body: b, alt: h.alt, az: h.az };
  });
  return { jd, sunAlt: sun.alt, objects };
}

export const visible = (o: SkyObject) => o.alt > 3;

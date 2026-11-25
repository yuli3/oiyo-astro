/**
 * 태어난 순간의 해·달 — 출생 시각·장소의 실제 태양·달 위치.
 *
 * - 위치는 astronomy-engine(VSOP87·ELP 기반, 1분각 안팎)으로 브라우저에서 계산한다. API가 없다.
 * - 3D 장면 좌표계: 지구 중심, 그날의 적도 좌표(EQD)를 three.js 축으로 옮긴다.
 *   three (x, y, z) = (X_eq, Z_eq, −Y_eq) — y가 북극, 춘분점이 +x.
 *   이렇게 두면 지구를 y축으로 그리니치 시항성시(GAST)만큼 돌렸을 때 텍스처 경도 0°가
 *   적경 GAST를 가리켜, 출생지가 실제로 해·달을 향한 각도가 그대로 나온다.
 * - 출생 시각은 출생지의 벽시계 시각이다. IANA 시간대(zoneId)로 순간을 정하므로
 *   1987–88년 한국 서머타임 같은 과거 오프셋도 반영된다(resolveZonedCivilTime).
 * 2026-11-25.
 */
import * as Astronomy from "astronomy-engine";
import { resolveZonedCivilTime } from "./user/birth-record";

export type Vec3 = [number, number, number];

export interface BirthPlace {
  id: string;
  lat: number;
  lon: number;
  zoneId: string;
}

export interface BodyState {
  /** topocentric azimuth, degrees from north through east */
  az: number;
  /** topocentric altitude with standard refraction, degrees */
  alt: number;
  /** geocentric apparent ecliptic longitude of date, degrees */
  eclLon: number;
  /** unit vector from Earth's centre, three.js scene axes */
  dir: Vec3;
  /** distance from Earth's centre, km */
  distanceKm: number;
}

export type PhaseKey =
  | "new"
  | "waxingCrescent"
  | "firstQuarter"
  | "waxingGibbous"
  | "full"
  | "waningGibbous"
  | "lastQuarter"
  | "waningCrescent";

export interface BirthSky {
  instant: Date;
  offsetMinutes: number;
  /** true when the wall-clock time occurred twice (DST fall-back); the earlier instant is used */
  ambiguous: boolean;
  /** Greenwich apparent sidereal time, degrees — rotation of the Earth mesh */
  gastDeg: number;
  sun: BodyState;
  moon: BodyState & {
    /** illuminated fraction 0..1 */
    illumination: number;
    /** Moon's ecliptic elongation east of the Sun, 0..360 (0 new, 180 full) */
    elongation: number;
    /** days since the last new moon (mean synodic month) */
    ageDays: number;
    phase: PhaseKey;
    /** unit normal of the Moon's orbital plane around the date, scene axes */
    orbitNormal: Vec3;
  };
  /** 24 solar-term index from the spring equinox (0 = 춘분 at 0°) */
  termIndex: number;
  /** tropical zodiac sign index from Aries (0..11) */
  signIndex: number;
  daylight: "day" | "twilight" | "night";
}

export type BirthSkyResult =
  | { status: "ok"; sky: BirthSky }
  | { status: "nonexistent" }
  | { status: "invalid" };

const KM_PER_AU = Astronomy.KM_PER_AU;
const SYNODIC_DAYS = 29.530588853;
const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** EQD vector → scene axes. */
function toScene(v: { x: number; y: number; z: number }): Vec3 {
  return [v.x, v.z, -v.y];
}

function unit(v: Vec3): Vec3 {
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function geoOfDate(body: Astronomy.Body, date: Date) {
  const eqj = Astronomy.GeoVector(body, date, true);
  return Astronomy.RotateVector(Astronomy.Rotation_EQJ_EQD(date), eqj);
}

export function phaseKey(elong: number): PhaseKey {
  const k = Math.floor(norm360(elong + 22.5) / 45);
  return (["new", "waxingCrescent", "firstQuarter", "waxingGibbous", "full", "waningGibbous", "lastQuarter", "waningCrescent"] as const)[k]!;
}

/** Scene-axes position of a surface point (lat/lon) on a unit Earth, before Earth rotation. */
export function surfaceLocal(lat: number, lon: number): Vec3 {
  const p = (lat * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  return [Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l)];
}

/** Rotate a scene vector about +y by `deg` (the same as three's rotation.y). */
export function rotateY(v: Vec3, deg: number): Vec3 {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]];
}

export function computeBirthSkyAt(instant: Date, place: Pick<BirthPlace, "lat" | "lon">): Omit<BirthSky, "offsetMinutes" | "ambiguous"> {
  const observer = new Astronomy.Observer(place.lat, place.lon, 0);
  const horizon = (body: Astronomy.Body) => {
    const eq = Astronomy.Equator(body, instant, observer, true, true);
    return Astronomy.Horizon(instant, observer, eq.ra, eq.dec, "normal");
  };

  const sunVec = geoOfDate(Astronomy.Body.Sun, instant);
  const moonVec = geoOfDate(Astronomy.Body.Moon, instant);
  const moonLater = geoOfDate(Astronomy.Body.Moon, new Date(instant.getTime() + 3_600_000));
  const sunH = horizon(Astronomy.Body.Sun);
  const moonH = horizon(Astronomy.Body.Moon);
  const sunLon = Astronomy.SunPosition(instant).elon;
  const moonLon = Astronomy.EclipticGeoMoon(instant).lon;
  const elongation = Astronomy.MoonPhase(instant);
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, instant).phase_fraction;
  const moonScene = toScene(moonVec);

  return {
    instant,
    gastDeg: norm360(Astronomy.SiderealTime(instant) * 15),
    sun: {
      az: sunH.azimuth,
      alt: sunH.altitude,
      eclLon: sunLon,
      dir: unit(toScene(sunVec)),
      distanceKm: Math.hypot(sunVec.x, sunVec.y, sunVec.z) * KM_PER_AU,
    },
    moon: {
      az: moonH.azimuth,
      alt: moonH.altitude,
      eclLon: moonLon,
      dir: unit(moonScene),
      distanceKm: Math.hypot(moonVec.x, moonVec.y, moonVec.z) * KM_PER_AU,
      illumination: illum,
      elongation,
      ageDays: (elongation / 360) * SYNODIC_DAYS,
      phase: phaseKey(elongation),
      orbitNormal: unit(cross(moonScene, toScene(moonLater))),
    },
    termIndex: Math.floor(norm360(sunLon) / 15),
    signIndex: Math.floor(norm360(sunLon) / 30),
    // Civil twilight ends at −6°; the Sun's upper limb + refraction rise at about −0.833°.
    daylight: sunH.altitude > -0.833 ? "day" : sunH.altitude > -6 ? "twilight" : "night",
  };
}

/**
 * civilDate "YYYY-MM-DD", civilTime "HH:MM" or null (unknown → local noon, stated in the UI).
 */
export function computeBirthSky(input: { civilDate: string; civilTime: string | null; place: BirthPlace }): BirthSkyResult {
  let resolution;
  try {
    resolution = resolveZonedCivilTime({
      civilDate: input.civilDate,
      civilTime: input.civilTime ?? "12:00",
      zoneId: input.place.zoneId,
    });
  } catch {
    return { status: "invalid" };
  }
  if (resolution.status === "invalid-zone") return { status: "invalid" };
  if (resolution.status === "nonexistent") return { status: "nonexistent" };
  const pickd = resolution.status === "ambiguous" ? resolution.candidates[0]! : resolution;
  const year = Number(input.civilDate.slice(0, 4));
  // astronomy-engine is valid far wider, but IANA history and our copy assume modern dates.
  if (year < 1800 || year > 2200) return { status: "invalid" };
  return {
    status: "ok",
    sky: {
      ...computeBirthSkyAt(pickd.instant, input.place),
      offsetMinutes: pickd.offsetMinutes,
      ambiguous: resolution.status === "ambiguous",
    },
  };
}

/** 8-point compass index (0 = N) for an azimuth. */
export function compassIndex(az: number): number {
  return Math.floor(norm360(az + 22.5) / 45);
}

/** Angle between two unit vectors, degrees. */
export function separationDeg(a: Vec3, b: Vec3): number {
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return (Math.acos(Math.min(1, Math.max(-1, d))) * 180) / Math.PI;
}

// ---- share query ----

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface BirthSkyQuery {
  date: string;
  time: string | null;
  place: string;
}

export function parseBirthSkyQuery(search: string): BirthSkyQuery | null {
  const p = new URLSearchParams(search);
  const date = p.get("d");
  const time = p.get("t");
  const place = p.get("p");
  if (!date || !DATE_RE.test(date) || !place || !/^[a-z]{2,20}$/.test(place)) return null;
  return { date, time: time && TIME_RE.test(time) ? time : null, place };
}

export function formatBirthSkyQuery(q: BirthSkyQuery): string {
  const p = new URLSearchParams({ d: q.date, p: q.place });
  if (q.time) p.set("t", q.time);
  return `?${p.toString()}`;
}

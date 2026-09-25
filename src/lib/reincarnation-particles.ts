import { REINCARNATION_COUNTRIES, weightTotal, type ReincarnationCountry, type WeightMode } from "./reincarnation";

/**
 * 환생 지구본의 "출생 먼지"를 만드는 순수 함수들.
 *
 * 점은 장식이 아니라 데이터다: 나라마다 점 개수는 가중치(출생 또는 인구)에 비례하고,
 * 점 하나가 몇 명인지는 `dotValue`로 화면에 그대로 적는다. 점이 0개인 작은 나라도
 * 추첨에서는 빠지지 않는다 — 추첨은 `pickCountry`가 하고, 점은 비율을 보여줄 뿐이다.
 */

export type BorderRings = Record<string, number[][][]>;

export interface DustDot {
  iso3: string;
  lat: number;
  lon: number;
}

export const DUST_TOTAL = 6000;

/** 초당 출생 수 — 반짝임을 실제 출생 속도로 켜기 위해 쓴다. */
export function birthsPerSecond(): number {
  return weightTotal("births") / (365.25 * 24 * 60 * 60);
}

/** 점 하나가 대표하는 사람 수. */
export function dotValue(mode: WeightMode, total = DUST_TOTAL): number {
  return total > 0 ? weightTotal(mode) / total : 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 최대 잔여 방식 배분: 합이 정확히 `total`이고 각 몫은 비율에서 1 이내로 벗어난다. */
export function allocateDots(weights: number[], total: number): number[] {
  const sum = weights.reduce((acc, w) => acc + Math.max(0, w), 0);
  if (sum <= 0 || total <= 0) return weights.map(() => 0);
  const exact = weights.map((w) => (Math.max(0, w) / sum) * total);
  const out = exact.map(Math.floor);
  let left = total - out.reduce((acc, n) => acc + n, 0);
  const order = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of order) {
    if (left <= 0) break;
    out[index] += 1;
    left -= 1;
  }
  return out;
}

/** ring은 [lon, lat] 좌표 목록. 평면 ray casting. */
export function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** 위도 보정한 근사 면적 — 섬이 여러 개인 나라에서 어느 ring에 점을 둘지 고르는 데만 쓴다. */
export function ringArea(ring: number[][]): number {
  let twice = 0;
  let latSum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    twice += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    latSum += ring[i][1];
  }
  const meanLat = ring.length ? latSum / ring.length : 0;
  return Math.abs(twice / 2) * Math.cos((meanLat * Math.PI) / 180);
}

function pickRing(rings: number[][][], areas: number[], areaSum: number, rand: () => number): number[][] {
  let ticket = rand() * areaSum;
  for (let i = 0; i < rings.length; i += 1) {
    ticket -= areas[i];
    if (ticket <= 0) return rings[i];
  }
  return rings[rings.length - 1];
}

/** 나라 경계 안에 `count`개 점을 뿌린다. 경계가 없거나 표본이 실패하면 지리 중심 주변에 둔다. */
export function sampleCountryDots(
  row: Pick<ReincarnationCountry, "iso3" | "lat" | "lon">,
  rings: number[][][] | undefined,
  count: number,
  rand: () => number,
): DustDot[] {
  const out: DustDot[] = [];
  if (count <= 0) return out;
  const usable = (rings ?? []).filter((ring) => ring.length >= 4);
  const areas = usable.map(ringArea);
  const areaSum = areas.reduce((acc, n) => acc + n, 0);
  const boxes = usable.map((ring) => {
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    return { minLon, maxLon, minLat, maxLat };
  });

  for (let n = 0; n < count; n += 1) {
    let placed = false;
    if (usable.length && areaSum > 0) {
      const ring = pickRing(usable, areas, areaSum, rand);
      const box = boxes[usable.indexOf(ring)];
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const lon = box.minLon + rand() * (box.maxLon - box.minLon);
        const lat = box.minLat + rand() * (box.maxLat - box.minLat);
        if (pointInRing(lon, lat, ring)) {
          out.push({ iso3: row.iso3, lat, lon });
          placed = true;
          break;
        }
      }
    }
    if (!placed && row.lat != null && row.lon != null) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * 1.2;
      out.push({ iso3: row.iso3, lat: row.lat + Math.sin(angle) * dist, lon: row.lon + Math.cos(angle) * dist });
    }
  }
  return out;
}

/** 가중치에 비례해 전 세계에 점을 뿌린다. 같은 seed면 같은 배치가 나온다. */
export function buildDust(
  mode: WeightMode,
  borders: BorderRings | null,
  total = DUST_TOTAL,
  seed = 20240101,
  countries: ReincarnationCountry[] = REINCARNATION_COUNTRIES,
): DustDot[] {
  const counts = allocateDots(
    countries.map((row) => row[mode]),
    total,
  );
  const rand = mulberry32(seed);
  const out: DustDot[] = [];
  countries.forEach((row, index) => {
    out.push(...sampleCountryDots(row, borders?.[row.iso3], counts[index], rand));
  });
  return out;
}

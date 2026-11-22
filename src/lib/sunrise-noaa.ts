/** 브라우저 번들용: astronomy-engine 없이 도는 일출 근사식 (sunrise-2027.ts 테스트로 1분 안 검증). */
/**
 * NOAA 근사식 일출(분 단위, 해당 날짜 UTC 0시부터의 분). 브라우저용 "내 위치" 계산.
 * 굴절 포함 천정거리 90.833°. 극야·백야면 null.
 */
export function sunriseNoaa(lat: number, lon: number, y: number, m: number, d: number): number | null {
  const rad = Math.PI / 180;
  const jd = Date.UTC(y, m - 1, d) / 86_400_000 + 2440587.5;
  const t = (jd - 2451545) / 36525;
  let minutes = 720 - 4 * lon;
  for (let i = 0; i < 2; i++) {
    const tt = t + minutes / 1440 / 36525;
    const L0 = (280.46646 + tt * (36000.76983 + 0.0003032 * tt)) % 360;
    const M = 357.52911 + tt * (35999.05029 - 0.0001537 * tt);
    const e = 0.016708634 - tt * (0.000042037 + 0.0000001267 * tt);
    const C = Math.sin(M * rad) * (1.914602 - tt * (0.004817 + 0.000014 * tt)) + Math.sin(2 * M * rad) * (0.019993 - 0.000101 * tt) + Math.sin(3 * M * rad) * 0.000289;
    const omega = 125.04 - 1934.136 * tt;
    const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * rad);
    const eps0 = 23 + (26 + (21.448 - tt * (46.815 + tt * (0.00059 - tt * 0.001813))) / 60) / 60;
    const eps = eps0 + 0.00256 * Math.cos(omega * rad);
    const decl = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad));
    const yv = Math.tan((eps / 2) * rad) ** 2;
    const eqTime = 4 / rad * (yv * Math.sin(2 * L0 * rad) - 2 * e * Math.sin(M * rad) + 4 * e * yv * Math.sin(M * rad) * Math.cos(2 * L0 * rad) - 0.5 * yv * yv * Math.sin(4 * L0 * rad) - 1.25 * e * e * Math.sin(2 * M * rad));
    const cosH = (Math.cos(90.833 * rad) - Math.sin(lat * rad) * Math.sin(decl)) / (Math.cos(lat * rad) * Math.cos(decl));
    if (cosH > 1 || cosH < -1) return null;
    const H = Math.acos(cosH) / rad;
    minutes = 720 - 4 * (lon + H) - eqTime;
  }
  return minutes;
}

/**
 * 일출 순간 해가 뜨는 방향(방위각, 북쪽 0° 시계방향). 해맞이 나침반용(2026-11-22).
 * 같은 근사식의 적위로 고도 -0.833°에서 방위각을 구한다. 극야·백야면 null.
 */
export function sunriseAzimuth(lat: number, lon: number, y: number, m: number, d: number): number | null {
  const min = sunriseNoaa(lat, lon, y, m, d);
  if (min == null) return null;
  const rad = Math.PI / 180;
  const jd = Date.UTC(y, m - 1, d) / 86_400_000 + 2440587.5 + min / 1440;
  const tt = (jd - 2451545) / 36525;
  const L0 = (280.46646 + tt * (36000.76983 + 0.0003032 * tt)) % 360;
  const M = 357.52911 + tt * (35999.05029 - 0.0001537 * tt);
  const C = Math.sin(M * rad) * (1.914602 - tt * (0.004817 + 0.000014 * tt)) + Math.sin(2 * M * rad) * (0.019993 - 0.000101 * tt) + Math.sin(3 * M * rad) * 0.000289;
  const omega = 125.04 - 1934.136 * tt;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * rad);
  const eps0 = 23 + (26 + (21.448 - tt * (46.815 + tt * (0.00059 - tt * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * rad);
  const decl = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad));
  const h = -0.833 * rad;
  const phi = lat * rad;
  const cosA = (Math.sin(decl) - Math.sin(h) * Math.sin(phi)) / (Math.cos(h) * Math.cos(phi));
  if (cosA > 1 || cosA < -1) return null;
  return Math.acos(cosA) / rad; // 아침이라 동쪽(0~180°)
}

const KO_DIRS = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
const JA_DIRS = ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西'];
/** 16방위 이름 */
export function compassName(az: number, lang: 'ko' | 'ja'): string {
  return (lang === 'ja' ? JA_DIRS : KO_DIRS)[Math.round((((az % 360) + 360) % 360) / 22.5) % 16];
}

/**
 * 띠와 간지를 생년월일에서 확정한다.
 *
 * 시중 조견표는 "1990년생은 말띠" 처럼 연도만 적는다. 그런데 띠의 해가 언제
 * 바뀌는지에 대해 서로 다른 세 관례가 쓰이고 있고, 1월 1일부터 2월 20일 사이에
 * 태어난 사람은 관례마다 답이 달라진다.
 *
 *   양력 기준   1월 1일에 바뀐다.        시중 조견표 대부분이 이것이다.
 *   입춘 기준   태양 황경이 315°가 될 때.  사주가 쓰는 것이다.
 *   음력설 기준  음력 정월 초하루.         동아시아 명절이 쓰는 것이다.
 *
 * 이 모듈은 셋을 다 계산하고, 갈리는지 아닌지를 함께 돌려준다. 하나를 골라
 * 숨기지 않는다 — 경계에 걸린 사람에게는 그 사실이 답이다.
 */

export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const ANIMALS = [
  "쥐", "소", "호랑이", "토끼", "용", "뱀",
  "말", "양", "원숭이", "닭", "개", "돼지",
] as const;

export type Convention = "solar" | "lichun" | "lunarNewYear";

export type ZodiacYear = {
  /** 간지 연도. 예: 1990 */
  year: number;
  /** 천간. 예: "경" */
  stem: string;
  /** 지지. 예: "오" */
  branch: string;
  /** 간지. 예: "경오" */
  sexagenary: string;
  /** 띠 인덱스 0-11 (자=0) */
  animalIndex: number;
  /** 띠. 예: "말" */
  animal: string;
};

export type ZodiacResult = {
  byConvention: Record<Convention, ZodiacYear>;
  /** 세 관례가 모두 같은 답을 내는가 */
  agree: boolean;
  /** 그 해의 입춘 (KST) */
  lichun: Date;
  /** 그 해의 음력 설날 (KST, 자정) */
  lunarNewYear: Date;
};

// ── 간지 ────────────────────────────────────────────────────────────────────
// 서기 4년이 갑자년이므로 (year - 4) 를 10 · 12 로 나눈 나머지가 천간·지지다.
// 2020 → 경자, 2024 → 갑진 으로 확인했다.
export function sexagenaryOf(year: number): ZodiacYear {
  const n = ((year - 4) % 60 + 60) % 60;
  const si = n % 10;
  const bi = n % 12;
  return {
    year,
    stem: STEMS[si],
    branch: BRANCHES[bi],
    sexagenary: STEMS[si] + BRANCHES[bi],
    animalIndex: bi,
    animal: ANIMALS[bi],
  };
}

// ── 율리우스일 ──────────────────────────────────────────────────────────────
function toJulianDay(y: number, m: number, d: number, hours = 0): number {
  let yy = y;
  let mm = m;
  if (mm <= 2) {
    yy -= 1;
    mm += 12;
  }
  const a = Math.floor(yy / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (yy + 4716)) +
    Math.floor(30.6001 * (mm + 1)) +
    d + hours / 24 + b - 1524.5
  );
}

function fromJulianDay(jd: number): { y: number; m: number; d: number; h: number } {
  const j = jd + 0.5;
  const z = Math.floor(j);
  const f = j - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const dayF = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayF);
  const hour = (dayF - day) * 24;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { y: year, m: month, d: day, h: hour };
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const KST_OFFSET_DAYS = 9 / 24;

// ── 입춘: 태양 황경 315° ────────────────────────────────────────────────────
/** 겉보기 태양 황경(도). 저차 항으로 각도 오차 0.01° 수준 — 날짜·시 판정에 충분하다. */
function solarLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const l0 = (280.46646 + 36000.76983 * t) % 360;
  const m = rad((357.52911 + 35999.05029 * t) % 360);
  const c =
    (1.914602 - 0.004817 * t) * Math.sin(m) +
    0.019993 * Math.sin(2 * m) +
    0.000289 * Math.sin(3 * m);
  return ((l0 + c) % 360 + 360) % 360;
}

/** 그 해의 입춘 시각(KST). 이분법으로 황경 315°가 되는 순간을 찾는다. */
export function lichunOf(year: number): Date {
  const target = 315;
  const diff = (jd: number) => {
    const x = solarLongitude(jd) - target;
    return ((x + 180) % 360 + 360) % 360 - 180;
  };
  let lo = toJulianDay(year, 2, 1);
  let hi = toJulianDay(year, 2, 8);
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (diff(lo) * diff(mid) <= 0) hi = mid;
    else lo = mid;
  }
  const { y, m, d, h } = fromJulianDay((lo + hi) / 2 + KST_OFFSET_DAYS);
  return new Date(Date.UTC(y, m - 1, d, Math.floor(h), Math.round((h % 1) * 60)));
}

// ── 음력 설날: 삭(신월) 중 1/21 ~ 2/20 에 드는 것 ──────────────────────────
/** Meeus 49장 저차 항. 삭의 율리우스일. */
function newMoonJd(k: number): number {
  const t = k / 1236.85;
  const base = 2451550.09766 + 29.530588861 * k + 0.00015437 * t * t;
  const m = rad((2.5534 + 29.10535670 * k - 0.0000014 * t * t) % 360);
  const mp = rad((201.5643 + 385.81693528 * k + 0.0107582 * t * t) % 360);
  const f = rad((160.7108 + 390.67050284 * k - 0.0016118 * t * t) % 360);
  const e = 1 - 0.002516 * t;
  const corr =
    -0.40720 * Math.sin(mp) +
    0.17241 * e * Math.sin(m) +
    0.01608 * Math.sin(2 * mp) +
    0.01039 * Math.sin(2 * f) +
    0.00739 * e * Math.sin(mp - m) -
    0.00514 * e * Math.sin(mp + m) +
    0.00208 * e * e * Math.sin(2 * m) -
    0.00111 * Math.sin(mp - 2 * f) -
    0.00057 * Math.sin(mp + 2 * f);
  return base + corr;
}

/**
 * 그 해의 음력 설날(KST 날짜).
 *
 * 정식 규칙은 "동지를 포함하는 달의 다음다음 삭" 이지만 윤달 때문에 예외가 붙는다.
 * 설날이 1월 21일과 2월 20일 사이에만 온다는 성질이 그 예외까지 포함해 답을
 * 유일하게 골라준다 — 그 창에 드는 삭은 언제나 하나뿐이다.
 * 1990·2020·2024·2025·2026 공표값으로 확인했다.
 */
export function lunarNewYearOf(year: number): Date {
  const k0 = Math.round((year - 2000 - 0.05) * 12.3685) - 3;
  for (let k = k0; k < k0 + 6; k += 1) {
    const { y, m, d } = fromJulianDay(newMoonJd(k) + KST_OFFSET_DAYS);
    if (y !== year) continue;
    const inWindow = (m === 1 && d >= 21) || (m === 2 && d <= 20);
    if (inWindow) return new Date(Date.UTC(y, m - 1, d));
  }
  throw new Error(`lunar new year not found for ${year}`);
}

// ── 세 관례를 한 번에 ───────────────────────────────────────────────────────
/**
 * 생년월일에서 세 관례의 답을 모두 낸다.
 * `birth` 는 생일의 날짜만 쓴다 — 시각은 띠를 가르지 않는다.
 */
export function zodiacYearOf(birth: Date): ZodiacResult {
  const y = birth.getUTCFullYear();
  const lichun = lichunOf(y);
  const lunar = lunarNewYearOf(y);
  const dayOf = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const b = dayOf(birth);

  // 입춘·설날 이전에 태어났으면 아직 지난 해의 간지다.
  const lichunYear = b < dayOf(lichun) ? y - 1 : y;
  const lunarYear = b < dayOf(lunar) ? y - 1 : y;

  const byConvention = {
    solar: sexagenaryOf(y),
    lichun: sexagenaryOf(lichunYear),
    lunarNewYear: sexagenaryOf(lunarYear),
  } as const;

  return {
    byConvention,
    agree:
      byConvention.solar.year === byConvention.lichun.year &&
      byConvention.solar.year === byConvention.lunarNewYear.year,
    lichun,
    lunarNewYear: lunar,
  };
}

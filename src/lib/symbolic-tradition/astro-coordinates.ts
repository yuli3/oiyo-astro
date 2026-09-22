import { getAscendantLongitude, getLunarLongitude, SIGN_KEYS, type SignKey } from "@/lib/ontology/natal/calculator";
import { getSolarLongitude } from "@/lib/ontology/kernel/astronomy";

/**
 * 별자리 층(우리의 지도 B1~B4)의 입력.
 *
 * 태양궁 표(월·일 경계)만으로는 사람 사이의 **각**(삼각·사각·대립)을 잴 수
 * 없다. 각은 황경의 차이로 정해지기 때문이다. 그래서 태양 황경을 따로 둔다.
 *
 * **모르는 것을 지어내지 않는다.** 출생 시각이 없으면 그날 하루 동안 달이
 * 지나간 궁을 모두 후보로 남기고(달은 하루 12~15° 움직여 하루 안에 궁을
 * 바꾸기도 한다), 상승궁은 시각과 도시가 모두 있을 때만 셈한다.
 *
 * **공유 링크에 무엇이 실리는가.** 이 값은 참가자 좌표와 함께 저장·공유된다.
 * 태양 황경은 정수 도로 반올림한다 — 태양은 하루 1°씩 움직이니 출생일 정도가
 * 드러나는데, 그건 이미 일주·태양궁 조합으로 드러나는 수준이라 새로 새지
 * 않는다. 달과 상승궁은 **궁 이름만** 싣는다. 상승궁은 4분에 1°씩 돌아서
 * 도 단위로 실으면 출생 시각이 분 단위로 드러난다. 궁 하나(약 2시간)는 시주가
 * 이미 드러내는 폭과 같다.
 */
export interface AstroCoordinates {
  /** 태양 황경, 0~359 정수 도. */
  sun: number;
  /** 달자리 후보. 시각을 알면 하나, 모르면 그날 걸친 궁 전부(보통 1~2개). */
  moon: SignKey[];
  /** 상승궁. 출생 시각과 도시가 모두 있을 때만. */
  ascendant: SignKey | null;
}

const HOUR = 3_600_000;
const MOON_STEP = 6 * HOUR; // 달은 6시간에 최대 4° — 궁 하나(30°)를 건너뛸 수 없다

export function signOfLongitude(longitude: number): SignKey {
  return SIGN_KEYS[Math.floor((((longitude % 360) + 360) % 360) / 30) % 12];
}

function civilToUtc(civilDate: string, civilTime: string, offsetMinutes: number): number {
  const [y, m, d] = civilDate.split("-").map(Number);
  const [hh, mm] = civilTime.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) - offsetMinutes * 60_000;
}

export function astroCoordinates(input: {
  civilDate: string;
  civilTime: string | null;
  /** 출생지의 그날 UTC 차이(분). 도시가 없으면 null. */
  utcOffsetMinutes: number | null;
  latitude: number | null;
  longitude: number | null;
}): AstroCoordinates {
  const { civilDate, civilTime, utcOffsetMinutes, latitude, longitude } = input;
  if (civilTime && utcOffsetMinutes !== null) {
    const instant = new Date(civilToUtc(civilDate, civilTime, utcOffsetMinutes));
    return {
      sun: Math.round(getSolarLongitude(instant)) % 360,
      moon: [signOfLongitude(getLunarLongitude(instant))],
      ascendant: latitude !== null && longitude !== null
        ? signOfLongitude(getAscendantLongitude(instant, latitude, longitude))
        : null,
    };
  }
  // 시각을 모르면 그 달력 날짜가 걸칠 수 있는 모든 순간을 창으로 잡는다.
  // 도시를 알면 현지 하루, 모르면 지구상 어느 시간대의 하루든(UTC+14 ~ UTC−12).
  const start = utcOffsetMinutes !== null
    ? civilToUtc(civilDate, "00:00", utcOffsetMinutes)
    : civilToUtc(civilDate, "00:00", 14 * 60);
  const end = utcOffsetMinutes !== null
    ? start + 24 * HOUR
    : civilToUtc(civilDate, "00:00", -12 * 60) + 24 * HOUR;
  const moon: SignKey[] = [];
  for (let t = start; ; t = Math.min(t + MOON_STEP, end)) {
    const sign = signOfLongitude(getLunarLongitude(new Date(t)));
    if (!moon.includes(sign)) moon.push(sign);
    if (t >= end) break;
  }
  return {
    sun: Math.round(getSolarLongitude(new Date((start + end) / 2))) % 360,
    moon,
    ascendant: null,
  };
}

/** 저장·공유된 값을 믿기 전에 모양을 확인한다. 옛 참가자에게는 이 자리가 없다. */
export function isAstroCoordinates(value: unknown): value is AstroCoordinates {
  if (!value || typeof value !== "object") return false;
  const astro = value as Partial<AstroCoordinates>;
  return Number.isInteger(astro.sun) && astro.sun! >= 0 && astro.sun! < 360
    && Array.isArray(astro.moon) && astro.moon.length >= 1 && astro.moon.length <= 3
    && astro.moon.every((sign) => SIGN_KEYS.includes(sign))
    && (astro.ascendant === null || SIGN_KEYS.includes(astro.ascendant as SignKey));
}

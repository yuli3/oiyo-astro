import { CITIES, type City } from "@/lib/ontology/natal/signs";
import { resolveZonedCivilTime } from "@/lib/user/birth-record";
import { deriveSymbolicProfile, type SymbolicComparisonProfile } from "@/lib/symbolic-tradition";
import { astroCoordinates } from "./astro-coordinates";
import { birthHexagram } from "./iching";
import { STEMS } from "@/manifest/data/saju/stems";
import type { FiveElement } from "@/lib/ontology/saju/types";

export function comparisonFromCivil(input: {
  city?: City;
  cityId?: string;
  date: string;
  time?: string;
}, options: { astro?: boolean } = {}): SymbolicComparisonProfile {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new RangeError("Need a civil date");
  const city = input.city ?? CITIES.find((item) => item.id === input.cityId);
  const civilTime = input.time || null;
  const resolution = city
    ? resolveZonedCivilTime({ civilDate: input.date, civilTime: civilTime ?? "12:00", zoneId: city.zoneId })
    : { status: "resolved" as const, offsetMinutes: 540 };
  if (resolution.status !== "resolved") throw new RangeError("Ambiguous birth moment");
  const profile = deriveSymbolicProfile({
    civilDate: input.date,
    civilTime,
    longitude: city?.lon ?? null,
    utcOffsetMinutes: city ? resolution.offsetMinutes : null,
  });
  return {
    celticTree: profile.celticTree,
    chineseZodiac: profile.chineseZodiac,
    mayanKin: profile.mayanKin,
    fiveElements: {
      counts: profile.fiveElements.counts,
      dominant: profile.fiveElements.dominant,
      observedCoordinates: profile.fiveElements.observedCoordinates,
    },
    saju: profile.saju,
    sunSign: profile.sunSign,
    yinYang: profile.yinYang,
    // 달 궁 셈은 비싸서 사람을 원에 넣을 때만 한다. 이 함수는 "오늘"을
    // 참가자로 만들 때 하루에 수십 번 불리는데, 그쪽은 별자리가 필요 없다.
    ...(options.astro ? {
      astro: astroCoordinates({
        civilDate: input.date,
        civilTime,
        utcOffsetMinutes: city ? resolution.offsetMinutes : null,
        latitude: city?.lat ?? null,
        longitude: city?.lon ?? null,
      }),
      hexagram: birthHexagram(input.date, profile.saju.hour?.earthlyBranch ?? null),
    } : {}),
  };
}

/**
 * 그 달력 날짜의 일간(日干) 오행.
 *
 * **"이 사람의 오행"을 정하는 단 한 곳이다.** 명리에서 사람을 대표하는 글자는
 * 일간이지 연간이 아니다. 생시·출생지가 없어도 정해지므로 날짜만 있으면 된다.
 *
 * 2026-09-21 까지 화면 둘이 다른 기준을 썼다. /오늘 의 사주 카드는 출생
 * **연도**의 천간으로 오행을 정하고, 우리의 지도는 일간과 분포 전체를 썼다.
 * 4,000명을 견주니 일치율이 20.9% — 우연(1/5) 수준이었다. 같은 사람에게 두
 * 화면이 79% 확률로 다른 오행을 말하고 있었다.
 *
 * 날짜를 받으므로 사람에게 쓰면 일간이고, 오늘 날짜에 쓰면 그날의 일진이다.
 */
export function dayMasterElement(civilDate: string): FiveElement {
  return STEMS[comparisonFromCivil({ date: civilDate }).saju.day.heavenlyStem].element as FiveElement;
}

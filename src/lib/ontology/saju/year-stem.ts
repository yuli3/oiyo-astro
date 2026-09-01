/**
 * 연간(年干) 인덱스 하나를 두 경로로 낸다.
 *
 * **왜 두 경로인가.** 사주의 연주는 **입춘**에서 넘어간다(황경 315도, 대개 2월 4일
 * 무렵). 그런데 SajuFortune·SajuCompatibility 는 입력이 **연도 `<select>` 하나**라
 * 월·일이 없다. 월·일 없이는 입춘 경계를 적용할 수 없다 — 수식 문제가 아니라
 * 입력의 한계다.
 *
 * 그래서 두 갈래로 둔다:
 *   - 프로필에 생년월일이 있으면 **절기 기준**으로 정확히 낸다.
 *   - 없으면 역법상 연도로 내되, 호출부가 그 한계를 사용자에게 알린다.
 *
 * 2026-09-01 이전에는 두 컴포넌트가 각자 같은 로컬 함수를 복사해 갖고 있었고
 * 둘 다 역법상 연도만 썼다. 1/1~2/4 출생은 공개 사주 계산기와 다른 오행을 봤다.
 *
 * 정책 근거: company-brain
 * projects/oiyo-ecosystem/saju-engine-unification-policy-2026-09-01.md §1
 */
import { getSolarYearPillar } from "./calculator-solar";

/** 1984년이 갑자년이다. */
const SEXAGENARY_EPOCH = 1984;

/** 역법상 연도만 아는 경우. 입춘 경계가 적용되지 않는다. */
export function yearStemFromCalendarYear(year: number): number {
  return (((year - SEXAGENARY_EPOCH) % 10) + 10) % 10;
}

export interface YearStemResult {
  stemIdx: number;
  /** true 면 입춘 경계가 적용된 값이다. false 면 연도만으로 낸 근사다. */
  solarAccurate: boolean;
}

/**
 * 생년월일이 있으면 절기 기준, 없으면 연도 기준.
 *
 * `birth` 가 있어도 그 해와 `year` 가 다르면(사용자가 select 를 따로 골랐다면)
 * select 값을 존중한다 — 화면에서 고른 것과 다른 값을 내면 그게 더 혼란스럽다.
 */
export function resolveYearStem(
  year: number,
  birth: null | { year: number; month: number; day: number; hour?: null | number },
): YearStemResult {
  if (birth && birth.year === year) {
    return {
      stemIdx: getSolarYearPillar(birth.year, birth.month, birth.day, birth.hour ?? null).stem,
      solarAccurate: true,
    };
  }
  return { stemIdx: yearStemFromCalendarYear(year), solarAccurate: false };
}

/**
 * 공개 계산기용 **절기 기반** 연·월주.
 *
 * 왜 새로 만들었나: `calculator-civil.ts` 의 연·월주는 그레고리력 연도와 월
 * 번호를 그대로 썼다. 그런데 사주의 연주는 **입춘**에서, 월주는 **절입**에서
 * 넘어간다. 실측 결과 월주는 **모든 출생**에서 2지지 어긋났고(연중 100%),
 * 연주는 1/1~2/4 출생이 한 해 밀렸다(9.6%).
 *
 * 산식은 온톨로지 엔진(`logic.ts`)의 것을 그대로 옮겼다. 두 곳이 다른 산식을
 * 쓰면 다시 갈라지므로 여기서 계산도 같은 천문 커널을 쓴다.
 *
 * 일·시주는 옮기지 않았다. `calculator-civil` 의 일주는 KASI 20건과 일치하고
 * (reference-calendar.test.ts), 시주는 2026-09-01 에 두 엔진이 합의했다.
 *
 * 정책 근거: company-brain
 * projects/oiyo-ecosystem/saju-engine-unification-policy-2026-09-01.md §1
 */
import { getSolarLongitude, getSolarTermDate } from "../kernel/astronomy";

/** KST 벽시계 → 절대 시각. 공개 계산기는 출생지를 받지 않으므로 KST 고정이다. */
function kstToInstant(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - 9 * 60 * 60 * 1000);
}

/**
 * 연주 간지 인덱스(0-9 천간, 0-11 지지). 입춘 이전 출생은 전년으로 친다.
 *
 * 시각이 없으면(`hour === null`) 정오로 본다. 입춘 당일 출생은 시각을 알아야
 * 정확한데, 모르는 경우 하루 중 가장 대표적인 시점을 쓴다. 그 한계는 UI 가
 * 이미 "시각 미상" 으로 표시한다.
 */
export function getSolarYearPillar(
  year: number, month: number, day: number, hour: null | number,
): { stem: number; branch: number } {
  const instant = kstToInstant(year, month, day, hour ?? 12);
  const ipchun = getSolarTermDate(year, 0);
  const adjusted = instant < ipchun ? year - 1 : year;

  // 서기 4년이 갑자년이다.
  const idx = ((adjusted - 4) % 60 + 60) % 60;
  return { stem: idx % 10, branch: idx % 12 };
}

/**
 * 월주 간지 인덱스. 지지는 태양황경으로 정한다 — 입춘(315도)이 인월이고
 * 30도마다 다음 지지다. 역법상 월 번호를 쓰지 않는 이유가 이것이다.
 */
export function getSolarMonthPillar(
  year: number, month: number, day: number, hour: null | number,
): { stem: number; branch: number } {
  const instant = kstToInstant(year, month, day, hour ?? 12);
  const lon = getSolarLongitude(instant);
  const branch = (Math.floor(((((lon - 315) % 360) + 360) % 360) / 30) + 2) % 12;

  // 월두법: 연간에서 월간이 정해진다. 인월 기준 오프셋을 쓴다.
  const yearStem = getSolarYearPillar(year, month, day, hour).stem;
  const offset = (branch - 2 + 12) % 12;
  const stem = ((yearStem % 5) * 2 + 2 + offset) % 10;

  return { stem, branch };
}

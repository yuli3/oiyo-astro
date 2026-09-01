// 공개 계산기(calculator-civil) vs 공통 온톨로지 엔진(logic.ts) 차이 행렬.
//
// 이 테스트는 통과/실패를 주장하지 않는다 — **현재 차이를 측정해 출력**한다.
// oiyo-engine-upgrade-handoff-2026-09-01.md §Not done 이 요구한 산출물이며,
// "골든이 확보되기 전에는 수식을 통합하지 않는다"는 게이트 아래에서 안전하게
// 만들 수 있는 유일한 것이다(수식을 바꾸지 않고 재기만 한다).
import { describe, expect, it } from "vitest";
import {
  getYearStem, getYearBranch, getMonthBranch, getMonthStem,
  getDayStem, getDayBranch, getHourBranch, getHourStem,
} from "./calculator-civil";
import { calculateSaju } from "./logic";
import { birthCivilToInstant } from "../kernel/time";
import { STEM_ORDER } from "../../../manifest/data/saju/stems";
import { BRANCH_ORDER } from "../../../manifest/data/saju/branches";

const KST_OFFSET = 540; // 분
const SEOUL_LON = 126.978;
const KST_MERIDIAN = 135.0;

interface Pillars { y: string; m: string; d: string; h: string }

function publicEngine(year: number, month: number, day: number, hour: number): Pillars {
  const yS = getYearStem(year), yB = getYearBranch(year);
  const mB = getMonthBranch(month), mS = getMonthStem(yS, month);
  const dS = getDayStem(year, month, day), dB = getDayBranch(year, month, day);
  const hB = getHourBranch(hour), hS = getHourStem(dS, hB);
  const S = (i: number) => STEM_ORDER[i], B = (i: number) => BRANCH_ORDER[i];
  return { y: S(yS) + B(yB), m: S(mS) + B(mB), d: S(dS) + B(dB), h: S(hS) + B(hB) };
}

function ontologyEngine(year: number, month: number, day: number, hour: number, longitude: number): Pillars {
  const instant = birthCivilToInstant({ year, month, day, hour, minute: 0 }, KST_OFFSET);
  const r = calculateSaju(instant, false, "male", longitude);
  const p = (x: { heavenlyStem: string; earthlyBranch: string }) => x.heavenlyStem + x.earthlyBranch;
  return { y: p(r.year), m: p(r.month), d: p(r.day), h: p(r.hour) };
}

// 표본: 2000년 한 해를 5일 간격 × **24시각 전부**.
//
// 처음에는 0·6·12·23시 넷만 썼는데, 그중 둘이 자정 경계(자시)에 붙어 있어
// 경도 효과가 부풀려졌다(시주 56.5%). 실제 출생은 하루에 고루 퍼지므로 24시간을
// 균등하게 돌린다. 편향된 표본으로 비율을 말하면 그 숫자가 결정을 왜곡한다.
function sample(): Array<{ y: number; m: number; d: number; h: number }> {
  const out = [];
  for (let doy = 1; doy <= 365; doy += 5) {
    const dt = new Date(Date.UTC(2000, 0, doy));
    for (let h = 0; h < 24; h++) {
      out.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), h });
    }
  }
  return out;
}

describe("사주 엔진 차이 행렬 (측정 전용)", () => {
  // 정오 표본만 쓴다. reference-calendar.test.ts 가 KASI 대조에 정오를 쓰는 이유와
  // 같다 — 자정 근처는 진태양시 보정이 날짜를 넘겨 **관례 차이**가 수식 차이처럼
  // 보인다. 수식 자체를 비교하려면 그 교란을 먼저 빼야 한다.
  it("공개 계산기 vs 온톨로지 엔진 — 정오(관례 차이 제외)", () => {
    const rows = sample().filter((s) => s.h === 12);
    const diff = { y: 0, m: 0, d: 0, h: 0 };
    const examples: Record<string, string[]> = { y: [], m: [], d: [], h: [] };
    for (const s of rows) {
      const a = publicEngine(s.y, s.m, s.d, s.h);
      const b = ontologyEngine(s.y, s.m, s.d, s.h, SEOUL_LON);
      for (const k of ["y", "m", "d", "h"] as const) {
        if (a[k] !== b[k]) {
          diff[k]++;
          if (examples[k].length < 3) examples[k].push(`${s.y}-${String(s.m).padStart(2,"0")}-${String(s.d).padStart(2,"0")} ${String(s.h).padStart(2,"0")}시: 공개 ${a[k]} / 온톨로지 ${b[k]}`);
        }
      }
    }
    const n = rows.length;
    // **현재 상태의 스냅샷이지 목표치가 아니다.** 수식을 바꾸면 여기가 깨지고,
    // 그때 이 숫자를 의식적으로 갱신하면서 무엇이 왜 달라졌는지 적게 된다.
    expect({ n, ...diff }).toEqual({ n: 73, y: 7, m: 73, d: 0, h: 0 });
    // 일주가 정오에서 0 인 것이 중요하다 — 두 엔진 모두 KASI 일주와 일치한다
    // (reference-calendar.test.ts). 즉 일주 차이는 수식이 아니라 자정 관례다.
    expect(diff.d).toBe(0);
    // 시주도 0 이다. 2026-09-01 에 시지 경계의 이중 보정을 걷어낸 결과이며,
    // 그 전에는 46/73(63%) 이었다. 정오에서 두 엔진이 시주에 합의한다는 것은
    // 남은 차이가 연·월주 수식 하나로 좁혀졌다는 뜻이다.
    expect(diff.h).toBe(0);
  });

  // 이쪽은 24시간 전부를 쓴다. 경도 보정의 영향은 하루 중 언제 태어났는지에
  // 달렸으므로 정오만 보면 과소평가된다.
  it("경도 기본값(135)과 실제 서울 경도의 차이 — 온톨로지 엔진 내부", () => {
    const rows = sample();
    const diff = { y: 0, m: 0, d: 0, h: 0 };
    const examples: string[] = [];
    for (const s of rows) {
      const def = ontologyEngine(s.y, s.m, s.d, s.h, KST_MERIDIAN);
      const real = ontologyEngine(s.y, s.m, s.d, s.h, SEOUL_LON);
      for (const k of ["y", "m", "d", "h"] as const) {
        if (def[k] !== real[k]) {
          diff[k]++;
          if (k === "h" && examples.length < 5) examples.push(`${s.y}-${String(s.m).padStart(2,"0")}-${String(s.d).padStart(2,"0")} ${String(s.h).padStart(2,"0")}시: 135° ${def[k]} / 서울 ${real[k]}`);
        }
      }
    }
    const n = rows.length;
    // 경도 기본값 135(KST 표준자오선)를 쓰는 호출부와 실제 출생지 경도를 넘기는
    // 호출부가 공존한다. 그 차이가 얼마인지가 이 숫자다.
    expect({ n, ...diff }).toEqual({ n: 1752, y: 0, m: 0, d: 34, h: 446 });
    // 연·월주는 경도에 영향받지 않는다 — 절기 경계가 하루 단위라 32분으로는
    // 넘어가지 않는다. 영향은 일·시주에만 있다.
    expect(diff.y).toBe(0);
    expect(diff.m).toBe(0);
  });
});

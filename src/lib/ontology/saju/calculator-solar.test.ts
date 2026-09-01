// 공개 계산기용 절기 산식이 온톨로지 엔진과 같은 답을 내는지.
//
// 두 곳이 같은 산식을 쓰기로 했으므로(정책 §1) 어긋나면 그 전제가 깨진 것이다.
// 산식을 옮겨 적는 과정의 실수를 잡는 것이 이 테스트의 목적이다.
import { describe, expect, it } from "vitest";
import { getSolarYearPillar, getSolarMonthPillar } from "./calculator-solar";
import { calculateSaju, STANDARD_MERIDIAN_KST } from "./logic";
import { STEM_ORDER, BRANCH_ORDER } from "./data";

function sample() {
  const out: Array<{ y: number; m: number; d: number; h: number }> = [];
  for (const y of [2000, 2008, 2016, 2024, 2025]) {
    for (let doy = 3; doy <= 363; doy += 7) {
      const dt = new Date(Date.UTC(y, 0, doy));
      out.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), h: 12 });
    }
  }
  return out;
}

describe("절기 산식 이식 검증", () => {
  it("연·월주가 온톨로지 엔진과 완전히 일치한다", () => {
    const rows = sample();
    const mismatches: string[] = [];
    for (const s of rows) {
      // 공개 계산기는 KST 벽시계를 받는다. 온톨로지에는 같은 순간을 넘긴다.
      const instant = new Date(Date.UTC(s.y, s.m - 1, s.d, s.h) - 9 * 3600 * 1000);
      const ont = calculateSaju(instant, false, "male", STANDARD_MERIDIAN_KST);

      const yp = getSolarYearPillar(s.y, s.m, s.d, s.h);
      const mp = getSolarMonthPillar(s.y, s.m, s.d, s.h);

      const tag = `${s.y}-${String(s.m).padStart(2, "0")}-${String(s.d).padStart(2, "0")}`;
      if (STEM_ORDER[yp.stem] !== ont.year.heavenlyStem || BRANCH_ORDER[yp.branch] !== ont.year.earthlyBranch) {
        mismatches.push(`${tag} 연주: 공개 ${STEM_ORDER[yp.stem]}${BRANCH_ORDER[yp.branch]} / 온톨로지 ${ont.year.heavenlyStem}${ont.year.earthlyBranch}`);
      }
      if (STEM_ORDER[mp.stem] !== ont.month.heavenlyStem || BRANCH_ORDER[mp.branch] !== ont.month.earthlyBranch) {
        mismatches.push(`${tag} 월주: 공개 ${STEM_ORDER[mp.stem]}${BRANCH_ORDER[mp.branch]} / 온톨로지 ${ont.month.heavenlyStem}${ont.month.earthlyBranch}`);
      }
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
    // 5년 x (3..363, 7일 간격) = 52개/년
    expect(rows.length).toBe(260);
  });

  it("입춘 경계에서 연주가 넘어간다", () => {
    // 2000 입춘: 2/4 21:40 KST (KASI 골든). 그 전후로 연주가 갈려야 한다.
    const before = getSolarYearPillar(2000, 2, 4, 12);
    const after = getSolarYearPillar(2000, 2, 5, 12);
    expect(`${STEM_ORDER[before.stem]}${BRANCH_ORDER[before.branch]}`)
      .not.toBe(`${STEM_ORDER[after.stem]}${BRANCH_ORDER[after.branch]}`);
  });

  it("역법상 월과 절기 월은 다르다 — 이 교체의 이유", () => {
    // 1월 1일은 자월(子)이지 인월(寅)이 아니다. 옛 산식은 인월을 줬다.
    const jan = getSolarMonthPillar(2000, 1, 1, 12);
    expect(BRANCH_ORDER[jan.branch]).toBe(BRANCH_ORDER[0]); // 子
  });
});

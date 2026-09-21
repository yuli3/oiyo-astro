import { describe, expect, it } from "vitest";

import { FIVE_ELEMENTS } from "@/lib/fortune/periodic";
import { comparisonFromCivil, dayMasterElement } from "./circle-input";
import { dayElementOf } from "./group-today";

/**
 * "이 사람의 오행"은 한 곳에서만 정한다.
 *
 * 2026-09-21 까지 /오늘 의 사주 카드는 출생 연도의 천간을, 우리의 지도는
 * 일간을 썼다. 4,000명 실측 일치율 20.9% — 우연(1/5) 수준이라 같은 사람에게
 * 두 화면이 79% 확률로 다른 오행을 말했다.
 */
describe("사람의 오행 — 단일 출처", () => {
  it("일간에서 나오고, 사주 좌표의 일간과 같다", () => {
    for (const date of ["2002-09-01", "1988-07-15", "2007-03-24", "1979-05-08"]) {
      const profile = comparisonFromCivil({ date });
      const element = dayMasterElement(date);
      // 좌표에 실제로 그 원소가 있어야 한다 — 일간은 여덟 좌표 중 하나다.
      expect(profile.fiveElements.counts[element], date).toBeGreaterThan(0);
    }
  });

  it("오늘의 우리도 같은 함수를 쓴다", () => {
    for (const date of ["2026-09-21", "2026-01-01", "2025-12-31"]) {
      expect(dayElementOf(date), date).toBe(dayMasterElement(date));
    }
  });

  it("운세 화면이 쓰는 오행 목록에 들어 있다", () => {
    // PeriodicFortune 은 FIVE_ELEMENTS.indexOf 로 인덱스를 찾는다. 이름이
    // 어긋나면 -1 이 되어 조용히 첫 원소로 떨어진다.
    for (const date of ["2002-09-01", "1970-01-01", "2010-06-15"]) {
      expect(FIVE_ELEMENTS.indexOf(dayMasterElement(date) as never), date).toBeGreaterThanOrEqual(0);
    }
  });

  it("같은 해에 태어나도 날이 다르면 오행이 다를 수 있다", () => {
    // 연간 기준이던 시절에는 같은 해면 무조건 같은 오행이었다.
    const seen = new Set(
      Array.from({ length: 40 }, (_, index) =>
        dayMasterElement(new Date(Date.UTC(1990, 0, 1 + index * 3)).toISOString().slice(0, 10)),
      ),
    );
    expect(seen.size).toBe(5);
  });
});

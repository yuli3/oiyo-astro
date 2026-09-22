import { describe, expect, it } from "vitest";

import { EGYPTIAN_TABLE, egyptianDeityOf } from "./egyptian";

describe("이집트 12신 달력(현대 판본)", () => {
  it("윤년의 366일이 정확히 한 신에게 간다 — 빈 날도 겹치는 날도 없다", () => {
    for (let d = 0; d < 366; d += 1) {
      const date = new Date(Date.UTC(2024, 0, 1 + d));
      const m = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      const owners = EGYPTIAN_TABLE.filter((row) =>
        row.ranges.some(([sm, sd, em, ed]) => m * 100 + day >= sm * 100 + sd && m * 100 + day <= em * 100 + ed));
      expect(owners.map((o) => o.id), `${m}/${day}`).toHaveLength(1);
    }
  });

  it("열두 신이 모두 나오고 라(Ra)로 떨어지는 날이 없다", () => {
    expect(EGYPTIAN_TABLE).toHaveLength(12);
    expect(EGYPTIAN_TABLE.map((r) => r.id)).not.toContain("ra");
  });

  it("널리 실린 판본과 맞는 날들", () => {
    expect(egyptianDeityOf("1990-01-15")).toBe("amun-ra");
    expect(egyptianDeityOf("1990-06-20")).toBe("nile");
    expect(egyptianDeityOf("1990-06-15")).toBe("seth");
    expect(egyptianDeityOf("1990-05-10")).toBe("anubis"); // 옛 표에선 와제트가 가로챘다
    expect(egyptianDeityOf("1990-09-10")).toBe("mut");
    expect(egyptianDeityOf("2000-02-29")).toBe("geb");
    expect(egyptianDeityOf("1990-12-25")).toBe("isis");
  });
});

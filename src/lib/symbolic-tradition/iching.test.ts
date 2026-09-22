import { describe, expect, it } from "vitest";

import { birthHexagram, hexagramOf, isBirthHexagram, linesOf, plumBlossom, TRIGRAMS } from "./iching";
import { HEXAGRAM_COUNT, hexagramHan, hexagramName } from "./symbol-names";

describe("문왕 괘 번호표", () => {
  it("64칸이 1~64 를 한 번씩 갖는다", () => {
    const seen = new Set<number>();
    for (let u = 1; u <= 8; u += 1) for (let l = 1; l <= 8; l += 1) seen.add(hexagramOf(u, l));
    expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });

  it("잘 알려진 괘가 제자리에 있다", () => {
    const at = (u: string, l: string) => hexagramOf(TRIGRAMS.findIndex((t) => t.id === u) + 1, TRIGRAMS.findIndex((t) => t.id === l) + 1);
    expect(at("qian", "qian")).toBe(1); // 乾
    expect(at("kun", "kun")).toBe(2); // 坤
    expect(at("kun", "qian")).toBe(11); // 泰: 땅이 위, 하늘이 아래
    expect(at("qian", "kun")).toBe(12); // 否
    expect(at("kan", "li")).toBe(63); // 既濟
    expect(at("li", "kan")).toBe(64); // 未濟
    expect(at("kan", "zhen")).toBe(3); // 屯: 물 위 우레 아래
  });

  it("괘 이름 표가 64개이고 번호와 한자가 맞는다", () => {
    expect(HEXAGRAM_COUNT).toBe(64);
    expect(hexagramHan(11)).toBe("泰");
    expect(hexagramName(63, "ko")).toBe("수화기제");
    expect(hexagramName(1, "en")).toBe("The Creative");
  });
});

describe("매화역수 기괘", () => {
  it("공식대로 상괘·하괘·동효를 낸다", () => {
    // 연지 子(1) + 음력 1월 + 1일 = 3 → 상괘 離(3). +시지 子(1) = 4 → 하괘 震(4), 동효 4
    const h = plumBlossom({ yearBranch: 1, lunarMonth: 1, lunarDay: 1, hourBranch: 1 });
    expect(h).toMatchObject({ upper: 3, lower: 4, moving: 4, number: 21 }); // 火雷噬嗑
  });

  it("변괘는 동효 하나만 뒤집은 괘다", () => {
    for (let y = 1; y <= 12; y += 1) for (let hb = 1; hb <= 12; hb += 1) {
      const h = plumBlossom({ yearBranch: y, lunarMonth: 7, lunarDay: 15, hourBranch: hb });
      const a = linesOf(h.upper, h.lower);
      // 변괘의 효를 다시 만들어 비교한다
      let cu = 0; let cl = 0;
      for (let u = 1; u <= 8; u += 1) for (let l = 1; l <= 8; l += 1) if (hexagramOf(u, l) === h.changed) { cu = u; cl = l; }
      const b = linesOf(cu, cl);
      expect(a.filter((v, i) => v !== b[i])).toHaveLength(1);
      expect(a[h.moving - 1]).not.toBe(b[h.moving - 1]);
    }
  });

  it("시지가 없으면 괘를 세우지 않는다", () => {
    expect(birthHexagram("1990-05-17", null)).toBeNull();
  });

  it("같은 사람은 언제 셈해도 같은 괘다(지금 시각에 기대지 않는다)", () => {
    expect(birthHexagram("1990-05-17", "O")).toEqual(birthHexagram("1990-05-17", "O"));
    expect(isBirthHexagram(birthHexagram("1990-05-17", "O"))).toBe(true);
  });

  it("연지는 음력 해를 따른다 — 설 전날과 설날은 연지가 다르다", () => {
    // 2024 설: 양력 2월 10일. 2월 9일은 아직 계묘(卯)년, 10일부터 갑진(辰)년.
    const before = birthHexagram("2024-02-09", "JA")!;
    const after = birthHexagram("2024-02-10", "JA")!;
    expect(before).not.toEqual(after);
  });
});

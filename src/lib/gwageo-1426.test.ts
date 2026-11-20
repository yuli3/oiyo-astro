import { describe, expect, it } from "vitest";
import { BOOKS, CLASSICS, QUOTA, RHYMES, formatGwageo, makeClassicQuiz, parseGwageo, rankOf } from "./gwageo-1426";

describe("gwageo-1426", () => {
  it("1426 pass list adds up to 34", () => {
    expect(QUOTA.eul + QUOTA.byeong + QUOTA.dong).toBe(QUOTA.passed1426);
  });

  it("quiz items are well formed", () => {
    for (const c of CLASSICS) expect(BOOKS).toContain(c.book);
    for (const r of RHYMES) {
      expect(r.options).toContain(r.answer);
      expect(new Set(r.options).size).toBe(4);
    }
    let seed = 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const quiz = makeClassicQuiz(rand);
    expect(quiz).toHaveLength(3);
    for (const q of quiz) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.book);
      expect(new Set(q.options).size).toBe(4);
    }
  });

  it("ranks", () => {
    expect(rankOf({ classics: 3, rhymes: 3, policy: "keep", cheated: false })).toBe("jangwon");
    expect(rankOf({ classics: 3, rhymes: 3, policy: "retreat", cheated: false })).toBe("eul");
    expect(rankOf({ classics: 2, rhymes: 2, policy: "keep", cheated: false })).toBe("byeong");
    expect(rankOf({ classics: 2, rhymes: 2, policy: "law", cheated: false })).toBe("dong");
    expect(rankOf({ classics: 1, rhymes: 2, policy: "keep", cheated: false })).toBe("fail");
    expect(rankOf({ classics: 3, rhymes: 3, policy: "keep", cheated: true })).toBe("caught");
  });

  it("round-trips the share link", () => {
    expect(parseGwageo("?" + formatGwageo("eul", "keep"))).toEqual({ rank: "eul", policy: "keep" });
    expect(parseGwageo("?r=fail")).toEqual({ rank: "fail", policy: null });
    expect(parseGwageo("?r=king")).toBeNull();
  });
});

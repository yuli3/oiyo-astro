import { describe, expect, it } from "vitest";
import { seededRandom } from "./past-life-1426";
import {
  FR_TOTAL, GOLPUMS, SILLA_RANKS, compareFrance, compareSilla, deputyChance, drawFrance, drawSilla,
  formatFrance, formatSilla, frOneIn, parseFrance, parseSilla, sillaLife, sillaRobe, sillaShare,
} from "./past-life-eras";

describe("silla bone-rank", () => {
  it("has 17 ranks", () => expect(SILLA_RANKS).toHaveLength(17));
  it("caps reached rank by bone-rank", () => {
    expect(sillaLife("yuk", 2)).toEqual({ golpum: "yuk", dream: 2, rank: 6, wall: 4 });
    expect(sillaLife("yuk", 9)).toEqual({ golpum: "yuk", dream: 9, rank: 9, wall: 0 });
    expect(sillaLife("jingol", 1).rank).toBe(1);
    expect(sillaLife("sa", 3).rank).toBe(12);
    expect(sillaLife("pyeongmin", 3).rank).toBeNull();
  });
  it("robe colours follow the rank bands", () => {
    expect([1, 5, 6, 9, 10, 11, 12, 17].map(sillaRobe)).toEqual(["purple", "purple", "crimson", "crimson", "blue", "blue", "yellow", "yellow"]);
  });
  it("shares sum to 1 over all outcomes", () => {
    let sum = 0;
    for (const g of GOLPUMS) {
      const seen = new Set<string>();
      for (let d = 1; d <= 17; d += 1) {
        const life = sillaLife(g, d);
        const key = String(life.rank);
        if (seen.has(key)) continue;
        seen.add(key);
        sum += sillaShare(life);
      }
    }
    expect(sum).toBeCloseTo(1, 10);
  });
  it("round-trips the share link and rejects junk", () => {
    const life = drawSilla(seededRandom("x"));
    expect(parseSilla(formatSilla(life))).toEqual(life);
    expect(parseSilla("g=king&d=1")).toBeNull();
    expect(parseSilla("g=yuk&d=18")).toBeNull();
  });
  it("compares reached ranks", () => {
    expect(compareSilla(sillaLife("jingol", 2), sillaLife("yuk", 2))).toBe("me");
    expect(compareSilla(sillaLife("pyeongmin", 1), sillaLife("sa", 17))).toBe("friend");
  });
});

describe("france 1789", () => {
  it("totals about 27 million", () => expect(FR_TOTAL).toBe(27_000_000));
  it("deputy odds per estate", () => {
    expect(Math.round(1 / deputyChance("nobility"))).toBe(1384);
    expect(deputyChance("peasants")).toBe(deputyChance("bourgeoisie"));
  });
  it("noble is about 1 in 68", () => expect(frOneIn({ group: "nobility", deputy: false })).toBe(68));
  it("round-trips the share link", () => {
    const life = drawFrance(seededRandom("y"));
    expect(parseFrance(formatFrance(life))).toEqual(life);
    expect(parseFrance("f=king")).toBeNull();
  });
  it("compares estates", () => {
    expect(compareFrance({ group: "clergy", deputy: false }, { group: "nobility", deputy: true })).toBe("me");
    expect(compareFrance({ group: "peasants", deputy: true }, { group: "urban", deputy: false })).toBe("me");
    expect(compareFrance({ group: "peasants", deputy: false }, { group: "urban", deputy: false })).toBe("same");
  });
});

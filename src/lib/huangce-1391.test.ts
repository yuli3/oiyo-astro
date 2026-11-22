import { describe, expect, it } from "vitest";
import { CATEGORIES, W_TOTAL, categoryById, daxie, drawCategory, entryOf, formatHuangce, makeHousehold, parseHuangce, totals } from "./huangce-1391";

describe("huangce-1391", () => {
  it("weights civilian, military and artisan households", () => {
    expect(W_TOTAL).toBe(100);
    expect(categoryById("jun")!.w).toBe(20);
    expect(drawCategory(() => 0).id).toBe("min");
    expect(drawCategory(() => 0.999999).id).toBe("jiang");
  });

  it("writes register numerals", () => {
    expect(daxie(1)).toBe("壹");
    expect(daxie(10)).toBe("壹拾");
    expect(daxie(27)).toBe("贰拾柒");
    expect(daxie(105)).toBe("壹佰零伍");
    expect(daxie(0)).toBe("零");
  });

  it("keeps the four columns consistent", () => {
    for (const c of CATEGORIES) for (let k = 0; k < 60; k += 1) {
      const h = makeHousehold(c);
      const t = totals(h);
      expect(t.nowT).toBe(t.oldT + h.born - h.died);
      expect(t.nowT).toBeGreaterThan(0);
      expect(t.men + t.women).toBe(t.nowT);
      const e = entryOf(h);
      expect(e.title).toMatch(/^一户.+系.+都第.+图 .籍/);
      if (c.id === "jiang") expect(e.title).toMatch(/匠籍（.匠）/);
      expect(e.title).toMatch(h.head ? /里长$/ : /甲首$/);
    }
  });

  it("round-trips the share link and rejects junk", () => {
    const h = makeHousehold(categoryById("jun")!, () => 0.42);
    expect(parseHuangce(formatHuangce(h))).toEqual(h);
    expect(parseHuangce("c=zao")).toBeNull();
    expect(parseHuangce(formatHuangce(h).replace(/o=[^&]+/, "o=0.0.1.0"))).toBeNull();
    expect(parseHuangce(formatHuangce({ ...h, old: [1, 0, 1, 0], died: 1 }))).toBeNull();
  });
});

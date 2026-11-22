import { describe, expect, it } from "vitest";
import { CLASSES, DRAW_TOTAL, TOTAL_1872, classById, drawClass, entryOf, formatJinshin, kanji, makeHouse, oneIn, parseJinshin } from "./jinshin-1872";

describe("jinshin-1872", () => {
  it("uses the 1872 totals minus the deliberately excluded groups", () => {
    expect(DRAW_TOTAL).toBe(TOTAL_1872 - 29 - 2358);
    expect(classById("heimin")!.n).toBe(30837271);
    expect(oneIn(classById("kazoku")!)).toBe(12419);
    expect(CLASSES.map((c) => c.label).join()).not.toMatch(/穢|非人|新平民/);
  });

  it("draws both ends", () => {
    expect(drawClass(() => 0).id).toBe("heimin");
    expect(drawClass(() => 0.9999999).id).toBe("kazoku");
  });

  it("writes kanji numerals", () => {
    expect(kanji(5)).toBe("五");
    expect(kanji(10)).toBe("拾");
    expect(kanji(15)).toBe("拾五");
    expect(kanji(42)).toBe("四拾二");
  });

  it("writes an entry for every class", () => {
    for (const c of CLASSES) for (let k = 0; k < 30; k += 1) {
      const e = entryOf(makeHouse(c));
      expect(e.status.startsWith(c.label)).toBe(true);
      expect(e.head).toMatch(/^戸主 .+ 年.+$/);
      expect(e.address).toMatch(/大区.+小区/);
    }
  });

  it("round-trips the share link and rejects junk", () => {
    const h = makeHouse(classById("shizoku")!, () => 0.37);
    expect(parseJinshin(formatJinshin(h))).toEqual(h);
    expect(parseJinshin("c=kozoku&v=1")).toBeNull();
    expect(parseJinshin(formatJinshin({ ...h, age: 3 }))).toBeNull();
  });
});

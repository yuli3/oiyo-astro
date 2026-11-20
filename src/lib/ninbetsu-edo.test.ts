import { describe, expect, it } from "vitest";
import { STATUSES, TOTAL_PERMILLE, drawStatus, formatNinbetsu, kanjiAge, kanjiKoku, makeEntry, parseNinbetsu, statusById } from "./ninbetsu-edo";

describe("ninbetsu-edo", () => {
  it("weights follow the encyclopedia midpoints", () => {
    expect(TOTAL_PERMILLE).toBe(997);
    expect(statusById("hyakusho")?.permille).toBe(825);
  });
  it("draws every status", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 997; i++) seen.add(drawStatus(() => (i + 0.5) / 997).id);
    expect(seen.size).toBe(STATUSES.length);
  });
  it("writes ages in register style", () => {
    expect(kanjiAge(7)).toBe("七");
    expect(kanjiAge(10)).toBe("十");
    expect(kanjiAge(34)).toBe("三十四");
    expect(kanjiAge(61)).toBe("六十一");
  });
  it("round-trips the entry", () => {
    const e = makeEntry(statusById("hyakusho")!, "f", 34, () => 0.3);
    expect(e.koku).not.toBeNull();
    expect(parseNinbetsu("?" + formatNinbetsu(e))).toEqual(e);
    const m = makeEntry(statusById("shonin")!, "m", 20, () => 0.9);
    expect(parseNinbetsu("?" + formatNinbetsu(m))).toEqual(m);
    expect(parseNinbetsu("?s=king")).toBeNull();
  });
});

describe("kanjiKoku", () => {
  it("writes koku and to in register style", () => {
    expect(kanjiKoku(7.3)).toBe("七石三斗");
    expect(kanjiKoku(12)).toBe("十二石");
    expect(kanjiKoku(1.0)).toBe("一石");
  });
});

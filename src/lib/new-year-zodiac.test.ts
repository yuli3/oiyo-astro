import { describe, expect, it } from "vitest";
import { ANIMAL_JA, ANIMAL_ZH, branchIndex, ganzhi, sameSignYears, shengxiao, yakudoshi } from "./new-year-zodiac";

describe("new year zodiac", () => {
  it("2027 is 丁未 (sheep)", () => {
    expect(ganzhi(2027)).toBe("丁未");
    expect(ANIMAL_JA[branchIndex(2027)]).toBe("ひつじ");
    expect(ANIMAL_ZH[branchIndex(2027)]).toBe("羊");
    expect(ganzhi(2024)).toBe("甲辰");
  });
  it("same-sign years before 2027", () => {
    expect(sameSignYears(2027).slice(0, 3)).toEqual([{ year: 2015, age: 12 }, { year: 2003, age: 24 }, { year: 1991, age: 36 }]);
  });
  it("厄年 in 数え年", () => {
    expect(yakudoshi(1986, "m")).toEqual({ kazoe: 42, kind: "hon", taiyaku: true });
    expect(yakudoshi(1995, "f")).toEqual({ kazoe: 33, kind: "hon", taiyaku: true });
    expect(yakudoshi(1996, "f").kind).toBe("mae");
    expect(yakudoshi(2000, "m").kind).toBe(null);
  });
  it("生肖 switches at 春节", () => {
    expect(shengxiao("2027-02-05")?.animal).toBe("马");
    expect(shengxiao("2027-02-06")?.animal).toBe("羊");
    expect(shengxiao("1990-01-26")?.animal).toBe("蛇");
    expect(shengxiao("1890-05-01")).toBe(null);
  });
});

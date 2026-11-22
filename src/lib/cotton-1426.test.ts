import { describe, expect, it } from "vitest";
import { ANCHORS, convertMarket, convertOfficial, doeOfWon, nice, salaryDoePerMonth, SALARY_SEOK, wonOfDoe } from "./cotton-1426";

describe("cotton-1426", () => {
  it("follows the 1426 official rule: 1 jang = 1 du = 40 mun", () => {
    expect(convertOfficial(1, "jang", "du")).toBe(1);
    expect(convertOfficial(1, "du", "mun")).toBe(40);
    expect(convertOfficial(1, "pil", "du")).toBe(5);
    expect(convertOfficial(1, "pil", "mun")).toBe(200);
  });
  it("gives a market range for coins and notes", () => {
    const [lo, hi] = convertMarket(1, "pil", "mun");
    expect(lo).toBeCloseTo(150);
    expect(hi).toBeCloseTo(400);
    const [jl, jh] = convertMarket(1, "du", "jang");
    expect(jl).toBeCloseTo(30);
    expect(jh).toBeCloseTo(80);
    expect(convertMarket(2, "pil", "du")).toEqual([10, 10]);
  });
  it("round-trips won and rice", () => {
    expect(doeOfWon(wonOfDoe(37, 3000), 3000)).toBeCloseTo(37);
    expect(wonOfDoe(10, 1000)).toBeCloseTo(5.964 * 0.8 * 1000);
  });
  it("keeps salary and anchors sane", () => {
    expect(salaryDoePerMonth(SALARY_SEOK.top) / 10 / 5).toBeCloseTo(24.25);
    expect(salaryDoePerMonth(SALARY_SEOK.bottom)).toBe(150);
    expect(ANCHORS.every((a) => a.pil > 0 && a.m >= 1 && a.m <= 12)).toBe(true);
    expect(nice(1234.4)).toBe(1234);
    expect(nice(0.123456)).toBe(0.123);
  });
});

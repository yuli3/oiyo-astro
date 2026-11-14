import { describe, expect, it } from "vitest";
import { REINCARNATION_COUNTRIES } from "./reincarnation";
import {
  LIFE_MAP_YEARS,
  SAME_SECOND_COUNT,
  lifeMap,
  lifeStatsFor,
  oneInChildren,
  phaseYears,
  sameSecondBirths,
} from "./reincarnation-life";

describe("reincarnation life stats", () => {
  it("covers almost every country in the draw with life expectancy", () => {
    const covered = REINCARNATION_COUNTRIES.filter((row) => lifeStatsFor(row.iso3).lifeExpectancy !== undefined);
    expect(covered.length / REINCARNATION_COUNTRIES.length).toBeGreaterThan(0.95);
  });

  it("keeps values in plausible ranges", () => {
    for (const row of REINCARNATION_COUNTRIES) {
      const s = lifeStatsFor(row.iso3);
      if (s.lifeExpectancy !== undefined) expect(s.lifeExpectancy).toBeGreaterThan(40);
      if (s.lifeExpectancy !== undefined) expect(s.lifeExpectancy).toBeLessThan(95);
      if (s.childMortality !== undefined) expect(s.childMortality).toBeLessThan(30);
      if (s.internet !== undefined) expect(s.internet).toBeLessThanOrEqual(100);
      if (s.dailyIncomeYear !== undefined) expect(s.dailyIncomeYear).toBeGreaterThanOrEqual(2010);
    }
  });

  it("returns an empty object for unknown countries", () => {
    expect(lifeStatsFor("XXX")).toEqual({});
  });
});

describe("life map", () => {
  it("has 100 cells split by phase", () => {
    const map = lifeMap({ lifeExpectancy: 72.4, schooling: 7.8 });
    expect(map).toHaveLength(LIFE_MAP_YEARS);
    expect(phaseYears(map, "early")).toBe(6);
    expect(phaseYears(map, "school")).toBe(8);
    expect(phaseYears(map, "work")).toBe(65 - 14);
    expect(phaseYears(map, "later")).toBe(72 - 65);
    expect(phaseYears(map, "beyond")).toBe(100 - 72);
  });

  it("has no later years when life expectancy is under 65", () => {
    const map = lifeMap({ lifeExpectancy: 54.5 });
    expect(phaseYears(map, "school")).toBe(0);
    expect(phaseYears(map, "later")).toBe(0);
    expect(phaseYears(map, "work")).toBe(55 - 6);
  });

  it("returns blank cells without data", () => {
    expect(lifeMap({}).every((cell) => cell === null)).toBe(true);
  });
});

describe("helpers", () => {
  it("turns child mortality into one in N", () => {
    expect(oneInChildren(11.56)).toBe(9);
    expect(oneInChildren(0.28)).toBe(357);
    expect(oneInChildren(undefined)).toBeNull();
    expect(oneInChildren(0)).toBeNull();
  });

  it("draws four births for the same second", () => {
    expect(sameSecondBirths(() => 0.5)).toHaveLength(SAME_SECOND_COUNT);
  });
});

import { describe, expect, it } from "vitest";
import data from "../data/reincarnation-life-stages.json";
import countries from "../data/reincarnation-countries.json";
import { famousNames, lifeStops, outOf10, outOf100, weeklyHours, type StageStats } from "./reincarnation-stages";

const ROWS = (data as { countries: Record<string, StageStats> }).countries;

describe("reincarnation life-stages data", () => {
  it("covers almost every country the roll can land on", () => {
    const all = countries.countries.map((row: { iso3: string }) => row.iso3);
    const withSurvival = all.filter((iso3: string) => ROWS[iso3]?.survive?.["5"] !== undefined);
    expect(withSurvival.length / all.length).toBeGreaterThan(0.95);
  });

  it("keeps values in plausible ranges", () => {
    for (const [iso3, row] of Object.entries(ROWS)) {
      for (const pct of Object.values(row.survive ?? {})) expect(pct, iso3).toBeGreaterThanOrEqual(0);
      for (const pct of Object.values(row.survive ?? {})) expect(pct, iso3).toBeLessThanOrEqual(100);
      // Survival can only fall with age.
      const s = row.survive ?? {};
      if (s["5"] !== undefined && s["70"] !== undefined) expect(s["70"], iso3).toBeLessThanOrEqual(s["5"]);
      if (row.temp !== undefined) expect(Math.abs(row.temp), iso3).toBeLessThan(40);
      if (row.fertility !== undefined) expect(row.fertility, iso3).toBeLessThan(9);
      if (row.workHours !== undefined) expect(row.workHours, iso3).toBeLessThan(3500);
    }
  });

  it("never lists political, military or religious figures as famous births", () => {
    expect(famousNames(ROWS.AUT, false)).not.toContain("Adolf Hitler");
    expect(famousNames(ROWS.RUS, false)).not.toContain("Vladimir Putin");
    expect(famousNames(ROWS.KOR, true).length).toBeGreaterThan(0);
  });
});

describe("helpers", () => {
  it("rounds shares", () => {
    expect(outOf100(99.72)).toBe(99);
    expect(outOf100(89.6)).toBe(89);
    expect(outOf100(undefined)).toBeNull();
    expect(outOf10(63)).toBe(6);
    expect(outOf10(4)).toBe(0);
    expect(weeklyHours(1910)).toBe(37);
    expect(weeklyHours(0)).toBeNull();
  });
});

describe("lifeStops", () => {
  it("builds five stops from a full row and compares survival with home", () => {
    const stops = lifeStops(ROWS.NGA, ROWS.KOR);
    expect(stops.map((s) => s.age)).toEqual([5, 15, 30, 50, 70]);
    const five = stops[0].lines.find((line) => line.kind === "survive");
    expect(five).toMatchObject({ kind: "survive", age: 5, n: 89, home: 99 });
    // Nigeria: about 6 in 10 have electricity, so the line appears.
    expect(stops[0].lines.some((line) => line.kind === "electricity")).toBe(true);
    expect(stops[4].lines.map((line) => line.kind === "survive" && line.age)).toEqual([70, 90]);
  });

  it("skips electricity where almost everyone has it", () => {
    expect(lifeStops(ROWS.KOR)[0].lines.some((line) => line.kind === "electricity")).toBe(false);
  });

  it("drops empty stops instead of showing blanks", () => {
    expect(lifeStops({})).toEqual([]);
    expect(lifeStops({ schoolYears: 12.4 })).toEqual([{ age: 15, lines: [{ kind: "school", years: 12 }] }]);
  });
});

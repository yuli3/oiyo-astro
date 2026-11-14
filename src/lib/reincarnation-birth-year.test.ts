import { describe, expect, it } from "vitest";
import {
  birthsIn,
  byIso2,
  countryRank,
  countryShare,
  parseBirthYear,
  parseHistory,
  pickCountry,
  ranked,
  weightTotal,
} from "./reincarnation";

describe("birth year weights", () => {
  it("keeps today's births for 2024 and reads WPP for other years", () => {
    const korea = byIso2("KR")!;
    expect(birthsIn(korea, 2024)).toBe(korea.births);
    expect(birthsIn(korea, 1950)).toBe(784_803);
    expect(birthsIn(korea, 2050)).toBe(211_343);
  });

  it("ranks China first in 1950 and India first today", () => {
    expect(ranked("births", 1950)[0].iso2).toBe("CN");
    expect(ranked("births", 2024)[0].iso2).toBe("IN");
    expect(countryRank(byIso2("NG")!, "births", 2050)).toBe(2);
  });

  it("shares add up to 1 in every year", () => {
    for (const year of [1950, 1990, 2024, 2050] as const) {
      const sum = ranked("births", year).reduce((acc, row) => acc + countryShare(row, "births", year), 0);
      expect(sum).toBeCloseTo(1, 9);
      expect(weightTotal("births", year)).toBeGreaterThan(90_000_000);
    }
  });

  it("never draws a country with no births that year", () => {
    // Channel Islands: no WPP series, so it only exists in today's draw
    const channel = byIso2("JG")!;
    expect(birthsIn(channel, 1950)).toBe(0);
    expect(birthsIn(channel, 2024)).toBeGreaterThan(0);
    for (const r of [0, 0.25, 0.5, 0.999999]) {
      expect(birthsIn(pickCountry("births", () => r, 1950), 1950)).toBeGreaterThan(0);
    }
  });

  it("parses the year from the URL and history, defaulting to today", () => {
    expect(parseBirthYear("1950")).toBe(1950);
    expect(parseBirthYear("1951")).toBe(2024);
    expect(parseBirthYear(null)).toBe(2024);
    const [entry] = parseHistory([{ id: "h-1", at: "2026-10-19", mode: "births", iso2: ["KR"], year: 1990 }]);
    expect(entry.year).toBe(1990);
    const [old] = parseHistory([{ id: "h-2", at: "2026-10-19", mode: "births", iso2: ["KR"] }]);
    expect(old.year).toBeUndefined();
  });
});

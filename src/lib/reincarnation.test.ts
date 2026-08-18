import { describe, expect, it } from "vitest";
import {
  countryShare,
  displayCountryName,
  pickCountry,
  pickMany,
  projectOrthographic,
  tallyIso3,
  weightTotal,
} from "./reincarnation";

describe("reincarnation weights", () => {
  it("has both weight totals", () => {
    expect(weightTotal("births")).toBeGreaterThan(1_000_000);
    expect(weightTotal("population")).toBeGreaterThan(1_000_000);
  });

  it("honors a deterministic RNG", () => {
    const first = pickCountry("births", () => 0);
    expect(first.iso3).toBeTruthy();
    expect(countryShare(first, "births")).toBeGreaterThan(0);
  });

  it("caps multi-draw at 20", () => {
    expect(pickMany("population", 99)).toHaveLength(20);
    expect(pickMany("births", 0)).toHaveLength(1);
  });

  it("names Korea in Korean via DisplayNames", () => {
    expect(displayCountryName("KR", "ko", "Korea")).toMatch(/한국|대한민국/);
  });

  it("hides the far side of the globe", () => {
    expect(projectOrthographic(0, 0, 0).visible).toBe(true);
    expect(projectOrthographic(180, 0, 0).visible).toBe(false);
  });

  it("tallies repeats", () => {
    const first = pickCountry("births", () => 0);
    expect(tallyIso3([first, first])[0]).toEqual({ iso3: first.iso3, count: 2 });
  });
});

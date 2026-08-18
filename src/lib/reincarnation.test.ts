import { describe, expect, it } from "vitest";
import {
  byIso2,
  countryRank,
  countryShare,
  defaultHomeIso2,
  displayCountryName,
  oneIn,
  pickCountry,
  pickMany,
  projectOrthographic,
  ranked,
  tallyIso3,
  vsHome,
  weightTotal,
  yawToCenter,
  latLonToCartesian,
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

  it("ranks India first by births", () => {
    const india = byIso2("IN");
    expect(india).toBeTruthy();
    expect(ranked("births")[0].iso2).toBe("IN");
    expect(countryRank(india!, "births")).toBe(1);
  });

  it("says one-in and Korea vs India", () => {
    expect(oneIn(0.25)).toBe(4);
    expect(defaultHomeIso2("ko")).toBe("KR");
    const india = byIso2("IN")!;
    const korea = byIso2("KR")!;
    expect(vsHome(india, korea, "births")).toBeGreaterThan(10);
  });

  it("centers the globe on a longitude", () => {
    expect(yawToCenter(-120)).toBe(240);
  });

  it("maps equator/prime meridian onto +X", () => {
    const [x, y, z] = latLonToCartesian(0, 0);
    expect(x).toBeCloseTo(1);
    expect(y).toBeCloseTo(0);
    expect(z).toBeCloseTo(0);
  });

  it("keeps Korea and 200+ countries in the World Bank snapshot", () => {
    expect(byIso2("KR")).toBeTruthy();
    expect(byIso2("KR")!.population).toBeGreaterThan(40_000_000);
    expect(byIso2("KR")!.births).toBeGreaterThan(100_000);
  });
});

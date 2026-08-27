import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  appendHistory,
  byIso2,
  countriesFromIso2,
  countryRank,
  countryShare,
  defaultHomeIso2,
  displayCountryName,
  formatShareIso2,
  oneIn,
  parseHistory,
  parseContinent,
  parseShareIso2,
  matchesContinent,
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
    expect(ranked("births")[1].iso2).toBe("CN");
    expect(countryRank(india!, "births")).toBe(1);
    expect(india!.birthsSource).toBe("wpp2024");
    expect(india!.births).toBeGreaterThan(20_000_000);
    expect(byIso2("CN")!.births).toBeLessThan(india!.births);
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

  it("pins large countries near their geographic centroid, not the capital", () => {
    const australia = byIso2("AU")!;
    const russia = byIso2("RU")!;
    const usa = byIso2("US")!;
    expect(australia.lat).toBeGreaterThan(-32);
    expect(australia.lat).toBeLessThan(-20);
    expect(australia.lon).toBeGreaterThan(120);
    expect(russia.lon).toBeGreaterThan(60);
    expect(usa.lon).toBeLessThan(-90);
    expect(usa.lon).toBeGreaterThan(-110);
  });

  it("parses shared country codes including repeats", () => {
    expect(parseShareIso2("in, ng, xx, IN")).toEqual(["IN", "NG", "IN"]);
    expect(formatShareIso2(["in", "ng"])).toBe("IN,NG");
    expect(countriesFromIso2(["IN", "ZZ", "KR"])).toHaveLength(2);
  });

  it("keeps a bounded reincarnation history", () => {
    expect(parseHistory("not-json")).toEqual([]);
    const first = parseHistory(
      JSON.stringify([{ id: "a", at: "2026-08-26T00:00:00.000Z", mode: "births", iso2: ["IN", "NG"] }]),
    );
    expect(first).toHaveLength(1);
    expect(first[0].iso2).toEqual(["IN", "NG"]);
    let grown = first;
    for (let i = 0; i < 30; i += 1) {
      grown = appendHistory(grown, {
        id: `h${i}`,
        at: "2026-08-26T00:00:00.000Z",
        mode: "births",
        iso2: ["KR"],
      });
    }
    expect(grown).toHaveLength(24);
    expect(grown[0].id).toBe("h29");
  });

  it("tags continents without changing world birth ranks", () => {
    expect(parseContinent("asia")).toBe("asia");
    expect(parseContinent("mars")).toBe("all");
    expect(byIso2("KR")!.continent).toBe("asia");
    expect(byIso2("NG")!.continent).toBe("africa");
    expect(byIso2("BR")!.continent).toBe("americas");
    expect(byIso2("DE")!.continent).toBe("europe");
    expect(byIso2("AU")!.continent).toBe("oceania");
    expect(matchesContinent(byIso2("IN")!, "asia")).toBe(true);
    expect(matchesContinent(byIso2("IN")!, "africa")).toBe(false);
    expect(ranked("births")[0].iso2).toBe("IN");
  });

  it("ships simplified Natural Earth borders for large countries", () => {
    const bordersPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data/reincarnation-borders.json");
    expect(existsSync(bordersPath)).toBe(true);
    const borders = JSON.parse(readFileSync(bordersPath, "utf8")) as Record<string, number[][][]>;
    expect(Object.keys(borders).length).toBeGreaterThan(150);
    expect(borders.IND?.length).toBeGreaterThan(0);
    expect(borders.RUS?.length).toBeGreaterThan(0);
    expect(borders.AUS?.[0].length).toBeGreaterThan(8);
  });
});

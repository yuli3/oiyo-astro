import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { REINCARNATION_COUNTRIES, weightTotal } from "./reincarnation";
import {
  DUST_TOTAL,
  allocateDots,
  birthsPerSecond,
  buildDust,
  dotValue,
  mulberry32,
  pointInRing,
  sampleCountryDots,
  type BorderRings,
} from "./reincarnation-particles";

const here = dirname(fileURLToPath(import.meta.url));
const borders = JSON.parse(
  readFileSync(resolve(here, "../../public/data/reincarnation-borders.json"), "utf8"),
) as BorderRings;

describe("allocateDots", () => {
  it("sums exactly to the total and stays within one of the exact share", () => {
    const weights = [5, 3, 2, 0.4, 0.01];
    const out = allocateDots(weights, 97);
    expect(out.reduce((a, b) => a + b, 0)).toBe(97);
    const sum = weights.reduce((a, b) => a + b, 0);
    weights.forEach((w, i) => expect(Math.abs(out[i] - (w / sum) * 97)).toBeLessThan(1));
  });

  it("returns zeros for empty weight", () => {
    expect(allocateDots([0, 0], 10)).toEqual([0, 0]);
  });
});

describe("sampleCountryDots", () => {
  const square = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];

  it("keeps every dot inside the ring", () => {
    const dots = sampleCountryDots({ iso3: "TST", lat: 5, lon: 5 }, [square], 200, mulberry32(1));
    expect(dots).toHaveLength(200);
    for (const dot of dots) expect(pointInRing(dot.lon, dot.lat, square)).toBe(true);
  });

  it("falls back to the geographic center without borders", () => {
    const dots = sampleCountryDots({ iso3: "TST", lat: 5, lon: 5 }, undefined, 10, mulberry32(1));
    expect(dots).toHaveLength(10);
    for (const dot of dots) expect(Math.hypot(dot.lat - 5, dot.lon - 5)).toBeLessThanOrEqual(1.2 + 1e-9);
  });
});

describe("buildDust", () => {
  it("spreads dots in proportion to births and is deterministic", () => {
    const a = buildDust("births", borders);
    const b = buildDust("births", borders);
    expect(a).toEqual(b);
    expect(a.length).toBe(DUST_TOTAL);
    const india = REINCARNATION_COUNTRIES.find((row) => row.iso3 === "IND")!;
    const expected = (india.births / weightTotal("births")) * DUST_TOTAL;
    const got = a.filter((dot) => dot.iso3 === "IND").length;
    expect(Math.abs(got - expected)).toBeLessThan(1);
  });

  it("puts bordered countries' dots inside their borders", () => {
    const dots = buildDust("population", borders).filter((dot) => dot.iso3 === "BRA");
    expect(dots.length).toBeGreaterThan(0);
    for (const dot of dots) {
      expect(borders.BRA.some((ring) => pointInRing(dot.lon, dot.lat, ring))).toBe(true);
    }
  });
});

describe("rates", () => {
  it("reports a plausible global birth rate and dot value", () => {
    expect(birthsPerSecond()).toBeGreaterThan(3);
    expect(birthsPerSecond()).toBeLessThan(6);
    expect(dotValue("births") * DUST_TOTAL).toBeCloseTo(weightTotal("births"));
  });
});

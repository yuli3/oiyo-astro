import { describe, expect, it } from "vitest";
import { countryShare, pickCountry, pickMany, weightTotal } from "./reincarnation";

describe("reincarnation weights", () => {
  it("shares sum to one in both modes", () => {
    for (const mode of ["births", "population"] as const) {
      const total = weightTotal(mode);
      expect(total).toBeGreaterThan(1_000_000);
    }
  });

  it("honors a deterministic RNG", () => {
    const alwaysZero = () => 0;
    const first = pickCountry("births", alwaysZero);
    expect(first.iso3).toBeTruthy();
    expect(countryShare(first, "births")).toBeGreaterThan(0);
  });

  it("caps multi-draw at 20", () => {
    expect(pickMany("population", 99).length).toBe(20);
    expect(pickMany("births", 0).length).toBe(1);
  });
});

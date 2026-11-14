import { describe, expect, it } from "vitest";
import {
  POP, REGIONS, descentShare, distinctAncestors, formatAncestors, generationsBack, iapGenerations, mrcaGenerations,
  parseAncestors, popAt, slots, summary,
} from "./ancestors-1426";

describe("ancestors back to 1426", () => {
  it("counts generations and slots", () => {
    expect(generationsBack(1990, 28)).toBe(20);
    expect(generationsBack(1990, 25)).toBe(23);
    expect(slots(20)).toBe(1_048_576);
  });
  it("interpolates population between today and 1426", () => {
    expect(popAt(0, 20, "joseon")).toBe(POP.joseon.now);
    expect(popAt(20, 20, "joseon")).toBe(POP.joseon.then);
    expect(popAt(30, 20, "joseon")).toBe(POP.joseon.then);
    expect(popAt(10, 20, "joseon")).toBeGreaterThan(POP.joseon.then);
    expect(popAt(10, 20, "joseon")).toBeLessThan(POP.joseon.now);
  });
  it("never has more distinct ancestors than slots or people", () => {
    for (const r of REGIONS) {
      const curve = distinctAncestors(20, r, 40);
      curve.forEach((a, k) => {
        expect(a).toBeLessThanOrEqual(slots(k) + 1e-6);
        expect(a).toBeLessThanOrEqual(popAt(k, 20, r));
      });
      expect(curve[1]).toBeCloseTo(2, 3);
    }
  });
  it("collapses hard a thousand years back", () => {
    const s = summary({ year: 1990, gen: 28, region: "joseon" });
    expect(s.distinct).toBeLessThan(s.slots);
    expect(s.farSlots / s.farDistinct).toBeGreaterThan(1000);
    expect(s.farDistinct / POP.joseon.then).toBeGreaterThan(0.5);
  });
  it("gives a famous many-children ancestor a higher descent share", () => {
    const g = 20;
    expect(descentShare(22, g, "joseon")).toBeGreaterThan(descentShare(3, g, "joseon"));
    expect(descentShare(3, 1, "joseon")).toBeCloseTo(3 / POP.joseon.then, 12);
    for (const c of [1, 3, 22]) {
      const f = descentShare(c, 25, "joseon");
      expect(f).toBeGreaterThan(0);
      expect(f).toBeLessThanOrEqual(1);
    }
  });
  it("places common ancestors with Chang's rule of thumb", () => {
    expect(mrcaGenerations(4096)).toBe(12);
    expect(iapGenerations(4096)).toBeCloseTo(21.24, 2);
  });
  it("round-trips the share link and rejects junk", () => {
    const q = { year: 1990, gen: 28 as const, region: "england" as const };
    expect(parseAncestors(formatAncestors(q))).toEqual(q);
    expect(parseAncestors("?" + formatAncestors(q))).toEqual(q);
    expect(parseAncestors("y=1990&g=27&r=joseon")).toBeNull();
    expect(parseAncestors("y=1800&g=28&r=joseon")).toBeNull();
    expect(parseAncestors("y=1990&g=28&r=mars")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { calculateEoT, getSolarLongitude } from "../astronomy";
import { clamp, normalizeAngle, normalizeModular } from "../math";
import { getDayOfYear, getJulianDay, isLeapYear } from "../time";

describe("Ontology Kernel: Math", () => {
  it("normalizeAngle should wrap correctly", () => {
    expect(normalizeAngle(370)).toBe(10);
    expect(normalizeAngle(-10)).toBe(350);
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(360)).toBe(0);
  });

  it("normalizeModular should handle 1-indexed systems", () => {
    expect(normalizeModular(28, 1, 27)).toBe(1);
    expect(normalizeModular(0, 1, 27)).toBe(27);
    expect(normalizeModular(1, 1, 27)).toBe(1);
  });

  it("clamp should stay in range", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-50, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

describe("Ontology Kernel: Time", () => {
  it("getJulianDay should match known values", () => {
    // J2000 Epoch
    const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    expect(getJulianDay(j2000)).toBe(2451545.0);
  });

  it("getDayOfYear should be accurate", () => {
    expect(getDayOfYear(new Date(Date.UTC(2024, 0, 1)))).toBe(1);
    expect(getDayOfYear(new Date(Date.UTC(2024, 1, 1)))).toBe(32);
    expect(getDayOfYear(new Date(Date.UTC(2024, 11, 31)))).toBe(366); // 2024 is leap
  });

  it("isLeapYear should be correct", () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
  });
});

describe("Ontology Kernel: Astronomy", () => {
  it("calculateEoT should provide reasonable values", () => {
    // Equation of time varies throughout the year
    const start = calculateEoT(new Date(Date.UTC(2024, 0, 1)));
    expect(typeof start).toBe("number");
    expect(Math.abs(start)).toBeLessThan(20); // EoT is roughly within +/- 17 mins
  });

  it("getSolarLongitude should return angle", () => {
    const lon = getSolarLongitude(new Date(Date.UTC(2024, 0, 1)));
    expect(lon).toBeGreaterThanOrEqual(0);
    expect(lon).toBeLessThan(360);
  });
});

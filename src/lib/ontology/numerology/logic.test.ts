import { describe, expect, it } from "vitest";

import { calculateNumerology } from "./logic";

/**
 * The three name-derived numbers used to reduce to 0 for any name outside
 * A-Z, and 0 has no entry in NUMEROLOGY_MEANINGS. Callers then either
 * rendered a blank card or dropped it without a word. These tests pin the
 * replacement contract: absent, explicitly, rather than a number that means
 * nothing.
 */
describe("calculateNumerology — names the Pythagorean table cannot map", () => {
  const birthDate = new Date("1986-11-06T00:00:00Z");

  it("returns numbers and meanings for a Latin-script name", () => {
    const r = calculateNumerology({ birthDate, fullName: "Cho Seun" });

    expect(typeof r.expression).toBe("number");
    expect(typeof r.soulUrge).toBe("number");
    expect(typeof r.personality).toBe("number");
    expect(r.meanings.expressionMeaning).not.toBeNull();
    expect(r.meanings.soulUrgeMeaning).not.toBeNull();
    expect(r.meanings.personalityMeaning).not.toBeNull();
  });

  it("returns null — not 0 — for a Hangul name", () => {
    const r = calculateNumerology({ birthDate, fullName: "조세운" });

    expect(r.expression).toBeNull();
    expect(r.soulUrge).toBeNull();
    expect(r.personality).toBeNull();
    expect(r.numbers.expressionNumber).toBeNull();
    expect(r.numbers.soulUrgeNumber).toBeNull();
    expect(r.numbers.personalityNumber).toBeNull();
    expect(r.meanings.expressionMeaning).toBeNull();
    expect(r.meanings.soulUrgeMeaning).toBeNull();
    expect(r.meanings.personalityMeaning).toBeNull();
  });

  it("still gives the date-derived numbers when the name maps to nothing", () => {
    const r = calculateNumerology({ birthDate, fullName: "조세운" });

    expect(typeof r.lifePath).toBe("number");
    expect(r.lifePath).toBeGreaterThan(0);
    expect(r.numbers.birthdayNumber).toBe(6);
    expect(r.meanings.lifePathMeaning).toBeTruthy();
    expect(r.meanings.birthdayMeaning).toBeTruthy();
  });

  it("keeps null out of dominantNumbers", () => {
    const r = calculateNumerology({ birthDate, fullName: "조세운" });

    expect(r.overallAnalysis.dominantNumbers).toEqual([r.lifePath]);
    expect(r.overallAnalysis.dominantNumbers).not.toContain(null);
  });

  it("reads the Latin letters out of a mixed name", () => {
    const mixed = calculateNumerology({ birthDate, fullName: "조 Seun" });
    const latinOnly = calculateNumerology({ birthDate, fullName: "Seun" });

    expect(mixed.expression).toBe(latinOnly.expression);
    expect(mixed.expression).not.toBeNull();
  });

  it("treats a name with no letters at all as unmappable", () => {
    const r = calculateNumerology({ birthDate, fullName: "   " });

    expect(r.expression).toBeNull();
  });
});

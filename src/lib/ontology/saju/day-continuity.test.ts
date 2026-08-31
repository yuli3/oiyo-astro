import { describe, expect, it } from "vitest";
import { calculateSaju } from "./logic";
import { SIXTY_GANZHI } from "./data";

// Noon is deliberately far from either midnight/hour-boundary convention.
// These properties test continuity, not a disputed absolute day-cycle anchor.
const dayIndex = (date: Date) => {
  const { day } = calculateSaju(date, false, "male", 135);
  return SIXTY_GANZHI.findIndex(
    (entry) => entry.stem === day.heavenlyStem && entry.branch === day.earthlyBranch,
  );
};

describe("Day cycle is independent of the solar year boundary", () => {
  it.each([1901, 2000, 2024, 2025])(
    "advances one step daily across New Year and Ipchun in %i",
    (year) => {
      const start = Date.UTC(year - 1, 11, 30, 3);
      for (let offset = 0; offset < 45; offset++) {
        const current = new Date(start + offset * 86_400_000);
        const next = new Date(current.getTime() + 86_400_000);
        expect(dayIndex(next), current.toISOString()).toBe((dayIndex(current) + 1) % 60);
      }
    },
  );

  it("returns a valid day pillar at the existing 1900 lower boundary", () => {
    expect(dayIndex(new Date("1900-01-01T12:00:00+09:00"))).toBeGreaterThanOrEqual(0);
  });
});

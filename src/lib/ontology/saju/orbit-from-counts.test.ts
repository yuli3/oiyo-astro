import { describe, expect, it } from "vitest";
import {
  compatibilityPairPeople,
  fiveElementCountsToOrbit,
} from "./orbit-from-counts";

describe("fiveElementCountsToOrbit", () => {
  it("returns null when counts are missing", () => {
    expect(fiveElementCountsToOrbit(undefined)).toBeNull();
    expect(fiveElementCountsToOrbit(null)).toBeNull();
  });

  it("accepts lowercase enum keys from analyzeSaju", () => {
    const orbit = fiveElementCountsToOrbit({
      wood: 3,
      fire: 1,
      earth: 2,
      metal: 0,
      water: 2,
    });
    expect(orbit).toEqual({
      elementCount: { Wood: 3, Fire: 1, Earth: 2, Metal: 0, Water: 2 },
      dominantElement: "Wood",
      missingElements: ["Metal"],
    });
  });

  it("accepts PascalCase keys already used by SajuCalculator", () => {
    const orbit = fiveElementCountsToOrbit({
      Wood: 0,
      Fire: 4,
      Earth: 1,
      Metal: 1,
      Water: 2,
    });
    expect(orbit?.dominantElement).toBe("Fire");
    expect(orbit?.missingElements).toEqual(["Wood"]);
  });

  it("ignores unknown keys and negative values", () => {
    const orbit = fiveElementCountsToOrbit({
      wood: 1,
      mystery: 9,
      fire: -3,
    });
    expect(orbit?.elementCount).toEqual({
      Wood: 1,
      Fire: 0,
      Earth: 0,
      Metal: 0,
      Water: 0,
    });
    expect(orbit?.dominantElement).toBe("Wood");
  });
});

describe("compatibilityPairPeople", () => {
  it("builds a two-person payload for CompatibilityOrbit pair mode", () => {
    expect(compatibilityPairPeople("첫 번째 사람", "두 번째 사람", 88)).toEqual([
      { id: "person-1", label: "첫 번째 사람", score: 88 },
      { id: "person-2", label: "두 번째 사람", score: 88 },
    ]);
  });

  it("clamps scores to 0–100", () => {
    expect(compatibilityPairPeople("A", "B", 140)[0].score).toBe(100);
    expect(compatibilityPairPeople("A", "B", -2)[1].score).toBe(0);
  });
});

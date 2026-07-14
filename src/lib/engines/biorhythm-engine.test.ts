import { afterEach, describe, expect, it } from "vitest";

import { civilDateToLocalNoon } from "@/lib/ontology/kernel/civil-date";

import { calculateBiorhythm } from "./biorhythm-engine";

const ORIGINAL_TZ = process.env.TZ;

describe("biorhythm civil-day arithmetic", () => {
  afterEach(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it("does not lose half a day or drift across DST", () => {
    const snapshots = ["UTC", "Asia/Seoul", "America/New_York"].map((tz) => {
      process.env.TZ = tz;
      const birth = civilDateToLocalNoon("1990-05-15");
      const target = civilDateToLocalNoon("2024-03-11");
      const result = calculateBiorhythm(birth, target);
      return {
        civilDate: [result.date.getFullYear(), result.date.getMonth() + 1, result.date.getDate()],
        emotional: result.emotional,
        intellectual: result.intellectual,
        physical: result.physical,
      };
    });

    expect(snapshots[1]).toEqual(snapshots[0]);
    expect(snapshots[2]).toEqual(snapshots[0]);
  });

  it("uses exact calendar-day offsets regardless of time of day", () => {
    const birth = civilDateToLocalNoon("2024-03-09");
    const target = civilDateToLocalNoon("2024-03-10");
    expect(calculateBiorhythm(birth, target)).toMatchObject({
      physical: 27,
    });
  });
});

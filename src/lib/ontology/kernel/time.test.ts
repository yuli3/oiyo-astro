import { afterEach, describe, expect, it } from "vitest";

import { calculateSaju } from "../saju/logic";
import { birthCivilToInstant, instantToBirthCivil } from "./time";

const ORIGINAL_TZ = process.env.TZ;
const ZONES = ["Asia/Seoul", "UTC", "America/New_York", "Asia/Kolkata"];

describe("Birth time frame", () => {
  afterEach(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  // The production bug: birth input is a wall clock at the birthplace, but it used
  // to be turned into an instant with `new Date(y, m - 1, d, h)` — i.e. read in the
  // *visitor's* timezone. A New York visitor entering a Korean birth time therefore
  // got an instant 14 hours off, which moved the hour pillar (and often the day).
  it("resolves the same civil birth time to the same instant in every timezone", () => {
    const instants = ZONES.map((tz) => {
      process.env.TZ = tz;
      return birthCivilToInstant({
        day: 15,
        hour: 14,
        minute: 30,
        month: 6,
        year: 1990,
      }).toISOString();
    });

    expect(new Set(instants).size).toBe(1);
    // 14:30 KST == 05:30 UTC
    expect(instants[0]).toBe("1990-06-15T05:30:00.000Z");
  });

  it("keeps the KST reading unchanged (no regression for existing Korean users)", () => {
    // What the old local-timezone constructor produced on a KST machine, which is
    // the frame every stored profile and golden result was written in.
    process.env.TZ = "Asia/Seoul";
    const legacy = new Date(1990, 5, 15, 14, 30);
    process.env.TZ = ORIGINAL_TZ;

    expect(
      birthCivilToInstant({
        day: 15,
        hour: 14,
        minute: 30,
        month: 6,
        year: 1990,
      }).getTime(),
    ).toBe(legacy.getTime());
  });

  it("round-trips civil -> instant -> civil", () => {
    const civil = { day: 1, hour: 0, minute: 10, month: 1, year: 2024 };
    expect(instantToBirthCivil(birthCivilToInstant(civil))).toEqual(civil);
  });

  it("gives one visitor's birth input the same pillars everywhere", () => {
    const pillars = ZONES.map((tz) => {
      process.env.TZ = tz;
      const birth = birthCivilToInstant({
        day: 15,
        hour: 14,
        minute: 30,
        month: 6,
        year: 1990,
      });
      const r = calculateSaju(birth, false, "male", 135.0);
      return [r.year, r.month, r.day, r.hour]
        .map((p) => `${p.heavenlyStem}-${p.earthlyBranch}`)
        .join(" ");
    });
    process.env.TZ = ORIGINAL_TZ;

    expect(new Set(pillars).size).toBe(1);
  });
});

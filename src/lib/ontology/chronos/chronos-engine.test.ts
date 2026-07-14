import { describe, expect, it } from "vitest";

import {
  getChronosCoordinates,
  getUniversalChronosCoordinates,
} from "./chronos-engine";

describe("ChronosEngine Table-Driven Tests", () => {
  const testCases = [
    {
      celtic: "rowan",
      date: "1993-02-14",
      desc: "Valentine 1993",
      zodiac: "Aquarius",
    },
    // 2024 is a leap year. Feb 29 exists.
    // Pisces: Feb 19 - Mar 20.
    // Celtic Ash: Feb 18 - Mar 17.
    {
      celtic: "ash",
      date: "2024-02-29",
      desc: "Leap Year 2024 (Feb 29)",
      zodiac: "Pisces",
    },
    {
      celtic: "birch",
      date: "1900-01-01",
      desc: "Lower Boundary (1900)",
      zodiac: "Capricorn",
    },
    // Dec 31 is Capricorn. Celtic Elder (Nov 25 - Dec 23) ?? Wait, Elder ends Dec 23.
    // Dec 24 - Jan 20 is Birch.
    // Let's verify standard Celtic alignments. Birch starts Dec 24.
    {
      celtic: "birch",
      date: "2099-12-31",
      desc: "Upper Boundary (2099)",
      zodiac: "Capricorn",
    },
    {
      celtic: "nameless",
      date: "2023-12-23",
      desc: "Nameless Day (Dec 23)",
      zodiac: "Capricorn",
    },
  ];

  testCases.forEach(({ celtic, date, desc, zodiac }) => {
    it(`[${desc}] Correctly calculates for ${date}`, () => {
      const d = new Date(date);
      const coords = getChronosCoordinates(d);
      expect(coords.zodiac.sign).toBe(zodiac);
      expect(coords.celtic.id).toBe(celtic);
    });
  });
});

describe("ChronosEngine civil date / instant boundary", () => {
  const base = {
    fullName: "Boundary Test",
    gender: "female" as const,
    longitude: 126.978,
  };

  it("keeps calendar systems on civilDate and exact systems on instant", () => {
    const first = getUniversalChronosCoordinates({
      ...base,
      civilDate: "1990-05-15",
      instant: new Date("1990-05-15T01:00:00.000Z"),
    });
    const changedInstant = getUniversalChronosCoordinates({
      ...base,
      civilDate: "1990-05-15",
      instant: new Date("1990-05-15T13:00:00.000Z"),
    });

    expect(changedInstant.zodiac).toEqual(first.zodiac);
    expect(changedInstant.celtic).toEqual(first.celtic);
    expect(changedInstant.numerology).toEqual(first.numerology);
    expect(changedInstant.julianDay).not.toBe(first.julianDay);

    const changedCivilDate = getUniversalChronosCoordinates({
      ...base,
      civilDate: "1990-06-15",
      instant: new Date("1990-05-15T01:00:00.000Z"),
    });

    expect(changedCivilDate.zodiac).not.toEqual(first.zodiac);
    expect(changedCivilDate.julianDay).toBe(first.julianDay);
    expect(changedCivilDate.saju).toEqual(first.saju);
    expect(changedCivilDate.vedic).toEqual(first.vedic);
    expect(changedCivilDate.ziwei).toEqual(first.ziwei);
    expect(changedCivilDate.hellenistic.sect).toEqual(first.hellenistic.sect);
    expect(changedCivilDate.hellenistic.triplicity.element).not.toEqual(first.hellenistic.triplicity.element);
  });

  it("keeps exact coordinates independent of the runtime timezone", () => {
    const originalTz = process.env.TZ;
    const snapshots = ["UTC", "Asia/Seoul", "America/New_York", "Asia/Kolkata"].map((tz) => {
      process.env.TZ = tz;
      const result = getUniversalChronosCoordinates({
        ...base,
        civilDate: "1990-05-15",
        instant: new Date("1990-05-15T01:00:00.000Z"),
      });
      return {
        hellenistic: result.hellenistic,
        julianDay: result.julianDay,
        saju: result.saju,
        vedic: result.vedic,
        ziwei: result.ziwei,
      };
    });
    process.env.TZ = originalTz;

    expect(snapshots.every((snapshot) => JSON.stringify(snapshot) === JSON.stringify(snapshots[0]))).toBe(true);
  });

  it("rejects malformed or impossible civil dates", () => {
    const instant = new Date("1990-05-15T01:00:00.000Z");

    expect(() =>
      getUniversalChronosCoordinates({
        ...base,
        civilDate: "1990-02-30",
        instant,
      }),
    ).toThrow(RangeError);
    expect(() =>
      getUniversalChronosCoordinates({
        ...base,
        civilDate: "05/15/1990",
        instant,
      }),
    ).toThrow(RangeError);
  });
});

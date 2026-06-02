import { describe, expect, it } from "vitest";

import { getChronosCoordinates } from "./chronos-engine";

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

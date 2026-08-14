import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { compareSymbolicProfiles, deriveSymbolicProfile } from "./index";
import type { BirthMoment, SymbolicProfile } from "./types";

interface GoldenCase {
  birth: BirthMoment;
  expected: {
    chineseZodiac: string;
    monthPillar: string;
    sunSign: string;
    timeStatus: string;
    yearPillar: string;
  };
  id: string;
}

const golden = JSON.parse(
  readFileSync(new URL("../../../config/symbolic-profile-v1.golden.json", import.meta.url), "utf8"),
) as { profiles: GoldenCase[]; schema: string; schemaVersion: number };

const pillarId = (pillar: SymbolicProfile["saju"]["year"]): string =>
  `${pillar.heavenlyStem}-${pillar.earthlyBranch}`;

describe("symbolic tradition module", () => {
  it.each(golden.profiles)("derives the $id golden profile", ({ birth, expected }) => {
    const profile = deriveSymbolicProfile(birth);

    expect(pillarId(profile.saju.year)).toBe(expected.yearPillar);
    expect(pillarId(profile.saju.month)).toBe(expected.monthPillar);
    expect(profile.chineseZodiac.branch).toBe(expected.chineseZodiac);
    expect(profile.sunSign.sign).toBe(expected.sunSign);
    expect(profile.source.timeStatus).toBe(expected.timeStatus);
    if (birth.civilTime === null) expect(profile.saju.hour).toBeNull();
    else expect(profile.saju.hour).toEqual(expect.any(Object));
  });

  it("is deterministic and independent of the runtime locale and timezone", () => {
    const input = golden.profiles[1].birth;
    const originalTz = process.env.TZ;
    const originalLocale = process.env.LC_ALL;
    try {
      process.env.TZ = "America/New_York";
      process.env.LC_ALL = "fr_FR.UTF-8";
      const first = deriveSymbolicProfile(input);
      process.env.TZ = "Asia/Seoul";
      process.env.LC_ALL = "ko_KR.UTF-8";
      expect(deriveSymbolicProfile(input)).toEqual(first);
    } finally {
      process.env.TZ = originalTz;
      process.env.LC_ALL = originalLocale;
    }
  });

  it("returns four independent, symmetric lenses without an aggregate judgment", () => {
    const a = deriveSymbolicProfile(golden.profiles[0].birth);
    const b = deriveSymbolicProfile(golden.profiles[2].birth);
    const ab = compareSymbolicProfiles(a, b);
    const ba = compareSymbolicProfiles(b, a);

    expect(ab.lenses.map((lens) => lens.id)).toEqual([
      "five-elements",
      "yin-yang",
      "chinese-zodiac",
      "sun-sign",
    ]);
    expect(ab.lenses).toEqual(ba.lenses);
    expect(ab).not.toHaveProperty("score");
    expect(ab).not.toHaveProperty("compatibilityJudgment");
    expect(ab.lenses.every((lens) => lens.harmonyIndex === null)).toBe(true);
  });

  it("rejects invalid civil dates and offsets instead of normalizing them", () => {
    expect(() => deriveSymbolicProfile({ ...golden.profiles[0].birth, civilDate: "2024-02-31" })).toThrow(RangeError);
    expect(() => deriveSymbolicProfile({ ...golden.profiles[0].birth, utcOffsetMinutes: 900 })).toThrow(RangeError);
  });
});

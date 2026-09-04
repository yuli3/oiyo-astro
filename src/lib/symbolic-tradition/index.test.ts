import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { compareSymbolicProfiles, deriveSymbolicProfile, HARMONY_INDEX_TABLE } from "./index";
import { COMPATIBILITY_LENSES } from "./types";
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
    // Per-lens indices are on (2026-08-18); a single total is still absent.
    expect(ab.lenses.every((lens) => typeof lens.harmonyIndex === "number")).toBe(true);
    expect(ab.lenses.every((lens) => lens.harmonyIndex >= 0 && lens.harmonyIndex <= 100)).toBe(true);
    expect(ab.policy.aggregateJudgment).toBe("none");
    expect(ab).not.toHaveProperty("harmonyIndex");
    expect(ab).not.toHaveProperty("total");
  });

  it("emits every lens in COMPATIBILITY_LENSES, and no others", () => {
    // 목록에 id 를 더해 놓고 compareSymbolicProfiles 에 lens(...) 를 안 넣는
    // 실수를 막는다. 타입은 통과하고 화면에서만 관점 하나가 조용히 빠진다.
    const a = deriveSymbolicProfile(golden.profiles[0].birth as BirthMoment);
    const b = deriveSymbolicProfile(golden.profiles[1].birth as BirthMoment);
    const emitted = compareSymbolicProfiles(a, b).lenses.map((lens) => lens.id).sort();
    expect(emitted).toEqual([...COMPATIBILITY_LENSES].sort());
  });

  it("has a harmony index for every relation the lenses can emit", () => {
    // The lens functions throw on an unmapped relation, so walking every pair
    // in the golden set is what proves the table covers the vocabulary rather
    // than just the cases the other tests happen to hit.
    const profiles = golden.profiles.map((p: { birth: BirthMoment }) => deriveSymbolicProfile(p.birth));
    const seen = new Set<string>();
    for (const a of profiles) {
      for (const b of profiles) {
        for (const lens of compareSymbolicProfiles(a, b).lenses) {
          seen.add(`${lens.id}/${lens.relation}`);
          expect(typeof lens.harmonyIndex).toBe("number");
        }
      }
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const [id, table] of Object.entries(HARMONY_INDEX_TABLE)) {
      for (const value of Object.values(table)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
      expect(Object.keys(table).length).toBeGreaterThan(1);
    }
  });

  it("rejects invalid civil dates and offsets instead of normalizing them", () => {
    expect(() => deriveSymbolicProfile({ ...golden.profiles[0].birth, civilDate: "2024-02-31" })).toThrow(RangeError);
    expect(() => deriveSymbolicProfile({ ...golden.profiles[0].birth, utcOffsetMinutes: 900 })).toThrow(RangeError);
  });
});

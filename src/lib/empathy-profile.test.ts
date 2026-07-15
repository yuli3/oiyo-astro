import { describe, expect, it } from "vitest";
import {
  buildEmpathyProfile,
  EMPATHY_MAX_DIMENSION_SCORE,
  scoreEmpathyAnswers,
} from "./empathy-profile";

const dimensions = [
  "cognitive", "cognitive", "cognitive", "cognitive",
  "affective", "affective", "affective", "affective",
  "compassionate", "compassionate", "compassionate", "compassionate",
] as const;

describe("empathy profile", () => {
  it("scores each dimension on its own 0-16 scale", () => {
    expect(scoreEmpathyAnswers([4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2], dimensions)).toEqual({
      cognitive: EMPATHY_MAX_DIMENSION_SCORE,
      affective: 12,
      compassionate: 8,
    });
  });

  it("rejects incomplete and out-of-range answer sets", () => {
    expect(scoreEmpathyAnswers([4, 4], dimensions)).toBeNull();
    expect(scoreEmpathyAnswers([5, ...Array(11).fill(2)], dimensions)).toBeNull();
  });

  it("marks ties and small gaps as close profiles", () => {
    expect(buildEmpathyProfile({ cognitive: 12, affective: 12, compassionate: 8 })).toMatchObject({
      primary: "cognitive",
      secondary: "affective",
      gap: 0,
      isTie: true,
      isClose: true,
      closeDimensions: ["cognitive", "affective"],
    });
    expect(buildEmpathyProfile({ cognitive: 13, affective: 11, compassionate: 8 }).isClose).toBe(true);
  });

  it("keeps all three dimensions visible in a three-way tie", () => {
    expect(buildEmpathyProfile({ cognitive: 10, affective: 10, compassionate: 10 })).toMatchObject({
      isTie: true,
      isClose: true,
      closeDimensions: ["cognitive", "affective", "compassionate"],
      closeGap: 0,
    });
  });

  it("keeps an all-zero response profile neutral across all dimensions", () => {
    const scores = scoreEmpathyAnswers(Array(12).fill(0), dimensions);
    expect(scores).not.toBeNull();
    expect(buildEmpathyProfile(scores!)).toMatchObject({
      isClose: true,
      closeDimensions: ["cognitive", "affective", "compassionate"],
      closeGap: 0,
    });
  });

  it("keeps low flat and all-three-within-two profiles neutral", () => {
    expect(buildEmpathyProfile({ cognitive: 3, affective: 2, compassionate: 1 })).toMatchObject({
      isClose: true,
      closeDimensions: ["cognitive", "affective", "compassionate"],
      closeGap: 2,
    });
    expect(buildEmpathyProfile({ cognitive: 11, affective: 10, compassionate: 9 })).toMatchObject({
      isClose: true,
      closeDimensions: ["cognitive", "affective", "compassionate"],
      closeGap: 2,
    });
  });

  it("keeps a clear lead distinct and reports per-dimension percentages", () => {
    const profile = buildEmpathyProfile({ cognitive: 15, affective: 9, compassionate: 7 });
    expect(profile).toMatchObject({ primary: "cognitive", secondary: "affective", gap: 6, isClose: false });
    expect(profile.ranked[0]).toEqual({ dimension: "cognitive", score: 15, percent: 94 });
  });
});

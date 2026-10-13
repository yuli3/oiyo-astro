import { describe, expect, it } from "vitest";

import { branchRelation, buildNewYearReport } from "./new-year-report";
import { EarthlyBranch, HeavenlyStem } from "@/lib/ontology/saju/types";

describe("buildNewYearReport", () => {
  // 2000-01-01은 戊午일이다(널리 쓰이는 기준일).
  const report = buildNewYearReport("2000-01-01", 2027);

  it("reads 2027 as 丁未", () => {
    expect(report?.year.stem).toBe(HeavenlyStem.JEONG);
    expect(report?.year.branch).toBe(EarthlyBranch.MI);
  });

  it("uses the day pillar of the birth date", () => {
    expect(report?.dayMaster).toBe(HeavenlyStem.MU);
    expect(report?.dayBranch).toBe(EarthlyBranch.O);
  });

  it("gives 丁 to a 戊 day master as resource and 午-未 as harmony", () => {
    expect(report?.year.stemRole).toBe("insung");
    expect(report?.year.relation).toBe("harmony");
  });

  it("returns twelve month pillars on the solar-term calendar", () => {
    expect(report?.months).toHaveLength(12);
    // 1월 15일은 아직 입춘 전이라 丙午년의 丑월(辛丑)이다.
    expect(report?.months[0]).toMatchObject({ stem: HeavenlyStem.SIN, branch: EarthlyBranch.CHUK });
    // 丁년의 寅월은 壬寅, 子월은 壬子.
    expect(report?.months[1]).toMatchObject({ stem: HeavenlyStem.IM, branch: EarthlyBranch.IN });
    expect(report?.months[11]).toMatchObject({ stem: HeavenlyStem.IM, branch: EarthlyBranch.JA });
  });

  it("rejects malformed dates", () => {
    expect(buildNewYearReport("2000-1-1", 2027)).toBeNull();
    expect(buildNewYearReport("", 2027)).toBeNull();
  });
});

describe("branchRelation", () => {
  it("finds clashes and harmonies in either order", () => {
    expect(branchRelation(EarthlyBranch.CHUK, EarthlyBranch.MI)).toBe("clash");
    expect(branchRelation(EarthlyBranch.MI, EarthlyBranch.O)).toBe("harmony");
    expect(branchRelation(EarthlyBranch.JA, EarthlyBranch.MI)).toBe("none");
  });
});

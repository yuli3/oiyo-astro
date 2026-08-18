import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";

describe("circle civil input", () => {
  it("builds a comparison profile from a date alone", () => {
    const profile = comparisonFromCivil({ date: "1991-02-04" });
    expect(profile.chineseZodiac.branch).toBeTruthy();
    expect(profile.sunSign.sign).toBeTruthy();
    expect(profile.fiveElements.observedCoordinates).toBe(6);
  });

  it("uses eight coordinates when time and city are known", () => {
    const profile = comparisonFromCivil({ cityId: "seoul", date: "1991-02-04", time: "08:30" });
    expect(profile.fiveElements.observedCoordinates).toBe(8);
  });

  it("rejects a broken date", () => {
    expect(() => comparisonFromCivil({ date: "nope" })).toThrow();
  });
});

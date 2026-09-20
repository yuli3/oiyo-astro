import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import type { City } from "@/lib/ontology/natal/signs";

const washington: City = {
  id: "gn:38.8951,-77.0364",
  label: { ko: "워싱턴 D.C.", en: "Washington, D.C.", ja: "ワシントンD.C.", zh: "华盛顿哥伦比亚特区", fr: "Washington", es: "Washington D. C." },
  lat: 38.8951,
  lon: -77.0364,
  tz: 0,
  zoneId: "America/New_York",
};

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

  it("uses a searched city's IANA zone instead of silently falling back to Korea", () => {
    expect(() => comparisonFromCivil({
      city: washington,
      date: "2024-03-10",
      time: "02:30",
    })).toThrow(/Ambiguous birth moment/);

    expect(comparisonFromCivil({
      city: washington,
      date: "2002-09-01",
      time: "09:00",
    }).fiveElements.observedCoordinates).toBe(8);
  });

  it("rejects a broken date", () => {
    expect(() => comparisonFromCivil({ date: "nope" })).toThrow();
  });
});

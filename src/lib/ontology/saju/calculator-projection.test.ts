import { describe, expect, it } from "vitest";

import { createBirthRecord } from "@/lib/user/birth-record";

import { calculateBirthSaju } from "./birth-contract";
import { projectSajuCalculator } from "./calculator-projection";

describe("public Saju calculator projection", () => {
  it("maps canonical pillars to numeric indices and counts all eight symbols", () => {
    const projection = projectSajuCalculator(calculateBirthSaju(createBirthRecord({
      civilDate: "2002-09-01",
      civilTime: "09:00",
      longitude: -77.0369,
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: -240,
      zoneId: "America/New_York",
    })));

    expect(projection.status).toBe("resolved");
    if (projection.status !== "resolved") return;
    expect(projection.pillars).toEqual({
      year: { stem: 8, branch: 6 },
      month: { stem: 4, branch: 8 },
      day: { stem: 8, branch: 8 },
      hour: { stem: 1, branch: 5 },
    });
    expect(Object.values(projection.elementCount).reduce((sum, count) => sum + count, 0)).toBe(8);
    expect(projection.dominantElement).toBe(projection.sortedElements[0]);
  });

  it("keeps an unknown time as three pillars without an invented analysis hour", () => {
    const projection = projectSajuCalculator(calculateBirthSaju(createBirthRecord({
      civilDate: "2000-05-15",
      civilTime: null,
      longitude: 126.978,
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: null,
      zoneId: "Asia/Seoul",
    })));

    expect(projection.status).toBe("resolved");
    if (projection.status !== "resolved") return;
    expect(projection.pillars.hour).toBeNull();
    expect(Object.values(projection.elementCount).reduce((sum, count) => sum + count, 0)).toBe(6);
  });

  it("preserves the needs-offset boundary instead of projecting a guessed chart", () => {
    const projection = projectSajuCalculator(calculateBirthSaju(createBirthRecord({
      civilDate: "2002-09-01",
      civilTime: "09:00",
      longitude: null,
      needsConfirmation: true,
      utcOffsetMinutesAtBirth: null,
      zoneId: null,
    })));

    expect(projection).toEqual({
      status: "needs-offset",
      reason: "time-known-offset-missing",
    });
  });
});

import { describe, expect, it } from "vitest";

import { createBirthRecord } from "@/lib/user/birth-record";

import { calculateBirthSaju, resolveBirthDayMasterElement } from "./birth-contract";
import { EarthlyBranch } from "./types";

describe("canonical birth-to-saju contract", () => {
  it.each([
    ["Seoul", "Asia/Seoul", 540, 126.978],
    ["Washington DC", "America/New_York", -240, -77.0369],
  ])("keeps 09:00 local wall time in the Sa hour: %s", (_label, zoneId, offset, longitude) => {
    const resolution = calculateBirthSaju(createBirthRecord({
      civilDate: "2002-09-01",
      civilTime: "09:00",
      longitude,
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: offset,
      zoneId,
    }));

    expect(resolution.status).toBe("resolved");
    if (resolution.status === "resolved") {
      expect(resolution.standard.hour?.earthlyBranch).toBe(EarthlyBranch.SA);
      expect(resolution.basis.standardClock).toBe("birthplace-wall-clock");
      expect(resolution.basis.solarTermClock).toBe("absolute-instant");
      expect(resolution.basis.utcOffsetMinutesAtBirth).toBe(offset);
    }
  });

  it("does not invent an hour when birth time is unknown", () => {
    const resolution = calculateBirthSaju(createBirthRecord({
      civilDate: "2000-05-15",
      civilTime: null,
      longitude: 126.978,
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: null,
      zoneId: "Asia/Seoul",
    }));
    expect(resolution.status).toBe("resolved");
    if (resolution.status === "resolved") expect(resolution.standard.hour).toBeNull();
  });

  it("refuses a known time without its birth offset", () => {
    expect(calculateBirthSaju(createBirthRecord({
      civilDate: "2002-09-01",
      civilTime: "09:00",
      longitude: null,
      needsConfirmation: true,
      utcOffsetMinutesAtBirth: null,
      zoneId: null,
    }))).toEqual({ status: "needs-offset", reason: "time-known-offset-missing" });
  });

  it("projects the same day element regardless of longitude", () => {
    const base = {
      civilDate: "2002-09-01",
      civilTime: "09:00",
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: -240,
      zoneId: "America/New_York",
    } as const;
    const dc = createBirthRecord({ ...base, longitude: -77.0369 });
    const farWest = createBirthRecord({ ...base, longitude: -120 });
    expect(resolveBirthDayMasterElement(dc)).toBe(resolveBirthDayMasterElement(farWest));
    expect(resolveBirthDayMasterElement(dc)).not.toBeNull();
  });

  it("does not invent an offset for the lightweight day-element projection", () => {
    expect(resolveBirthDayMasterElement(createBirthRecord({
      civilDate: "2002-09-01",
      civilTime: "09:00",
      longitude: -77.0369,
      needsConfirmation: true,
      zoneId: "America/New_York",
    }))).toBeNull();
  });
});

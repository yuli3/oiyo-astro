import { afterEach, describe, expect, it } from "vitest";

import {
  birthRecordToCivilDate,
  civilDateToLocalNoon,
  createBirthRecord,
  isBirthRecordV2,
  migrateLegacyBirth,
  resolveBirthInstant,
  resolveZonedCivilTime,
} from "./birth-record";
import { useUserStore } from "./store/user-store";

const ORIGINAL_TZ = process.env.TZ;

describe("BirthRecord V2", () => {
  afterEach(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it("validates calendar dates, offsets, and longitudes", () => {
    expect(() => createBirthRecord({ civilDate: "2023-02-29" })).toThrow();
    expect(() => createBirthRecord({ civilDate: "2024-02-29", civilTime: "24:00" })).toThrow();
    expect(() => createBirthRecord({ civilDate: "2024-02-29", longitude: 181 })).toThrow();
    expect(() => createBirthRecord({ civilDate: "2024-02-29", utcOffsetMinutesAtBirth: 841 })).toThrow();
  });

  it("migrates date-only legacy input without inventing a time or location", () => {
    const record = migrateLegacyBirth({ birthDate: "1990-05-15" });
    expect(record).toMatchObject({
      civilDate: "1990-05-15",
      civilTime: null,
      longitude: null,
      needsConfirmation: true,
      provenance: "legacy-date",
      utcOffsetMinutesAtBirth: null,
    });
    expect(resolveBirthInstant(record!)).toEqual({ status: "date-only", reason: "time-unknown" });
  });

  it("preserves a legacy ISO candidate but refuses exact calculations until confirmed", () => {
    const record = migrateLegacyBirth({ birthDate: "1990-05-15T10:00:00.000Z" });
    expect(record).toMatchObject({
      civilDate: "1990-05-15",
      civilTime: "19:00",
      needsConfirmation: true,
      provenance: "legacy-iso",
    });
    expect(resolveBirthInstant(record!)).toEqual({
      status: "needs-confirmation",
      reason: "legacy-or-missing-location",
    });
  });

  it("resolves a confirmed civil time independently of the visitor runtime timezone", () => {
    const instants = ["UTC", "Asia/Seoul", "America/New_York"].map((tz) => {
      process.env.TZ = tz;
      const record = createBirthRecord({
        civilDate: "1990-05-15",
        civilTime: "19:00",
        longitude: 126.978,
        utcOffsetMinutesAtBirth: 540,
        zoneId: "Asia/Seoul",
      });
      const resolution = resolveBirthInstant(record);
      expect(resolution.status).toBe("resolved");
      return resolution.status === "resolved" ? resolution.instant.toISOString() : "";
    });
    expect(new Set(instants)).toEqual(new Set(["1990-05-15T10:00:00.000Z"]));
  });

  it("keeps date-only consumers on the selected civil day in each runtime timezone", () => {
    const record = createBirthRecord({ civilDate: "2000-01-01" });
    for (const tz of ["Pacific/Kiritimati", "UTC", "America/Adak"]) {
      process.env.TZ = tz;
      const date = birthRecordToCivilDate(record);
      expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual([2000, 1, 1]);
      const direct = civilDateToLocalNoon("2000-01-01");
      expect([direct.getFullYear(), direct.getMonth() + 1, direct.getDate()]).toEqual([2000, 1, 1]);
    }
  });

  it("resolves IANA zones including half-hour offsets", () => {
    expect(resolveZonedCivilTime({
      civilDate: "2024-01-15",
      civilTime: "12:00",
      zoneId: "Asia/Kolkata",
    })).toMatchObject({ status: "resolved", offsetMinutes: 330 });
  });

  it.each([
    ["Seoul standard time", "1990-05-15", "19:00", "Asia/Seoul", 540, "1990-05-15T10:00:00.000Z"],
    ["India half-hour time", "2024-01-15", "12:00", "Asia/Kolkata", 330, "2024-01-15T06:30:00.000Z"],
    ["New York standard time", "2024-01-15", "12:00", "America/New_York", -300, "2024-01-15T17:00:00.000Z"],
    ["New York daylight time", "2024-07-15", "12:00", "America/New_York", -240, "2024-07-15T16:00:00.000Z"],
  ])("matches the timezone fixture: %s", (_label, civilDate, civilTime, zoneId, offset, iso) => {
    const result = resolveZonedCivilTime({ civilDate, civilTime, zoneId });
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.offsetMinutes).toBe(offset);
      expect(result.instant.toISOString()).toBe(iso);
    }
  });

  it("does not guess across DST gaps or overlaps", () => {
    expect(resolveZonedCivilTime({
      civilDate: "2024-03-10",
      civilTime: "02:30",
      zoneId: "America/New_York",
    })).toEqual({ status: "nonexistent" });

    const overlap = resolveZonedCivilTime({
      civilDate: "2024-11-03",
      civilTime: "01:30",
      zoneId: "America/New_York",
    });
    expect(overlap.status).toBe("ambiguous");
    if (overlap.status === "ambiguous") {
      expect(overlap.candidates.map((candidate) => candidate.offsetMinutes).sort((a, b) => a - b)).toEqual([-300, -240]);
    }
  });

  it("rejects malformed persisted V2 records and unsupported zones", () => {
    const record = createBirthRecord({ civilDate: "2024-01-01" });
    expect(isBirthRecordV2({ ...record, utcOffsetMinutesAtBirth: 900 })).toBe(false);
    expect(resolveZonedCivilTime({
      civilDate: "2024-01-01",
      civilTime: "12:00",
      zoneId: "Mars/Olympus_Mons",
    })).toEqual({ status: "invalid-zone" });
  });

  it("keeps V2 and legacy shadow fields atomic and invalidates stale exact data", () => {
    useUserStore.getState().clearProfile();
    useUserStore.getState().saveBirthRecord(createBirthRecord({
      civilDate: "1990-05-15",
      civilTime: "19:30",
      longitude: 126.978,
      utcOffsetMinutesAtBirth: 540,
      zoneId: "Asia/Seoul",
    }));
    expect(useUserStore.getState().profile).toMatchObject({
      birthDate: "1990-05-15",
      birthTime: "19:30",
    });

    useUserStore.getState().setBirthDate("1991-06-16");
    expect(useUserStore.getState().profile.birthRecord).toMatchObject({
      civilDate: "1991-06-16",
      longitude: null,
      needsConfirmation: true,
    });

    useUserStore.getState().setProfile({ birthTime: null });
    expect(useUserStore.getState().profile.birthRecord).toMatchObject({
      civilTime: null,
      timeKnown: false,
    });
  });
});

import { describe, expect, it } from "vitest";
import { decodeResult, encodeResult } from "../../result-permalink";
import { parseSajuInputState, parseSajuTime } from "./input-contract";
import { createBirthRecord, createBirthRecordFromParts } from "../../user/birth-record";

const legacy = { year: 2000, month: 2, day: 29, hour: 14, gender: "female" };

describe("Saju birth-time transport contract", () => {
  it("reads already-issued hour-only links as :00", () => {
    const payload = encodeResult("saju-calculator", legacy);
    const decoded = decodeResult(`#r=${payload}`);
    expect(parseSajuInputState(decoded?.state)).toEqual({ ...legacy, schemaVersion: 2, minute: 0 });
  });

  it.each(["00:00", "00:01", "14:37", "23:59"])("preserves %s from input through link and profile adapter", (value) => {
    const time = parseSajuTime(value);
    const state = parseSajuInputState({ ...legacy, ...time, schemaVersion: 2 });
    expect(state).not.toBeNull();
    const payload = encodeResult("saju-calculator", state);
    const restored = parseSajuInputState(decodeResult(payload)?.state);
    expect(restored).toEqual(state);
    expect(createBirthRecordFromParts(restored!).civilTime).toBe(value);
  });

  it("keeps unknown time unknown instead of silently inventing noon", () => {
    const state = parseSajuInputState({ ...legacy, ...parseSajuTime("") });
    expect(state?.hour).toBeNull();
    expect(state?.minute).toBeNull();
    expect(createBirthRecordFromParts(state!).civilTime).toBeNull();
  });

  it("preserves the exact calculation location in version 3 shares", () => {
    const birthRecord = createBirthRecord({
      civilDate: "2000-02-29",
      civilTime: "14:37",
      longitude: -77.0369,
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: -300,
      zoneId: "America/New_York",
    });
    const state = parseSajuInputState({
      ...legacy,
      hour: 14,
      minute: 37,
      schemaVersion: 3,
      birthRecord,
    });
    expect(state).toEqual({
      ...legacy,
      hour: 14,
      minute: 37,
      schemaVersion: 3,
      birthRecord,
    });
  });

  it("rejects version 3 shares whose visible inputs disagree with the birth record", () => {
    const birthRecord = createBirthRecord({
      civilDate: "2000-02-29",
      civilTime: "14:37",
      longitude: 126.978,
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: 540,
      zoneId: "Asia/Seoul",
    });
    expect(parseSajuInputState({
      ...legacy,
      hour: 9,
      minute: 0,
      schemaVersion: 3,
      birthRecord,
    })).toBeNull();
  });

  it("rejects a version 3 share whose historical offset contradicts its time zone", () => {
    const birthRecord = createBirthRecord({
      civilDate: "2000-02-29",
      civilTime: "14:37",
      longitude: -77.0369,
      needsConfirmation: false,
      utcOffsetMinutesAtBirth: 540,
      zoneId: "America/New_York",
    });
    expect(parseSajuInputState({
      ...legacy,
      hour: 14,
      minute: 37,
      schemaVersion: 3,
      birthRecord,
    })).toBeNull();
  });

  it.each(["24:00", "14:60", "-1:00", "14:3", "14:37:59"])("rejects malformed time %s", (value) => {
    expect(parseSajuTime(value)).toBeNull();
  });

  it.each([
    { year: 2023, month: 2, day: 29 },
    { month: 13 }, { day: 0 }, { hour: 24 }, { hour: 1.5 },
    { minute: 60 }, { minute: -1 }, { minute: "37" },
    { schemaVersion: 3 }, { schemaVersion: 4 }, { gender: "invalid" },
  ])("rejects corrupt share state %j", (change) => {
    expect(parseSajuInputState({ ...legacy, ...change })).toBeNull();
  });
});

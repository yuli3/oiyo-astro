import { describe, expect, it } from "vitest";
import { decodeResult, encodeResult } from "../../result-permalink";
import { parseSajuInputState, parseSajuTime } from "./input-contract";
import { createBirthRecordFromParts } from "../../user/birth-record";

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

  it.each(["24:00", "14:60", "-1:00", "14:3", "14:37:59"])("rejects malformed time %s", (value) => {
    expect(parseSajuTime(value)).toBeNull();
  });

  it.each([
    { year: 2023, month: 2, day: 29 },
    { month: 13 }, { day: 0 }, { hour: 24 }, { hour: 1.5 },
    { minute: 60 }, { minute: -1 }, { minute: "37" },
    { schemaVersion: 3 }, { gender: "invalid" },
  ])("rejects corrupt share state %j", (change) => {
    expect(parseSajuInputState({ ...legacy, ...change })).toBeNull();
  });
});

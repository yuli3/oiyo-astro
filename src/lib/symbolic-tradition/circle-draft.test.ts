import { describe, expect, it } from "vitest";

import { deriveSymbolicProfile } from ".";
import type { SymbolicGroupParticipant } from "./group-snapshot";
import {
  CIRCLE_DRAFT_STORAGE_KEY,
  loadCircleDraft,
  saveCircleDraft,
} from "./circle-draft";

class MemoryStorage implements Pick<Storage, "getItem" | "removeItem" | "setItem"> {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const profile = deriveSymbolicProfile({
  civilDate: "2007-03-24",
  civilTime: "14:00",
  longitude: 126.978,
  utcOffsetMinutes: 540,
});
const participant: SymbolicGroupParticipant = {
  id: "p-fixture-a",
  label: "Fixture A",
  profile: {
    chineseZodiac: profile.chineseZodiac,
    fiveElements: profile.fiveElements,
    sunSign: profile.sunSign,
    yinYang: profile.yinYang,
  },
};

describe("circle local draft", () => {
  it("restores a one-person circle after a normal reload", () => {
    const storage = new MemoryStorage();
    const now = new Date("2026-09-20T00:00:00.000Z");

    saveCircleDraft(storage, { centerId: participant.id, participants: [participant] }, { now });

    expect(loadCircleDraft(storage, { now })).toEqual({
      centerId: participant.id,
      participants: [participant],
    });
  });

  it("rejects expired or malformed browser data", () => {
    const storage = new MemoryStorage();
    saveCircleDraft(
      storage,
      { centerId: participant.id, participants: [participant] },
      { now: new Date("2026-08-01T00:00:00.000Z") },
    );
    expect(loadCircleDraft(storage, { now: new Date("2026-09-20T00:00:00.000Z") })).toBeNull();

    storage.setItem(CIRCLE_DRAFT_STORAGE_KEY, "not-json");
    expect(loadCircleDraft(storage)).toBeNull();

    storage.setItem(CIRCLE_DRAFT_STORAGE_KEY, JSON.stringify({
      centerId: participant.id,
      expiresAt: "not-a-date",
      participants: [participant],
      schema: "oiyo.circle-draft",
      schemaVersion: 1,
    }));
    expect(loadCircleDraft(storage)).toBeNull();
  });

  it("refuses duplicate participant identities before writing", () => {
    const storage = new MemoryStorage();

    expect(() => saveCircleDraft(storage, {
      centerId: participant.id,
      participants: [participant, { ...participant, label: "Duplicate" }],
    })).toThrow(TypeError);
  });
});

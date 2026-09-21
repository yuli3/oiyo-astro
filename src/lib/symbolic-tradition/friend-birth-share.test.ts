import { describe, expect, it } from "vitest";

import { createEncryptedResultPermalink, readEncryptedResultPermalink } from "@/lib/encrypted-result-permalink";
import type { City } from "@/lib/ontology/natal/signs";

import { saveCircleDraft, loadCircleDraft } from "./circle-draft";
import { comparisonFromCivil } from "./circle-input";
import { FRIEND_BIRTH_SHARE_TOOL_ID, parseFriendBirthShare, type FriendBirthShare } from "./friend-birth-share";
import type { SymbolicGroupParticipant } from "./group-snapshot";

const ID = "abcdefghijklmnopqrstuv";
const TOKEN = "d".repeat(43);
const NOW = new Date("2026-09-20T00:00:00.000Z");
const washington: City = {
  id: "gn:38.8951,-77.0364",
  label: {
    en: "Washington, D.C.",
    es: "Washington D. C.",
    fr: "Washington",
    ja: "ワシントンD.C.",
    ko: "워싱턴 D.C.",
    zh: "华盛顿哥伦比亚特区",
  },
  lat: 38.8951,
  lon: -77.0364,
  tz: 0,
  zoneId: "America/New_York",
};
const friend: FriendBirthShare = {
  alias: "DC friend",
  city: washington,
  date: "2002-09-01",
  schemaVersion: 1,
  time: "09:00",
};

class MemoryStorage implements Pick<Storage, "getItem" | "removeItem" | "setItem"> {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("encrypted friend birth browser journey", () => {
  it("round-trips alias, civil birth input, and custom city coordinates", () => {
    expect(parseFriendBirthShare(friend)).toEqual(friend);
  });

  it("allows unknown time but rejects invalid or overlong identity data", () => {
    expect(parseFriendBirthShare({ ...friend, time: null })?.time).toBeNull();
    expect(parseFriendBirthShare({ ...friend, alias: "x".repeat(25) })).toBeNull();
    expect(parseFriendBirthShare({ ...friend, date: "not-a-date" })).toBeNull();
    expect(parseFriendBirthShare({ ...friend, city: { ...friend.city, zoneId: "" } })).toBeNull();
  });

  it("creates, opens, accepts, and restores a Washington friend without exposing birth data", async () => {
    let encryptedEnvelope: unknown;
    const created = await createEncryptedResultPermalink(FRIEND_BIRTH_SHARE_TOOL_ID, friend, {
      fetcher: async (_input, init) => {
        encryptedEnvelope = JSON.parse(String(init?.body));
        return Response.json({ deleteToken: TOKEN, id: ID });
      },
      now: NOW,
      pageUrl: "https://oiyo.net/ko/circle/",
    });

    expect(created.url).toContain(`?result=${ID}#k=`);
    expect(created.url).not.toContain("2002-09-01");
    expect(JSON.stringify(encryptedEnvelope)).not.toContain("Washington");

    // A new browser receives only the server envelope and the URL fragment.
    const receiverStorage = new MemoryStorage();
    const opened = await readEncryptedResultPermalink(ID, new URL(created.url).hash, {
      fetcher: async () => Response.json({
        ...(encryptedEnvelope as object),
        schema: "oiyo.symbolic-share-ciphertext",
        schemaVersion: 1,
      }),
      now: NOW,
    });
    expect(opened.ok).toBe(true);
    if (!opened.ok) throw new Error("Encrypted friend link did not open");

    const accepted = parseFriendBirthShare(opened.result.state);
    expect(accepted).toEqual(friend);
    if (!accepted) throw new Error("Friend payload was not accepted");
    const profile = comparisonFromCivil({
      city: accepted.city,
      date: accepted.date,
      time: accepted.time ?? undefined,
    });
    const participant: SymbolicGroupParticipant = {
      id: "p-dc-friend",
      label: accepted.alias,
      profile,
    };
    saveCircleDraft(receiverStorage, {
      centerId: participant.id,
      participants: [participant],
    }, { now: NOW });

    // A reload creates a fresh app state backed by the receiving browser's storage.
    expect(loadCircleDraft(receiverStorage, { now: NOW })).toEqual({
      centerId: participant.id,
      participants: [participant],
    });
    expect(profile.fiveElements.observedCoordinates).toBe(8);
  });
});

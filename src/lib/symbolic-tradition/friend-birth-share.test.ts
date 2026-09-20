import { describe, expect, it } from "vitest";

import { parseFriendBirthShare, type FriendBirthShare } from "./friend-birth-share";

const share: FriendBirthShare = {
  alias: "Washington friend",
  city: {
    id: "washington-dc",
    label: { ko: "워싱턴 D.C.", en: "Washington, D.C.", ja: "ワシントンD.C.", zh: "华盛顿特区", fr: "Washington D.C.", es: "Washington D. C." },
    lat: 38.8951,
    lon: -77.0364,
    tz: -5,
    zoneId: "America/New_York",
  },
  date: "2002-09-01",
  schemaVersion: 1,
  time: "09:00",
};

describe("friend birth share", () => {
  it("round-trips alias, civil birth input, and custom city coordinates", () => {
    expect(parseFriendBirthShare(share)).toEqual(share);
  });

  it("allows unknown time but rejects invalid or overlong identity data", () => {
    expect(parseFriendBirthShare({ ...share, time: null })?.time).toBeNull();
    expect(parseFriendBirthShare({ ...share, alias: "x".repeat(25) })).toBeNull();
    expect(parseFriendBirthShare({ ...share, date: "not-a-date" })).toBeNull();
    expect(parseFriendBirthShare({ ...share, city: { ...share.city, zoneId: "" } })).toBeNull();
  });
});

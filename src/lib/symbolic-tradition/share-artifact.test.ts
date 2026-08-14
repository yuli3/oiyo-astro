import { describe, expect, it } from "vitest";

import { deriveSymbolicProfile } from ".";
import {
  createSymbolicShareArtifact,
  decodeSymbolicShareArtifact,
  encodeSymbolicShareArtifact,
  readSymbolicShareFragment,
  symbolicShareFragment,
} from "./share-artifact";

const NOW = new Date("2026-08-14T00:00:00.000Z");
const profile = deriveSymbolicProfile({
  civilDate: "1991-02-04",
  civilTime: "08:30",
  longitude: 126.978,
  utcOffsetMinutes: 540,
});

describe("symbolic share artifact", () => {
  it("round-trips only the minimum derived comparison profile", () => {
    const artifact = createSymbolicShareArtifact(profile, { now: NOW });
    const encoded = encodeSymbolicShareArtifact(artifact);
    const decoded = decodeSymbolicShareArtifact(encoded, { now: NOW });

    expect(decoded.ok).toBe(true);
    expect(JSON.stringify(artifact)).not.toContain("1991-02-04");
    expect(JSON.stringify(artifact)).not.toContain("08:30");
    expect(artifact).not.toHaveProperty("name");
    expect(encoded.length).toBeLessThan(700);
    expect(artifact.profile).toEqual({
      chineseZodiac: profile.chineseZodiac,
      fiveElements: {
        dominant: profile.fiveElements.dominant,
        observedCoordinates: 8,
      },
      sunSign: profile.sunSign,
      yinYang: profile.yinYang,
    });
  });

  it("expires after seven days by default", () => {
    const encoded = encodeSymbolicShareArtifact(createSymbolicShareArtifact(profile, { now: NOW }));
    expect(decodeSymbolicShareArtifact(encoded, { now: new Date("2026-08-20T23:59:59.000Z") }).ok).toBe(true);
    expect(decodeSymbolicShareArtifact(encoded, { now: new Date("2026-08-21T00:00:00.000Z") })).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects damaged and overlong-lived artifacts", () => {
    const encoded = encodeSymbolicShareArtifact(createSymbolicShareArtifact(profile, { now: NOW }));
    expect(decodeSymbolicShareArtifact(`${encoded.slice(0, -2)}xx`, { now: NOW }).ok).toBe(false);
    expect(() => createSymbolicShareArtifact(profile, { now: NOW, ttlDays: 31 })).toThrow(RangeError);
  });

  it("reads its payload from a URL fragment", () => {
    const artifact = createSymbolicShareArtifact(profile, { now: NOW });
    expect(readSymbolicShareFragment(symbolicShareFragment(artifact), { now: NOW })).toMatchObject({ ok: true });
    expect(readSymbolicShareFragment("#unrelated=1", { now: NOW })).toBeNull();
  });
});

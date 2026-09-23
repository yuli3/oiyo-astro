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
      // 2026-09-24: 마야·켈트 렌즈가 읽으므로 공유 대상에 들어왔다. 둘 다 날짜에서만
      // 나오므로 사주 기둥보다 더 드러내는 것이 없다.
      celticTree: profile.celticTree,
      chineseZodiac: profile.chineseZodiac,
      mayanKin: profile.mayanKin,
      fiveElements: {
        counts: profile.fiveElements.counts,
        dominant: profile.fiveElements.dominant,
        observedCoordinates: 8,
      },
      // 2026-09-21: 일간·지지 렌즈가 기둥을 읽으므로 공유 대상에 들어왔다.
      // 벽시계 시각 자체는 여전히 나가지 않는다(위의 "08:30" 단언) — 나가는
      // 것은 파생된 간지이고, 시주는 두 시간 폭까지만 좁힌다.
      saju: profile.saju,
      sunSign: profile.sunSign,
      yinYang: profile.yinYang,
    });
  });

  it("rejects a shared comparison profile that cannot be compared", () => {
    const artifact = createSymbolicShareArtifact(profile, { now: NOW });
    const incomplete = {
      ...artifact,
      profile: {
        ...artifact.profile,
        fiveElements: {
          dominant: artifact.profile.fiveElements.dominant,
          observedCoordinates: artifact.profile.fiveElements.observedCoordinates,
        },
      },
    };
    const encoded = encodeSymbolicShareArtifact(incomplete as typeof artifact);

    expect(decodeSymbolicShareArtifact(encoded, { now: NOW })).toEqual({ ok: false, reason: "damaged" });
  });

  it("reports the previous payload shape as unsupported instead of damaged", () => {
    const artifact = createSymbolicShareArtifact(profile, { now: NOW });
    const encoded = encodeSymbolicShareArtifact({
      ...artifact,
      schemaVersion: 1,
    } as typeof artifact);

    expect(decodeSymbolicShareArtifact(encoded, { now: NOW })).toEqual({ ok: false, reason: "unsupported" });
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

describe("공유 링크에 마야·켈트를 싣는다", () => {
  it("만든 링크를 풀면 mayanKin·celticTree 가 그대로 있다", () => {
    const artifact = createSymbolicShareArtifact(profile, { now: NOW });
    const decoded = decodeSymbolicShareArtifact(encodeSymbolicShareArtifact(artifact), { now: NOW });
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.artifact.profile.mayanKin).toEqual(profile.mayanKin);
      expect(decoded.artifact.profile.celticTree).toEqual(profile.celticTree);
    }
  });
});

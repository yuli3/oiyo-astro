import { describe, expect, it } from "vitest";

import { EarthlyBranch, FiveElement } from "@/lib/ontology/saju/types";
import type { SymbolicComparisonProfile } from "./types";
import { allPairEdges, createSymbolicGroupSnapshot, decodeSymbolicGroupSnapshot, encodeSymbolicGroupSnapshot, starEdges } from "./group-snapshot";

const profile = (seed: number): SymbolicComparisonProfile => ({
  chineseZodiac: { branch: ([EarthlyBranch.JA, EarthlyBranch.CHUK, EarthlyBranch.IN, EarthlyBranch.MYO] as const)[seed % 4] },
  fiveElements: { dominant: ([FiveElement.WOOD, FiveElement.FIRE, FiveElement.EARTH, FiveElement.METAL, FiveElement.WATER] as const)[seed % 5], observedCoordinates: seed % 2 ? 6 : 8 },
  sunSign: { element: (["air", "earth", "fire", "water"] as const)[seed % 4], modality: (["cardinal", "fixed", "mutable"] as const)[seed % 3], sign: (["aries", "taurus", "gemini", "cancer"] as const)[seed % 4] },
  yinYang: { yang: seed % 5, yin: 8 - (seed % 5) },
});
const people = (count: number) => Array.from({ length: count }, (_, index) => ({ id: `p-${index}`, label: `Person ${index}`, profile: profile(index) }));

describe("symbolic group snapshot", () => {
  it.each([[3, 3], [5, 10], [10, 45]])("creates %i participants with %i pairs", (count, pairs) => {
    const snapshot = createSymbolicGroupSnapshot(people(count), { now: new Date("2026-08-14T00:00:00Z") });
    expect(snapshot.edges).toHaveLength(pairs * 4);
    expect(starEdges(snapshot, "five-elements")).toHaveLength(count - 1);
    expect(allPairEdges(snapshot, "five-elements")).toHaveLength(pairs);
    expect(snapshot.edges.every((edge) => !("score" in edge))).toBe(true);
  });

  it("round-trips an immutable snapshot and rejects modified edges", () => {
    const snapshot = createSymbolicGroupSnapshot(people(3), { now: new Date("2026-08-14T00:00:00Z") });
    expect(decodeSymbolicGroupSnapshot(encodeSymbolicGroupSnapshot(snapshot), new Date("2026-08-15T00:00:00Z"))).toEqual(snapshot);
    const changed = { ...snapshot, edges: snapshot.edges.slice(1) };
    expect(decodeSymbolicGroupSnapshot(encodeSymbolicGroupSnapshot(changed), new Date("2026-08-15T00:00:00Z"))).toBeNull();
  });

  it("rejects groups outside 3 to 10 people and expired snapshots", () => {
    expect(() => createSymbolicGroupSnapshot(people(2))).toThrow();
    expect(() => createSymbolicGroupSnapshot(people(11))).toThrow();
    const snapshot = createSymbolicGroupSnapshot(people(3), { now: new Date("2026-08-14T00:00:00Z") });
    expect(decodeSymbolicGroupSnapshot(encodeSymbolicGroupSnapshot(snapshot), new Date("2026-08-22T00:00:01Z"))).toBeNull();
  });
});

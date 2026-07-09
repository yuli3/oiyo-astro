import { describe, expect, it } from "vitest";

import { signalNodeIds } from "@/lib/engines/recommendation/graph-fallback";

import { neighbors } from "./traverse";
import {
  ORBIT_RING_LIMIT,
  pushBreadcrumb,
  ringForFocus,
  seedIdsFromSignals,
  truncateBreadcrumb,
} from "./orbit";

describe("seedIdsFromSignals", () => {
  it("matches signalNodeIds, deduped and filtered to resolvable graph nodes", () => {
    const signals = { big5: { O: 80, C: 50, E: 50, A: 50, N: 50 }, zodiac: "Taurus" };
    const expected = [...new Set(signalNodeIds(signals))];
    expect(seedIdsFromSignals(signals)).toEqual(expected);
  });

  it("returns [] for an empty profile (no signals at all)", () => {
    expect(seedIdsFromSignals(undefined)).toEqual([]);
    expect(seedIdsFromSignals({})).toEqual([]);
  });
});

describe("ringForFocus", () => {
  it("at the virtual root (focus=null) returns the signal-seeded ids", () => {
    const seedIds = ["openness", "taurus"];
    expect(ringForFocus(null, seedIds)).toEqual(seedIds);
  });

  it("caps the root ring at the limit", () => {
    const seedIds = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "taurus", "aries"];
    expect(ringForFocus(null, seedIds).length).toBeLessThanOrEqual(ORBIT_RING_LIMIT);
  });

  it("is safely empty when there are no seed ids (empty profile)", () => {
    expect(ringForFocus(null, [])).toEqual([]);
  });

  it("for a real node focus, returns that node's graph neighbors", () => {
    const expected = neighbors("architect", undefined, ORBIT_RING_LIMIT).map((r) => r.node.id);
    expect(ringForFocus("architect", [])).toEqual(expected);
  });

  it("returns [] for a focus id that isn't in the graph (defensive)", () => {
    expect(ringForFocus("does-not-exist", [])).toEqual([]);
  });
});

describe("breadcrumb navigation", () => {
  it("pushBreadcrumb appends the newly focused node", () => {
    expect(pushBreadcrumb([null], "woodworking")).toEqual([null, "woodworking"]);
    expect(pushBreadcrumb([null, "woodworking"], "wood")).toEqual([null, "woodworking", "wood"]);
  });

  it("truncateBreadcrumb jumps focus back to an earlier point in the path", () => {
    const breadcrumb = [null, "woodworking", "wood", "gardening"];
    expect(truncateBreadcrumb(breadcrumb, 1)).toEqual([null, "woodworking"]);
    expect(truncateBreadcrumb(breadcrumb, 0)).toEqual([null]);
  });

  it("truncateBreadcrumb is a no-op for an out-of-range index", () => {
    const breadcrumb = [null, "woodworking"];
    expect(truncateBreadcrumb(breadcrumb, -1)).toBe(breadcrumb);
    expect(truncateBreadcrumb(breadcrumb, 5)).toBe(breadcrumb);
  });
});

import { describe, expect, it } from "vitest";

import { neighbors } from "./traverse";

describe("neighbors", () => {
  it("returns immediate neighbors regardless of edge direction", () => {
    // "architect" is only ever a `to` on hobby-to-job edges and a `from` on
    // job-to-hobby edges — both directions must resolve.
    const result = neighbors("architect");
    const ids = result.map((r) => r.node.id);
    expect(ids).toContain("woodworking");
  });

  it("filters by edgeKind", () => {
    const jobToHobby = neighbors("architect", "job-to-hobby");
    expect(jobToHobby.every((r) => r.edge.kind === "job-to-hobby")).toBe(true);
    expect(jobToHobby.map((r) => r.node.id)).toContain("woodworking");

    const hobbyToJob = neighbors("architect", "hobby-to-job");
    expect(hobbyToJob.every((r) => r.edge.kind === "hobby-to-job")).toBe(true);
  });

  it("respects the limit", () => {
    const result = neighbors("astrophotography", undefined, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("returns nothing for an unknown node", () => {
    expect(neighbors("does-not-exist")).toEqual([]);
  });

  it("returns nothing for an unmatched edgeKind", () => {
    expect(neighbors("woodworking", "opposite")).toEqual([]);
  });

  it("orders results by edge weight, strongest first", () => {
    const result = neighbors("boxing-kickboxing", "trait-to-hobby");
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].edge.weight).toBeGreaterThanOrEqual(result[i].edge.weight);
    }
  });
});

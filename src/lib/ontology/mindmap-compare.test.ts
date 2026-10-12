import { describe, expect, it } from "vitest";
import { compareLeaves } from "./mindmap-compare";
import type { LeafRecommendation } from "./mindmap-recommend";

const rec = (branch: string, leaf: number, source: LeafRecommendation["source"], key: string): LeafRecommendation => ({ branch, leaf, source, key });

describe("compareLeaves", () => {
  // Low extraversion points at solo (relation:0) and few friends (relation:3); RIASEC I at analyzing and learning.
  const pointed = [rec("interest", 3, "riasec", "I"), rec("interest", 5, "riasec", "I"), rec("relation", 0, "big5", "E-"), rec("relation", 3, "big5", "E-"), rec("interest", 3, "big5", "O")];

  it("sorts lit leaves into match, cross and own, and the rest of the pointed leaves into wait", () => {
    const result = compareLeaves(["interest:3", "relation:1", "activity:3", "goal:2"], pointed);
    expect(result.lit).toBe(4);
    expect(result.match.map((row) => row.id)).toEqual(["interest:3"]);
    expect(result.match[0].because.map((row) => row.key)).toEqual(["I", "O"]);
    expect(result.cross.map((row) => row.id)).toEqual(["relation:1"]);
    expect(result.cross[0].because.every((row) => row.key === "E-")).toBe(true);
    expect(result.own.map((row) => [row.id, row.measured])).toEqual([["activity:3", false], ["goal:2", true]]);
    expect(result.wait.map((row) => row.id)).toEqual(["interest:5", "relation:0", "relation:3"]);
  });

  it("puts every lit leaf in own when nothing is pointed at", () => {
    const result = compareLeaves(["relation:1", "activity:0"], []);
    expect(result.own).toHaveLength(2);
    expect(result.cross).toHaveLength(0);
    expect(result.wait).toHaveLength(0);
  });

  it("works the opposite way round too", () => {
    const result = compareLeaves(["relation:0"], [rec("relation", 4, "big5", "E")]);
    expect(result.cross.map((row) => row.id)).toEqual(["relation:0"]);
  });
});

import { describe, expect, it } from "vitest";

import { EDGES } from "./edges";
import { NODES } from "./nodes";

describe("ontology graph edges", () => {
  const nodeIds = new Set(NODES.map((node) => node.id));

  it("has no dangling edges (every from/to points at a real node)", () => {
    const dangling = EDGES.filter(
      (edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to),
    );
    expect(dangling).toEqual([]);
  });

  it("gives every node at least one edge", () => {
    const touched = new Set<string>();
    for (const edge of EDGES) {
      touched.add(edge.from);
      touched.add(edge.to);
    }

    const untouched = NODES.filter((node) => !touched.has(node.id));
    expect(untouched.map((node) => node.id)).toEqual([]);
  });

  it("only uses weights within [0, 1]", () => {
    const outOfRange = EDGES.filter((edge) => edge.weight < 0 || edge.weight > 1);
    expect(outOfRange).toEqual([]);
  });
});

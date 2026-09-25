import { describe, expect, it } from "vitest";
import { PARTICLES_PER_SLOT, planElementFlow } from "./element-flow";

describe("saju element flow", () => {
  it("scales each generating edge by the source element count", () => {
    const plan = planElementFlow({ Wood: 3, Fire: 0, Earth: 2, Metal: 1, Water: 2 });
    expect(plan.map((e) => e.particles)).toEqual([3, 0, 2, 1, 2].map((n) => n * PARTICLES_PER_SLOT));
    expect(plan.map((e) => [e.from, e.to])).toEqual([[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]);
  });

  it("marks an edge blocked when the receiving element is missing", () => {
    const plan = planElementFlow({ Wood: 3, Fire: 0, Earth: 2, Metal: 1, Water: 2 });
    expect(plan[0].blocked).toBe(true);
    expect(plan.filter((e) => e.blocked)).toHaveLength(1);
  });
});

import { describe, expect, it } from "vitest";

import fixtures from "../../../config/role-visual-system-v1.fixtures.json";
import { classifyRoleVisual, ROLE_VISUAL_SCHEMA_VERSION } from ".";

describe("role visual system", () => {
  for (const fixture of fixtures.scenarios) {
    it(`keeps ${fixture.id} honest`, () => {
      const result = classifyRoleVisual(fixture.input);
      expect(result.schemaVersion).toBe(ROLE_VISUAL_SCHEMA_VERSION);
      expect(result.status).toBe(fixture.expected.status);
      expect(result.roleAid?.id ?? null).toBe(fixture.expected.roleAid);
      expect(result.explanationPriority).toEqual(["scores", "status", "uncertainty", "role-aid"]);
      expect(result.ranked.every(({ score }) => score >= 0 && score <= 100)).toBe(true);
    });
  }

  it("lets uncertainty override an otherwise clear lead", () => {
    expect(classifyRoleVisual({
      dataCoverage: 0.4,
      dimensions: [
        { id: "explore", score: 95, confidence: 0.9 },
        { id: "focus", score: 20, confidence: 0.9 },
      ],
    })).toMatchObject({ status: "uncertain", roleAid: null });
  });

  it.each([
    {
      name: "low-flat",
      input: {
        dataCoverage: 0.4,
        dimensions: [
          { id: "explore", score: 35, confidence: 0.9 },
          { id: "focus", score: 34, confidence: 0.9 },
          { id: "connect", score: 33, confidence: 0.9 },
        ],
      },
    },
    {
      name: "tie",
      input: {
        dataCoverage: 1,
        dimensions: [
          { id: "explore", score: 80, confidence: 0.2 },
          { id: "focus", score: 80, confidence: 0.2 },
          { id: "connect", score: 40, confidence: 0.2 },
        ],
      },
    },
    {
      name: "mixed",
      input: {
        dataCoverage: 1,
        dimensions: [
          { id: "explore", score: 80, confidence: 0.4 },
          { id: "focus", score: 73, confidence: 0.4 },
          { id: "connect", score: 40, confidence: 0.4 },
        ],
      },
    },
  ])("lets uncertainty override an otherwise $name result", ({ input }) => {
    expect(classifyRoleVisual(input)).toMatchObject({ status: "uncertain", roleAid: null });
  });

  it("lets low-flat override an overlapping tie", () => {
    expect(classifyRoleVisual({
      dataCoverage: 1,
      dimensions: [
        { id: "explore", score: 35, confidence: 0.9 },
        { id: "focus", score: 34, confidence: 0.9 },
        { id: "connect", score: 33, confidence: 0.9 },
      ],
    })).toMatchObject({ status: "low-flat", roleAid: null });
  });

  it("lets tie override an overlapping mixed result", () => {
    expect(classifyRoleVisual({
      dataCoverage: 1,
      dimensions: [
        { id: "explore", score: 80, confidence: 0.9 },
        { id: "focus", score: 79, confidence: 0.9 },
        { id: "connect", score: 40, confidence: 0.9 },
      ],
    })).toMatchObject({ status: "tie", roleAid: null });
  });

  it.each([
    { leader: "focus", id: "immersion-v1", icon: "target" },
    { leader: "connect", id: "connector-v1", icon: "users" },
  ])("assigns the $leader archetype when $leader leads clearly", ({ leader, id, icon }) => {
    const dimensions = ["explore", "focus", "connect"].map((dimId) => ({
      id: dimId, score: dimId === leader ? 84 : 42, confidence: 0.9,
    }));
    const result = classifyRoleVisual({ dataCoverage: 1, dimensions });
    expect(result.status).toBe("clear");
    expect(result.roleAid).toEqual({ id, dimensionId: leader, icon, emoji: expect.any(String) });
  });

  it("falls back to no role aid for an unmapped dimension id even when clear", () => {
    const result = classifyRoleVisual({
      dataCoverage: 1,
      dimensions: [
        { id: "novel-dimension", score: 90, confidence: 0.9 },
        { id: "focus", score: 40, confidence: 0.9 },
      ],
    });
    expect(result.status).toBe("clear");
    expect(result.roleAid).toBeNull();
  });

  it("does not mutate the input", () => {
    const input = { dataCoverage: 1, dimensions: [{ id: "z", score: 10, confidence: 1 }, { id: "a", score: 80, confidence: 1 }] };
    const before = JSON.stringify(input);
    classifyRoleVisual(input);
    expect(JSON.stringify(input)).toBe(before);
  });
});

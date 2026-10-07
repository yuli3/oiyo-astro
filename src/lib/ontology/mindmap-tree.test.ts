import { describe, expect, it } from "vitest";
import { TREE_HEIGHT, TREE_WIDTH, leafId, litLeaves, splitLabel, toggleLeaf, treeLayout } from "./mindmap-tree";

const BRANCHES = [
  { id: "interest", leaves: 7 },
  { id: "activity", leaves: 7 },
  { id: "environment", leaves: 7 },
  { id: "relation", leaves: 6 },
  { id: "goal", leaves: 7 },
];
const LABELS = { ko: ["글쓰기", "정리", "탐험"], en: ["Writing", "Organizing", "Exploring"] };

describe("treeLayout", () => {
  it("shows every branch and every leaf in the overview", () => {
    const layout = treeLayout(BRANCHES, null);
    expect(layout.me.opacity).toBe(1);
    for (const branch of BRANCHES) {
      expect(layout[branch.id].opacity).toBe(1);
      for (let leaf = 0; leaf < branch.leaves; leaf += 1) expect(layout[leafId(branch.id, leaf)].opacity).toBe(1);
    }
  });

  it("opens only the focused branch and hides the other leaves", () => {
    const layout = treeLayout(BRANCHES, "relation");
    for (let leaf = 0; leaf < 6; leaf += 1) expect(layout[leafId("relation", leaf)].label).toBe(1);
    expect(layout[leafId("goal", 0)].opacity).toBe(0);
    expect(layout.goal.opacity).toBeGreaterThan(0.5);
  });

  it.each(BRANCHES.map((branch) => branch.id))("keeps the open leaves of %s inside the stage and apart", (focus) => {
    const layout = treeLayout(BRANCHES, focus);
    const branch = BRANCHES.find((item) => item.id === focus)!;
    const points = Array.from({ length: branch.leaves }, (_, leaf) => layout[leafId(focus, leaf)]);
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(26);
      expect(point.x).toBeLessThanOrEqual(TREE_WIDTH - 26);
      expect(point.y).toBeGreaterThanOrEqual(30);
      expect(point.y).toBeLessThanOrEqual(TREE_HEIGHT - 30);
    }
    for (let a = 0; a < points.length; a += 1) {
      for (let b = a + 1; b < points.length; b += 1) {
        expect(Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y)).toBeGreaterThan(54);
      }
    }
  });

  it("falls back to the overview for an unknown focus", () => {
    expect(treeLayout(BRANCHES, "nope")).toEqual(treeLayout(BRANCHES, null));
  });
});

describe("selection", () => {
  it("lights a leaf whichever language it was picked in", () => {
    expect([...litLeaves(["글쓰기", "Exploring"], LABELS)].sort()).toEqual([0, 2]);
    expect(litLeaves(undefined, LABELS).size).toBe(0);
  });

  it("adds the current language's label and keeps the stored shape", () => {
    expect(toggleLeaf(["글쓰기"], 1, "en", LABELS)).toEqual(["글쓰기", "Organizing"]);
  });

  it("turns a leaf off in every language at once", () => {
    expect(toggleLeaf(["글쓰기", "Writing", "정리"], 0, "en", LABELS)).toEqual(["정리"]);
  });

  it("leaves the list alone for a leaf that does not exist", () => {
    expect(toggleLeaf(["글쓰기"], 9, "ko", LABELS)).toEqual(["글쓰기"]);
  });
});

describe("splitLabel", () => {
  it("splits a long two-word label near the middle and leaves the rest alone", () => {
    expect(splitLabel("Quelques amis")).toEqual(["Quelques", "amis"]);
    expect(splitLabel("소수 친구")).toEqual(["소수 친구"]);
    expect(splitLabel("Collectionner")).toEqual(["Collectionner"]);
  });
});

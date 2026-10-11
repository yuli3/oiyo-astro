import { describe, expect, it } from "vitest";
import { MINDMAP_CATS } from "./mindmap-data";
import { TREE_HEIGHT, TREE_WIDTH, dropTwigs, leafId, litLeaves, readTwigs, splitLabel, toggleLeaf, toggleTwig, treeLayout, twigId } from "./mindmap-tree";

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

describe("leaf items", () => {
  const WITH_TWIGS = MINDMAP_CATS.map((cat) => ({ id: cat.id, leaves: cat.chips.ko.length, twigs: cat.chips.ko.map((_, leaf) => cat.twigs?.ko[leaf]?.length ?? 0) }));
  const opened = WITH_TWIGS.flatMap((branch) => branch.twigs.map((count, leaf) => [branch.id, leaf, count] as const)).filter(([, , count]) => count > 0);

  it("has four items in every language for each leaf of the first three branches, and none for the rest", () => {
    for (const cat of MINDMAP_CATS) {
      const deep = ["interest", "activity", "environment"].includes(cat.id);
      expect(Boolean(cat.twigs)).toBe(deep);
      if (!cat.twigs) continue;
      for (const lang of Object.keys(cat.chips) as (keyof typeof cat.chips)[]) {
        expect(cat.twigs[lang]).toHaveLength(cat.chips[lang].length);
        for (const items of cat.twigs[lang]) {
          expect(items).toHaveLength(4);
          expect(new Set(items).size).toBe(4);
        }
      }
    }
  });

  it.each(opened)("keeps the items of %s:%i on stage and apart", (branch, leaf, count) => {
    const layout = treeLayout(WITH_TWIGS, branch, leaf);
    expect(layout[leafId(branch, leaf)].label).toBe(1);
    const points = Array.from({ length: count }, (_, index) => layout[twigId(branch, leaf, index)]);
    for (const point of points) {
      expect(point.opacity).toBe(1);
      expect(point.x).toBeGreaterThanOrEqual(26);
      expect(point.x).toBeLessThanOrEqual(TREE_WIDTH - 26);
      expect(point.y).toBeGreaterThanOrEqual(30);
    }
    for (let a = 0; a < points.length; a += 1) {
      for (let b = a + 1; b < points.length; b += 1) expect(Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y)).toBeGreaterThan(60);
    }
    expect(layout.me.y).toBeLessThanOrEqual(TREE_HEIGHT - 10);
    expect(layout[leafId(branch, (leaf + 1) % 7)].opacity).toBe(0);
  });

  it("stays in the branch view for a leaf without items or out of range", () => {
    expect(treeLayout(WITH_TWIGS, "relation", 0)).toEqual(treeLayout(WITH_TWIGS, "relation"));
    expect(treeLayout(WITH_TWIGS, "interest", 12)).toEqual(treeLayout(WITH_TWIGS, "interest"));
  });

  it("hides every item outside the opened leaf", () => {
    const layout = treeLayout(WITH_TWIGS, "interest");
    expect(layout[twigId("interest", 0, 0)].opacity).toBe(0);
    expect(layout[twigId("activity", 2, 3)].opacity).toBe(0);
  });

  it("stores items by position and drops them with their leaf", () => {
    const one = toggleTwig({}, "interest:0", 3);
    const two = toggleTwig(one, "interest:0", 1);
    expect(two).toEqual({ "interest:0": [1, 3] });
    expect(toggleTwig(toggleTwig(two, "interest:0", 1), "interest:0", 3)).toEqual({});
    expect(dropTwigs(two, "interest:0")).toEqual({});
  });

  it("ignores stored items that are not whole positions", () => {
    expect(readTwigs({ "interest:0": [1, "x", -1, 2.5, 3], bad: "1" })).toEqual({ "interest:0": [1, 3] });
    expect(readTwigs(null)).toEqual({});
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

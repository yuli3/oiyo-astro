// Layout and selection rules for the radial tree in "실제 나의 것" (ProfileMindmap).
// Kept apart from the component so the geometry and the storage contract can be tested.

export const TREE_WIDTH = 360;
export const TREE_HEIGHT = 430;
const CENTER_X = 180;
const CENTER_Y = 222;
const RING_RADIUS = 92;
const LEAF_RADIUS = 150;
const RAD = Math.PI / 180;

export interface TreePoint {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** 0 hides the label, 1 shows it. */
  label: number;
}

export interface TreeBranch {
  id: string;
  leaves: number;
  /** How many items sit under each leaf. Missing or 0 means the leaf ends the tree. */
  twigs?: readonly number[];
}

export const leafId = (branch: string, index: number) => `${branch}:${index}`;
export const twigId = (branch: string, leaf: number, index: number) => `${branch}:${leaf}:${index}`;
const twigCount = (branch: TreeBranch, leaf: number) => branch.twigs?.[leaf] ?? 0;

/**
 * Where every node sits. With no focus the whole tree is visible: the five branches on a ring
 * and each leaf as a small dot beyond its branch. With a focus that branch opens upward and its
 * leaves fan out on two staggered arcs.
 *
 * Two arcs, not one: with six or seven leaves a single arc leaves less room per leaf than a
 * readable label needs on a 320px stage (the earlier fan layout was dropped for exactly that).
 * The outer arc is also pulled in near the sides so nothing leaves the stage.
 *
 * With an open leaf as well (a lit leaf tapped again, 2026-10-10) the view goes one level
 * deeper: me → branch → leaf stacked from the bottom and the leaf's items on one arc above it.
 * The other branches step out of the way; tapping the branch or "me" climbs back out.
 */
export function treeLayout(branches: readonly TreeBranch[], focus: string | null, openLeaf: number | null = null): Record<string, TreePoint> {
  const out: Record<string, TreePoint> = {};
  const focused = branches.find((branch) => branch.id === focus);
  if (focused && openLeaf !== null && openLeaf >= 0 && openLeaf < focused.leaves && twigCount(focused, openLeaf) > 0) return leafLayout(branches, focused, openLeaf);
  const branchAngle = (index: number) => (360 / branches.length) * index - 90;

  if (!focus || !branches.some((branch) => branch.id === focus)) {
    out.me = { x: CENTER_X, y: CENTER_Y, scale: 1, opacity: 1, label: 0 };
    branches.forEach((branch, index) => {
      const angle = branchAngle(index) * RAD;
      out[branch.id] = { x: CENTER_X + RING_RADIUS * Math.cos(angle), y: CENTER_Y + RING_RADIUS * Math.sin(angle), scale: 1, opacity: 1, label: 1 };
      for (let leaf = 0; leaf < branch.leaves; leaf += 1) {
        const spread = (branchAngle(index) + (leaf - (branch.leaves - 1) / 2) * 9.5) * RAD;
        const radius = LEAF_RADIUS + (leaf % 2 ? 14 : 0);
        const point = { x: CENTER_X + radius * Math.cos(spread), y: CENTER_Y + radius * Math.sin(spread) };
        out[leafId(branch.id, leaf)] = { ...point, scale: 0.38, opacity: 1, label: 0 };
        hideTwigs(out, branch, leaf, point);
      }
    });
    return out;
  }

  const me = { x: CENTER_X, y: 378 };
  const open = { x: CENTER_X, y: 282 };
  const slots = [{ x: 44, y: 366 }, { x: 104, y: 398 }, { x: 256, y: 398 }, { x: 316, y: 366 }];
  out.me = { ...me, scale: 0.78, opacity: 1, label: 0 };
  let slot = 0;
  for (const branch of branches) {
    if (branch.id === focus) {
      out[branch.id] = { ...open, scale: 1.08, opacity: 1, label: 1 };
      for (let leaf = 0; leaf < branch.leaves; leaf += 1) {
        const angle = (-152 + (branch.leaves > 1 ? (124 / (branch.leaves - 1)) * leaf : 62)) * RAD;
        const radius = Math.min(leaf % 2 === 1 ? 204 : 134, 146 / Math.max(0.01, Math.abs(Math.cos(angle))));
        const point = { x: open.x + radius * Math.cos(angle), y: open.y + radius * Math.sin(angle) };
        out[leafId(branch.id, leaf)] = { ...point, scale: 1.22, opacity: 1, label: 1 };
        hideTwigs(out, branch, leaf, point);
      }
    } else {
      const place = slots[slot % slots.length];
      slot += 1;
      out[branch.id] = { ...place, scale: 0.68, opacity: 0.9, label: 1 };
      for (let leaf = 0; leaf < branch.leaves; leaf += 1) {
        out[leafId(branch.id, leaf)] = { ...place, scale: 0.2, opacity: 0, label: 0 };
        hideTwigs(out, branch, leaf, place);
      }
    }
  }
  return out;
}

function hideTwigs(out: Record<string, TreePoint>, branch: TreeBranch, leaf: number, at: { x: number; y: number }) {
  for (let twig = 0; twig < twigCount(branch, leaf); twig += 1) out[twigId(branch.id, leaf, twig)] = { ...at, scale: 0.2, opacity: 0, label: 0 };
}

function leafLayout(branches: readonly TreeBranch[], focused: TreeBranch, open: number): Record<string, TreePoint> {
  const out: Record<string, TreePoint> = {};
  const branchAt = { x: CENTER_X, y: 354 };
  const leafAt = { x: CENTER_X, y: 282 };
  out.me = { x: CENTER_X, y: 410, scale: 0.45, opacity: 1, label: 0 };
  for (const branch of branches) {
    const home = branch.id === focused.id ? branchAt : { x: CENTER_X, y: 410 };
    out[branch.id] = branch.id === focused.id ? { ...branchAt, scale: 0.72, opacity: 1, label: 1 } : { ...home, scale: 0.2, opacity: 0, label: 0 };
    for (let leaf = 0; leaf < branch.leaves; leaf += 1) {
      if (branch.id === focused.id && leaf === open) {
        out[leafId(branch.id, leaf)] = { ...leafAt, scale: 1.35, opacity: 1, label: 1 };
        const count = twigCount(branch, leaf);
        for (let twig = 0; twig < count; twig += 1) {
          // One arc from upper left to upper right; the two ends sit a little closer so their labels stay on stage.
          const angle = (-156 + (count > 1 ? (132 / (count - 1)) * twig : 66)) * RAD;
          const radius = twig === 0 || twig === count - 1 ? 140 : 158;
          out[twigId(branch.id, leaf, twig)] = { x: leafAt.x + radius * Math.cos(angle), y: leafAt.y + radius * Math.sin(angle), scale: 1.15, opacity: 1, label: 1 };
        }
      } else {
        out[leafId(branch.id, leaf)] = { ...home, scale: 0.2, opacity: 0, label: 0 };
        hideTwigs(out, branch, leaf, home);
      }
    }
  }
  return out;
}

/**
 * The profile stores the chosen chips as their label text, in whatever language the page was
 * in when they were picked (oiyo:profile:v1, shape unchanged). A leaf is lit when the stored
 * list holds its label in any language, so a choice made in Korean stays lit in English.
 */
export function litLeaves(stored: readonly string[] | undefined, labelsByLang: Readonly<Record<string, readonly string[]>>): Set<number> {
  const lit = new Set<number>();
  if (!stored?.length) return lit;
  for (const labels of Object.values(labelsByLang)) {
    labels.forEach((label, index) => { if (stored.includes(label)) lit.add(index); });
  }
  return lit;
}

/** Turns one leaf on or off. Turning it off removes its label in every language. */
export function toggleLeaf(stored: readonly string[] | undefined, index: number, lang: string, labelsByLang: Readonly<Record<string, readonly string[]>>): string[] {
  const current = stored ?? [];
  const variants = new Set(Object.values(labelsByLang).map((labels) => labels[index]).filter((label): label is string => typeof label === "string"));
  if (current.some((label) => variants.has(label))) return current.filter((label) => !variants.has(label));
  const label = labelsByLang[lang]?.[index];
  return label === undefined ? [...current] : [...current, label];
}

/** A long two-word label goes on two lines; SVG text does not wrap by itself. */
export function splitLabel(label: string, max = 9): string[] {
  if (label.length <= max || !label.includes(" ")) return [label];
  const middle = label.length / 2;
  let best = -1;
  for (let index = 0; index < label.length; index += 1) {
    if (label[index] === " " && (best < 0 || Math.abs(index - middle) < Math.abs(best - middle))) best = index;
  }
  return [label.slice(0, best), label.slice(best + 1)];
}

/**
 * Items under a leaf are stored by position, not by label, in `chosenSub` next to `chosen`
 * ({ "interest:0": [1, 3] }). Positions are the same in every language, so nothing has to be
 * matched across languages, and `chosen` keeps the shape other readers already rely on.
 */
export type TwigSelection = Record<string, number[]>;

export function toggleTwig(stored: Readonly<TwigSelection> | undefined, leafKey: string, index: number): TwigSelection {
  const current = stored?.[leafKey] ?? [];
  const next = current.includes(index) ? current.filter((item) => item !== index) : [...current, index].sort((a, b) => a - b);
  const out: TwigSelection = { ...stored };
  if (next.length) out[leafKey] = next;
  else delete out[leafKey];
  return out;
}

/** A leaf that is switched off takes the items under it along. */
export function dropTwigs(stored: Readonly<TwigSelection> | undefined, leafKey: string): TwigSelection {
  const out: TwigSelection = { ...stored };
  delete out[leafKey];
  return out;
}

/** Reads `chosenSub` defensively: anything that is not a list of whole numbers is ignored. */
export function readTwigs(raw: unknown): TwigSelection {
  const out: TwigSelection = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    const items = value.filter((item): item is number => Number.isInteger(item) && item >= 0);
    if (items.length) out[key] = items;
  }
  return out;
}

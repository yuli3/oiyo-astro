import { LEAF, type LeafRecommendation } from "@/lib/ontology/mindmap-recommend";
import { leafId } from "@/lib/ontology/mindmap-tree";

/**
 * "타고난 나와 내가 느끼는 나" (2026-10-10, CHOSEUN named it; prototype
 * company-brain my-map-measured-vs-chosen-2026-10-08.html). The lit leaves are set beside the
 * leaves the measured tests point at, sorted into four groups:
 *
 * - match: the tests point at it and it is lit.
 * - cross: lit, and the tests point at the opposite side of the same axis instead.
 * - own:   lit, and nothing points at it (either no test measures it, or the result points elsewhere).
 * - wait:  the tests point at it and it is not lit.
 *
 * Only the extraversion axis has two sides in the current link table (solo / few friends
 * against team / community), so that is the only place "cross" can happen. Symbolic systems
 * never enter: pointedLeaves only reads measured tests.
 */
const side = (names: readonly (keyof typeof LEAF)[]) => names.map((name) => leafId(...LEAF[name]));
const OPPOSITE: readonly [readonly string[], readonly string[]][] = [[side(["solo", "fewFriends"]), side(["team", "community"])]];
const MEASURED = new Set(Object.values(LEAF).map(([branch, leaf]) => leafId(branch, leaf)));

export interface CompareRow {
  id: string;
  branch: string;
  leaf: number;
  /** The results that point at this leaf, or for "cross" the results that point at the other side. */
  because: LeafRecommendation[];
  /** False when no test in the link table measures this leaf at all. */
  measured: boolean;
}

export interface Comparison {
  lit: number;
  match: CompareRow[];
  cross: CompareRow[];
  own: CompareRow[];
  wait: CompareRow[];
}

const split = (id: string) => {
  const cut = id.lastIndexOf(":");
  return { branch: id.slice(0, cut), leaf: Number(id.slice(cut + 1)) };
};

/** `lit` holds leaf ids ("branch:index") in the order they should be listed. */
export function compareLeaves(lit: readonly string[], pointed: readonly LeafRecommendation[]): Comparison {
  const byLeaf = new Map<string, LeafRecommendation[]>();
  for (const row of pointed) {
    const id = leafId(row.branch, row.leaf);
    byLeaf.set(id, [...(byLeaf.get(id) ?? []), row]);
  }
  const row = (id: string, because: LeafRecommendation[]): CompareRow => ({ id, ...split(id), because, measured: MEASURED.has(id) });
  const out: Comparison = { lit: lit.length, match: [], cross: [], own: [], wait: [] };
  const litSet = new Set(lit);

  for (const id of lit) {
    const direct = byLeaf.get(id);
    if (direct) { out.match.push(row(id, direct)); continue; }
    const pair = OPPOSITE.find(([a, b]) => a.includes(id) || b.includes(id));
    const other = pair ? (pair[0].includes(id) ? pair[1] : pair[0]) : [];
    const against = other.flatMap((leaf) => byLeaf.get(leaf) ?? []);
    if (against.length) out.cross.push(row(id, against));
    else out.own.push(row(id, []));
  }
  for (const [id, because] of byLeaf) if (!litSet.has(id)) out.wait.push(row(id, because));
  return out;
}

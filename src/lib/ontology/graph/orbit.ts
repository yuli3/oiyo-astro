/**
 * Relation-orbit state logic (Phase 1 / Track A, step 4 — "방사형 마인드맵",
 * Focus+Orbit spec). Pure, framework-free functions so they're testable
 * without a DOM/React test harness (this repo has none — see
 * `vitest.config.ts`, `environment: "node"`, no jsdom/testing-library).
 * `OntologyRelationOrbit.tsx` is a thin UI wrapper around these.
 *
 * Model: exactly one visible ring at a time, centered on `focus`.
 *  - `focus === null` is the virtual "나" (Me) root — not a real graph node,
 *    so its ring is the user's signal-seeded ids (`seedIdsFromSignals`)
 *    rather than `neighbors()`.
 *  - `focus === <nodeId>` rings are `neighbors(nodeId)` — the graph's real
 *    adjacency (`@/lib/ontology/graph/traverse.ts`).
 * A breadcrumb (`OrbitFocus[]`, root-first) tracks the click path so users
 * can jump back; per the design conversation this is session-only local
 * state, never persisted.
 */

import { signalNodeIds } from "@/lib/engines/recommendation/graph-fallback";
import type { ProfileSignals } from "@/lib/ontology/signals";

import { getNode } from "./nodes";
import { neighbors } from "./traverse";

/** `null` = the virtual "나" (Me) center; otherwise a real `OntologyNode.id`. */
export type OrbitFocus = string | null;

/** Max ring size, matching the design spec ("최대 5~6개"). */
export const ORBIT_RING_LIMIT = 6;

/**
 * `signalNodeIds()` deduped and filtered down to ids that actually resolve
 * to a graph node — defensive the same way `neighbors()` defensively skips
 * dangling edges, so the UI never has to special-case an unresolvable seed.
 */
export function seedIdsFromSignals(signals: ProfileSignals | undefined): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of signalNodeIds(signals)) {
    if (seen.has(id) || !getNode(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

/**
 * The single ring visible for `focus`: `seedIds` at the virtual root, or
 * `focus`'s direct graph neighbors otherwise.
 */
export function ringForFocus(
  focus: OrbitFocus,
  seedIds: string[],
  limit: number = ORBIT_RING_LIMIT,
): string[] {
  if (focus === null) return seedIds.slice(0, limit);
  return neighbors(focus, undefined, limit).map((result) => result.node.id);
}

/** Appends `id` as the new focus (a ring-node click). */
export function pushBreadcrumb(breadcrumb: OrbitFocus[], id: string): OrbitFocus[] {
  return [...breadcrumb, id];
}

/** Jumps focus back to `breadcrumb[index]`, dropping everything after it. Out-of-range `index` is a no-op. */
export function truncateBreadcrumb(breadcrumb: OrbitFocus[], index: number): OrbitFocus[] {
  if (index < 0 || index >= breadcrumb.length) return breadcrumb;
  return breadcrumb.slice(0, index + 1);
}

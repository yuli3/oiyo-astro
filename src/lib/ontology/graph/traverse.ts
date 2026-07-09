/**
 * Ontology relationship graph — traversal (Phase 1 / Track A, step 2).
 *
 * The graph is authored as a directed edge list (`from`/`to` carry meaning
 * for asymmetric kinds like `hobby-to-job` vs `job-to-hobby`), but
 * exploration ("다음 탐색" in the design doc — clicking a node to discover
 * what's adjacent to it) treats every edge as traversable from either
 * endpoint. `neighbors()` does a one-level breadth-first scan from
 * `nodeId` over that bidirectional adjacency, honoring an optional
 * `edgeKind` filter and result `limit`.
 */

import { EDGES } from "./edges";
import { getNode } from "./nodes";
import type { EdgeKind, OntologyEdge, OntologyNode } from "./types";

export interface NeighborResult {
  node: OntologyNode;
  edge: OntologyEdge;
}

interface AdjacencyEntry {
  neighborId: string;
  edge: OntologyEdge;
}

const ADJACENCY = new Map<string, AdjacencyEntry[]>();

function addAdjacency(nodeId: string, entry: AdjacencyEntry) {
  const list = ADJACENCY.get(nodeId);
  if (list) {
    list.push(entry);
  } else {
    ADJACENCY.set(nodeId, [entry]);
  }
}

for (const edge of EDGES) {
  addAdjacency(edge.from, { neighborId: edge.to, edge });
  if (edge.to !== edge.from) {
    addAdjacency(edge.to, { neighborId: edge.from, edge });
  }
}

const DEFAULT_LIMIT = 10;

/**
 * One-level BFS over the ontology graph: the immediate neighbors of
 * `nodeId`, optionally filtered by `edgeKind`, capped at `limit` results.
 * Neighbors that don't resolve to a known node (dangling edges) are
 * skipped rather than throwing — `edges.test.ts` is the source of truth
 * for "no dangling edges", traversal just stays defensive at runtime.
 * When multiple edges connect to the same neighbor, the highest-weight
 * edge wins.
 */
export function neighbors(
  nodeId: string,
  edgeKind?: EdgeKind,
  limit: number = DEFAULT_LIMIT,
): NeighborResult[] {
  const queue = ADJACENCY.get(nodeId) ?? [];
  const bestByNeighbor = new Map<string, AdjacencyEntry>();

  for (const entry of queue) {
    if (edgeKind && entry.edge.kind !== edgeKind) continue;
    if (entry.neighborId === nodeId) continue; // no self-loops in results

    const existing = bestByNeighbor.get(entry.neighborId);
    if (!existing || entry.edge.weight > existing.edge.weight) {
      bestByNeighbor.set(entry.neighborId, entry);
    }
  }

  const sorted = [...bestByNeighbor.values()].sort((a, b) => b.edge.weight - a.edge.weight);

  const results: NeighborResult[] = [];
  for (const entry of sorted) {
    const node = getNode(entry.neighborId);
    if (!node) continue; // dangling edge — defensive skip, see doc comment above
    results.push({ node, edge: entry.edge });
    if (results.length >= limit) break;
  }

  return results;
}

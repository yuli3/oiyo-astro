/**
 * Ontology export (Phase 1 / Track D, step 5 — final step of the design doc).
 *
 * `assembleOntologyExport()` is the single, synchronous entry point that
 * pulls together everything the earlier Track A steps already produce —
 * `collectSignals()` (step 1), the relationship graph (step 2, via
 * `neighbors()`), and `RecommendationService.generateRecommendations()`
 * (step 3) — into one snapshot object, plus a bounded 2-hop graph
 * "adjacency snapshot" seeded from the user's signals.
 *
 * Per the 2026-07-09 scope decision (see design doc + session note): the
 * relation-orbit UI (step 4, `OntologyRelationOrbit.tsx`) deliberately shows
 * only one ring at a time and never a full-graph overview — that overview
 * lives here instead, recomputed deterministically from signals rather than
 * the user's actual click path.
 *
 * Never throws; every field degrades to `{}`/`[]` for a signal-less profile
 * (see `export.test.ts`).
 */

import { RecommendationService } from "@/lib/engines/recommendation/service";
import type { Recommendation, RecommendationContext } from "@/lib/engines/recommendation/contracts";
import { signalNodeIds } from "@/lib/engines/recommendation/graph-fallback";
import type { EdgeKind, NodeKind } from "@/lib/ontology/graph/types";
import { neighbors } from "@/lib/ontology/graph/traverse";
import { collectSignals, type ProfileSignals } from "@/lib/ontology/signals";
import type { DecodedResult } from "@/lib/result-permalink";
import { listStoredTestResults, type StoredTestResult } from "@/lib/user/test-results";

/** One node reachable within 2 hops of a signal-seeded node — the "조감도" the live orbit UI never shows. */
export interface GraphSnapshotEntry {
  nodeId: string;
  kind: NodeKind;
  i18nKey: string;
  /** Hop distance from the nearest signal seed node (1 = direct neighbor, 2 = neighbor-of-neighbor). */
  hop: 1 | 2;
  edgeKind: EdgeKind;
  weight: number;
}

export interface OntologyExport {
  exportedAt: string;
  signals: ProfileSignals;
  /** Full local test history, newest-first (same order as `listStoredTestResults()`) — not just the most recent. */
  testResults: StoredTestResult[];
  /** Every recommendation across every category that `RecommendationService` currently surfaces (each engine already filters to `>= MIN_DISPLAY_SCORE` or a graph-fallback item — see `scoring.ts`/`graph-fallback.ts`). */
  recommendations: Recommendation[];
  /** Deterministic 2-hop neighbor snapshot from the signal-seeded nodes. Bounded by `SNAPSHOT_HOP_LIMIT`/`SNAPSHOT_MAX_NODES`, never unbounded. */
  graphSnapshot: GraphSnapshotEntry[];
}

/** Neighbors pulled per node before dedup — kept small since this is a snapshot, not a full traversal. */
const SNAPSHOT_HOP_LIMIT = 6;
/** Hard cap on total snapshot entries, regardless of how many signals/edges the user has. */
const SNAPSHOT_MAX_NODES = 40;

function buildGraphSnapshot(signals: ProfileSignals): GraphSnapshotEntry[] {
  const seeds = signalNodeIds(signals);
  if (seeds.length === 0) return [];

  const seen = new Set<string>(seeds);
  const entries: GraphSnapshotEntry[] = [];
  const hop1Ids: string[] = [];

  for (const seedId of seeds) {
    if (entries.length >= SNAPSHOT_MAX_NODES) break;
    for (const { node, edge } of neighbors(seedId, undefined, SNAPSHOT_HOP_LIMIT)) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      hop1Ids.push(node.id);
      entries.push({ nodeId: node.id, kind: node.kind, i18nKey: node.i18nKey, hop: 1, edgeKind: edge.kind, weight: edge.weight });
      if (entries.length >= SNAPSHOT_MAX_NODES) break;
    }
  }

  for (const hop1Id of hop1Ids) {
    if (entries.length >= SNAPSHOT_MAX_NODES) break;
    for (const { node, edge } of neighbors(hop1Id, undefined, SNAPSHOT_HOP_LIMIT)) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      entries.push({ nodeId: node.id, kind: node.kind, i18nKey: node.i18nKey, hop: 2, edgeKind: edge.kind, weight: edge.weight });
      if (entries.length >= SNAPSHOT_MAX_NODES) break;
    }
  }

  return entries;
}

function collectRecommendations(signals: ProfileSignals): Recommendation[] {
  const ctx: RecommendationContext = { interpretation: {}, signals };
  const result = RecommendationService.generateRecommendations(ctx);
  return [
    ...result.careers,
    ...result.hobbies,
    ...result.psychology,
    ...result.mythology,
    ...result.science,
    ...result.spirituality,
    ...result.activities,
  ];
}

export function assembleOntologyExport(): OntologyExport {
  const signals = collectSignals();
  return {
    exportedAt: new Date().toISOString(),
    signals,
    testResults: listStoredTestResults(),
    recommendations: collectRecommendations(signals),
    graphSnapshot: buildGraphSnapshot(signals),
  };
}

/**
 * T6 (`@/lib/result-permalink`) tool id for sharing an ontology export —
 * must stay stable, it is embedded in shared URLs (same convention as
 * `SajuCalculator`'s `PERMALINK_TOOL_ID`).
 *
 * The permalink deliberately encodes only `ProfileSignals`
 * (`collectResultPermalinkState()` below), not the full `OntologyExport` —
 * `encodeResult` has a hard ~1500-char cap (`@/lib/result-permalink`,
 * `MAX_ENCODED_LENGTH`) and the full export (test history + every
 * recommendation + a 2-hop graph snapshot) blows well past that. Signals
 * are the dense, genuinely shareable core — the same "birth inputs, not the
 * derived analysis" choice `SajuCalculator`/`TarotReading` already make.
 */
export const ONTOLOGY_EXPORT_PERMALINK_TOOL_ID = "ontology-signals";

/** The light permalink payload — see `ONTOLOGY_EXPORT_PERMALINK_TOOL_ID` doc comment above. */
export function collectResultPermalinkState(): ProfileSignals {
  return collectSignals();
}

/**
 * Validates a decoded `#r=` permalink is genuinely an ontology-signals
 * share, not some other T6 tool's hash that happens to be present on the
 * page and not a corrupted/version-mismatched payload (`decodeResult`
 * already returns null for those). Returns `null` on any mismatch — callers
 * must treat that as "no shared profile here", never a crash.
 *
 * Deliberately read-only and side-effect-free: the caller (see
 * `OntologySharedProfileBanner.tsx`) must never feed the returned signals
 * into `collectSignals()` or any local store — a shared link must never be
 * mistaken for, or merged into, the viewer's own profile.
 */
export function parseSharedProfileSignals(decoded: DecodedResult<ProfileSignals> | null): ProfileSignals | null {
  if (!decoded || decoded.toolId !== ONTOLOGY_EXPORT_PERMALINK_TOOL_ID) return null;
  const state = decoded.state;
  if (!state || typeof state !== "object" || Array.isArray(state)) return null;
  return state;
}

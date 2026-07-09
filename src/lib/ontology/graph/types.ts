/**
 * Ontology relationship graph (Phase 1 / Track A, step 2) — shared types.
 *
 * See company-brain design doc
 * `AI-Sessions/wiki/design/phase1-ontology-inspiration-engine-2026-07-09.md`
 * for the full contract. This graph sits on top of `collectSignals()`
 * (`@/lib/ontology/signals`, step 1) and feeds the scoring engine
 * (`@/lib/engines/recommendation/`, step 3).
 */

/** Node ids are reused verbatim from existing catalogs — never duplicated. */
export type NodeKind = "hobby" | "career" | "trait" | "element" | "zodiac";

export type EdgeKind =
  | "related"
  | "opposite"
  | "divergent"
  | "stress-relief"
  | "hobby-to-job"
  | "job-to-hobby"
  | "trait-to-hobby";

export interface OntologyNode {
  id: string;
  kind: NodeKind;
  /** Dotted path resolvable via the i18n message registry (`src/lib/i18n/registry.ts`), e.g. "elements.wood.name". */
  i18nKey: string;
  icon: string;
  tags: string[];
}

export interface OntologyEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /** Curation confidence, 0-1. Higher = stronger signal for the scoring engine. */
  weight: number;
  rationaleKey?: string;
}

/**
 * Ontology relationship graph — seed edges (Phase 1 / Track A, step 2).
 *
 * Hand-curated, high-confidence edges only (per the design doc: "취미당
 * 고신뢰 3~5개"). This is deliberately *not* full coverage — every node in
 * `nodes.ts` gets at least one edge (enforced by `edges.test.ts`), but the
 * long tail of possible hobby/career/trait/zodiac combinations is out of
 * scope for this step.
 *
 * TODO: 롱테일 확장 — once more hobbies/careers get i18n copy (see
 * `nodes.ts` header), extend this seed set. Candidates for scripted/LLM
 * bulk-generation + spot-check per [[project_model_delegation_autonomy]].
 *
 * `wood/fire/earth/metal/water → hobby` edges below are derived directly
 * from `LifestyleMetadata.elementWeights` in `lifestyle/data.ts` (weight
 * >= 0.3), so they're not free-hand guesses — they reuse already-curated
 * data instead of duplicating it.
 */

import type { OntologyEdge } from "./types";

export const EDGES: OntologyEdge[] = [
  // --- hobby <-> hobby -------------------------------------------------
  { from: "woodworking", to: "gardening", kind: "related", weight: 0.6, rationaleKey: "hobby.nodes.woodworking.name" },
  { from: "tea-ceremony-meditation", to: "astrophotography", kind: "related", weight: 0.55 },

  { from: "boxing-kickboxing", to: "tea-ceremony-meditation", kind: "opposite", weight: 0.8 },
  { from: "boxing-kickboxing", to: "astrophotography", kind: "opposite", weight: 0.6 },

  { from: "tea-ceremony-meditation", to: "boxing-kickboxing", kind: "divergent", weight: 0.5 },
  { from: "woodworking", to: "astrophotography", kind: "divergent", weight: 0.45 },
  { from: "gardening", to: "astrophotography", kind: "divergent", weight: 0.45 },

  { from: "astrophotography", to: "tea-ceremony-meditation", kind: "stress-relief", weight: 0.6 },
  { from: "boxing-kickboxing", to: "gardening", kind: "stress-relief", weight: 0.55 },
  { from: "woodworking", to: "tea-ceremony-meditation", kind: "stress-relief", weight: 0.5 },

  // --- hobby <-> career --------------------------------------------------
  { from: "woodworking", to: "architect", kind: "hobby-to-job", weight: 0.7 },
  { from: "gardening", to: "architect", kind: "hobby-to-job", weight: 0.5 },
  { from: "astrophotography", to: "software-engineer", kind: "hobby-to-job", weight: 0.65 },
  { from: "boxing-kickboxing", to: "physician", kind: "hobby-to-job", weight: 0.5 },
  { from: "tea-ceremony-meditation", to: "physician", kind: "hobby-to-job", weight: 0.5 },

  { from: "software-engineer", to: "boxing-kickboxing", kind: "job-to-hobby", weight: 0.65 },
  { from: "architect", to: "woodworking", kind: "job-to-hobby", weight: 0.7 },
  { from: "physician", to: "gardening", kind: "job-to-hobby", weight: 0.55 },

  // --- element -> hobby (derived from LifestyleMetadata.elementWeights >= 0.3) --
  { from: "wood", to: "woodworking", kind: "trait-to-hobby", weight: 0.7 },
  { from: "wood", to: "gardening", kind: "trait-to-hobby", weight: 0.8 },
  { from: "fire", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.8 },
  { from: "earth", to: "woodworking", kind: "trait-to-hobby", weight: 0.3 },
  { from: "earth", to: "tea-ceremony-meditation", kind: "trait-to-hobby", weight: 0.3 },
  { from: "metal", to: "astrophotography", kind: "trait-to-hobby", weight: 0.4 },
  { from: "water", to: "tea-ceremony-meditation", kind: "trait-to-hobby", weight: 0.5 },
  { from: "water", to: "astrophotography", kind: "trait-to-hobby", weight: 0.6 },

  // --- big5 trait -> hobby (derived from LifestyleMetadata.traitAffinities) --
  { from: "extraversion", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.8 },
  { from: "openness", to: "astrophotography", kind: "trait-to-hobby", weight: 0.6 },
  { from: "openness", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.9 },
  { from: "conscientiousness", to: "tea-ceremony-meditation", kind: "trait-to-hobby", weight: 0.9 },
  { from: "conscientiousness", to: "woodworking", kind: "trait-to-hobby", weight: 0.8 },
  { from: "agreeableness", to: "gardening", kind: "trait-to-hobby", weight: 0.7 },
  { from: "neuroticism", to: "tea-ceremony-meditation", kind: "trait-to-hobby", weight: 0.6 },

  // --- riasec trait -> hobby --------------------------------------------
  { from: "realistic", to: "woodworking", kind: "trait-to-hobby", weight: 0.7 },
  { from: "realistic", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.5 },
  { from: "investigative", to: "astrophotography", kind: "trait-to-hobby", weight: 0.75 },
  { from: "artistic", to: "woodworking", kind: "trait-to-hobby", weight: 0.55 },
  { from: "social", to: "tea-ceremony-meditation", kind: "trait-to-hobby", weight: 0.4 },
  { from: "enterprising", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.45 },
  { from: "conventional", to: "astrophotography", kind: "trait-to-hobby", weight: 0.4 },

  // --- zodiac -> hobby ----------------------------------------------------
  { from: "aries", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.6 },
  { from: "taurus", to: "gardening", kind: "trait-to-hobby", weight: 0.7 },
  { from: "gemini", to: "astrophotography", kind: "trait-to-hobby", weight: 0.5 },
  { from: "cancer", to: "gardening", kind: "trait-to-hobby", weight: 0.6 },
  { from: "leo", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.55 },
  { from: "virgo", to: "woodworking", kind: "trait-to-hobby", weight: 0.6 },
  { from: "libra", to: "tea-ceremony-meditation", kind: "trait-to-hobby", weight: 0.55 },
  { from: "scorpio", to: "astrophotography", kind: "trait-to-hobby", weight: 0.6 },
  { from: "sagittarius", to: "boxing-kickboxing", kind: "trait-to-hobby", weight: 0.5 },
  { from: "capricorn", to: "woodworking", kind: "trait-to-hobby", weight: 0.65 },
  { from: "aquarius", to: "astrophotography", kind: "trait-to-hobby", weight: 0.55 },
  { from: "pisces", to: "tea-ceremony-meditation", kind: "trait-to-hobby", weight: 0.65 },
];

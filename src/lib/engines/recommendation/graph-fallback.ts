/**
 * Graph-adjacency fallback for the recommendation engines (Phase 1 / Track A,
 * step 2+3 integration).
 *
 * When every `RecommendationDefinition` in a category scores 0 (no matching
 * signal at all — see `computeMatchScore` in `./scoring.ts`), we can't just
 * "boost" one of those definitions using the relationship graph
 * (`@/lib/ontology/graph/`): the graph's `hobby`/`career` node ids are reused
 * verbatim from `lifestyle/{hobbies,careers}.json` (e.g. `woodworking`,
 * `architect`), while `data/definitions.ts` uses its own unrelated ids (e.g.
 * `meditation`, `global_leader`) — there's no id-level correspondence to
 * exploit. Instead this builds recommendations *directly from the graph*: it
 * walks from whichever trait/element/zodiac nodes the user's signals touch to
 * their adjacent `hobby`/`career` nodes and surfaces those, reusing the
 * existing `hobby.nodes.*` / `career.nodes.*` i18n copy (already localized 6
 * ways — see `graph/nodes.ts`) instead of inventing new content or forcing a
 * mapping onto `RecommendationDefinition`.
 *
 * Only `hobby` and `career` are supported: `graph/types.ts` `NodeKind` has no
 * `mythology`/`psychology`/`science`/`spirituality` kind, so there is nothing
 * in the graph to fall back to for those categories — those engines skip this
 * module entirely.
 *
 * The seed edge set (`graph/edges.ts`) only connects trait/element/zodiac
 * nodes directly to `hobby` nodes, never directly to `career` nodes (careers
 * are only reachable from hobbies via `hobby-to-job`/`job-to-hobby` edges).
 * So a plain one-hop `neighbors()` scan is enough for the `hobby` category,
 * but `career` needs a second hop through the intermediate hobby node. This
 * walks up to two hops for either category rather than hardcoding that
 * asymmetry, which also means it keeps working if the graph gains direct
 * trait→career edges later.
 */

import { neighbors } from "@/lib/ontology/graph/traverse";
import { ProfileSignals } from "@/lib/ontology/signals";

import { Recommendation, RecommendationContext } from "./contracts";

type GraphFallbackCategory = "career" | "hobby";

/** Graph-fallback matchScore = edge weight (0-1 curation confidence) scaled onto this ceiling, well below a genuine signal match (definitions routinely score 60-100). */
const GRAPH_FALLBACK_SCORE_CAP = 40;
const GRAPH_FALLBACK_MIN_SCORE = 10;
/**
 * How many neighbors to pull per hop before filtering by node kind. Must
 * comfortably exceed the graph's max node degree (currently 14, see
 * `graph/edges.ts`) — `neighbors()` ranks by edge weight *before* we filter
 * for the target kind, so a limit that's too tight can silently drop a
 * lower-weight but still-relevant career/hobby neighbor in favor of
 * higher-weight neighbors of an unrelated kind.
 */
const HOP_LIMIT = 20;

/** Mirrors `BIG5_HIGH_THRESHOLD` in `./scoring.ts` — a dimension only counts as a "signal" worth walking the graph from when it's clearly high. */
const BIG5_HIGH_THRESHOLD = 60;

const RIASEC_LETTER_TO_NODE_ID: Record<string, string> = {
  A: "artistic",
  C: "conventional",
  E: "enterprising",
  I: "investigative",
  R: "realistic",
  S: "social",
};

/**
 * Trait/element/zodiac graph node ids implied by the user's raw profile
 * signals. These are the only entry points into the graph — `interpretation`
 * data (mbti type, saju ten-gods, tci) has no corresponding `NodeKind`.
 */
function signalNodeIds(signals: ProfileSignals | undefined): string[] {
  if (!signals) return [];
  const ids: string[] = [];

  if (signals.big5) {
    const dims: Array<[keyof NonNullable<ProfileSignals["big5"]>, string]> = [
      ["O", "openness"],
      ["C", "conscientiousness"],
      ["E", "extraversion"],
      ["A", "agreeableness"],
      ["N", "neuroticism"],
    ];
    for (const [key, id] of dims) {
      if (signals.big5[key] >= BIG5_HIGH_THRESHOLD) ids.push(id);
    }
  }

  if (signals.riasec?.code) {
    for (const letter of signals.riasec.code.toUpperCase()) {
      const id = RIASEC_LETTER_TO_NODE_ID[letter];
      if (id) ids.push(id);
    }
  }

  // Graph element/zodiac node ids are lowercase; `signals.saju.element` and
  // `signals.zodiac` are not guaranteed to be (see `graph/nodes.ts` header).
  if (signals.saju?.element) ids.push(signals.saju.element.toLowerCase());
  if (signals.zodiac) ids.push(signals.zodiac.toLowerCase());

  return ids;
}

/** Best (highest-confidence) path weight found per candidate node id, one or two hops out from `startIds`. */
function collectCandidates(category: GraphFallbackCategory, startIds: string[]): Map<string, number> {
  const candidates = new Map<string, number>();

  const record = (id: string, weight: number) => {
    const existing = candidates.get(id) ?? 0;
    if (weight > existing) candidates.set(id, weight);
  };

  for (const startId of startIds) {
    for (const hop1 of neighbors(startId, undefined, HOP_LIMIT)) {
      if (hop1.node.kind === category) {
        record(hop1.node.id, hop1.edge.weight);
        continue;
      }
      // Second hop through the intermediate node (e.g. trait -> hobby -> career).
      for (const hop2 of neighbors(hop1.node.id, undefined, HOP_LIMIT)) {
        if (hop2.node.kind !== category) continue;
        record(hop2.node.id, hop1.edge.weight * hop2.edge.weight);
      }
    }
  }

  return candidates;
}

/**
 * Graph-adjacency recommendations for `category`, derived from the user's
 * signals. Returns `[]` when there are no signals to walk the graph from
 * (first-time visitors) — an empty profile shouldn't manufacture
 * recommendations out of nowhere.
 */
export function graphAdjacentRecommendations(
  category: GraphFallbackCategory,
  ctx: RecommendationContext,
): Recommendation[] {
  const startIds = signalNodeIds(ctx.signals);
  if (startIds.length === 0) return [];

  const candidates = collectCandidates(category, startIds);

  return [...candidates.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id, weight]) => {
      const nameKey = `${category}.nodes.${id}.name`;
      const descriptionKey = `${category}.nodes.${id}.description`;
      return {
        category,
        description: descriptionKey,
        icon: "Compass",
        id: `${category}-graph-${id}`,
        matchScore: Math.max(GRAPH_FALLBACK_MIN_SCORE, Math.round(weight * GRAPH_FALLBACK_SCORE_CAP)),
        reasoning: {
          explanation: descriptionKey,
          primarySource: "graph",
        },
        tags: [],
        title: nameKey,
      } satisfies Recommendation;
    });
}

import type { OntologySignal } from "@/assessments";

/**
 * Which leaves of the "실제 나의 것" tree a person's test results point at (2026-10-08, 세운 확정).
 *
 * Only measured tests are used. Symbolic systems (saju, zodiac, enneagram) never recommend:
 * they have no evidence linking them to interests or goals. Neuroticism is left out as well —
 * suggesting something because of an anxious score reads as health advice.
 *
 * The thresholds are the ones assessment-weave.ts already uses, so the map does not call the
 * same score "high" in one place and not in another. Big Five and MBTI measure the same
 * traits twice, so MBTI is consulted only when there is no Big Five result.
 *
 * A recommendation is a dashed ring, never a selection. Two per branch at most, strongest
 * source first: interests (RIASEC) and values are direct measures, traits are a looser link.
 */

export type RecommendationSource = "riasec" | "careerValues" | "big5" | "mbti";

export interface LeafRecommendation {
  branch: string;
  leaf: number;
  source: RecommendationSource;
  /** RIASEC letter, Big Five dimension (with "-" for a low score), MBTI pole, or value key. */
  key: string;
}

type LeafRef = readonly [branch: string, leaf: number];

// Leaf positions follow MINDMAP_CATS (mindmap-data.ts). mindmap-recommend.test.ts checks every
// name below against that list, so reordering the chips cannot silently move a recommendation.
export const LEAF: Record<string, LeafRef> = {
  writing: ["interest", 0], organizing: ["interest", 1], exploring: ["interest", 2], analyzing: ["interest", 3], creating: ["interest", 4], learning: ["interest", 5],
  exercise: ["activity", 0], travel: ["activity", 1],
  outdoors: ["environment", 6],
  solo: ["relation", 0], team: ["relation", 1], fewFriends: ["relation", 3], community: ["relation", 4],
  growth: ["goal", 0], stability: ["goal", 1], freedom: ["goal", 2], impact: ["goal", 3], mastery: ["goal", 4], connection: ["goal", 5], meaning: ["goal", 6],
};

const RIASEC: Record<string, readonly (keyof typeof LEAF)[]> = {
  R: ["exercise", "outdoors"],
  I: ["analyzing", "learning"],
  A: ["creating", "writing"],
  S: ["community", "connection"],
  E: ["impact", "team"],
  C: ["organizing", "stability"],
};
const VALUES: Record<string, keyof typeof LEAF> = {
  security: "stability", achievement: "growth", autonomy: "freedom", service: "meaning", creativity: "creating", status: "impact",
};
const BIG5: Record<string, readonly (keyof typeof LEAF)[]> = {
  O: ["exploring", "travel"],
  C: ["organizing", "mastery"],
  E: ["team", "community"],
  "E-": ["solo", "fewFriends"],
  A: ["connection"],
};
const MBTI: Record<string, readonly (keyof typeof LEAF)[]> = {
  E: ["team", "community"],
  I: ["solo", "fewFriends"],
  N: ["exploring"],
  J: ["organizing"],
  F: ["connection"],
};

const BIG5_HIGH = 65;
const BIG5_LOW = 35;
const MBTI_CLEAR = 62.5;
const RIASEC_TOP_MIN = 55;
const VALUE_TOP_MIN = 60;
const PER_BRANCH = 2;

function num(signals: readonly OntologySignal[], id: string): number | undefined {
  const signal = signals.find((row) => row.constructId === id);
  return typeof signal?.value === "number" ? Math.max(0, Math.min(100, signal.value)) : undefined;
}

/**
 * Every leaf the results point at, one row per source, with no cap per branch. The comparison
 * view needs all of them (and every reason); the tree's dashed rings use recommendLeaves.
 */
export function pointedLeaves(signals: readonly OntologySignal[]): LeafRecommendation[] {
  const found: LeafRecommendation[] = [];
  const add = (names: readonly (keyof typeof LEAF)[], source: RecommendationSource, key: string) => {
    for (const name of names) {
      const [branch, leaf] = LEAF[name];
      found.push({ branch, leaf, source, key });
    }
  };

  // RIASEC: the two strongest types, each only if it clears the bar. An unfinished test is skipped.
  const letters = ["R", "I", "A", "S", "E", "C"].map((key) => ({ key, value: num(signals, `vocation.riasec.${key}`) }));
  if (letters.every((row) => row.value !== undefined)) {
    (letters as { key: string; value: number }[])
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
      .filter((row) => row.value >= RIASEC_TOP_MIN)
      .forEach((row) => add(RIASEC[row.key], "riasec", row.key));
  }

  // Career values: the top value, or the tied leaders, once it clears the bar.
  const values = Object.keys(VALUES)
    .map((key) => ({ key, value: num(signals, `values.work.${key}`) }))
    .filter((row): row is { key: string; value: number } => row.value !== undefined);
  const best = Math.max(-1, ...values.map((row) => row.value));
  if (best >= VALUE_TOP_MIN) values.filter((row) => row.value === best).forEach((row) => add([VALUES[row.key]], "careerValues", row.key));

  // Traits: Big Five when present, otherwise MBTI.
  const big5 = (["O", "C", "E", "A"] as const).map((key) => ({ key, value: num(signals, `psychology.big5.${key}`) }));
  if (big5.some((row) => row.value !== undefined)) {
    for (const row of big5) {
      if (row.value === undefined) continue;
      if (row.value >= BIG5_HIGH) add(BIG5[row.key], "big5", row.key);
      else if (row.key === "E" && row.value <= BIG5_LOW) add(BIG5["E-"], "big5", "E-");
    }
  } else {
    // The MBTI signal is the share toward the first pole of each axis (E, S, T, J).
    const axis = (id: string) => num(signals, `personality.mbti.preference.${id}`);
    const ei = axis("EI"), sn = axis("SN"), tf = axis("TF"), jp = axis("JP");
    if (ei !== undefined && ei >= MBTI_CLEAR) add(MBTI.E, "mbti", "E");
    if (ei !== undefined && 100 - ei >= MBTI_CLEAR) add(MBTI.I, "mbti", "I");
    if (sn !== undefined && 100 - sn >= MBTI_CLEAR) add(MBTI.N, "mbti", "N");
    if (jp !== undefined && jp >= MBTI_CLEAR) add(MBTI.J, "mbti", "J");
    if (tf !== undefined && 100 - tf >= MBTI_CLEAR) add(MBTI.F, "mbti", "F");
  }

  return found;
}

export function recommendLeaves(signals: readonly OntologySignal[]): LeafRecommendation[] {
  const found = pointedLeaves(signals);
  // One entry per leaf (the first, strongest source wins) and at most two leaves per branch.
  const seen = new Set<string>();
  const perBranch = new Map<string, number>();
  return found.filter((row) => {
    const id = `${row.branch}:${row.leaf}`;
    const count = perBranch.get(row.branch) ?? 0;
    if (seen.has(id) || count >= PER_BRANCH) return false;
    seen.add(id);
    perBranch.set(row.branch, count + 1);
    return true;
  });
}

/** True when the person has at least one result this module can read. */
export function hasRecommendationSource(signals: readonly OntologySignal[]): boolean {
  return signals.some((row) => typeof row.value === "number" && /^(vocation\.riasec\.|values\.work\.|psychology\.big5\.|personality\.mbti\.preference\.)/.test(row.constructId));
}

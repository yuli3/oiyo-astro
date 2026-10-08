import { describe, expect, it } from "vitest";
import type { OntologySignal } from "@/assessments";
import { MINDMAP_CATS } from "./mindmap-data";
import { LEAF, hasRecommendationSource, recommendLeaves } from "./mindmap-recommend";

const signal = (constructId: string, value: number) => ({ constructId, value }) as unknown as OntologySignal;
const riasec = (scores: Record<string, number>) => Object.entries(scores).map(([key, value]) => signal(`vocation.riasec.${key}`, value));
const names = (signals: OntologySignal[]) =>
  recommendLeaves(signals).map((row) => `${MINDMAP_CATS.find((cat) => cat.id === row.branch)!.chips.en[row.leaf]}<${row.source}:${row.key}`);

describe("leaf table", () => {
  // If someone reorders the chips, a recommendation must not quietly land on another leaf.
  it("points at the leaves it names", () => {
    const expected: Record<string, string> = {
      writing: "Writing", organizing: "Organizing", exploring: "Exploring", analyzing: "Analyzing", creating: "Creating", learning: "Learning",
      exercise: "Exercise", travel: "Travel", outdoors: "Outdoors", solo: "Solo", team: "Team", fewFriends: "Few friends", community: "Community",
      growth: "Growth", stability: "Stability", freedom: "Freedom", impact: "Impact", mastery: "Mastery", connection: "Connection", meaning: "Meaning",
    };
    for (const [name, [branch, leaf]] of Object.entries(LEAF)) {
      expect(MINDMAP_CATS.find((cat) => cat.id === branch)!.chips.en[leaf]).toBe(expected[name]);
    }
    expect(Object.keys(LEAF).sort()).toEqual(Object.keys(expected).sort());
  });
});

describe("recommendLeaves", () => {
  it("recommends nothing without results", () => {
    expect(recommendLeaves([])).toEqual([]);
    expect(hasRecommendationSource([])).toBe(false);
  });

  it("uses the two strongest RIASEC types that clear the bar", () => {
    expect(names(riasec({ R: 20, I: 80, A: 70, S: 30, E: 40, C: 10 }))).toEqual(["Analyzing<riasec:I", "Learning<riasec:I"]);
    // Only I clears 55; the runner-up at 50 is not used.
    expect(names(riasec({ R: 20, I: 80, A: 50, S: 30, E: 40, C: 10 }))).toEqual(["Analyzing<riasec:I", "Learning<riasec:I"]);
    expect(names(riasec({ R: 60, I: 20, A: 10, S: 30, E: 70, C: 10 }))).toEqual(["Impact<riasec:E", "Team<riasec:E", "Exercise<riasec:R", "Outdoors<riasec:R"]);
  });

  it("skips an unfinished RIASEC result", () => {
    expect(recommendLeaves([signal("vocation.riasec.I", 90)])).toEqual([]);
  });

  it("maps the top career value and ignores one below the bar", () => {
    expect(names([signal("values.work.autonomy", 72), signal("values.work.security", 40)])).toEqual(["Freedom<careerValues:autonomy"]);
    expect(names([signal("values.work.autonomy", 55)])).toEqual([]);
  });

  it("reads Big Five highs, low extraversion, and never neuroticism", () => {
    expect(names([signal("psychology.big5.O", 70), signal("psychology.big5.E", 30), signal("psychology.big5.N", 95), signal("psychology.big5.C", 50), signal("psychology.big5.A", 50)]))
      .toEqual(["Exploring<big5:O", "Travel<big5:O", "Solo<big5:E-", "Few friends<big5:E-"]);
  });

  it("consults MBTI only when there is no Big Five result", () => {
    const mbti = [signal("personality.mbti.preference.EI", 20), signal("personality.mbti.preference.SN", 30)];
    expect(names(mbti)).toEqual(["Solo<mbti:I", "Few friends<mbti:I", "Exploring<mbti:N"]);
    expect(names([...mbti, signal("psychology.big5.O", 50)])).toEqual([]);
  });

  it("keeps two leaves per branch and lets the stronger source win a shared leaf", () => {
    const result = recommendLeaves([
      ...riasec({ R: 10, I: 20, A: 80, S: 20, E: 20, C: 70 }),
      signal("values.work.creativity", 80),
      signal("psychology.big5.O", 90), signal("psychology.big5.C", 90),
    ]);
    const interest = result.filter((row) => row.branch === "interest");
    expect(interest).toHaveLength(2);
    expect(interest.every((row) => row.source === "riasec")).toBe(true);
    expect(new Set(result.map((row) => `${row.branch}:${row.leaf}`)).size).toBe(result.length);
  });
});

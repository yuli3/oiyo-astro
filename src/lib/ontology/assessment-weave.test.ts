import { describe, expect, it } from "vitest";
import type { OntologySignal } from "@/assessments";
import { weaveAssessmentSignals } from "./assessment-weave";

const signal = (constructId: string, value: number): OntologySignal => ({
  confidence: 0.7,
  constructId,
  evidenceTier: "reflective-framework",
  id: constructId,
  observedAt: "2026-09-28T00:00:00.000Z",
  provenance: { instrumentVersion: "t", resultId: "r", scoringVersion: "s" },
  sourceAssessmentId: constructId.split(".").slice(0, 2).join("."),
  value,
});

const big5 = (o: number, c: number, e: number, a: number, n = 50) =>
  [signal("psychology.big5.O", o), signal("psychology.big5.C", c), signal("psychology.big5.E", e), signal("psychology.big5.A", a), signal("psychology.big5.N", n)];
const mbti = (ei: number, sn: number, tf: number, jp: number) =>
  [signal("personality.mbti.preference.EI", ei), signal("personality.mbti.preference.SN", sn), signal("personality.mbti.preference.TF", tf), signal("personality.mbti.preference.JP", jp)];
const riasec = (scores: Record<"R" | "I" | "A" | "S" | "E" | "C", number>) =>
  Object.entries(scores).map(([code, value]) => signal(`vocation.riasec.${code}`, value));
const values = (scores: Record<"security" | "achievement" | "autonomy" | "service" | "creativity" | "status", number>) =>
  Object.entries(scores).map(([key, value]) => signal(`values.work.${key}`, value));

describe("weaveAssessmentSignals", () => {
  it("names a theme when personality, interest and values all point the same way", () => {
    const readings = weaveAssessmentSignals([
      ...big5(50, 50, 80, 50),
      ...riasec({ R: 20, I: 30, A: 40, S: 35, E: 82, C: 25 }),
      ...values({ security: 40, achievement: 88, autonomy: 50, service: 30, creativity: 45, status: 60 }),
    ]);
    expect(readings[0]).toMatchObject({ theme: "drive", layers: ["personality", "interest", "values"] });
    expect(readings[0].evidence).toHaveLength(3);
  });

  it("counts Big Five and MBTI as one personality layer, never as two agreeing sources", () => {
    // 외향성 높음 + MBTI E 뚜렷함뿐이면 같은 성향을 두 번 잰 것이라 엮지 않는다.
    expect(weaveAssessmentSignals([...big5(50, 50, 85, 50), ...mbti(80, 50, 50, 50)])).toEqual([]);
    const withInterest = weaveAssessmentSignals([
      ...big5(50, 50, 85, 50), ...mbti(80, 50, 50, 50),
      ...riasec({ R: 10, I: 20, A: 20, S: 30, E: 70, C: 20 }),
    ]);
    expect(withInterest[0].layers).toEqual(["personality", "interest"]);
    expect(withInterest[0].evidence.filter((row) => row.layer === "personality")).toHaveLength(2);
  });

  it("reads the MBTI value as the first pole's share", () => {
    // TF 20 = F 80, SN 25 = N 75 → 교감·탐구 쪽 근거가 된다.
    const readings = weaveAssessmentSignals([
      ...mbti(50, 25, 20, 50),
      ...riasec({ R: 10, I: 20, A: 20, S: 75, E: 30, C: 20 }),
    ]);
    expect(readings.map((row) => row.theme)).toEqual(["connection"]);
    expect(readings[0].evidence[0]).toMatchObject({ source: "mbti", pole: "F", value: 80 });
  });

  it("uses the career-values top group, which is all the plugin emits", () => {
    const riasecE = riasec({ R: 10, I: 20, A: 20, S: 30, E: 70, C: 20 });
    expect(weaveAssessmentSignals([...riasecE, signal("values.work.achievement", 100)])[0].layers).toEqual(["interest", "values"]);
    // 동점 1순위가 같은 방향(성취·인정 = 추진력)이면 쓰고, 갈리면 말하지 않는다.
    expect(weaveAssessmentSignals([...riasecE, signal("values.work.achievement", 90), signal("values.work.status", 90)])[0].layers).toEqual(["interest", "values"]);
    expect(weaveAssessmentSignals([...riasecE, signal("values.work.achievement", 90), signal("values.work.service", 90)])).toEqual([]);
  });

  it("stays silent on boundary scores, ties and unfinished assessments", () => {
    expect(weaveAssessmentSignals([
      ...big5(60, 60, 60, 60),
      ...mbti(55, 45, 50, 60),
      ...riasec({ R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 }),
      signal("values.work.achievement", 55),
    ])).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { buildCareerValuesResult, careerValuesPlugin, ontologySignalsFromResults } from "@/assessments";
import { latestCareerValueScores } from "./career-values-card";

function complete(want: string, completedAt: string) {
  const responses: Record<string, number> = {};
  for (const item of careerValuesPlugin.instrument.items) responses[item.id] = item.constructId.endsWith(`.${want}`) ? 5 : 2;
  return buildCareerValuesResult(responses, { completedAt, locale: "ko" });
}

describe("latestCareerValueScores", () => {
  it("reads all six scores even though the signals carry only the top group", () => {
    const result = complete("achievement", "2026-09-28T00:00:00.000Z");
    expect(ontologySignalsFromResults([result]).filter((row) => row.constructId.startsWith("values.work."))).toHaveLength(1);
    const scores = latestCareerValueScores([result]);
    expect(Object.keys(scores ?? {})).toHaveLength(6);
    expect(scores?.achievement).toBeGreaterThan(scores?.security ?? 100);
  });

  it("uses the newest completion and ignores other assessments", () => {
    const older = complete("achievement", "2026-09-01T00:00:00.000Z");
    const newer = complete("service", "2026-09-20T00:00:00.000Z");
    expect(latestCareerValueScores([newer, older])?.service).toBe(100);
    expect(latestCareerValueScores([])).toBeNull();
  });
});

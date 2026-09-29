import { describe, expect, it } from "vitest";
import type { StoredTestResult } from "@/lib/user/test-results";
import { collectMyTastes, pairTasteRows, parseSharedTastes } from "./shared-tastes";

const result = (testId: string, resultLabel: string, createdAt: string): StoredTestResult => ({
  kind: "preference", testId, title: `${testId} 검사`, resultLabel, createdAt,
} as StoredTestResult);

describe("shared tastes (P13)", () => {
  it("keeps only allowed taste tests, latest result each", () => {
    const tastes = collectMyTastes([
      result("music-taste", "잔잔한 감성파", "2026-09-01T00:00:00Z"),
      result("music-taste", "리듬 탐험가", "2026-09-20T00:00:00Z"),
      result("political-compass", "중도", "2026-09-21T00:00:00Z"),
      result("mbti", "INFP", "2026-09-21T00:00:00Z"),
      result("friendship-style", "든든한 버팀목", "2026-09-10T00:00:00Z"),
    ]);
    expect(tastes.map((t) => t.testId)).toEqual(["music-taste", "friendship-style"]);
    expect(tastes[0].label).toBe("리듬 탐험가");
  });

  it("rejects unknown, empty, and duplicate entries from a link", () => {
    expect(parseSharedTastes("nope")).toEqual([]);
    expect(parseSharedTastes([
      { testId: "political-compass", title: "x", label: "y" },
      { testId: "music-taste", title: "음악", label: "" },
      { testId: "friendship-style", title: "우정", label: "분위기 메이커" },
      { testId: "friendship-style", title: "우정", label: "다른 값" },
    ])).toEqual([{ testId: "friendship-style", title: "우정", label: "분위기 메이커" }]);
  });

  it("lines up two people by test and leaves the missing side empty", () => {
    const rows = pairTasteRows(
      [{ testId: "music-taste", title: "음악", label: "A음악" }],
      [{ testId: "music-taste", title: "음악", label: "B음악" }, { testId: "life-values", title: "가치", label: "B가치" }],
    );
    expect(rows).toEqual([
      { testId: "music-taste", title: "음악", a: "A음악", b: "B음악" },
      { testId: "life-values", title: "가치", a: null, b: "B가치" },
    ]);
  });
});

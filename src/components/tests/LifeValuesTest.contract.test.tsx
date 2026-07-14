import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LifeValuesTest from "./LifeValuesTest";

const SOURCE = readFileSync(new URL("./LifeValuesTest.tsx", import.meta.url), "utf8");

function compact(value: string) {
  return value.replace(/\s+/g, " ");
}

function analyticsPayloads() {
  return [...SOURCE.matchAll(/gaEvent\(\s*"([^"]+)"\s*,\s*\{([^}]*)\}\s*\)/g)].map(
    ([, event, body]) => ({
      event,
      keys: [...body.matchAll(/([a-z_]+)\s*:/g)].map(([, key]) => key),
    }),
  );
}

describe("LifeValuesTest interaction contract", () => {
  it("renders the intro as the initial React state", () => {
    const html = renderToStaticMarkup(<LifeValuesTest locale="ko" />);

    expect(html).toContain("삶·일 가치관 카드 정렬");
    expect(html).toContain("카드 정렬 시작");
    expect(html).toContain("심리검사·진단·직업 적합도·검증된 가치 척도가 아닙니다");
    expect(html).not.toContain("Top 5 고르기");
  });

  it("keeps the intro → 18-card sort → automatic Top 5 → reorder → result flow wired", () => {
    const source = compact(SOURCE);

    expect(source).toContain('useState<"intro" | "sort" | "rank" | "result">("intro")');
    expect(source).toContain('setStage("sort")');
    expect(source).toContain("assignedCount === LIFE_VALUE_IDS.length");
    expect(source).toContain("important.length >= 5 && important.length <= 9");
    expect(source).toContain("LIFE_VALUE_IDS.map((id) =>");
    expect(source).toContain("setRanked(important.length === 5 ? [...important] : [])");
    expect(source).toContain('setStage("rank")');
    expect(source).toContain("[next[from], next[to]] = [next[to], next[from]]");
    expect(source).toContain("if (ranked.length !== 5) return");
    expect(source).toContain('setStage("result")');
  });

  it("lets a user return from ranking to edit candidate buckets", () => {
    const source = compact(SOURCE);

    expect(source).toContain(
      '<button type="button" onClick={() => setStage("sort")} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">{EXTRA_COPY[locale].editCandidates}</button>',
    );
  });

  it("limits GA events to identifiers and never sends ranks, scores, or responses", () => {
    const payloads = analyticsPayloads();

    expect(payloads.map(({ event }) => event)).toEqual([
      "test_started",
      "test_completed",
      "share_click",
    ]);
    for (const { keys } of payloads) {
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.every((key) => ["test_id", "instrument_version"].includes(key))).toBe(true);
      expect(keys).not.toEqual(expect.arrayContaining([
        "ranked",
        "rank",
        "score",
        "scores",
        "response",
        "responses",
        "top_values",
      ]));
    }
  });
});

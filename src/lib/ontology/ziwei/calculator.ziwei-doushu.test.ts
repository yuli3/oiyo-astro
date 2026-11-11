/**
 * Test-only cross-check of OIYO's natal chart placement against
 * Renhuai123/ziwei-doushu (MIT, Tian Ji / Ni Haixia school).
 *
 * Fixtures were generated from that engine's calculateTrueSolarTime +
 * resolveZiweiDayOffset('next-day') + generateChart({ leapMonth: 'split' })
 * at git SHA recorded in the JSON. The engine is not a runtime dependency.
 *
 * A mismatch is listed and classified; it is not automatically a bug.
 * The Ni Haixia school and Korean / iztro-default conventions can differ
 * (especially auxiliary stars). Equation-of-Time formulas also differ
 * (NOAA vs Meeus), which can shift a chart only near a two-hour boundary.
 */
import { describe, expect, it } from "vitest";

import { calculateZiWeiCoordinates } from "./calculator";
import fixtures from "./fixtures/ziwei-doushu-crosscheck.json";

const STAR_ID: Record<string, string> = {
  紫微: "zi_wei",
  天机: "tian_ji",
  太阳: "tai_yang",
  武曲: "wu_qu",
  天同: "tian_tong",
  廉贞: "lian_zhen",
  天府: "tian_fu",
  太阴: "tai_yin",
  贪狼: "tan_lang",
  巨门: "ju_men",
  天相: "tian_xiang",
  天梁: "tian_liang",
  七杀: "qi_sha",
  破军: "po_jun",
  文昌: "wen_chang",
  文曲: "wen_qu",
  左辅: "zuo_fu",
  右弼: "you_bi",
};

type StarFix = {
  branchIndex: number;
  branchEn: string;
  palaceName: string;
  siHua: string | null;
};

type CaseFix = (typeof fixtures.cases)[number];

type Diff = {
  id: string;
  field: string;
  oiyo: string | number | boolean | null;
  engine: string | number | boolean | null;
  kind: "lunar-representation" | "placement" | "sihua" | "bureau" | "time";
};

function at(
  chart: ReturnType<typeof calculateZiWeiCoordinates>,
  id: string,
) {
  return Object.values(chart.palaces).find((p) => p.stars.some((s) => s.id === id));
}

function transOf(
  chart: ReturnType<typeof calculateZiWeiCoordinates>,
  id: string,
): string | null {
  const star = Object.values(chart.palaces)
    .flatMap((p) => p.stars)
    .find((s) => s.id === id);
  return (star as { transformation?: string } | undefined)?.transformation ?? null;
}

function effectiveMonth(lunar: {
  month: number;
  day: number;
  isLeap: boolean;
}): number {
  if (lunar.isLeap && lunar.day > 15) return (lunar.month % 12) + 1;
  return lunar.month;
}

function diffsFor(c: CaseFix): Diff[] {
  const chart = calculateZiWeiCoordinates(
    new Date(c.input.utc),
    c.input.longitude,
  );
  const e = c.engine;
  const diffs: Diff[] = [];
  const add = (
    field: string,
    oiyo: string | number | boolean | null,
    engine: string | number | boolean | null,
    kind: Diff["kind"],
  ) => {
    if (oiyo !== engine) diffs.push({ id: c.id, field, oiyo, engine, kind });
  };

  add("lunar.year", chart.lunarDate.year, e.lunar.year, "lunar-representation");
  add("lunar.day", chart.lunarDate.day, e.lunar.day, "lunar-representation");
  // Under split leap policy the engine stores the effective (non-leap) month.
  // OIYO keeps the raw leap month on lunarDate and applies the split only when
  // placing palaces and month-based stars — compare the effective month.
  add(
    "lunar.effectiveMonth",
    effectiveMonth(chart.lunarDate),
    e.lunar.month,
    "lunar-representation",
  );
  add(
    "lifePalace.branch",
    chart.lifePalace.earthlyBranch,
    e.lifePalace.branchEn,
    "placement",
  );
  add("bureau.element", chart.bureau.element, e.bureau.element, "bureau");
  add("bureau.number", chart.bureau.number, e.bureau.number, "bureau");

  const stars = { ...e.mainStars, ...e.auxStars } as Record<string, StarFix>;
  for (const [cn, fix] of Object.entries(stars)) {
    const id = STAR_ID[cn];
    if (!id) continue;
    add(`${cn}.branch`, at(chart, id)?.earthlyBranch ?? null, fix.branchEn, "placement");
    add(`${cn}.siHua`, transOf(chart, id), fix.siHua, "sihua");
  }
  return diffs;
}

describe("자미두수 교차검증 — Renhuai123/ziwei-doushu (MIT, 테스트 픽스처만)", () => {
  it("픽스처 출처와 표본 수가 기록되어 있다", () => {
    expect(fixtures.source.repo).toBe("https://github.com/Renhuai123/ziwei-doushu");
    expect(fixtures.source.license).toMatch(/MIT/);
    expect(fixtures.source.leapMonthPolicy).toBe("split");
    expect(fixtures.source.lateZishiRule).toBe("next-day");
    expect(fixtures.cases.length).toBeGreaterThanOrEqual(8);
  });

  it("공개 예시(1981-03-20 서울)는 명궁·국·사화가 엔진과 같다", () => {
    const c = fixtures.cases.find((x) => x.id === "seoul-1981-03-20-1200");
    expect(c).toBeTruthy();
    const diffs = diffsFor(c!);
    expect(diffs, JSON.stringify(diffs, null, 2)).toEqual([]);
  });

  it("晚子時 23:30과 다음 날 00:30은 엔진과 같이 같은 명반이다", () => {
    const late = fixtures.cases.find((x) => x.id === "utc-2024-06-13-2330")!;
    const early = fixtures.cases.find((x) => x.id === "utc-2024-06-14-0030")!;
    const a = calculateZiWeiCoordinates(new Date(late.input.utc), late.input.longitude);
    const b = calculateZiWeiCoordinates(new Date(early.input.utc), early.input.longitude);
    expect(a.lunarDate).toEqual(b.lunarDate);
    expect(a.lifePalace.earthlyBranch).toBe(b.lifePalace.earthlyBranch);
    expect(a.lifePalace.earthlyBranch).toBe(late.engine.lifePalace.branchEn);
    expect(diffsFor(late), JSON.stringify(diffsFor(late), null, 2)).toEqual([]);
    expect(diffsFor(early), JSON.stringify(diffsFor(early), null, 2)).toEqual([]);
  });

  it("모든 표본의 배치·사화 차이를 종류별로 보고한다", () => {
    const all = fixtures.cases.flatMap(diffsFor);
    const byKind = all.reduce<Record<string, number>>((acc, d) => {
      acc[d.kind] = (acc[d.kind] ?? 0) + 1;
      return acc;
    }, {});
    // Remaining diffs are real disagreements: raw leap flags are compared via
    // lunar.effectiveMonth, not lunarDate.isLeap.
    expect(all, JSON.stringify({ byKind, all }, null, 2)).toEqual([]);
  });
});

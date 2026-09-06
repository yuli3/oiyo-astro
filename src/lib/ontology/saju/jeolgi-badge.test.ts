import { describe, expect, it } from "vitest";
import { getSolarMonthPillar } from "./calculator-solar";
import {
  KASI_YEAR_MAX,
  KASI_YEAR_MIN,
  TERM_NAMES_KO,
  monthBranchForTermIndex,
  resolveJeolgiBadge,
} from "./jeolgi-badge";
import golden from "./solar-terms-kasi.json";

describe("resolveJeolgiBadge", () => {
  it("marks years outside KASI coverage as unavailable", () => {
    expect(resolveJeolgiBadge(1999, 6, 15, 12)?.status).toBe("unavailable");
    expect(resolveJeolgiBadge(2029, 1, 1, 12)?.status).toBe("unavailable");
    expect(resolveJeolgiBadge(KASI_YEAR_MIN - 1, 12, 31, null)?.status).toBe("unavailable");
    expect(resolveJeolgiBadge(KASI_YEAR_MAX + 1, 2, 4, 12)?.status).toBe("unavailable");
  });

  it("uses KASI fixture for sampled years and returns onset date", () => {
    // 2000-02-05 is after 입춘 2000-02-04 21:40 — 해당 절기 = 입춘
    const r = resolveJeolgiBadge(2000, 2, 5, 12);
    expect(r?.status).toBe("ok");
    if (r?.status !== "ok") return;
    expect(r.nameKo).toBe("입춘");
    expect(r.source).toBe("kasi");
    expect(r.onsetDate).toBe("2000-02-04");
    expect(r.onsetKst).toBe("21:40");
  });

  it("picks 직전 절기 when birth is before a same-day 절입", () => {
    // 입춘 2000-02-04 21:40 — noon that day is still 대한
    const r = resolveJeolgiBadge(2000, 2, 4, 12);
    expect(r?.status).toBe("ok");
    if (r?.status !== "ok") return;
    expect(r.nameKo).toBe("대한");
    expect(r.source).toBe("kasi");
  });

  it("falls back to local kernel for in-range years missing from fixture", () => {
    // Fixture samples: 2000,2001,2008,2016,2024,2025,2028 — 2010 is in range but absent
    const r = resolveJeolgiBadge(2010, 6, 15, 12);
    expect(r?.status).toBe("ok");
    if (r?.status !== "ok") return;
    expect(r.source).toBe("local");
    expect(TERM_NAMES_KO).toContain(r.nameKo);
    expect(r.onsetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("keeps month-boundary 節 aligned with getSolarMonthPillar branch", () => {
    const samples: Array<[number, number, number, number | null]> = [
      [2000, 2, 5, 12],
      [2000, 1, 10, 12],
      [2008, 8, 1, 9],
      [2016, 11, 20, 18],
      [2024, 3, 15, null],
      [2025, 7, 7, 4],
      [2028, 12, 1, 12],
      [2010, 4, 20, 12], // local fallback year
    ];
    for (const [y, m, d, h] of samples) {
      const badge = resolveJeolgiBadge(y, m, d, h);
      expect(badge?.status, `${y}-${m}-${d}`).toBe("ok");
      if (badge?.status !== "ok") continue;
      const pillar = getSolarMonthPillar(y, m, d, h);
      expect(
        monthBranchForTermIndex(badge.monthBoundaryTermIndex),
        `${y}-${m}-${d} ${badge.monthBoundaryNameKo}`,
      ).toBe(pillar.branch);
    }
  });

  it("fixture 입춘 rows match month branch 인(2)", () => {
    const ipchun = (golden.terms as { date: string; kst: string; name: string }[]).filter(
      (t) => t.name === "입춘",
    );
    expect(ipchun.length).toBeGreaterThanOrEqual(7);
    for (const t of ipchun) {
      const [y, m, d] = t.date.split("-").map(Number);
      // Noon on the calendar day after 절입 — safely inside 입춘 / 인월.
      const next = new Date(Date.UTC(y, m - 1, d + 1));
      const ny = next.getUTCFullYear();
      const nm = next.getUTCMonth() + 1;
      const nd = next.getUTCDate();
      const badge = resolveJeolgiBadge(ny, nm, nd, 12);
      expect(badge?.status).toBe("ok");
      if (badge?.status !== "ok") continue;
      expect(badge.nameKo).toBe("입춘");
      expect(monthBranchForTermIndex(badge.monthBoundaryTermIndex)).toBe(2);
      expect(getSolarMonthPillar(ny, nm, nd, 12).branch).toBe(2);
    }
  });
});

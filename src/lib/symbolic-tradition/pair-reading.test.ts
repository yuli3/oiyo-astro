import { describe, expect, it } from "vitest";

import { CITIES } from "@/lib/ontology/natal/signs";

import { comparisonFromCivil } from "./circle-input";
import { taraOf } from "./jyotish";
import { branchRelations, pairCalendar, pairEvidence, pairNameKey, readPair, type Evidence, type Person } from "./pair-reading";
import { palaceInChart } from "./ziwei-coordinates";

const seoul = CITIES.find((c) => c.id === "seoul")!;
// 관계 해석 PRD 의 테스트 쌍. 워싱턴은 검색 도시와 같은 모양으로 만든다.
const dc = { id: "gn:38.8951,-77.0364", label: { ko: "워싱턴", en: "Washington", ja: "ワシントン", zh: "华盛顿", fr: "Washington", es: "Washington" }, lat: 38.8951, lon: -77.0364, tz: -5, zoneId: "America/New_York" };
const A: Person = { id: "a", label: "A", profile: comparisonFromCivil({ date: "2007-03-24", time: "14:00", city: seoul }, { astro: true }) };
const B: Person = { id: "b", label: "B", profile: comparisonFromCivil({ date: "2002-09-01", time: "09:00", city: dc }, { astro: true }) };

describe("지지 관계 표", () => {
  it("巳申은 육합이면서 형이다", () => {
    expect(branchRelations("SA", "SIN").sort()).toEqual(["punishment", "six-harmony"]);
  });
  it("표는 대칭이다", () => {
    const all = ["JA", "CHUK", "IN", "MYO", "JIN", "SA", "O", "MI", "SIN", "YU", "SUL", "HAE"];
    for (const x of all) for (const y of all) expect(branchRelations(x, y).sort()).toEqual(branchRelations(y, x).sort());
  });
  it("육합·충은 한 지지마다 정확히 하나", () => {
    const all = ["JA", "CHUK", "IN", "MYO", "JIN", "SA", "O", "MI", "SIN", "YU", "SUL", "HAE"];
    for (const x of all) {
      expect(all.filter((y) => branchRelations(x, y).includes("six-harmony"))).toHaveLength(1);
      expect(all.filter((y) => branchRelations(x, y).includes("clash"))).toHaveLength(1);
    }
  });
  it("자형은 辰·午·酉·亥 같은 글자끼리만", () => {
    expect(branchRelations("O", "O")).toContain("punishment");
    expect(branchRelations("JA", "JA")).not.toContain("punishment");
  });
});

describe("PRD 테스트 쌍 (수용기준 A1·A3·A4)", () => {
  const reading = readPair(A, B, "2026-10-01");

  it("일간 丁–壬은 천간합, 이름도 그 짝의 것이다", () => {
    expect(reading.relation).toBe("combining");
    expect(reading.nameKey).toBe("combo:JEONG-IM");
    expect(reading.evidence[0]).toMatchObject({ kind: "stem", relation: "combining", a: "JEONG", b: "IM" });
  });

  it("일지 巳–申이 육합·형으로 근거 줄에 나온다", () => {
    const day = reading.evidence.find((e) => e.kind === "branch" && e.pillar === "day");
    expect(day).toMatchObject({ a: "SA", b: "SIN" });
    expect((day as { relations: string[] }).relations.sort()).toEqual(["punishment", "six-harmony"]);
  });

  it("아홉 관점이 모두 온다", () => {
    expect(reading.lenses).toHaveLength(9);
  });

  it("음양이 크게 다르면 대화 장면은 속도 대비다", () => {
    expect(reading.scenes.talk).toEqual({ key: "contrast", fast: "b", slow: "a" });
  });

  it("쇠는 B 만 가져 회복 장면에서 B 가 맡는다", () => {
    expect(reading.scenes.recover).toEqual({ key: "only", holder: "b", element: "metal" });
  });

  it("2026-10 은 둘의 받는 날이 겹치지 않는다 — 바통 사이", () => {
    const cal = pairCalendar(A, B, "2026-10-01", 31);
    expect(cal.both).toEqual([]);
    expect(cal.alternating).toBe(true);
  });

  it("시각과 도시가 있으면 한계에 빠진 것이 없다", () => {
    expect(reading.limits).toEqual({ noHour: [], moonAmbiguous: [], noAstro: [] });
  });

  it("시각을 비우면 시주 기반 근거가 사라지고 한계에 적힌다", () => {
    const a2: Person = { ...A, profile: comparisonFromCivil({ date: "2007-03-24", city: seoul }, { astro: true }) };
    const r = readPair(a2, B, "2026-10-01");
    expect(r.limits.noHour).toEqual(["a"]);
    expect(r.evidence.some((e) => e.kind === "branch" && e.pillar === "hour")).toBe(false);
  });
});

describe("이름 키", () => {
  it("열다섯 오행 짝과 다섯 천간합으로 스무 개를 넘지 않는다", () => {
    const keys = new Set<string>();
    // 격자로 뽑으면 60일 주기와 맞물려 일부 짝만 나온다(lens-quality 와 같은 이유).
    let seed = 20260922;
    const next = () => (seed = (seed * 1103515245 + 12345) >>> 0);
    const day = () => new Date(Date.UTC(1960, 0, 1) + ((next() >>> 8) % 18000) * 86_400_000).toISOString().slice(0, 10);
    for (let i = 0; i < 2000; i += 1) {
      keys.add(pairNameKey({ id: "x", label: "x", profile: comparisonFromCivil({ date: day() }) }, { id: "y", label: "y", profile: comparisonFromCivil({ date: day() }) }));
    }
    expect(keys.size).toBe(20);
    expect([...keys].filter((k) => k.startsWith("combo:"))).toHaveLength(5);
  });
});

describe("근거 줄", () => {
  it("별자리 좌표가 없는 사람과는 달·태양 줄을 만들지 않는다", () => {
    const old: Person = { id: "o", label: "O", profile: comparisonFromCivil({ date: "1990-05-17" }) };
    const ev = pairEvidence(old, B);
    expect(ev.some((e) => e.kind === "moon" || e.kind === "sun")).toBe(false);
  });
});

describe("출생 괘 (매화역수)", () => {
  it("시각이 있는 두 사람은 근거 줄에 각자의 괘가 있다", () => {
    const hex = pairEvidence(A, B).find((e) => e.kind === "hexagram") as { a: { number: number } | null; b: { number: number } | null } | undefined;
    expect(hex?.a?.number).toBeGreaterThanOrEqual(1);
    expect(hex?.b?.number).toBeGreaterThanOrEqual(1);
  });

  it("둘 다 시각이 없으면 괘 줄을 만들지 않는다", () => {
    const x: Person = { id: "x", label: "X", profile: comparisonFromCivil({ date: "1990-05-17" }, { astro: true }) };
    const y: Person = { id: "y", label: "Y", profile: comparisonFromCivil({ date: "1988-11-02" }, { astro: true }) };
    expect(x.profile.hexagram).toBeNull();
    expect(pairEvidence(x, y).some((e) => e.kind === "hexagram")).toBe(false);
  });

  it("마야 줄은 인장 번호를, 켈트 줄은 나무를 싣는다", () => {
    const ev = pairEvidence(A, B);
    const mayan = ev.find((e) => e.kind === "mayan") as { aSeal: number; bSeal: number };
    expect(mayan.aSeal).toBeGreaterThanOrEqual(1);
    expect(mayan.aSeal).toBeLessThanOrEqual(20);
    expect(ev.find((e) => e.kind === "celtic")).toMatchObject({ a: A.profile.celticTree.id, b: B.profile.celticTree.id });
  });
});

describe("이집트 12신 줄", () => {
  it("두 사람 모두 날짜만으로 신이 정해져 근거 줄에 들어간다", () => {
    const ev = pairEvidence(A, B).find((e) => e.kind === "egyptian");
    // 2007-03-24 → 이시스(3/11–31), 2002-09-01 → 나일(9/1–7)
    expect(ev).toEqual({ kind: "egyptian", a: "isis", b: "nile" });
  });

  it("옛 참가자(이집트 좌표 없음)와는 줄을 만들지 않는다", () => {
    const old: Person = { id: "o", label: "O", profile: comparisonFromCivil({ date: "1990-05-17" }) };
    expect(pairEvidence(old, B).some((e) => e.kind === "egyptian")).toBe(false);
  });
});


describe("되살린 세 전통의 줄", () => {
  it("생명수는 날짜만으로 늘 선다", () => {
    // 2007-03-24 → 3+6+9 = 18 → 9, 2002-09-01 → 9+1+4 = 14 → 5
    expect(pairEvidence(A, B).find((e) => e.kind === "life-path")).toEqual({ kind: "life-path", a: 9, b: 5 });
    const x: Person = { id: "x", label: "X", profile: comparisonFromCivil({ date: "1990-05-17" }) };
    expect(pairEvidence(x, B).some((e) => e.kind === "life-path")).toBe(true);
  });

  it("시각을 아는 둘은 낙샤트라가 하나씩이고 타라를 두 방향으로 센다", () => {
    const ev = pairEvidence(A, B).find((e) => e.kind === "nakshatra") as Extract<Evidence, { kind: "nakshatra" }>;
    expect(ev.a).toHaveLength(1);
    expect(ev.b).toHaveLength(1);
    expect(ev.tara).toEqual({ ab: taraOf(ev.a[0], ev.b[0]), ba: taraOf(ev.b[0], ev.a[0]) });
  });

  it("시각을 모르면 후보만 적고 타라는 세우지 않는다", () => {
    const a2: Person = { ...A, profile: comparisonFromCivil({ date: "2007-03-24", city: seoul }, { astro: true }) };
    const ev = pairEvidence(a2, B).find((e) => e.kind === "nakshatra") as Extract<Evidence, { kind: "nakshatra" }>;
    expect(ev.a.length).toBeGreaterThanOrEqual(1);
    if (ev.a.length > 1) expect(ev.tara).toBeNull();
  });

  it("명궁은 서로의 명반에서 앉는 궁을 적고, 한쪽이 시각이 없으면 그쪽만 비운다", () => {
    const ev = pairEvidence(A, B).find((e) => e.kind === "ziwei") as Extract<Evidence, { kind: "ziwei" }>;
    expect(ev.a && ev.b).toBeTruthy();
    expect(ev.aInB).toBe(palaceInChart(ev.b!, ev.a!.lifePalace));
    expect(ev.bInA).toBe(palaceInChart(ev.a!, ev.b!.lifePalace));
    const a2: Person = { ...A, profile: comparisonFromCivil({ date: "2007-03-24", city: seoul }, { astro: true }) };
    expect(pairEvidence(a2, B).find((e) => e.kind === "ziwei")).toMatchObject({ a: null, aInB: null, bInA: null });
  });

  it("옛 참가자와는 줄을 만들지 않는다", () => {
    const old: Person = { id: "o", label: "O", profile: { ...comparisonFromCivil({ date: "1990-05-17" }), lifePath: undefined } };
    const kinds = pairEvidence(old, B).map((e) => e.kind);
    expect(kinds).not.toContain("life-path");
    expect(kinds).not.toContain("nakshatra");
    expect(kinds).toContain("ziwei"); // B 쪽만 있어도 적는다
  });
});

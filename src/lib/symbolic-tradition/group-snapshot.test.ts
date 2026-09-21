import { describe, expect, it } from "vitest";

import { EarthlyBranch, FiveElement, HeavenlyStem } from "@/lib/ontology/saju/types";
import { COMPATIBILITY_LENSES, type SymbolicComparisonProfile } from "./types";
import { allPairEdges, createSymbolicGroupSnapshot, decodeSymbolicGroupSnapshot, encodeSymbolicGroupSnapshot, isSymbolicGroupParticipant, resolveGroupCenterId, starEdges } from "./group-snapshot";

const STEM_LIST = Object.values(HeavenlyStem);
const BRANCH_LIST = Object.values(EarthlyBranch);
const pillar = (seed: number) => ({
  earthlyBranch: BRANCH_LIST[seed % BRANCH_LIST.length],
  heavenlyStem: STEM_LIST[seed % STEM_LIST.length],
});

const profile = (seed: number): SymbolicComparisonProfile => ({
  chineseZodiac: { branch: ([EarthlyBranch.JA, EarthlyBranch.CHUK, EarthlyBranch.IN, EarthlyBranch.MYO] as const)[seed % 4] },
  // 결핍 렌즈가 counts 를 읽는다. seed 로 빈 원소가 갈리게 만들어 관계가
  // 한 값으로 뭉치지 않게 한다.
  fiveElements: {
    counts: {
      [FiveElement.EARTH]: seed % 2, [FiveElement.FIRE]: (seed + 1) % 3,
      [FiveElement.METAL]: seed % 3, [FiveElement.WATER]: (seed + 2) % 2,
      [FiveElement.WOOD]: (seed + 1) % 2,
    },
    dominant: ([FiveElement.WOOD, FiveElement.FIRE, FiveElement.EARTH, FiveElement.METAL, FiveElement.WATER] as const)[seed % 5],
    observedCoordinates: seed % 2 ? 6 : 8,
  },
  // 일간·지지 렌즈가 기둥을 읽는다. seed 로 간지가 갈리게 만들어 관계가
  // 한 값으로 뭉치지 않게 한다. 시주는 생시 미상을 흉내내 비운다.
  celticTree: { id: (["birch", "alder", "oak", "vine", "elder"] as const)[seed % 5] },
  mayanKin: {
    color: (["red", "white", "blue", "yellow"] as const)[seed % 4],
    seal: (seed % 20) + 1,
    tone: (seed % 13) + 1,
  },
  saju: {
    year: pillar(seed), month: pillar(seed + 1), day: pillar(seed + 2), hour: null,
  },
  sunSign: { element: (["air", "earth", "fire", "water"] as const)[seed % 4], modality: (["cardinal", "fixed", "mutable"] as const)[seed % 3], sign: (["aries", "taurus", "gemini", "cancer"] as const)[seed % 4] },
  yinYang: { yang: seed % 5, yin: 8 - (seed % 5) },
});
const people = (count: number) => Array.from({ length: count }, (_, index) => ({ id: `p-${index}`, label: `Person ${index}`, profile: profile(index) }));

describe("symbolic group snapshot", () => {
  it.each([[2, 1], [3, 3], [5, 10], [10, 45]])("creates %i participants with %i pairs", (count, pairs) => {
    const snapshot = createSymbolicGroupSnapshot(people(count), { now: new Date("2026-08-14T00:00:00Z") });
    // 렌즈 개수를 숫자로 박지 않는다 — 목록에서 센다(2026-09-04).
    expect(snapshot.edges).toHaveLength(pairs * COMPATIBILITY_LENSES.length);
    expect(starEdges(snapshot, "five-elements")).toHaveLength(count - 1);
    expect(allPairEdges(snapshot, "five-elements")).toHaveLength(pairs);
    expect(snapshot.edges.every((edge) => !("score" in edge))).toBe(true);
  });

  it("round-trips an immutable snapshot and rejects modified edges", () => {
    const snapshot = createSymbolicGroupSnapshot(people(3), { now: new Date("2026-08-14T00:00:00Z") });
    expect(decodeSymbolicGroupSnapshot(encodeSymbolicGroupSnapshot(snapshot), new Date("2026-08-15T00:00:00Z"))).toEqual(snapshot);
    const changed = { ...snapshot, edges: snapshot.edges.slice(1) };
    expect(decodeSymbolicGroupSnapshot(encodeSymbolicGroupSnapshot(changed), new Date("2026-08-15T00:00:00Z"))).toBeNull();
  });

  it("rejects groups outside 2 to 10 people and expired snapshots", () => {
    // 2026-09-04: 하한이 3 → 2 로 내려갔다. 2인 전용 페이지를 걷어내고 이
    // 원 하나가 2인 이상을 모두 받는다. 1인은 비교 대상이 없어 여전히 막는다.
    expect(() => createSymbolicGroupSnapshot(people(1))).toThrow();
    expect(() => createSymbolicGroupSnapshot(people(11))).toThrow();
    const snapshot = createSymbolicGroupSnapshot(people(3), { now: new Date("2026-08-14T00:00:00Z") });
    expect(decodeSymbolicGroupSnapshot(encodeSymbolicGroupSnapshot(snapshot), new Date("2026-08-22T00:00:01Z"))).toBeNull();
  });

  it("falls back to a remaining participant when the center is removed", () => {
    expect(resolveGroupCenterId(people(3), "p-1")).toBe("p-1");
    expect(resolveGroupCenterId(people(2), "removed")).toBe("p-0");
    expect(resolveGroupCenterId([], "removed")).toBe("");
  });
});

describe("옛 저장본 호환", () => {
  it("사주 기둥이 없는 참가자는 받지 않는다", () => {
    // 2026-09-21 일간·지지 렌즈를 더하면서 기둥이 비교의 입력이 됐다.
    // 그 전에 브라우저에 저장된 원에는 이 자리가 없다. 걸러내지 않으면
    // 복원하다 비교에서 터져 페이지 전체가 뜨지 않는다 — 실제로 그렇게
    // 깨지는 것을 확인하고 막았다.
    const { saju: _dropped, ...legacy } = profile(1);
    expect(isSymbolicGroupParticipant({ id: "p-0", label: "옛 친구", profile: legacy })).toBe(false);
  });

  it("생시를 모르는 참가자(시주 null)는 그대로 받는다", () => {
    const withoutHour = { ...profile(2), saju: { ...profile(2).saju, hour: null } };
    expect(isSymbolicGroupParticipant({ id: "p-1", label: "시간 모름", profile: withoutHour })).toBe(true);
  });
});

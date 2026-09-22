import type { SignKey } from "@/lib/ontology/natal/calculator";
import type { FiveElement } from "@/lib/ontology/saju/types";
import { STEMS } from "@/manifest/data/saju/stems";

import { sunAspectOf, type SunAspectKind } from "./group-astro";
import { dayMasterLinks, dayMasterOf } from "./group-flow";
import { synthesizeGroup, type GroupMember } from "./group-synthesis";
import { dayElementOf, stanceOf, type TodayStance } from "./group-today";
import { compareSymbolicProfiles } from "./index";
import type { SymbolicCompatibilityLens } from "./types";

/**
 * 두 사람 읽기 — 관계 해석 PRD(2026-09-20)의 층을 한 번에 낸다.
 *
 *   L1 이름   name       — 두 사람을 한 줄로 부르는 이름(C1)
 *   L2 장면   scenes     — 대화·결정·회복에서 차이가 드러나는 자리(C2)
 *   L2 관점   lenses     — 아홉 관점 전부(해설은 pair-copy)
 *   L3 근거   evidence   — 무엇을 계산했는지, 해석 없이(C3)
 *   둘의 달력 calendar   — 각자 받는 날·눌리는 날, 겹치는 날(C4)
 *   L4 한계   limits     — 무엇을 모르는 채로 읽었는지
 *
 * 화면은 이 함수 하나만 부른다. 문구는 키로만 내고, 여섯 언어 문장은
 * pair-reading-copy 가 가진다 — 같은 두 사람에게 언어마다 다른 판단이
 * 나오지 않게.
 */

export type Person = GroupMember;

// ─── 지지 관계 ──────────────────────────────────────────────────────────────
// 육합·충·형·해. 관점(렌즈)으로 세지 않는다 — 육합은 음양 관점과 겹쳐
// (r=−0.275) 품질 게이트에서 뺐다. 근거 줄은 판정이 아니라 사실 목록이라
// 겹쳐도 적을 수 있다.

type Pair = readonly [string, string];
const has = (list: ReadonlyArray<Pair>, a: string, b: string) =>
  list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

const SIX_HARMONY: Pair[] = [["JA", "CHUK"], ["IN", "HAE"], ["MYO", "SUL"], ["JIN", "YU"], ["SA", "SIN"], ["O", "MI"]];
const CLASH: Pair[] = [["JA", "O"], ["CHUK", "MI"], ["IN", "SIN"], ["MYO", "YU"], ["JIN", "SUL"], ["SA", "HAE"]];
/** 형(刑) — 삼형(寅巳申·丑戌未)의 두 글자씩, 상형(子卯), 자형(辰·午·酉·亥 같은 글자) */
const PUNISHMENT: Pair[] = [["IN", "SA"], ["SA", "SIN"], ["SIN", "IN"], ["CHUK", "SUL"], ["SUL", "MI"], ["MI", "CHUK"], ["JA", "MYO"]];
const SELF_PUNISHMENT = new Set(["JIN", "O", "YU", "HAE"]);
const HARM: Pair[] = [["JA", "MI"], ["CHUK", "O"], ["IN", "SA"], ["MYO", "JIN"], ["SIN", "HAE"], ["YU", "SUL"]];

export type BranchRelation = "six-harmony" | "clash" | "punishment" | "harm";

export function branchRelations(a: string, b: string): BranchRelation[] {
  const out: BranchRelation[] = [];
  if (has(SIX_HARMONY, a, b)) out.push("six-harmony");
  if (has(CLASH, a, b)) out.push("clash");
  if (has(PUNISHMENT, a, b) || (a === b && SELF_PUNISHMENT.has(a))) out.push("punishment");
  if (has(HARM, a, b)) out.push("harm");
  return out;
}

// ─── 근거 줄 ────────────────────────────────────────────────────────────────

export type Evidence =
  | { kind: "stem"; relation: "combining" | "same" | "generating" | "controlling"; a: string; b: string }
  | { kind: "branch"; pillar: "year" | "month" | "day" | "hour"; a: string; b: string; relations: BranchRelation[] }
  | { kind: "yinyang"; a: { yang: number; yin: number }; b: { yang: number; yin: number } }
  | { kind: "elements-only"; holder: string; elements: FiveElement[] }
  | { kind: "elements-neither"; elements: FiveElement[] }
  | { kind: "moon"; a: SignKey[]; b: SignKey[]; shared: SignKey[] }
  | { kind: "sun"; a: number; b: number; separation: number; aspect: SunAspectKind | null }
  | { kind: "mayan"; sameColor: boolean; sameTone: boolean; aTone: number; bTone: number; aColor: string; bColor: string };

function separation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function pairEvidence(a: Person, b: Person): Evidence[] {
  const out: Evidence[] = [];
  const link = dayMasterLinks([a, b])[0];
  out.push({ kind: "stem", relation: link.kind, a: a.profile.saju.day.heavenlyStem, b: b.profile.saju.day.heavenlyStem });
  // 일지는 관계가 없어도 늘 적는다(두 사람을 잇는 둘째 축). 나머지 기둥은 관계가 있을 때만.
  for (const pillar of ["day", "month", "year", "hour"] as const) {
    const pa = a.profile.saju[pillar];
    const pb = b.profile.saju[pillar];
    if (!pa || !pb) continue;
    const relations = branchRelations(pa.earthlyBranch, pb.earthlyBranch);
    if (pillar === "day" || relations.length) out.push({ kind: "branch", pillar, a: pa.earthlyBranch, b: pb.earthlyBranch, relations });
  }
  out.push({ kind: "yinyang", a: a.profile.yinYang, b: b.profile.yinYang });
  const pair = synthesizeGroup([a, b]).pair!;
  for (const [holder, elements] of Object.entries(pair.only)) {
    if (elements.length) out.push({ kind: "elements-only", holder, elements });
  }
  if (pair.neither.length) out.push({ kind: "elements-neither", elements: pair.neither });
  const aa = a.profile.astro;
  const ba = b.profile.astro;
  if (aa && ba) {
    out.push({ kind: "moon", a: aa.moon, b: ba.moon, shared: aa.moon.filter((m) => ba.moon.includes(m)) });
    out.push({ kind: "sun", a: aa.sun, b: ba.sun, separation: separation(aa.sun, ba.sun), aspect: sunAspectOf(aa.sun, ba.sun)?.kind ?? null });
  }
  out.push({
    kind: "mayan",
    sameColor: a.profile.mayanKin.color === b.profile.mayanKin.color,
    sameTone: a.profile.mayanKin.tone === b.profile.mayanKin.tone,
    aTone: a.profile.mayanKin.tone,
    bTone: b.profile.mayanKin.tone,
    aColor: a.profile.mayanKin.color,
    bColor: b.profile.mayanKin.color,
  });
  return out;
}

// ─── 이름 (L1) ──────────────────────────────────────────────────────────────

/**
 * 이름 키. 천간합이면 다섯 짝마다 고유한 이름(가장 드문 신호가 이름을
 * 정한다), 아니면 두 일간 오행의 짝(열다섯)으로 부른다.
 */
export function pairNameKey(a: Person, b: Person): string {
  const sa = a.profile.saju.day.heavenlyStem;
  const sb = b.profile.saju.day.heavenlyStem;
  const link = dayMasterLinks([a, b])[0];
  if (link.kind === "combining") {
    const order = ["GAP", "EUL", "BYEONG", "JEONG", "MU", "GI", "GYEONG", "SIN", "IM", "GYE"];
    const [x, y] = [sa, sb].sort((p, q) => order.indexOf(p) - order.indexOf(q));
    return `combo:${x}-${y}`;
  }
  const order: FiveElement[] = ["wood", "fire", "earth", "metal", "water"] as FiveElement[];
  const [x, y] = [dayMasterOf(a.profile), dayMasterOf(b.profile)].sort((p, q) => order.indexOf(p) - order.indexOf(q));
  return `el:${x}-${y}`;
}

/** 이름 아래 한 줄에 붙일 둘째 신호. 드문 것부터 하나만. */
export type NameSignal = "same-moon" | "same-kin" | "speed-contrast" | "day-branch-harmony" | "day-branch-clash" | "none";

function yangShare(p: Person): number {
  const { yang, yin } = p.profile.yinYang;
  return yang / Math.max(1, yang + yin);
}

export function pairNameSignal(a: Person, b: Person, evidence: Evidence[]): NameSignal {
  const day = evidence.find((e) => e.kind === "branch" && e.pillar === "day") as Extract<Evidence, { kind: "branch" }> | undefined;
  const moon = evidence.find((e) => e.kind === "moon") as Extract<Evidence, { kind: "moon" }> | undefined;
  const mayan = evidence.find((e) => e.kind === "mayan") as Extract<Evidence, { kind: "mayan" }>;
  // 대략의 희귀도: 같은 음조·색 1/52, 달 같은 궁(둘 다 확정) 1/12, 일지 육합 1/12, 일지 충 1/12, 속도 대비는 흔한 편
  if (mayan.sameColor && mayan.sameTone) return "same-kin";
  if (moon && moon.a.length === 1 && moon.b.length === 1 && moon.shared.length === 1) return "same-moon";
  if (day?.relations.includes("six-harmony")) return "day-branch-harmony";
  if (day?.relations.includes("clash")) return "day-branch-clash";
  if (Math.abs(yangShare(a) - yangShare(b)) >= 0.5) return "speed-contrast";
  return "none";
}

// ─── 장면 (L2) ──────────────────────────────────────────────────────────────

export type TalkScene =
  | { key: "contrast"; fast: string; slow: string }
  | { key: "both-yang" | "both-yin" | "similar" };
export type DecideScene =
  | { key: "combining" | "same" }
  | { key: "generating"; giver: string; receiver: string }
  | { key: "controlling"; checker: string; checked: string };
export type RecoverScene =
  | { key: "only"; holder: string; element: FiveElement }
  | { key: "gap"; element: FiveElement }
  | { key: "full" };

export function pairScenes(a: Person, b: Person): { talk: TalkScene; decide: DecideScene; recover: RecoverScene } {
  const ra = yangShare(a);
  const rb = yangShare(b);
  const talk: TalkScene = Math.abs(ra - rb) >= 0.5
    ? { key: "contrast", fast: ra > rb ? a.id : b.id, slow: ra > rb ? b.id : a.id }
    : ra >= 0.6 && rb >= 0.6 ? { key: "both-yang" }
      : ra <= 0.4 && rb <= 0.4 ? { key: "both-yin" }
        : { key: "similar" };

  const link = dayMasterLinks([a, b])[0];
  const other = (id: string) => (id === a.id ? b.id : a.id);
  const decide: DecideScene = link.kind === "generating"
    ? { key: "generating", giver: link.from!, receiver: other(link.from!) }
    : link.kind === "controlling"
      ? { key: "controlling", checker: link.from!, checked: other(link.from!) }
      : { key: link.kind };

  const pair = synthesizeGroup([a, b]).pair!;
  const only = Object.entries(pair.only).find(([, list]) => list.length);
  const recover: RecoverScene = only
    ? { key: "only", holder: only[0], element: only[1][0] }
    : pair.neither.length ? { key: "gap", element: pair.neither[0] } : { key: "full" };
  return { talk, decide, recover };
}

// ─── 둘의 달력 (C4) ─────────────────────────────────────────────────────────

export interface PairCalendar {
  days: Array<{ date: string; element: FiveElement; a: TodayStance; b: TodayStance }>;
  /** 둘 다 받는 날 */
  both: string[];
  /** 한 사람이 받는 날 다른 사람이 받지 않고, 둘 다 받는 날이 한 번도 없다 */
  alternating: boolean;
}

function addDays(civil: string, n: number): string {
  const [y, m, d] = civil.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function pairCalendar(a: Person, b: Person, start: string, length = 28): PairCalendar {
  const ea = dayMasterOf(a.profile);
  const eb = dayMasterOf(b.profile);
  const days = Array.from({ length }, (_, i) => {
    const date = addDays(start, i);
    const element = dayElementOf(date);
    return { date, element, a: stanceOf(element, ea), b: stanceOf(element, eb) };
  });
  const both = days.filter((d) => d.a === "support" && d.b === "support").map((d) => d.date);
  const aAny = days.some((d) => d.a === "support");
  const bAny = days.some((d) => d.b === "support");
  return { days, both, alternating: both.length === 0 && aAny && bAny };
}

// ─── 한계 (L4) ──────────────────────────────────────────────────────────────

export interface PairLimits {
  noHour: string[];
  moonAmbiguous: string[];
  noAstro: string[];
}

export function pairLimits(a: Person, b: Person): PairLimits {
  const people = [a, b];
  return {
    noHour: people.filter((p) => !p.profile.saju.hour).map((p) => p.id),
    moonAmbiguous: people.filter((p) => (p.profile.astro?.moon.length ?? 0) > 1).map((p) => p.id),
    noAstro: people.filter((p) => !p.profile.astro).map((p) => p.id),
  };
}

// ─── 한 번에 ────────────────────────────────────────────────────────────────

export interface PairReading {
  a: { id: string; label: string; stem: string; element: FiveElement };
  b: { id: string; label: string; stem: string; element: FiveElement };
  nameKey: string;
  nameSignal: NameSignal;
  relation: "combining" | "same" | "generating" | "controlling";
  scenes: ReturnType<typeof pairScenes>;
  lenses: SymbolicCompatibilityLens[];
  evidence: Evidence[];
  calendar: PairCalendar;
  limits: PairLimits;
}

export function readPair(a: Person, b: Person, today: string): PairReading {
  const evidence = pairEvidence(a, b);
  const side = (p: Person) => ({
    id: p.id,
    label: p.label,
    stem: p.profile.saju.day.heavenlyStem,
    element: STEMS[p.profile.saju.day.heavenlyStem].element as FiveElement,
  });
  return {
    a: side(a),
    b: side(b),
    nameKey: pairNameKey(a, b),
    nameSignal: pairNameSignal(a, b, evidence),
    relation: dayMasterLinks([a, b])[0].kind,
    scenes: pairScenes(a, b),
    lenses: compareSymbolicProfiles(a.profile, b.profile).lenses,
    evidence,
    calendar: pairCalendar(a, b, today),
    limits: pairLimits(a, b),
  };
}

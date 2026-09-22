import { EarthlyBranch, type FiveElement } from "@/lib/ontology/saju/types";
import { STEMS } from "@/manifest/data/saju/stems";

import { GROUP_ELEMENT_ORDER, type GroupMember } from "./group-synthesis";
import { CONTROL, GENERATION } from "./index";
import type { SymbolicComparisonProfile } from "./types";

/**
 * 궤도 그림(우리의 지도 A1~A6)이 읽는 값. 그림은 여기서 받은 것만 그린다 —
 * 화면마다 따로 셈하면 같은 모임을 두 그림이 다르게 말하게 된다.
 */

// 생·극 표는 일간 렌즈와 같은 것을 쓴다(한 곳에서만 정한다).
const GENERATES = GENERATION;
const CONTROLS = CONTROL;

export function dayMasterOf(profile: SymbolicComparisonProfile): FiveElement {
  return STEMS[profile.saju.day.heavenlyStem].element as FiveElement;
}

/**
 * A3 상생 흐름. 목→화→토→금→수→목 다섯 고리마다 흐름의 세기와 막힘.
 *
 * 흐름은 **낳는 쪽**의 양으로 세고, **받을 쪽이 비어 있으면 막힌다.** 오늘의
 * 일진이 그 빈 기운이면 그날은 이어진다(mended). 낳는 쪽이 비어 있으면 그
 * 고리는 흐를 것이 없다(strength 0) — 막힘과는 다르다.
 */
export interface FlowEdge {
  from: FiveElement;
  to: FiveElement;
  /** 0~1, 모임 안에서 가장 많은 기운 대비 낳는 쪽의 양 */
  strength: number;
  blocked: boolean;
  mended: boolean;
}

export function generationFlow(
  counts: Record<FiveElement, number>,
  today: FiveElement | null = null,
): FlowEdge[] {
  const max = Math.max(1, ...GROUP_ELEMENT_ORDER.map((e) => counts[e]));
  return GROUP_ELEMENT_ORDER.map((from) => {
    const to = GENERATES[from];
    const empty = counts[to] === 0;
    return {
      from,
      to,
      strength: counts[from] / max,
      blocked: counts[from] > 0 && empty && today !== to,
      mended: counts[from] > 0 && empty && today === to,
    };
  });
}

/**
 * A2 별자리 선. 두 사람의 일간 관계와 **방향**. 생은 주는 쪽→받는 쪽,
 * 극은 누르는 쪽→눌리는 쪽. 같은 기운은 방향이 없다.
 *
 * 관계 이름은 일간 렌즈(compareSymbolicProfiles 의 day-master)와 같다.
 */
export interface DayMasterLink {
  a: string;
  b: string;
  kind: "same" | "generating" | "controlling";
  /** 생·극의 출발점. same 이면 null */
  from: string | null;
}

export function dayMasterLinks(members: GroupMember[]): DayMasterLink[] {
  const links: DayMasterLink[] = [];
  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      const [x, y] = [members[i], members[j]];
      const ex = dayMasterOf(x.profile);
      const ey = dayMasterOf(y.profile);
      if (ex === ey) links.push({ a: x.id, b: y.id, kind: "same", from: null });
      else if (GENERATES[ex] === ey) links.push({ a: x.id, b: y.id, kind: "generating", from: x.id });
      else if (GENERATES[ey] === ex) links.push({ a: x.id, b: y.id, kind: "generating", from: y.id });
      else if (CONTROLS[ex] === ey) links.push({ a: x.id, b: y.id, kind: "controlling", from: x.id });
      else links.push({ a: x.id, b: y.id, kind: "controlling", from: y.id });
    }
  }
  return links;
}

/**
 * A5 궤적 서명. 한 사람의 좌표를 궤도 하나로 옮긴다. 같은 사람은 늘 같은
 * 궤도, 다른 사람은 다른 궤도라 모임마다 무늬가 달라진다.
 *
 * 어느 좌표를 쓰는가 — 옛 참가자에게도 있는 것만 쓴다(마야·일주·지지).
 * - 반지름: 마야 음조(1~13). 13단계라 사람끼리 겹치기 어렵다.
 * - 공전 속도: 일간의 오행 순서. 같은 기운은 같은 박자로 돈다.
 * - 주전원(작은 원): 인장(1~20)과 일지(12)로 크기·빠르기.
 * 속도는 모두 정수비라 무늬가 닫힌다(한없이 칠해지지 않는다).
 */
export interface SignatureOrbit {
  /** 0~1, 그릴 때 무대 반지름에 곱한다 */
  radius: number;
  /** 한 바퀴의 상대 속도(정수) */
  speed: number;
  epicycleRadius: number;
  epicycleSpeed: number;
  /** 시작 각, 라디안 */
  phase: number;
}

const BRANCH_ORDER: EarthlyBranch[] = [
  EarthlyBranch.JA, EarthlyBranch.CHUK, EarthlyBranch.IN, EarthlyBranch.MYO, EarthlyBranch.JIN, EarthlyBranch.SA,
  EarthlyBranch.O, EarthlyBranch.MI, EarthlyBranch.SIN, EarthlyBranch.YU, EarthlyBranch.SUL, EarthlyBranch.HAE,
];

export function signatureOrbit(profile: SymbolicComparisonProfile): SignatureOrbit {
  const tone = profile.mayanKin.tone; // 1..13
  const seal = profile.mayanKin.seal; // 1..20
  const branchIndex = Math.max(0, BRANCH_ORDER.indexOf(profile.saju.day.earthlyBranch));
  const elementIndex = GROUP_ELEMENT_ORDER.indexOf(dayMasterOf(profile));
  return {
    radius: 0.3 + ((tone - 1) / 12) * 0.5,
    speed: elementIndex + 1,
    epicycleRadius: 0.06 + ((seal - 1) / 19) * 0.12,
    epicycleSpeed: 3 + (branchIndex % 5),
    phase: (branchIndex / 12) * Math.PI * 2,
  };
}

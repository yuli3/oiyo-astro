import type { SignKey } from "@/lib/ontology/natal/calculator";
import type { FiveElement } from "@/lib/ontology/saju/types";

import { binomialTail, type GroupMember, type GroupSynthesis } from "./group-synthesis";
import type { SymbolicProfile } from "./types";

/**
 * 모임의 별자리 층 — 우리의 지도 B1~B4 의 엔진.
 *
 * - B1 원소×양태 격자: 태양궁 표로 사람을 열두 칸에 놓는다.
 * - B2 해·달·상승: 사람별 세 겹. 모르는 자리는 모른다고 둔다.
 * - B3 황도 위의 각: 태양 황경 차이로 사람 사이의 각을 잰다.
 * - B4 일치: 오행과 별자리가 같은 원소를 말할 때만 한 줄을 보탠다.
 *
 * 판정 원리는 오행 쪽과 같다. **우연으로 그만큼 나올 확률이 5% 미만일 때만
 * "몰렸다"고 말한다.** 다섯 명 중 셋이 불인 일은 열에 한 번은 우연히 생긴다.
 */

export type AstroElement = SymbolicProfile["sunSign"]["element"];
export type AstroModality = SymbolicProfile["sunSign"]["modality"];

export const ASTRO_ELEMENTS: AstroElement[] = ["fire", "earth", "air", "water"];
export const ASTRO_MODALITIES: AstroModality[] = ["cardinal", "fixed", "mutable"];

/**
 * 한 사람이 그 원소·양태일 기저 확률. 태양궁은 날짜 구간이라 길이가 조금씩
 * 다르다. group-astro.test 가 1950~2010 연속 날짜로 다시 잰다.
 */
export const SUN_ELEMENT_BASE_RATE: Record<AstroElement, number> = { fire: 0.25, earth: 0.25, air: 0.25, water: 0.25 };
export const SUN_MODALITY_BASE_RATE: Record<AstroModality, number> = { cardinal: 0.333, fixed: 0.333, mutable: 0.333 };

const CONCENTRATION_P = 0.05;

export type SunAspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";

/** 태양끼리의 각과 허용 오차. 시나스트리에서 태양에 흔히 쓰는 8°. */
const ASPECT_ANGLE: Record<SunAspectKind, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};
export const SUN_ASPECT_ORB = 8;

/**
 * 두 태양이 아무렇게나 놓였을 때 그 각이 설 확률. 떨어진 각은 0~180° 에
 * 고르게 퍼지므로, 합·대립은 한쪽 오차(8/180), 나머지는 양쪽(16/180)이다.
 */
export const SUN_ASPECT_CHANCE: Record<SunAspectKind, number> = {
  conjunction: SUN_ASPECT_ORB / 180,
  sextile: (2 * SUN_ASPECT_ORB) / 180,
  square: (2 * SUN_ASPECT_ORB) / 180,
  trine: (2 * SUN_ASPECT_ORB) / 180,
  opposition: SUN_ASPECT_ORB / 180,
};

export interface SunAspect {
  a: string;
  b: string;
  kind: SunAspectKind;
  /** 정확한 각에서 벗어난 도 */
  orb: number;
}

export interface AstroPattern {
  kind: "grand-trine" | "t-square";
  ids: string[];
}

export interface AstroTriad {
  id: string;
  sun: SymbolicProfile["sunSign"]["sign"];
  /** 황경. 옛 참가자(별자리 좌표 없음)는 null — 바퀴와 각에서 빠진다. */
  sunLongitude: number | null;
  moon: SignKey[];
  ascendant: SignKey | null;
}

export interface GroupAstro {
  /** 열두 칸, 원소 순서 × 양태 순서 */
  grid: Array<{ element: AstroElement; modality: AstroModality; ids: string[] }>;
  elementCounts: Record<AstroElement, number>;
  modalityCounts: Record<AstroModality, number>;
  /** 가장 많은 원소와 그만큼 모일 우연 확률 — "정직한 한 줄"에 쓴다 */
  topElement: { element: AstroElement; count: number; chance: number };
  topModality: { modality: AstroModality; count: number; chance: number };
  /** 우연으로 보기 어려울 만큼 몰린 원소(없으면 null) */
  concentratedElement: AstroElement | null;
  concentratedModality: AstroModality | null;
  /** 아무도 없는 원소. 드물다는 주장이 아니라 사실이다. */
  emptyElements: AstroElement[];
  aspects: SunAspect[];
  patterns: AstroPattern[];
  /** 황경을 가진 사람끼리의 쌍 수 */
  aspectPairs: number;
  /** 조화로운 각(삼각·육각)이나 긴장된 각(사각·대립)이 우연보다 뚜렷이 많은가 */
  aspectLean: "harmonious" | "tense" | null;
  triads: AstroTriad[];
  /**
   * 겉(태양)과 속(달)의 원소가 다르게 몰린 모임. 달을 하나로 아는 사람이
   * 셋 이상이고, 양쪽 다 우연 기준을 넘을 때만.
   */
  innerOuter: { outer: AstroElement; inner: AstroElement } | null;
}

const SIGN_ELEMENT: Record<SignKey, AstroElement> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};

export function elementOfSign(sign: SignKey): AstroElement {
  return SIGN_ELEMENT[sign];
}

function separation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function sunAspectOf(a: number, b: number): { kind: SunAspectKind; orb: number } | null {
  const d = separation(a, b);
  for (const kind of Object.keys(ASPECT_ANGLE) as SunAspectKind[]) {
    const orb = Math.abs(d - ASPECT_ANGLE[kind]);
    if (orb <= SUN_ASPECT_ORB) return { kind, orb };
  }
  return null;
}

function top<K extends string>(counts: Record<K, number>, order: K[]): K {
  return order.reduce((best, key) => (counts[key] > counts[best] ? key : best), order[0]);
}

function concentratedOf<K extends string>(
  counts: Record<K, number>,
  order: K[],
  rates: Record<K, number>,
  n: number,
): K | null {
  if (n < 3) return null;
  const key = top(counts, order);
  // 동률이면 한쪽으로 몰렸다고 말할 수 없다.
  if (order.filter((k) => counts[k] === counts[key]).length > 1) return null;
  return binomialTail(n, counts[key], rates[key]) < CONCENTRATION_P ? key : null;
}

function findPatterns(ids: string[], aspects: SunAspect[]): AstroPattern[] {
  const kindOf = (x: string, y: string) =>
    aspects.find((s) => (s.a === x && s.b === y) || (s.a === y && s.b === x))?.kind ?? null;
  const patterns: AstroPattern[] = [];
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      for (let k = j + 1; k < ids.length; k += 1) {
        const [x, y, z] = [ids[i], ids[j], ids[k]];
        const kinds = [kindOf(x, y), kindOf(y, z), kindOf(x, z)];
        if (kinds.every((kind) => kind === "trine")) {
          patterns.push({ kind: "grand-trine", ids: [x, y, z] });
          continue;
        }
        // T 사각: 한 쌍이 대립이고 나머지 한 사람이 둘 모두와 사각.
        const trio: Array<[string, string, string]> = [[x, y, z], [y, z, x], [x, z, y]];
        for (const [p, q, apex] of trio) {
          if (kindOf(p, q) === "opposition" && kindOf(p, apex) === "square" && kindOf(q, apex) === "square") {
            patterns.push({ kind: "t-square", ids: [p, q, apex] });
          }
        }
      }
    }
  }
  return patterns;
}

export function groupAstro(members: GroupMember[]): GroupAstro {
  const n = members.length;
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 } as Record<AstroElement, number>;
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 } as Record<AstroModality, number>;
  const grid = ASTRO_ELEMENTS.flatMap((element) =>
    ASTRO_MODALITIES.map((modality) => ({ element, modality, ids: [] as string[] })));
  for (const member of members) {
    const { element, modality } = member.profile.sunSign;
    elementCounts[element] += 1;
    modalityCounts[modality] += 1;
    grid.find((cell) => cell.element === element && cell.modality === modality)!.ids.push(member.id);
  }

  const topEl = top(elementCounts, ASTRO_ELEMENTS);
  const topMod = top(modalityCounts, ASTRO_MODALITIES);

  const placed = members.filter((m) => m.profile.astro);
  const aspects: SunAspect[] = [];
  for (let i = 0; i < placed.length; i += 1) {
    for (let j = i + 1; j < placed.length; j += 1) {
      const hit = sunAspectOf(placed[i].profile.astro!.sun, placed[j].profile.astro!.sun);
      if (hit) aspects.push({ a: placed[i].id, b: placed[j].id, ...hit });
    }
  }
  const aspectPairs = (placed.length * (placed.length - 1)) / 2;
  const harmonious = aspects.filter((s) => s.kind === "trine" || s.kind === "sextile").length;
  const tense = aspects.filter((s) => s.kind === "square" || s.kind === "opposition").length;
  const harmoniousP = binomialTail(aspectPairs, harmonious, SUN_ASPECT_CHANCE.trine + SUN_ASPECT_CHANCE.sextile);
  const tenseP = binomialTail(aspectPairs, tense, SUN_ASPECT_CHANCE.square + SUN_ASPECT_CHANCE.opposition);
  const aspectLean = aspectPairs >= 3 && harmonious > 0 && harmoniousP < CONCENTRATION_P && harmoniousP <= tenseP
    ? "harmonious"
    : aspectPairs >= 3 && tense > 0 && tenseP < CONCENTRATION_P
      ? "tense"
      : null;

  const triads: AstroTriad[] = members.map((m) => ({
    id: m.id,
    sun: m.profile.sunSign.sign,
    sunLongitude: m.profile.astro?.sun ?? null,
    moon: m.profile.astro?.moon ?? [],
    ascendant: m.profile.astro?.ascendant ?? null,
  }));

  const concentratedElement = concentratedOf(elementCounts, ASTRO_ELEMENTS, SUN_ELEMENT_BASE_RATE, n);
  let innerOuter: GroupAstro["innerOuter"] = null;
  const knownMoon = triads.filter((t) => t.moon.length === 1);
  if (concentratedElement && knownMoon.length >= 3) {
    const moonCounts = { fire: 0, earth: 0, air: 0, water: 0 } as Record<AstroElement, number>;
    for (const t of knownMoon) moonCounts[elementOfSign(t.moon[0])] += 1;
    const inner = concentratedOf(moonCounts, ASTRO_ELEMENTS, SUN_ELEMENT_BASE_RATE, knownMoon.length);
    if (inner && inner !== concentratedElement) innerOuter = { outer: concentratedElement, inner };
  }

  return {
    grid,
    elementCounts,
    modalityCounts,
    topElement: { element: topEl, count: elementCounts[topEl], chance: binomialTail(n, elementCounts[topEl], SUN_ELEMENT_BASE_RATE[topEl]) },
    topModality: { modality: topMod, count: modalityCounts[topMod], chance: binomialTail(n, modalityCounts[topMod], SUN_MODALITY_BASE_RATE[topMod]) },
    concentratedElement,
    concentratedModality: concentratedOf(modalityCounts, ASTRO_MODALITIES, SUN_MODALITY_BASE_RATE, n),
    emptyElements: ASTRO_ELEMENTS.filter((e) => elementCounts[e] === 0),
    aspects,
    patterns: findPatterns(placed.map((m) => m.id), aspects),
    aspectPairs,
    aspectLean,
    triads,
    innerOuter,
  };
}

/**
 * B4 — 오행과 별자리가 같은 말을 하는가.
 *
 * 두 체계가 **이름이 같은 원소**(불·흙·물)를 둘 다 "몰렸다"고 할 때만 선다.
 * 나무·쇠와 바람은 서로 옮길 수 있는 짝이 없다. 억지로 잇지 않는다.
 */
export function astroAgreement(synthesis: GroupSynthesis, astro: GroupAstro): FiveElement | null {
  const el = astro.concentratedElement;
  if (el !== "fire" && el !== "earth" && el !== "water") return null;
  return synthesis.elements.abundant.includes(el as FiveElement) ? (el as FiveElement) : null;
}

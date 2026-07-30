/**
 * 항목별 구조분석 (Life-domain structural analysis): 재물·진로·연애·건강.
 *
 * Driven by the ten-god structure + 용신(favorable element) + day-master
 * strength — NOT random tiers. Outputs language-neutral codes/keys; all text
 * lives in i18n (saju-categories.json).
 */

import { earthlyBranches, heavenlyStems } from "./data";
import { calculateTenGod } from "./logic";
import { FiveElement, type SajuResult, TenGod } from "./types";
import {
  computeDayMasterStrength,
  computeYongsin,
  elementRoles,
  type StrengthResult,
  type YongsinResult,
} from "./yongsin";

export type Level = "strong" | "moderate" | "weak" | "absent";
type RoleKey = "bigyeop" | "insung" | "siksang" | "jaesung" | "gwansung";

export interface CategoryProfile {
  /** governing element-role for this domain */
  role: RoleKey;
  /** governing element (resolved) */
  element: FiveElement;
  level: Level;
  /** is the governing element favorable (용신/희신), unfavorable (기신/구신), or neutral */
  stance: "favorable" | "unfavorable" | "neutral";
  /** i18n keys, e.g. "wealth.strong.favorable" */
  toneKey: string;
  guidanceKey: string;
}

export interface HealthProfile {
  /** the most imbalanced element */
  focusElement: FiveElement;
  imbalance: "excess" | "deficient" | "missing" | "balanced";
  organKey: string; // organ system i18n key
  toneKey: string;
  guidanceKey: string;
}

export interface LifeCategories {
  strength: StrengthResult;
  yongsin: YongsinResult;
  rawRoleCounts: Record<RoleKey, number>;
  elementCounts: Record<FiveElement, number>;
  wealth: CategoryProfile;
  career: CategoryProfile & { mode: "official" | "creative" | "academic" | "peer" };
  love: CategoryProfile & { spousePalaceElement: FiveElement };
  health: HealthProfile;
}

const ORGAN_KEY: Record<FiveElement, string> = {
  [FiveElement.WOOD]: "liver",
  [FiveElement.FIRE]: "heart",
  [FiveElement.EARTH]: "spleen",
  [FiveElement.METAL]: "lung",
  [FiveElement.WATER]: "kidney",
};

function roleOf(tg: TenGod): RoleKey {
  if (tg === TenGod.BI_GYEON || tg === TenGod.GEOP_JAE) return "bigyeop";
  if (tg === TenGod.JEONG_IN || tg === TenGod.PYEON_IN) return "insung";
  if (tg === TenGod.SIK_SIN || tg === TenGod.SANG_GWAN) return "siksang";
  if (tg === TenGod.JEONG_JAE || tg === TenGod.PYEON_JAE) return "jaesung";
  return "gwansung";
}

function levelFromCount(count: number): Level {
  if (count <= 0) return "absent";
  if (count === 1) return "weak";
  if (count <= 3) return "moderate";
  return "strong";
}

function stanceOf(el: FiveElement, y: YongsinResult): CategoryProfile["stance"] {
  if (el === y.yongsin || el === y.huisin) return "favorable";
  if (el === y.gisin || el === y.gusin) return "unfavorable";
  return "neutral";
}

export function analyzeLifeCategories(saju: SajuResult): LifeCategories {
  const strength = computeDayMasterStrength(saju);
  const yongsin = computeYongsin(saju, strength);
  const roles = elementRoles(heavenlyStems[saju.dayMaster].element);

  // Raw (unweighted) role + element counts over the 8 chart characters.
  const rawRoleCounts: Record<RoleKey, number> = {
    bigyeop: 0,
    insung: 0,
    siksang: 0,
    jaesung: 0,
    gwansung: 0,
  };
  const elementCounts: Record<FiveElement, number> = {
    [FiveElement.WOOD]: 0,
    [FiveElement.FIRE]: 0,
    [FiveElement.EARTH]: 0,
    [FiveElement.METAL]: 0,
    [FiveElement.WATER]: 0,
  };
  const chars: { stem: boolean; v: any }[] = [
    { stem: true, v: saju.year.heavenlyStem },
    { stem: false, v: saju.year.earthlyBranch },
    { stem: true, v: saju.month.heavenlyStem },
    { stem: false, v: saju.month.earthlyBranch },
    { stem: true, v: saju.day.heavenlyStem },
    { stem: false, v: saju.day.earthlyBranch },
    { stem: true, v: saju.hour.heavenlyStem },
    { stem: false, v: saju.hour.earthlyBranch },
  ];
  chars.forEach(({ stem, v }, i) => {
    const el = stem ? heavenlyStems[v].element : earthlyBranches[v].element;
    elementCounts[el as FiveElement] += 1;
    // day stem (index 4) is the day master itself
    if (i === 4) {
      rawRoleCounts.bigyeop += 1;
      return;
    }
    rawRoleCounts[roleOf(calculateTenGod(saju.dayMaster, v))] += 1;
  });

  // ── 재물 (財) ──
  const wealthEl = roles.jaesung;
  const wealth: CategoryProfile = (() => {
    const count = rawRoleCounts.jaesung;
    let level = levelFromCount(count);
    // capacity: a strong DM can "carry" wealth; a weak DM with strong wealth is overwhelmed
    const overwhelmed = strength.category === "weak" && level === "strong";
    const stance = stanceOf(wealthEl, yongsin);
    const toneKey = overwhelmed
      ? "wealth.overwhelmed"
      : `wealth.${level}.${stance}`;
    return {
      role: "jaesung",
      element: wealthEl,
      level,
      stance,
      toneKey,
      guidanceKey: `wealth.guide.${stance}`,
    };
  })();

  // ── 진로/직업 ──
  const career = (() => {
    const modes: { mode: "official" | "creative" | "academic" | "peer"; role: RoleKey; n: number }[] = [
      { mode: "official", role: "gwansung", n: rawRoleCounts.gwansung },
      { mode: "creative", role: "siksang", n: rawRoleCounts.siksang },
      { mode: "academic", role: "insung", n: rawRoleCounts.insung },
      { mode: "peer", role: "bigyeop", n: rawRoleCounts.bigyeop },
    ].sort((a, b) => b.n - a.n);
    const top = modes[0];
    const element = roles[top.role];
    const level = levelFromCount(top.n);
    const stance = stanceOf(element, yongsin);
    return {
      role: top.role,
      element,
      level,
      stance,
      mode: top.mode,
      toneKey: `career.${top.mode}`,
      guidanceKey: `career.guide.${top.mode}`,
    };
  })();

  // ── 연애/결혼 ──
  const love = (() => {
    const spouseRole: RoleKey =
      saju.gender === "male" ? "jaesung" : "gwansung";
    const element = roles[spouseRole];
    const count = rawRoleCounts[spouseRole];
    const level = levelFromCount(count);
    const stance = stanceOf(element, yongsin);
    const spousePalaceElement = earthlyBranches[saju.day.earthlyBranch]
      .element as FiveElement;
    return {
      role: spouseRole,
      element,
      level,
      stance,
      spousePalaceElement,
      toneKey: `love.${level}.${stance}`,
      guidanceKey: `love.guide.${stance}`,
    };
  })();

  // ── 건강 (오행 균형) ──
  const health = ((): HealthProfile => {
    const entries = (Object.keys(elementCounts) as FiveElement[]).map((el) => ({
      el,
      n: elementCounts[el],
    }));
    const max = entries.reduce((a, b) => (b.n > a.n ? b : a));
    const min = entries.reduce((a, b) => (b.n < a.n ? b : a));
    let focusElement: FiveElement;
    let imbalance: HealthProfile["imbalance"];
    if (min.n === 0) {
      focusElement = min.el;
      imbalance = "missing";
    } else if (max.n - min.n >= 3) {
      focusElement = max.el;
      imbalance = "excess";
    } else if (max.n - min.n >= 2) {
      focusElement = min.el;
      imbalance = "deficient";
    } else {
      focusElement = max.el;
      imbalance = "balanced";
    }
    return {
      focusElement,
      imbalance,
      organKey: ORGAN_KEY[focusElement],
      toneKey: `health.${imbalance}`,
      guidanceKey: `health.guide.${imbalance}`,
    };
  })();

  return {
    strength,
    yongsin,
    rawRoleCounts,
    elementCounts,
    wealth,
    career,
    love,
    health,
  };
}

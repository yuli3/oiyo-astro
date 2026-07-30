/**
 * 용신/기신 엔진 (Yongsin / favorable & unfavorable element engine)
 *
 * Implements the classic 扶抑用神 (부억용신, "support-suppress") method, the most
 * widely used school for picking a chart's favorable element:
 *   - 신강 (strong day master) → 용신 drains/controls the self: 식상 → 재성 → 관성
 *   - 신약 (weak day master)   → 용신 supports the self: 인성 → 비겁
 *   - 중화 (balanced)          → 용신 tempers the dominant element
 *
 * This is deterministic and pure (testable). It reuses the existing element
 * cycles and ten-god classifier. It is ONE defensible school among several
 * (조후/병약/통관 etc.) — surfaced to users with that caveat in the UI.
 */

import { earthlyBranches, heavenlyStems } from "./data";
import { calculateTenGod } from "./logic";
import { FiveElement, type SajuResult, TenGod } from "./types";

const E = FiveElement;

// productive(생): E generates productive[E]; inverse gives the producer (인성).
const PRODUCTIVE: Record<FiveElement, FiveElement> = {
  [E.WOOD]: E.FIRE,
  [E.FIRE]: E.EARTH,
  [E.EARTH]: E.METAL,
  [E.METAL]: E.WATER,
  [E.WATER]: E.WOOD,
};
// destructive(극): E controls destructive[E]; inverse gives the controller (관성).
const DESTRUCTIVE: Record<FiveElement, FiveElement> = {
  [E.WOOD]: E.EARTH,
  [E.FIRE]: E.METAL,
  [E.EARTH]: E.WATER,
  [E.METAL]: E.WOOD,
  [E.WATER]: E.FIRE,
};
const inverse = (map: Record<FiveElement, FiveElement>, target: FiveElement) =>
  (Object.keys(map) as FiveElement[]).find((k) => map[k] === target)!;

/** The five element-roles relative to a day-master element. */
export interface ElementRoles {
  bigyeop: FiveElement; // 비겁 (same as DM)
  insung: FiveElement; // 인성 (generates DM)
  siksang: FiveElement; // 식상 (DM generates)
  jaesung: FiveElement; // 재성 (DM controls)
  gwansung: FiveElement; // 관성 (controls DM)
}

export function elementRoles(dm: FiveElement): ElementRoles {
  return {
    bigyeop: dm,
    insung: inverse(PRODUCTIVE, dm), // X where X→DM
    siksang: PRODUCTIVE[dm],
    jaesung: DESTRUCTIVE[dm],
    gwansung: inverse(DESTRUCTIVE, dm), // X where X→克→DM
  };
}

export type StrengthCategory = "strong" | "balanced" | "weak"; // 신강/중화/신약

export interface StrengthResult {
  category: StrengthCategory;
  ratio: number; // support / (support + drain), 0..1
  supportScore: number; // 비겁 + 인성 (weighted)
  drainScore: number; // 식상 + 재성 + 관성 (weighted)
  roleCounts: Record<keyof ElementRoles, number>; // weighted counts per role
}

// Position weights: 월령(month branch) dominates; 일지(day branch) strong.
const POS_WEIGHTS = {
  yearStem: 1,
  yearBranch: 1,
  monthStem: 1.2,
  monthBranch: 3, // 월령 득령 가중
  dayBranch: 2, // 득지 (day stem = DM itself, not counted as support char)
  hourStem: 1,
  hourBranch: 1,
};

function roleOfTenGod(tg: TenGod): keyof ElementRoles {
  switch (tg) {
    case TenGod.BI_GYEON:
    case TenGod.GEOP_JAE:
      return "bigyeop";
    case TenGod.JEONG_IN:
    case TenGod.PYEON_IN:
      return "insung";
    case TenGod.SIK_SIN:
    case TenGod.SANG_GWAN:
      return "siksang";
    case TenGod.JEONG_JAE:
    case TenGod.PYEON_JAE:
      return "jaesung";
    case TenGod.JEONG_GWAN:
    case TenGod.PYEON_GWAN:
      return "gwansung";
  }
}

/**
 * Day-master strength via weighted role counts of the 8 chart characters
 * (4 stems + 4 branches' main hidden stem), 월령 weighted heavily.
 */
export function computeDayMasterStrength(saju: SajuResult): StrengthResult {
  const dm = saju.dayMaster;
  const roleCounts: Record<keyof ElementRoles, number> = {
    bigyeop: 0,
    insung: 0,
    siksang: 0,
    jaesung: 0,
    gwansung: 0,
  };

  const add = (char: Parameters<typeof calculateTenGod>[1], w: number) => {
    const tg = calculateTenGod(dm, char);
    roleCounts[roleOfTenGod(tg)] += w;
  };

  add(saju.year.heavenlyStem, POS_WEIGHTS.yearStem);
  add(saju.year.earthlyBranch, POS_WEIGHTS.yearBranch);
  add(saju.month.heavenlyStem, POS_WEIGHTS.monthStem);
  add(saju.month.earthlyBranch, POS_WEIGHTS.monthBranch);
  add(saju.day.earthlyBranch, POS_WEIGHTS.dayBranch);
  add(saju.hour.heavenlyStem, POS_WEIGHTS.hourStem);
  add(saju.hour.earthlyBranch, POS_WEIGHTS.hourBranch);

  // Day stem IS the day master → inherent self presence (counts as 비겁/self).
  const SELF_WEIGHT = 1.5;
  roleCounts.bigyeop += SELF_WEIGHT;

  const supportScore = roleCounts.bigyeop + roleCounts.insung;
  const drainScore =
    roleCounts.siksang + roleCounts.jaesung + roleCounts.gwansung;
  const ratio = supportScore / (supportScore + drainScore || 1);

  let category: StrengthCategory;
  if (ratio >= 0.55) category = "strong";
  else if (ratio <= 0.42) category = "weak";
  else category = "balanced";

  return { category, ratio, supportScore, drainScore, roleCounts };
}

export type YongsinReason =
  | "strong-drain" // 신강 → 설기(식상)
  | "strong-wealth" // 신강 → 재성
  | "strong-control" // 신강 → 관성
  | "weak-resource" // 신약 → 인성
  | "weak-peer" // 신약 → 비겁
  | "balanced-temper"; // 중화 → 통관/조후

export interface YongsinResult {
  yongsin: FiveElement; // 용신 (most favorable)
  huisin: FiveElement; // 희신 (secondary favorable — generates 용신)
  gisin: FiveElement; // 기신 (unfavorable)
  gusin: FiveElement; // 구신 (secondary unfavorable — generates 기신)
  reason: YongsinReason;
  method: "buyok"; // 부억용신
  roleOfYongsin: keyof ElementRoles;
  strength: StrengthResult;
}

/**
 * Pick the favorable element. Within the candidate set, prefer a role that has
 * some presence (root) so it can actually function; fall back to priority order.
 */
export function computeYongsin(
  saju: SajuResult,
  strength?: StrengthResult,
): YongsinResult {
  const st = strength ?? computeDayMasterStrength(saju);
  const roles = elementRoles(heavenlyStems[saju.dayMaster].element);
  const c = st.roleCounts;

  let role: keyof ElementRoles;
  let reason: YongsinReason;

  if (st.category === "strong") {
    // Drain/suppress. Prefer to address the CAUSE of strength.
    // If 인성-heavy → use 재성 (재극인). If 비겁-heavy → use 관성 (관제겁). Else 식상(설기).
    if (c.insung >= c.bigyeop && c.insung > 0) {
      role = "jaesung";
      reason = "strong-wealth";
    } else if (c.bigyeop > c.insung) {
      role = "gwansung";
      reason = "strong-control";
    } else {
      role = "siksang";
      reason = "strong-drain";
    }
    // Prefer a candidate with root; else keep chosen.
    const order: (keyof ElementRoles)[] = ["siksang", "jaesung", "gwansung"];
    if (c[role] === 0) {
      const rooted = order.find((r) => c[r] > 0);
      if (rooted) {
        role = rooted;
        reason =
          rooted === "siksang"
            ? "strong-drain"
            : rooted === "jaesung"
              ? "strong-wealth"
              : "strong-control";
      }
    }
  } else if (st.category === "weak") {
    // Support. 인성 primary (prints DM, controls 식상); else 비겁.
    role = "insung";
    reason = "weak-resource";
    if (c.insung === 0 && c.bigyeop > 0) {
      // already has peers; resource still preferred, but if none, lean peer
    }
    if (c.insung === 0 && c.gwansung > c.jaesung) {
      // heavy control with no resource → still 인성 ideal (통관) — keep
    }
  } else {
    // balanced → temper the dominant role: pick the element controlling the
    // strongest drain/support imbalance. Default to 식상 if support-leaning,
    // else 인성.
    if (st.ratio >= 0.5) {
      role = "siksang";
      reason = "balanced-temper";
    } else {
      role = "insung";
      reason = "balanced-temper";
    }
  }

  const yongsin = roles[role];
  const huisin = inverse(PRODUCTIVE, yongsin); // element that generates 용신
  // 기신 = the role opposing the need. Key this off the role we actually chose,
  // not off st.category: a "balanced" chart with ratio < 0.5 takes 인성 as its
  // 용신, and branching on category alone then also named 인성 the 기신 — the
  // same element as both the favourable and the unfavourable one. The five roles
  // map onto the five distinct elements, so opposing the chosen direction can
  // never collide with 용신.
  const strengthensDayMaster = role === "insung" || role === "bigyeop";
  let gisin: FiveElement;
  if (strengthensDayMaster) {
    // 용신이 일간을 돕는다면, 힘을 빼는 오행 중 가장 강한 것이 기신
    const drainRole = (["jaesung", "gwansung", "siksang"] as const).sort(
      (a, b) => c[b] - c[a],
    )[0];
    gisin = roles[drainRole];
  } else {
    // 용신이 힘을 뺀다면, 일간을 더 강하게 만드는 오행이 기신
    gisin = c.insung >= c.bigyeop ? roles.insung : roles.bigyeop;
  }
  const gusin = inverse(PRODUCTIVE, gisin);

  return {
    yongsin,
    huisin,
    gisin,
    gusin,
    reason,
    method: "buyok",
    roleOfYongsin: role,
    strength: st,
  };
}

/**
 * Language-neutral favorable attributes keyed by element. Text/labels come from
 * i18n (saju-yongsin.json); these are codes the UI maps to localized strings.
 */
export const YONGSIN_ATTRS: Record<
  FiveElement,
  {
    colorHex: string;
    colorKey: string;
    directionKey: string;
    numbers: number[];
    seasonKey: string;
    careerKeys: string[];
    foodKey: string;
  }
> = {
  [E.WOOD]: {
    colorHex: "#10b981",
    colorKey: "green",
    directionKey: "east",
    numbers: [3, 8],
    seasonKey: "spring",
    careerKeys: ["education", "publishing", "design", "wellness"],
    foodKey: "wood",
  },
  [E.FIRE]: {
    colorHex: "#ef4444",
    colorKey: "red",
    directionKey: "south",
    numbers: [2, 7],
    seasonKey: "summer",
    careerKeys: ["media", "marketing", "entertainment", "it"],
    foodKey: "fire",
  },
  [E.EARTH]: {
    colorHex: "#f59e0b",
    colorKey: "yellow",
    directionKey: "center",
    numbers: [5, 10],
    seasonKey: "transition",
    careerKeys: ["realestate", "agriculture", "consulting", "civil"],
    foodKey: "earth",
  },
  [E.METAL]: {
    colorHex: "#d4d4d8",
    colorKey: "white",
    directionKey: "west",
    numbers: [4, 9],
    seasonKey: "autumn",
    careerKeys: ["finance", "law", "engineering", "medicine"],
    foodKey: "metal",
  },
  [E.WATER]: {
    colorHex: "#3b82f6",
    colorKey: "black",
    directionKey: "north",
    numbers: [1, 6],
    seasonKey: "winter",
    careerKeys: ["trade", "logistics", "research", "hospitality"],
    foodKey: "water",
  },
};

/**
 * Dev-only self-check (not run in production). Verifies the 부억 direction:
 * strong → yongsin must be a draining role; weak → a supporting role.
 */
export function __verifyYongsin(saju: SajuResult): boolean {
  const y = computeYongsin(saju);
  const drainRoles: (keyof ElementRoles)[] = [
    "siksang",
    "jaesung",
    "gwansung",
  ];
  const supportRoles: (keyof ElementRoles)[] = ["insung", "bigyeop"];
  if (y.strength.category === "strong")
    return drainRoles.includes(y.roleOfYongsin);
  if (y.strength.category === "weak")
    return supportRoles.includes(y.roleOfYongsin);
  return true;
}

// Re-export for convenience
export { heavenlyStems, earthlyBranches };

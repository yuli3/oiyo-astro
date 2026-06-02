import { ConsumptionResult } from "@/lib/ontology/consumption/types";
import { OntologyProfile } from "@/lib/ontology/types";
import { ConflictResponseResult } from "@/lib/resonance/conflict-response/types";

import {
  ElementType,
  getDailyLuckStatus,
  getLuckAttributes,
} from "../data-layer/shards/luck-engine";

// TODO : Need to support 6+ languages from @/i18n
export interface CorrelationInsight {
  advice: string;
  domainA: string; // e.g., 'Saju', 'MBTI'
  domainB: string; // e.g., 'Consumption', 'Conflict'
  id: string;
  insight: string;
  resonanceScore: number; // 0-100 indicating how strongly these two traits resonate/clash
}

/**
 * The Correlation Engine analyzing relationships between different ontological domains.
 * It looks for patterns where a user's innate nature (Saju/MBTI) influences their behaviors (Consumption/Conflict).
 */
export class CorrelationEngine {
  static analyze(
    profile: null | OntologyProfile,
    consumption?: ConsumptionResult | null,
    conflict?: ConflictResponseResult | null,
    lang: "en" | "ko" = "ko",
  ): CorrelationInsight[] {
    const insights: CorrelationInsight[] = [];

    if (!profile) return insights;

    // 1. Saju (Five Elements) + Consumption
    // We try to access the Saju element from the profile.
    // Note: Type assertion used as deep path might vary in implementation versions
    const universal = profile.roots?.universal as any;
    if (universal?.saju?.element && consumption) {
      const element = universal.saju.element; // wood, fire, earth, metal, water
      const spendingStyle = consumption.primaryStyle; // value_oriented, emotional_satisfaction, etc.

      insights.push(
        this.correlateSajuAndConsumption(element, spendingStyle, lang),
      );
    }

    // 2. MBTI + Conflict Response
    if (profile.branches?.mbti?.type && conflict) {
      const mbti = profile.branches.mbti.type;
      const conflictStyle = conflict.primaryStyle; // competing, avoiding, etc.

      insights.push(this.correlateMBTIAndConflict(mbti, conflictStyle, lang));
    }

    // 3. Saju + MBTI
    if (profile.roots?.universal && profile.branches?.mbti?.type) {
      // @ts-ignore
      const element = profile.roots.universal.saju?.element;
      if (element) {
        insights.push(
          this.correlateSajuAndMBTI(element, profile.branches.mbti.type, lang),
        );
      }
    }

    return insights;
  }

  /**
   * Calculates dynamic Fortune metadata (Lucky Color, Direction, Items)
   * based on the user's Favorable Element and the Current Day's energy.
   */
  static calculateDailyFortune(
    favorableElement: ElementType,
    userStem: string,
    dayStem: string,
  ) {
    const dailyLuck = getDailyLuckStatus(userStem, dayStem);
    const attributes = getLuckAttributes(favorableElement);

    return {
      ...attributes,
      harmonyScore: dailyLuck.score,
      status: dailyLuck.status,
    };
  }

  private static correlateMBTIAndConflict(
    mbti: string,
    conflict: string,
    lang: "en" | "ko",
  ): CorrelationInsight {
    const isThinking = mbti.includes("T");
    const isFeeling = mbti.includes("F");

    let resonance = 70;
    let insight = "";
    let advice = "";

    if (isThinking && conflict === "competing") {
      insight =
        "논리적 사고(T)와 경쟁적 대응이 만나 강력한 승부사 기질을 만듭니다.";
      advice = "때로는 논리보다 감정이 더 큰 문제를 해결함을 기억하세요.";
      resonance = 95;
    } else if (isFeeling && conflict === "accommodating") {
      insight = "공감 능력(F)이 수용적 태도로 이어져 평화의 사도가 되었습니다.";
      advice = "당신의 희생이 당연해지지 않도록 스스로를 먼저 돌보세요.";
      resonance = 95;
    } else if (isThinking && conflict === "accommodating") {
      insight =
        "논리적으로는 반대하지만, 관계를 위해 전략적으로 수용하는 모습입니다.";
      advice = "이것이 진정한 배려인지, 갈등 회피인지 스스로에게 물어보세요.";
      resonance = 60;
    } else {
      insight = `${mbti}의 특성과 ${conflict} 스타일이 복합적으로 작용합니다.`;
      advice = "상황에 따라 유연하게 대처하는 당신만의 지혜가 있습니다.";
    }

    return {
      advice,
      domainA: "MBTI",
      domainB: "Conflict Response",
      id: "mbti_conflict",
      insight,
      resonanceScore: resonance,
    };
  }

  private static correlateSajuAndConsumption(
    element: string,
    spending: string,
    lang: "en" | "ko",
  ): CorrelationInsight {
    // Simplified logic: Real logic would be more complex
    const isHarmonious =
      (element === "wood" && spending === "value_oriented") || // Growing value
      (element === "fire" && spending === "impulsive") || // Burning usage
      (element === "earth" && spending === "sustainable") || // Grounded
      (element === "metal" && spending === "prestige_seeking") || // Shiny/Status
      (element === "water" && spending === "emotional_satisfaction"); // Flowing feelings

    const score = isHarmonious ? 90 : 40;

    const descriptions: Record<string, { advice: string; insight: string }> = {
      earth_sustainable: {
        advice: "당신의 안정감은 타인에게도 든든한 기반이 되어줍니다.",
        insight: "단단한 흙의 기운이 지속 가능한 소비로 이어졌습니다.",
      },
      fire_impulsive: {
        advice: "타오르는 열정을 잠시 식히고 '3일의 법칙'을 실천해보세요.",
        insight: "확산하는 불의 기운이 즉흥적 소비로 나타납니다.",
      },
      metal_prestige: {
        advice: "물건의 가격보다 그것이 품은 장인의 정신을 먼저 보십시오.",
        insight: "결실의 기운(금)이 명예와 품격을 추구합니다.",
      },
      water_emotional: {
        advice:
          "소비로 감정을 채우기보다, 감정이 흘러갈 예술적 통로를 찾으세요.",
        insight: "흐르는 물의 기운이 감정적 만족을 중시합니다.",
      },
      // Fallback/Clash
      wood_impulsive: {
        advice: "미래를 위한 씨앗 자금은 건드리지 않는 원칙을 세우세요.",
        insight:
          "나무가 불에 타버리듯, 성장의 에너지가 소비로 소진될 수 있습니다.",
      },
      wood_value: {
        advice:
          "자기 개발에 쓰는 돈은 결코 사라지지 않는 당신의 뿌리가 됩니다.",
        insight: "성장의 기운(목)이 가치 투자 성향으로 발현되었습니다.",
      },
      // ... Add more combinations as needed
    };

    const key = `${element}_${spending.replace("_oriented", "").replace("_seeking", "").replace("_satisfaction", "")}`;
    const content = descriptions[key] || {
      advice: "내면의 기운과 소비 행동 사이의 균형점을 관찰해보세요.",
      insight: `${element}의 기운과 ${spending} 성향이 독특한 화학 작용을 일으킵니다.`,
    };

    return {
      advice: content.advice,
      domainA: "Universal Element",
      domainB: "Consumption",
      id: "saju_consumption",
      insight: content.insight,
      resonanceScore: score,
    };
  }

  private static correlateSajuAndMBTI(
    element: string,
    mbti: string,
    lang: "en" | "ko",
  ): CorrelationInsight {
    const isRational = mbti.includes("T");
    const isIntuitive = mbti.includes("N");
    const isExtravert = mbti.includes("E");

    let resonance = 75;
    let insight = "";
    let advice = "";

    const elementTraits: Record<string, string> = {
      earth: "Stability",
      fire: "Passion",
      metal: "Principle",
      water: "Wisdom",
      wood: "Growth",
    };

    // Default Insight
    insight =
      lang === "ko"
        ? `${elementTraits[element] || element}의 기운과 ${mbti} 성향이 공명합니다.`
        : `The energy of ${elementTraits[element] || element} resonates with ${mbti}.`;

    if (element === "metal" && isRational) {
      resonance = 95;
      insight =
        lang === "ko"
          ? "금(金)의 결단력과 이성적 사고(T)가 만나 완벽한 논리적 구조를 형성합니다."
          : "The decisiveness of Metal meets Rational thinking to form a perfect logical structure.";
      advice =
        lang === "ko"
          ? "너무 날카로운 잣대를 타인에게 들이대지 않도록 유의하세요."
          : "Be careful not to judge others too sharply.";
    } else if (element === "water" && isIntuitive) {
      resonance = 92;
      insight =
        lang === "ko"
          ? "지혜로운 물(水)의 기운이 직관(N)을 만나 깊은 통찰력을 발휘합니다."
          : "The wisdom of Water meets Intuition to create deep insight.";
      advice =
        lang === "ko"
          ? "생각의 바다에 너무 깊이 잠기지 말고 가끔은 수면 위로 올라오세요."
          : "Don't drown in your thoughts; come up for air sometimes.";
    } else if (element === "fire" && isExtravert) {
      resonance = 88;
      insight =
        lang === "ko"
          ? "타오르는 불(火)과 외향성(E)이 만나 폭발적인 에너지를 뿜어냅니다."
          : "Blazing Fire meets Extraversion to release explosive energy.";
      advice =
        lang === "ko"
          ? "당신의 빛이 누군가에게는 너무 뜨거울 수 있음을 기억하세요."
          : "Remember that your light might be too hot for some.";
    } else if (element === "earth" && mbti.includes("J")) {
      resonance = 90;
      insight =
        lang === "ko"
          ? "단단한 흙(土)의 기운이 계획성(J)을 만나 흔들리지 않는 기반이 됩니다."
          : "The solid Earth energy meets Planning (J) to create an unshakable foundation.";
      advice =
        lang === "ko"
          ? "변화를 두려워하기보다 더 큰 산을 쌓을 기회로 삼으세요."
          : "See change as an opportunity to build a bigger mountain, not a threat.";
    } else if (element === "wood" && mbti.includes("P")) {
      resonance = 85;
      insight =
        lang === "ko"
          ? "자라나는 나무(木)의 기운이 유연함(P)을 만나 자유롭게 뻗어 나갑니다."
          : "The growing Wood energy meets Flexibility (P) to branch out freely.";
      advice =
        lang === "ko"
          ? "가지가 너무 얇게 흩어지지 않도록 중심 줄기를 잡으세요."
          : "Keep your main trunk strong so your branches don't spread too thin.";
    } else {
      advice =
        lang === "ko"
          ? "서로 다른 두 기운의 조화가 당신만의 독특한 매력을 만듭니다."
          : "The harmony of these different forces creates your unique charm.";
    }

    return {
      advice,
      domainA: "Universal Element",
      domainB: "MBTI",
      id: "saju_mbti",
      insight,
      resonanceScore: resonance,
    };
  }
}

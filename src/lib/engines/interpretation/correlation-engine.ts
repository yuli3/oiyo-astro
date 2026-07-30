import type {
  CorrelationInsight,
  SixLangString,
  UniversalInterpretationResult,
} from "./engine.contract";

/**
 * CorrelationEngine
 * Detects patterns and synergies across multiple astrology systems.
 */
export class CorrelationEngine {
  /**
   * Generates localized insights based on cross-system synergies.
   */
  public static detectCorrelations(
    results: UniversalInterpretationResult,
  ): CorrelationInsight[] {
    const insights: CorrelationInsight[] = [];

    // 1. Elemental Synergy: Fire
    const fireSynergy = this.checkFireSynergy(results);
    if (fireSynergy) insights.push(fireSynergy);

    // 2. Leadership Synergy
    const leadershipSynergy = this.checkLeadershipSynergy(results);
    if (leadershipSynergy) insights.push(leadershipSynergy);

    // 3. Spiritual Depth Synergy
    const spiritualSynergy = this.checkSpiritualSynergy(results);
    if (spiritualSynergy) insights.push(spiritualSynergy);

    return insights;
  }

  private static checkFireSynergy(
    results: UniversalInterpretationResult,
  ): CorrelationInsight | null {
    const isSajuFire = results.saju?.elementalPattern?.pattern.includes("Fire");
    const isTarotSun =
      results.tarot?.id === "the_sun" || results.tarot?.suit === "Wands";

    if (isSajuFire && isTarotSun) {
      return {
        category: "vitality",
        narrative: {
          en: "Double Fire Energy: Your Saju fire element resonates perfectly with your Tarot results, indicating a period of high visibility, passion, and creative breakthrough.",
          es: "Energía de Fuego Doble: Su elemento fuego en Saju resuena con el Tarot, indicando gran pasión y visibilidad.",
          fr: "Double Énergie de Feu : Votre élément feu en Saju résonne avec le Tarot, indiquant une grande passion et visibilité.",
          ja: "二重の火のエネルギー：四柱推命の火の要素がタロットの結果と完璧に共鳴しています。これは、高い注目度、情熱、そして創造的な突破口の時期であることを示しています。",
          ko: "이중 화(火) 기운: 사주의 화 기운이 타로 결과와 완벽하게 공명합니다. 이는 높은 가시성, 열정, 그리고 창의적 돌파구의 시기임을 나타냅니다.",
          zh: "双重火能：你的八字火元素与塔罗结果完美共鸣，预示着一个高曝光度、激情和创造性突破的时期。",
        },
        strength: 8,
        systems: ["Saju", "Tarot"],
      };
    }
    return null;
  }

  private static checkLeadershipSynergy(
    results: UniversalInterpretationResult,
  ): CorrelationInsight | null {
    const isZiWeiEmperor =
      results.ziwei?.mainStarNarrative.en.includes("Emperor");
    const isSajuLeader = results.saju?.tenGodProfile?.dominant === "Gwan-Seong";

    if (isZiWeiEmperor && isSajuLeader) {
      return {
        category: "career",
        narrative: {
          en: "Regal Authority: Both Zi Wei and Saju confirm a strong leadership profile. You are naturally equipped to manage large responsibilities and command respect.",
          es: "Autoridad Real: Tanto Zi Wei como Saju confirman un fuerte liderazgo.",
          fr: "Autorité Royale : Zi Wei et Saju confirment tous deux un leadership fort.",
          ja: "帝王の権威：紫微斗数と四柱推命の両方が強力なリーダーシップを裏付けています。あなたは大きな責任を管理し、尊敬を集める天性の資質を備えています。",
          ko: "제왕적 권위: 자미두수와 사주 모두 강력한 리더십 프로필을 확인합니다. 당신은 큰 책임을 관리하고 존경을 이끌어낼 수 있는 타고난 능력을 갖추고 있습니다.",
          zh: "王者权威：紫微斗数和八字都确认了强大的领导风范。你天赋异禀，能够承担重大责任并赢得尊重。",
        },
        strength: 9,
        systems: ["ZiWei", "Saju"],
      };
    }
    return null;
  }

  private static checkSpiritualSynergy(
    results: UniversalInterpretationResult,
  ): CorrelationInsight | null {
    const isKabbalahHigh =
      results.kabbalah?.sephiraNarrative.en.includes("Keter") ||
      results.kabbalah?.sephiraNarrative.en.includes("Chokhmah");
    const isVedicBright =
      results.vedic?.nakshatraNarrative.en.includes("Chitra") ||
      results.vedic?.nakshatraNarrative.en.includes("Pushya");

    if (isKabbalahHigh && isVedicBright) {
      return {
        category: "spiritual",
        narrative: {
          en: "Celestial Clarity: The alignment of high Sephirot and bright Nakshatras suggests a moment of profound spiritual awakening and intellectual brilliance.",
          es: "Claridad Celestial: Alineación espiritual profunda.",
          fr: "Clarté Céleste : Alignement spirituel profond.",
          ja: "天上の明晰さ：高次のセフィラと輝かしいナクシャトラの整列は、深い霊的な目覚めと知的な輝きの瞬間を示唆しています。",
          ko: "천상의 명료함: 고차원 세피라와 밝은 낙샤트라의 정렬은 심오한 영적 각성과 지적 명석함의 순간을 암시합니다.",
          zh: "天际清晰：高阶塞非洛与明亮的纳沙特拉相合，暗示着深刻的灵性觉醒和智力辉煌的时刻。",
        },
        strength: 7,
        systems: ["Kabbalah", "Vedic"],
      };
    }
    return null;
  }
}

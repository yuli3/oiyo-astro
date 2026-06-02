/**
 * Smart Correlation Engine
 * Generates heuristic-based insights by connecting results across different Hubs
 */

export interface CorrelationInsight {
  category: "career" | "financial" | "growth" | "relationships" | "wellness";
  confidence: "high" | "low" | "medium";
  description: string;
  icon: string;
  id: string;
  sources: string[];
  title: string;
}

interface UserProfile {
  age?: number;
  colorTone?: string;
  enneagram?: string;
  lifeStage?: "20s" | "30s" | "40s+";
  mbti?: string;
  moneyType?: string;
  zodiac?: string;
}

export function generateCorrelations(
  profile: UserProfile,
): CorrelationInsight[] {
  const insights: CorrelationInsight[] = [];

  // MBTI + Money Habits
  if (profile.mbti && profile.moneyType) {
    const mbtiFirst = profile.mbti.charAt(0);

    if (mbtiFirst === "I" && profile.moneyType === "saver") {
      insights.push({
        category: "financial",
        confidence: "high",
        description:
          "Your introverted nature aligns perfectly with your saving habits. You likely find comfort in financial security and prefer low-risk, steady growth strategies.",
        icon: "🏦",
        id: "mbti-money-1",
        sources: ["MBTI", "Money Habits"],
        title: "Introverted Saver Synergy",
      });
    }

    if (mbtiFirst === "E" && profile.moneyType === "spender") {
      insights.push({
        category: "financial",
        confidence: "high",
        description:
          'Your extroverted energy often translates to experiential spending. Consider setting aside an "experience fund" while automating savings to balance enjoyment with security.',
        icon: "💸",
        id: "mbti-money-2",
        sources: ["MBTI", "Money Habits"],
        title: "Extroverted Spender Pattern",
      });
    }

    // Thinking vs Feeling + Money
    const thinkingFeeling = profile.mbti.charAt(2);
    if (thinkingFeeling === "T" && profile.moneyType === "investor") {
      insights.push({
        category: "financial",
        confidence: "high",
        description:
          "Your logical, data-driven approach (T) makes you naturally suited for investment analysis. You likely excel at removing emotion from financial decisions.",
        icon: "📊",
        id: "mbti-money-3",
        sources: ["MBTI", "Money Habits"],
        title: "Analytical Investor Advantage",
      });
    }
  }

  // MBTI + Zodiac (Career timing)
  if (profile.mbti && profile.zodiac) {
    const judgingPerceiving = profile.mbti.charAt(3);
    const fireZodiacs = ["Aries", "Leo", "Sagittarius"];

    if (judgingPerceiving === "J" && fireZodiacs.includes(profile.zodiac)) {
      insights.push({
        category: "career",
        confidence: "medium",
        description:
          "Your fire sign passion combined with Judging preference creates a powerful execution engine. You thrive when you can plan bold moves and execute them systematically.",
        icon: "🔥",
        id: "mbti-zodiac-1",
        sources: ["MBTI", "Zodiac"],
        title: "Structured Fire Energy",
      });
    }
  }

  // Enneagram + MBTI (Growth path)
  if (profile.enneagram && profile.mbti) {
    if (profile.enneagram === "3" && profile.mbti.includes("E")) {
      insights.push({
        category: "wellness",
        confidence: "high",
        description:
          'Type 3 Achievers who are extroverted risk burnout from over-committing. Your growth path involves learning to say "no" and valuing rest as much as achievement.',
        icon: "⚖️",
        id: "enneagram-mbti-1",
        sources: ["Enneagram", "MBTI"],
        title: "Achiever Extrovert Caution",
      });
    }

    if (profile.enneagram === "5" && profile.mbti.includes("I")) {
      insights.push({
        category: "growth",
        confidence: "high",
        description:
          "As a Type 5 Investigator and an Introvert, you have exceptional depth. Your challenge is integration—sharing your insights with others rather than hoarding knowledge.",
        icon: "🧠",
        id: "enneagram-mbti-2",
        sources: ["Enneagram", "MBTI"],
        title: "Double Introversion Insight",
      });
    }
  }

  // Personal Color + Money Habits
  if (profile.colorTone && profile.moneyType) {
    if (profile.colorTone.includes("Warm") && profile.moneyType === "spender") {
      insights.push({
        category: "financial",
        confidence: "medium",
        description:
          "Warm-toned individuals often gravitate toward vibrant, experiential purchases. Channel this into collecting meaningful items or experiences that appreciate in value.",
        icon: "🎨",
        id: "color-money-1",
        sources: ["Personal Color", "Money Habits"],
        title: "Warm Tone Spending Harmony",
      });
    }
  }

  // MBTI Career + Money (Investment style)
  if (profile.mbti && profile.moneyType) {
    const sensingIntuition = profile.mbti.charAt(1);

    if (sensingIntuition === "N" && profile.moneyType === "investor") {
      insights.push({
        category: "financial",
        confidence: "high",
        description:
          "Your Intuitive (N) preference means you see patterns and future possibilities. You may excel at growth investing and emerging markets, but balance this with some stable assets.",
        icon: "🔮",
        id: "mbti-money-4",
        sources: ["MBTI", "Money Habits"],
        title: "Intuitive Investor Strategy",
      });
    }

    if (sensingIntuition === "S" && profile.moneyType === "saver") {
      insights.push({
        category: "financial",
        confidence: "high",
        description:
          "Your Sensing (S) preference values concrete, proven methods. You likely prefer traditional savings vehicles and may benefit from exploring index funds for steady growth.",
        icon: "🏛️",
        id: "mbti-money-5",
        sources: ["MBTI", "Money Habits"],
        title: "Sensing Saver Reliability",
      });
    }
  }

  // === LIFE-STAGE AWARE CORRELATIONS ===

  // 20s + MBTI + Money
  if (profile.lifeStage === "20s" && profile.mbti && profile.moneyType) {
    if (profile.moneyType === "saver") {
      insights.push({
        category: "financial",
        confidence: "high",
        description:
          "20대에 저축 습관이 있다는 건 엄청난 강점이야. 지금부터 공격적으로 투자하면 복리의 마법을 최대한 활용할 수 있어. 30년 후 너는 부자야.",
        icon: "🚀",
        id: "lifestage-20s-saver",
        sources: ["Age", "Money Habits"],
        title: "20대 저축가의 황금기",
      });
    }

    if (profile.mbti.includes("N")) {
      insights.push({
        category: "career",
        confidence: "high",
        description:
          "20대는 실패해도 되는 시기야. 네 직관(N)을 믿고 다양한 시도를 해봐. 지금 쌓은 경험이 30대의 자산이 돼.",
        icon: "🎯",
        id: "lifestage-20s-intuitive",
        sources: ["Age", "MBTI"],
        title: "20대 직관형의 실험 시기",
      });
    }
  }

  // 30s + Career + Money
  if (profile.lifeStage === "30s" && profile.mbti) {
    if (profile.mbti.charAt(3) === "J") {
      insights.push({
        category: "career",
        confidence: "high",
        description:
          "30대는 20대의 시행착오를 바탕으로 확실한 방향을 잡을 때야. 네 계획성(J)을 활용해서 5년 로드맵을 세워봐. 지금이 커리어 도약의 적기야.",
        icon: "📈",
        id: "lifestage-30s-judging",
        sources: ["Age", "MBTI"],
        title: "30대 계획형의 실행력",
      });
    }

    if (profile.moneyType === "investor") {
      insights.push({
        category: "financial",
        confidence: "high",
        description:
          "30대는 공격과 안정의 균형이 중요해. 70%는 안정적 자산(인덱스펀드), 30%는 성장주에 투자하는 게 좋아. 은퇴까지 30년 남았으니 아직 시간은 있어.",
        icon: "⚖️",
        id: "lifestage-30s-investor",
        sources: ["Age", "Money Habits"],
        title: "30대 투자자의 균형",
      });
    }
  }

  // 40s+ + MBTI + Life Wisdom
  if (profile.lifeStage === "40s+" && profile.mbti) {
    if (profile.mbti.includes("I")) {
      insights.push({
        category: "growth",
        confidence: "high",
        description:
          "40대 이후의 내향성은 깊이와 전문성으로 이어져. 네가 쌓아온 경험을 후배들에게 전수하거나 책/강의로 만들어봐. 이게 진짜 자산이야.",
        icon: "🎓",
        id: "lifestage-40s-introvert",
        sources: ["Age", "MBTI"],
        title: "40대 내향형의 깊이",
      });
    }

    insights.push({
      category: "wellness",
      confidence: "medium",
      description:
        '이제는 "더 많이"가 아니라 "더 의미있게"를 추구할 때야. 워라밸, 건강, 관계에 투자하면서도 커리어를 유지하는 균형을 찾아봐.',
      icon: "🌱",
      id: "lifestage-40s-general",
      sources: ["Age"],
      title: "40대 이후의 전략",
    });
  }

  // === SITUATIONAL CORRELATIONS ===

  // Career Change Pattern
  if (profile.mbti && profile.lifeStage) {
    const isPerceiving = profile.mbti.charAt(3) === "P";

    if (isPerceiving && profile.lifeStage === "30s") {
      insights.push({
        category: "career",
        confidence: "high",
        description:
          "30대에 전직을 고민 중이라면? 네 유연성(P)이 강점이야. 다만 이번엔 확실히 방향을 정하고 가야 해. 40대엔 선택지가 줄어들거든.",
        icon: "🔄",
        id: "career-change-30s-p",
        sources: ["MBTI", "Age"],
        title: "30대 인식형의 전직 적기",
      });
    }
  }

  // Burnout Prevention
  if (profile.mbti && profile.enneagram) {
    if (
      (profile.enneagram === "3" || profile.enneagram === "8") &&
      profile.mbti.includes("E")
    ) {
      insights.push({
        category: "wellness",
        confidence: "high",
        description:
          "너의 성취 욕구와 외향성은 강점이지만, 쉬지 않고 달리면 번아웃 와. 매주 하루는 완전히 쉬는 날로 정해. 이게 장기전 전략이야.",
        icon: "🔋",
        id: "burnout-achiever",
        sources: ["Enneagram", "MBTI"],
        title: "번아웃 주의보",
      });
    }
  }

  // Relationship + MBTI
  if (profile.mbti) {
    const thinkingFeeling = profile.mbti.charAt(2);

    if (thinkingFeeling === "T") {
      insights.push({
        category: "relationships",
        confidence: "medium",
        description:
          '논리적인 건 강점이지만, 관계에선 감정도 중요해. "왜?"보다 "어떻게 느꼈어?"를 먼저 물어봐. 이게 관계를 부드럽게 만들어.',
        icon: "💝",
        id: "relationship-thinking",
        sources: ["MBTI"],
        title: "사고형의 관계 팁",
      });
    } else {
      insights.push({
        category: "relationships",
        confidence: "medium",
        description:
          '공감 능력이 뛰어난 건 좋지만, 남의 감정에 너무 휘둘리지 마. "나는 나, 너는 너" 경계를 명확히 하는 연습이 필요해.',
        icon: "🛡️",
        id: "relationship-feeling",
        sources: ["MBTI"],
        title: "감정형의 경계 설정",
      });
    }
  }

  return insights;
}

export function getHighConfidenceInsights(
  insights: CorrelationInsight[],
): CorrelationInsight[] {
  return insights.filter((i) => i.confidence === "high");
}

export function getInsightsByCategory(
  insights: CorrelationInsight[],
  category: string,
): CorrelationInsight[] {
  return insights.filter((i) => i.category === category);
}

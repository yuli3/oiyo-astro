export interface DecisionMakingQuestion {
  emoji: string;
  id: string;
  options: {
    emoji: string;
    id: string;
    scores: Record<DecisionMakingType, number>;
    text: string;
  }[];
  text: string;
}

export interface DecisionMakingResult {
  challenges: string[];
  description: string;
  idealSituations: string[];
  improvementTips: string[];
  percentages: Record<DecisionMakingType, number>;
  primary: DecisionMakingType;
  scores: Record<DecisionMakingType, number>;
  secondary: DecisionMakingType;
  strengths: string[];
  traits: string[];
}

export type DecisionMakingType =
  | "analytical"
  | "cautious"
  | "collaborative"
  | "creative"
  | "decisive"
  | "intuitive";

export const DECISION_MAKING_LABELS = {
  en: {
    analytical: "The Analytical Decision Maker",
    cautious: "The Cautious Evaluator",
    collaborative: "The Collaborative Decision Maker",
    creative: "The Creative Problem Solver",
    decisive: "The Decisive Action Taker",
    intuitive: "The Intuitive Decision Maker",
  },
  ko: {
    analytical: "분석적 의사결정자",
    cautious: "신중한 평가자",
    collaborative: "협력적 의사결정자",
    creative: "창의적 문제해결자",
    decisive: "결단력 있는 실행자",
    intuitive: "직관적 의사결정자",
  },
};

export const DECISION_MAKING_DESCRIPTIONS = {
  en: {
    analytical:
      "You make decisions based on careful analysis of data, facts, and logical reasoning. You prefer to have comprehensive information before choosing a course of action.",
    cautious:
      "You take time to consider all possibilities and potential consequences before deciding. You prefer to minimize risks and thoroughly evaluate options.",
    collaborative:
      "You value input from others and prefer to make decisions as a team. You seek consensus and believe that diverse perspectives lead to better outcomes.",
    creative:
      "You approach decisions by thinking outside the box and considering innovative solutions. You're not limited by conventional approaches and enjoy finding unique paths forward.",
    decisive:
      "You make decisions quickly and confidently, even with limited information. You're comfortable taking risks and moving forward without hesitation.",
    intuitive:
      "You trust your gut feelings and instincts when making decisions. You can quickly sense the right path and often make excellent choices without extensive analysis.",
  },
  ko: {
    analytical:
      "당신은 데이터, 사실, 논리적 추론을 신중히 분석한 후 의사결정을 내립니다. 행동 방침을 선택하기 전에 포괄적인 정보를 가지고 있기를 선호합니다.",
    cautious:
      "당신은 결정하기 전에 모든 가능성과 잠재적 결과를 고려하는 시간을 갖습니다. 위험을 최소화하고 선택지를 철저히 평가하는 것을 선호합니다.",
    collaborative:
      "당신은 다른 사람들의 의견을 중시하고 팀으로 의사결정하는 것을 선호합니다. 합의를 추구하며 다양한 관점이 더 나은 결과로 이어진다고 믿습니다.",
    creative:
      "당신은 틀에 박힌 사고에서 벗어나 혁신적인 해결책을 고려하여 결정에 접근합니다. 관습적인 접근법에 얽매이지 않으며 독특한 길을 찾는 것을 즐깁니다.",
    decisive:
      "당신은 제한된 정보로도 빠르고 자신 있게 결정을 내립니다. 위험을 감수하는 것을 편안하게 여기며 주저하지 않고 앞으로 나아갑니다.",
    intuitive:
      "당신은 의사결정을 할 때 직감과 본능을 신뢰합니다. 올바른 길을 빠르게 감지할 수 있으며 광범위한 분석 없이도 종종 훌륭한 선택을 합니다.",
  },
};

export const DECISION_MAKING_TRAITS: Record<DecisionMakingType, string[]> = {
  analytical: [
    "Gathers comprehensive data before deciding",
    "Uses logical reasoning and systematic analysis",
    "Weighs pros and cons methodically",
    "Values objective information over emotions",
    "Creates detailed decision frameworks",
  ],
  cautious: [
    "Thoroughly evaluates risks and consequences",
    "Takes time to consider all alternatives",
    "Seeks additional information when uncertain",
    "Plans for multiple contingencies",
    "Prioritizes security and stability",
  ],
  collaborative: [
    "Seeks input from multiple stakeholders",
    "Values diverse perspectives and opinions",
    "Builds consensus before moving forward",
    "Considers impact on relationships",
    "Facilitates group decision-making processes",
  ],
  creative: [
    "Generates innovative and unique solutions",
    "Challenges conventional thinking patterns",
    "Considers unconventional alternatives",
    "Combines ideas in novel ways",
    "Embraces experimentation and novelty",
  ],
  decisive: [
    "Acts quickly even with incomplete information",
    "Comfortable with uncertainty and risk",
    "Takes responsibility for decision outcomes",
    "Moves from decision to implementation rapidly",
    "Shows confidence in chosen directions",
  ],
  intuitive: [
    "Trusts gut feelings and instincts",
    "Makes quick decisions with confidence",
    "Reads between the lines effectively",
    "Considers emotional and social factors",
    "Often arrives at good decisions unconsciously",
  ],
};

export const DECISION_MAKING_STRENGTHS: Record<DecisionMakingType, string[]> = {
  analytical: [
    "Makes well-informed, rational decisions",
    "Reduces errors through thorough analysis",
    "Excellent at complex problem-solving",
    "Builds strong justification for choices",
  ],
  cautious: [
    "Minimizes risks and negative consequences",
    "Makes stable, well-considered decisions",
    "Anticipates and prepares for problems",
    "Maintains quality and safety standards",
  ],
  collaborative: [
    "Builds buy-in and commitment from team",
    "Leverages collective wisdom and experience",
    "Reduces resistance to implementation",
    "Creates inclusive decision-making culture",
  ],
  creative: [
    "Finds breakthrough solutions to complex problems",
    "Adapts quickly to changing circumstances",
    "Inspires innovation in others",
    "Discovers opportunities others overlook",
  ],
  decisive: [
    "Moves projects forward efficiently",
    "Capitalizes on time-sensitive opportunities",
    "Provides clear direction in uncertain times",
    "Takes accountability for results",
  ],
  intuitive: [
    "Quick decision-making in time-sensitive situations",
    "Excellent at reading people and situations",
    "Often finds creative solutions others miss",
    "Strong emotional intelligence in decisions",
  ],
};

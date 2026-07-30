import type { Locale } from "@/i18n";
import type { LocalizedText } from "@/types/manifest";

export interface ConflictResponseQuestion {
  emoji: string;
  id: string;
  options: {
    emoji: string;
    id: string;
    scores: Record<ConflictResponseType, number>;
    text: LocalizedText;
  }[];
  text: LocalizedText;
}

export interface ConflictResponseResult {
  challenges: string[];
  description: string;
  improvementTips: string[];
  percentages: Record<ConflictResponseType, number>;
  primary: ConflictResponseType;
  realLifeScenarios: string[];
  scores: Record<ConflictResponseType, number>;
  secondary: ConflictResponseType;
  strengths: string[];
  traits: string[];
}

export type ConflictResponseType =
  | "analytical"
  | "avoidant"
  | "confrontational"
  | "harmonizing";

export const CONFLICT_RESPONSE_LABELS: Record<
  Locale,
  Record<ConflictResponseType, string>
> = {
  zh: {
    analytical: "The Analyst",
    avoidant: "The Avoider",
    confrontational: "The Confronter",
    harmonizing: "The Harmonizer",
  },
  en: {
    analytical: "The Analyst",
    avoidant: "The Avoider",
    confrontational: "The Confronter",
    harmonizing: "The Harmonizer",
  },
  es: {
    analytical: "The Analyst",
    avoidant: "The Avoider",
    confrontational: "The Confronter",
    harmonizing: "The Harmonizer",
  },
  fr: {
    analytical: "The Analyst",
    avoidant: "The Avoider",
    confrontational: "The Confronter",
    harmonizing: "The Harmonizer",
  },
  ja: {
    analytical: "The Analyst",
    avoidant: "The Avoider",
    confrontational: "The Confronter",
    harmonizing: "The Harmonizer",
  },
  ko: {
    analytical: "논리형",
    avoidant: "회피형",
    confrontational: "직면형",
    harmonizing: "유화형",
  },
};

export const CONFLICT_RESPONSE_DESCRIPTIONS: Record<
  Locale,
  Record<ConflictResponseType, string>
> = {
  zh: {
    analytical: "You approach conflicts with logic and objectivity.",
    avoidant: "You tend to avoid confrontation.",
    confrontational: "You face conflicts head-on.",
    harmonizing: "You seek to find common ground.",
  },
  en: {
    analytical:
      "You approach conflicts with logic and objectivity, focusing on facts rather than emotions.",
    avoidant:
      "You tend to avoid confrontation and difficult conversations, preferring to keep the peace.",
    confrontational: "You face conflicts head-on with directness and courage.",
    harmonizing:
      "You seek to find common ground and maintain relationships even during disagreements.",
  },
  es: {
    analytical: "You approach conflicts with logic and objectivity.",
    avoidant: "You tend to avoid confrontation.",
    confrontational: "You face conflicts head-on.",
    harmonizing: "You seek to find common ground.",
  },
  fr: {
    analytical: "You approach conflicts with logic and objectivity.",
    avoidant: "You tend to avoid confrontation.",
    confrontational: "You face conflicts head-on.",
    harmonizing: "You seek to find common ground.",
  },
  ja: {
    analytical: "You approach conflicts with logic and objectivity.",
    avoidant: "You tend to avoid confrontation.",
    confrontational: "You face conflicts head-on.",
    harmonizing: "You seek to find common ground.",
  },
  ko: {
    analytical:
      "당신은 감정보다는 사실에 집중하여 논리와 객관성으로 갈등에 접근합니다.",
    avoidant:
      "당신은 대립과 어려운 대화를 피하는 경향이 있으며, 평화를 유지하는 것을 선호합니다.",
    confrontational: "당신은 직접적이고 용기 있게 갈등에 정면으로 맞섭니다.",
    harmonizing:
      "당신은 의견 차이가 있는 동안에도 공통점을 찾고 관계를 유지하려고 노력합니다.",
  },
};

export const CONFLICT_RESPONSE_TRAITS: Record<
  Locale,
  Record<ConflictResponseType, string[]>
> = {
  zh: {
    analytical: ["Logic focused"],
    avoidant: ["Prefers peace"],
    confrontational: ["Addresses issues immediately"],
    harmonizing: ["Seeks win-win"],
  },
  en: {
    analytical: ["Logic focused", "Structured problem-solver"],
    avoidant: ["Prefers peace", "Struggles with confrontation"],
    confrontational: ["Addresses issues immediately", "Honest over polite"],
    harmonizing: ["Seeks win-win", "Room reader"],
  },
  es: {
    analytical: ["Logic focused"],
    avoidant: ["Prefers peace"],
    confrontational: ["Addresses issues immediately"],
    harmonizing: ["Seeks win-win"],
  },
  fr: {
    analytical: ["Logic focused"],
    avoidant: ["Prefers peace"],
    confrontational: ["Addresses issues immediately"],
    harmonizing: ["Seeks win-win"],
  },
  ja: {
    analytical: ["Logic focused"],
    avoidant: ["Prefers peace"],
    confrontational: ["Addresses issues immediately"],
    harmonizing: ["Seeks win-win"],
  },
  ko: {
    analytical: ["논리 중심", "구조적 문제 해결"],
    avoidant: ["평화 유지 선호", "대립에 어려움"],
    confrontational: ["즉시 문제 해결", "정직함 중시"],
    harmonizing: ["상생 추구", "분위기 파악"],
  },
};

export const CONFLICT_RESPONSE_STRENGTHS: Record<
  Locale,
  Record<ConflictResponseType, string[]>
> = {
  zh: {
    analytical: ["Objective decisions"],
    avoidant: ["Peaceful environments"],
    confrontational: ["Quick resolution"],
    harmonizing: ["Preserves relationships"],
  },
  en: {
    analytical: ["Objective decisions"],
    avoidant: ["Peaceful environments"],
    confrontational: ["Quick resolution"],
    harmonizing: ["Preserves relationships"],
  },
  es: {
    analytical: ["Objective decisions"],
    avoidant: ["Peaceful environments"],
    confrontational: ["Quick resolution"],
    harmonizing: ["Preserves relationships"],
  },
  fr: {
    analytical: ["Objective decisions"],
    avoidant: ["Peaceful environments"],
    confrontational: ["Quick resolution"],
    harmonizing: ["Preserves relationships"],
  },
  ja: {
    analytical: ["Objective decisions"],
    avoidant: ["Peaceful environments"],
    confrontational: ["Quick resolution"],
    harmonizing: ["Preserves relationships"],
  },
  ko: {
    analytical: ["객관적 결정"],
    avoidant: ["평화로운 환경"],
    confrontational: ["신속한 해결"],
    harmonizing: ["관계 보존"],
  },
};

import { LocalizedText } from "@/types/manifest";

import { BalanceCategoryKey } from "./types";

export interface BalanceQuestion {
  category: BalanceCategoryKey;
  id: string;
  options: {
    id: string;
    score: number; // 0-100? Or 1-5 mapped to 20,40,60,80,100
    text: LocalizedText;
  }[];
  text: LocalizedText;
}

const scaleOptions = (
  localeKey: string,
): { id: string; score: number; text: LocalizedText }[] => [
  {
    id: "1",
    score: 20,
    text: {
      cn: "Very Dissatisfied",
      en: "Very Dissatisfied",
      es: "Very Dissatisfied",
      fr: "Very Dissatisfied",
      ja: "Very Dissatisfied",
      ko: "매우 불만족",
    },
  },
  {
    id: "2",
    score: 40,
    text: {
      cn: "Dissatisfied",
      en: "Dissatisfied",
      es: "Dissatisfied",
      fr: "Dissatisfied",
      ja: "Dissatisfied",
      ko: "불만족",
    },
  },
  {
    id: "3",
    score: 60,
    text: {
      cn: "Neutral",
      en: "Neutral",
      es: "Neutral",
      fr: "Neutral",
      ja: "Neutral",
      ko: "보통",
    },
  },
  {
    id: "4",
    score: 80,
    text: {
      cn: "Satisfied",
      en: "Satisfied",
      es: "Satisfied",
      fr: "Satisfied",
      ja: "Satisfied",
      ko: "만족",
    },
  },
  {
    id: "5",
    score: 100,
    text: {
      cn: "Very Satisfied",
      en: "Very Satisfied",
      es: "Very Satisfied",
      fr: "Very Satisfied",
      ja: "Very Satisfied",
      ko: "매우 만족",
    },
  },
];

export const BALANCE_QUESTIONS: BalanceQuestion[] = [
  // Health
  {
    category: "health",
    id: "health_1",
    options: scaleOptions("energy"),
    text: {
      en: "How do you feel about your energy levels throughout the day?",
      ko: "하루 동안의 에너지 수준에 대해 어떻게 느끼시나요?",
    },
  },
  {
    category: "health",
    id: "health_2",
    options: scaleOptions("fitness"),
    text: {
      en: "Are you satisfied with your physical fitness and diet?",
      ko: "당신의 신체 건강 상태와 식단에 만족하시나요?",
    },
  },

  // Relationships
  {
    category: "relationships",
    id: "rel_1",
    options: scaleOptions("connect"),
    text: {
      en: "How connected do you feel to your family and friends?",
      ko: "가족 및 친구들과 얼마나 깊이 연결되어 있다고 느끼시나요?",
    },
  },
  {
    category: "relationships",
    id: "rel_2",
    options: scaleOptions("romantic"),
    text: {
      en: "Are your romantic or close relationships fulfilling?",
      ko: "당신의 연애나 가까운 인간관계가 충만하다고 느끼시나요?",
    },
  },

  // Career
  {
    category: "career",
    id: "car_1",
    options: scaleOptions("meaning"),
    text: {
      en: "Do you find meaning and purpose in your daily work?",
      ko: "매일의 업무에서 의미와 목적을 찾고 계신가요?",
    },
  },
  {
    category: "career",
    id: "car_2",
    options: scaleOptions("growth"),
    text: {
      en: "Are you satisfied with your professional growth and trajectory?",
      ko: "당신의 직업적 성장과 경로에 만족하시나요?",
    },
  },

  // Finance
  {
    category: "finance",
    id: "fin_1",
    options: scaleOptions("secure"),
    text: {
      en: "How secure do you feel about your current financial situation?",
      ko: "현재 재정 상태에 대해 얼마나 안정감을 느끼시나요?",
    },
  },
  {
    category: "finance",
    id: "fin_2",
    options: scaleOptions("plans"),
    text: {
      en: "Are you sticking to your financial plans and savings goals?",
      ko: "저축 목표와 재정 계획을 잘 지키고 계신가요?",
    },
  },

  // Personal
  {
    category: "personal",
    id: "per_1",
    options: scaleOptions("learning"),
    text: {
      en: "Are you consistently learning new things or growing as a person?",
      ko: "지속적으로 새로운 것을 배우거나 성장하고 계신가요?",
    },
  },
  {
    category: "personal",
    id: "per_2",
    options: scaleOptions("hobbies"),
    text: {
      en: "Do you make enough time for your hobbies and interests?",
      ko: "취미와 관심사를 위한 시간을 충분히 갖고 계신가요?",
    },
  },

  // Environment
  {
    category: "environment",
    id: "env_1",
    options: scaleOptions("home"),
    text: {
      en: "Does your home environment bring you peace and comfort?",
      ko: "당신의 집 환경은 평화와 편안함을 주나요?",
    },
  },
  {
    category: "environment",
    id: "env_2",
    options: scaleOptions("area"),
    text: {
      en: "Are you satisfied with the area or city you live in?",
      ko: "당신이 사는 지역이나 도시에 만족하시나요?",
    },
  },

  // Fun
  {
    category: "fun",
    id: "fun_1",
    options: scaleOptions("laugh"),
    text: {
      en: "How often do you laugh or have fun purely for enjoyment?",
      ko: "순수한 즐거움을 위해 웃거나 노는 시간이 얼마나 되나요?",
    },
  },
  {
    category: "fun",
    id: "fun_2",
    options: scaleOptions("leisure"),
    text: {
      en: "Are you satisfied with your work-life balance and leisure time?",
      ko: "일과 삶의 균형, 그리고 여가 시간에 만족하시나요?",
    },
  },

  // Contribution
  {
    category: "contribution",
    id: "con_1",
    options: scaleOptions("impact"),
    text: {
      en: "Do you feel you are making a positive impact on others?",
      ko: "타인에게 긍정적인 영향을 주고 있다고 느끼시나요?",
    },
  },
  {
    category: "contribution",
    id: "con_2",
    options: scaleOptions("service"),
    text: {
      en: "Are you involved in any community service or helping activities?",
      ko: "지역 사회 봉사나 돕는 활동에 참여하고 계신가요?",
    },
  },
];

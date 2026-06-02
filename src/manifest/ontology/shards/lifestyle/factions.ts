import { Static, Type } from "@sinclair/typebox";

import { ElementType } from "../../core/schemas";

export const FactionSchema = Type.Object({
  description: Type.Object({
    en: Type.String(),
    ko: Type.String(),
  }),
  id: Type.String(),
  name: Type.Object({
    en: Type.String(),
    ko: Type.String(),
  }),
  tags: Type.Object({
    elements: Type.Array(ElementType),
    mbti: Type.Optional(Type.Array(Type.String())),
  }),
});

export type Faction = Static<typeof FactionSchema>;

export const ECONOMIC_SCHOOLS: Faction[] = [
  {
    description: {
      en: "Focuses on individual rationality and market equilibrium.",
      ko: "개인의 합리적 선택과 시장의 균형을 중시하는 학파입니다.",
    },
    id: "ECON_CLASSICAL",
    name: { en: "Classical Economics", ko: "고전학파" },
    tags: {
      elements: ["METAL", "EARTH"],
      mbti: ["INTJ", "ISTJ", "ENTJ"],
    },
  },
  {
    description: {
      en: "Emphasizes aggregate demand and government intervention.",
      ko: "총수요 관리와 정부의 역할을 강조하는 학파입니다.",
    },
    id: "ECON_KEYNESIAN",
    name: { en: "Keynesian Economics", ko: "케인즈학파" },
    tags: {
      elements: ["WATER", "WOOD"],
      mbti: ["ENFJ", "INFJ", "ENTP"],
    },
  },
  {
    description: {
      en: "Focuses on money supply and long-term price stability.",
      ko: "통화량 조절과 장기적인 물가 안정을 중시합니다.",
    },
    id: "ECON_MONETARIST",
    name: { en: "Monetarism", ko: "통화주의" },
    tags: {
      elements: ["METAL", "FIRE"],
      mbti: ["ISTJ", "INTP", "ESTJ"],
    },
  },
  {
    description: {
      en: "Applies psychological insights to explain economic decisions.",
      ko: "심리학적 통찰을 통해 인간의 비합리적 경제 활동을 분석합니다.",
    },
    id: "ECON_BEHAVIORAL",
    name: { en: "Behavioral Economics", ko: "행동경제학" },
    tags: {
      elements: ["FIRE", "WOOD"],
      mbti: ["INFP", "ENFP", "ISFP"],
    },
  },
  {
    description: {
      en: "Emphasizes entrepreneurial discovery and subjectivism.",
      ko: "기업가 정신과 주관적 가치를 강조하는 학파입니다.",
    },
    id: "ECON_AUSTRIAN",
    name: { en: "Austrian School", ko: "오스트리아 학파" },
    tags: {
      elements: ["FIRE", "EARTH"],
      mbti: ["ENTP", "INTJ", "ESTP"],
    },
  },
];

export const POLITICAL_TENDENCIES: Faction[] = [
  {
    description: {
      en: "Values tradition, stability, and gradual reform.",
      ko: "전통, 안정, 그리고 점진적인 개혁을 가치 있게 여깁니다.",
    },
    id: "POL_CONSERVATISM",
    name: { en: "Conservatism", ko: "보수주의" },
    tags: {
      elements: ["EARTH", "METAL"],
      mbti: ["ISTJ", "ESTJ", "ISFJ"],
    },
  },
  {
    description: {
      en: "Emphasizes individual liberty, equality, and progress.",
      ko: "개인의 자유와 평등, 그리고 사회적 진보를 강조합니다.",
    },
    id: "POL_LIBERALISM",
    name: { en: "Liberalism", ko: "자유주의" },
    tags: {
      elements: ["WOOD", "FIRE"],
      mbti: ["ENFP", "ENTP", "INFP"],
    },
  },
  {
    description: {
      en: "Focuses on social justice, equality, and community welfare.",
      ko: "사회 정의, 평등, 그리고 공동체의 복지를 지향합니다.",
    },
    id: "POL_SOCIALISM",
    name: { en: "Socialism", ko: "사회주의" },
    tags: {
      elements: ["WATER", "EARTH"],
      mbti: ["ENFJ", "INFJ", "ESFJ"],
    },
  },
  {
    description: {
      en: "Prioritizes minimal state intervention and maximum individual autonomy.",
      ko: "국가의 간섭을 최소화하고 개인의 자율성을 극대화합니다.",
    },
    id: "POL_LIBERTARIANISM",
    name: { en: "Libertarianism", ko: "자유지상주의" },
    tags: {
      elements: ["FIRE", "METAL"],
      mbti: ["INTJ", "INTP", "ENTP"],
    },
  },
  {
    description: {
      en: "Seeks a balance between order and progress, or pragmatic solutions.",
      ko: "질서와 진보 사이의 균형 또는 실용적인 해결책을 모색합니다.",
    },
    id: "POL_MODERATISM",
    name: { en: "Moderatism", ko: "중도주의" },
    tags: {
      elements: ["EARTH", "WATER"],
      mbti: ["ISFJ", "ISTJ", "ESFJ"],
    },
  },
];

import type { PersonaDefinition } from "./types";

export const COUNCIL_OF_SEVEN: PersonaDefinition[] = [
  {
    focus: ["tci", "hsp", "hexaco"],
    id: "counselor",
    isPremium: false,
    name: { en: "Psychology Counselor", ko: "심리 상담사" },
    role: { en: "Inner Healing", ko: "내면의 치유" },
    tone: {
      en: "Warm, empathetic, and emotionally supportive",
      ko: "따뜻하고 공감적인, 정서적 지지",
    },
  },
  {
    focus: ["riasec", "ziwei.career"],
    id: "coordinator",
    isPremium: false,
    name: { en: "Life Coordinator", ko: "인생 코디네이터" },
    role: { en: "Career & Goals", ko: "커리어와 목표" },
    tone: {
      en: "Practical, analytical, and action-oriented",
      ko: "실용적이고 분석적인, 행동 지향",
    },
  },
  {
    focus: ["saju", "qizheng"],
    id: "eastern",
    isPremium: false,
    name: { en: "Eastern Astrologer", ko: "동양 명리학자" },
    role: { en: "Flow of Fortune", ko: "운의 흐름" },
    tone: {
      en: "Classical, restrained, emphasizing cosmic harmony",
      ko: "고전적이고 절제된, 우주의 조화 강조",
    },
  },
  {
    focus: ["zodiac", "hellenistic"],
    id: "western",
    isPremium: false,
    name: { en: "Western Astrologer", ko: "서양 점성술사" },
    role: { en: "Environmental Influence", ko: "환경적 영향" },
    tone: {
      en: "Mythical, symbolic, focusing on opportunities and challenges",
      ko: "신화적이고 상징적인, 기회와 도전",
    },
  },
  {
    focus: ["kabbalah", "numerology", "egyptian"],
    id: "seeker",
    isPremium: true,
    name: { en: "Vision Seeker", ko: "비전 수행자" },
    role: { en: "Spiritual Evolution", ko: "영적 진화" },
    tone: {
      en: "Mystical, metaphysical, exploring the reason for existence",
      ko: "신비롭고 형이상학적인, 존재의 이유",
    },
  },
  {
    focus: ["qizheng.nodes", "mayan"],
    id: "prophet",
    isPremium: true,
    name: { en: "The Oracle", ko: "예언자" },
    role: { en: "Omens & Warnings", ko: "징조와 경고" },
    tone: {
      en: "Intuitive, reverent, observing the waves of the future",
      ko: "직관적이고 경건한, 미래의 파동",
    },
  },
  {
    focus: ["uce", "probability"],
    id: "observer",
    isPremium: true,
    name: { en: "The Observer", ko: "관찰자" },
    role: { en: "Objective Mediator", ko: "객관적 중재" },
    tone: {
      en: "Cool, scientific, observing the superposition of possibilities",
      ko: "냉철하고 과학적인, 가능성의 중첩",
    },
  },
];

export function getPersona(id: string): PersonaDefinition | undefined {
  return COUNCIL_OF_SEVEN.find((p) => p.id === id);
}

import type { LocalizedText } from "@/types/manifest";

export interface BirthAttribute {
  flower: {
    meaning: LocalizedText;
    name: LocalizedText;
  };
  id: string;
  month: number;
  stone: {
    meaning: LocalizedText;
    name: LocalizedText;
  };
}

export const BIRTH_ATTRIBUTES_DATA: BirthAttribute[] = [
  {
    flower: {
      meaning: { en: "Love & Distinction", ko: "모성애, 순수한 사랑" },
      name: { en: "Carnation", ko: "카네이션" },
    },
    id: "jan",
    month: 1,
    stone: {
      meaning: { en: "Trust & Purity", ko: "진실, 우정" },
      name: { en: "Garnet", ko: "가넷" },
    },
  },
  {
    flower: {
      meaning: { en: "Modesty & Faithfulness", ko: "겸양, 성실" },
      name: { en: "Violet", ko: "제비꽃" },
    },
    id: "feb",
    month: 2,
    stone: {
      meaning: { en: "Sincerity & Peace", ko: "성실, 평화" },
      name: { en: "Amethyst", ko: "자수정" },
    },
  },
  {
    flower: {
      meaning: { en: "Rebirth & New Beginnings", ko: "자기애, 자존심" },
      name: { en: "Daffodil", ko: "수선화" },
    },
    id: "mar",
    month: 3,
    stone: {
      meaning: { en: "Youth & Happiness", ko: "젊음, 행복" },
      name: { en: "Aquamarine", ko: "아쿠아마린" },
    },
  },
  {
    flower: {
      meaning: { en: "Innocence & Purity", ko: "명랑, 순수한 마음" },
      name: { en: "Daisy", ko: "데이지" },
    },
    id: "apr",
    month: 4,
    stone: {
      meaning: { en: "Innocence & Love", ko: "불멸, 사랑" },
      name: { en: "Diamond", ko: "다이아몬드" },
    },
  },
  {
    flower: {
      meaning: { en: "Humility & Happiness", ko: "틀림없이 행복해집니다" },
      name: { en: "Lily of the Valley", ko: "은방울꽃" },
    },
    id: "may",
    month: 5,
    stone: {
      meaning: { en: "Happiness & Fertility", ko: "행복, 행운" },
      name: { en: "Emerald", ko: "에메랄드" },
    },
  },
  {
    flower: {
      meaning: { en: "Love & Passion", ko: "사랑, 애정" },
      name: { en: "Rose", ko: "장미" },
    },
    id: "jun",
    month: 6,
    stone: {
      meaning: { en: "Health & Wealth", ko: "건강, 장수" },
      name: { en: "Pearl", ko: "진주" },
    },
  },
  {
    flower: {
      meaning: { en: "Levity & Lightness", ko: "아름다움, 천진난만" },
      name: { en: "Larkspur", ko: "미나리아재비" },
    },
    id: "jul",
    month: 7,
    stone: {
      meaning: { en: "Love & Passion", ko: "열정, 용기" },
      name: { en: "Ruby", ko: "루비" },
    },
  },
  {
    flower: {
      meaning: { en: "Strength & Integrity", ko: "밀회, 견고함" },
      name: { en: "Gladiolus", ko: "글라디올러스" },
    },
    id: "aug",
    month: 8,
    stone: {
      meaning: { en: "Strength & Joy", ko: "부부의 행복, 지혜" },
      name: { en: "Peridot", ko: "페리도트" },
    },
  },
  {
    flower: {
      meaning: { en: "Faith & Wisdom", ko: "믿음, 지혜" },
      name: { en: "Aster", ko: "과꽃" },
    },
    id: "sep",
    month: 9,
    stone: {
      meaning: { en: "Wisdom & Purity", ko: "성실, 덕망" },
      name: { en: "Sapphire", ko: "사파이어" },
    },
  },
  {
    flower: {
      meaning: { en: "Passion & Creativity", ko: "반드시 오고야 말 행복" },
      name: { en: "Marigold", ko: "메리골드" },
    },
    id: "oct",
    month: 10,
    stone: {
      meaning: { en: "Hope & Innocence", ko: "희망, 순결" },
      name: { en: "Opal", ko: "오팔" },
    },
  },
  {
    flower: {
      meaning: { en: "Compassion & Friendship", ko: "고결, 정조" },
      name: { en: "Chrysanthemum", ko: "국화" },
    },
    id: "nov",
    month: 11,
    stone: {
      meaning: { en: "Fidelity & Strength", ko: "우정, 결백" },
      name: { en: "Topaz", ko: "토파즈" },
    },
  },
  {
    flower: {
      meaning: { en: "Self-Esteem & Respect", ko: "고결, 신비" },
      name: { en: "Narcissus", ko: "수선화" },
    },
    id: "dec",
    month: 12,
    stone: {
      meaning: { en: "Success & Protection", ko: "성공, 승리" },
      name: { en: "Turquoise", ko: "터키석" },
    },
  },
];

export function getBirthAttributes(date: Date): BirthAttribute {
  const month = date.getMonth() + 1;
  return (
    BIRTH_ATTRIBUTES_DATA.find((a) => a.month === month) ||
    BIRTH_ATTRIBUTES_DATA[0]
  );
}

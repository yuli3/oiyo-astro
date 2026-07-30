/* eslint-disable no-restricted-syntax */
import type { LocalizedText } from "@/types/manifest";

import type { HEXACODimension, HEXACOQuestion } from "./types";

export const HEXACO_DIMENSION_MAP: Record<
  HEXACODimension,
  { color: string; label: LocalizedText; labelKey: string }
> = {
  A: {
    color: "#4ade80", // Green
    label: {
      zh: "宜人性",
      en: "Agreeableness",
      es: "Cordialidad",
      fr: "Agréabilité",
      ja: "協調性",
      ko: "우호성",
    },
    labelKey: "dimensions.A",
  },
  C: {
    color: "#818cf8", // Indigo
    label: {
      zh: "尽责性",
      en: "Conscientiousness",
      es: "Escrupulosidad",
      fr: "Conscience",
      ja: "誠実性",
      ko: "성실성",
    },
    labelKey: "dimensions.C",
  },
  E: {
    color: "#f87171", // Red
    label: {
      zh: "情绪性",
      en: "Emotionality",
      es: "Emocionalidad",
      fr: "Émotionnalité",
      ja: "感情性",
      ko: "정서성",
    },
    labelKey: "dimensions.E",
  },
  H: {
    color: "#fbbf24", // Amber
    label: {
      zh: "诚实-谦逊",
      en: "Honesty-Humility",
      es: "Honestidad-Humildad",
      fr: "Honnêteté-Humilité",
      ja: "正直・謙虚さ",
      ko: "정직-겸손",
    },
    labelKey: "dimensions.H",
  },
  O: {
    color: "#c084fc", // Purple
    label: {
      zh: "开放性",
      en: "Openness",
      es: "Apertura",
      fr: "Ouverture",
      ja: "開放性",
      ko: "개방성",
    },
    labelKey: "dimensions.O",
  },
  X: {
    color: "#60a5fa", // Blue
    label: {
      zh: "外向性",
      en: "Extraversion",
      es: "Extraversión",
      fr: "Extraversion",
      ja: "外向性",
      ko: "외향성",
    },
    labelKey: "dimensions.X",
  },
};

const HEXACO_OPTIONS = [
  {
    color: "bg-red-500",
    id: "1",
    text: {
      zh: "非常不同意",
      en: "Strongly Disagree",
      es: "Totalmente en desacuerdo",
      fr: "Pas du tout d'accord",
      ja: "強くそう思わない",
      ko: "매우 그렇지 않다",
    },
    value: 1,
  },
  {
    color: "bg-orange-400",
    id: "2",
    text: {
      zh: "不同意",
      en: "Disagree",
      es: "En desacuerdo",
      fr: "Pas d'accord",
      ja: "そう思わない",
      ko: "그렇지 않다",
    },
    value: 2,
  },
  {
    color: "bg-green-600/60",
    id: "3",
    text: {
      zh: "中立",
      en: "Neutral",
      es: "Neutral",
      fr: "Neutre",
      ja: "どちらでもない",
      ko: "보통이다",
    },
    value: 3,
  },
  {
    color: "bg-green-400",
    id: "4",
    text: {
      zh: "同意",
      en: "Agree",
      es: "De acuerdo",
      fr: "D'accord",
      ja: "そう思う",
      ko: "그렇다",
    },
    value: 4,
  },
  {
    color: "bg-green-500",
    id: "5",
    text: {
      zh: "非常同意",
      en: "Strongly Agree",
      es: "Totalmente de acuerdo",
      fr: "Tout à fait d'accord",
      ja: "強くそう思う",
      ko: "매우 그렇다",
    },
    value: 5,
  },
];

export const HEXACO_QUESTIONS: HEXACOQuestion[] = [
  // H: Honesty-Humility
  {
    dimension: "H",
    facet: "H_Sincerity",
    id: "hex_1",
    isReversed: false,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我不会为了加薪而阿谀奉承。",
      en: "I wouldn't use flattery to get a raise.",
      es: "No usaría la adulación para conseguir un aumento.",
      fr: "Je n'utiliserais pas la flatterie pour obtenir une augmentation.",
      ja: "私は昇給のためにゴマをすったりしません。",
      ko: "나는 승급을 위해 아부하지 않는다.",
    },
  },
  {
    dimension: "H",
    facet: "H_Greed_Avoidance",
    id: "hex_2",
    isReversed: true,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我想出名。",
      en: "I want to be famous.",
      es: "Quiero ser famoso.",
      fr: "Je veux être célèbre.",
      ja: "私は有名になりたいです。",
      ko: "나는 유명해지고 싶다.",
    },
  },
  // E: Emotionality
  {
    dimension: "E",
    facet: "E_Fearfulness",
    id: "hex_3",
    isReversed: false,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我很容易焦虑。",
      en: "I get anxious easily.",
      es: "Me pongo ansioso fácilmente.",
      fr: "Je deviens facilement anxieux.",
      ja: "私はすぐに不安になります。",
      ko: "나는 쉽게 불안해진다.",
    },
  },
  {
    dimension: "E",
    facet: "E_Fearfulness",
    id: "hex_4",
    isReversed: true,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我很少感到恐惧。",
      en: "I rarely feel fearful.",
      es: "Rara vez siento miedo.",
      fr: "Je ressens rarement de la peur.",
      ja: "私はめったに恐れを感じません。",
      ko: "나는 거의 두려움을 느끼지 않는다.",
    },
  },
  // X: Extraversion
  {
    dimension: "X",
    facet: "X_Sociability",
    id: "hex_5",
    isReversed: false,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我喜欢成为关注的焦点。",
      en: "I enjoy being the center of attention.",
      es: "Disfruto siendo el centro de atención.",
      fr: "J'aime être le centre de l'attention.",
      ja: "私は注目の的になるのが好きです。",
      ko: "나는 주목받는 것을 즐긴다.",
    },
  },
  {
    dimension: "X",
    facet: "X_Liveliness",
    id: "hex_6",
    isReversed: true,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我更喜欢独自工作。",
      en: "I prefer to work alone.",
      es: "Prefiero trabajar solo.",
      fr: "Je préfère travailler seul.",
      ja: "私は一人で仕事をするのが好きです。",
      ko: "나는 혼자 일하는 것을 선호한다.",
    },
  },
  // A: Agreeableness
  {
    dimension: "A",
    facet: "A_Forgiveness",
    id: "hex_7",
    isReversed: false,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我倾向于轻易原谅别人。",
      en: "I tend to forgive people easily.",
      es: "Tiendo a perdonar a la gente fácilmente.",
      fr: "J'ai tendance à pardonner facilement aux gens.",
      ja: "私は人をすぐに許す傾向があります。",
      ko: "나는 사람들을 쉽게 용서하는 편이다.",
    },
  },
  // Openness (Adding for test completeness)
  {
    dimension: "O",
    facet: "O_Creativity",
    id: "hex_8",
    isReversed: false,
    options: HEXACO_OPTIONS,
    text: {
      zh: "我拥有丰富的想象力。",
      en: "I have a vivid imagination.",
      es: "Tengo una imaginación viva.",
      fr: "J'ai une imagination vive.",
      ja: "私は想像力が豊かです。",
      ko: "나는 상상력이 풍부하다.",
    },
  },
];

export const HEXACO_INSIGHTS = {
  highH: {
    zh: "你把关系建立在真理的基础之上。你的正直是你最大的资产。",
    en: "You build relationships on the bedrock of truth. Your integrity is your greatest asset.",
    es: "Construyes relaciones sobre la base de la verdad. Tu integridad es tu mayor activo.",
    fr: "Vous bâtissez vos relations sur le socle de la vérité. Votre intégrité est votre plus grand atout.",
    ja: "あなたは真実の土台の上に人間関係を築きます。あなたの誠実さは最大の資産です。",
    ko: "당신은 진실의 토대 위에 관계를 쌓습니다. 당신의 정직함은 가장 큰 자산입니다.",
  },
  lowH: {
    zh: "你雄心勃勃，知道如何表现自己。你了解影响力的博弈。",
    en: "You are ambitious and know how to present yourself. You understand the game of influence.",
    es: "Eres ambicioso y sabes cómo presentarte. Entiendes el juego de la influencia.",
    fr: "Vous êtes ambitieux et savez comment vous présenter. Vous comprenez le jeu de l'influence.",
    ja: "あなたは野心的であり、自分をどう表現するかを知っています。影響力のルールを理解しています。",
    ko: "당신은 야망이 있고 자신을 표현하는 법을 압니다. 영향력의 법칙을 이해하고 있습니다.",
  },
};

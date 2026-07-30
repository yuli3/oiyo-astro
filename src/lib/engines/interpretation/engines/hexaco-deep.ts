import type { SixLangString } from "../engine.contract";
import { HEXACO_DATA } from "../shards/hexaco-deep-shards";

/**
 * Deep HEXACO Interpretation Engine
 * Mirrors tci-deep.ts's structure (engine + shard separation, score -> level -> content).
 */

export interface HexacoDeepInterpretation {
  dimensions: HexacoDimension[];
  synthesis: SixLangString;
}

interface HexacoDimension {
  growthPath: SixLangString;
  interpretation: SixLangString;
  key: "H" | "E" | "X" | "A" | "C" | "O";
  level: "high" | "low" | "moderate";
  name: SixLangString;
  score: number;
}

const DIM_NAMES: Record<"H" | "E" | "X" | "A" | "C" | "O", SixLangString> = {
  H: { en: "Honesty-Humility", es: "Honestidad-Humildad", fr: "Honnêteté-Humilité", ja: "誠実・謙虚", ko: "정직-겸손", zh: "诚实-谦逊" },
  E: { en: "Emotionality", es: "Emocionalidad", fr: "Émotivité", ja: "情緒性", ko: "정서성", zh: "情绪性" },
  X: { en: "eXtraversion", es: "Extraversión", fr: "Extraversion", ja: "外向性", ko: "외향성", zh: "外向性" },
  A: { en: "Agreeableness", es: "Amabilidad", fr: "Agréabilité", ja: "協調性", ko: "원만성", zh: "宜人性" },
  C: { en: "Conscientiousness", es: "Escrupulosidad", fr: "Conscience", ja: "誠実性", ko: "성실성", zh: "尽责性" },
  O: { en: "Openness to Experience", es: "Apertura a la experiencia", fr: "Ouverture à l'expérience", ja: "経験への開放性", ko: "경험 개방성", zh: "开放性" },
};

const DIM_ORDER: ("H" | "E" | "X" | "A" | "C" | "O")[] = ["H", "E", "X", "A", "C", "O"];

const LEVEL_WORD: Record<"high" | "low" | "moderate", SixLangString> = {
  high: { en: "high", es: "alta", fr: "élevée", ja: "高い", ko: "높은", zh: "较高的" },
  low: { en: "low", es: "baja", fr: "faible", ja: "低い", ko: "낮은", zh: "较低的" },
  moderate: { en: "moderate", es: "moderada", fr: "modérée", ja: "中程度の", ko: "보통 수준의", zh: "中等的" },
};

export function interpretHexacoDeep(scores: {
  A: number;
  C: number;
  E: number;
  H: number;
  O: number;
  X: number;
}): HexacoDeepInterpretation {
  const getLevel = (score: number): "high" | "low" | "moderate" => {
    if (score <= 35) return "low";
    if (score <= 65) return "moderate";
    return "high";
  };
  const levelWord = (score: number, locale: keyof SixLangString): string =>
    LEVEL_WORD[getLevel(score)][locale] ?? LEVEL_WORD[getLevel(score)].en;

  const dimensions: HexacoDimension[] = DIM_ORDER.map((key) => ({
    growthPath: HEXACO_DATA[key][getLevel(scores[key])].growthPath,
    interpretation: HEXACO_DATA[key][getLevel(scores[key])].interpretation,
    key,
    level: getLevel(scores[key]),
    name: DIM_NAMES[key],
    score: scores[key],
  }));

  const synthesis: SixLangString = {
    en: `Your HEXACO profile shows ${levelWord(scores.H, 'en')} honesty-humility, ${levelWord(scores.E, 'en')} emotionality, ${levelWord(scores.X, 'en')} extraversion, ${levelWord(scores.A, 'en')} agreeableness, ${levelWord(scores.C, 'en')} conscientiousness, and ${levelWord(scores.O, 'en')} openness to experience.`,
    es: `Tu perfil HEXACO muestra honestidad-humildad ${levelWord(scores.H, 'es')}, emocionalidad ${levelWord(scores.E, 'es')}, extraversión ${levelWord(scores.X, 'es')}, amabilidad ${levelWord(scores.A, 'es')}, escrupulosidad ${levelWord(scores.C, 'es')} y apertura a la experiencia ${levelWord(scores.O, 'es')}.`,
    fr: `Votre profil HEXACO montre une honnêteté-humilité ${levelWord(scores.H, 'fr')}, une émotivité ${levelWord(scores.E, 'fr')}, une extraversion ${levelWord(scores.X, 'fr')}, une agréabilité ${levelWord(scores.A, 'fr')}, une conscience ${levelWord(scores.C, 'fr')} et une ouverture à l'expérience ${levelWord(scores.O, 'fr')}.`,
    ja: `あなたのHEXACOプロファイルは、${levelWord(scores.H, 'ja')}誠実・謙虚さ、${levelWord(scores.E, 'ja')}情緒性、${levelWord(scores.X, 'ja')}外向性、${levelWord(scores.A, 'ja')}協調性、${levelWord(scores.C, 'ja')}誠実性、${levelWord(scores.O, 'ja')}経験への開放性を示しています。`,
    ko: `당신의 HEXACO 프로필은 ${levelWord(scores.H, 'ko')} 정직-겸손, ${levelWord(scores.E, 'ko')} 정서성, ${levelWord(scores.X, 'ko')} 외향성, ${levelWord(scores.A, 'ko')} 원만성, ${levelWord(scores.C, 'ko')} 성실성, ${levelWord(scores.O, 'ko')} 경험 개방성을 보입니다.`,
    zh: `你的HEXACO剖面显示出${levelWord(scores.H, 'zh')}诚实谦逊、${levelWord(scores.E, 'zh')}情绪性、${levelWord(scores.X, 'zh')}外向性、${levelWord(scores.A, 'zh')}宜人性、${levelWord(scores.C, 'zh')}尽责性和${levelWord(scores.O, 'zh')}开放性。`,
  };

  return { dimensions, synthesis };
}

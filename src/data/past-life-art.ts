import type { FrGroup } from "../lib/past-life-eras";

// 2026-11-09: reviewed scene illustrations wired for all 5 French groups.
export const PAST_LIFE_ART = {
  joseonArrival: { file: "joseon-1426/arrival.webp", alt: { ko: "조선의 관청 마당을 상상한 그림", en: "An imagined Joseon office courtyard", ja: "朝鮮の官庁の庭を想像した絵", zh: "想象中的朝鲜官署庭院", fr: "Une cour administrative imaginaire de Joseon", es: "Un patio administrativo imaginario de Joseon" } },
  franceArrival: { file: "france/arrival.webp", alt: { ko: "18세기 프랑스의 거리를 상상한 그림", en: "An imagined street in eighteenth-century France", ja: "18世紀フランスの街路を想像した絵", zh: "想象中的18世纪法国街道", fr: "Une rue imaginaire de la France du XVIIIe siècle", es: "Una calle imaginaria de la Francia del siglo XVIII" } },
  franceClergy: { file: "france/first-estate.webp", alt: { ko: "프랑스 성직자를 상상한 인물 그림", en: "An imagined French parish priest", ja: "フランスの聖職者を想像した人物画", zh: "想象中的法国教士", fr: "Portrait imaginaire d’un prêtre français", es: "Retrato imaginario de un sacerdote francés" } },
  franceNoble: { file: "france/second-estate.webp", alt: { ko: "프랑스 귀족을 상상한 인물 그림", en: "An imagined French noble", ja: "フランスの貴族を想像した人物画", zh: "想象中的法国贵族", fr: "Portrait imaginaire d’un noble français", es: "Retrato imaginario de un noble francés" } },
  franceBourgeois: { file: "france/bourgeoisie.webp", alt: { ko: "프랑스 부르주아를 상상한 인물 그림", en: "An imagined French bourgeois", ja: "フランスのブルジョワを想像した人物画", zh: "想象中的法国中产市民", fr: "Portrait imaginaire d’un bourgeois français", es: "Retrato imaginario de un burgués francés" } },
  franceWorkers: { file: "france/third-estate.webp", alt: { ko: "프랑스 도시민의 만남을 상상한 그림", en: "An imagined meeting of French townspeople", ja: "フランスの町民の集まりを想像した絵", zh: "想象中的法国城镇居民聚会", fr: "Une rencontre imaginaire entre habitants d’une ville française", es: "Un encuentro imaginario entre habitantes de una ciudad francesa" } },
  francePeasant: { file: "france/peasant.webp", alt: { ko: "프랑스 농가의 일상을 상상한 그림", en: "An imagined scene of French rural life", ja: "フランスの農家の日常を想像した絵", zh: "想象中的法国农家日常", fr: "Une scène imaginaire de la vie rurale française", es: "Una escena imaginaria de la vida rural francesa" } },
} as const;

export type PastLifeArtKey = keyof typeof PAST_LIFE_ART;

export function franceArtFor(group: FrGroup): PastLifeArtKey {
  if (group === "clergy") return "franceClergy";
  if (group === "nobility") return "franceNoble";
  if (group === "bourgeoisie") return "franceBourgeois";
  if (group === "peasants") return "francePeasant";
  if (group === "urban") return "franceWorkers";
  return "franceArrival";
}

export const PAST_LIFE_ART_NOTE = {
  ko: "AI로 만든 창작 삽화입니다. 실존 인물이나 정확한 복식·건축 복원도가 아닙니다.",
  en: "AI-created fictional illustration, not a real person or an exact reconstruction of clothing or buildings.",
  ja: "AIによる創作挿絵です。実在の人物や服装・建築の正確な復元ではありません。",
  zh: "AI创作插画，并非真实人物或服饰、建筑的精确复原。",
  fr: "Illustration fictive créée par IA, sans portrait réel ni reconstitution exacte des vêtements ou bâtiments.",
  es: "Ilustración ficticia creada con IA, sin retratos reales ni reconstrucciones exactas de ropa o edificios.",
} as const;

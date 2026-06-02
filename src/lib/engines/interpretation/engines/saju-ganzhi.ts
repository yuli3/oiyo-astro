import { SixLangString } from "../engine.contract";
import {
  EARTHLY_BRANCH_NARRATIVES,
  GANZHI_COMBINATION_NARRATIVES,
  HEAVENLY_STEM_NARRATIVES,
} from "../shards/saju-shards";

/**
 * Get Ganzhi narrative by combining stem and branch keys
 */
export function getGanzhiNarrative(
  stemKey: string,
  branchKey: string,
): SixLangString {
  const key = `${stemKey}-${branchKey}`;
  const combination = GANZHI_COMBINATION_NARRATIVES[key];

  if (combination) {
    return combination;
  }

  // Fallback: combine individual narratives
  const stem = HEAVENLY_STEM_NARRATIVES[stemKey];
  const branch = EARTHLY_BRANCH_NARRATIVES[branchKey];

  if (stem && branch) {
    return {
      en: `${stem.narrative.en} Combined with ${branch.narrative.en}`,
      es: `${stem.narrative.es} Combinado con ${branch.narrative.es}`,
      fr: `${stem.narrative.fr} Combiné avec ${branch.narrative.fr}`,
      ja: `${stem.narrative.ja} ${branch.narrative.ja}와 결합.`,
      ko: `${stem.narrative.ko} ${branch.narrative.ko}와 결합.`,
      zh: `${stem.narrative.zh} 与 ${branch.narrative.zh} 结合。`,
    };
  }

  return {
    en: "A unique combination of cosmic energies.",
    es: "Una combinación única de energías cósmicas.",
    fr: "Une combinaison unique d'énergies cosmiques.",
    ja: "宇宙的エネルギーの独特な組み合わせ。",
    ko: "우주적 에너지의 독특한 조합.",
    zh: "宇宙能量的独特组合。",
  };
}

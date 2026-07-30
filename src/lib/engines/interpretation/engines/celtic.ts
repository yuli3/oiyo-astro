import type { CelticInterpretation } from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import { CELTIC_TREES } from "../shards/celtic-shards";

/**
 * Celtic Tree Interpretation Engine
 * The Grand Archive - Modular Local Interpretation
 */

// ============================================================================
// Engine Function
// ============================================================================

export function interpretCeltic(
  treeKey: string,
  locale: string,
): CelticInterpretation {
  const treeData = CELTIC_TREES[treeKey] || CELTIC_TREES.birch;

  return {
    colorTheme: "nature",
    glossaryHints: getGlossaryHints(["birthTree", "oghamLetter"]),
    id: "celtic",
    lucideIcon: "Tree",
    oghamSymbol: treeData.ogham,
    summary: {
      en: `The ${treeData.narrative.en.split(":")[0]} tree governs your birth, embodying the Ogham spirit of ${treeData.ogham}.`,
      ko: `${treeData.narrative.ko.split(":")[0]} 나무는 당신의 태생을 수호하며, 오감 문자 ${treeData.ogham}의 정신을 담고 있습니다.`,
    },
    title: {
      en: "Celtic Tree Reading",
      es: "Lectura Celta",
      fr: "Lecture Celtique",
      ja: "ケルトの木の解釈",
      ko: "켈트 나무 해석",
      zh: "凯尔特树解读",
    },
    treeNarrative: treeData.narrative,
    treeSymbolism: treeData.symbolism,
  };
}

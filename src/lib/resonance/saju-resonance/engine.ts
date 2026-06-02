import {
  EARTHLY_BRANCHES,
  FiveElement,
  HEAVENLY_STEMS,
  SAJU_COMPATIBILITY_TRAITS,
} from "@/lib/data-layer/shards/fate-saju";
import { normalizeScore } from "@/lib/system/utils/normalization";
import { LocalizedText } from "@/types/manifest";

export interface SajuResonanceResult {
  harmonyLevel: "challenging" | "excellent" | "good" | "moderate";
  insights: {
    summaryKey: string;
    titleKey: string;
  };
  relationType: "controlling" | "neutral" | "same" | "supporting";
  score: number;
}

/**
 * Calculates Saju resonance based on dominant elements or Day Masters.
 */
export function calculateSajuResonance(
  element1: FiveElement,
  element2: FiveElement,
): SajuResonanceResult {
  const relation = getElementRelation(element1, element2);

  let score = 70;
  let harmonyLevel: SajuResonanceResult["harmonyLevel"] = "moderate";
  let relationType: SajuResonanceResult["relationType"] = "neutral";

  if (relation === "same") {
    score = 75;
    harmonyLevel = "good";
    relationType = "same";
  } else if (relation === "generates" || relation === "generated_by") {
    score = 95;
    harmonyLevel = "excellent";
    relationType = "supporting";
  } else if (relation === "controls" || relation === "controlled_by") {
    score = 55;
    harmonyLevel = "challenging";
    relationType = "controlling";
  }

  return {
    harmonyLevel,
    insights: {
      summaryKey: SAJU_COMPATIBILITY_TRAITS[relationType].descriptionKey,
      titleKey: SAJU_COMPATIBILITY_TRAITS[relationType].titleKey,
    },
    relationType,
    score,
  };
}

function getElementRelation(
  e1: FiveElement,
  e2: FiveElement,
):
  | "controlled_by"
  | "controls"
  | "generated_by"
  | "generates"
  | "neutral"
  | "same" {
  if (e1 === e2) return "same";

  const relations: Record<
    FiveElement,
    { controls: FiveElement; generates: FiveElement }
  > = {
    [FiveElement.EARTH]: {
      controls: FiveElement.WATER,
      generates: FiveElement.METAL,
    },
    [FiveElement.FIRE]: {
      controls: FiveElement.METAL,
      generates: FiveElement.EARTH,
    },
    [FiveElement.METAL]: {
      controls: FiveElement.WOOD,
      generates: FiveElement.WATER,
    },
    [FiveElement.WATER]: {
      controls: FiveElement.FIRE,
      generates: FiveElement.WOOD,
    },
    [FiveElement.WOOD]: {
      controls: FiveElement.EARTH,
      generates: FiveElement.FIRE,
    },
  };

  if (relations[e1].generates === e2) return "generates";
  if (relations[e2].generates === e1) return "generated_by";
  if (relations[e1].controls === e2) return "controls";
  if (relations[e2].controls === e1) return "controlled_by";

  return "neutral";
}

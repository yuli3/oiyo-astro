import { earthlyBranches, heavenlyStems } from "@/lib/ontology/saju/data";
import { analyzeDayMasterStrength } from "@/lib/ontology/saju/logic";

import { NARRATIVE_REGISTRY } from "../../interpretation/narrative-registry";
import {
  DAY_MASTER_ARCHETYPES,
  ELEMENT_INTERACTIONS,
  STRENGTH_PATTERNS,
  TEN_GOD_NARRATIVES,
} from "../shards/elemental-narratives";
import type { OracleContext, OracleModule, UnifiedFateReport } from "../types";
import { getLang } from "../weaver";

export const ElementalOracle: OracleModule = {
  id: "elemental",
  run: async (ctx: OracleContext): Promise<Partial<UnifiedFateReport>> => {
    const { saju } = ctx.input;
    const { locale } = ctx;

    if (!saju) {
      const emptyContent = getLang(
        NARRATIVE_REGISTRY.elemental.insufficient_data,
        locale,
      );
      const emptyTitle = getLang(
        NARRATIVE_REGISTRY.elemental.blueprint_title,
        locale,
      );

      return {
        sections: {
          elementalBlueprint: {
            content: emptyContent,
            title: emptyTitle,
          },
        } as any,
      };
    }

    const dayMaster = saju.dayMaster;
    const archetype =
      getLang(DAY_MASTER_ARCHETYPES[dayMaster], locale) || dayMaster;

    // Analyze Day Master Strength
    const { dominantTenGod, isStrong } = analyzeDayMasterStrength(saju);
    const pattern = isStrong
      ? STRENGTH_PATTERNS.strong
      : STRENGTH_PATTERNS.weak;
    const patternNarrative = getLang(pattern.general, locale);
    const strategyNarrative = getLang(pattern.strategy, locale);

    // Elemental Interaction Narrative
    const primaryPillar = saju.month;
    const dmStem = (heavenlyStems as any)[saju.dayMaster]?.element;
    const pStem = (heavenlyStems as any)[primaryPillar.heavenlyStem]?.element;

    const interactionKey = `${dmStem}_${pStem}`.toUpperCase();
    const interactionNarrative = ELEMENT_INTERACTIONS[interactionKey]
      ? getLang(ELEMENT_INTERACTIONS[interactionKey], locale)
      : "";

    // Ten God Focus
    const tgNarrative = dominantTenGod
      ? getLang(TEN_GOD_NARRATIVES[dominantTenGod], locale)
      : "";

    // Titles
    const sectionTitle = getLang(
      NARRATIVE_REGISTRY.elemental.blueprint_title,
      locale,
    );
    const adviceLabel = getLang(
      NARRATIVE_REGISTRY.elemental.strategic_advice_label,
      locale,
    );

    const content = `**${archetype}**\n\n${patternNarrative}\n\n${interactionNarrative}\n\n**${adviceLabel}:** ${strategyNarrative}\n\n${tgNarrative}`;

    return {
      sections: {
        elementalBlueprint: {
          content,
          title: sectionTitle,
        },
      } as any,
    };
  },
};

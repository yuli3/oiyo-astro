import { heavenlyStems } from "@/lib/ontology/saju/data";
import { FiveElement } from "@/lib/ontology/saju/types";

import { NARRATIVE_REGISTRY } from "../../interpretation/narrative-registry";
import { SOCIAL_MATRIX } from "../shards/social-narratives";
import { OracleContext, OracleModule, UnifiedFateReport } from "../types";
import { getLang } from "../weaver";

export const SocialOracle: OracleModule = {
  id: "social",
  run: async (ctx: OracleContext): Promise<Partial<UnifiedFateReport>> => {
    const { saju, tci } = ctx.input;
    const { locale } = ctx;

    if (!saju || !tci) {
      const emptyContent = getLang(
        NARRATIVE_REGISTRY.social.insufficient_data,
        locale,
      );
      const emptyTitle = getLang(NARRATIVE_REGISTRY.social.title, locale);

      return {
        sections: {
          socialDynamics: {
            badge: "Social",
            content: emptyContent,
            title: emptyTitle,
          },
        } as any,
      };
    }

    const dayMaster = saju.dayMaster;
    const element = heavenlyStems[dayMaster]?.element as FiveElement;

    // TCI Logic for Matrix Selection
    const { HA, NS, RD } = tci.percentiles;

    let trait: "balanced" | "highHA" | "highNS" | "highRD" = "balanced";
    if (HA > 70) trait = "highHA";
    else if (NS > 70) trait = "highNS";
    else if (RD > 70) trait = "highRD";

    const archetypeNarrative = getLang(SOCIAL_MATRIX[element][trait], locale);

    const title = getLang(NARRATIVE_REGISTRY.social.title, locale);

    return {
      sections: {
        socialResonance: {
          badge: trait,
          content: archetypeNarrative,
          title,
        },
      } as any,
    };
  },
};

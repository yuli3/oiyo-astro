import {
  formatNarrative,
  NARRATIVE_REGISTRY,
} from "../../interpretation/narrative-registry";
import {
  ENNEAGRAM_CORE_NARRATIVES,
  MBTI_COSMIC_ROLE,
} from "../shards/archetype-narratives";
import { OracleContext, OracleModule, UnifiedFateReport } from "../types";
import { getLang } from "../weaver";

export const ArchetypeOracle: OracleModule = {
  id: "archetype",
  run: async (ctx: OracleContext): Promise<Partial<UnifiedFateReport>> => {
    const { enneagram, mbti } = ctx.input;
    const { locale } = ctx;

    // 1. Enneagram Core Narrative
    const eType = enneagram?.primaryType
      ? `type${enneagram.primaryType}`
      : null;
    const enneagramNarrative = eType
      ? getLang(ENNEAGRAM_CORE_NARRATIVES[eType], locale)
      : "";

    // 2. MBTI Cosmic Role
    const mType = mbti?.type || "INFP"; // Fallback to generic if missing
    const cosmicFunction = mType.substring(1, 3); // NT, NF, SJ, SP
    const cosmicRole = getLang(
      MBTI_COSMIC_ROLE[cosmicFunction] || MBTI_COSMIC_ROLE.NF,
      locale,
    );

    // 3. Section Synthesis
    const title = getLang(
      NARRATIVE_REGISTRY.archetypes.psychological_mask_title,
      locale,
    );

    const content = `${enneagramNarrative} ${formatNarrative(
      NARRATIVE_REGISTRY.archetypes.role_assignment,
      { role: cosmicRole },
      locale,
    )}`;

    return {
      sections: {
        psychologicalMask: {
          badge: mType,
          content,
          title,
        },
      } as any,
    };
  },
};

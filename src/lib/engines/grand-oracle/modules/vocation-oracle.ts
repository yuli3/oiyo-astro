import { TenGod } from "@/lib/ontology/saju/types";

import { NARRATIVE_REGISTRY } from "../../interpretation/narrative-registry";
import {
  TEN_GOD_RIASEC_SYNERGY,
  VOCATION_PATHWAYS,
} from "../shards/vocation-narratives";
import { OracleContext, OracleModule, UnifiedFateReport } from "../types";
import { getLang } from "../weaver";

export const VocationOracle: OracleModule = {
  id: "vocation",
  run: async (ctx: OracleContext): Promise<Partial<UnifiedFateReport>> => {
    const { riasec, saju } = ctx.input;
    const { locale } = ctx;

    if (!riasec) {
      const emptyContent = getLang(
        NARRATIVE_REGISTRY.vocation.insufficient_data,
        locale,
      );
      const emptyTitle = getLang(
        NARRATIVE_REGISTRY.vocation.path_title,
        locale,
      );

      return {
        sections: {
          vocationPath: {
            badge: "Vocation",
            content: emptyContent,
            title: emptyTitle,
          },
        } as any,
      };
    }

    const primaryCode = riasec.code.charAt(0);
    const pathwayNarrative =
      getLang(VOCATION_PATHWAYS[primaryCode], locale) || "";

    // Find Dominant Ten God from Saju for synergy
    let tenGodSynergy = "";
    let tenGodCareers = "";
    if (saju) {
      const pillarTenGods = [
        saju.year?.tenGod,
        saju.month?.tenGod,
        saju.hour?.tenGod,
      ].filter(Boolean) as TenGod[];

      // Count and find dominant
      const counts: Record<string, number> = {};
      pillarTenGods.forEach((tg) => {
        counts[tg] = (counts[tg] || 0) + 1;
      });
      let dominantTG: null | string = null;
      let maxCount = 0;
      Object.entries(counts).forEach(([tg, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantTG = tg;
        }
      });

      if (dominantTG && TEN_GOD_RIASEC_SYNERGY[dominantTG]) {
        const synergyData = TEN_GOD_RIASEC_SYNERGY[dominantTG];
        tenGodSynergy = getLang(synergyData.synergy, locale);
        tenGodCareers = getLang(synergyData.careers, locale);
      }
    }

    // Header labels
    const synergyHeader = getLang(
      NARRATIVE_REGISTRY.vocation.synergy_header,
      locale,
    );
    const careersHeader = getLang(
      NARRATIVE_REGISTRY.vocation.careers_header,
      locale,
    );

    const contentParts = [
      pathwayNarrative,
      tenGodSynergy ? `\n### ${synergyHeader}\n${tenGodSynergy}` : "",
      tenGodCareers ? `\n### ${careersHeader}\n${tenGodCareers}` : "",
    ];

    const sectionTitle = getLang(
      NARRATIVE_REGISTRY.vocation.path_title,
      locale,
    );

    return {
      sections: {
        vocationPath: {
          badge: riasec.code,
          content: contentParts.filter(Boolean).join("\n\n"),
          title: sectionTitle,
        },
      } as any,
    };
  },
};

import { calculateTenGod } from "@/lib/ontology/saju/logic"; // Need to export this or move to helper
import {
  getCurrentTimePillars,
  isBranchClash,
} from "@/lib/ontology/saju/time-engine";
import { HeavenlyStem, TenGod } from "@/lib/ontology/saju/types";

import { NARRATIVE_REGISTRY } from "../../interpretation/narrative-registry";
import {
  PROPHECY_CLASH_WARNING,
  PROPHECY_TEN_GOD_Focus,
} from "../shards/prophecy-narratives";
// Note: calculateTenGod wasn't exported in logic.ts view, need to ensure it is available.
// I will assume for this step I need to expose it or reimplement simple lookup.
// Let's reimplement simple lookup here for modularity if imports fail, but ideally import.
// For now, I'll assume I can import it after updating logic.ts, or just use `analyzeSaju` type logic?
// Actually, `analyzeSaju` is for a static chart.
// I will import `analyzeSaju` from logic. But I need `calculateTenGod`.
// Let's rely on `analyzeSaju` to do the heavy lifting if I construct a fake pillar?
// No, simpler to just expose `calculateTenGod` in `saju/logic.ts` in next step if needed.
// Start by writing the file assuming import works, I will fix export in next step.
import { OracleContext, OracleModule, UnifiedFateReport } from "../types";
import { getLang } from "../weaver";

// Temporary helper until I verify export
function getTenGodKey(tenGod: string): string {
  return tenGod.toLowerCase();
}

export const ProphecyOracle: OracleModule = {
  id: "prophecy",
  run: async (ctx: OracleContext): Promise<Partial<UnifiedFateReport>> => {
    const { saju } = ctx.input;
    const { locale } = ctx;

    if (!saju) return {};

    const userDayMaster = saju.dayMaster; // HeavenlyStem
    const userDayBranch = saju.day.earthlyBranch; // EarthlyBranch

    // Get Current Time Pillars
    const nowPillars = getCurrentTimePillars();

    // Simplified Prophecy: Focus on Current Month's effect
    const currentMonthBranch = nowPillars.month.earthlyBranch;

    // Strategy: Just generic Clash check which is easy.
    const clash = isBranchClash(userDayBranch, currentMonthBranch);

    let content = "";
    if (clash) {
      content = getLang(PROPHECY_CLASH_WARNING, locale);
    } else {
      content = getLang(NARRATIVE_REGISTRY.prophecy.stability, locale);
    }

    const title = getLang(NARRATIVE_REGISTRY.prophecy.title, locale);

    return {
      sections: {
        prophecy: {
          badge: "Forecast",
          content,
          title,
        },
      } as any,
    };
  },
};

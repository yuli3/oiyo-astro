import { calculateVisualResonance } from "@/lib/engines/visual-resonance/engine";

import { ArchetypeOracle } from "./modules/archetype-oracle";
import { ElementalOracle } from "./modules/elemental-oracle";
import { ProphecyOracle } from "./modules/prophecy-oracle";
import { SocialOracle } from "./modules/social-oracle";
import { SynthesisOracle } from "./modules/synthesis-oracle";
import { VisualOracle } from "./modules/visual-oracle";
import { VocationOracle } from "./modules/vocation-oracle";
import { ORACLE_META } from "./shards/meta-narratives";
import type { GrandOracleInput, OracleContext, UnifiedFateReport } from "./types";
import { getLang } from "./weaver";

export async function generateGrandOracleReport(
  input: GrandOracleInput,
): Promise<UnifiedFateReport> {
  const ctx: OracleContext = {
    input,
    locale: input.locale || "en",
  };

  const { locale } = ctx;

  // 1. Run Modules in Parallel
  const [elemental, archetype, vocation, synthesis, visual, social, prophecy] =
    await Promise.all([
      ElementalOracle.run(ctx),
      ArchetypeOracle.run(ctx),
      VocationOracle.run(ctx),
      SynthesisOracle.run(ctx),
      VisualOracle.run(ctx),
      SocialOracle.run(ctx),
      ProphecyOracle.run(ctx),
    ]);

  // 2. Synthesize Results
  const cosmicNarrative = input.cosmic?.narrative
    ? (input.cosmic.narrative as Record<string, string | undefined>)[locale] ||
      input.cosmic.narrative.en
    : getLang(ORACLE_META.section_cosmic_entry_default, locale);

  const patronName = input.mythos.egyptian
    ? input.mythos.egyptian.patronDeity.name
    : locale === "ko"
      ? "고대의 수호자"
      : locale === "ja"
        ? "古代の守護者"
        : locale === "zh"
          ? "古代守护者"
          : locale === "es"
            ? "Guardián Antiguo"
            : locale === "fr"
              ? "Gardien Ancien"
              : "Ancient Guardian";

  const report: UnifiedFateReport = {
    sections: {
      cosmicEntry: {
        badge: "Origin",
        content: cosmicNarrative,
        title: getLang(ORACLE_META.section_cosmic_entry_title, locale),
      },
      elementalBlueprint: elemental.sections?.elementalBlueprint || {
        content: "...",
        title: "Elemental Blueprint",
      },
      mythicalArchetype: {
        content: patronName,
        title: getLang(ORACLE_META.section_mythical_archetype_title, locale),
      },
      prophecy: prophecy.sections?.prophecy,
      psychologicalMask: archetype.sections?.psychologicalMask || {
        content: "...",
        title: "Psychological Persona",
      },
      socialResonance: social.sections?.socialResonance,
      vocationPath: vocation.sections?.vocationPath,
    },
    summary: getLang(ORACLE_META.summary_intro, locale),
    synthesis: synthesis.synthesis || {
      alignmentScore: 85,
      paradoxKey: "Destiny vs Will",
      paradoxResolution: "The stars incline, but they do not compel.",
    },
    visualResonance:
      visual.visualResonance || calculateVisualResonance(input.saju, input.tci),
  };

  return report;
}

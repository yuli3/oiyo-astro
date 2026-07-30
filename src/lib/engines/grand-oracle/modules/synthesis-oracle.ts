import type { OracleContext, OracleModule, UnifiedFateReport } from "../types";

export const SynthesisOracle: OracleModule = {
  id: "synthesis",
  run: async (ctx: OracleContext): Promise<Partial<UnifiedFateReport>> => {
    const { saju, tci } = ctx.input;
    const { locale } = ctx;

    // Default paradox
    let paradoxKey =
      locale === "ko"
        ? "운명 대 의지"
        : locale === "ja"
          ? "運命対意志"
          : locale === "zh"
            ? "命运与意志"
            : locale === "es"
              ? "Destino vs Voluntad"
              : locale === "fr"
                ? "Destin vs Volonté"
                : "Destiny vs Will";

    let paradoxResolution =
      locale === "ko"
        ? "별들은 경향을 제시할 뿐, 강요하지 않습니다."
        : locale === "ja"
          ? "星は傾向を示すだけで、強制はしません。"
          : locale === "zh"
            ? "星象仅示趋向，而非强求。"
            : locale === "es"
              ? "Las estrellas inclinan, pero no obligan."
              : locale === "fr"
                ? "Les astres inclinent, mais ne contraignent pas."
                : "The stars incline, but they do not compel.";

    // Example Synthesis Logic: Introversion vs Expressive Element
    if (saju && tci) {
      const dayMaster = saju.dayMaster; // e.g., 'BYEONG' (Fire)
      const isIntroverted = tci.percentiles.HA > 70; // High Harm Avoidance

      // Fire Day Master + Introverted TCI
      if ((dayMaster === "BYEONG" || dayMaster === "JEONG") && isIntroverted) {
        paradoxKey =
          locale === "ko"
            ? "내면의 열정"
            : locale === "ja"
              ? "内なる情熱"
              : locale === "zh"
                ? "内在热情"
                : locale === "es"
                  ? "El Fuego Interior"
                  : locale === "fr"
                    ? "Le Feu Intérieur"
                    : "The Inner Fire";

        paradoxResolution =
          locale === "ko"
            ? "비록 당신의 기질은 신중하고 내향적이나, 그 중심에는 꺼지지 않는 불꽃이 타오르고 있습니다. 당신은 세상을 조용히, 그러나 확실하게 변화시킵니다."
            : locale === "ja"
              ? "あなたの気質は慎重で内向的ですが、その中心には消えることのない炎が燃えています。あなたは世界を静かに、しかし確実に変えていきます。"
              : locale === "zh"
                ? "虽然你的气质谨慎且内向，但你的核心燃烧着永不熄灭的火焰。你正在安静地、但实实在在地改变世界。"
                : locale === "es"
                  ? "Aunque tu temperamento es cauteloso e introvertido, un fuego inextinguible arde en tu núcleo. Cambias el mundo de forma silenciosa, pero segura."
                  : locale === "fr"
                    ? "Bien que votre tempérament soit prudent et introverti, un feu inextinguible brûle en vous. Vous changez le monde silencieusement, mais sûrement."
                    : "Although your temperament is cautious and introverted, an unquenchable fire burns at your core. You change the world quietly, but surely.";
      }

      // Water Day Master + Extroverted (Low HA, High RD)
      if ((dayMaster === "IM" || dayMaster === "GYE") && !isIntroverted) {
        paradoxKey =
          locale === "ko"
            ? "역동적인 흐름"
            : locale === "ja"
              ? "ダイナミックな流れ"
              : locale === "zh"
                ? "动态流动"
                : locale === "es"
                  ? "Flujo Dinámico"
                  : locale === "fr"
                    ? "Flux Dynamique"
                    : "Dynamic Flow";

        paradoxResolution =
          locale === "ko"
            ? "물은 본래 아래로 흐르려 하나, 당신의 기질은 그것을 솟구치게 합니다. 당신은 고요한 지혜를 역동적인 행동으로 바꾸는 힘을 가졌습니다."
            : locale === "ja"
              ? "水は本来下に流れるものですが、あなたの気質はそれを湧き上がらせます。あなたは静かな知恵をダイナミックな行動に変える力を持っています。"
              : locale === "zh"
                ? "水本自然向下流，但你的气质使其涌动。你拥有将沉静的智慧转化为动态行动的力量。"
                : locale === "es"
                  ? "El agua busca naturalmente la profundidad, pero tu temperamento la obliga a surgir. Posees el poder de transformar la sabiduría silenciosa en acción dinámica."
                  : locale === "fr"
                    ? "L'eau cherche naturellement la profondeur, mais votre tempérament la force à jaillir. Vous possédez le pouvoir de transformer la sagesse silencieuse en action dynamique."
                    : "Water naturally seeks depth, yet your temperament compels it to surge. You possess the power to transform silent wisdom into dynamic action.";
      }
    }

    return {
      synthesis: {
        alignmentScore: 88, // Placeholder logic
        paradoxKey,
        paradoxResolution,
      },
    } as any;
  },
};

import { SixLangString } from "./engine.contract";

/**
 * NarrativeRegistry
 * The central repository for all localized interpretation templates.
 * Achieves 100% Logic-Message Separation.
 */
export const NARRATIVE_REGISTRY: Record<
  string,
  Record<string, SixLangString>
> = {
  archetypes: {
    psychological_mask_title: {
      en: "Psychological Persona & Cosmic Role",
      es: "Persona Psicológica y Rol Cósmico",
      fr: "Persona Psychologique et Rôle Cosmique",
      ja: "心理的ペルソナと宇宙적役割",
      ko: "심리적 페르소나와 우주적 역할",
      zh: "心理人格与宇宙角色",
    },
    role_assignment: {
      en: "You have been assigned the role of **{role}** in this world.",
      es: "Se te ha otorgado el papel de **{role}** en este mundo.",
      fr: "On vous a confié le rôle de **{role}** dans ce monde.",
      ja: "あなたはこの世界で**{role}**の役割を与えられました。",
      ko: "당신은 이 세상에서 **{role}**의 역할을 부여받았습니다.",
      zh: "你在这个世界上被赋予了**{role}**的角色。",
    },
  },
  elemental: {
    blueprint_title: {
      en: "Elemental Blueprint",
      es: "Plano Elemental",
      fr: "Plan Élémentaire",
      ja: "五行の設計図",
      ko: "오행의 설계도",
      zh: "五行设计图",
    },
    insufficient_data: {
      en: "Insufficient Saju data for analysis.",
      es: "Datos de Saju insuficientes para el análisis.",
      fr: "Données Saju insuffisantes pour l'analyse.",
      ja: "四柱データが不足しているため、分析できません。",
      ko: "사주 데이터가 부족하여 분석할 수 없습니다.",
      zh: "由于缺乏四柱数据，无法进行分析。",
    },
    strategic_advice_label: {
      en: "Strategic Advice",
      es: "Consejo Estratégico",
      fr: "Conseil Stratégique",
      ja: "戦略的アドバイス",
      ko: "전략적 조언",
      zh: "战略建议",
    },
  },
  prophecy: {
    stability: {
      en: "The flow of time is in harmony with your foundation. Maintain stability.",
      es: "El flujo del tiempo está en armonía con tu base. Mantén la estabilidad.",
      fr: "Le flux du temps est en harmonie avec vos fondations. Maintenez la stabilité.",
      ja: "時の流れがあなたの基盤と調和しています。安定を維持してください。",
      ko: "시간의 흐름이 당신의 기반과 조화를 이루고 있습니다. 안정을 유지하십시오.",
      zh: "时间的流动与你的根基相和谐。保持稳定。",
    },
    title: {
      en: "Prophecy & Future Vision",
      es: "Profecía y Visión de Futuro",
      fr: "Prophétie et Vision du Futur",
      ja: "予言と未来のビジョン",
      ko: "예언과 미래 비전",
      zh: "预言与未来展望",
    },
  },
  social: {
    insufficient_data: {
      en: "Insufficient data for social dynamics analysis.",
      es: "Datos insuficientes para el análisis de dinámica social.",
      fr: "Données insuffisantes pour l'analyse de la dynamique sociale.",
      ja: "社会的ダイナミクスを分析するためのデータが不足しています。",
      ko: "사회적 역학을 분석하기 위한 데이터가 부족합니다.",
      zh: "缺乏分析社会动态的数据。",
    },
    title: {
      en: "Social Dynamics",
      es: "Dinámica Social",
      fr: "Dynamique Sociale",
      ja: "社会的ダイナミクス",
      ko: "사회적 역학",
      zh: "社会动态",
    },
  },
  synergy: {
    resonance_title: {
      en: "Cosmic Resonance Analysis",
      es: "Análisis de Resonancia Cósmica",
      fr: "Analyse de Résonance Cosmique",
      ja: "宇宙的共鳴分析",
      ko: "우주적 공명 분석",
      zh: "宇宙共鸣分析",
    },
  },
  vocation: {
    careers_header: {
      en: "Recommended Careers",
      es: "Carreras Recomendadas",
      fr: "Carrières Recommandées",
      ja: "推奨キャリア",
      ko: "추천 커리어",
      zh: "推荐职业",
    },
    insufficient_data: {
      en: "Insufficient vocational data.",
      es: "Datos vocacionales insuficientes.",
      fr: "Données vocationnelles insuffisantes.",
      ja: "職業適性データが不足しています。",
      ko: "직업 적성 데이터가 부족합니다.",
      zh: "职业适性数据不足。",
    },
    path_title: {
      en: "Vocation & Purpose Path",
      es: "Vocación y Camino de Propósito",
      fr: "Vocation et Chemin de Vie",
      ja: "天職と使命の道",
      ko: "천직과 소명의 길",
      zh: "天职与使命之路",
    },
    synergy_header: {
      en: "Ten God Synergy",
      es: "Sinergia de Ten God",
      fr: "Synergie des Dix Dieux",
      ja: "十神との相乗効果",
      ko: "십신과의 시너지",
      zh: "十神协力效应",
    },
  },
};

/**
 * Simple template formatter for registry narratives.
 */
export function formatNarrative(
  template: SixLangString,
  placeholders: Record<string, string>,
  locale: string,
): string {
  const lang = (locale.substring(0, 2) as keyof SixLangString) || "en";
  let text = template[lang] || template.en || "";

  Object.entries(placeholders).forEach(([key, value]) => {
    text = text.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });

  return text;
}

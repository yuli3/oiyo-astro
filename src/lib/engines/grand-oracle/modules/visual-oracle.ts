import { calculateVisualResonance } from "@/lib/engines/visual-resonance/engine";

import { OracleContext, OracleModule, UnifiedFateReport } from "../types";

export const VisualOracle: OracleModule = {
  id: "visual",
  run: async (ctx: OracleContext): Promise<Partial<UnifiedFateReport>> => {
    const { enneagram, riasec, saju, tci } = ctx.input;
    const { locale } = ctx;

    // Calculate Aura
    const { aura } = calculateVisualResonance(saju, tci, enneagram, riasec);

    // Generate Narrative
    const cName = colorName(aura.primaryColor, locale);
    const gName = geometryName(aura.geometry, locale);
    const fDesc = frequencyDesc(aura.frequency, locale);

    let content = "";
    if (locale === "ko") {
      content = `당신의 오라는 깊고 선명한 ${cName} 빛으로 타오르고 있으며, ${gName} 형태의 파동을 그립니다. 이는 당신의 내면이 가진 ${fDesc} 에너지를 시각적으로 보여줍니다.`;
    } else if (locale === "ja") {
      content = `あなたのオーラは深く鮮やかな${cName}の光で燃え上がっており、${gName}の形の波動を描いています。これは、あなたの内面が持つ${fDesc}エネルギーを視覚的に示しています。`;
    } else if (locale === "zh") {
      content = `你的光环燃烧着深邃而鲜艳的${cName}光芒，描绘出${gName}形状的波动。这真实地反映了你内心深处所拥有的${fDesc}能量。`;
    } else if (locale === "es") {
      content = `Tu aura arde con una luz ${cName} profunda y vívida, trazando ondas en forma de ${gName}. Esto manifiesta visualmente la energía ${fDesc} que reside en tu núcleo.`;
    } else if (locale === "fr") {
      content = `Votre aura brûle d'une lumière ${cName} profonde et vive, traçant des ondes sous la forme d'une ${gName}. Cela manifeste visuellement l'énergie ${fDesc} contenue dans votre cœur.`;
    } else {
      content = `Your aura burns with a deep, vivid ${cName} light, tracing waves in the form of a ${gName}. This visually manifests the ${fDesc} energy held within your core.`;
    }

    return {
      visualResonance: {
        aura,
        harmonyScore: 85,
      },
    };
  },
};

// Helpers
function colorName(hex: string, locale: string): string {
  const lang = locale.substring(0, 2);
  const colors: Record<string, Record<string, string>> = {
    "#f59e0b": {
      en: "Golden Amber",
      ko: "황금빛 호박색",
      ja: "ゴールデンアンバー",
      zh: "金琥珀色",
      es: "Ámbar Dorado",
      fr: "Ambre Doré",
    },
    "#ef4444": {
      en: "Intense Red",
      ko: "강렬한 붉은색",
      ja: "強烈な赤",
      zh: "烈焰红",
      es: "Rojo Intenso",
      fr: "Rouge Intense",
    },
    "#94a3b8": {
      en: "Cool Slate",
      ko: "서늘한 은회색",
      ja: "クールなスレートグレー",
      zh: "冷石灰色",
      es: "Pizarra Fría",
      fr: "Ardoise Froide",
    },
    "#3b82f6": {
      en: "Deep Blue",
      ko: "깊은 푸른색",
      ja: "深い青",
      zh: "深蓝色",
      es: "Azul Profundo",
      fr: "Bleu Profond",
    },
    "#10b981": {
      en: "Vibrant Emerald",
      ko: "생명력 넘치는 녹색",
      ja: "鮮やかなエメラルド",
      zh: "鲜艳的翡翠绿",
      es: "Esmeralda Vibrante",
      fr: "Émeraude Vibrante",
    },
  };

  const color = colors[hex];
  return color
    ? color[lang] || color.en
    : lang === "ko"
      ? "신비로운"
      : "mysterious";
}

function frequencyDesc(freq: number, locale: string): string {
  const lang = locale.substring(0, 2);
  if (freq > 1.2) {
    if (lang === "ko") return "역동적이고 빠른";
    if (lang === "ja") return "ダイナミックで速い";
    if (lang === "zh") return "动态且快速的";
    if (lang === "es") return "dinámica y rápida";
    if (lang === "fr") return "dynamique et rapide";
    return "dynamic and rapid";
  }
  if (freq < 0.8) {
    if (lang === "ko") return "안정적이고 고요한";
    if (lang === "ja") return "安定的で静かな";
    if (lang === "zh") return "稳定且宁静的";
    if (lang === "es") return "estable y serena";
    if (lang === "fr") return "stable et sereine";
    return "stable and serene";
  }
  if (lang === "ko") return "균형 잡힌";
  if (lang === "ja") return "バランスの取れた";
  if (lang === "zh") return "平衡的";
  if (lang === "es") return "equilibrada";
  if (lang === "fr") return "équilibrée";
  return "balanced";
}

function geometryName(geo: string, locale: string): string {
  const lang = locale.substring(0, 2);
  const geoms: Record<string, Record<string, string>> = {
    circle: {
      en: "Perfect Circle",
      ko: "완전한 원",
      ja: "完璧な円",
      zh: "圆满的正圆",
      es: "Círculo Perfecto",
      fr: "Cercle Parfait",
    },
    nebula: {
      en: "Mysterious Nebula",
      ko: "신비로운 성운",
      ja: "神秘的な星雲",
      zh: "神秘的星云",
      es: "Nebulosa Misteriosa",
      fr: "Nébuleuse Mystérieuse",
    },
    wave: {
      en: "Fluid Wave",
      ko: "유연한 파도",
      ja: "流動的な波",
      zh: "流动的波浪",
      es: "Onda Fluida",
      fr: "Onde Fluide",
    },
    mandala: {
      en: "Complex Mandala",
      ko: "복잡한 만다라",
      ja: "複雑なマンダラ",
      zh: "复杂的曼陀罗",
      es: "Mandala Complejo",
      fr: "Mandala Complexe",
    },
  };

  const g = geoms[geo];
  return g ? g[lang] || g.en : geo;
}

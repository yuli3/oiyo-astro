import { LocalizedText } from "@/types/manifest";

export interface MayanShard {
  signs: Array<{
    description: LocalizedText;
    direction: string;
    glyph: string;
    id: string;
    keywords: LocalizedText[];
    name: LocalizedText;
  }>;
}

export const mayanData: MayanShard = {
  signs: [
    {
      description: {
        cn: "象征着诞生和滋养。拥有原始的能量和创造力。",
        en: "Symbolizes birth and nourishment. Possesses primal energy and creative power.",
        es: "Simboliza el nacimiento y la nutrición. Posee energía primitiva y poder creativo.",
        fr: "Symbolise la naissance et la nourriture. Possède une énergie primordiale et un pouvoir créatif.",
        ja: "誕生と慈愛を象徴します。根源的なエネルギーと創造の力を持っています。",
        ko: "생명의 탄생과 영양 공급을 상징합니다. 원초적인 에너지와 창조의 힘을 가집니다.",
      },
      direction: "East",
      glyph: "🐉",
      id: "imix",
      keywords: [
        {
          cn: "诞生",
          en: "Birth",
          es: "Nacimiento",
          fr: "Naissance",
          ja: "誕生",
          ko: "탄생",
        },
        {
          cn: "滋养",
          en: "Nurturing",
          es: "Crianza",
          fr: "Éducation",
          ja: "育成",
          ko: "양육",
        },
      ],
      name: {
        cn: "红龙 (Imix)",
        en: "Red Dragon",
        es: "Dragón Rojo (Imix)",
        fr: "Dragon Rouge (Imix)",
        ja: "赤い竜 (Imix)",
        ko: "이믹스 (붉은 용)",
      },
    },
    {
      description: {
        cn: "象征沟通和灵感。代表精神能量和思想的传递。",
        en: "Symbolizes communication and inspiration. Represents mental energy and transmission of thoughts.",
        es: "Simboliza la comunicación y la inspiración. Representa la energía mental y la transmisión de pensamientos.",
        fr: "Symbolise la communication et l'inspiration. Représente l'énergie mentale et la transmission des pensées.",
        ja: "コミュニケーションとインスピレーションを象徴します。精神的なエネルギーと思考の伝達を表します。",
        ko: "소통과 영감을 상징합니다. 정신적인 에너지와 생각의 전달을 의미합니다.",
      },
      direction: "North",
      glyph: "🌬️",
      id: "ik",
      keywords: [
        {
          cn: "呼吸",
          en: "Breath",
          es: "Aliento",
          fr: "Souffle",
          ja: "呼吸",
          ko: "숨결",
        },
        {
          cn: "沟通",
          en: "Communication",
          es: "Comunicación",
          fr: "Communication",
          ja: "伝達",
          ko: "소통",
        },
      ],
      name: {
        cn: "白风 (Ik)",
        en: "White Wind",
        es: "Viento Blanco (Ik)",
        fr: "Vent Blanc (Ik)",
        ja: "白い風 (Ik)",
        ko: "이크 (하얀 바람)",
      },
    },
    {
      description: {
        cn: "象征梦想和潜意识。代表内在的丰富和直觉。",
        en: "Symbolizes dreams and the unconscious. Represents inner abundance and intuition.",
        es: "Simboliza los sueños y el inconsciente. Representa la abundancia interior y la intuición.",
        fr: "Symbolise les rêves et l'inconscient. Représente l'abundancia intérieure et l'intuition.",
        ja: "夢と無意識を象徴します. 内面の豊かさと直感を意味します。",
        ko: "꿈과 무의식을 상징합니다. 내면의 풍요로움과 직관을 의미합니다.",
      },
      direction: "West",
      glyph: "🌃",
      id: "akbal",
      keywords: [
        {
          cn: "梦想",
          en: "Dream",
          es: "Sueño",
          fr: "Rêve",
          ja: "夢",
          ko: "꿈",
        },
        {
          cn: "直觉",
          en: "Intuition",
          es: "Intuición",
          fr: "Intuition",
          ja: "直感",
          ko: "직관",
        },
      ],
      name: {
        cn: "蓝夜 (Akbal)",
        en: "Blue Night",
        es: "Noche Azul (Akbal)",
        fr: "Nuit Bleue (Akbal)",
        ja: "青い夜 (Akbal)",
        ko: "아크발 (푸른 밤)",
      },
    },
    {
      description: {
        cn: "象征潜力和目标设定。代表成长的意图和专注。",
        en: "Symbolizes potential and targeting. Represents intention and focus for growth.",
        es: "Simboliza el potencial y la focalización. Representa la intención y el enfoque para el crecimiento.",
        fr: "Symbolise le potentiel et le ciblage. Représente l'intention et la concentration pour la croissance.",
        ja: "可能性と目標設定を象徴します。成長のための意図と集中を表します。",
        ko: "잠재력과 목표 설정을 상징합니다. 성장을 위한 의도와 집중을 의미합니다.",
      },
      direction: "South",
      glyph: "🌱",
      id: "kan",
      keywords: [
        {
          cn: "觉知",
          en: "Awareness",
          es: "Conciencia",
          fr: "Conscience",
          ja: "気づき",
          ko: "자각",
        },
        {
          cn: "目标",
          en: "Targeting",
          es: "Objetivo",
          fr: "Ciblage",
          ja: "目標",
          ko: "목표",
        },
      ],
      name: {
        cn: "黄种子 (Kan)",
        en: "Yellow Seed",
        es: "Semilla Amarilla (Kan)",
        fr: "Graine Jaune (Kan)",
        ja: "黄色い種 (Kan)",
        ko: "칸 (노란 씨앗)",
      },
    },
    {
      description: {
        cn: "象征生命力和本能。代表身体能量和激情。",
        en: "Symbolizes life force and instinct. Represents physical energy and passion.",
        es: "Simboliza la fuerza vital y el instinto. Representa la energía física y la pasión.",
        fr: "Symbolise la force vitale et l'instinct. Représente l'énergie physique et la passion.",
        ja: "生命力と本能を象徴します. 身体的なエネルギーと情熱を表します。",
        ko: "생명력과 본능을 상징합니다. 육체적인 에너지와 열정을 의미합니다.",
      },
      direction: "East",
      glyph: "🐍",
      id: "chicchan",
      keywords: [
        {
          cn: "本能",
          en: "Instinct",
          es: "Instinto",
          fr: "Instinct",
          ja: "本能",
          ko: "본능",
        },
        {
          cn: "生命力",
          en: "Life Force",
          es: "Fuerza Vital",
          fr: "Force Vitale",
          ja: "生命력",
          ko: "생명력",
        },
      ],
      name: {
        cn: "红蛇 (Chicchan)",
        en: "Red Serpent",
        es: "Serpiente Roja (Chicchan)",
        fr: "Serpent Rouge (Chicchan)",
        ja: "赤い蛇 (Chicchan)",
        ko: "치찬 (붉은 뱀)",
      },
    },
  ],
};

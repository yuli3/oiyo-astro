/**
 * Interpretation Engine Glossary
 * The Grand Archive - Terminology Definitions
 *
 * Provides localized definitions for astrology/ontology terms.
 * Used for UI tooltips and educational content.
 */

import { GlossaryHint, SixLangString } from "./engine.contract";

// ============================================================================
// SAJU Terminology
// ============================================================================

export const SAJU_GLOSSARY: Record<string, GlossaryHint> = {
  dayMaster: {
    definition: {
      en: "The Heavenly Stem of your birth day, representing your core self and fundamental nature.",
      es: "El Tronco Celestial de tu día de nacimiento, representando tu ser esencial y naturaleza fundamental.",
      ja: "あなたの生まれた日の天干で、核心的な自己と根本的な本質を表します。",
      ko: "당신의 생일 천간으로, 핵심 자아와 근본적인 본성을 나타냅니다.",
      zh: "你出生日的天干，代表你的核心自我和根本性质。",
    },
    term: "Day Master (일간)",
  },
  fiveElements: {
    definition: {
      en: "Wood, Fire, Earth, Metal, and Water - the five fundamental forces that cycle through nature and your birth chart.",
      es: "Madera, Fuego, Tierra, Metal y Agua - las cinco fuerzas fundamentales que circulan en la naturaleza y tu carta natal.",
      ja: "木、火、土、金、水 - 自然とあなたの出生チャートを循環する5つの根本的な力。",
      ko: "목, 화, 토, 금, 수 - 자연과 사주를 순환하는 다섯 가지 근본적인 힘.",
      zh: "木、火、土、金、水 - 在自然和你的命盘中循环的五种基本力量。",
    },
    term: "Five Elements (오행)",
  },
  noblePerson: {
    definition: {
      en: "A benefactor energy in your chart indicating where helpful people and support will come from in your life.",
      es: "Una energía benefactora en tu carta que indica de dónde vendrán las personas útiles y el apoyo en tu vida.",
      ja: "あなたの人生で助けてくれる人やサポートがどこから来るかを示すチャート内の貴人エネルギー。",
      ko: "사주에서 당신의 삶에 도움을 주는 사람과 지지가 어디서 오는지를 나타내는 귀인 에너지.",
      zh: "命盘中的贵人能量，表示你生命中有益的人和支持将从何而来。",
    },
    term: "Noble Person (귀인)",
  },
  spousePalace: {
    definition: {
      en: "The Earthly Branch of your Day Pillar, which reveals the nature of your marriage and ideal partner qualities.",
      es: "La Rama Terrenal de tu Pilar del Día, que revela la naturaleza de tu matrimonio y las cualidades del compañero ideal.",
      ja: "日柱の地支で、結婚の性質と理想的なパートナーの資質を明らかにします。",
      ko: "일주의 지지로, 결혼의 성격과 이상적인 배우자의 자질을 드러냅니다.",
      zh: "日柱的地支，揭示你婚姻的性质和理想伴侣的品质。",
    },
    term: "Spouse Palace (배우자궁)",
  },
  tenGods: {
    definition: {
      en: "Ten relational archetypes derived from the interaction between your Day Master and other pillars. They describe how energy flows in your chart.",
      es: "Diez arquetipos relacionales derivados de la interacción entre tu Maestro del Día y otros pilares.",
      ja: "日干と他の柱との相互作用から導き出される10の関係的アーキタイプ。あなたのチャートでエネルギーがどのように流れるかを説明します。",
      ko: "일간과 다른 기둥 간의 상호작용에서 도출되는 10가지 관계적 원형. 사주에서 에너지가 어떻게 흐르는지 설명합니다.",
      zh: "从日主与其他柱的互动中衍生的十种关系原型。描述能量在你的命盘中如何流动。",
    },
    term: "Ten Gods (십신)",
  },
};

// ============================================================================
// HELLENISTIC Terminology
// ============================================================================

export const HELLENISTIC_GLOSSARY: Record<string, GlossaryHint> = {
  lotOfFortune: {
    definition: {
      en: "A calculated point in your chart revealing where material prosperity and physical well-being are activated.",
      es: "Un punto calculado en tu carta que revela dónde se activan la prosperidad material y el bienestar físico.",
      ja: "物質的繁栄と身体的幸福がどこで活性化されるかを明らかにするチャート内の計算されたポイント。",
      ko: "물질적 번영과 신체적 안녕이 활성화되는 곳을 드러내는 차트의 계산된 지점.",
      zh: "星盘中的一个计算点，揭示物质繁荣和身体健康在哪里被激活。",
    },
    term: "Lot of Fortune (행운의 로트)",
  },
  sect: {
    definition: {
      en: "Whether you were born during the day (diurnal) or night (nocturnal). This fundamentally changes how planets express themselves in your chart.",
      es: "Si naciste durante el día (diurno) o la noche (nocturno). Esto cambia fundamentalmente cómo se expresan los planetas en tu carta.",
      ja: "日中（昼間）に生まれたか、夜（夜間）に生まれたか。これは惑星があなたのチャートでどのように表現されるかを根本的に変えます。",
      ko: "주간(낮)에 태어났는지 야간(밤)에 태어났는지. 이것은 행성이 차트에서 어떻게 표현되는지를 근본적으로 바꿉니다.",
      zh: "你是在白天（日盘）还是晚上（夜盘）出生。这从根本上改变了行星在你星盘中的表达方式。",
    },
    term: "Sect (세력)",
  },
  triplicity: {
    definition: {
      en: "A grouping of zodiac signs by element (Fire, Earth, Air, Water). The rulers of your Sun's triplicity influence different life phases.",
      es: "Una agrupación de signos zodiacales por elemento (Fuego, Tierra, Aire, Agua). Los regentes de la triplicidad de tu Sol influyen en diferentes fases de la vida.",
      ja: "元素別に分類された黄道帯星座（火、土、風、水）。太陽のトリプリシティの支配者があなたの人生の異なる段階に影響を与えます。",
      ko: "원소별로 그룹화된 황도대 별자리 (화, 토, 풍, 수). 태양 삼합의 지배자들이 인생의 다른 단계에 영향을 미칩니다.",
      zh: "按元素分组的黄道星座（火、土、风、水）。你太阳三分相的主宰影响不同的人生阶段。",
    },
    term: "Triplicity (삼합)",
  },
};

// ============================================================================
// MAYAN Terminology
// ============================================================================

export const MAYAN_GLOSSARY: Record<string, GlossaryHint> = {
  galacticTone: {
    definition: {
      en: "A number from 1-13 that describes how your Solar Seal energy expresses itself in the world.",
      es: "Un número del 1 al 13 que describe cómo se expresa en el mundo la energía de tu Sello Solar.",
      ja: "あなたのソーラーシールエネルギーが世界でどのように表現されるかを説明する1〜13の数字。",
      ko: "태양 인장 에너지가 세상에서 어떻게 표현되는지를 설명하는 1-13 사이의 숫자.",
      zh: "1-13的数字，描述你的太阳印记能量如何在世界中表达。",
    },
    term: "Galactic Tone (갤럭틱 톤)",
  },
  kin: {
    definition: {
      en: "Your unique Galactic Signature, the combination of your Solar Seal and Galactic Tone (1-260).",
      es: "Tu Firma Galáctica única, la combinación de tu Sello Solar y Tono Galáctico (1-260).",
      ja: "あなた独自の銀河署名、ソーラーシールとギャラクティックトーンの組み合わせ（1-260）。",
      ko: "당신의 고유한 은하 서명, 태양 인장과 갤럭틱 톤의 조합 (1-260).",
      zh: "你独特的银河签名，太阳印记和银河音调的组合（1-260）。",
    },
    term: "Kin (킨)",
  },
  solarSeal: {
    definition: {
      en: "One of 20 archetypal energies (like Red Dragon, White Wind) that represents your core essence in the Mayan Dreamspell.",
      es: "Una de 20 energías arquetípicas (como Dragón Rojo, Viento Blanco) que representa tu esencia central en el Dreamspell maya.",
      ja: "マヤドリームスペルであなたの核心的な本質を表す20のアーキタイプエネルギーの1つ（レッドドラゴン、ホワイトウィンドなど）。",
      ko: "마야 드림스펠에서 당신의 핵심 본질을 나타내는 20가지 원형적 에너지 중 하나 (레드 드래곤, 화이트 윈드 등).",
      zh: "玛雅梦咒中代表你核心本质的20种原型能量之一（如红龙、白风）。",
    },
    term: "Solar Seal (태양 인장)",
  },
};

// ============================================================================
// EGYPTIAN Terminology
// ============================================================================

export const EGYPTIAN_GLOSSARY: Record<string, GlossaryHint> = {
  egyptianDeity: {
    definition: {
      en: "The ancient Egyptian god assigned to your birth date, representing the cosmic forces that influence your destiny.",
      ko: "당신의 생년월일에 배정된 고대 이집트 신으로, 운명에 영향을 미치는 우주 세력을 나타냅니다.",
    },
    term: "Egyptian Deity (이집트 수호신)",
  },
  solarZodiac: {
    definition: {
      en: "The Egyptian solar calendar-based zodiac system where each deity rules specific date ranges throughout the year.",
      ko: "각 신이 연중 특정 날짜 범위를 지배하는 이집트 태양력 기반 황도대 시스템.",
    },
    term: "Solar Zodiac (태양 황도대)",
  },
};

// ============================================================================
// ZIWEI Terminology
// ============================================================================

export const ZIWEI_GLOSSARY: Record<string, GlossaryHint> = {
  ziweiBureau: {
    definition: {
      en: "The elemental bureau (Wood, Fire, Earth, Metal, Water) that determines how cosmic energy flows through your Zi Wei chart.",
      ko: "자미두수 차트를 통해 우주 에너지가 어떻게 흐르는지 결정하는 오행국 (목국, 화국, 토국, 금국, 수국).",
    },
    term: "Bureau (국)",
  },
  ziweiPalace: {
    definition: {
      en: "One of twelve life palaces in Zi Wei Dou Shu, each governing a specific area of life such as career, marriage, or health.",
      ko: "자미두수의 12궁 중 하나로, 각각 직업, 결혼, 건강과 같은 삶의 특정 영역을 지배합니다.",
    },
    term: "Palace (궁)",
  },
};

// ============================================================================
// KABBALAH Terminology
// ============================================================================

export const KABBALAH_GLOSSARY: Record<string, GlossaryHint> = {
  sephira: {
    definition: {
      en: "One of ten divine emanations on the Tree of Life, representing different aspects of God and stages of creation.",
      ko: "생명나무의 10가지 신성한 발출 중 하나로, 신의 다른 측면과 창조의 단계를 나타냅니다.",
    },
    term: "Sephira (세피라)",
  },
  treeOfLife: {
    definition: {
      en: "The central symbol of Kabbalah mysticism, mapping the path from divine unity to material existence and back.",
      ko: "카발라 신비주의의 중심 상징으로, 신성한 일체에서 물질적 존재로, 그리고 다시 돌아가는 경로를 매핑합니다.",
    },
    term: "Tree of Life (생명나무)",
  },
};

// ============================================================================
// NORDIC Terminology
// ============================================================================

export const NORDIC_GLOSSARY: Record<string, GlossaryHint> = {
  aett: {
    definition: {
      en: "A group of eight runes in the Elder Futhark, named after a Norse deity (Freya, Hagal, Tyr).",
      ko: "북유럽 신의 이름을 딴 엘더 푸사르크의 8개 룬 그룹 (프레이아, 하갈, 티르).",
    },
    term: "Aett (에트)",
  },
  runeElder: {
    definition: {
      en: "One of 24 ancient Germanic symbols used for writing, divination, and magic in the Elder Futhark system.",
      ko: "엘더 푸사르크 시스템에서 글쓰기, 점술, 마법에 사용되는 24개의 고대 게르만 상징 중 하나.",
    },
    term: "Rune (룬)",
  },
};

// ============================================================================
// TAROT Terminology
// ============================================================================

export const TAROT_GLOSSARY: Record<string, GlossaryHint> = {
  majorArcana: {
    definition: {
      en: "The 22 trump cards of a tarot deck, representing life's spiritual lessons and karmic influences.",
      ko: "타로 덱의 22장 트럼프 카드로, 삶의 영적 교훈과 업의 영향을 나타냅니다.",
    },
    term: "Major Arcana (메이저 아르카나)",
  },
  tarotReversed: {
    definition: {
      en: "When a tarot card appears upside-down, it may indicate blocked energy, internalized lessons, or the shadow aspect of the card's meaning.",
      ko: "타로 카드가 뒤집어져 나타날 때, 막힌 에너지, 내면화된 교훈, 또는 카드 의미의 그림자 측면을 나타낼 수 있습니다.",
    },
    term: "Reversed Card (역방향 카드)",
  },
};

// ============================================================================
// CELTIC Terminology
// ============================================================================

export const CELTIC_GLOSSARY: Record<string, GlossaryHint> = {
  birthTree: {
    definition: {
      en: "One of 13 sacred trees in the Celtic Ogham calendar, each corresponding to a period in the lunar year.",
      ko: "켈트 오감 달력의 13가지 신성한 나무 중 하나로, 각각 음력 연도의 기간에 해당합니다.",
    },
    term: "Birth Tree (탄생 나무)",
  },
  oghamLetter: {
    definition: {
      en: "An ancient Celtic alphabet symbol, each letter representing a tree and its associated magical meanings.",
      ko: "고대 켈트 알파벳 기호로, 각 문자는 나무와 관련된 마법적 의미를 나타냅니다.",
    },
    term: "Ogham Letter (오감 문자)",
  },
};

// ============================================================================
// Aggregated Glossary
// ============================================================================

export const MASTER_GLOSSARY: Record<string, GlossaryHint> = {
  ...SAJU_GLOSSARY,
  ...HELLENISTIC_GLOSSARY,
  ...MAYAN_GLOSSARY,
  ...EGYPTIAN_GLOSSARY,
  ...ZIWEI_GLOSSARY,
  ...KABBALAH_GLOSSARY,
  ...NORDIC_GLOSSARY,
  ...TAROT_GLOSSARY,
  ...CELTIC_GLOSSARY,
};

/**
 * Get glossary hints for a list of term keys.
 */
export function getGlossaryHints(termKeys: string[]): GlossaryHint[] {
  return termKeys
    .map((key) => MASTER_GLOSSARY[key])
    .filter(Boolean) as GlossaryHint[];
}

import type { SixLangString } from "../engine.contract";
import { CHARACTER_DATA, TEMPERAMENT_DATA } from "../shards/tci-deep-shards";

/**
 * Deep TCI (Temperament and Character Inventory) Interpretation Engine
 * The Grand Archive - Cloninger's Psychobiological Model
 */

// ============================================================================
// Types
// ============================================================================

export interface TCIDeepInterpretation {
  /** Character dimensions (matured through development) */
  characterDimensions: CharacterDimension[];
  /** Life integration summary */
  lifeIntegration: SixLangString;
  /** Overall personality synthesis */
  synthesis: SixLangString;
  /** Temperament dimensions (innate, biological) */
  temperamentDimensions: TemperamentDimension[];
}

interface CharacterDimension {
  /** Growth recommendations */
  growthPath: SixLangString;
  interpretation: SixLangString;
  key: "C" | "SD" | "ST";
  level: "high" | "low" | "moderate";
  name: SixLangString;
  score: number;
}

interface TemperamentDimension {
  /** Challenges at extreme levels */
  challenges: SixLangString;
  /** Detailed narrative about this score level */
  interpretation: SixLangString;
  key: "HA" | "NS" | "P" | "RD";
  /** Score level classification */
  level: "high" | "low" | "moderate";
  name: SixLangString;
  score: number;
}

// ============================================================================
// Engine Function
// ============================================================================

export function interpretTCIDeep(scores: {
  C: number;
  HA: number;
  NS: number;
  P: number;
  RD: number;
  SD: number;
  ST: number;
}): TCIDeepInterpretation {
  const getLevel = (score: number): "high" | "low" | "moderate" => {
    if (score <= 35) return "low";
    if (score <= 65) return "moderate";
    return "high";
  };

  const LEVEL_WORD: Record<"high" | "low" | "moderate", SixLangString> = {
    high: { en: "high", es: "alta", fr: "élevée", ja: "高い", ko: "높은", zh: "较高的" },
    low: { en: "low", es: "baja", fr: "faible", ja: "低い", ko: "낮은", zh: "较低的" },
    moderate: { en: "moderate", es: "moderada", fr: "modérée", ja: "中程度の", ko: "보통 수준의", zh: "中等的" },
  };
  const levelWord = (score: number, locale: keyof SixLangString): string => LEVEL_WORD[getLevel(score)][locale] ?? LEVEL_WORD[getLevel(score)].en;

  const temperamentDimensions: TemperamentDimension[] = [
    {
      key: "NS",
      level: getLevel(scores.NS),
      name: {
        en: "Novelty Seeking",
        es: "Búsqueda de Novedad",
        fr: "Recherche de Nouveauté",
        ja: "新奇性追求",
        ko: "자극 추구",
        zh: "追求新奇",
      },
      score: scores.NS,
      ...TEMPERAMENT_DATA.NS[getLevel(scores.NS)],
    },
    {
      key: "HA",
      level: getLevel(scores.HA),
      name: {
        en: "Harm Avoidance",
        es: "Evitación del Daño",
        fr: "Évitement du Danger",
        ja: "危害回避",
        ko: "위험 회피",
        zh: "回避伤害",
      },
      score: scores.HA,
      ...TEMPERAMENT_DATA.HA[getLevel(scores.HA)],
    },
    {
      key: "RD",
      level: getLevel(scores.RD),
      name: {
        en: "Reward Dependence",
        es: "Dependencia de Recompensa",
        fr: "Dépendance à la Récompense",
        ja: "報酬依存",
        ko: "보상 의존",
        zh: "奖励依赖",
      },
      score: scores.RD,
      ...TEMPERAMENT_DATA.RD[getLevel(scores.RD)],
    },
    {
      key: "P",
      level: getLevel(scores.P),
      name: {
        en: "Persistence",
        es: "Persistencia",
        fr: "Persistance",
        ja: "持続性",
        ko: "인내력",
        zh: "持久性",
      },
      score: scores.P,
      ...TEMPERAMENT_DATA.P[getLevel(scores.P)],
    },
  ];

  const characterDimensions: CharacterDimension[] = [
    {
      key: "SD",
      level: getLevel(scores.SD),
      name: {
        en: "Self-Directedness",
        es: "Auto-Dirección",
        fr: "Autodétermination",
        ja: "自己志向性",
        ko: "자기 주도성",
        zh: "自我导向",
      },
      score: scores.SD,
      ...CHARACTER_DATA.SD[getLevel(scores.SD)],
    },
    {
      key: "C",
      level: getLevel(scores.C),
      name: {
        en: "Cooperativeness",
        es: "Cooperatividad",
        fr: "Coopération",
        ja: "協調性",
        ko: "협동성",
        zh: "合作性",
      },
      score: scores.C,
      ...CHARACTER_DATA.C[getLevel(scores.C)],
    },
    {
      key: "ST",
      level: getLevel(scores.ST),
      name: {
        en: "Self-Transcendence",
        es: "Auto-Trascendencia",
        fr: "Auto-Transcendence",
        ja: "自己超越",
        ko: "자기 초월",
        zh: "自我超越",
      },
      score: scores.ST,
      ...CHARACTER_DATA.ST[getLevel(scores.ST)],
    },
  ];

  const synthesis: SixLangString = {
    en: `Your temperament blend (innate) shows ${levelWord(scores.NS, 'en')} novelty seeking, ${levelWord(scores.HA, 'en')} harm avoidance, ${levelWord(scores.RD, 'en')} reward dependence, and ${levelWord(scores.P, 'en')} persistence. Your character development includes ${levelWord(scores.SD, 'en')} self-directedness, ${levelWord(scores.C, 'en')} cooperativeness, and ${levelWord(scores.ST, 'en')} self-transcendence.`,
    es: `Tu combinación de temperamento (innato) muestra búsqueda de novedad ${levelWord(scores.NS, 'es')}, evitación del daño ${levelWord(scores.HA, 'es')}, dependencia de la recompensa ${levelWord(scores.RD, 'es')} y persistencia ${levelWord(scores.P, 'es')}. El desarrollo de tu carácter incluye auto-dirección ${levelWord(scores.SD, 'es')}, cooperatividad ${levelWord(scores.C, 'es')} y auto-trascendencia ${levelWord(scores.ST, 'es')}.`,
    fr: `Votre mélange de tempérament (inné) montre une recherche de nouveauté ${levelWord(scores.NS, 'fr')}, un évitement du danger ${levelWord(scores.HA, 'fr')}, une dépendance à la récompense ${levelWord(scores.RD, 'fr')} et une persistance ${levelWord(scores.P, 'fr')}. Le développement de votre caractère comprend une autodétermination ${levelWord(scores.SD, 'fr')}, une coopération ${levelWord(scores.C, 'fr')} et une auto-transcendance ${levelWord(scores.ST, 'fr')}.`,
    ja: `気質（先天的）のブレンドは、${levelWord(scores.NS, 'ja')}新奇性追求、${levelWord(scores.HA, 'ja')}危害回避、${levelWord(scores.RD, 'ja')}報酬依存、${levelWord(scores.P, 'ja')}持続性を示しています。性格（後天的）の発達には、${levelWord(scores.SD, 'ja')}自己志向性、${levelWord(scores.C, 'ja')}協調性、${levelWord(scores.ST, 'ja')}自己超越が含まれます。`,
    ko: `기질 조합(선천적)은 ${levelWord(scores.NS, 'ko')} 자극 추구, ${levelWord(scores.HA, 'ko')} 위험 회피, ${levelWord(scores.RD, 'ko')} 보상 의존, ${levelWord(scores.P, 'ko')} 인내력을 보입니다. 성격 발달은 ${levelWord(scores.SD, 'ko')} 자기 주도성, ${levelWord(scores.C, 'ko')} 협동성, ${levelWord(scores.ST, 'ko')} 자기 초월을 포함합니다.`,
    zh: `你的气质组合（先天）表现出${levelWord(scores.NS, 'zh')}追求新奇、${levelWord(scores.HA, 'zh')}回避伤害、${levelWord(scores.RD, 'zh')}奖励依赖和${levelWord(scores.P, 'zh')}持久性。你的性格发展包括${levelWord(scores.SD, 'zh')}自我导向、${levelWord(scores.C, 'zh')}合作性和${levelWord(scores.ST, 'zh')}自我超越。`,
  };

  const lifeIntegration: SixLangString = {
    en: "This TCI profile reveals how your innate temperament interacts with the character you've developed through life experiences. Understanding this helps you leverage your natural tendencies while consciously developing areas for growth.",
    es: "Este perfil TCI revela cómo tu temperamento innato interactúa con el carácter que has desarrollado a través de las experiencias de la vida. Comprender esto te ayuda a aprovechar tus tendencias naturales mientras desarrollas conscientemente áreas de crecimiento.",
    fr: "Ce profil TCI révèle comment votre tempérament inné interagit avec le caractère que vous avez développé à travers les expériences de la vie. Comprendre cela vous aide à tirer parti de vos tendances naturelles tout en développant consciemment des domaines de croissance.",
    ja: "このTCIプロファイルは、先天的気質が人生経験を通じて培われた性格とどのように相互作用するかを明らかにします。これを理解することで、自然な傾向を活かしつつ、成長が必要な部分を意識的に育てるのに役立ちます。",
    ko: "이 TCI 프로필은 타고난 기질이 삶의 경험을 통해 개발한 성격과 어떻게 상호작용하는지 보여줍니다. 이를 이해하면 자연스러운 경향을 활용하면서 의식적으로 성장 영역을 개발할 수 있습니다.",
    zh: "这份 TCI 剖面揭示了你的先天气质如何与你通过生活经历发展出的性格相互作用。理解这一点有助于你利用自然倾向，同时有意识地培养需要增长的领域。",
  };

  return {
    characterDimensions,
    lifeIntegration,
    synthesis,
    temperamentDimensions,
  };
}

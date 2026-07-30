import type { LocalizedText } from "@/types/manifest";

export interface DimensionMetadata {
  category: ResonanceCategory;
  icon?: string;
  id: ResonanceDimensionId;
  label: LocalizedText;
}

export interface PartnerPartialProfile {
  birthDate?: string; // civil date, YYYY-MM-DD
  /** Resolved UTC instant. Never derive this from birthDate/birthTime alone. */
  birthInstant?: Date;
  birthLongitude?: number;
  birthTime?: string; // HH:mm
  bloodType?: string;
  gender?: "female" | "male";
  mbti?: string;
  name?: string;
}

export type ResonanceCategory =
  | "Biological"
  | "Fate"
  | "Personality"
  | "Spirit";

export type ResonanceDimensionId =
  | "blood_type"
  | "celtic"
  | "cosmic"
  | "egyptian"
  | "enneagram"
  | "iching"
  | "love_language"
  | "mayan"
  | "mbti"
  | "numerology"
  | "onomancy"
  | "saju"
  | "zodiac";

export const DIMENSION_METADATA: Record<
  ResonanceDimensionId,
  DimensionMetadata
> = {
  blood_type: {
    category: "Biological",
    id: "blood_type",
    label: {
      zh: "血型",
      en: "Blood Type",
      es: "Grupo Sanguíneo",
      fr: "Groupe Sanguin",
      ja: "血液型",
      ko: "혈액형",
    },
  },
  celtic: {
    category: "Fate",
    id: "celtic",
    label: {
      zh: "凯尔特树",
      en: "Celtic Tree",
      es: "Árbol Celta",
      fr: "Arbre Celtique",
      ja: "ケルティックツリー",
      ko: "켈틱 트리",
    },
  },
  cosmic: {
    category: "Fate",
    id: "cosmic",
    label: {
      zh: "宇宙同步",
      en: "Cosmic Sync",
      es: "Sincronía Cósmica",
      fr: "Sync Cosmique",
      ja: "宇宙同期",
      ko: "천체 동기화",
    },
  },
  egyptian: {
    category: "Fate",
    id: "egyptian",
    label: {
      zh: "埃及守护神",
      en: "Egyptian Fate",
      es: "Destino Egipcio",
      fr: "Destin Égyptien",
      ja: "エジプト守護神",
      ko: "이집트 수호신",
    },
  },
  enneagram: {
    category: "Personality",
    id: "enneagram",
    label: {
      zh: "九型人格",
      en: "Enneagram",
      es: "Eneagrama",
      fr: "Ennéagramme",
      ja: "エニアグラム",
      ko: "에니어그램",
    },
  },
  iching: {
    category: "Spirit",
    id: "iching",
    label: {
      zh: "周易占卜",
      en: "I-Ching Oracle",
      es: "Oráculo I-Ching",
      fr: "Oracle Yi Jing",
      ja: "周易オラクル",
      ko: "주역 오라클",
    },
  },
  love_language: {
    category: "Personality",
    id: "love_language",
    label: {
      zh: "爱的语言",
      en: "Love Language",
      es: "Lenguaje del Amor",
      fr: "Langage de l Amour",
      ja: "愛の言語",
      ko: "사랑의 언어",
    },
  },
  mayan: {
    category: "Fate",
    id: "mayan",
    label: {
      zh: "玛雅守护神",
      en: "Mayan Glyph",
      es: "Glifo Maya",
      fr: "Glyphe Maya",
      ja: "マヤの守護神",
      ko: "마야 수호신",
    },
  },
  mbti: {
    category: "Personality",
    id: "mbti",
    label: {
      zh: "MBTI性格",
      en: "MBTI",
      es: "MBTI",
      fr: "MBTI",
      ja: "MBTI性格",
      ko: "MBTI 성격",
    },
  },
  numerology: {
    category: "Fate",
    id: "numerology",
    label: {
      zh: "数秘术",
      en: "Numerology",
      es: "Numerología",
      fr: "Numérologie",
      ja: "数秘術",
      ko: "수비학",
    },
  },
  onomancy: {
    category: "Spirit",
    id: "onomancy",
    label: {
      zh: "姓名学和谐",
      en: "Sonic Harmony",
      es: "Armonía Sonora",
      fr: "Harmonie Sonore",
      ja: "姓名学調和",
      ko: "성명학 조화",
    },
  },
  saju: {
    category: "Fate",
    id: "saju",
    label: {
      zh: "四柱命运",
      en: "Saju Fate",
      es: "Destino Saju",
      fr: "Destin Saju",
      ja: "四柱命運",
      ko: "사주 명운",
    },
  },
  zodiac: {
    category: "Fate",
    id: "zodiac",
    label: {
      zh: "星座",
      en: "Zodiac",
      es: "Zodiaco",
      fr: "Zodiaque",
      ja: "星座",
      ko: "서양 별자리",
    },
  },
};

export interface DimensionResult {
  details?: Record<string, any>; // Dimension-specific data (e.g., Blood type match traits)
  id: ResonanceDimensionId;
  insight: LocalizedText;
  insightKey?: string;
  isSimulated: boolean;
  score: number;
  strength: number; // 0-1, data certainty
  tags: { [key: string]: string[] }; // LocalizedStringArray but strictly typed for simplicity or import it
}

export interface IChingOracle {
  hexagramName: LocalizedText;
  hexagramNumber: number;
  image: LocalizedText;
  judgment: LocalizedText;
}

export interface TotalResonance {
  confidence: number;
  createdAt: string;
  dimensions: DimensionResult[];
  iching?: IChingOracle;
  resonanceNarrative?: LocalizedText;
  synthesis: {
    counselorAdvice: LocalizedText;
    description: LocalizedText;
    title: LocalizedText;
  };
  totalScore: number;
  uuid: string;
}

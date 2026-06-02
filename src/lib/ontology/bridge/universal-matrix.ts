/**
 * Universal Correlation Matrix (UCM) - SSOT for Inter-Domain Weights
 * 범도메인 상관관계 매트릭스: 모든 온톨로지 도메인 간의 정적 가중치 정의
 *
 * Version: 1.0.0
 * Strategy: Breadth-First (all domains minimally connected),
 *           with Depth on anchor pairs (RIASEC-Hobby, TCI-Saju)
 */

import { RiasecType } from "@/lib/ontology/riasec/types";
import { FiveElement } from "@/lib/ontology/saju/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface DomainMatrix {
  adjustmentFactor: number; // For future ML-based calibration
  bias_tci: Record<string, Record<string, number>>;
  biorhythm_element: Record<string, string[]>; // biorhythm cycle -> element names
  celtic_resilience: Record<string, number>;
  egenteto_mbti: Record<string, string[]>;
  // Phase 4 Extensions
  hellenistic_riasec: Record<string, RiasecType[]>;
  hexaco_riasec: Record<string, RiasecType[]>;
  hsp_star: Record<string, string[]>;
  kabbalah_resilience: Record<string, number>;
  mayan_riasec: Record<string, string[]>;
  mayan_tci: Record<string, Record<string, number>>;
  mbti_comfort: Record<string, { en: string; ko: string }>;
  // Phase 4 Extensions
  mbti_riasec: Record<string, RiasecType[]>;
  mbti_saju: Record<string, string[]>; // MBTI dimension -> element names

  resilience_element: Record<string, Record<string, number>>; // level -> element -> weight
  riasec_hobby: Record<RiasecType, string[]>;
  tci_element: Record<string, Record<string, number>>; // TCI dimension -> element -> weight

  tci_riasec: Record<string, RiasecType[]>;
  version: string;
  ziwei_tci: Record<string, Record<string, number>>;
  zodiac_riasec: Record<string, RiasecType[]>;
}

// ─────────────────────────────────────────────────────────────
// Extended Mappings (Phase 4)
// ─────────────────────────────────────────────────────────────

// MBTI -> RIASEC (Source: CPP Manual correlations)
export const MBTI_RIASEC_MAP: Record<string, RiasecType[]> = {
  ENFJ: ["Social", "Enterprising"],
  ENFP: ["Artistic", "Social"],
  ENTJ: ["Enterprising", "Investigative"],
  ENTP: ["Enterprising", "Investigative"],

  ESFJ: ["Social", "Conventional"],
  ESFP: ["Social", "Artistic"],
  ESTJ: ["Enterprising", "Conventional"],
  ESTP: ["Enterprising", "Realistic"],

  // NF (Idealists) -> Artistic / Social
  INFJ: ["Artistic", "Investigative"],
  INFP: ["Artistic", "Social"],
  // NT (Rationals) -> Investigative / Enterprising
  INTJ: ["Investigative", "Conventional"],
  INTP: ["Investigative", "Artistic"],

  ISFJ: ["Social", "Conventional"],
  ISFP: ["Artistic", "Realistic"],
  // SJ (Guardians) -> Conventional / Realistic
  ISTJ: ["Realistic", "Conventional"],
  // SP (Artisans) -> Realistic / Artistic
  ISTP: ["Realistic", "Investigative"],
};

// HEXACO (High correlations) -> RIASEC
export const HEXACO_RIASEC_MAP: Record<string, RiasecType[]> = {
  high_Agreeableness: ["Social"],
  high_Conscientiousness: ["Conventional", "Enterprising"],
  high_Emotionality: ["Artistic"],
  high_Extraversion: ["Social", "Enterprising"],
  "high_Honesty-Humility": ["Social"],
  high_Openness: ["Artistic", "Investigative"],
  low_Agreeableness: ["Investigative", "Realistic"],
  low_Conscientiousness: ["Artistic"],
  low_Emotionality: ["Realistic"],
  low_Extraversion: ["Investigative", "Conventional"],
  "low_Honesty-Humility": ["Enterprising"],
  low_Openness: ["Conventional", "Realistic"],
};

// TCI -> RIASEC
export const TCI_RIASEC_MAP: Record<string, RiasecType[]> = {
  high_HA: ["Conventional"], // Harm Avoidance
  high_NS: ["Artistic", "Investigative"], // Novelty Seeking
  high_P: ["Conventional", "Investigative"], // Persistence
  high_RD: ["Social"], // Reward Dependence
  low_HA: ["Enterprising", "Realistic"],
  low_NS: ["Conventional"],
  low_P: ["Artistic"],
  low_RD: ["Realistic", "Investigative"],
};

// MBTI -> Comfort Messages (Soul Guidance)
export const MBTI_COMFORT_MAP: Record<string, { en: string; ko: string }> = {
  ENFJ: {
    en: "Remember to nurture yourself as you nurture others.",
    ko: "타인을 돌보는 만큼 당신 자신도 돌보는 것을 잊지 마세요.",
  },
  ENFP: {
    en: "Your wandering heart is finding its true north.",
    ko: "당신의 방황하는 마음은 진정한 북쪽을 찾고 있는 중입니다.",
  },
  ENTJ: {
    en: "Rest is not a failure; it is fuel for your next conquest.",
    ko: "휴식은 실패가 아니라, 다음 정복을 위한 연료입니다.",
  },
  ENTP: {
    en: "Chaos is just a pattern you haven't deciphered yet.",
    ko: "혼돈은 당신이 아직 해독하지 못한 패턴일 뿐입니다.",
  },
  ESFJ: {
    en: "You are worthy of love simply for existing, not just for helping.",
    ko: "당신은 돕기 때문이 아니라, 존재 자체만으로도 사랑받을 자격이 있습니다.",
  },
  ESFP: {
    en: "Your joy is a healing balm for the world.",
    ko: "당신의 기쁨은 세상을 치유하는 연고입니다.",
  },
  ESTJ: {
    en: "Trust that things will hold together even if you let go slightly.",
    ko: "조금 놓아주더라도 모든 것이 무너지지 않을 것임을 믿으세요.",
  },
  ESTP: {
    en: "Leap, and the net will appear.",
    ko: "뛰어드세요, 그러면 그물이 나타날 것입니다.",
  },
  INFJ: {
    en: "You don't have to carry the world's emotions alone.",
    ko: "세상의 감정을 혼자 짊어질 필요는 없습니다.",
  },
  INFP: {
    en: "Your sensitivity is a superpower, not a weakness.",
    ko: "당신의 감수성은 초능력이지, 약점이 아닙니다.",
  },
  INTJ: {
    en: "Your vision is valid, even if others cannot see it yet.",
    ko: "당신의 비전은 타당합니다, 비록 타인이 아직 그것을 보지 못한다 해도요.",
  },
  INTP: {
    en: "It is okay to not have all the answers right now.",
    ko: "지금 당장 모든 답을 알지 못해도 괜찮습니다.",
  },
  ISFJ: {
    en: "Your quiet acts of kindness ripple further than you know.",
    ko: "당신의 조용한 친절은 당신이 아는 것보다 더 멀리 퍼져나갑니다.",
  },
  ISFP: {
    en: "Expressing yourself is your soul's oxygen.",
    ko: "자신을 표현하는 것은 당신 영혼의 산소입니다.",
  },
  ISTJ: {
    en: "Your consistency is the anchor in a chaotic world.",
    ko: "당신의 꾸준함은 혼란스러운 세상의 닻입니다.",
  },
  ISTP: {
    en: "Life's manual is written as you go.",
    ko: "인생의 매뉴얼은 당신이 나아가면서 쓰여지는 것입니다.",
  },
};

// ─────────────────────────────────────────────────────────────
// SSOT: The Universal Correlation Matrix
// ─────────────────────────────────────────────────────────────

export const DOMAIN_CORRELATION_MATRIX: DomainMatrix = {
  adjustmentFactor: 1.0, // Baseline, adjustable via ML feedback
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Cognitive Bias ↔ TCI Temperament
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  bias_tci: {
    "anchoring-bias": {
      harmAvoidance: 0.4,
      noveltySeeking: -0.2,
      persistence: 0.45,
    },
    "authority-bias": {
      harmAvoidance: 0.5,
      persistence: 0.3,
      rewardDependence: 0.4,
    },
    "availability-heuristic": {
      harmAvoidance: 0.25,
      noveltySeeking: 0.3,
      rewardDependence: 0.35,
    },
    "confirmation-bias": {
      harmAvoidance: 0.55,
      noveltySeeking: -0.35,
      persistence: 0.25,
    },
    "dunning-kruger": {
      harmAvoidance: -0.4,
      noveltySeeking: 0.45,
      persistence: -0.3,
    },
    // New biases to be added
    "hindsight-bias": { harmAvoidance: 0.3, persistence: 0.4 },
    "status-quo-bias": { harmAvoidance: 0.7, noveltySeeking: -0.6 },
    "sunk-cost-fallacy": {
      harmAvoidance: 0.45,
      noveltySeeking: -0.4,
      persistence: 0.65,
    },
    "survivorship-bias": {
      harmAvoidance: -0.35,
      noveltySeeking: 0.5,
      rewardDependence: 0.2,
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Biorhythm ↔ Saju Element
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  biorhythm_element: {
    emotional: ["water", "wood"], // Flow and growth
    intellectual: ["metal", "water"], // Precision and depth
    physical: ["fire", "metal"], // Action and discipline
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANCHOR PAIR 4: Celtic Tree ↔ Resilience (NATURE-WELLNESS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  celtic_resilience: {
    Ash: 0.5,
    Birch: 0.5,
    // Strong structural trees boost resilience
    Oak: 0.5,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EgenTeto ↔ MBTI (Hormonal Archetype to Cognitive Type)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  egenteto_mbti: {
    egennam: ["INFP", "ISFP", "ENFP", "INFJ", "ENFJ", "ISFJ"],
    egennye: ["ISFJ", "ESFJ", "INFJ", "ENFJ", "INFP", "ISFP"],
    tetonam: ["ENTJ", "ESTJ", "ESTP", "ENTP", "INTJ", "ISTP"],
    tetonye: ["ENTJ", "ESTJ", "INTJ", "ISTP", "ENTP", "ESTP"],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANCHOR PAIR 5: Hellenistic Sect ↔ RIASEC (DIURNAL-NOCTURNAL)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hellenistic_riasec: {
    Day: ["Enterprising", "Social"], // Sun/Jupiter energy: External, public, leading
    Night: ["Artistic", "Investigative"], // Moon/Venus energy: Internal, reflective, creative
  },

  hexaco_riasec: HEXACO_RIASEC_MAP,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HSP ↔ 12-Star (Celestial Sensitivity)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hsp_star: {
    high: ["cheonmun", "cheongo", "cheonye", "cheonaek"], // 학문, 고독, 예술, 고난
    low: ["cheongwon", "cheonpa", "cheongan", "cheongwi", "cheonin"], // 권력, 파괴, 전략, 귀, 인내
    moderate: ["cheonbok", "cheonsu", "cheonyeok"], // 복, 장수, 역동
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANCHOR PAIR 7: Kabbalah ↔ Resilience (SPIRITUAL-ADAPTABILITY)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  kabbalah_resilience: {
    // Understanding & Mercy boost acceptance and recovery
    binah: 0.8,
    chesed: 0.8,
    // Strength & Victory provide endurance
    gevurah: 0.7,
    netzach: 0.7,
    // Beauty provides balance
    tiferet: 0.9,
  },

  mayan_riasec: {
    low_tone: ["Conventional"], // Tones 1,2,4 align with Structure
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANCHOR PAIR 3: Mayan Tone ↔ TCI/RIASEC (TIME-PSYCHOLOGY)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  mayan_tci: {
    // High Tones (10-13): Manifestation/Cosmic -> NS, RD
    high_tone: { noveltySeeking: 0.4, rewardDependence: 0.4 },
    // Low Tones (1, 2, 4): Foundation/Form -> Persistence
    low_tone: { persistence: 0.3 },
  },
  mbti_comfort: MBTI_COMFORT_MAP,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Extended Mappings (Phase 4)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  mbti_riasec: MBTI_RIASEC_MAP,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MBTI ↔ Saju Element (Cognitive to Elemental)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  mbti_saju: {
    // Extraverts tend toward Fire/Wood (expansion)
    E: ["fire", "wood"],
    // Feeling nurtures like Wood/Water
    F: ["wood", "water"],
    // Introverts tend toward Water/Metal (introspection)
    I: ["water", "metal"],
    // Judging stabilizes like Earth/Metal
    J: ["earth", "metal"],
    // Intuition flows like Water/Wood
    N: ["water", "wood"],
    // Perceiving adapts like Water/Fire
    P: ["water", "fire"],
    // Sensing grounds in Earth
    S: ["earth", "metal"],
    // Thinking crystallizes like Metal
    T: ["metal", "water"],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Resilience ↔ Saju Element
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  resilience_element: {
    high: { earth: 0.88, fire: 0.55, metal: 0.92, water: 0.72, wood: 0.6 },
    low: { earth: 0.35, fire: 0.75, metal: 0.4, water: 0.65, wood: 0.55 },
    moderate: { earth: 0.5, fire: 0.58, metal: 0.45, water: 0.55, wood: 0.65 },
  },
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANCHOR PAIR 1: RIASEC ↔ Hobby (DEPTH)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  riasec_hobby: {
    Artistic: [
      "painting",
      "writing",
      "photography",
      "music",
      "crafts",
      "pottery",
      "dancing",
      "theater",
      "graphic-design",
      "calligraphy",
      "jewelry-making",
      "fashion-design",
      "film-making",
    ],
    Conventional: [
      "collecting",
      "journaling",
      "organizing",
      "budgeting",
      "scrapbooking",
      "genealogy",
      "model-building",
      "stamp-collecting",
      "coin-collecting",
      "data-tracking",
      "spreadsheet-mastery",
    ],
    Enterprising: [
      "investing",
      "networking",
      "public-speaking",
      "travel",
      "entrepreneurship",
      "debate",
      "leadership-workshops",
      "sales",
      "event-planning",
      "real-estate",
    ],
    Investigative: [
      "chess",
      "reading",
      "astronomy",
      "coding",
      "puzzles",
      "science-experiments",
      "documentary-watching",
      "language-learning",
      "philosophy",
      "investing",
      "writing",
    ],
    Realistic: [
      "gardening",
      "woodworking",
      "hiking",
      "fishing",
      "mechanics",
      "camping",
      "running",
      "cycling",
      "swimming",
      "martial-arts",
      "diy-projects",
      "archery",
      "rock-climbing",
    ],
    Social: [
      "volunteering",
      "board-games",
      "cooking",
      "team-sports",
      "mentoring",
      "book-club",
      "community-events",
      "pet-care",
      "yoga",
      "meditation",
      "group-fitness",
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANCHOR PAIR 2: TCI ↔ Saju Element (DEPTH)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  tci_element: {
    harmAvoidance: {
      earth: 0.9,
      fire: 0.18,
      metal: 0.65,
      water: 0.78,
      wood: 0.35,
    },
    noveltySeeking: {
      earth: 0.2,
      fire: 0.92,
      metal: 0.3,
      water: 0.55,
      wood: 0.75,
    },
    persistence: {
      earth: 0.85,
      fire: 0.62,
      metal: 0.92,
      water: 0.38,
      wood: 0.5,
    },
    rewardDependence: {
      earth: 0.58,
      fire: 0.45,
      metal: 0.3,
      water: 0.85,
      wood: 0.72,
    },
  },

  tci_riasec: TCI_RIASEC_MAP,
  version: "1.0.0",
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANCHOR PAIR 6: Zi Wei Star ↔ TCI (ARCHETYPE-TEMPERAMENT)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ziwei_tci: {
    ju_men: { harmAvoidance: 0.3, persistence: 0.5 },
    po_jun: { noveltySeeking: 0.95, selfDirectedness: 0.6 },

    // Action Cluster (Generals)
    qi_sha: { harmAvoidance: -0.5, noveltySeeking: 0.9, persistence: 0.8 },
    tian_fu: { harmAvoidance: 0.4, selfDirectedness: 0.7 },

    // Intellect/Support Cluster
    tian_ji: { noveltySeeking: 0.6, rewardDependence: 0.5 },
    // Leadership Cluster (North Star)
    zi_wei: { persistence: 0.7, selfDirectedness: 0.8 },
  },
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Western Zodiac ↔ RIASEC (Astrological to Vocational)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  zodiac_riasec: {
    Aquarius: ["Investigative", "Artistic"],
    Aries: ["Enterprising", "Realistic"],
    Cancer: ["Social", "Artistic"],
    Capricorn: ["Conventional", "Realistic"],
    Gemini: ["Investigative", "Social"],
    Leo: ["Enterprising", "Artistic"],
    Libra: ["Social", "Artistic"],
    Pisces: ["Artistic", "Social"],
    Sagittarius: ["Enterprising", "Investigative"],
    Scorpio: ["Investigative", "Enterprising"],
    Taurus: ["Conventional", "Realistic"],
    Virgo: ["Conventional", "Investigative"],
  },
};

// ─────────────────────────────────────────────────────────────
// Friction Definitions (Conflicting Energies)
// ─────────────────────────────────────────────────────────────

export interface FrictionPattern {
  advice: { en: string; ko: string };
  condition: string;
  description: { en: string; ko: string };
  severity: "high" | "low" | "medium";
}

export const FRICTION_PATTERNS: FrictionPattern[] = [
  {
    advice: {
      en: "Instead of suppressing inner anxiety, release it gradually through small adventures.",
      ko: "내면의 불안을 억누르기보다 작은 모험을 통해 조금씩 발산하세요.",
    },
    condition: "high_HA + fire_element",
    description: {
      en: "High Harm Avoidance clashes with excessive Fire energy.",
      ko: "높은 위험회피 성향과 불(火)의 태과 에너지가 충돌하고 있습니다.",
    },
    severity: "high",
  },
  {
    advice: {
      en: "Find novelty within stability - micro-changes within routine are your answer.",
      ko: "안정 속에서도 새로움을 찾으세요 - 루틴 안의 미세한 변화가 답입니다.",
    },
    condition: "high_NS + earth_element",
    description: {
      en: "High Novelty Seeking creates friction with stagnant Earth energy.",
      ko: "높은 자극추구 성향이 토(土)의 정체 에너지와 마찰을 일으킵니다.",
    },
    severity: "medium",
  },
  {
    advice: {
      en: "Secure regular quiet time to restore your nervous system.",
      ko: "정기적인 고요의 시간을 확보하여 신경계를 회복시키세요.",
    },
    condition: "hsp_high + fire_element",
    description: {
      en: "High sensitivity may be easily overwhelmed by intense Fire energy.",
      ko: "고감도 감수성이 화(火)의 강렬함에 쉽게 압도될 수 있습니다.",
    },
    severity: "high",
  },
  {
    advice: {
      en: "Practice letting go of perfectionism and enjoying the process itself.",
      ko: "완벽주의를 내려놓고 과정 자체를 즐기는 연습이 필요합니다.",
    },
    condition: "low_resilience + metal_element",
    description: {
      en: "Low resilience conflicts with the sharp judgment of Metal energy.",
      ko: "낮은 회복탄력성이 금(金)의 날카로운 판단력과 충돌합니다.",
    },
    severity: "medium",
  },
];

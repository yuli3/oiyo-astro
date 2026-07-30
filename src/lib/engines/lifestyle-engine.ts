import careersJson from "../ontology/lifestyle/careers.json";
import {
  CAREER_METADATA,
  HOBBY_METADATA,
  type LifestyleMetadata,
} from "../ontology/lifestyle/data";
import hobbiesJson from "../ontology/lifestyle/hobbies.json";

export interface RecommendationResult {
  id: string;
  metadata: LifestyleMetadata;
  rationale: Record<string, string>; // Localized rationales
  score: number;
  type: "career" | "hobby";
}

interface InputProfile {
  biorhythm: {
    emotional: number;
    intellectual: number;
    physical: number;
  };
  mbti: string;
  sajuElements: Record<string, number>; // Normalized element counts/strengths
  tciScores: {
    harmAvoidance: number; // 0-1
    noveltySeeking: number; // 0-1
    persistence: number; // 0-1
    rewardDependence: number; // 0-1
  };
}

export class LifestyleEngine {
  /**
   * Calculate matching scores and generate recommendations
   */
  public static recommend(profile: InputProfile): RecommendationResult[] {
    const hobbies = HOBBY_METADATA.map((meta) =>
      this.scoreActivity(meta, profile, "hobby"),
    );
    const careers = CAREER_METADATA.map((meta) =>
      this.scoreActivity(meta, profile, "career"),
    );

    // Return top 3 hobbies and top 1 career
    const sortedHobbies = hobbies.sort((a, b) => b.score - a.score).slice(0, 3);
    const sortedCareers = careers.sort((a, b) => b.score - a.score).slice(0, 1);

    return [...sortedHobbies, ...sortedCareers];
  }

  private static generateRationale(
    meta: LifestyleMetadata,
    profile: InputProfile,
    weakestElement: string,
  ): Record<string, string> {
    // Imperial & Poetic Tone Rationales
    const elementMap: Record<string, Record<string, string>> = {
      earth: {
        zh: "土(土)的稳定",
        en: "stability of Earth",
        es: "estabilidad de la Tierra",
        fr: "stabilité de la Terre",
        ja: "土(土)の安定",
        ko: "토(土)의 안정",
      },
      fire: {
        zh: "火(火)的热情",
        en: "passion of Fire",
        es: "pasión del Fuego",
        fr: "passion du Feu",
        ja: "火(火)の情熱",
        ko: "화(火)의 열정",
      },
      metal: {
        zh: "金(金)的决断",
        en: "decisiveness of Metal",
        es: "decisividad del Metal",
        fr: "décisivité du Métal",
        ja: "金(金)の決断",
        ko: "금(金)의 결단",
      },
      water: {
        zh: "水(水)的智慧",
        en: "wisdom of Water",
        es: "sabiduría del Agua",
        fr: "sagesse de l'Eau",
        ja: "水(水)の知恵",
        ko: "수(水)의 지혜",
      },
      wood: {
        zh: "木(木)的生命力",
        en: "vitality of Wood",
        es: "vitalidad de la Madera",
        fr: "vitalité du Bois",
        ja: "木(木)の生命力",
        ko: "목(木)의 생명력",
      },
    };

    const e = elementMap[weakestElement] || elementMap["wood"];

    return {
      zh: `这项活动将通过填补你命中缺失的${e.cn}，来完善你存在的平衡。`,
      en: `An activity to complete your balance by filling the ${e.en} missing in your destiny.`,
      es: `Una actividad para completar su equilibrio llenando la ${e.es} que falta en su destino.`,
      fr: `Une activité pour compléter votre équilibre en comblant la ${e.fr} manquante dans votre destin.`,
      ja: `あなたの運命に不足している${e.ja}を補い、存在の均衡を完成させる活動です。`,
      ko: `당신의 운명에 부족한 ${e.ko}을 채워 존재의 균형을 완성할 활동입니다.`,
    };
  }

  private static scoreActivity(
    meta: LifestyleMetadata,
    profile: InputProfile,
    type: "career" | "hobby",
  ): RecommendationResult {
    let score = 0;

    // 1. Saju Elemental Balance (Inverse mapping: recommend what is lacking)
    // Find the weakest elements in the profile
    const profileElements = Object.entries(profile.sajuElements).sort(
      (a, b) => a[1] - b[1],
    ); // Weakest first

    const weakest = profileElements[0][0];
    const secondWeakest = profileElements[1][0];

    // Boost score if the activity provides missing elements
    score +=
      (meta.elementWeights[weakest as keyof typeof meta.elementWeights] || 0) *
      40;
    score +=
      (meta.elementWeights[secondWeakest as keyof typeof meta.elementWeights] ||
        0) * 20;

    // 2. TCI Trait Alignment
    const tciScore =
      (1 -
        Math.abs(
          meta.traitAffinities.noveltySeeking -
            profile.tciScores.noveltySeeking,
        )) *
        10 +
      (1 -
        Math.abs(
          meta.traitAffinities.harmAvoidance - profile.tciScores.harmAvoidance,
        )) *
        10 +
      (1 -
        Math.abs(
          meta.traitAffinities.rewardDependence -
            profile.tciScores.rewardDependence,
        )) *
        10 +
      (1 -
        Math.abs(
          meta.traitAffinities.persistence - profile.tciScores.persistence,
        )) *
        10;

    score += tciScore;

    // 3. MBTI Extroversion check
    const isExtrovert = profile.mbti.startsWith("E");
    const extroMatch = isExtrovert
      ? meta.traitAffinities.extroversion
      : 1 - meta.traitAffinities.extroversion;
    score += extroMatch * 10;

    // 4. Biorhythm adjustment (Dynamic boost)
    if (type === "hobby") {
      const bioBoost =
        profile.biorhythm.physical * meta.traitAffinities.physicality +
        profile.biorhythm.intellectual * (1 - meta.traitAffinities.physicality);
      score += bioBoost * 5;
    }

    return {
      id: meta.id,
      metadata: meta,
      rationale: this.generateRationale(meta, profile, weakest),
      score,
      type,
    };
  }
}

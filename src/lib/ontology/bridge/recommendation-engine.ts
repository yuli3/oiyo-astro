import { CAREERS } from "@/lib/data-layer/shards/careers";
import { Career } from "@/lib/data-layer/types";
import { RiasecType } from "@/lib/ontology/riasec/types";
import {
  MBTIType,
  OntologyBranches,
  OntologyContextState,
  OntologyProfile,
  Recommendation,
  RelevanceScore,
} from "@/lib/ontology/types";

import { DOMAIN_CORRELATION_MATRIX } from "./universal-matrix";

export class RecommendationAggregationService {
  /**
   * Aggregates signals from all available ontology branches into a unified RIASEC vector.
   * This is the "Star Topology" hub.
   */
  public static aggregateVocationalProfile(
    profile: OntologyProfile,
  ): Record<RiasecType, number> {
    const scores: Record<RiasecType, number> = {
      Artistic: 0,
      Conventional: 0,
      Enterprising: 0,
      Investigative: 0,
      Realistic: 0,
      Social: 0,
    };

    // 1. Core RIASEC (Weight: 2.0) - High confidence
    if (profile.branches.riasec?.scores) {
      Object.entries(profile.branches.riasec.scores).forEach(
        ([type, score]) => {
          scores[type as RiasecType] += (score / 40) * 2.0; // Normalize approx max 40 to 1.0 scope * 2
        },
      );
    }

    // 2. MBTI (Weight: 1.0)
    const mbtiType = profile.branches.mbti?.type;
    if (mbtiType && DOMAIN_CORRELATION_MATRIX.mbti_riasec[mbtiType]) {
      const relatedTypes = DOMAIN_CORRELATION_MATRIX.mbti_riasec[mbtiType];
      relatedTypes.forEach((type) => {
        scores[type] += 1.0;
      });
    }

    // 3. HEXACO (Weight: 0.8)
    const hexaco = profile.branches.psychology?.hexaco;
    if (hexaco?.percentages) {
      const dimensionMap: Record<string, string> = {
        A: "Agreeableness",
        C: "Conscientiousness",
        E: "Emotionality",
        H: "Honesty-Humility",
        O: "Openness",
        X: "Extraversion",
      };

      Object.entries(hexaco.percentages).forEach(
        ([dim, percent]: [string, number]) => {
          const fullDimName = dimensionMap[dim];
          if (!fullDimName) return;

          let key = "";
          if (percent >= 60) key = `high_${fullDimName}`;
          else if (percent <= 40) key = `low_${fullDimName}`;

          if (key && DOMAIN_CORRELATION_MATRIX.hexaco_riasec[key]) {
            DOMAIN_CORRELATION_MATRIX.hexaco_riasec[key].forEach((type) => {
              scores[type] += 0.8;
            });
          }
        },
      );
    }

    // 4. TCI (Weight: 0.7)
    // TCI implementation would go here

    // 5. Normalization (Optional, simpler to just rank)

    return scores;
  }

  public static getComfortMessage(
    mbtiType: string,
    locale: "en" | "ko" = "ko",
  ): string {
    const msg = DOMAIN_CORRELATION_MATRIX.mbti_comfort[mbtiType];
    return msg ? msg[locale] : "";
  }

  public static getRecommendedCareers(riasecCode: string): Career[] {
    if (!riasecCode || riasecCode.length < 2) return [];

    const primary = riasecCode[0];
    const secondary = riasecCode[1];

    return CAREERS.filter((career) => {
      // Loose match: Primary matches Primary, OR Primary matches Secondary (with penalty? no, just filter)
      return (
        career.riasecCode.startsWith(primary) ||
        career.riasecCode.includes(primary + secondary)
      );
    }).slice(0, 5);
  }

  public static getRecommendedHobbies(riasecCode: string): string[] {
    if (!riasecCode) return [];

    const primary = riasecCode[0]; // e.g., 'R'
    const fullType = this.getAbbreviationMap()[primary];

    if (!fullType) return [];

    return DOMAIN_CORRELATION_MATRIX.riasec_hobby[fullType] || [];
  }

  public static getTopCode(scores: Record<RiasecType, number>): string {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    // 신호가 전혀 없으면(최고점이 0) 코드 없음 → 추천도 없음.
    // (전엔 0점이어도 첫 3글자를 반환해 미입력인데 '콘텐츠 크리에이터·건축가' 등 가짜 추천이 떴음)
    if (!sorted.length || sorted[0][1] <= 0.001) return "";
    return sorted
      .slice(0, 3)
      .map(([type]) => type[0])
      .join("");
  }

  private static getAbbreviationMap(): Record<string, RiasecType> {
    return {
      A: "Artistic",
      C: "Conventional",
      E: "Enterprising",
      I: "Investigative",
      R: "Realistic",
      S: "Social",
    };
  }
}

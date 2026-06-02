import { UserResult } from "@/types/data-schema";

export interface ComprehensiveReport {
  career: { harmony?: number; title?: string }; // NEW
  generatedAt: number;
  hiddenInsights: ReportInsight[];
  level: { en: string; ko: string };
  personality: { traits: string[]; type?: string };
  score: number;
  summary: { en: string; ko: string };
  wealth: { netPay?: number; score: number; status: string };
}

export interface ReportInsight {
  description: { en: string; ko: string };
  icon: string;
  id: string;
  title: { en: string; ko: string };
  type: "opportunity" | "synergy" | "warning";
}

export class ReportAggregator {
  static analyze(history: UserResult[]): ComprehensiveReport {
    // 1. Calculate various sub-scores
    const financeResults = history.filter((r) => r.type === "finance");
    const careerResults = history.filter((r) => r.type === "career"); // NEW

    // Wealth Analysis
    let wealthScore = 0;
    let netPay = 0;
    const salaryResult = financeResults.find(
      (r) => r.subtype === "salary-calculator",
    );
    if (salaryResult && salaryResult.metadata) {
      netPay = (salaryResult.metadata.netPay as number) || 0;
      wealthScore = netPay > 5000000 ? 92 : netPay > 3000000 ? 75 : 55;
    }

    // Career Analysis
    const jobMatch = careerResults.find((r) => r.subtype === "job-match");
    const careerTitle = jobMatch
      ? (jobMatch.metadata?.title as Record<string, string> | undefined)?.en ||
        "Unknown"
      : undefined;
    const careerHarmony = jobMatch ? jobMatch.score || 0 : 0;

    // Personality Analysis
    const personalityType = "Explorer";

    // 2. Generate Hidden Insights
    const insights: ReportInsight[] = [];

    // Rule: High Harmony & High Wealth (The Golden Path)
    if (wealthScore > 80 && careerHarmony > 80) {
      insights.push({
        description: {
          en: "Your career path perfectly aligns with both your soul and your financial goals.",
          ko: "당신의 커리어는 영혼의 만족과 재무적 성공, 두 마리 토끼를 모두 잡았습니다.",
        },
        icon: "🌟",
        id: "golden-path",
        title: { en: "Golden Alignment", ko: "황금빛 정렬" },
        type: "synergy",
      });
    }

    // Rule: Wealth exists but No Career (Missing Compass)
    if (wealthScore > 0 && !jobMatch) {
      insights.push({
        description: {
          en: "You have the means, but do you have the meaning? Try the Job Matcher.",
          ko: "능력은 충분하지만 방향이 필요합니다. 천직 나침반을 확인해보세요.",
        },
        icon: "🧭",
        id: "missing-compass",
        title: { en: "Unexplored Potential", ko: "미발견된 잠재력" },
        type: "opportunity",
      });
    }

    // 3. Final Compilation
    const totalScore = Math.round(
      (wealthScore + careerHarmony + history.length * 5) / 2 + 30,
    );
    const cappedScore = Math.min(99, Math.max(10, totalScore));

    let levelEn = "Novice";
    let levelKo = "입문자";
    if (cappedScore > 90) {
      levelEn = "Grandmaster";
      levelKo = "그랜드마스터";
    } else if (cappedScore > 75) {
      levelEn = "Strategist";
      levelKo = "전략가";
    }

    return {
      career: { harmony: careerHarmony, title: careerTitle },
      generatedAt: Date.now(),
      hiddenInsights: insights,
      level: { en: levelEn, ko: levelKo },
      personality: { traits: ["Adaptive", "Curious"], type: personalityType },
      score: cappedScore,
      summary: {
        en: `You are a ${levelEn} building a unique narrative.`,
        ko: `당신은 고유한 서사를 만들어가는 ${levelKo}입니다.`,
      },
      wealth: {
        netPay,
        score: wealthScore,
        status: wealthScore > 80 ? "High" : "Normal",
      },
    };
  }
}

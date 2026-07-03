/**
 * Rankings by points, streaks, referrals, and test completion
 */
import { Locale } from "@/i18n";
import { getLocalizedText } from "@/lib/system/i18n/locale-helper";

export type LeaderboardCategory =
  | "points"
  | "referrals"
  | "streaks"
  | "tests-completed";

export interface LeaderboardEntry {
  avatar?: string;
  badge?: string;
  change: number; // +2, -1, 0 (rank change from previous period)
  displayName: string;
  isCurrentUser?: boolean;
  rank: number;
  score: number;
  userId: string;
  username: string;
}

export type LeaderboardPeriod = "all-time" | "daily" | "monthly" | "weekly";
export interface LeaderboardStats {
  nextRankScore: number; // Score needed to reach next rank
  topPercentile: number; // What percentile is the user in
  totalParticipants: number;
  userRank: number;
  userScore: number;
}

class LeaderboardEngine {
  private readonly RANK_BADGES = {
    1: "👑",
    2: "🥈",
    3: "🥉",
    4: "⭐",
    5: "⭐",
    6: "⭐",
    7: "⭐",
    8: "⭐",
    9: "⭐",
    10: "⭐",
  };

  /**
   * Format score display based on category
   */
  formatScore(
    score: number,
    category: LeaderboardCategory,
    locale: Locale,
  ): string {
    switch (category) {
      case "points":
        return score.toLocaleString();
      case "referrals":
        return getLocalizedText(
          {
            zh: `${score}人`,
            en: `${score} friends`,
            es: `${score} amigos`,
            fr: `${score} amis`,
            ja: `${score}人`,
            ko: `${score}명`,
          },
          locale,
        );
      case "streaks":
        return getLocalizedText(
          {
            zh: `${score}天`,
            en: `${score} days`,
            es: `${score} días`,
            fr: `${score} jours`,
            ja: `${score}日`,
            ko: `${score}일`,
          },
          locale,
        );
      case "tests-completed":
        return getLocalizedText(
          {
            zh: `${score}项`,
            en: `${score} tests`,
            es: `${score} tests`,
            fr: `${score} tests`,
            ja: `${score}回`,
            ko: `${score}개`,
          },
          locale,
        );
      default:
        return score.toString();
    }
  }

  /**
   * Get category labels for UI
   */
  getCategoryLabel(category: LeaderboardCategory, locale: Locale): string {
    const labels: Record<LeaderboardCategory, Record<Locale, string>> = {
      points: {
        zh: "总积分",
        en: "Total Points",
        es: "Puntos totales",
        fr: "Points totaux",
        ja: "合計ポイント",
        ko: "총 포인트",
      },
      referrals: {
        zh: "推荐人数",
        en: "Referrals",
        es: "Recomendaciones",
        fr: "Parrainages",
        ja: "招待",
        ko: "친구 초대",
      },
      streaks: {
        zh: "持续天数",
        en: "Current Streak",
        es: "Racha actual",
        fr: "Série actuelle",
        ja: "現在のストリーク",
        ko: "현재 연속 기록",
      },
      "tests-completed": {
        zh: "已完成测试",
        en: "Tests Completed",
        es: "Tests completados",
        fr: "Tests terminés",
        ja: "完了した診断",
        ko: "완료한 테스트",
      },
    };

    return getLocalizedText(labels[category], locale);
  }

  /**
   * Get leaderboard for specific category and period
   */
  async getLeaderboard(
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    limit: number = 50,
    userId?: string,
  ): Promise<{
    category: LeaderboardCategory;
    entries: LeaderboardEntry[];
    period: LeaderboardPeriod;
    stats: LeaderboardStats | null;
  }> {
    // In production, fetch from Supabase
    // For now, return mock data
    const mockEntries = this.generateMockLeaderboard(
      category,
      period,
      limit,
      userId,
    );
    const stats = userId ? this.calculateUserStats(mockEntries, userId) : null;

    return {
      category,
      entries: mockEntries,
      period,
      stats,
    };
  }

  /**
   * Get nearby competitors (users close to your rank)
   */
  async getNearbyCompetitors(
    userId: string,
    category: LeaderboardCategory,
    range: number = 5,
  ): Promise<LeaderboardEntry[]> {
    const leaderboard = await this.getLeaderboard(
      category,
      "weekly",
      100,
      userId,
    );
    const userEntry = leaderboard.entries.find((e) => e.userId === userId);

    if (!userEntry) return [];

    const userRank = userEntry.rank;
    const startRank = Math.max(1, userRank - range);
    const endRank = userRank + range;

    return leaderboard.entries.filter(
      (e) => e.rank >= startRank && e.rank <= endRank,
    );
  }

  /**
   * Get period labels for UI
   */
  getPeriodLabel(period: LeaderboardPeriod, locale: Locale): string {
    const labels: Record<LeaderboardPeriod, Record<Locale, string>> = {
      "all-time": {
        zh: "所有时间",
        en: "All Time",
        es: "Todo el tiempo",
        fr: "Tout le temps",
        ja: "全期間",
        ko: "전체",
      },
      daily: {
        zh: "今天",
        en: "Today",
        es: "Hoy",
        fr: "Aujourd'hui",
        ja: "今日",
        ko: "오늘",
      },
      monthly: {
        zh: "本月",
        en: "This Month",
        es: "Este mes",
        fr: "Ce mois-ci",
        ja: "今月",
        ko: "이번 달",
      },
      weekly: {
        zh: "本周",
        en: "This Week",
        es: "Esta semana",
        fr: "Cette semaine",
        ja: "今週",
        ko: "이번 주",
      },
    };

    return getLocalizedText(labels[period], locale);
  }

  /**
   * Get user's ranking across all categories
   */
  async getUserRankings(_userId: string): Promise<{
    points: { rank: number; total: number };
    referrals: { rank: number; total: number };
    streaks: { rank: number; total: number };
    testsCompleted: { rank: number; total: number };
  }> {
    // In production, query database for actual rankings
    return {
      points: { rank: 42, total: 1000 },
      referrals: { rank: 88, total: 1000 },
      streaks: { rank: 156, total: 1000 },
      testsCompleted: { rank: 234, total: 1000 },
    };
  }

  /**
   * Calculate percentile ranking
   */
  private calculatePercentile(rank: number, totalParticipants: number): number {
    return Math.round(((totalParticipants - rank) / totalParticipants) * 100);
  }

  /**
   * Calculate user stats from leaderboard
   */
  private calculateUserStats(
    entries: LeaderboardEntry[],
    userId: string,
  ): LeaderboardStats | null {
    const userEntry = entries.find((e) => e.userId === userId);
    if (!userEntry) return null;

    const totalParticipants = entries.length;
    const nextRankEntry = entries.find((e) => e.rank === userEntry.rank - 1);

    return {
      nextRankScore: nextRankEntry
        ? nextRankEntry.score
        : userEntry.score + 1000,
      topPercentile: this.calculatePercentile(
        userEntry.rank,
        totalParticipants,
      ),
      totalParticipants,
      userRank: userEntry.rank,
      userScore: userEntry.score,
    };
  }

  /**
   * Generate mock leaderboard data
   */
  private generateMockLeaderboard(
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    limit: number,
    userId?: string,
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    // Score ranges based on category
    const scoreRanges = {
      points: { max: 50000, min: 100 },
      referrals: { max: 200, min: 0 },
      streaks: { max: 365, min: 1 },
      "tests-completed": { max: 150, min: 1 },
    };

    const range = scoreRanges[category];
    const names = [
      "Sarah Kim",
      "Alex Chen",
      "Jessica Park",
      "Michael Lee",
      "Emily Wong",
      "David Choi",
      "Lisa Kim",
      "James Park",
      "Amy Lee",
      "Ryan Kim",
    ];

    for (let i = 0; i < Math.min(limit, 50); i++) {
      const rank = i + 1;
      const scoreDecay = Math.pow(0.85, i); // Exponential decay
      const score = Math.round(range.max * scoreDecay + range.min);
      const change = Math.floor(Math.random() * 11) - 5; // -5 to +5

      entries.push({
        badge: this.RANK_BADGES[rank as keyof typeof this.RANK_BADGES],
        change,
        displayName: names[i % names.length],
        isCurrentUser: userId === `user-${i + 1}`,
        rank,
        score,
        userId: `user-${i + 1}`,
        username: `user${i + 1}`,
      });
    }

    // Add current user if not in top rankings
    if (userId && !entries.find((e) => e.userId === userId)) {
      const userRank = Math.floor(Math.random() * 400) + 51;
      const userScore = Math.round(
        range.min + Math.random() * (range.max * 0.2),
      );

      entries.push({
        change: Math.floor(Math.random() * 11) - 5,
        displayName: "You",
        isCurrentUser: true,
        rank: userRank,
        score: userScore,
        userId,
        username: "You",
      });
    }

    return entries.sort((a, b) => a.rank - b.rank);
  }
}

// Export singleton
export const leaderboardEngine = new LeaderboardEngine();

// Convenience exports
export const getLeaderboard = (
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
  limit?: number,
  userId?: string,
) => leaderboardEngine.getLeaderboard(category, period, limit, userId);

export const getUserRankings = (userId: string) =>
  leaderboardEngine.getUserRankings(userId);

export const getNearbyCompetitors = (
  userId: string,
  category: LeaderboardCategory,
  range?: number,
) => leaderboardEngine.getNearbyCompetitors(userId, category, range);

export const formatScore = (
  score: number,
  category: LeaderboardCategory,
  locale: Locale,
) => leaderboardEngine.formatScore(score, category, locale);

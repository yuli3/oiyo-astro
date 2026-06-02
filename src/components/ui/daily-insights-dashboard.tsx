/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PoeticLoader } from "@/components/ui/poetic-loader";
import { personalAnalyticsAnalyzer } from "@/lib/ontology/analytics/personal-analytics/analyzer";
import {
  AnalyticsMetrics,
  PersonalityInsight,
  PersonalitySnapshot,
  PersonalityTrend,
  WeeklyDigest,
} from "@/lib/ontology/analytics/personal-analytics/types";
import { getLocalizedContent } from "@/lib/system/utils/localization";

interface DailyInsightsDashboardProps {
  className?: string;
  locale: string;
}

export function DailyInsightsDashboard({
  className = "",
  locale,
}: DailyInsightsDashboardProps) {
  const [snapshots, setSnapshots] = useState<PersonalitySnapshot[]>([]);
  const [trends, setTrends] = useState<PersonalityTrend[]>([]);
  const [, setInsights] = useState<PersonalityInsight[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [, setWeeklyDigest] = useState<null | WeeklyDigest>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "month" | "quarter" | "week" | "year"
  >("month");
  const [isLoading, setIsLoading] = useState(true);
  const [, setCurrentSnapshot] = useState<null | PersonalitySnapshot>(null);

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Create current snapshot
      const snapshot = personalAnalyticsAnalyzer.createSnapshot(locale);
      if (snapshot) {
        setCurrentSnapshot(snapshot);
      }

      // Load historical data
      const historicalSnapshots = personalAnalyticsAnalyzer.getSnapshots();
      setSnapshots(historicalSnapshots);

      // Analyze trends
      const personalityTrends =
        personalAnalyticsAnalyzer.analyzeTrends(selectedTimeframe);
      setTrends(personalityTrends);

      // Generate insights
      const personalityInsights =
        personalAnalyticsAnalyzer.generateInsights(historicalSnapshots);
      setInsights(personalityInsights);

      // Calculate metrics
      const analyticsMetrics =
        personalAnalyticsAnalyzer.calculateMetrics(historicalSnapshots);
      setMetrics(analyticsMetrics);

      // Generate weekly digest
      const digest = personalAnalyticsAnalyzer.generateWeeklyDigest();
      setWeeklyDigest(digest);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [locale, selectedTimeframe]);

  // Load analytics data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- invoking async useCallback for data fetching is correct
    loadAnalyticsData();
  }, [locale, selectedTimeframe, loadAnalyticsData]);

  const content = {
    en: {
      achievements: "Achievements",
      insights: "Personal Insights",
      metrics: {
        currentStreak: "Current Streak",
        growthScore: "Growth Score",
        stability: "Personality Stability",
        totalSnapshots: "Total Records",
      },
      noData: "No data available for analysis",
      noDataDesc:
        "You need at least 2 personality tests to start personal analysis.",
      overview: "Overview",
      personalityShifts: "Personality Shifts",
      recommendations: "Recommendations",
      refreshData: "Refresh Data",
      startTests: "Start Personality Tests",
      subtitle:
        "Track and analyze your personality changes and growth patterns",
      timeframes: {
        month: "1 Month",
        quarter: "3 Months",
        week: "1 Week",
        year: "1 Year",
      },
      title: "Personal Growth Analytics",
      trends: "Growth Trends",
      viewAll: "View All",
      weeklyDigest: "Weekly Report",
    },
    ko: {
      achievements: "성취",
      insights: "개인 인사이트",
      metrics: {
        currentStreak: "연속 기록",
        growthScore: "성장 점수",
        stability: "성격 안정성",
        totalSnapshots: "총 기록",
      },
      noData: "분석할 데이터가 없습니다",
      noDataDesc:
        "개인 분석을 시작하려면 최소 2회 이상의 성격 테스트가 필요합니다.",
      overview: "전체 현황",
      personalityShifts: "성격 변화",
      recommendations: "추천사항",
      refreshData: "데이터 새로고침",
      startTests: "성격 테스트 시작하기",
      subtitle: "당신의 성격 변화와 성장 패턴을 추적하고 분석합니다",
      timeframes: {
        month: "1개월",
        quarter: "3개월",
        week: "1주일",
        year: "1년",
      },
      title: "개인 성장 분석",
      trends: "성장 트렌드",
      viewAll: "전체 보기",
      weeklyDigest: "주간 리포트",
    },
  };

  const t = getLocalizedContent(content, locale as any, content.en);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-amber-50 to-pink-50 p-6 ${className}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <PoeticLoader variant="inline" />
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!snapshots.length || snapshots.length < 2) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-amber-50 to-pink-50 p-6 ${className}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-950 mb-2">
                  {t.noData}
                </h2>
                <p className="text-green-700 mb-8">{t.noDataDesc}</p>
                <Button
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => (window.location.href = `/${locale}`)}
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  {t.startTests}
                </Button>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-amber-50 to-pink-50 p-6 ${className}`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="mb-4">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              <Activity className="w-4 h-4 mr-1" />
              {t.overview}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-green-950 mb-4">{t.title}</h1>
          <p className="text-xl text-green-700 max-w-3xl mx-auto">
            {t.subtitle}
          </p>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border">
              {(
                Object.keys(t.timeframes) as Array<keyof typeof t.timeframes>
              ).map((timeframe) => (
                <Button
                  className={
                    selectedTimeframe === timeframe
                      ? "bg-amber-600 text-white"
                      : ""
                  }
                  key={timeframe as string}
                  onClick={() =>
                    setSelectedTimeframe(
                      timeframe as "month" | "quarter" | "week" | "year",
                    )
                  }
                  size="sm"
                  variant={
                    selectedTimeframe === timeframe ? "default" : "ghost"
                  }
                >
                  {t.timeframes[timeframe]}
                </Button>
              ))}
            </div>

            <Button
              className="border-amber-200 hover:bg-amber-50"
              onClick={loadAnalyticsData}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.refreshData}
            </Button>
          </div>
        </m.div>

        {/* Metrics Overview */}
        {metrics && (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">
                        {t.metrics.totalSnapshots}
                      </p>
                      <p className="text-2xl font-bold text-amber-900">
                        {metrics.totalSnapshots}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">
                        {t.metrics.currentStreak}
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        {metrics.currentStreak}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">
                        {t.metrics.growthScore}
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {metrics.growthScore}/100
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">
                        {t.metrics.stability}
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {Math.round(metrics.personalityStability * 100)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </m.div>
        )}

        {/* Trends Chart */}
        {trends.length > 0 && (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  {t.trends}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer height="100%" width="100%">
                    <AreaChart data={trends[0]?.dataPoints || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        dataKey="value"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                        stroke="#8b5cf6"
                        type="monotone"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </m.div>
        )}
      </div>
    </div>
  );
}

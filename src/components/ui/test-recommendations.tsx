"use client";

import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Locale } from "@/i18n";
import { ROUTES } from "@/registry/routes";

interface TestRecommendation {
  category:
    | "development"
    | "lifestyle"
    | "personality"
    | "relationships"
    | "tools"
    | "wellness";
  description: string;
  duration: string;
  emoji: string;
  id: string;
  name: string;
  popularity: "high" | "medium" | "new";
  url: string;
}

interface TestRecommendationsProps {
  category?: string;
  className?: string;
  currentTest?: string;
  locale: string;
  maxRecommendations?: number;
  showCategory?: boolean;
  title?: string;
}

// Test database with metadata
const TESTS_DATABASE: Record<string, TestRecommendation> = {
  "active-aging-wellness": {
    category: "wellness",
    description: "Balance movement, connection, mindfulness, purpose, and rest",
    duration: "8 min",
    emoji: "🌿",
    id: "active-aging-wellness",
    name: "Active Aging Wellness",
    popularity: "medium",
    url: "/active-aging-wellness",
  },

  "attachment-style": {
    category: "relationships",
    description: "Map your bonding patterns, repair rituals, and safety cues",
    duration: "6 min",
    emoji: "🧭",
    id: "attachment-style",
    name: "Attachment Style Compass",
    popularity: "high",
    url: "/attachment-style",
  },
  "biorhythm-calculator": {
    category: "tools",
    description: "Analyze your physical, emotional, and intellectual cycles",
    duration: "2 min",
    emoji: "🔮",
    id: "biorhythm-calculator",
    name: "Biorhythm Calculator",
    popularity: "medium",
    url: "/biorhythm-calculator",
  },
  "career-personality": {
    category: "development",
    description: "Find careers that match your personality",
    duration: "6 min",
    emoji: "💼",
    id: "career-personality",
    name: "Career Matcher",
    popularity: "high",
    url: "/career-personality",
  },
  "communication-style": {
    category: "relationships",
    description: "How you connect and communicate with others",
    duration: "4 min",
    emoji: "💬",
    id: "communication-style",
    name: "Communication Style",
    popularity: "high",
    url: "/communication-style-matcher",
  },

  "decision-making": {
    category: "personality",
    description: "How you make your best decisions",
    duration: "4 min",
    emoji: "🧠",
    id: "decision-making",
    name: "Decision Making Style",
    popularity: "medium",
    url: "/decision-making",
  },
  egenteto: {
    category: "personality",
    description: "Korean personality assessment for relationships",
    duration: "5 min",
    emoji: "🧠💕",
    id: "egenteto",
    name: "EgenTeto Personality",
    popularity: "high",
    url: "/egenteto",
  },
  "job-match": {
    category: "development",
    description:
      "Blend strengths, pace, and interests to uncover aligned roles",
    duration: "7 min",
    emoji: "🧭",
    id: "job-match",
    name: "Job Match Finder",
    popularity: "high",
    url: "/job-match",
  },

  "learning-style": {
    category: "development",
    description: "Find your most effective learning approach",
    duration: "4 min",
    emoji: "📚",
    id: "learning-style",
    name: "Learning Style",
    popularity: "medium",
    url: "/learning-style",
  },

  "love-language": {
    category: "relationships",
    description: "How you give and receive love",
    duration: "3 min",
    emoji: "💕",
    id: "love-language",
    name: "Love Language",
    popularity: "high",
    url: "/love-language",
  },
  "romance-match": {
    category: "relationships",
    description: "Layer MBTI, zodiac, and habits to decode your chemistry",
    duration: "6 min",
    emoji: "💖",
    id: "romance-match",
    name: "Romance Compatibility",
    popularity: "high",
    url: "/romance-match",
  },
  "stress-management": {
    category: "wellness",
    description: "Personalized stress relief strategies",
    duration: "5 min",
    emoji: "🧘‍♀️",
    id: "stress-management",
    name: "Stress Management",
    popularity: "medium",
    url: "/stress-management",
  },
};

export function TestRecommendations({
  category,
  className = "",
  currentTest,
  locale,
  maxRecommendations = 6,
  showCategory = true,
  title,
}: TestRecommendationsProps) {
  const tUi = useTranslations("ui");
  const getText = (key: string) => {
    const texts: Record<string, string> = {
      development: tUi("categories.development"),
      lifestyle: tUi("categories.lifestyle"),
      moreTests: tUi("categories.moreTests"),
      new: tUi("categories.new"),
      personality: tUi("categories.personality"),
      popular: tUi("categories.popular"),
      popularTests: tUi("categories.popularTests"),
      relatedTests: tUi("categories.relatedTests"),
      relationships: tUi("categories.relationships"),
      takeTest: tUi("categories.takeTest"),
      tools: tUi("categories.tools"),
      tryNext: tUi("categories.tryNext"),
      wellness: tUi("categories.wellness"),
    };
    return texts[key] ?? key;
  };

  // Smart recommendation algorithm
  const getRecommendations = () => {
    const allTests = Object.values(TESTS_DATABASE);
    let recommendations: TestRecommendation[] = [];

    if (currentTest) {
      // Filter out current test
      const availableTests = allTests.filter((test) => test.id !== currentTest);
      const currentTestData = TESTS_DATABASE[currentTest];

      if (currentTestData) {
        // Same category first
        const sameCategory = availableTests.filter(
          (test) => test.category === currentTestData.category,
        );
        // Related categories based on current test
        const relatedCategories = getRelatedCategories(
          currentTestData.category,
        );
        const relatedTests = availableTests.filter(
          (test) =>
            relatedCategories.includes(test.category) &&
            test.category !== currentTestData.category,
        );
        // Popular tests
        const popularTests = availableTests.filter(
          (test) => test.popularity === "high",
        );

        // Mix them strategically
        recommendations = [
          ...sameCategory.slice(0, 2),
          ...relatedTests.slice(0, 2),
          ...popularTests.slice(0, 2),
        ].slice(0, maxRecommendations);
      }
    } else if (category) {
      // Filter by category
      recommendations = allTests
        .filter((test) => test.category === category)
        .slice(0, maxRecommendations);
    } else {
      // Popular tests for general recommendations
      recommendations = allTests
        .sort((a, b) => {
          const popularityOrder = { high: 3, medium: 2, new: 1 };
          return popularityOrder[b.popularity] - popularityOrder[a.popularity];
        })
        .slice(0, maxRecommendations);
    }

    // Remove duplicates
    const unique = recommendations.filter(
      (test, index, self) => index === self.findIndex((t) => t.id === test.id),
    );

    return unique.slice(0, maxRecommendations);
  };

  const getRelatedCategories = (cat: string): string[] => {
    const relations: Record<string, string[]> = {
      development: ["personality", "tools"],
      lifestyle: ["personality", "wellness"],
      personality: ["relationships", "development"],
      relationships: ["personality", "wellness"],
      tools: ["development", "wellness"],
      wellness: ["lifestyle", "development"],
    };
    return relations[cat] || [];
  };

  const getCategoryColor = (cat: string) => {
    const colors = {
      development: "bg-orange-100 text-orange-700 border-orange-200",
      lifestyle: "bg-blue-100 text-blue-700 border-blue-200",
      personality: "bg-amber-100 text-amber-700 border-amber-200",
      relationships: "bg-pink-100 text-pink-700 border-pink-200",
      tools: "bg-gray-100 text-green-800 border-green-50",
      wellness: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[cat as keyof typeof colors] || colors.personality;
  };

  const getPopularityBadge = (popularity: string) => {
    if (popularity === "high") {
      return (
        <Badge className="text-xs" variant="destructive">
          🔥 {getText("popular")}
        </Badge>
      );
    } else if (popularity === "new") {
      return (
        <Badge
          className="text-xs bg-green-100 text-green-700"
          variant="secondary"
        >
          ✨ {getText("new")}
        </Badge>
      );
    }
    return null;
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) return null;

  const displayTitle =
    title || (currentTest ? getText("relatedTests") : getText("moreTests"));

  return (
    <div className={className}>
      <div className="mb-6">
        <h3
          className={`text-2xl md:text-3xl font-bold text-foreground text-center`}
        >
          {displayTitle}
        </h3>
        <p className={`text-center text-muted-foreground mt-2`}>
          {tUi("categories.discoverMore")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {recommendations.map((test) => (
          <Card
            className={`bg-card border-border border shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full`}
            key={test.id}
          >
            {/* eslint-disable-next-line no-restricted-syntax */}
            <Link href={`/${locale}${test.url}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{test.emoji}</div>
                  <div className="flex flex-col gap-1">
                    {getPopularityBadge(test.popularity)}
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Clock className="w-3 h-3" />
                      {test.duration}
                    </div>
                  </div>
                </div>
                <CardTitle
                  className={`text-lg text-foreground group-hover:text-opacity-80`}
                >
                  {locale === "ko" ? getKoreanName(test.id) : test.name}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p
                  className={`text-muted-foreground text-sm mb-4 leading-relaxed`}
                >
                  {locale === "ko"
                    ? getKoreanDescription(test.id)
                    : test.description}
                </p>

                <div className="flex items-center justify-between">
                  {showCategory && (
                    <Badge
                      className={`text-xs ${getCategoryColor(test.category)}`}
                      variant="outline"
                    >
                      {getText(test.category)}
                    </Badge>
                  )}

                  <Button
                    className={`ml-auto text-primary hover:text-foreground group-hover:translate-x-1 transition-transform`}
                    size="sm"
                    variant="ghost"
                  >
                    {getText("takeTest")}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* See More Link */}
      <div className="text-center mt-8">
        <Link href={ROUTES.HOME.path(locale as Locale)}>
          <Button
            className={`border-border border-2 hover:border-primary/50 transition-colors`}
            size="lg"
            variant="outline"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {tUi("categories.viewAllTests")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function getKoreanDescription(testId: string): string {
  const korean = {
    "biorhythm-calculator": "생년월일을 기반으로 바이오리듬을 분석해보세요",
    egenteto: "에겐테토 테스트로 연애 스타일을 발견하세요",
    "learning-style": "당신에게 가장 효과적인 학습 방식을 발견하세요",
    "stress-management": "개인화된 스트레스 해소 전략을 찾아보세요",
  };
  return (
    korean[testId as keyof typeof korean] ||
    TESTS_DATABASE[testId]?.description ||
    ""
  );
}

// Helper functions for Korean translations
function getKoreanName(testId: string): string {
  const korean = {
    "biorhythm-calculator": "바이오리듬 계산기",

    egenteto: "이겐테토 성격 테스트",
    "learning-style": "학습 스타일 발견",
    "stress-management": "스트레스 관리법",
  };
  return (
    korean[testId as keyof typeof korean] ||
    TESTS_DATABASE[testId]?.name ||
    testId
  );
}

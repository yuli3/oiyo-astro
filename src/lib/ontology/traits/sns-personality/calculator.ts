import type { SNSPersonalityResult, SNSPersonalityType } from "./types";

import { SNS_QUESTIONS } from "./data";
import { SNS_LABELS } from "./types";

export function calculateSNSPersonality(
  answers: Record<string, string>,
  locale: string = "ko",
): SNSPersonalityResult {
  const scores: Record<SNSPersonalityType, number> = {
    instagrammer: 0,
    lurker: 0,
    multi: 0,
    tiktoker: 0,
    tweeter: 0,
    youtuber: 0,
  };

  type SnsOption = { id: string; scores?: Record<string, number> };
  type SnsQuestion = { id: string; options: SnsOption[] };
  const questions = ((SNS_QUESTIONS as Record<string, SnsQuestion[]>)[locale] ||
    SNS_QUESTIONS.en) as SnsQuestion[];

  Object.entries(answers).forEach(([qId, optId]) => {
    const q = questions.find((x) => x.id === qId);
    if (q) {
      const opt = q.options.find((o) => o.id === optId);
      if (opt?.scores) {
        Object.entries(opt.scores).forEach(([type, score]) => {
          scores[type as SNSPersonalityType] += score as number;
        });
      }
    }
  });

  const total = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const percentages: Record<SNSPersonalityType, number> = {} as Record<
    SNSPersonalityType,
    number
  >;
  Object.entries(scores).forEach(([type, score]) => {
    percentages[type as SNSPersonalityType] =
      total > 0 ? Math.round((score / total) * 100) : 0;
  });

  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => type as SNSPersonalityType);

  // Generate platform preferences and content style based on primary type
  const platformPreferences = getPlatformPreferences(sorted[0], locale);
  const contentCreationStyle = getContentCreationStyle(sorted[0], locale);

  return {
    contentCreationStyle,
    description:
      (SNS_LABELS[sorted[0]] as Record<string, string>)[locale] ||
      SNS_LABELS[sorted[0]].en,
    percentages,
    platformPreferences,
    primary: sorted[0],
    scores,
    secondary: sorted[1],
    traits: [],
  };
}

function getContentCreationStyle(
  type: SNSPersonalityType,
  locale: string,
): string[] {
  const styles: Record<SNSPersonalityType, { en: string[]; ko: string[] }> = {
    instagrammer: {
      en: [
        "Aesthetic focus",
        "Consistent theme",
        "High-quality images",
        "Brand-conscious",
      ],
      ko: ["미적 감각 중시", "일관된 테마", "고품질 이미지", "브랜딩 의식"],
    },
    lurker: {
      en: [
        "Selective sharing",
        "Cautious engagement",
        "Quality over quantity",
        "Privacy-focused",
      ],
      ko: ["선택적 공유", "신중한 참여", "품질 우선", "프라이버시 중시"],
    },
    multi: {
      en: [
        "Multipurpose content",
        "Platform optimization",
        "Repurposing strategy",
        "Unified message",
      ],
      ko: ["다목적 콘텐츠", "플랫폼별 최적화", "재활용 전략", "통합 메시지"],
    },
    tiktoker: {
      en: [
        "Trend-sensitive",
        "Creative editing",
        "Music integration",
        "Viral content",
      ],
      ko: ["트렌드 민감", "창의적 편집", "음악 활용", "바이럴 콘텐츠"],
    },
    tweeter: {
      en: [
        "Current affairs",
        "Quick reactions",
        "Conversational",
        "Concise expression",
      ],
      ko: ["시사 논평", "빠른 반응", "대화형", "간결한 표현"],
    },
    youtuber: {
      en: [
        "Educational content",
        "Entertainment",
        "Regular uploads",
        "Viewer engagement",
      ],
      ko: ["교육적 콘텐츠", "엔터테인먼트", "정기 업로드", "시청자 참여"],
    },
  };

  const localeStyles =
    (styles[type] as Record<string, string[]>)[locale] || styles[type].en;
  return localeStyles;
}

function getPlatformPreferences(
  type: SNSPersonalityType,
  locale: string,
): string[] {
  const preferences: Record<
    SNSPersonalityType,
    { en: string[]; ko: string[] }
  > = {
    instagrammer: {
      en: [
        "Visual-first platforms",
        "Story features",
        "Hashtag master",
        "Filters and editing tools",
      ],
      ko: [
        "비주얼 중심 플랫폼",
        "스토리 기능 활용",
        "해시태그 마스터",
        "필터와 편집 도구",
      ],
    },
    lurker: {
      en: [
        "Consumption-focused",
        "Anonymity preferred",
        "Observer perspective",
        "Selective participation",
      ],
      ko: ["소비 중심", "익명성 선호", "관찰자 시점", "선별적 참여"],
    },
    multi: {
      en: [
        "Cross-platform",
        "Various content formats",
        "Wide reach",
        "Integrated strategy",
      ],
      ko: ["크로스 플랫폼", "다양한 콘텐츠 형식", "광범위한 도달", "통합 전략"],
    },
    tiktoker: {
      en: [
        "Short videos",
        "Trending music",
        "Challenge participation",
        "Quick edits",
      ],
      ko: ["짧은 영상", "트렌디한 음악", "챌린지 참여", "빠른 편집"],
    },
    tweeter: {
      en: [
        "Real-time communication",
        "Short messages",
        "Trend following",
        "Retweet culture",
      ],
      ko: ["실시간 소통", "짧고 간결한 메시지", "트렌드 팔로우", "리트윗 문화"],
    },
    youtuber: {
      en: [
        "Long-form content",
        "Video editing",
        "Subscriber engagement",
        "Series content",
      ],
      ko: ["긴 형식 콘텐츠", "비디오 편집", "구독자 소통", "시리즈 콘텐츠"],
    },
  };

  const localePreferences =
    (preferences[type] as Record<string, string[]>)[locale] ||
    preferences[type].en;
  return localePreferences;
}

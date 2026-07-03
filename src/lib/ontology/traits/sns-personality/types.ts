/**
 * SNS Personality Test Types
 * SNS 사용 성향 테스트 타입 정의
 */

export interface SNSPersonalityResult {
  contentCreationStyle: string[];
  description: string;
  percentages: Record<SNSPersonalityType, number>;
  platformPreferences: string[];
  primary: SNSPersonalityType;
  scores: Record<SNSPersonalityType, number>;
  secondary: SNSPersonalityType;
  traits: string[];
}

export type SNSPersonalityType =
  | "instagrammer" // 인스타그래머
  | "lurker" // 관전러
  | "multi" // 멀티플랫포머
  | "tiktoker" // 틱톡커
  | "tweeter" // 트위터리안
  | "youtuber"; // 유튜버

export const SNS_LABELS: Record<SNSPersonalityType, Record<string, string>> = {
  instagrammer: {
    zh: "Instagrammer 📸",
    en: "Instagrammer 📸",
    es: "Instagrammer 📸",
    fr: "Instagrammer 📸",
    ja: "Instagrammer 📸",
    ko: "인스타그래머 📸",
  },
  lurker: {
    zh: "The Lurker 👀",
    en: "The Lurker 👀",
    es: "The Lurker 👀",
    fr: "The Lurker 👀",
    ja: "The Lurker 👀",
    ko: "관전러 👀",
  },
  multi: {
    zh: "Multi-Platform Master 🌐",
    en: "Multi-Platform Master 🌐",
    es: "Multi-Platform Master 🌐",
    fr: "Multi-Platform Master 🌐",
    ja: "Multi-Platform Master 🌐",
    ko: "멀티플랫포머 🌐",
  },
  tiktoker: {
    zh: "TikToker 🎵",
    en: "TikToker 🎵",
    es: "TikToker 🎵",
    fr: "TikToker 🎵",
    ja: "TikToker 🎵",
    ko: "틱톡커 🎵",
  },
  tweeter: {
    zh: "Tweeter 🐦",
    en: "Tweeter 🐦",
    es: "Tweeter 🐦",
    fr: "Tweeter 🐦",
    ja: "Tweeter 🐦",
    ko: "트위터리안 🐦",
  },
  youtuber: {
    zh: "YouTuber 🎥",
    en: "YouTuber 🎥",
    es: "YouTuber 🎥",
    fr: "YouTuber 🎥",
    ja: "YouTuber 🎥",
    ko: "유튜버 🎥",
  },
};

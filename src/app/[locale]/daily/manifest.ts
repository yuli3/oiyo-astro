import { FeatureManifest } from "@/types/manifest";

export const dailyManifest: FeatureManifest = {
  category: ["fortune"],
  color: "green",
  description: {
    en: "Your daily dose of cosmic alignment and personal insights.",
    ko: "당신의 일상에 맞춘 우주의 정렬과 개인적 통찰을 제공합니다.",
  },
  domain: "ontology",
  icon: "sparkles",
  id: "daily",
  name: {
    en: "Daily Oracle",
    ko: "오늘의 신탁",
  },
  path: "/daily",
  seo: {
    description: {
      en: "Start your day with personalized fortune, biorhythm analysis, and lucky items.",
      ko: "개인 맞춤 운세, 바이오리듬 분석, 행운의 아이템으로 하루를 시작하세요.",
    },
    keywords: {
      en: "fortune, daily, biorhythm, horoscope, dashboard",
      ko: "운세, 오늘의운세, 바이오리듬, 별자리, 대시보드",
    },
    priority: 0.9,
    title: {
      en: "Daily Fortune & Insights ",
      ko: "오늘의 운세 및 인사이트 ",
    },
  },
  status: "production",
};

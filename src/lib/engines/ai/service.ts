import type { Locale } from "@/i18n";

import { AI_PROMPTS } from "./prompts";

export interface DailyHoroscopeResponse {
  advice: string;
  luckyColor: string;
  luckyItem: string;
  message: string;
  title: string;
}

export const AIService = {
  async generateDailyHoroscope(
    sign: string,
    mood: string,
    locale: Locale = "ko",
  ): Promise<DailyHoroscopeResponse> {
    // Simulate Network Delay (1.5s - 3s)
    const delay = Math.random() * 1500 + 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mock Data Generation (In real app, this would call Gemini API with prompts)
    const prompts =
      locale === "en"
        ? AI_PROMPTS.DAILY_HOROSCOPE.en
        : AI_PROMPTS.DAILY_HOROSCOPE.ko;

    // Simple randomizer for demo variety
    const themes =
      locale === "en"
        ? [
            "New Beginnings",
            "Inner Peace",
            "Creative Spark",
            "Focus & Clarity",
            "Social Connection",
          ]
        : [
            "새로운 시작",
            "내면의 평화",
            "창의적 영감",
            "집중과 명료함",
            "사회적 연결",
          ];

    const colors =
      locale === "en"
        ? [
            "Royal Blue",
            "Emerald Green",
            "Sunset Orange",
            "Mystic Purple",
            "Pearl White",
          ]
        : [
            "로얄 블루",
            "에메랄드 그린",
            "선셋 오렌지",
            "미스틱 퍼플",
            "펄 화이트",
          ];

    const items =
      locale === "en"
        ? ["Silver Ring", "Old Book", "Plant", "Crystal", "Headphones"]
        : ["은반지", "오래된 책", "작은 화분", "수정", "이어폰"];

    // Return structured response
    return {
      advice:
        locale === "en"
          ? "Take small steps today rather than giant leaps."
          : "오늘은 거창한 도약보다는 작은 한 걸음을 내딛는 것이 중요합니다.",
      luckyColor: colors[Math.floor(Math.random() * colors.length)],
      luckyItem: items[Math.floor(Math.random() * items.length)],
      message:
        locale === "en"
          ? `The cosmic energy for ${sign} is aligning with your mood of '${mood}'. It's a day to trust your intuition and move forward with confidence. The stars suggest a moment of reflection followed by decisive action.`
          : `${sign}의 에너지가 '${mood}' 상태와 공명하고 있습니다. 오늘은 직관을 믿고 자신감 있게 나아가기 좋은 날입니다. 별들은 잠시 성찰의 시간을 가진 후 결단력 있게 행동할 것을 제안합니다.`,
      title: themes[Math.floor(Math.random() * themes.length)],
    };
  },
};

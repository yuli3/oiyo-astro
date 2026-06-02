import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTranslations } from "next-intl/server";

import { Locale } from "@/i18n";
import { getLanguageName } from "@/lib/system/i18n/locale-helper";

import { UniversalProfile } from "../../ontology/engine/types";

// Initialize Gemini
// Note: This requires GOOGLE_API_KEY in environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// The specific model requested by the user
const MODEL_NAME = "gemini-2.5-flash-image";

export async function generateOracleProphecy(
  profile: UniversalProfile,
  locale: string,
): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("GOOGLE_API_KEY is missing. Returning fallback prophecy.");
    return getFallbackProphecy(locale);
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Construct a prompt based on the user's universal profile
    const { mythos, onomancy, saju, westernZodiac } = profile;

    // Resolve localized names
    const tOntology = await getTranslations({ locale, namespace: "ontology" });
    const egyptianName = mythos?.egyptian
      ? mythos.egyptian.patronDeity.name
      : "";
    const celticTree = mythos?.celtic ? mythos.celtic.name : "";

    const context = `
    User Profile:
    - Western Sign: ${westernZodiac.name.en} (${westernZodiac.element})
    - Saju Day Master: ${saju.dayMaster} (Element: ${saju.year.heavenlyStem})
    - Egyptian Guardian: ${egyptianName}
    - Celtic Tree: ${celticTree}
    - Name Harmony Score: ${onomancy?.balanceScore}%
    `;

    const instructions = `
    You are an ancient oracle. Based on the user's profile above, generate a SINGLE, short, poetic, and mystical sentence (max 15 words) that acts as a prophecy or blessing for them. 
    It should sound like a whisper from the cosmos.
    Do NOT mention the data points directly (e.g., don't say "Because you are Aries"). Instead, weave their essence into the meaning.
    
    Output Language: ${getLanguageName(locale as Locale)}
    tone: Mystical, Empowering, Ancient, Serene.
    `;

    const result = await model.generateContent([context, instructions]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini Oracle generation failed:", error);
    return getFallbackProphecy(locale);
  }
}

export async function generateResonanceNarrative(
  selfName: string,
  partnerName: string,
  score: number,
  locale: string,
): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) return getResonanceFallback(locale);

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const context = `${selfName} and ${partnerName} have a resonance score of ${score}%.`;
    const instructions = `
        You are an ancient cosmic sage. 
        Write a short (max 2 sentences) mystical and evocative analysis of why these two souls are connected.
        Focus on their "Universal Origin" meeting in the hall of resonance.
        Output Language: ${getLanguageName(locale as Locale)}
     `;
    const result = await model.generateContent([context, instructions]);
    return (await result.response).text().trim();
  } catch (e) {
    return getResonanceFallback(locale);
  }
}

function getFallbackProphecy(locale: string): string {
  const fallbacks: Record<string, string[]> = {
    en: [
      "The stars remember your name.",
      "The waves of the ancient Nile bless your journey.",
      "Your soul carries the brightest light of the cosmos.",
      "Amidst chaos, you shall find your own order.",
    ],
    ko: [
      "별들이 당신의 이름을 기억하고 있습니다.",
      "고대 나일의 물결이 당신의 여정을 축복합니다.",
      "당신의 영혼은 우주의 가장 밝은 빛을 품고 있습니다.",
      "혼돈 속에서도 당신만의 질서를 찾게 될 것입니다.",
    ],
  };

  const list = fallbacks[locale] || fallbacks.en;
  return list[Math.floor(Math.random() * list.length)];
}

function getResonanceFallback(locale: string): string {
  const fallbacks: Record<string, string[]> = {
    en: [
      "Two soul frequencies meet in the cosmic canyon, creating a vast resonance.",
      "Journeys started from different constellations merge today into a single galaxy.",
    ],
    ko: [
      "두 영혼의 주파수가 태초의 소협곡에서 만나 거대한 공명을 일으킵니다.",
      "서로 다른 별자리에서 시작된 여정이 오늘 하나의 은하계로 합쳐집니다.",
    ],
  };
  const list = fallbacks[locale] || fallbacks.en;
  return list[Math.floor(Math.random() * list.length)];
}

import { calculateLikertScores } from "@/lib/engines/likert-score";
import { LocalizedText } from "@/types/manifest";

import { FULL_PERFECTIONISM_QUESTIONS } from "./data";
import { PerfectionismDimension, PerfectionismResult } from "./types";

export function calculatePerfectionism(
  answers: Record<string, number>,
): PerfectionismResult {
  const scores = calculateLikertScores<PerfectionismDimension>(answers, {
    maxScale: 5,
    minScale: 1,
    questions: FULL_PERFECTIONISM_QUESTIONS,
  });

  const adaptive = scores.percentages["Adaptive"];
  const maladaptive = scores.percentages["Maladaptive"];

  let classification: PerfectionismResult["classification"] = "Free Spirit";
  let interpretation: LocalizedText = { en: "", ko: "" };

  if (adaptive >= 70) {
    if (maladaptive >= 70) {
      classification = "Grinder"; // High Standards + High Agony
      interpretation = {
        en: "You are a 'Grinder'. You achieve much, but at a heavy emotional cost. Be kind to yourself.",
        ko: "당신은 '자신을 갈아넣는 장인'입니다. 성취는 높으나 감정적 소모가 큽니다. 자신에게 더 관대해지세요.",
      };
    } else {
      classification = "Master Artisan"; // High Standards + Low Agony
      interpretation = {
        en: "You are a 'Master Artisan'. You pursue excellence with joy and healthy drive.",
        ko: "당신은 '진정한 장인'입니다. 즐거움과 건강한 동기로 탁월함을 추구합니다.",
      };
    }
  } else {
    if (maladaptive >= 70) {
      classification = "Tortured Critic"; // Low Standards + High Agony
      interpretation = {
        en: "You are a 'Tortured Critic'. You worry about mistakes without enjoying the process of creation.",
        ko: "당신은 '고뇌하는 비평가'입니다. 창조의 기쁨보다 실수의 두려움이 더 큽니다.",
      };
    } else {
      classification = "Free Spirit"; // Low + Low
      interpretation = {
        en: "You are a 'Free Spirit'. You are flexible and do not let standards define your worth.",
        ko: "당신은 '자유로운 영혼'입니다. 기준에 얽매이지 않고 유연하게 살아갑니다.",
      };
    }
  }

  return {
    ...scores,
    classification,
    interpretation,
    timestamp: Date.now(),
  };
}

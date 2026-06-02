import { SixLangString } from "./engine.contract";
import { interpretEgyptian } from "./engines/egyptian";
import { interpretHellenistic } from "./engines/hellenistic";
import { interpretMayan } from "./engines/mayan";

// ============================================================================
// Helper Utilities
// ============================================================================

export interface SonEobneuneNal {
  dates: Date[];
  explanation: SixLangString;
}

// ============================================================================
// 손없는 날 (Auspicious Days without Harm) - Korean Folk Calendar
// ============================================================================

export interface UniversalInterpretation {
  egyptian?: ReturnType<typeof interpretEgyptian>;
  hellenistic?: ReturnType<typeof interpretHellenistic>;
  mayan?: ReturnType<typeof interpretMayan>;
  sonEobneuneNal?: SonEobneuneNal;
}

/**
 * Calculates 손없는 날 for a given month.
 */
export function calculateSonEobneuneNal(
  year: number,
  month: number,
): SonEobneuneNal {
  const auspiciousDays = [9, 10, 19, 20, 29, 30];
  const dates: Date[] = [];

  auspiciousDays.forEach((day) => {
    const date = new Date(year, month - 1, day);
    if (date.getMonth() === month - 1 && date.getDate() === day) {
      dates.push(date);
    }
  });

  const explanation: SixLangString = {
    en: "Soneomneunenal (손없는 날) means 'Days without harmful spirits.' Spirits called 'Son' are believed to return to heaven on these days, making them ideal for important activities.",
    es: "Soneomneunenal (손없는 날) significa 'Días sin espíritus dañinos'. Son días ideales para mudanzas, bodas y otras actividades importantes.",
    fr: "Soneomneunenal (손없는 날) signifie 'Jours sans esprits malveillants'. Idéal pour les déménagements, les mariages et autres activités importantes.",
    ja: "ソンオムヌンナル（손없는 날）は「有害な霊のいない日」を意味します。引っ越しや結婚、その他の重要な活動に理想的な日とされています。",
    ko: "손없는 날은 '해로운 귀신이 없는 날'을 의미합니다. 매달 음력 9, 10, 19, 20, 29, 30일에는 귀신들이 하늘로 돌아간다고 하여 이사나 결혼에 적합한 날로 여겨집니다.",
    zh: "无害灵日（손없는 날）意为'没有有害灵魂的日子'。这些日子被认为是搬家、婚礼和其他重要活动的理想时间。",
  };

  return {
    dates,
    explanation,
  };
}

// ============================================================================
// UNIVERSAL INTERPRETER - Aggregates all systems
// ============================================================================

/**
 * Aggregator for different astrology systems.
 * Uses modular engines for data retrieval.
 */
export function generateUniversalInterpretation(
  ctx: {
    egyptianDeityId?: string;
    hellenisticHouse?: number;
    hellenisticPlanet?: string;
    mayanSealKey?: string;
    mayanToneId?: number;
    targetMonth?: { month: number; year: number };
  },
  locale: string,
): UniversalInterpretation {
  const result: UniversalInterpretation = {};

  if (ctx.mayanSealKey && ctx.mayanToneId) {
    result.mayan = interpretMayan(ctx.mayanSealKey, ctx.mayanToneId, locale);
  }

  if (ctx.egyptianDeityId) {
    result.egyptian = interpretEgyptian(ctx.egyptianDeityId, locale);
  }

  if (ctx.hellenisticHouse !== undefined) {
    result.hellenistic = interpretHellenistic(
      ctx.hellenisticHouse,
      ctx.hellenisticPlanet,
      locale,
    );
  }

  if (ctx.targetMonth) {
    result.sonEobneuneNal = calculateSonEobneuneNal(
      ctx.targetMonth.year,
      ctx.targetMonth.month,
    );
  }

  return result;
}

export function getLang(str: SixLangString, locale: string): string {
  const lang = locale.substring(0, 2);
  return (str as any)[lang] || str.en || Object.values(str)[0] || "";
}

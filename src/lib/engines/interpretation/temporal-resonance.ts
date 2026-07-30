import type { SixLangString } from "./engine.contract";
import { calculateMayanKin, interpretMayan } from "./engines/mayan";
import { TONE_ACTIONS } from "./shards/mayan-shards";
import { calculateSonEobneuneNal } from "./universal-interpreter";

// ============================================================================
// Temporal Resonance Types
// ============================================================================

export interface AuspiciousDay {
  date: Date;
  isSonEobneuneNal: boolean;
  mayanKin?: string;
  reason: SixLangString;
}

export interface DayEnergy {
  dominantEnergy: SixLangString;
  /** Mayan day signature */
  mayanSignature: string;
  /** Recommended actions */
  recommendations: SixLangString[];
}

export interface OptimalDaysByActivity {
  /** Best for business decisions */
  business: Date[];
  /** Best for creative work */
  creative: Date[];
  /** Best for important meetings */
  meetings: Date[];
  /** Best for moving/travel */
  moving: Date[];
  /** Best for starting new projects */
  newBeginnings: Date[];
  /** Best for weddings/celebrations */
  weddings: Date[];
}

export interface TemporalResonanceResult {
  /** Days recommended for major activities */
  auspiciousDays: AuspiciousDay[];
  /** Current day's cosmic energy */
  currentDayEnergy: DayEnergy;
  /** Best days for specific activities */
  optimalDays: OptimalDaysByActivity;
}

// ============================================================================
// Temporal Resonance Engine
// ============================================================================

/**
 * Calculate temporal resonance for a given month
 */
export function calculateTemporalResonance(
  year: number,
  month: number,
  locale: string,
): TemporalResonanceResult {
  // Get 손없는 날 for the month
  const sonEobneuneNal = calculateSonEobneuneNal(year, month);

  // Build list of auspicious days
  const auspiciousDays: AuspiciousDay[] = sonEobneuneNal.dates.map((date) => {
    const kin = calculateMayanKin(date);
    return {
      date,
      isSonEobneuneNal: true,
      mayanKin: `${kin.sealKey} ${kin.toneId}`,
      reason: {
        en: "Day free from harmful spirits. Ideal for important activities.",
        es: "Día libre de espíritus dañinos. Ideal para actividades importantes.",
        fr: "Jour sans esprits malveillants. Idéal pour les activités importantes.",
        ja: "有害な霊のいない日。重要な活動に理想的。",
        ko: "해로운 귀신이 없는 날. 중요한 활동에 이상적.",
        zh: "无害灵日。适合重要活动。",
      },
    };
  });

  // Add additional auspicious days based on Mayan Tone 1 (new beginnings)
  for (let day = 1; day <= 28; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1) continue;

    const kin = calculateMayanKin(date);
    if (kin.toneId === 1) {
      // Check if not already in list
      const exists = auspiciousDays.some(
        (ad) => ad.date.getDate() === date.getDate(),
      );
      if (!exists) {
        auspiciousDays.push({
          date,
          isSonEobneuneNal: false,
          mayanKin: `${kin.sealKey} ${kin.toneId}`,
          reason: {
            en: "Mayan Tone 1 (Magnetic) - Powerful day for initiating new cycles.",
            es: "Tono Maya 1 (Magnético) - Día poderoso para iniciar nuevos ciclos.",
            fr: "Ton Maya 1 (Magnétique) - Jour puissant pour initier de nouveaux cycles.",
            ja: "マヤのトーン1（磁気）- 新しいサイクルを開始する強力な日。",
            ko: "마야 톤 1 (마그네틱) - 새로운 주기를 시작하는 강력한 날.",
            zh: "玛雅音调1（磁性）- 开启新周期的强大日子。",
          },
        });
      }
    }
  }

  // Current day energy
  const today = new Date();
  const todayKin = calculateMayanKin(today);
  const todayMayan = interpretMayan(todayKin.sealKey, todayKin.toneId, locale);

  const currentDayEnergy: DayEnergy = {
    dominantEnergy: todayMayan.sealNarrative,
    mayanSignature: todayMayan.kinSignature,
    recommendations: [
      todayMayan.lifeMission,
      {
        en: `Today's Galactic Tone ${todayKin.toneId} emphasizes ${TONE_ACTIONS[todayKin.toneId].en}.`,
        es: `El Tono Galáctico de hoy ${todayKin.toneId} enfatiza ${TONE_ACTIONS[todayKin.toneId].es}.`,
        fr: `Le Ton Galactique d'aujourd'hui ${todayKin.toneId} met l'accent sur ${TONE_ACTIONS[todayKin.toneId].fr}.`,
        ja: `今日の銀河のトーン${todayKin.toneId}は${TONE_ACTIONS[todayKin.toneId].ja}を強調しています。`,
        ko: `오늘의 갤럭틱 톤 ${todayKin.toneId}은 ${TONE_ACTIONS[todayKin.toneId].ko}을 강조합니다.`,
        zh: `今天的银河音调${todayKin.toneId}重点在于${TONE_ACTIONS[todayKin.toneId].zh}。`,
      },
    ],
  };

  // Optimal days by activity
  const optimalDays = calculateOptimalDays(year, month);

  return {
    auspiciousDays,
    currentDayEnergy,
    optimalDays,
  };
}

/**
 * Get quick guidance for today
 */
export function getTodayGuidance(locale: string): {
  isAuspicious: boolean;
  mayanSignature: string;
  quickAdvice: SixLangString;
} {
  const today = new Date();
  const day = today.getDate();
  const isAuspicious = [9, 10, 19, 20, 29, 30].includes(day);

  const kin = calculateMayanKin(today);
  const mayan = interpretMayan(kin.sealKey, kin.toneId, locale);

  const toneAction = TONE_ACTIONS[kin.toneId];

  return {
    isAuspicious,
    mayanSignature: mayan.kinSignature,
    quickAdvice: isAuspicious
      ? {
          en: `Today is 손없는 날 - auspicious for important decisions. Energy: ${kin.sealKey}.`,
          es: `Hoy es 손없는 날 - propicio para decisiones importantes. Energía: ${kin.sealKey}.`,
          fr: `Aujourd'hui est 손없는 날 - propice aux décisions importantes. Énergie: ${kin.sealKey}.`,
          ja: `今日は「ソンオムヌンナル (손없는 날)」 - 重要な決定に吉日です。エネルギー: ${kin.sealKey}。`,
          ko: `오늘은 손없는 날 - 중요한 결정에 길조입니다. 에너지: ${kin.sealKey}.`,
          zh: `今天是无害灵日 (손없는 날) - 适合重大决定。能量: ${kin.sealKey}。`,
        }
      : {
          en: `Today's Mayan energy: ${mayan.kinSignature}. Focus on ${toneAction.en}.`,
          es: `Energía Maya de hoy: ${mayan.kinSignature}. Enfócate en ${toneAction.es}.`,
          fr: `Énergie Maya d'aujourd'hui: ${mayan.kinSignature}. Concentrez-vous sur ${toneAction.fr}.`,
          ja: `今日のマヤエネルギー: ${mayan.kinSignature}。${toneAction.ja}に集中してください。`,
          ko: `오늘의 마야 에너지: ${mayan.kinSignature}. ${toneAction.ko}에 집중하세요.`,
          zh: `今天的玛雅能量: ${mayan.kinSignature}。专注于${toneAction.zh}。`,
        },
  };
}

/**
 * Calculate optimal days for various activities
 */
function calculateOptimalDays(
  year: number,
  month: number,
): OptimalDaysByActivity {
  const sonEobneuneNal = calculateSonEobneuneNal(year, month);

  // 손없는 날 are best for all major activities
  const sonDays = sonEobneuneNal.dates;

  // Find Mayan power days
  const creativeDays: Date[] = [];
  const businessDays: Date[] = [];
  const meetingDays: Date[] = [];

  for (let day = 1; day <= 28; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1) continue;

    const kin = calculateMayanKin(date);

    // Tone 3 (Electric) = good for meetings
    if (kin.toneId === 3) {
      meetingDays.push(date);
    }
    // Tone 5 (Overtone) = good for business
    if (kin.toneId === 5) {
      businessDays.push(date);
    }
    // Tone 7 (Resonant) = good for creativity
    if (kin.toneId === 7) {
      creativeDays.push(date);
    }
  }

  return {
    business: [...businessDays, ...sonDays.slice(0, 2)],
    creative: creativeDays,
    meetings: meetingDays,
    moving: sonDays, // 손없는 날 is traditionally best for moving
    newBeginnings: sonDays.slice(0, 2), // First two 손없는 날 of month
    weddings: sonDays, // Weddings should be on 손없는 날
  };
}

import { Locale } from "@/i18n";
import { generateResonanceNarrative } from "@/lib/engines/ai/oracle-voice";
import { MBTIType } from "@/lib/mbti/types";
import { calculateUniversalCorrelation } from "@/lib/ontology/engine/logic";
import { UniversalInput } from "@/lib/ontology/engine/types";
import { analyzeSaju, calculateSaju } from "@/lib/ontology/saju/logic";
import { calculateMBTIResonance } from "@/lib/resonance/mbti-resonance/engine";
import { calculateSajuResonance } from "@/lib/resonance/saju-resonance/engine";

import * as shards from "./data/shards";
import { calculateIching } from "./iching-logic";
import {
  analyzeEnneagramCorrelation,
  calculateMayanKin,
  getCelticSignId,
} from "./logic";
import { normalizeScore, refineResonance } from "./refinery";
import {
  DimensionResult,
  PartnerPartialProfile,
  ResonanceDimensionId,
  TotalResonance,
} from "./types";

type DimensionProvider = (
  self: UserProfile,
  partner: PartnerPartialProfile,
  locale: Locale,
) => DimensionResult;

interface UserProfile {
  birthDate: string;
  birthTime?: { hour: number; minute: number };
  bloodType?: string;
  gender?: string;
  mbti?: string;
}

const DIMENSION_PROVIDERS: Partial<
  Record<ResonanceDimensionId, DimensionProvider>
> = {
  blood_type: (self, partner, _locale) => {
    if (!self.bloodType || !partner.bloodType) {
      return createSimulatedResult("blood_type", 70, 0.2, {
        en: "Vital energies are seeking alignment.",
        ko: "생명의 기운이 조화를 찾고 있습니다.",
      });
    }
    const s1 = self.bloodType.toUpperCase() as shards.BloodType;
    const s2 = partner.bloodType.toUpperCase() as shards.BloodType;
    const synergyMap = shards.bloodTypeData.synergy[s1] as Record<
      shards.BloodType,
      number
    >;
    const score = synergyMap?.[s2] || 70;
    const trait = shards.bloodTypeData.traits[s2];

    return {
      details: { partnerTrait: trait },
      id: "blood_type",
      insight: {
        cn: trait.description,
        en: trait.description,
        es: trait.description,
        fr: trait.description,
        ja: trait.description,
        ko: trait.description,
      } as any,
      isSimulated: false,
      score: normalizeScore(score, "blood_type"),
      strength: 1.0,
      tags: {
        cn: ["生物学", "气质"],
        en: ["Biological", "Temperament"],
        es: ["Biológico", "Temperamento"],
        fr: ["Biologique", "Tempérament"],
        ja: ["生物学的", "気質"],
        ko: ["생물학적", "기질"],
      },
    };
  },
  celtic: (self, partner, _locale) => {
    if (!partner.birthDate) {
      return createSimulatedResult("celtic", 50, 0, {
        en: "The sacred tree is hidden.",
        ko: "신성한 나무가 안개에 가려져 있습니다.",
      });
    }
    const signId = getCelticSignId(new Date(partner.birthDate));
    const sign =
      shards.celticData.signs.find((s) => s.id === signId) ||
      shards.celticData.signs[0];

    return {
      details: { sign },
      id: "celtic",
      insight: sign.name, // Localized Celtic name
      isSimulated: false,
      score: 80, // Default for now
      strength: 1.0,
      tags: {
        cn: ["自然", "灵魂"],
        en: ["Nature", "Soul"],
        es: ["Naturaleza", "Alma"],
        fr: ["Nature", "Âme"],
        ja: ["自然", "魂"],
        ko: ["자연", "영혼"],
      },
    };
  },
  cosmic: (self, partner, locale) => {
    if (!partner.birthDate) {
      return createSimulatedResult("cosmic", 60, 0.4, {
        en: "Planetary alignments are pending.",
        ko: "행성들의 배치가 아직 베일에 싸여 있습니다.",
      });
    }
    const origin1 = calculateUniversalCorrelation({
      birthDate: new Date(self.birthDate),
      bloodType: (self.bloodType as any) || "O",
      gender: (self.gender as any) || "male",
    } as any);
    const origin2 = calculateUniversalCorrelation({
      birthDate: new Date(partner.birthDate),
      bloodType: (partner.bloodType as any) || "O",
      gender: (partner.gender as any) || "male",
    } as any);

    // Cosmic Sync logic: seasonal similarity or opposition
    const s1 = origin1.cosmic?.season || "Eternal Season";
    const s2 = origin2.cosmic?.season || "Eternal Season";
    let score = 75;
    if (s1 === s2)
      score = 95; // Same season soul
    else if (
      (s1.includes("Spring") && s2.includes("Autumn")) ||
      (s1.includes("Summer") && s2.includes("Winter"))
    )
      score = 90; // Balanced opposition

    return {
      id: "cosmic",
      insight: {
        en: `Your souls resonated during ${s1} and ${s2}.`,
        ko: `${s1}과 ${s2}의 기운이 만나 우주적 조화를 이룹니다.`,
      } as any,
      isSimulated: false,
      score,
      strength: 1.0,
      tags: {
        cn: ["天文", "季节"],
        en: ["Astronomy", "Season"],
        es: ["Astronomía", "Estaciones"],
        fr: ["Astronomie", "Saisons"],
        ja: ["天文", "季節"],
        ko: ["천문", "계절"],
      },
    };
  },
  egyptian: (self, partner, locale) => {
    if (!partner.birthDate)
      return createSimulatedResult("egyptian", 50, 0, {
        en: "Hidden gods.",
        ko: "가려진 수호신.",
      });

    const origin1 = calculateUniversalCorrelation({
      birthDate: new Date(self.birthDate),
      bloodType: "O",
      gender: "male",
    });
    const origin2 = calculateUniversalCorrelation({
      birthDate: new Date(partner.birthDate),
      bloodType: "O",
      gender: "male",
    });

    const g1 = origin1.mythos?.egyptian.patronDeity.id;
    const g2 = origin2.mythos?.egyptian.patronDeity.id;

    // Simplistic Egyptian match Logic
    const score = g1 === g2 ? 98 : 82;

    return {
      id: "egyptian",
      insight: {} as any, // Deprecated in favor of insightKey
      insightKey: "ontology.egyptian.alliance_insight",
      isSimulated: false,
      params: {
        god1: origin1.mythos?.egyptian.patronDeity.nameKey,
        god2: origin2.mythos?.egyptian.patronDeity.nameKey,
      },
      score,
      strength: 1.0,
      tags: {
        cn: ["神话", "原型"],
        en: ["Mythology", "Archetype"],
        es: ["Mitología", "Arquetipo"],
        fr: ["Mythologie", "Archétype"],
        ja: ["神話", "原型"],
        ko: ["신화", "원형"],
      },
    };
  },
  love_language: (self, partner, _locale) => {
    // Assuming partner has a generic 'loveLanguage' field in PartnerPartialProfile or we simulate
    // For now, we simulate if missing, or use if provided.
    // Note: PartnerProfile types might need update, checking usage site.
    const selfLL = (self as any).loveLanguage; // Assuming UserProfile has it
    const partnerLL = (partner as any).loveLanguage;

    if (!selfLL || !partnerLL) {
      return createSimulatedResult("love_language", 60, 0.4, {
        en: "Heart languages are yet to be spoken.",
        ko: "마음의 언어가 아직 전해지지 않았습니다.",
      });
    }

    // Simple Compatibility Map
    // Acts of Service (A) <-> Acts of Service (A): High
    // Acts of Service (A) <-> Words of Affirmation (W): Mid
    // ...
    // For MVP, we'll use a simplified check
    const isSame = selfLL === partnerLL;
    const score = isSame ? 95 : 75; // Even different languages can work with effort

    return {
      id: "love_language",
      insight: isSame
        ? {
            en: "You speak the same language of love.",
            ko: "두 분은 같은 사랑의 언어를 공유하고 있습니다.",
          }
        : {
            en: "Different languages, beautiful harmony.",
            ko: "서로 다른 언어지만, 아름다운 조화를 이룹니다.",
          },
      isSimulated: false,
      score,
      strength: 1.0,
      tags: {
        cn: ["情感", "表达"],
        en: ["Emotional", "Expression"],
        es: ["Emocional", "Expresión"],
        fr: ["Émotionnel", "Expression"],
        ja: ["感情", "表現"],
        ko: ["감정", "표현"],
      },
    };
  },
  mayan: (self, partner, _locale) => {
    if (!partner.birthDate) {
      return createSimulatedResult("mayan", 75, 0.1, {
        en: "Ancient glyphs remain silent for now.",
        ko: "고대 수호신이 아직 침묵하고 있습니다.",
      });
    }
    const selfKin = calculateMayanKin(new Date(self.birthDate));
    const partnerKin = calculateMayanKin(new Date(partner.birthDate));
    const sign =
      shards.mayanData.signs.find((s) => s.id === partnerKin.seal.toString()) ||
      shards.mayanData.signs[0];

    // Simple synergy calculation for now
    const score = selfKin.seal === partnerKin.seal ? 95 : 75;

    return {
      details: { kin: partnerKin },
      id: "mayan",
      insight: {
        cn: `Kin ${partnerKin.kin}`,
        en: `Kin ${partnerKin.kin}`,
        es: `Kin ${partnerKin.kin}`,
        fr: `Kin ${partnerKin.kin}`,
        ja: `Kin ${partnerKin.kin}`,
        ko: `Kin ${partnerKin.kin}`,
      } as any,
      isSimulated: false,
      score,
      strength: 1.0,
      tags: {
        cn: ["宇宙", "时间"],
        en: ["Cosmic", "Time"],
        es: ["Cósmico", "Tiempo"],
        fr: ["Cosmique", "Temps"],
        ja: ["宇宙", "時間"],
        ko: ["우주", "시간"],
      },
    };
  },
  mbti: (self, partner, locale) => {
    if (!self.mbti || !partner.mbti) {
      return createSimulatedResult("mbti", 65, 0.3, {
        en: "Character traits are still unfolding.",
        ko: "성격의 결이 서서히 드러나고 있습니다.",
      });
    }
    const mbtiResult = calculateMBTIResonance(
      self.mbti as MBTIType,
      partner.mbti as MBTIType,
    );

    return {
      id: "mbti",
      insight: mbtiResult.insights.summary,
      isSimulated: false,
      score: normalizeScore(mbtiResult.score, "mbti"),
      strength: 1.0,
      tags: {
        cn: ["性格", "沟通"],
        en: ["Personality", "Communication"],
        es: ["Personalidad", "Comunicación"],
        fr: ["Personnalité", "Communication"],
        ja: ["性格", "コミュニケーション"],
        ko: ["성격", "소통"],
      },
    };
  },
  onomancy: (self, partner, locale) => {
    if (!self.mbti)
      return createSimulatedResult("onomancy", 60, 0, {
        en: "Name vibration unknown.",
        ko: "소리의 파동이 아직 전해지지 않았습니다.",
      });

    // We would need the full name of partner for real onomancy
    // For now we use the birth dates and a proxy for "name" if available
    const score = 85; // Default resonant score

    return {
      id: "onomancy",
      insight: {
        en: "Your names resonate in a frequencies of harmony.",
        ko: "두 사람의 이름이 조화로운 주파수로 공명하고 있습니다.",
      } as any,
      isSimulated: false,
      score,
      strength: 1.0,
      tags: {
        cn: ["声音", "波动"],
        en: ["Sound", "Vibration"],
        es: ["Sonido", "Vibración"],
        fr: ["Son", "Vibration"],
        ja: ["音", "波動"],
        ko: ["소리", "파동"],
      },
    };
  },
  saju: (self, partner, locale) => {
    if (!partner.birthDate) {
      return createSimulatedResult("saju", 60, 0.4, {
        en: "The stars are veiled in mist.",
        ko: "별의 자취가 안개 속에 가려져 있습니다.",
      });
    }

    // Calculate Saju Elements for both
    const date1 = new Date(self.birthDate);
    if (self.birthTime)
      date1.setHours(self.birthTime.hour, self.birthTime.minute);

    const date2 = new Date(partner.birthDate);
    if (partner.birthTime) {
      const [h, m] = partner.birthTime.split(":").map(Number);
      date2.setHours(h, m);
    }

    const saju1 = calculateSaju(date1, false, (self.gender || "male") as any);
    const saju2 = calculateSaju(date2, false, partner.gender as any);

    const element1 = analyzeSaju(saju1).dominantElement.toUpperCase();
    const element2 = analyzeSaju(saju2).dominantElement.toUpperCase();

    const sajuResult = calculateSajuResonance(element1 as any, element2 as any);

    return {
      id: "saju",
      insight: {} as any, // Deprecated in favor of insightKey for Saju
      insightKey: sajuResult.insights.summaryKey,
      isSimulated: false,
      score: normalizeScore(sajuResult.score, "saju"),
      strength: 1.0,
      tags: {
        cn: ["命运", "五行"],
        en: ["Destiny", "Elements"],
        es: ["Destino", "Elementos"],
        fr: ["Destin", "Éléments"],
        ja: ["運命", "五行"],
        ko: ["운명", "오행"],
      },
    };
  },
};

export function calculateSacredResonance(
  self: UserProfile,
  partner: PartnerPartialProfile,
  locale: Locale = "ko",
): TotalResonance {
  const activeDimensions: DimensionResult[] = [];

  // Define dimensions to calculate (The 9 Dimensions of Harmony)
  const dimensionsToRun: ResonanceDimensionId[] = [
    "saju",
    "cosmic",
    "egyptian",
    "celtic",
    "mbti",
    "numerology",
    "onomancy",
    "blood_type",
    "mayan",
  ];

  dimensionsToRun.forEach((id) => {
    const provider = DIMENSION_PROVIDERS[id];
    if (provider) {
      activeDimensions.push(provider(self, partner, locale));
    }
  });

  // Calculate I-Ching Oracle (Always included as spiritual bridge)
  const iching = calculateIching(partner.name || "Anonymous", Date.now());

  return refineResonance(
    "Self",
    partner.name || "Partner",
    activeDimensions,
    iching,
  );
}

export async function calculateSacredResonanceAsync(
  self: UserProfile,
  partner: PartnerPartialProfile,
  locale: Locale = "ko",
): Promise<TotalResonance> {
  const result = calculateSacredResonance(self, partner, locale);

  // 3. Dimension: Generative Narrative of Us (Gemini)
  try {
    const narrative = await generateResonanceNarrative(
      (self as any).name || "Self",
      partner.name || "Partner",
      result.totalScore,
      locale,
    );
    result.resonanceNarrative = {
      cn: narrative,
      en: narrative,
      es: narrative,
      fr: narrative,
      ja: narrative,
      ko: narrative,
    };
  } catch (e) {
    console.error("Narrative generation failed", e);
  }

  return result;
}

function createSimulatedResult(
  id: ResonanceDimensionId,
  score: number,
  strength: number,
  insight: Partial<Record<Locale, string>>,
): DimensionResult {
  return {
    id,
    insight: {
      cn: insight.cn || "",
      en: insight.en || "",
      es: insight.es || "",
      fr: insight.fr || "",
      ja: insight.ja || "",
      ko: insight.ko || "",
    },
    isSimulated: true,
    score,
    strength,
    tags: {
      cn: ["模拟"],
      en: ["Simulated"],
      es: ["Simulado"],
      fr: ["Simulé"],
      ja: ["シミュレーション"],
      ko: ["예측값"],
    },
  };
}

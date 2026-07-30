import type { UniversalProfile } from "../engine/types";

export interface AkashicData {
  bio: {
    chronotype: null | string;
    constitution: null | string;
  };
  humanDesign: {
    authority: null | string;
    type: null | string;
  };
  mbti: null | string;
  numerology: {
    lifePath: number;
    personalYear: number;
  };
  saju: {
    animal: null | string;
    element: null | string;
  };
}

/**
 * Extracts and transforms UniversalProfile data for Akashic Record display
 */
export function extractAkashicData(
  profile: null | undefined | UniversalProfile,
  locale: string = "en",
): AkashicData {
  // Return empty structure if profile is missing
  if (!profile) {
    return {
      bio: { chronotype: null, constitution: null },
      humanDesign: { authority: null, type: null },
      mbti: null,
      numerology: { lifePath: 0, personalYear: 0 },
      saju: { animal: null, element: null },
    } as any; // Type assertion to allow nulls temporarily or update interface
  }

  // Find traits from animal zodiac or western zodiac for bio fallback
  const allTraits = [
    ...(profile.animalZodiac?.traits || []),
    ...(profile.westernZodiac?.traits || []),
  ];

  // TODO : 6개국어+ 지원
  // 사용자에게 설명 강화, 이게 무슨 뜻일까? 늑대가 그래서 무슨 의미인데?, Ectomorph 는 어디서 유래한 말이고 무슨 뜻인데? 한글이나 일본어, 프랑스어로는 뭔데?
  // Extract chronotype and constitution from traits
  const chronotype =
    allTraits.find(
      (t) =>
        t.en === "Wolf" ||
        t.ko === "늑대" ||
        t.en === "Lion" ||
        t.en === "Bear" ||
        t.en === "Dolphin",
    )?.en || null;

  const constitution =
    allTraits.find(
      (t) =>
        t.en === "Ectomorph" || t.en === "Mesomorph" || t.en === "Endomorph",
    )?.en || null;

  // Extract numerology
  const expressionNumber = profile.numerology?.numbers?.expressionNumber;
  const lifePathNumber = profile.numerology?.numbers?.lifePathNumber || 0;

  // Extract animal name in correct locale
  const animalName =
    profile.animalZodiac?.name?.[
      locale as keyof typeof profile.animalZodiac.name
    ] || null;

  return {
    bio: {
      chronotype,
      constitution,
    },
    humanDesign: {
      authority:
        (profile.hellenistic?.sect as any) === "day" ? "Emotional" : "Splenic", // Still inferred from sect, acceptable for now
      type:
        (profile.hellenistic?.sect as any) === "day"
          ? "Generator"
          : "Projector",
    },
    mbti: expressionNumber ? `Path ${expressionNumber}` : null,
    numerology: {
      lifePath: lifePathNumber,
      personalYear: 7,
    },
    saju: {
      animal: animalName ? String(animalName) : null,
      element: profile.sajuAnalysis?.dominantElement || null,
    },
  };
}

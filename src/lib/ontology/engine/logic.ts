import { calculateBiorhythm } from "@/lib/engines/biorhythm-engine";
import { LocalizedText } from "@/types/manifest";

import { getBirthAttributes } from "../../data-layer/shards/fate-birth-attributes";
import {
  BirthSymbol,
  FATE_SYMBOLS_DATA,
} from "../../data-layer/shards/fate-symbols";
import { calculateNumerology } from "../../ontology/numerology/logic";
import { calculateSaju } from "../../ontology/saju/logic";
import { analyzeSaju } from "../../ontology/saju/logic";
import { calculateIching } from "../../resonance/relationship/sacred-resonance/iching-logic";
import { getUniversalChronosCoordinates } from "../chronos/chronos-engine";
import { calculateHellenisticCoordinates } from "../hellenistic/calculator";
import { calculateMayanKin } from "../mayan/calculator";
import { analyzeNameEnergy, PrimalElement } from "../onomancy/analysis";
import { BLOOD_TYPE_DATA } from "../traits/blood-type/data";
import { calculateCelestialPosition } from "../western/calculator";
import {
  ANIMAL_ZODIAC_DATA,
  SYNERGY_TEMPLATES,
  WESTERN_ZODIAC_DATA,
} from "./data";
import { SocialAnalysis, UniversalInput, UniversalProfile } from "./types";

/**
 * Basic Core Calculation (formerly Primal)
 */
export function calculateBasicProfile(input: UniversalInput): any {
  // 1. Saju
  const saju = calculateSaju(input.birthDate, false, input.gender); // Corrected parameter order

  // 2. Numerology
  const numerology = calculateNumerology({
    birthDate: input.birthDate,
    fullName: input.fullName || "Seeker",
  });

  // 3. Western Zodiac
  const month = input.birthDate.getMonth() + 1;
  const day = input.birthDate.getDate();
  let westernSign = "aries";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
    westernSign = "aries";
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
    westernSign = "taurus";
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
    westernSign = "gemini";
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
    westernSign = "cancer";
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22))
    westernSign = "leo";
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
    westernSign = "virgo";
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
    westernSign = "libra";
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    westernSign = "scorpio";
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    westernSign = "sagittarius";
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    westernSign = "capricorn";
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    westernSign = "aquarius";
  else westernSign = "pisces";

  const westernZodiac = WESTERN_ZODIAC_DATA[westernSign];

  // 4. Animal Zodiac
  const animals = [
    "rat",
    "ox",
    "tiger",
    "rabbit",
    "dragon",
    "snake",
    "horse",
    "goat",
    "monkey",
    "rooster",
    "dog",
    "pig",
  ];
  const yearBirth = input.birthDate.getFullYear();
  const animalIdx = (yearBirth - 4) % 12;
  const animalSign = animals[animalIdx];
  const animalData = ANIMAL_ZODIAC_DATA[animalSign];
  const animalZodiac = {
    id: animalSign,
    ...animalData,
  };

  // 5. Blood Type
  // Uses canonical data now (IDs/Keys)
  const bloodTypeInfo = BLOOD_TYPE_DATA[input.bloodType || "A"];

  return {
    animalZodiac,
    bloodTypeInfo,
    numerology,
    saju,
    synergy: {
      advice: {
        en: "Walk your path with courage.",
        ko: "당신의 길을 용기 있게 걸어가세요.",
      }, // Mock advice
      description: SYNERGY_TEMPLATES.description,
      title: SYNERGY_TEMPLATES.title,
    },
    westernZodiac,
  };
}

import { calculateKabbalahCoordinates } from "../kabbalah/calculator";
import { calculateVedicCoordinates } from "../vedic/calculator";
import { calculateZiWeiCoordinates } from "../ziwei/calculator";

export function calculateUniversalCorrelation(
  input: UniversalInput,
): UniversalProfile {
  // 1. CHRONOS ENGINE: The Source of Truth (Time -> Coordinates)
  const chronos = getUniversalChronosCoordinates({
    birthDate: input.birthDate,
    fullName: input.fullName,
    gender: input.gender,
  });

  // 2. COSMIC & LEGACY DATA MAP
  // Legacy support for "BasicProfile" structure until fully migrated
  // We reconstruct "legacy" from Chronos data to maintain compatibility
  const legacy = {
    animalZodiac: {
      id: chronos.saju!.year.earthlyBranch.toLowerCase(),
      ...(ANIMAL_ZODIAC_DATA[chronos.saju!.year.earthlyBranch.toLowerCase()] ||
        ANIMAL_ZODIAC_DATA["rat"]),
    },
    bloodTypeInfo: BLOOD_TYPE_DATA[input.bloodType || "A"], // Default if missing
    numerology: chronos.numerology!, // Assumes full name provided
    saju: chronos.saju!,
    westernZodiac:
      WESTERN_ZODIAC_DATA[chronos.zodiac.sign.toLowerCase()] ||
      WESTERN_ZODIAC_DATA["aries"], // Map to rich data
    // TODO: AnimalZodiac mapping might need precise ID matching from EarthlyBranch
  };

  // 3. ANALYSIS LAYER (Logic that interprets coordinates)

  // Saju Analysis (Deep)
  const sajuAnalysis = analyzeSaju(chronos.saju!);
  const missingPrimal = sajuAnalysis.missingElements.map(
    (e) => e.toLowerCase() as PrimalElement,
  );

  // Onomancy (Name Analysis)
  const onomancy = analyzeNameEnergy(input.fullName || "", missingPrimal);

  // Social / Noble People Logic (Derived from Saju Weak Element)
  // Simple Logic: Weak Element is strengthened by the element that generates it.
  // Wood <- Water, Fire <- Wood, Earth <- Fire, Metal <- Earth, Water <- Metal
  const generationMap: Record<string, string> = {
    earth: "Fire",
    fire: "Wood",
    metal: "Earth",
    water: "Metal",
    wood: "Water",
  };
  const beneficialElement =
    generationMap[sajuAnalysis.weakElement.toLowerCase()] || "Earth";

  const social: SocialAnalysis = {
    beneficial: {
      description: {
        en: `social.beneficial.description`,
        ko: `social.beneficial.description`,
      },
      element: beneficialElement,
      relation: "Noble Person",
    },
    compatible: {
      description: {
        en: "social.compatible.description",
        ko: "social.compatible.description",
      },
      stars: [], // To be populated with Zodiac trines if needed
    },
  };

  // 4. MYTHOS LAYER (Construct final object)
  const birthAttributes = getBirthAttributes(input.birthDate);
  const mythos = {
    birthflower: birthAttributes.flower,
    birthstone: birthAttributes.stone,
    celtic: chronos.celtic,
    egyptian: chronos.egyptian,
    iching: calculateIching(
      input.fullName || "Seeker",
      input.birthDate.getTime(),
    ),
    mayan: chronos.mayan!,
    symbols: getBirthSymbols(input.birthDate.getMonth()),
  };

  return {
    ...legacy,
    biorhythms: calculateBiorhythm(input.birthDate, new Date()),
    cosmic: calculateCelestialPosition(input.birthDate),
    hellenistic: chronos.hellenistic,
    input,
    kabbalah: chronos.kabbalah,
    luckyAttributes: sajuAnalysis.luckyAttributes,
    mythos,
    nordic: chronos.nordic,
    onomancy,
    sajuAnalysis,
    social,
    synergy: {
      advice: { en: "synergy.advice", ko: "synergy.advice" },
      description: { en: "synergy.description", ko: "synergy.description" },
      title: { en: "synergy.title", ko: "synergy.title" },
    },
    vedic: chronos.vedic,
    ziWei: chronos.ziwei,
  };
}

function getBirthSymbols(monthIndex: number): BirthSymbol {
  const month = monthIndex + 1;
  return (
    FATE_SYMBOLS_DATA.find((s) => s.month === month) || FATE_SYMBOLS_DATA[0]
  );
}

import type { LocalizedContent } from "@/types/manifest";

import {
  COSMIC_CONSTANTS,
  COSMIC_FACTS,
} from "../../data-layer/shards/fate-cosmic";

export interface CelestialCoordinates {
  axialTilt: number; // degrees
  distanceFromSun: number; // km (approximate based on date)
  galacticVelocity: number; // km/s
  narrative: LocalizedContent;
  orbitalVelocity: number; // km/s
  season: string; // "Vernal Equinox", "Solstice", etc.
}

export function calculateCelestialPosition(date: Date): CelestialCoordinates {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Approximate distance from sun (Perihelion ~Jan 3, Aphelion ~July 4)
  // Distance varies from ~147.1 million km to ~152.1 million km
  // Simple sinusoidal approx
  const dayOfYear = getDayOfYear(date);
  const perihelionDay = 3; // Approx Jan 3
  const daysSincePerihelion = dayOfYear - perihelionDay;
  const radians = (daysSincePerihelion / 365.25) * 2 * Math.PI;
  const distanceVariation = -2500000 * Math.cos(radians); // Perihelion is closest (-), Aphelion furthest (+) - wait, standard formula is r = a(1-e^2)/(1+e cos theta).
  // Simply: Closest in Jan, Furthest in July.
  // Jan: cos(0) = 1. Base - 2.5M. Correct.
  // July: cos(pi) = -1. Base + 2.5M. Correct.

  const distance = COSMIC_CONSTANTS.DISTANCE_TO_SUN_KM + distanceVariation;

  // Precise calculation based on Vis-viva equation approximation
  // v ≈ sqrt(GM * (2/r - 1/a))
  // Simplified: Speed is inversely proportional to distance.
  const meanSpeed = COSMIC_CONSTANTS.EARTH_MEAN_ORBITAL_SPEED_KM_S;
  const meanDistance = COSMIC_CONSTANTS.DISTANCE_TO_SUN_KM;

  // If distance is smaller (Perihelion), speed is higher.
  const instantaneousVelocity = meanSpeed * (meanDistance / distance);

  // Formatting the narrative dynamically
  const baseNarrative = COSMIC_FACTS.find((f) => f.id === "earth-speed")
    ?.narrative || { zh: "", en: "", es: "", fr: "", ja: "", ko: "" };
  const speedStr = instantaneousVelocity.toFixed(2);

  const dynamicNarrative: LocalizedContent = {
    zh: `在你出生的那一刻，受${Math.round(distance / 1000000)}00万公里日地距离的影响，地球正以每秒${speedStr}公里的速度飞驰。`,
    en: `At the moment of your birth, Earth was rushing through space at ${speedStr} km/s (relative to the Sun), influenced by its proximity of ${Math.round(distance / 1000000)}M km.`,
    es: `En el momento de tu nacimiento, la Tierra corría a ${speedStr} km/s, influenciada por su proximidad de ${Math.round(distance / 1000000)}M km con el Sol.`,
    fr: `Au moment de votre naissance, la Terre fonçait à ${speedStr} km/s, influencée par sa proximité de ${Math.round(distance / 1000000)}M km avec le Soleil.`,
    ja: `あなたが生まれた瞬間、地球は太陽との距離${Math.round(distance / 1000000)}00万kmの影響を受け、${speedStr}km/sの速度で疾走していました。`,
    ko: `당신이 태어난 순간, 지구는 태양과의 거리 ${Math.round(distance / 1000000)}00만 km의 영향으로 초속 ${speedStr}km의 속도로 질주하고 있었습니다.`,
  };

  return {
    axialTilt: COSMIC_CONSTANTS.EARTH_AXIAL_TILT_DEGREES,
    distanceFromSun: Math.round(distance),
    galacticVelocity: COSMIC_CONSTANTS.SOLAR_SYSTEM_GALACTIC_SPEED_KM_S,
    narrative: dynamicNarrative,
    orbitalVelocity: Number(instantaneousVelocity.toFixed(2)),
    season: getSeason(date),
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getSeason(date: Date): string {
  // Northern Hemisphere simplifiction
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "Spring (Vernal)";
  if (month >= 5 && month <= 7) return "Summer (Estival)";
  if (month >= 8 && month <= 10) return "Autumn (Autumnal)";
  return "Winter (Hibernal)";
}

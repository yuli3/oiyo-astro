/**
 * Zi Wei Dou Shu Calculator (Professional)
 * The Grand Archive - Mastery Phase
 *
 * Implements:
 * 1. True Lunar Calendar Conversion
 * 2. 12 Palace Layout (Life, Siblings, Spouse...) based on Birth Month & Hour
 * 3. 5 Bureau Calculation (Environment/Element Phase)
 * 4. 14 Major Stars Placement
 */

import { getLunarDate } from "../calendar-systems/lunar-kernel";
import { getSexagenaryCycle } from "../calendar-systems/sexagenary";
import { getTrueSolarTime } from "../kernel/astronomy";
import { MAIN_STARS } from "./data";
import { AUXILIARY_STARS, SHAR_DYNAMICS } from "./data_stars";
import { Element, Palace, PalaceKey, Star, ZiWeiCoordinates } from "./types";

// ... (Existing constants and helper functions: getLifePalaceIndex, getBureau, etc. keep as is)
// (Note: I will assume the previous implementation of helpers is stable or I will re-include them if line range allows)

// Re-including necessary helpers that were in the file
const BRANCHES = [
  "Zi",
  "Chou",
  "Yin",
  "Mao",
  "Chen",
  "Si",
  "Wu",
  "Wei",
  "Shen",
  "You",
  "Xu",
  "Hai",
];
const PALACE_ORDER: PalaceKey[] = [
  "life",
  "siblings",
  "spouse",
  "children",
  "wealth",
  "health",
  "travel",
  "friends",
  "career",
  "property",
  "mental",
  "parents",
];

export function calculateZiWeiCoordinates(
  birthDate: Date,
  longitude: number = 135.0,
): ZiWeiCoordinates {
  // 0. High-Precision TST Correction
  const trueDate = getTrueSolarTime(birthDate, longitude);

  // 1. Kernel Conversions
  const lunar = getLunarDate(trueDate);
  const sexagenary = getSexagenaryCycle(trueDate);

  const stemOrder = [
    "GAP",
    "EUL",
    "BYEONG",
    "JEONG",
    "MU",
    "GI",
    "GYEONG",
    "SIN",
    "IM",
    "GYE",
  ];
  const branchOrder = [
    "JA",
    "CHUK",
    "IN",
    "MYO",
    "JIN",
    "SA",
    "O",
    "MI",
    "SIN",
    "YU",
    "SUL",
    "HAE",
  ];

  const yearStemIdx = stemOrder.indexOf(sexagenary.year.heavenlyStem);
  const hourBranchIdx = branchOrder.indexOf(sexagenary.hour.earthlyBranch);

  // 2. Life Palace Position
  const lifeIndex = getLifePalaceIndex(lunar.lunarMonth, hourBranchIdx);

  // 3. Bureau
  const bureau = getBureau(lifeIndex, yearStemIdx);

  // 4. Star Placements
  const stars: Record<string, number> = {};
  const zwPos = calculateZiWeiPosition(bureau.number, lunar.lunarDay);
  const tfPos = (16 - zwPos) % 12;

  // North/South Groups
  stars["zi_wei"] = zwPos;
  ["tian_ji", "tai_yang", "wu_qu", "tian_tong", "lian_zhen"].forEach(
    (sId, i) => {
      const offsets = [1, 3, 4, 5, 8];
      stars[sId] = (zwPos - offsets[i] + 12) % 12;
    },
  );
  stars["tian_fu"] = tfPos;
  [
    "tai_yin",
    "tan_lang",
    "ju_men",
    "tian_xiang",
    "tian_liang",
    "qi_sha",
    "po_jun",
  ].forEach((sId, i) => {
    const offsets = [1, 2, 3, 4, 5, 6, 10];
    stars[sId] = (tfPos + offsets[i]) % 12;
  });

  // Auxiliary Stars (Major ones)
  stars["wen_chang"] = (10 - hourBranchIdx + 12) % 12;
  stars["wen_qu"] = (2 + hourBranchIdx) % 12;

  // 5. Transformations (Sihua)
  const stemName = [
    "Gap",
    "Eul",
    "Byeong",
    "Jeong",
    "Mu",
    "Gi",
    "Gyeong",
    "Sin",
    "Im",
    "Gye",
  ][yearStemIdx];
  const transformations = (SHAR_DYNAMICS as any)[stemName] || {};

  // 6. Build Palaces
  const palaces: Record<PalaceKey, Palace> = {} as any;
  PALACE_ORDER.forEach((key, i) => {
    let idx = lifeIndex - i;
    while (idx < 0) idx += 12;
    idx = idx % 12;

    const starsInPalace: Star[] = [];
    Object.entries(stars).forEach(([sId, sPos]) => {
      if (sPos === idx) {
        const meta = (MAIN_STARS.find((s) => s.id === sId) ||
          AUXILIARY_STARS.find((s) => s.id === sId)) as Star;

        if (meta) {
          const trans = transformations[meta.id];
          const starWithTrans = trans
            ? { ...meta, transformation: trans }
            : meta;
          starsInPalace.push(starWithTrans as Star);
        }
      }
    });

    palaces[key] = {
      earthlyBranch: BRANCHES[idx],
      index: idx,
      key,
      stars: starsInPalace,
    };
  });

  return {
    bureau,
    lifePalace: palaces["life"],
    lunarDate: {
      day: lunar.lunarDay,
      isLeap: lunar.isLeap,
      month: lunar.lunarMonth,
      year: lunar.lunarYear,
    },
    palaces,
    resonance: {
      key: "resonance.professionalChart",
      params: {
        bureau: bureau.name,
        lifePalace: BRANCHES[lifeIndex],
        starCount: palaces["life"].stars.length.toString(),
      },
    },
    solarDate: birthDate,
  };
}

function calculateZiWeiPosition(bureau: number, day: number): number {
  let adj, q;
  if (day % bureau === 0) {
    q = day / bureau;
    adj = 0;
  } else {
    q = Math.floor(day / bureau) + 1;
    adj = q * bureau - day;
  }
  const base = 2 + (q - 1);
  let finalIdx = base + (adj % 2 === 0 ? adj : -adj);
  while (finalIdx < 0) finalIdx += 12;
  return finalIdx % 12;
}

function getBureau(
  lifePalaceBranchIndex: number,
  birthYearStemIndex: number,
): { element: Element; name: string; number: number } {
  const baseStemMap = [2, 4, 6, 8, 0];
  const startStemIndex = baseStemMap[birthYearStemIndex % 5];
  let offset = lifePalaceBranchIndex - 2;
  if (offset < 0) offset += 12;
  const lifeStemIndex = (startStemIndex + offset) % 10;
  const element = getNaYinElement(lifeStemIndex, lifePalaceBranchIndex);
  const bureauMap: Record<Element, number> = {
    Earth: 5,
    Fire: 6,
    Metal: 4,
    Water: 2,
    Wood: 3,
  };
  return {
    element,
    name: `${element} ${bureauMap[element]} Bureau`,
    number: bureauMap[element],
  };
}

function getLifePalaceIndex(lunarMonth: number, hourIndex: number): number {
  let idx = 2 + (lunarMonth - 1) - hourIndex;
  while (idx < 0) idx += 12;
  return idx % 12;
}

function getNaYinElement(stemIdx: number, branchIdx: number): Element {
  const stemVal = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5][stemIdx];
  const branchVal = [0, 0, 1, 1, 2, 2][branchIdx % 6];
  const sum = stemVal + branchVal;
  const rem = sum > 5 ? sum - 5 : sum;
  const map: Record<number, Element> = {
    1: "Metal",
    2: "Water",
    3: "Fire",
    4: "Earth",
    5: "Wood",
  };
  return map[rem] || "Wood";
}

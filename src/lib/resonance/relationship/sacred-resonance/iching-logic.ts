import type { LocalizedText } from "@/types/manifest";

import type { IChingOracle } from "./types";

/**
 * Calculates a Hexagram based on a name and optional timestamp.
 * Uses a pseudo-random deterministic seed for consistency.
 */
export function calculateIching(
  name: string = "Anonymous",
  timestamp: number = Date.now(),
): IChingOracle {
  // 1. Generate a seed based on name length and timestamp (hour-level granularity for consistency within an hour)
  const nameValue = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hourTs = Math.floor(timestamp / (1000 * 60 * 60));
  const seed = (nameValue + name.length * 10) ^ hourTs;

  // 2. Select one of the 64 hexagrams (we'll implement a few key ones for the demo)
  const hexNum = (seed % 64) + 1;

  return getHexagramData(hexNum);
}

function getHexagramData(num: number): IChingOracle {
  const data: Record<number, IChingOracle> = {
    1: {
      hexagramName: {
        zh: "乾",
        en: "The Creative",
        es: "Lo Creativo",
        fr: "Le Créateur",
        ja: "乾為天",
        ko: "중천건 (The Creative)",
      },
      hexagramNumber: 1,
      image: {
        zh: "龙飞在天",
        en: "A dragon flying in the heavens",
        es: "Un dragón volando en los cielos",
        fr: "Un dragon volant dans les cieux",
        ja: "龍が天を飛ぶ",
        ko: "용이 하늘을 나는 형상",
      },
      judgment: {
        zh: "天之气充满，两人的开始是宏大的。",
        en: "The power of heaven is full; the beginning for you two is grand.",
        es: "El poder del cielo es pleno; el comienzo para ustedes dos es grandioso.",
        fr: "Le pouvoir du ciel est total ; votre début à deux est grandiose.",
        ja: "天の気が満ちており、二人の始まりは壮大です。",
        ko: "하늘의 기운이 충만하니, 두 사람의 시작은 거대합니다.",
      },
    },
    2: {
      hexagramName: {
        zh: "坤",
        en: "The Receptive",
        es: "Lo Receptivo",
        fr: "Le Réceptif",
        ja: "坤為地",
        ko: "중지곤 (The Receptive)",
      },
      hexagramNumber: 2,
      image: {
        zh: "大地包容万物",
        en: "The earth embracing all things",
        es: "La tierra abrazando todas las cosas",
        fr: "La terre embrassant toutes choses",
        ja: "大地が万物を包む",
        ko: "대지가 만물을 품는 형상",
      },
      judgment: {
        zh: "互相包容忍耐时，会结出最大的果实。",
        en: "Greatest fruits are born when you embrace and endure each other.",
        es: "Los mejores frutos nacen cuando se aceptan y se apoyan mutuamente.",
        fr: "Les plus grands fruits naissent lorsque vous vous acceptez et vous soutenez.",
        ja: "互いを受け入れ耐えるとき、最大の成果が得られます。",
        ko: "서로를 수용하고 인내할 때 가장 큰 결실을 맺습니다.",
      },
    },
  };

  if (data[num]) return data[num];

  return {
    hexagramName: {
      zh: `卦 ${num}`,
      en: `Hexagram ${num}`,
      es: `Hexagrama ${num}`,
      fr: `Hexagramme ${num}`,
      ja: `卦 ${num}`,
      ko: `수뢰둔 (Hexagram ${num})`,
    },
    hexagramNumber: num,
    image: {
      zh: "困难中萌芽",
      en: "Sprouts emerging from difficulties",
      es: "Brotes emergiendo de las dificultades",
      fr: "Des pousses émergeant des difficultés",
      ja: "困難の中から芽が出る",
      ko: "어려움 속에서 싹이 트는 형상",
    },
    judgment: {
      zh: "新的相遇伴随着成长的痛苦，但光明即将到来。",
      en: "New encounters come with growing pains, but light will follow.",
      es: "Los nuevos encuentros vienen con dolores de crecimiento, pero la luz seguirá.",
      fr: "Les nouvelles rencontres s'accompagnent de douleurs de croissance, mais la lumière suivra.",
      ja: "新しい出会いには痛みが伴いますが、やがて光が見えるでしょう。",
      ko: "새로운 만남에는 진통이 따르나 곧 광명을 찾을 것입니다.",
    },
  };
}

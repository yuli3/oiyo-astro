/**
 * 오행 부적의 상징 사전.
 *
 * 2026-09-21: "부적 써주기" 배치. 개인화를 난수로 하지 않는다 — 사주에서
 * 계산한 weakElement(보완이 필요한 오행)를 받아 그 오행의 전통 상응
 * (색·방위·계절·형상)으로 도형을 만든다. 같은 사람이 다시 열면 같은 부적이
 * 나오고, 왜 이 모양인지 화면에서 설명할 수 있다.
 *
 * 여기 적은 상응은 오행 사상의 기본 배당이다(오색·오방·사계·오상).
 * 실제 전통 부적의 문양(주사 부적의 특정 자형 등)을 재현하지 않는다 —
 * 그건 종교·무속 관행이고, 이 도구는 상징 디자인이다.
 */
import { FiveElement } from "../ontology/saju/types";

export interface ElementSymbol {
  /** 오방색 */
  color: string;
  /** 보조색 — 그라디언트와 테두리에 쓴다 */
  accent: string;
  /** 오방 */
  direction: Record<string, string>;
  /** 계절 */
  season: Record<string, string>;
  /** 이름 */
  name: Record<string, string>;
  /** 이 오행을 보완한다는 것이 무슨 뜻인지 */
  meaning: Record<string, string>;
  /** 부적 한가운데 새기는 오행 본자 */
  glyph: string;
  /** 아래쪽에 세로로 새기는 네 자 — 그 오행이 더하는 기운 */
  tailGlyphs: string;
}

export const ELEMENT_SYMBOLS: Record<FiveElement, ElementSymbol> = {
  [FiveElement.WOOD]: {
    color: "#3f7a53",
    accent: "#8fc79a",
    glyph: "木",
    tailGlyphs: "生長不息",
    name: { ko: "목(木)", en: "Wood", ja: "木", zh: "木", fr: "Bois", es: "Madera" },
    direction: { ko: "동(東)", en: "East", ja: "東", zh: "东", fr: "Est", es: "Este" },
    season: { ko: "봄", en: "Spring", ja: "春", zh: "春", fr: "Printemps", es: "Primavera" },
    meaning: {
      ko: "뻗어 나가는 힘이 모자랍니다. 시작하고 자라는 쪽에 기운을 더합니다.",
      en: "The outward, growing force is thin. This adds momentum to beginning and expanding.",
      ja: "伸びる力が不足しています。始めて育つ方へ気を足します。",
      zh: "向外生长的力量偏弱，补足开始与生长的气。",
      fr: "La force de croissance manque. Elle soutient ce qui commence et s'étend.",
      es: "Falta la fuerza de crecimiento. Refuerza lo que empieza y se expande.",
    },
  },
  [FiveElement.FIRE]: {
    color: "#b4452f",
    accent: "#e79273",
    glyph: "火",
    tailGlyphs: "光明遍照",
    name: { ko: "화(火)", en: "Fire", ja: "火", zh: "火", fr: "Feu", es: "Fuego" },
    direction: { ko: "남(南)", en: "South", ja: "南", zh: "南", fr: "Sud", es: "Sur" },
    season: { ko: "여름", en: "Summer", ja: "夏", zh: "夏", fr: "Été", es: "Verano" },
    meaning: {
      ko: "드러내고 밝히는 힘이 모자랍니다. 표현하고 데우는 쪽에 기운을 더합니다.",
      en: "The revealing, warming force is thin. This adds momentum to expressing and heating.",
      ja: "現し照らす力が不足しています。表現し温める方へ気を足します。",
      zh: "显现与照亮的力量偏弱，补足表达与温暖的气。",
      fr: "La force qui révèle et réchauffe manque. Elle soutient l'expression et la chaleur.",
      es: "Falta la fuerza que revela y calienta. Refuerza la expresión y el calor.",
    },
  },
  [FiveElement.EARTH]: {
    color: "#8a6c3d",
    accent: "#d3b785",
    glyph: "土",
    tailGlyphs: "厚德載物",
    name: { ko: "토(土)", en: "Earth", ja: "土", zh: "土", fr: "Terre", es: "Tierra" },
    direction: { ko: "중앙(中)", en: "Center", ja: "中央", zh: "中", fr: "Centre", es: "Centro" },
    season: { ko: "환절기", en: "Between seasons", ja: "土用", zh: "季夏", fr: "Intersaison", es: "Entre estaciones" },
    meaning: {
      ko: "받치고 중심을 잡는 힘이 모자랍니다. 머물고 쌓는 쪽에 기운을 더합니다.",
      en: "The supporting, centering force is thin. This adds momentum to staying and accumulating.",
      ja: "支え中心を保つ力が不足しています。留まり積む方へ気を足します。",
      zh: "承托与居中的力量偏弱，补足停留与积累的气。",
      fr: "La force qui soutient et centre manque. Elle soutient ce qui demeure et s'accumule.",
      es: "Falta la fuerza que sostiene y centra. Refuerza lo que permanece y acumula.",
    },
  },
  [FiveElement.METAL]: {
    color: "#6f7780",
    accent: "#c9d2da",
    glyph: "金",
    tailGlyphs: "剛正不屈",
    name: { ko: "금(金)", en: "Metal", ja: "金", zh: "金", fr: "Métal", es: "Metal" },
    direction: { ko: "서(西)", en: "West", ja: "西", zh: "西", fr: "Ouest", es: "Oeste" },
    season: { ko: "가을", en: "Autumn", ja: "秋", zh: "秋", fr: "Automne", es: "Otoño" },
    meaning: {
      ko: "가르고 맺는 힘이 모자랍니다. 정리하고 결정하는 쪽에 기운을 더합니다.",
      en: "The dividing, concluding force is thin. This adds momentum to sorting and deciding.",
      ja: "分け結ぶ力が不足しています。整理し決める方へ気を足します。",
      zh: "分辨与收束的力量偏弱，补足整理与决断的气。",
      fr: "La force qui tranche et conclut manque. Elle soutient le tri et la décision.",
      es: "Falta la fuerza que separa y concluye. Refuerza ordenar y decidir.",
    },
  },
  [FiveElement.WATER]: {
    color: "#2f4f6f",
    accent: "#8fb3cf",
    glyph: "水",
    tailGlyphs: "上善若水",
    name: { ko: "수(水)", en: "Water", ja: "水", zh: "水", fr: "Eau", es: "Agua" },
    direction: { ko: "북(北)", en: "North", ja: "北", zh: "北", fr: "Nord", es: "Norte" },
    season: { ko: "겨울", en: "Winter", ja: "冬", zh: "冬", fr: "Hiver", es: "Invierno" },
    meaning: {
      ko: "스미고 머금는 힘이 모자랍니다. 기다리고 깊어지는 쪽에 기운을 더합니다.",
      en: "The soaking, holding force is thin. This adds momentum to waiting and deepening.",
      ja: "染み含む力が不足しています。待ち深まる方へ気を足します。",
      zh: "渗透与含蓄的力量偏弱，补足等待与沉潜的气。",
      fr: "La force qui imprègne et retient manque. Elle soutient l'attente et la profondeur.",
      es: "Falta la fuerza que impregna y retiene. Refuerza la espera y la profundidad.",
    },
  },
};

/**
 * 생년월일시가 같으면 같은 부적이 나와야 한다. Math.random 을 쓰지 않고
 * 시드에서 결정론적으로 뽑는다 — 다시 열어도, 공유 링크로 열어도 같다.
 */
export function seedFrom(parts: (string | number)[]): number {
  let h = 2166136261;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

/** 시드에서 [0,1) 난수를 순차로 뽑는다 (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

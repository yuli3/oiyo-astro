import { LocalizedContent } from "@/types/manifest";

export interface NameAnalysisResult {
  balanceScore: number; // 0-100 indicating how well it complements Saju
  elementsFound: PrimalElement[];
  narrative: LocalizedContent;
}

export type PrimalElement = "earth" | "fire" | "metal" | "water" | "wood";

const HANGUL_ELEMENT_MAP: Record<string, PrimalElement> = {
  // Wood (ㄱ, ㅋ)
  ㄱ: "wood",
  ㄲ: "wood", // Fire (ㄴ, ㄷ, ㄹ, ㅌ)
  ㄴ: "fire",
  ㄷ: "fire",
  ㄸ: "fire",
  ㄹ: "fire", // Water (ㅁ, ㅂ, ㅍ)
  ㅁ: "water",
  ㅂ: "water",
  ㅃ: "water", // Metal (ㅅ, ㅈ, ㅊ) - Confirmed by User Prompt
  ㅅ: "metal",
  ㅆ: "metal", // Earth (ㅇ, ㅎ) - Following common naming science (User prompt implied Metal is s/j/ch)
  ㅇ: "earth",
  ㅈ: "metal",
  ㅉ: "metal",
  ㅊ: "metal",
  ㅋ: "wood",
  ㅌ: "fire",
  ㅍ: "water",
  ㅎ: "earth",
};

export function analyzeNameEnergy(
  fullName: string,
  missingElements: PrimalElement[] = [],
): NameAnalysisResult {
  const detectedElements: PrimalElement[] = [];

  // Analyze each character
  for (let i = 0; i < fullName.length; i++) {
    const char = fullName[i];
    const initial = getInitialSound(char);
    if (initial && HANGUL_ELEMENT_MAP[initial]) {
      detectedElements.push(HANGUL_ELEMENT_MAP[initial]);
    }
    // Handle English names
    if (!initial) {
      const firstChar = char.toLowerCase();
      const englishMap: Record<string, PrimalElement> = {
        a: "wood",
        b: "water",
        c: "metal",
        d: "fire",
        e: "wood",
        f: "water",
        g: "wood",
        h: "earth",
        i: "fire",
        j: "metal",
        k: "wood",
        l: "fire",
        m: "water",
        n: "fire",
        o: "earth",
        p: "water",
        q: "wood",
        r: "fire",
        s: "metal",
        t: "fire",
        u: "earth",
        v: "water",
        w: "water",
        x: "metal",
        y: "earth",
        z: "metal",
      };
      if (englishMap[firstChar]) {
        detectedElements.push(englishMap[firstChar]);
      }
    }
  }

  // Calculate 'Filling' score
  let matchCount = 0;
  matchingLoop: for (const missing of missingElements) {
    if (detectedElements.includes(missing)) {
      matchCount++;
    }
  }

  const balanceScore =
    missingElements.length > 0
      ? Math.min(100, Math.round((matchCount / missingElements.length) * 100))
      : 80; // Default if no missing elements

  // Narrative Construction
  const filled = missingElements.filter((e) => detectedElements.includes(e));
  const elementsString = filled.join(", ");

  const narrative: LocalizedContent = {
    cn:
      filled.length > 0
        ? `你名字的声音振动通过补充${elementsString}来增强这你的能量。`
        : "你的名字带有独特的宇宙振动。",
    en:
      filled.length > 0
        ? `Your name's sound vibration reinforces your energy by supplying ${elementsString}.`
        : "Your name carries a unique vibration.",
    es:
      filled.length > 0
        ? `La vibración sonora de tu nombre refuerza tu energía aportando ${elementsString}.`
        : "Tu nombre conlleva una vibración única.",
    fr:
      filled.length > 0
        ? `La vibration sonore de votre nom renforce votre énergie en apportant ${elementsString}.`
        : "Votre nom porte une vibration unique.",
    ja:
      filled.length > 0
        ? `名前の音の振動が、${elementsString}のエネルギーを補っています。`
        : "あなたの名前は独自の宇宙的波動を持っています。",
    ko:
      filled.length > 0
        ? `이름의 소리 파동이 사주에 부족한 ${elementsString} 기운을 보완해주고 있습니다.`
        : "당신의 이름은 고유한 우주적 파동을 지니고 있습니다.",
  };

  return {
    balanceScore,
    elementsFound: detectedElements,
    narrative,
  };
}

function getInitialSound(char: string): null | string {
  const code = char.charCodeAt(0);
  // Hangul Syllables range: AC00 - D7A3
  if (code < 0xac00 || code > 0xd7a3) return null;

  const initialOffset = Math.floor((code - 0xac00) / 28 / 21);
  const initials = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  return initials[initialOffset] || null;
}

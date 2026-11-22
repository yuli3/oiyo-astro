// 실록 속 내 이름 한자 — 세종실록 8년(1426) 기사 1,149건에서 이름 한자 찾기.
// 데이터: public/data/sillok-1426-chars.json (scripts/build-sillok-1426-chars.py).

export type CharRow = [count: number, rank: number, day: string, seq: number, snippet: string];
export type CharData = { oldid: number; entries: number; total: number; kinds: number; c: Record<string, CharRow> };

/** 이름에 흔히 쓰는 신자체·이체자를 실록 원문(위키문헌) 표기로 맞춘다. */
const VARIANTS: Record<string, string> = { 為: "爲", 教: "敎", 説: "說", 晚: "晩", 呉: "吳", 姫: "姬", 徳: "德", 恵: "惠", 栄: "榮", 浜: "濱", 沢: "澤", 国: "國", 学: "學", 竜: "龍", 真: "眞", 研: "硏" };

const isHanja = (ch: string) => /[㐀-䶿一-鿿豈-﫿]/u.test(ch);

export function parseName(input: string): { chars: string[]; hangul: boolean } {
  const all = [...input.trim()];
  const hangul = all.some((ch) => /[가-힣]/u.test(ch));
  const chars = all.filter(isHanja).map((ch) => ch.normalize("NFKC"));
  return { chars: chars.slice(0, 4), hangul };
}

export type Found = { ch: string; row: CharRow | null };

const REVERSE = Object.fromEntries(Object.entries(VARIANTS).map(([a, b]) => [b, a]));
/** 원문 표기가 다르면 이체자로도 찾아본다(예: 為 → 爲). */
export const lookup = (chars: string[], data: CharData): Found[] =>
  chars.map((ch) => {
    for (const k of [ch, VARIANTS[ch], REVERSE[ch]]) if (k && data.c[k]) return { ch: k, row: data.c[k]! };
    return { ch, row: null };
  });

export type Tier = "regular" | "guest" | "rare" | "absent";
/** 이름 전체의 '실록 등장 등급': 가장 드문 글자를 기준으로 정한다. */
export function tierOf(found: Found[]): Tier {
  const counts = found.map((f) => f.row?.[0] ?? 0);
  const min = Math.min(...counts);
  if (min === 0) return "absent";
  if (min >= 100) return "regular";
  if (min >= 10) return "guest";
  return "rare";
}

/** 1만 자당 몇 번 나오는지 */
export const perTenThousand = (count: number, total: number) => (count / total) * 10000;

export function dayParts(day: string): { month: number; day: number } {
  const [m, d] = day.split("-").map(Number);
  return { month: m ?? 1, day: d ?? 1 };
}

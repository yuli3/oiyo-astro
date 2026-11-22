// 1426 한양 대화재 — 『세종실록』 8년 2월 15일~3월 3일 기사로 만든 회귀형 토이.
// 2월 15일로 돌아간 내가 불 막을 방안 5가지를 올리면, 실제 조정이 그 뒤 며칠 만에 무엇을 정했는지 맞춰 본다.

export type Outcome = "adopted" | "declined" | "absent";
export type Proposal = { id: string; outcome: Outcome; m?: number; d?: number; quote?: string };

export const PROPOSALS: Proposal[] = [
  { id: "relief", outcome: "adopted", m: 2, d: 16, quote: "計口量給口糧。被火爛傷者，令醫治療" },
  { id: "firewall", outcome: "adopted", m: 2, d: 20, quote: "京都行廊，築防火墻" },
  { id: "roads", outcome: "adopted", m: 2, d: 20, quote: "廣開城內道路，使之四通" },
  { id: "wells", outcome: "adopted", m: 2, d: 20, quote: "行廊十間，私家五間，作一坎井" },
  { id: "tools", outcome: "adopted", m: 2, d: 20, quote: "宗廟、闕內及鍾樓樓門，作救火器械藏之" },
  { id: "watch", outcome: "adopted", m: 2, d: 25, quote: "每夜一所，各定五人，輪番把守" },
  { id: "jars", outcome: "adopted", m: 2, d: 26, quote: "貯水盆甕，依中國例，每五家一所造置" },
  { id: "agency", outcome: "adopted", m: 2, d: 26, quote: "別立禁火都監" },
  { id: "tiles", outcome: "adopted", m: 2, d: 29, quote: "設別窰令燔瓦，輕價分給" },
  { id: "bell", outcome: "adopted", m: 3, d: 3, quote: "掌守鍾樓，晝夜觀望，有失火之處，則撞鍾" },
  { id: "pass", outcome: "adopted", m: 3, d: 3, quote: "請造給信牌，以爲夜中救火之信" },
  { id: "noWine", outcome: "declined", m: 2, d: 23, quote: "憲司昨日請禁酒…退而更議" },
  { id: "insurance", outcome: "absent" },
  { id: "pump", outcome: "absent" },
];

export const PICKS = 5;
export const byId = (id: string) => PROPOSALS.find((p) => p.id === id);

/** 실록 날짜 순서(2/16 → 3/3). */
export const dayKey = (p: Proposal) => (p.m ?? 99) * 100 + (p.d ?? 99);

export type Score = { adopted: number; declined: number; absent: number; firstDay: number | null };
export function score(ids: string[]): Score {
  const ps = ids.map(byId).filter((p): p is Proposal => !!p);
  const adopted = ps.filter((p) => p.outcome === "adopted");
  // 2/15 대화재 다음 날부터 며칠 만에 처음 받아들여졌나 (2월은 30일까지 있는 달: 2/30 다음이 3/1).
  const days = adopted.map((p) => (p.m === 2 ? p.d! - 15 : 15 + p.d!));
  return {
    adopted: adopted.length,
    declined: ps.filter((p) => p.outcome === "declined").length,
    absent: ps.filter((p) => p.outcome === "absent").length,
    firstDay: days.length ? Math.min(...days) : null,
  };
}

export type Rank = "sage" | "official" | "clerk" | "dreamer";
export function rankOf(s: Score): Rank {
  if (s.adopted >= 5) return "sage";
  if (s.adopted >= 4) return "official";
  if (s.adopted >= 2) return "clerk";
  return "dreamer";
}

/** 2월 15일·16일 불 피해(실록 그대로). */
export const DAMAGE = {
  rowHouses: 116,
  houses: { central: 1630, south: 350, east: 190 },
  housesTotal: 1630 + 350 + 190,
  secondDay: 200,
  dead: { men: 9, women: 23 },
} as const;

export const formatPicks = (ids: string[]) => `p=${ids.join(".")}`;
export function parsePicks(search: string): string[] | null {
  const p = new URLSearchParams(search).get("p");
  if (!p) return null;
  const ids = [...new Set(p.split("."))].filter((id) => byId(id));
  return ids.length === PICKS ? ids : null;
}

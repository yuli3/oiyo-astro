// 면포 환율 계산기 1426 — 세종 8년 무렵의 면포·쌀·저화·동전 환산.
// 공정 비율: 『세종실록』 8년 1월 19일 형조 계(장인 수세 예): 저화 1장 = 쌀 1두, 쌀 1두 = 동전 40문.
// 면포 1필 = 쌀 5두: 1450년 이전 서울·경기 시세(이헌창, 『한국문화사』 8). 1426년 한 해의 값은 아니다.
// 시중 동전 값: 1425년 4월 쌀 1되 = 3문, 1427년 1월 7~8문(국립중앙박물관·이헌창). 1426년은 그 사이로 보고 범위로 보여 준다.
// 1두(말) = 5.964L(세종 때, encykorea 「말」). 무게(약 0.8kg/L)는 우리 추정이다.

export type Unit = "pil" | "du" | "jang" | "mun";
export const UNITS: Unit[] = ["pil", "du", "jang", "mun"];

/** 쌀 1두 = 10되. 모든 값을 쌀 되(升)로 맞춘다. */
export const DOE_PER_DU = 10;
export const DU_PER_PIL = 5;
export const MUN_PER_DU_OFFICIAL = 40;
/** 시중: 쌀 1되에 동전 몇 문(1425년 4월 3문 ~ 1427년 1월 8문). */
export const MARKET_MUN_PER_DOE: [number, number] = [3, 8];
/** 시중: 저화 1장은 동전 1문과 바꿨다(1425년 4월). */
export const MARKET_MUN_PER_JANG = 1;
export const LITERS_PER_DU = 5.964;
export const KG_PER_LITER = 0.8;
export const KG_PER_DU = LITERS_PER_DU * KG_PER_LITER;
/** 석(섬) = 15두로 가정(20두 설도 있어 미확인). */
export const DU_PER_SEOK = 15;

/** 1 unit, in 쌀 되 — official regime. */
export const officialDoe = (u: Unit): number => ({ pil: DU_PER_PIL * DOE_PER_DU, du: DOE_PER_DU, jang: DOE_PER_DU, mun: DOE_PER_DU / MUN_PER_DU_OFFICIAL })[u];

/** 1 unit, in 쌀 되 — market regime, [low, high]. */
export function marketDoe(u: Unit): [number, number] {
  const [lo, hi] = MARKET_MUN_PER_DOE;
  if (u === "mun") return [1 / hi, 1 / lo];
  if (u === "jang") return [MARKET_MUN_PER_JANG / hi, MARKET_MUN_PER_JANG / lo];
  return [officialDoe(u), officialDoe(u)];
}

/** Convert amount of `from` into `to` (official). */
export const convertOfficial = (n: number, from: Unit, to: Unit) => (n * officialDoe(from)) / officialDoe(to);

/** Convert amount of `from` into `to` (market), as [low, high]. */
export function convertMarket(n: number, from: Unit, to: Unit): [number, number] {
  const [fl, fh] = marketDoe(from);
  const [tl, th] = marketDoe(to);
  const a = (n * fl) / th;
  const b = (n * fh) / tl;
  return a <= b ? [a, b] : [b, a];
}

/** Modern won for an amount of rice in 되, at a rice price per kg. */
export const wonOfDoe = (doe: number, ricePerKg: number) => (doe / DOE_PER_DU) * KG_PER_DU * ricePerKg;
/** Rice in 되 that a won amount buys. */
export const doeOfWon = (won: number, ricePerKg: number) => (won / (KG_PER_DU * ricePerKg)) * DOE_PER_DU;

/** 『세종실록』 8년(1426)에 나오는 면포 값. m/d = 음력, seq = 그날 몇 번째 기사. */
export type Anchor = { id: string; m: number; d: number; seq: number; pil: number; text: string };
export const ANCHORS: Anchor[] = [
  { id: "horseSmall", m: 1, d: 7, seq: 2, pil: 6, text: "小馬…下等六匹" },
  { id: "horseBig", m: 1, d: 7, seq: 2, pil: 45, text: "大馬，上等緜布四十五匹" },
  { id: "wedding", m: 9, d: 22, seq: 2, pil: 2, text: "緜布、正布各二匹，令娶妻" },
  { id: "embezzle", m: 7, d: 1, seq: 5, pil: 21, text: "私用營中糙米四石及綿布二十一匹" },
  { id: "bowl", m: 12, d: 6, seq: 2, pil: 100, text: "有能捕告者，賞緜布百匹" },
  { id: "arson", m: 2, d: 25, seq: 2, pil: 200, text: "放火人有能捕告者…皆給綿布二百匹" },
];

/** 『경국대전』 녹봉(곡물만), 석. 1426년과 같은지는 미확인. */
export const SALARY_SEOK = { top: 97, bottom: 12 } as const;
/** 곡물 녹봉을 한 달 쌀 되로(석 = 15두 가정). */
export const salaryDoePerMonth = (seok: number) => (seok * DU_PER_SEOK * DOE_PER_DU) / 12;

/** Round for display: 3 significant digits under 100, else whole numbers. */
export function nice(n: number): number {
  if (!Number.isFinite(n) || n === 0) return 0;
  if (Math.abs(n) >= 100) return Math.round(n);
  return Number(n.toPrecision(3));
}

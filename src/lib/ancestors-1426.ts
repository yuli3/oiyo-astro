/**
 * "600년 전 내 조상은 몇 명?" — pedigree collapse back to 1426.
 *
 * Everything here is a simple random-mating model, labelled as such on the page:
 * - slots: 2^g places in a family tree g generations up.
 * - distinct ancestors: A_k = N_k · (1 − e^(−2·A_{k−1} / N_k)), i.e. 2·A_{k−1} parent slots filled at random
 *   from a generation of N_k people (expected number of distinct people hit).
 * - descent share: a person with c children in 1426 → f = c / N, then f ← 1 − (1 − f)² each generation
 *   (each person has two parents, each a descendant with probability f).
 * - common ancestors (Chang 1999): most recent common ancestor ≈ log2 N generations back,
 *   identical ancestors point ≈ 1.77 · log2 N.
 * Populations are rounded historical estimates (sources on the page).
 */

export const BASE_YEAR = 1426;
export const REGIONS = ["joseon", "japan", "ming", "england", "france", "spain"] as const;
export type Region = (typeof REGIONS)[number];

/** Population around 1426 (rounded estimate) and today (rounded). */
export const POP: Record<Region, { then: number; now: number }> = {
  joseon: { then: 5_500_000, now: 51_000_000 }, // 김재호(한국경제 2014): 건국 초 약 550만; 대한민국 약 5,100만
  japan: { then: 10_000_000, now: 124_000_000 }, // Farris 2006: 1450 9.6–10.5M
  ming: { then: 81_000_000, now: 1_410_000_000 }, // modern estimate for 1400 (Population history of China)
  england: { then: 2_020_000, now: 57_000_000 }, // Broadberry et al.: 1430 2.02M
  france: { then: 10_000_000, now: 68_000_000 }, // Larousse: « une dizaine de millions » mid-15th c.
  spain: { then: 5_000_000, now: 48_000_000 }, // Castilla >4M + Aragón >0.8M, late 15th c.
};

/** Children of the famous 1426 person used for the "descendant of …" panel, where we have one. */
export const FAMOUS: Partial<Record<Region, { children: number }>> = {
  joseon: { children: 22 }, // 세종: 18남 4녀 (왕실 족보 기준)
};
export const ORDINARY_CHILDREN = 3;

export const GEN_YEARS = [25, 28, 31] as const;
export type GenYears = (typeof GEN_YEARS)[number];
/** How far back the "1,000 years ago" panel and the chart go. */
export const FAR_YEARS = 1000;
export const farGenerations = (genYears: number) => Math.round(FAR_YEARS / genYears);

export function generationsBack(birthYear: number, genYears: number): number {
  return Math.max(1, Math.round((birthYear - BASE_YEAR) / genYears));
}

export const slots = (g: number) => 2 ** g;

/** Population of the generation k steps back, geometric between today (k=0) and 1426 (k=g); flat before 1426. */
export function popAt(k: number, g: number, region: Region): number {
  const { then, now } = POP[region];
  if (k >= g) return then;
  return Math.round(now ** (1 - k / g) * then ** (k / g));
}

/** Expected distinct ancestors for k = 0..g+extra (index 0 = you). */
export function distinctAncestors(g: number, region: Region, upTo = g): number[] {
  const out = [1];
  for (let k = 1; k <= Math.max(g, upTo); k += 1) {
    const n = popAt(k, g, region);
    out.push(n * (1 - Math.exp((-2 * out[k - 1]) / n)));
  }
  return out;
}

/** Model chance that a 1426 person with `children` children (line unbroken) is your ancestor, g generations up. */
export function descentShare(children: number, g: number, region: Region): number {
  let f = Math.min(1, children / POP[region].then);
  for (let i = 1; i < g; i += 1) f = 1 - (1 - f) ** 2;
  return f;
}

export const mrcaGenerations = (n: number) => Math.log2(n);
export const iapGenerations = (n: number) => 1.77 * Math.log2(n);

export interface AncestorQuery {
  year: number;
  gen: GenYears;
  region: Region;
}

export function formatAncestors(q: AncestorQuery): string {
  return `y=${q.year}&g=${q.gen}&r=${q.region}`;
}

export function parseAncestors(search: string): AncestorQuery | null {
  const p = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const year = Number(p.get("y"));
  const gen = Number(p.get("g"));
  const region = p.get("r") as Region | null;
  const thisYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1900 || year > thisYear) return null;
  if (!(GEN_YEARS as readonly number[]).includes(gen)) return null;
  if (!region || !(REGIONS as readonly string[]).includes(region)) return null;
  return { year, gen: gen as GenYears, region };
}

/** The rounded summary the page and card show. */
export function summary(q: AncestorQuery) {
  const g = generationsBack(q.year, q.gen);
  const far = farGenerations(q.gen);
  const curve = distinctAncestors(g, q.region, far);
  const distinct = Math.round(curve[g]);
  const then = POP[q.region].then;
  return {
    g,
    slots: slots(g),
    distinct,
    overlap: slots(g) / distinct,
    shareOfThen: distinct / then,
    curve,
    far,
    farSlots: slots(far),
    farDistinct: Math.round(curve[far]),
    famous: FAMOUS[q.region] ? descentShare(FAMOUS[q.region]!.children, g, q.region) : null,
    ordinary: descentShare(ORDINARY_CHILDREN, g, q.region),
    mrcaYear: Math.round(new Date().getFullYear() - mrcaGenerations(then) * q.gen),
    iapYear: Math.round(new Date().getFullYear() - iapGenerations(then) * q.gen),
  };
}

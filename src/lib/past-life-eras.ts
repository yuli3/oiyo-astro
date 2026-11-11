// Time-slip series episodes beyond 1426 (2026-11-03, CHOSEUN picked 신라 골품 + 프랑스 1789).
// Sources and interpretation: company-brain projects/oiyo-ecosystem/timeslip-silla-france1789-research-2026-11-03.md
import { oneIn, weightedPick } from "./past-life-1426";

// ── Silla bone-rank (골품) ──────────────────────────────────────────────────

/** 경위 17관등, rank 1 is highest (한국민족문화대백과사전 「경위」). */
export const SILLA_RANKS = [
  { ko: "이벌찬", hanja: "伊伐飡" },
  { ko: "이찬", hanja: "伊飡" },
  { ko: "잡찬", hanja: "迊湌" },
  { ko: "파진찬", hanja: "波珍飡" },
  { ko: "대아찬", hanja: "大阿飡" },
  { ko: "아찬", hanja: "阿飡" },
  { ko: "일길찬", hanja: "一吉飡" },
  { ko: "사찬", hanja: "沙飡" },
  { ko: "급찬", hanja: "級飡" },
  { ko: "대나마", hanja: "大奈麻" },
  { ko: "나마", hanja: "奈麻" },
  { ko: "대사", hanja: "大舍" },
  { ko: "사지", hanja: "舍知" },
  { ko: "길사", hanja: "吉士" },
  { ko: "대오", hanja: "大烏" },
  { ko: "소오", hanja: "小烏" },
  { ko: "조위", hanja: "造位" },
] as const;

export type Golpum = "jingol" | "yuk" | "o" | "sa" | "pyeongmin";
export const GOLPUMS: readonly Golpum[] = ["jingol", "yuk", "o", "sa", "pyeongmin"];

/** Highest rank each bone-rank could reach (한국민족문화대백과사전 「골품제도」). 평민 held no capital rank. */
export const GOLPUM_CAP: Record<Golpum, number | null> = { jingol: 1, yuk: 6, o: 10, sa: 12, pyeongmin: null };

/**
 * No population counts exist for the bone-ranks, so these weights are authored for play
 * and the page says so. Kept rough: elites rare, commoners common.
 */
export const GOLPUM_WEIGHT: Record<Golpum, number> = { jingol: 5, yuk: 10, o: 15, sa: 20, pyeongmin: 30 };
const GOLPUM_TOTAL = GOLPUMS.reduce((s, g) => s + GOLPUM_WEIGHT[g], 0);

export type SillaRobe = "purple" | "crimson" | "blue" | "yellow";
/** 공복: 대아찬 이상 자색, 급찬 이상 비색, 나마 이상 청색, 조위 이상 황색. */
export function sillaRobe(rank: number): SillaRobe {
  if (rank <= 5) return "purple";
  if (rank <= 9) return "crimson";
  if (rank <= 11) return "blue";
  return "yellow";
}

export interface SillaLife {
  golpum: Golpum;
  /** Rank your talent alone would reach (1–17, uniform). */
  dream: number;
  /** Rank actually reached after the bone-rank ceiling; null for commoners. */
  rank: number | null;
  /** Ranks lost to the ceiling (0 when none). */
  wall: number;
}

export function sillaLife(golpum: Golpum, dream: number): SillaLife {
  const cap = GOLPUM_CAP[golpum];
  if (cap === null) return { golpum, dream, rank: null, wall: 0 };
  const rank = Math.max(dream, cap);
  return { golpum, dream, rank, wall: rank - dream };
}

export function drawSilla(random: () => number = Math.random): SillaLife {
  const golpum = weightedPick(GOLPUMS, (g) => GOLPUM_WEIGHT[g], random);
  const dream = 1 + Math.min(16, Math.floor(random() * 17));
  return sillaLife(golpum, dream);
}

/** Probability of this exact bone-rank + reached rank under the draw above. */
export function sillaShare(life: SillaLife): number {
  const pg = GOLPUM_WEIGHT[life.golpum] / GOLPUM_TOTAL;
  const cap = GOLPUM_CAP[life.golpum];
  if (cap === null || life.rank === null) return pg;
  const dreamsHere = life.rank === cap ? cap : 1;
  return pg * (dreamsHere / 17);
}
export const sillaOneIn = (life: SillaLife) => oneIn(sillaShare(life));

export function formatSilla(life: SillaLife): string {
  return `g=${life.golpum}&d=${life.dream}`;
}
export function parseSilla(search: string): SillaLife | null {
  const q = new URLSearchParams(search);
  const g = q.get("g") as Golpum | null;
  const d = Number(q.get("d"));
  if (!g || !GOLPUMS.includes(g) || !Number.isInteger(d) || d < 1 || d > 17) return null;
  return sillaLife(g, d);
}

/** "me" when my reached rank is higher. Commoners rank below every rank-holder. */
export function compareSilla(mine: SillaLife, friend: SillaLife): "me" | "friend" | "same" {
  const a = mine.rank ?? 99;
  const b = friend.rank ?? 99;
  return a < b ? "me" : a > b ? "friend" : "same";
}

// ── France 1789 ───────────────────────────────────────────────────────────────

export type FrGroup = "clergy" | "nobility" | "bourgeoisie" | "peasants" | "urban";
export const FR_GROUPS: readonly FrGroup[] = ["clergy", "nobility", "bourgeoisie", "peasants", "urban"];

/**
 * People c. 1789 (Georges Lefebvre via World History Encyclopedia): ~27M total, clergy ≤100k,
 * nobility ~400k, bourgeoisie ~2M, peasants ~80% of the total. "urban" is the computed remainder.
 */
export const FR_PEOPLE: Record<FrGroup, number> = {
  clergy: 100_000,
  nobility: 400_000,
  bourgeoisie: 2_000_000,
  peasants: 21_600_000,
  urban: 2_900_000,
};
export const FR_TOTAL = FR_GROUPS.reduce((s, g) => s + FR_PEOPLE[g], 0);
export const frEstate = (g: FrGroup): 1 | 2 | 3 => (g === "clergy" ? 1 : g === "nobility" ? 2 : 3);

/** Deputies elected to the Estates-General of 1789: 302 clergy, 289 nobility, 611 Third Estate. */
export const FR_DEPUTIES: Record<1 | 2 | 3, number> = { 1: 302, 2: 289, 3: 611 };
const THIRD_PEOPLE = FR_PEOPLE.bourgeoisie + FR_PEOPLE.peasants + FR_PEOPLE.urban;
/** Chance someone in this group was one of the deputies (same rate across the Third Estate). */
export function deputyChance(g: FrGroup): number {
  const e = frEstate(g);
  return FR_DEPUTIES[e] / (e === 3 ? THIRD_PEOPLE : FR_PEOPLE[g]);
}

export interface FrLife {
  group: FrGroup;
  deputy: boolean;
}
export function drawFrance(random: () => number = Math.random): FrLife {
  const group = weightedPick(FR_GROUPS, (g) => FR_PEOPLE[g], random);
  return { group, deputy: random() < deputyChance(group) };
}
export const frShare = (life: FrLife) => (FR_PEOPLE[life.group] / FR_TOTAL) * (life.deputy ? deputyChance(life.group) : 1);
export const frOneIn = (life: FrLife) => oneIn(frShare(life));

export function formatFrance(life: FrLife): string {
  return `f=${life.group}&v=${life.deputy ? 1 : 0}`;
}
export function parseFrance(search: string): FrLife | null {
  const q = new URLSearchParams(search);
  const g = q.get("f") as FrGroup | null;
  if (!g || !FR_GROUPS.includes(g)) return null;
  return { group: g, deputy: q.get("v") === "1" };
}
/** Estate order (First > Second > Third), then deputy beats non-deputy. */
export function compareFrance(mine: FrLife, friend: FrLife): "me" | "friend" | "same" {
  const score = (x: FrLife) => frEstate(x.group) * 2 - (x.deputy ? 1 : 0);
  const a = score(mine);
  const b = score(friend);
  return a < b ? "me" : a > b ? "friend" : "same";
}

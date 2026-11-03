import {
  JOSEON_PROVINCES,
  type JoseonProvince,
  type Robe,
  JOSEON_GROUP_VECTORS,
  JOSEON_POSTS,
  REALMS_1426,
  REALM_KIND_VECTORS,
  US_REGION_VECTORS,
  US_STATES,
  type Axis,
  type JoseonPost,
  type Realm,
  type UsState,
  type Vector,
} from "../data/past-life-1426";
import { factionLensVector, type JoseonFaction } from "./ontology/joseon-lenses";

export const PAST_LIFE_YEAR = 1426;
export const AXES: readonly Axis[] = ["principle", "tradition", "action"];

export interface PastLife {
  post: JoseonPost;
  realm: Realm;
  state: UsState;
}

export const JOSEON_SEAT_TOTAL = JOSEON_POSTS.reduce((sum, p) => sum + p.seats, 0);
export const US_BIRTH_TOTAL = US_STATES.reduce((sum, st) => sum + st.births, 0);

export function weightedPick<T>(items: readonly T[], weight: (item: T) => number, random: () => number = Math.random): T {
  const total = items.reduce((sum, item) => sum + Math.max(0, weight(item)), 0);
  let ticket = random() * total;
  for (const item of items) {
    const w = Math.max(0, weight(item));
    if (w <= 0) continue;
    ticket -= w;
    if (ticket < 0) return item;
  }
  return items[items.length - 1];
}

/** Random mode: seats (Joseon), one throne per realm (Europe), births by state (US). */
export function drawPastLife(random: () => number = Math.random): PastLife {
  return {
    post: weightedPick(JOSEON_POSTS, (p) => p.seats, random),
    realm: weightedPick(REALMS_1426, () => 1, random),
    state: weightedPick(US_STATES, (st) => st.births, random),
  };
}

export const postShare = (post: JoseonPost) => post.seats / JOSEON_SEAT_TOTAL;
export const realmShare = () => 1 / REALMS_1426.length;
export const stateShare = (state: UsState) => state.births / US_BIRTH_TOTAL;

/** "1 in N" for a share, rounded to a friendly integer. */
export function oneIn(share: number): number {
  return share > 0 ? Math.max(1, Math.round(1 / share)) : 0;
}

// ── Trait mode ──────────────────────────────────────────────────────────────

export type QuickAnswer = -1 | 1;
export type QuickAnswers = Record<Axis, QuickAnswer>;

export function quickVector(answers: QuickAnswers): Vector {
  return { principle: answers.principle * 0.8, tradition: answers.tradition * 0.8, action: answers.action * 0.8 };
}

/**
 * MBTI letters to the three game axes (authored 2026-11-02, not a validated mapping):
 * J/P → principle, S/N → tradition, E/I → action.
 */
export function mbtiVector(type: string): Vector | null {
  const t = type.trim().toUpperCase();
  if (!/^[EI][SN][TF][JP]$/.test(t)) return null;
  return {
    principle: t[3] === "J" ? 0.6 : -0.6,
    tradition: t[1] === "S" ? 0.6 : -0.6,
    action: t[0] === "E" ? 0.6 : -0.6,
  };
}

const FACTIONS: readonly JoseonFaction[] = ["dongin", "seoin", "namin", "bukin", "noron", "soron"];
export function factionVector(faction: string): Vector | null {
  return (FACTIONS as readonly string[]).includes(faction) ? factionLensVector(faction as JoseonFaction) : null;
}

function distance(a: Vector, b: Vector): number {
  return AXES.reduce((sum, axis) => sum + (a[axis] - b[axis]) ** 2, 0);
}

export function nearest<K extends string>(vector: Vector, table: Record<K, Vector>): K {
  const keys = Object.keys(table) as K[];
  let best = keys[0];
  for (const key of keys) if (distance(vector, table[key]) < distance(vector, table[best])) best = key;
  return best;
}

// Deterministic draw inside the matched group so the same answers give the same result.
function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function seededRandom(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function matchPastLife(vector: Vector, seed = ""): PastLife {
  const random = seededRandom(`${seed}|${AXES.map((a) => vector[a].toFixed(3)).join(",")}`);
  const group = nearest(vector, JOSEON_GROUP_VECTORS);
  const kind = nearest(vector, REALM_KIND_VECTORS);
  const region = nearest(vector, US_REGION_VECTORS);
  return {
    post: weightedPick(JOSEON_POSTS.filter((p) => p.group === group), (p) => p.seats, random),
    realm: weightedPick(REALMS_1426.filter((r) => r.kind === kind), () => 1, random),
    state: weightedPick(US_STATES.filter((st) => st.region === region), (st) => st.births, random),
  };
}

// ── Share link: ?j=<post>&e=<realm>&u=<state> ───────────────────────────────

export function formatShare(life: PastLife): string {
  return `j=${life.post.id}&e=${life.realm.id}&u=${life.state.code}`;
}

export function parseShare(search: string): PastLife | null {
  const params = new URLSearchParams(search);
  const post = JOSEON_POSTS.find((p) => p.id === params.get("j"));
  const realm = REALMS_1426.find((r) => r.id === params.get("e"));
  const state = US_STATES.find((st) => st.code === (params.get("u") ?? "").toUpperCase());
  return post && realm && state ? { post, realm, state } : null;
}

// ── Joseon extras ────────────────────────────────────────────────────────────

export const PROVINCE_PEOPLE_TOTAL = JOSEON_PROVINCES.reduce((sum, p) => sum + p.people, 0);
export const provinceShare = (p: JoseonProvince) => p.people / PROVINCE_PEOPLE_TOTAL;
export function drawProvince(random: () => number = Math.random): JoseonProvince {
  return weightedPick(JOSEON_PROVINCES, (p) => p.people, random);
}

/** Grade number 1–9 and whether it is senior (정) from a rank like "정3품 당상" or "종2품~종6품". */
export function parseRank(rank: string): { grade: number; senior: boolean } | null {
  const m = /^(정|종)(\d)품/.exec(rank);
  return m ? { grade: Number(m[2]), senior: m[1] === "정" } : null;
}

export function robeFor(rank: string): Robe | null {
  const r = parseRank(rank);
  if (!r) return null;
  if (r.grade <= 2 || (r.grade === 3 && r.senior)) return "red";
  if (r.grade <= 6) return "blue";
  return "green";
}

export function tabletFor(rank: string): "ivory" | "wood" | null {
  const r = parseRank(rank);
  return r ? (r.grade <= 4 ? "ivory" : "wood") : null;
}

// ── Time-slip series quick wins (2026-11-03, company-brain past-life-series-design-2026-11-03.md) ──

export type EpisodeId = "joseon-1426" | "europe-1426" | "us-birth-state";
export const EPISODES: readonly EpisodeId[] = ["joseon-1426", "europe-1426", "us-birth-state"];

export type Rarity = "legendary" | "rare" | "uncommon" | "common";
/**
 * Badge tier from "1 in N". Cut-offs are authored for play, chosen so that
 * Joseon's one-seat posts (1 in 551) are legendary, a 1-in-30 throne is uncommon
 * and the biggest US states (about 1 in 8) are common.
 */
export function rarityTier(n: number): Rarity {
  if (n >= 300) return "legendary";
  if (n >= 60) return "rare";
  if (n >= 15) return "uncommon";
  return "common";
}

/** Valid YYYY-MM-DD birthday between 1900-01-01 and today. */
export function isValidBirthday(value: string, today: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return false;
  return value >= "1900-01-01" && d.getTime() <= today.getTime();
}

/** Same birthday, same episode → same result, on any visit. */
export function birthdayRandom(episode: EpisodeId, birthday: string): () => number {
  return seededRandom(`${episode}|birthday|${birthday}`);
}

/** Lower is higher: 정1품 = 1, 종1품 = 2 … 종9품 = 18. null when the rank has no grade. */
export function rankOrder(rank: string): number | null {
  const r = parseRank(rank);
  return r ? r.grade * 2 - (r.senior ? 1 : 0) : null;
}

/** "me" when my post outranks the friend's, "friend" when theirs does, "same" when equal, null when unknown. */
export function compareRank(mine: string, friend: string): "me" | "friend" | "same" | null {
  const a = rankOrder(mine);
  const b = rankOrder(friend);
  if (a === null || b === null) return null;
  return a < b ? "me" : a > b ? "friend" : "same";
}

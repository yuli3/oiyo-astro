import type { CompatibilityLensId } from "./types";

/**
 * Deterministic orbit layout for the multi-person compatibility scene.
 *
 * Every value derives from birth-data-derived harmony indices plus a seed
 * hashed from participant ids, so the same group always renders the same
 * system. No Math.random anywhere.
 */

export interface OrbitBody {
  /** Participant id. */
  id: string;
  label: string;
  /** Orbit radius in scene units — smaller means higher harmony. */
  radius: number;
  /** Orbital plane tilt around X, radians. */
  inclinationX: number;
  /** Orbital plane tilt around Z, radians. */
  inclinationZ: number;
  /** Starting angle, radians. */
  phase: number;
  /** Angular velocity multiplier (harmony-weighted). */
  speed: number;
  /** Body radius in scene units. */
  size: number;
  /** 0-1, drives emissive intensity / brightness. */
  glow: number;
  /** CSS hex color, hue derived deterministically from the id. */
  color: string;
}

export interface OrbitLayout {
  mode: "pair" | "system";
  bodies: OrbitBody[];
  /** For pair mode only: mean harmony of the two people, 0-100. */
  pairHarmony: number;
}

const MIN_RADIUS = 2.4;
const MAX_RADIUS = 6.2;

/** FNV-1a over a UTF-8 string, returns unsigned 32-bit. */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — deterministic given a seed. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface LayoutInput {
  id: string;
  label: string;
  /** 0-100 harmony with the center person. */
  score: number;
}

function bodyColor(id: string, glow: number): string {
  const hue = (hashSeed(id) % 360 + 60) % 360;
  return hslToHex(hue, 0.55 + glow * 0.35, 0.42 + glow * 0.18);
}

/** Multi-person (3+) system: each person orbits the center person. */
export function buildSystemLayout(
  centerId: string,
  entries: LayoutInput[],
): OrbitLayout {
  const sorted = [...entries].sort((a, b) => (a.id < b.id ? -1 : 1));
  const random = seededRandom(hashSeed(sorted.map(({ id }) => id).join("|")));
  const bodies: OrbitBody[] = [];
  for (const entry of sorted) {
    const score = Math.max(0, Math.min(100, entry.score));
    const glow = score / 100;
    const angleSlot = random();
    bodies.push({
      id: entry.id,
      label: entry.label,
      // closer = better harmony
      radius: MIN_RADIUS + (1 - glow) * (MAX_RADIUS - MIN_RADIUS),
      inclinationX: (random() - 0.5) * 0.9,
      inclinationZ: (random() - 0.5) * 0.9,
      phase: angleSlot * Math.PI * 2,
      speed: 0.12 + glow * 0.3,
      size: 0.24 + glow * 0.24,
      glow,
      color: bodyColor(entry.id, glow),
    });
  }
  return { mode: "system", bodies, pairHarmony: 0 };
}

/**
 * Pair mode: two bodies share one orbit sized by their mean harmony,
 * positioned on opposite sides so an energy arc can connect them.
 */
export function buildPairLayout(
  left: LayoutInput,
  right: LayoutInput,
): OrbitLayout {
  const pairHarmony = Math.max(0, Math.min(100, (left.score + right.score) / 2));
  const glow = pairHarmony / 100;
  const random = seededRandom(hashSeed(`${[left.id, right.id].sort().join("|")}`));
  const radius = MIN_RADIUS + (1 - glow) * (MAX_RADIUS - MIN_RADIUS);
  const inclinationX = (random() - 0.5) * 0.5;
  const inclinationZ = (random() - 0.5) * 0.5;
  const phase = random() * Math.PI * 2;
  const make = (entry: LayoutInput, offset: number): OrbitBody => ({
    id: entry.id,
    label: entry.label,
    radius,
    inclinationX,
    inclinationZ,
    phase: phase + offset,
    speed: 0.08 + glow * 0.14,
    size: 0.34 + glow * 0.2,
    glow: entry.score / 100,
    color: bodyColor(entry.id, entry.score / 100),
  });
  return {
    mode: "pair",
    bodies: [make(left, 0), make(right, Math.PI)],
    pairHarmony,
  };
}

/** Mean harmonyIndex for one person against the center, for a given lens. */
export function scoreAgainstCenter(
  edges: Array<{ from: string; to: string; lens: CompatibilityLensId; harmonyIndex: number }>,
  centerId: string,
  personId: string,
  lens: CompatibilityLensId,
): number {
  const hits = edges.filter(
    (edge) => edge.lens === lens
      && ((edge.from === centerId && edge.to === personId) || (edge.to === centerId && edge.from === personId)),
  );
  if (!hits.length) return 50;
  return hits.reduce((sum, edge) => sum + edge.harmonyIndex, 0) / hits.length;
}

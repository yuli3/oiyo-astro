import LZString from "lz-string";

import { compareSymbolicProfiles } from "./index";
import type { CompatibilityLensId, SymbolicComparisonProfile } from "./types";

export const SYMBOLIC_GROUP_SCHEMA_VERSION = 1 as const;
/**
 * 2026-09-04: 3 → 2. 2인 전용이던 탐색 페이지(profile/symbolic-compatibility)를
 * 걷어내고 이 원 하나로 2인 이상을 모두 받는다. 쌍 순회는 원래 n≥2 에서
 * 동작했고, 하한 3 은 UI 분기를 위한 제약이었지 계산의 요구가 아니었다.
 */
export const SYMBOLIC_GROUP_MIN_PARTICIPANTS = 2;
export const SYMBOLIC_GROUP_MAX_PARTICIPANTS = 10;

export interface SymbolicGroupParticipant {
  id: string;
  label: string;
  profile: SymbolicComparisonProfile;
}

export interface SymbolicGroupEdge {
  from: string;
  /** 0-100, from the lens. Drives line weight; see SymbolicCompatibilityLens. */
  harmonyIndex: number;
  lens: CompatibilityLensId;
  relation: string;
  to: string;
}

export interface SymbolicGroupSnapshot {
  centerId: string;
  createdAt: string;
  edges: SymbolicGroupEdge[];
  expiresAt: string;
  participants: SymbolicGroupParticipant[];
  schema: "oiyo.symbolic-group-snapshot";
  schemaVersion: typeof SYMBOLIC_GROUP_SCHEMA_VERSION;
}

const LENSES: CompatibilityLensId[] = ["five-elements", "yin-yang", "chinese-zodiac", "sun-sign"];
const ID = /^[a-z0-9-]{1,24}$/;

function validProfile(profile: SymbolicComparisonProfile): boolean {
  return typeof profile?.chineseZodiac?.branch === "string"
    && typeof profile?.fiveElements?.dominant === "string"
    && (profile.fiveElements.observedCoordinates === 6 || profile.fiveElements.observedCoordinates === 8)
    && typeof profile?.sunSign?.sign === "string"
    && Number.isInteger(profile?.yinYang?.yin)
    && Number.isInteger(profile?.yinYang?.yang);
}

export function createSymbolicGroupSnapshot(
  participants: SymbolicGroupParticipant[],
  options: { centerId?: string; now?: Date; ttlDays?: number } = {},
): SymbolicGroupSnapshot {
  if (participants.length < SYMBOLIC_GROUP_MIN_PARTICIPANTS || participants.length > SYMBOLIC_GROUP_MAX_PARTICIPANTS) {
    throw new RangeError(
      `A group snapshot requires ${SYMBOLIC_GROUP_MIN_PARTICIPANTS} to ${SYMBOLIC_GROUP_MAX_PARTICIPANTS} participants`,
    );
  }
  const ids = new Set(participants.map(({ id }) => id));
  if (ids.size !== participants.length || participants.some(({ id, label, profile }) => !ID.test(id) || !label.trim() || label.length > 24 || !validProfile(profile))) {
    throw new TypeError("Invalid group participant");
  }
  const centerId = options.centerId ?? participants[0].id;
  if (!ids.has(centerId)) throw new TypeError("Group center must be a participant");
  const now = options.now ?? new Date();
  const ttlDays = options.ttlDays ?? 7;
  if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 30) throw new RangeError("Group snapshot TTL must be between 1 and 30 days");
  const edges: SymbolicGroupEdge[] = [];
  for (let left = 0; left < participants.length; left += 1) {
    for (let right = left + 1; right < participants.length; right += 1) {
      const report = compareSymbolicProfiles(participants[left].profile, participants[right].profile);
      for (const lens of report.lenses) edges.push({ from: participants[left].id, harmonyIndex: lens.harmonyIndex, lens: lens.id, relation: lens.relation, to: participants[right].id });
    }
  }
  return {
    centerId,
    createdAt: now.toISOString(),
    edges,
    expiresAt: new Date(now.getTime() + ttlDays * 86_400_000).toISOString(),
    participants: participants.map((participant) => ({ ...participant, label: participant.label.trim() })),
    schema: "oiyo.symbolic-group-snapshot",
    schemaVersion: SYMBOLIC_GROUP_SCHEMA_VERSION,
  };
}

export function starEdges(snapshot: SymbolicGroupSnapshot, lens: CompatibilityLensId): SymbolicGroupEdge[] {
  return snapshot.edges.filter((edge) => edge.lens === lens && (edge.from === snapshot.centerId || edge.to === snapshot.centerId));
}

export function allPairEdges(snapshot: SymbolicGroupSnapshot, lens: CompatibilityLensId): SymbolicGroupEdge[] {
  return snapshot.edges.filter((edge) => edge.lens === lens);
}

export function encodeSymbolicGroupSnapshot(snapshot: SymbolicGroupSnapshot): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(snapshot));
}

export function decodeSymbolicGroupSnapshot(encoded: string, now = new Date()): SymbolicGroupSnapshot | null {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(encoded);
    const value = JSON.parse(raw || "null") as SymbolicGroupSnapshot;
    if (value?.schema !== "oiyo.symbolic-group-snapshot" || value.schemaVersion !== 1 || Date.parse(value.expiresAt) <= now.getTime()) return null;
    const rebuilt = createSymbolicGroupSnapshot(value.participants, { centerId: value.centerId, now: new Date(value.createdAt), ttlDays: Math.round((Date.parse(value.expiresAt) - Date.parse(value.createdAt)) / 86_400_000) });
    return JSON.stringify(rebuilt.edges) === JSON.stringify(value.edges) ? value : null;
  } catch {
    return null;
  }
}

export function symbolicGroupFragment(snapshot: SymbolicGroupSnapshot): string {
  return `#group=${encodeSymbolicGroupSnapshot(snapshot)}`;
}

export { LENSES as SYMBOLIC_GROUP_LENSES };

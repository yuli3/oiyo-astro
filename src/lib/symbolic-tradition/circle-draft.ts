import {
  isSymbolicGroupParticipant,
  resolveGroupCenterId,
  type SymbolicGroupParticipant,
} from "./group-snapshot";

export const CIRCLE_DRAFT_STORAGE_KEY = "oiyo_circle_draft_v1";
const CIRCLE_DRAFT_SCHEMA_VERSION = 1 as const;
const CIRCLE_DRAFT_TTL_MS = 30 * 86_400_000;

type CircleDraftStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

interface StoredCircleDraft {
  centerId: string;
  expiresAt: string;
  participants: SymbolicGroupParticipant[];
  schema: "oiyo.circle-draft";
  schemaVersion: typeof CIRCLE_DRAFT_SCHEMA_VERSION;
}

export interface CircleDraft {
  centerId: string;
  participants: SymbolicGroupParticipant[];
}

function validDraft(value: unknown, now: Date): value is StoredCircleDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<StoredCircleDraft>;
  const expiresAt = typeof draft.expiresAt === "string" ? Date.parse(draft.expiresAt) : Number.NaN;
  if (
    draft.schema !== "oiyo.circle-draft"
    || draft.schemaVersion !== CIRCLE_DRAFT_SCHEMA_VERSION
    || typeof draft.centerId !== "string"
    || typeof draft.expiresAt !== "string"
    || !Array.isArray(draft.participants)
    || draft.participants.length > 10
    || !Number.isFinite(expiresAt)
    || expiresAt <= now.getTime()
    || draft.participants.some((participant) => !isSymbolicGroupParticipant(participant))
  ) return false;
  const ids = new Set(draft.participants.map(({ id }) => id));
  return ids.size === draft.participants.length
    && (!draft.centerId || ids.has(draft.centerId));
}

export function saveCircleDraft(
  storage: CircleDraftStorage,
  draft: CircleDraft,
  options: { now?: Date } = {},
): void {
  const now = options.now ?? new Date();
  if (
    draft.participants.length > 10
    || draft.participants.some((participant) => !isSymbolicGroupParticipant(participant))
  ) throw new TypeError("Invalid circle draft");
  const ids = new Set(draft.participants.map(({ id }) => id));
  if (ids.size !== draft.participants.length) throw new TypeError("Invalid circle draft");
  const centerId = resolveGroupCenterId(draft.participants, draft.centerId);
  storage.setItem(CIRCLE_DRAFT_STORAGE_KEY, JSON.stringify({
    centerId,
    expiresAt: new Date(now.getTime() + CIRCLE_DRAFT_TTL_MS).toISOString(),
    participants: draft.participants,
    schema: "oiyo.circle-draft",
    schemaVersion: CIRCLE_DRAFT_SCHEMA_VERSION,
  } satisfies StoredCircleDraft));
}

export function loadCircleDraft(
  storage: CircleDraftStorage,
  options: { now?: Date } = {},
): CircleDraft | null {
  const raw = storage.getItem(CIRCLE_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!validDraft(value, options.now ?? new Date())) {
      storage.removeItem(CIRCLE_DRAFT_STORAGE_KEY);
      return null;
    }
    return { centerId: value.centerId, participants: value.participants };
  } catch {
    storage.removeItem(CIRCLE_DRAFT_STORAGE_KEY);
    return null;
  }
}

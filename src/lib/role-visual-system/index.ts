export const ROLE_VISUAL_SCHEMA_VERSION = "oiyo.role-visual.v1" as const;

export const ROLE_VISUAL_TOKENS = Object.freeze({
  primary: "#1d4ed8",
  primarySoft: "#dbeafe",
  neutralText: "#0f172a",
  neutralMuted: "#475569",
  neutralSurface: "#ffffff",
  neutralSubtle: "#f8fafc",
  focusRing: "#1d4ed8",
} as const);

export type RoleVisualStatus = "uncertain" | "low-flat" | "tie" | "mixed" | "clear";
export type RoleVisualInteractionState = "idle" | "saved" | "shared";
export type RoleVisualActivationTrigger = "click" | "Enter" | "Space";
export type RoleVisualInteractionEvent =
  | { type: "activate"; target: Exclude<RoleVisualInteractionState, "idle">; trigger: RoleVisualActivationTrigger }
  | { type: "reset"; trigger: "scenario-change" };

export interface RoleVisualDimension {
  id: string;
  score: number;
  confidence: number;
}

export interface RoleVisualInput {
  dimensions: RoleVisualDimension[];
  dataCoverage: number;
}

export interface RoleVisualResult {
  schemaVersion: typeof ROLE_VISUAL_SCHEMA_VERSION;
  status: RoleVisualStatus;
  ranked: RoleVisualDimension[];
  topGap: number | null;
  spread: number | null;
  averageConfidence: number;
  dataCoverage: number;
  roleAid: { id: "neutral-pattern-01"; icon: "compass"; emoji: "🧭" } | null;
  explanationPriority: readonly ["scores", "status", "uncertainty", "role-aid"];
}

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

export function transitionRoleVisualInteraction(
  _state: RoleVisualInteractionState,
  event: RoleVisualInteractionEvent,
): RoleVisualInteractionState {
  if (event.type === "reset") return "idle";
  return event.target;
}

export function roleVisualLiveMessageKey(
  state: RoleVisualInteractionState,
): RoleVisualInteractionState {
  return state;
}

export function resolveRoleVisualLiveMessage(
  state: RoleVisualInteractionState,
  messages: Record<RoleVisualInteractionState, string>,
): string {
  return messages[roleVisualLiveMessageKey(state)];
}

export function classifyRoleVisual(input: RoleVisualInput): RoleVisualResult {
  const ranked = input.dimensions
    .map((dimension) => ({
      id: dimension.id,
      score: Math.round(clamp(dimension.score, 0, 100)),
      confidence: Math.round(clamp(dimension.confidence, 0, 1) * 100) / 100,
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const coverage = Math.round(clamp(input.dataCoverage, 0, 1) * 100) / 100;
  const averageConfidence = ranked.length
    ? Math.round((ranked.reduce((sum, dimension) => sum + dimension.confidence, 0) / ranked.length) * 100) / 100
    : 0;
  const topGap = ranked.length > 1 ? ranked[0].score - ranked[1].score : null;
  const spread = ranked.length > 1 ? ranked[0].score - ranked[ranked.length - 1].score : null;

  let status: RoleVisualStatus;
  if (ranked.length < 2 || coverage < 0.67 || averageConfidence < 0.65) {
    status = "uncertain";
  } else if ((spread ?? 0) <= 8 && ranked[0].score < 45) {
    status = "low-flat";
  } else if ((topGap ?? 0) <= 2) {
    status = "tie";
  } else if ((topGap ?? 0) <= 12 || (spread ?? 0) <= 8) {
    status = "mixed";
  } else {
    status = "clear";
  }

  return {
    schemaVersion: ROLE_VISUAL_SCHEMA_VERSION,
    status,
    ranked,
    topGap,
    spread,
    averageConfidence,
    dataCoverage: coverage,
    roleAid: status === "clear" ? { id: "neutral-pattern-01", icon: "compass", emoji: "🧭" } : null,
    explanationPriority: ["scores", "status", "uncertainty", "role-aid"],
  };
}

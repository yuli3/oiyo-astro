// oiyo.reflective-activity v1 — "삶의 역할 균형" (B3 Wave 0).
//
// A reflective activity, not an assessment: every value here is authored by
// the user (roles, attention shares, notes). The module validates and
// organizes; it never scores, never aggregates into traits, never infers
// anything from note text, and never implies crisis/depression screening.
// Storage-free and network-free — the caller owns the state. A public
// consumer (route/UI) stays behind the human gate.

export const REFLECTIVE_ACTIVITY_SCHEMA = "oiyo.reflective-activity" as const;
export const REFLECTIVE_ACTIVITY_SCHEMA_VERSION = 1 as const;
export const LIFE_ROLE_BALANCE_ACTIVITY_ID = "life-role-balance" as const;
export const LIFE_ROLE_BALANCE_MAX_ROLES = 12 as const;
export const LIFE_ROLE_BALANCE_MAX_LABEL_LENGTH = 40 as const;
export const LIFE_ROLE_BALANCE_MAX_NOTE_LENGTH = 500 as const;

// Framing this activity must never use (non-diagnostic, non-crisis boundary).
export const LIFE_ROLE_BALANCE_FORBIDDEN_FRAMING: readonly RegExp[] = [
  /우울(?:증|감\s*(?:진단|검사|측정))/,
  /진단/,
  /장애/,
  /위기\s*(?:판정|평가)/,
  /치료/,
  /정상\s*범위/,
  /점수/,
];

// Neutral starting points the user can freely edit, replace, or ignore.
export const LIFE_ROLE_SUGGESTIONS: readonly string[] = [
  "일·커리어",
  "가족",
  "친구·관계",
  "배움",
  "몸 돌보기",
  "쉼·취미",
];

export interface LifeRole {
  currentShare: number;
  desiredShare: number;
  id: string;
  label: string;
  note: string;
}

export interface LifeRoleBalanceState {
  activityId: typeof LIFE_ROLE_BALANCE_ACTIVITY_ID;
  roles: LifeRole[];
}

export interface LifeRoleGap {
  currentShare: number;
  desiredShare: number;
  gap: number;
  id: string;
  label: string;
}

export interface LifeRoleBalanceReflectionExport {
  activityId: typeof LIFE_ROLE_BALANCE_ACTIVITY_ID;
  completedAt: string;
  content: {
    aggregation: "none";
    inference: "none";
    roles: LifeRole[];
    userEditable: true;
  };
  privacy: { rawUserTextIncluded: true; serverTransmission: "none" };
  provenance: "user-authored-reflection";
  schema: typeof REFLECTIVE_ACTIVITY_SCHEMA;
  schemaVersion: typeof REFLECTIVE_ACTIVITY_SCHEMA_VERSION;
}

function normalizeShare(value: number, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${field}은 숫자여야 합니다`);
  if (value < 0 || value > 100) throw new RangeError(`${field}은 0~100 사이여야 합니다`);
  return Math.round(value);
}

function normalizeLabel(value: string): string {
  const label = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!label) throw new TypeError("역할 이름이 비었습니다");
  if (label.length > LIFE_ROLE_BALANCE_MAX_LABEL_LENGTH) throw new RangeError("역할 이름이 너무 깁니다");
  return label;
}

function normalizeNote(value: string): string {
  const note = String(value ?? "");
  if (note.length > LIFE_ROLE_BALANCE_MAX_NOTE_LENGTH) throw new RangeError("메모가 너무 깁니다");
  return note;
}

function normalizeRole(role: Partial<LifeRole> & { label: string }, existingId?: string): LifeRole {
  return {
    currentShare: normalizeShare(role.currentShare ?? 0, "현재 비중"),
    desiredShare: normalizeShare(role.desiredShare ?? 0, "바라는 비중"),
    id: existingId ?? (role.id ? String(role.id) : `role-${Math.random().toString(36).slice(2, 10)}`),
    label: normalizeLabel(role.label),
    note: normalizeNote(role.note ?? ""),
  };
}

function assertNoDuplicateLabel(roles: readonly LifeRole[], label: string, exceptId?: string): void {
  if (roles.some((role) => role.id !== exceptId && role.label === label)) {
    throw new Error(`같은 이름의 역할이 이미 있습니다: ${label}`);
  }
}

export function createLifeRoleBalance(withSuggestions = false): LifeRoleBalanceState {
  const roles = withSuggestions
    ? LIFE_ROLE_SUGGESTIONS.map((label, index) =>
        normalizeRole({ label }, `suggested-${index + 1}`),
      )
    : [];
  return { activityId: LIFE_ROLE_BALANCE_ACTIVITY_ID, roles };
}

export function addRole(state: LifeRoleBalanceState, role: Partial<LifeRole> & { label: string }): LifeRoleBalanceState {
  if (state.roles.length >= LIFE_ROLE_BALANCE_MAX_ROLES) throw new RangeError("역할은 최대 12개까지입니다");
  const next = normalizeRole(role);
  assertNoDuplicateLabel(state.roles, next.label);
  return { ...state, roles: [...state.roles, next] };
}

export function updateRole(state: LifeRoleBalanceState, id: string, patch: Partial<Omit<LifeRole, "id">>): LifeRoleBalanceState {
  const existing = state.roles.find((role) => role.id === id);
  if (!existing) throw new Error("역할을 찾을 수 없습니다");
  const next = normalizeRole({ ...existing, ...patch }, existing.id);
  assertNoDuplicateLabel(state.roles, next.label, existing.id);
  return { ...state, roles: state.roles.map((role) => (role.id === id ? next : role)) };
}

export function removeRole(state: LifeRoleBalanceState, id: string): LifeRoleBalanceState {
  if (!state.roles.some((role) => role.id === id)) throw new Error("역할을 찾을 수 없습니다");
  return { ...state, roles: state.roles.filter((role) => role.id !== id) };
}

// Arithmetic display aid only: the gap is the user's own desired minus current
// share. It is presented as a difference, never as a problem or a score.
export function roleGaps(state: LifeRoleBalanceState): LifeRoleGap[] {
  return state.roles.map((role) => ({
    currentShare: role.currentShare,
    desiredShare: role.desiredShare,
    gap: role.desiredShare - role.currentShare,
    id: role.id,
    label: role.label,
  }));
}

export function buildReflectionExport(
  state: LifeRoleBalanceState,
  completedAt = new Date().toISOString(),
): LifeRoleBalanceReflectionExport {
  if (state.activityId !== LIFE_ROLE_BALANCE_ACTIVITY_ID) throw new TypeError("알 수 없는 활동입니다");
  if (!state.roles.length) throw new RangeError("내보낼 역할이 없습니다");
  if (Number.isNaN(Date.parse(completedAt))) throw new TypeError("completedAt이 올바른 시각이 아닙니다");
  return {
    activityId: LIFE_ROLE_BALANCE_ACTIVITY_ID,
    completedAt,
    content: {
      aggregation: "none",
      inference: "none",
      roles: state.roles.map((role) => ({ ...role })),
      userEditable: true,
    },
    privacy: { rawUserTextIncluded: true, serverTransmission: "none" },
    provenance: "user-authored-reflection",
    schema: REFLECTIVE_ACTIVITY_SCHEMA,
    schemaVersion: REFLECTIVE_ACTIVITY_SCHEMA_VERSION,
  };
}

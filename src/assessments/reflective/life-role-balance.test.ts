import { describe, expect, it } from "vitest";
import {
  addRole,
  buildReflectionExport,
  createLifeRoleBalance,
  LIFE_ROLE_BALANCE_FORBIDDEN_FRAMING,
  LIFE_ROLE_BALANCE_MAX_ROLES,
  LIFE_ROLE_SUGGESTIONS,
  removeRole,
  roleGaps,
  sanitizeLifeRoleBalanceState,
  updateRole,
} from "./life-role-balance";

const FIXED_AT = "2026-07-17T00:00:00.000Z";

describe("life-role-balance reflective activity (B3 Wave 0)", () => {
  it("is fully user-editable: add, update, remove, and suggestions are only a starting point", () => {
    let state = createLifeRoleBalance(true);
    expect(state.roles.map((role) => role.label)).toEqual([...LIFE_ROLE_SUGGESTIONS]);

    state = updateRole(state, state.roles[0].id, { label: "부업 준비", currentShare: 30, desiredShare: 20, note: "저녁에만" });
    expect(state.roles[0]).toMatchObject({ label: "부업 준비", currentShare: 30, desiredShare: 20, note: "저녁에만" });

    const before = state.roles.length;
    state = removeRole(state, state.roles[1].id);
    expect(state.roles).toHaveLength(before - 1);

    state = addRole(state, { label: "지역 모임", currentShare: 5, desiredShare: 15 });
    expect(state.roles.at(-1)).toMatchObject({ label: "지역 모임", note: "" });
    expect(state.roles.at(-1)).not.toHaveProperty("gap");
  });

  it("validates user input without judging it", () => {
    let state = createLifeRoleBalance();
    state = addRole(state, { label: "  일 ·  커리어 ", currentShare: 50.4, desiredShare: 49.6 });
    expect(state.roles[0]).toMatchObject({ label: "일 · 커리어", currentShare: 50, desiredShare: 50 });

    expect(() => addRole(state, { label: "일 · 커리어" })).toThrow(/이미 있습니다/);
    expect(() => addRole(state, { label: "" })).toThrow(/비었습니다/);
    expect(() => addRole(state, { label: "쉼", currentShare: 120 })).toThrow(/0~100/);
    expect(() => addRole(state, { label: "쉼", currentShare: Number.NaN })).toThrow(/숫자/);
    expect(() => updateRole(state, "missing-id", { note: "x" })).toThrow(/찾을 수 없습니다/);

    let full = createLifeRoleBalance();
    for (let index = 0; index < LIFE_ROLE_BALANCE_MAX_ROLES; index += 1) {
      full = addRole(full, { label: `역할 ${index + 1}` });
    }
    expect(() => addRole(full, { label: "하나 더" })).toThrow(/최대 12개/);
  });

  it("computes gaps as plain differences and never aggregates into a score", () => {
    let state = createLifeRoleBalance();
    state = addRole(state, { label: "가족", currentShare: 20, desiredShare: 40 });
    state = addRole(state, { label: "일", currentShare: 70, desiredShare: 45 });
    const gaps = roleGaps(state);
    expect(gaps).toEqual([
      expect.objectContaining({ label: "가족", gap: 20 }),
      expect.objectContaining({ label: "일", gap: -25 }),
    ]);
    for (const gap of gaps) {
      expect(Object.keys(gap).sort()).toEqual(["currentShare", "desiredShare", "gap", "id", "label"]);
    }
  });

  it("exports with user-authored reflection provenance and no inference on note text", () => {
    let state = createLifeRoleBalance();
    state = addRole(state, {
      label: "자기 돌봄",
      currentShare: 10,
      desiredShare: 30,
      note: "요즘 많이 지치고 우울한 기분이 든다",
    });
    const exported = buildReflectionExport(state, FIXED_AT);
    expect(exported).toMatchObject({
      activityId: "life-role-balance",
      completedAt: FIXED_AT,
      provenance: "user-authored-reflection",
      schema: "oiyo.reflective-activity",
      schemaVersion: 1,
      content: { aggregation: "none", inference: "none", userEditable: true },
      privacy: { rawUserTextIncluded: true, serverTransmission: "none" },
    });
    // The user's own words pass through verbatim — no flags, labels, or
    // screening fields may be attached to them.
    expect(exported.content.roles[0].note).toBe("요즘 많이 지치고 우울한 기분이 든다");
    expect(JSON.stringify(exported)).not.toMatch(/flag|screening|risk|alert/i);
    expect(() => buildReflectionExport(createLifeRoleBalance(), FIXED_AT)).toThrow(/역할이 없습니다/);
    expect(() => buildReflectionExport(state, "not-a-date")).toThrow(/올바른 시각/);
  });

  it("내보내기 직전에 외부 변조 state를 재검증하고 정규화한다", () => {
    const valid = addRole(createLifeRoleBalance(), { label: "  가족  ", currentShare: 20, desiredShare: 30 });
    expect(sanitizeLifeRoleBalanceState(valid).roles[0].label).toBe("가족");

    expect(() => buildReflectionExport({ ...valid, roles: [{ ...valid.roles[0], currentShare: 101 }] }, FIXED_AT)).toThrow(/0~100/);
    expect(() => buildReflectionExport({ ...valid, roles: [{ ...valid.roles[0], id: " " }] }, FIXED_AT)).toThrow(/id가 비었습니다/);
    expect(() => buildReflectionExport({ ...valid, roles: [valid.roles[0], { ...valid.roles[0] }] }, FIXED_AT)).toThrow(/id가 중복/);
    expect(() => buildReflectionExport({ ...valid, roles: [valid.roles[0], { ...valid.roles[0], id: "other" }] }, FIXED_AT)).toThrow(/이름이 중복/);
    expect(() => buildReflectionExport({ ...valid, roles: Array.from({ length: 13 }, (_, i) => ({ ...valid.roles[0], id: `role-${i}`, label: `역할 ${i}` })) }, FIXED_AT)).toThrow(/최대 12개/);
  });

  it("keeps module copy inside the non-diagnostic, non-crisis boundary", () => {
    const surface = JSON.stringify({
      suggestions: LIFE_ROLE_SUGGESTIONS,
      sample: buildReflectionExport(addRole(createLifeRoleBalance(), { label: "가족" }), FIXED_AT),
    });
    for (const pattern of LIFE_ROLE_BALANCE_FORBIDDEN_FRAMING) {
      expect(surface).not.toMatch(pattern);
    }
  });
});

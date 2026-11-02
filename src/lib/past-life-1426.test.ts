import { describe, expect, it } from "vitest";
import { JOSEON_GROUP_VECTORS, JOSEON_POSTS, REALMS_1426, REALM_KIND_VECTORS, US_REGION_VECTORS, US_STATES } from "../data/past-life-1426";
import {
  JOSEON_SEAT_TOTAL,
  US_BIRTH_TOTAL,
  drawPastLife,
  factionVector,
  formatShare,
  matchPastLife,
  mbtiVector,
  oneIn,
  parseShare,
  postShare,
  quickVector,
  weightedPick,
} from "./past-life-1426";

describe("past-life-1426 data", () => {
  it("keeps the sourced totals", () => {
    // 경국대전 문관 외관직 8+4+4+20+44+82+34+141 = 337 수령, 의정부 12, 사헌부 30, 사간원 5, 승지 6.
    const magistrates = JOSEON_POSTS.filter((p) => p.group === "magistrate").reduce((s, p) => s + p.seats, 0);
    expect(magistrates).toBe(337);
    const council = JOSEON_POSTS.filter((p) => ["yeonguijeong", "jwauijeong", "uuijeong", "chanseong", "chamchan", "sain", "geomsang", "sarok"].includes(p.id));
    expect(council.reduce((s, p) => s + p.seats, 0)).toBe(12);
    expect(JOSEON_POSTS.filter((p) => ["daesaheon", "jibui", "jangnyeong", "jipyeong", "gamchal"].includes(p.id)).reduce((s, p) => s + p.seats, 0)).toBe(30);
    expect(JOSEON_POSTS.filter((p) => p.group === "secretariat").reduce((s, p) => s + p.seats, 0)).toBe(6);
    expect(US_STATES).toHaveLength(51);
    expect(US_BIRTH_TOTAL).toBe(3628934);
    expect(new Set(JOSEON_POSTS.map((p) => p.id)).size).toBe(JOSEON_POSTS.length);
    expect(new Set(REALMS_1426.map((r) => r.id)).size).toBe(REALMS_1426.length);
  });

  it("covers every trait group with at least one item", () => {
    for (const g of Object.keys(JOSEON_GROUP_VECTORS)) expect(JOSEON_POSTS.some((p) => p.group === g)).toBe(true);
    for (const k of Object.keys(REALM_KIND_VECTORS)) expect(REALMS_1426.some((r) => r.kind === k)).toBe(true);
    for (const r of Object.keys(US_REGION_VECTORS)) expect(US_STATES.some((st) => st.region === r)).toBe(true);
  });
});

describe("weighted draw", () => {
  it("maps the ticket onto cumulative weights", () => {
    const items = [{ id: "a", w: 1 }, { id: "b", w: 3 }];
    expect(weightedPick(items, (i) => i.w, () => 0).id).toBe("a");
    expect(weightedPick(items, (i) => i.w, () => 0.3).id).toBe("b");
    expect(weightedPick(items, (i) => i.w, () => 0.999).id).toBe("b");
  });

  it("draws the first and last rows at the edges", () => {
    expect(drawPastLife(() => 0).post.id).toBe(JOSEON_POSTS[0].id);
    expect(drawPastLife(() => 0.999999).state.code).toBe(US_STATES[US_STATES.length - 1].code);
  });

  it("states the odds", () => {
    const yeong = JOSEON_POSTS.find((p) => p.id === "yeonguijeong")!;
    expect(oneIn(postShare(yeong))).toBe(JOSEON_SEAT_TOTAL);
  });
});

describe("trait mode", () => {
  it("reads MBTI and faction results", () => {
    expect(mbtiVector("enfp")).toEqual({ principle: -0.6, tradition: -0.6, action: 0.6 });
    expect(mbtiVector("XXXX")).toBeNull();
    expect(factionVector("noron")).not.toBeNull();
    expect(factionVector("nope")).toBeNull();
  });

  it("is stable for the same answers and lands in the nearest group", () => {
    const v = quickVector({ principle: 1, tradition: -1, action: 1 });
    expect(matchPastLife(v)).toEqual(matchPastLife(v));
    const censor = matchPastLife({ principle: 1, tradition: 0.1, action: 0.6 });
    expect(censor.post.group).toBe("censor");
    const west = matchPastLife({ principle: -0.4, tradition: -0.9, action: 0.8 });
    expect(west.state.region).toBe("west");
  });
});

describe("share link", () => {
  it("round-trips", () => {
    const life = drawPastLife(() => 0.42);
    expect(parseShare(`?${formatShare(life)}`)).toEqual(life);
    expect(parseShare("?j=nope&e=england&u=CA")).toBeNull();
  });
});

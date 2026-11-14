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

import { JOSEON_PROVINCES } from "../data/past-life-1426";
import { PROVINCE_PEOPLE_TOTAL, drawProvince, robeFor, tabletFor } from "./past-life-1426";

describe("joseon extras", () => {
  it("sums the eight provinces from the Sejong Sillok gazetteer", () => {
    expect(JOSEON_PROVINCES).toHaveLength(8);
    expect(PROVINCE_PEOPLE_TOTAL).toBe(692477);
    expect(drawProvince(() => 0).id).toBe("gyeonggi");
  });
  it("maps rank to robe colour and tablet", () => {
    expect(robeFor("정1품")).toBe("red");
    expect(robeFor("정3품 당상")).toBe("red");
    expect(robeFor("종3품")).toBe("blue");
    expect(robeFor("정6품")).toBe("blue");
    expect(robeFor("정8품")).toBe("green");
    expect(robeFor("종2품~종6품")).toBe("red");
    expect(tabletFor("정4품")).toBe("ivory");
    expect(tabletFor("정5품")).toBe("wood");
  });
});

import { JOSEON_SEAT_TOTAL as SEATS, birthdayRandom, compareRank, isValidBirthday, rarityTier, stateShare } from "./past-life-1426";

describe("time-slip quick wins", () => {
  it("rarity tiers follow the authored cut-offs", () => {
    expect(rarityTier(oneIn(1 / SEATS))).toBe("legendary");
    expect(rarityTier(30)).toBe("uncommon");
    const biggest = US_STATES.reduce((a, b) => (a.births > b.births ? a : b));
    expect(rarityTier(oneIn(stateShare(biggest)))).toBe("common");
  });
  it("validates birthdays", () => {
    const today = new Date("2026-11-03T00:00:00Z");
    expect(isValidBirthday("1990-02-28", today)).toBe(true);
    expect(isValidBirthday("1990-02-30", today)).toBe(false);
    expect(isValidBirthday("2030-01-01", today)).toBe(false);
    expect(isValidBirthday("1899-12-31", today)).toBe(false);
    expect(isValidBirthday("90-1-1", today)).toBe(false);
  });
  it("birthday seed is stable per episode", () => {
    const a = birthdayRandom("joseon-1426", "1990-05-05");
    const b = birthdayRandom("joseon-1426", "1990-05-05");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(birthdayRandom("europe-1426", "1990-05-05")()).not.toBe(birthdayRandom("joseon-1426", "1990-05-05")());
  });
  it("compares Joseon ranks", () => {
    expect(compareRank("정1품", "종6품")).toBe("me");
    expect(compareRank("종3품", "정3품 당상")).toBe("friend");
    expect(compareRank("정5품", "정5품")).toBe("same");
    expect(compareRank("무품", "정5품")).toBeNull();
  });
});

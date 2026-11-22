import { describe, expect, it } from "vitest";
import { GLOSS, gloss } from "../data/hometown-1426-gloss";
import {
  ALIASES, COUNTED, GOEUL, PROVINCES, TOTAL_PEOPLE, byId, findGoeul, formatHometown, normalizePlace, parseHometown, peopleRank, roughReal,
} from "./hometown-1426";

describe("hometown-1426 data", () => {
  it("has all 337 고을 in known provinces", () => {
    expect(GOEUL).toHaveLength(337);
    for (const g of GOEUL) expect(PROVINCES).toContain(g.p);
    expect(COUNTED).toBe(334);
    expect(TOTAL_PEOPLE).toBe(745140);
  });

  it("every alias points at a real 고을", () => {
    for (const [name, list] of Object.entries(ALIASES)) {
      for (const [p, h] of list) expect(GOEUL.some((g) => g.p === p && g.h === h), `${name} → ${p} ${h}`).toBe(true);
    }
  });

  it("every 土産 item has a gloss", () => {
    const missing = [...new Set(GOEUL.flatMap((g) => g.t))].filter((t) => !GLOSS[t]);
    expect(missing).toEqual([]);
  });

  it("glosses fur bundles by animal", () => {
    expect(gloss("豹狐狸皮")?.ko).toBe("표범·여우·삵 가죽");
    expect(gloss("狐狸山水獺皮")?.en).toBe("fox, wildcat, otter furs");
    expect(gloss("密")).toBeNull();
  });
});

describe("findGoeul", () => {
  it("normalizes suffixes", () => {
    expect(normalizePlace("포항시 북구")).toBe("포항");
    expect(normalizePlace("서울특별시")).toBe("서울");
    expect(normalizePlace("남양주시")).toBe("남양주");
    expect(normalizePlace("시흥")).toBe("시흥");
    expect(normalizePlace("고성군")).toBe("고성");
  });

  it("matches modern names directly and through aliases", () => {
    expect(findGoeul("수원시")[0].goeul.h).toBe("水原");
    expect(findGoeul("수원시")[0].via).toBeNull();
    expect(findGoeul("서울")[0].goeul.h).toBe("漢城");
    expect(findGoeul("포항").map((m) => m.goeul.h)).toEqual(["迎日", "興海", "長鬐", "淸河"]);
    expect(findGoeul("성남시")[0].goeul.h).toBe("廣州");
    expect(findGoeul("漢城")[0].goeul.k).toBe("한성");
  });

  it("광주 gives both 경기 광주 and 광주광역시 (무진)", () => {
    const hs = findGoeul("광주").map((m) => `${m.goeul.p}:${m.goeul.h}`);
    expect(hs).toEqual(["경기:廣州", "전라:茂珍"]);
  });

  it("returns nothing for unknown places", () => {
    expect(findGoeul("뉴욕")).toEqual([]);
    expect(findGoeul(" ")).toEqual([]);
  });
});

describe("rank and query", () => {
  it("ranks by 口", () => {
    const top = GOEUL.find((g) => g.h === "鍾城")!;
    expect(peopleRank(top)).toBe(1);
    expect(peopleRank(byId(1)!)).toBeNull(); // 한성: 口 not recorded
    expect(roughReal(byId(1)!)).toBeNull();
  });

  it("round-trips the share query", () => {
    const q = { id: 3, via: "성남" };
    expect(parseHometown(`?${formatHometown(q)}`)).toEqual(q);
    expect(parseHometown("?g=999")).toBeNull();
    expect(parseHometown("?g=5")).toEqual({ id: 5, via: null });
  });
});

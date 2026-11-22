/**
 * "내 동네는 600년 전 어느 고을?" — modern Korean town → 고을 in the Sejong Sillok gazetteer (세종실록 지리지).
 *
 * Data: src/data/hometown-1426.json, trimmed from scripts/data/sejong-jiriji-goeul.json by
 * scripts/build-hometown-1426.py (337 고을, 戶·口 as written, 土産 up to 5 items, 土貢 first 5 where no 土産).
 * The gazetteer was surveyed around 1432 (世宗 14, 新撰八道地理志) and printed with the Sillok in 1454.
 * 口 is the registered head count, far below the real population; we say so on the page.
 */
import raw from "../data/hometown-1426.json";

export const SURVEY_YEAR = 1432;
export const PRINT_YEAR = 1454;

export type Goeul = {
  id: number;
  /** province (도) in hangul: 경도·구도 are 한성·개성 */
  p: string;
  ph: string;
  h: string;
  k: string;
  /** rank in hanja (府·牧·郡·縣…) and hangul */
  r: string;
  rk: string;
  hh: number | null;
  pp: number | null;
  /** 土産 (up to 5) */
  t: string[];
  /** 土貢 first 5, only where no 土産 is recorded */
  g: string[];
  /** wikisource section anchor */
  a: string;
  v: number;
  /** newly founded frontier county appended after the province total */
  f: boolean;
};

export const GOEUL: readonly Goeul[] = raw as Goeul[];

export const PROVINCES = ["경도", "구도", "경기", "충청", "경상", "전라", "황해", "강원", "평안", "함길"] as const;
export type Province = (typeof PROVINCES)[number];

const WITH_PEOPLE = GOEUL.filter((g) => g.pp !== null).sort((a, b) => (b.pp ?? 0) - (a.pp ?? 0));
export const COUNTED = WITH_PEOPLE.length;
export const TOTAL_PEOPLE = WITH_PEOPLE.reduce((s, g) => s + (g.pp ?? 0), 0);
/** Rounded estimate of Joseon's real population at the time (same figure as /ancestors-1426/). */
export const REAL_POP_ESTIMATE = 5_500_000;

export const SOURCE_BASE = "https://zh.wikisource.org/w/index.php?title=%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84/%E5%9C%B0%E7%90%86%E5%BF%97&oldid=2112850";
export const sourceUrl = (g: Goeul) => `${SOURCE_BASE}#${encodeURIComponent(g.a)}`;

export const byId = (id: number) => GOEUL.find((g) => g.id === id) ?? null;
export const inProvince = (p: string) => GOEUL.filter((g) => g.p === p);

/** 1-based rank by 口 among the 고을 whose 口 is readable, or null. */
export function peopleRank(g: Goeul): number | null {
  if (g.pp === null) return null;
  return WITH_PEOPLE.findIndex((x) => x.id === g.id) + 1;
}

export const perHousehold = (g: Goeul) => (g.hh && g.pp ? g.pp / g.hh : null);
/** More than this many registered people per household is unusual enough to flag as a possible copying error. */
export const ODD_PER_HOUSEHOLD = 15;

/** Very rough "if registration was equally incomplete everywhere" scale-up. Labelled as a guess on the page. */
export const roughReal = (g: Goeul) => (g.pp === null ? null : Math.round((g.pp * REAL_POP_ESTIMATE) / TOTAL_PEOPLE / 100) * 100);

/**
 * Modern place → 고을 (province, hanja). Only for names that changed or were split/merged;
 * a modern name that is the same as a 고을 name (수원, 안동, 전주 …) is found directly.
 * Approximate: a modern city often covers parts of several 고을.
 */
export const ALIASES: Record<string, [string, string][]> = {
  서울: [["경도", "漢城"]],
  한양: [["경도", "漢城"]],
  부산: [["경상", "東萊"], ["경상", "機張"]],
  대구: [["경상", "大丘"]],
  인천: [["경기", "仁川"], ["경기", "富平"]],
  광주광역시: [["전라", "茂珍"]],
  대전: [["충청", "懷德"], ["충청", "鎭岑"], ["충청", "公州"]],
  울산: [["경상", "蔚山"], ["경상", "彦陽"]],
  세종: [["충청", "燕岐"], ["충청", "全義"]],
  성남: [["경기", "廣州"]],
  하남: [["경기", "廣州"]],
  의왕: [["경기", "廣州"]],
  부천: [["경기", "富平"]],
  의정부: [["경기", "楊州"]],
  남양주: [["경기", "楊州"]],
  구리: [["경기", "楊州"]],
  동두천: [["경기", "楊州"]],
  안양: [["경기", "果川"], ["경기", "衿川"]],
  군포: [["경기", "果川"]],
  광명: [["경기", "衿川"]],
  시흥: [["경기", "安山"], ["경기", "仁川"]],
  화성: [["경기", "水原"], ["경기", "南陽"]],
  오산: [["경기", "水原"]],
  평택: [["경기", "振威"], ["충청", "平澤"]],
  여주: [["경기", "驪興"]],
  양평: [["경기", "楊根"], ["경기", "砥平"]],
  파주: [["경기", "原平"], ["경기", "交河"]],
  일산: [["경기", "高陽"]],
  포천: [["경기", "抱川"], ["경기", "永平"]],
  연천: [["경기", "漣川"], ["경기", "麻田"]],
  김포: [["경기", "金浦"], ["경기", "通津"]],
  강화: [["경기", "江華"], ["경기", "喬桐"]],
  철원: [["경기", "鐵原"]],
  홍성: [["충청", "洪州"], ["충청", "結城"]],
  논산: [["충청", "尼山"], ["충청", "恩津"], ["충청", "連山"]],
  계룡: [["충청", "連山"]],
  증평: [["충청", "靑安"]],
  천안: [["충청", "天安"], ["충청", "木川"], ["충청", "稷山"]],
  아산: [["충청", "牙山"], ["충청", "溫水"], ["충청", "新昌"]],
  예산: [["충청", "禮山"], ["충청", "大興"], ["충청", "德山"]],
  보령: [["충청", "保寧"], ["충청", "藍浦"]],
  서천: [["충청", "舒川"], ["충청", "韓山"], ["충청", "庇仁"]],
  당진: [["충청", "唐津"], ["충청", "沔川"]],
  금산: [["전라", "錦山"], ["전라", "珍山"]],
  포항: [["경상", "迎日"], ["경상", "興海"], ["경상", "長鬐"], ["경상", "淸河"]],
  구미: [["경상", "善山"], ["경상", "仁同"]],
  김천: [["경상", "金山"], ["경상", "開寧"], ["경상", "知禮"]],
  영주: [["경상", "榮川"], ["경상", "順興"]],
  창원: [["경상", "昌原"], ["경상", "鎭海"], ["경상", "漆原"]],
  마산: [["경상", "昌原"]],
  진해: [["경상", "鎭海"]],
  통영: [["경상", "固城"]],
  남해: [["경상", "昆南"]],
  산청: [["경상", "山陰"]],
  합천: [["경상", "陜川"], ["경상", "草溪"], ["경상", "三嘉"]],
  창녕: [["경상", "昌寧"], ["경상", "靈山"]],
  칠곡: [["경상", "仁同"]],
  울진: [["강원", "蔚珍"], ["강원", "平海"]],
  군산: [["전라", "沃溝"], ["전라", "臨陂"]],
  익산: [["전라", "益山"], ["전라", "咸悅"], ["전라", "龍安"], ["전라", "礪山"]],
  정읍: [["전라", "井邑"], ["전라", "泰仁"], ["전라", "古阜"]],
  김제: [["전라", "金堤"], ["전라", "萬頃"], ["전라", "金溝"]],
  완주: [["전라", "高山"]],
  고창: [["전라", "高敞"], ["전라", "茂長"], ["전라", "興德"]],
  진안: [["전라", "鎭安"], ["전라", "龍潭"]],
  남원: [["전라", "南原"], ["전라", "雲峯"]],
  목포: [["전라", "務安"]],
  여수: [["전라", "順天"]],
  나주: [["전라", "羅州"], ["전라", "南平"]],
  해남: [["전라", "海珍"]],
  진도: [["전라", "海珍"]],
  완도: [["전라", "康津"]],
  화순: [["전라", "和順"], ["전라", "綾城"], ["전라", "同福"]],
  담양: [["전라", "潭陽"], ["전라", "昌平"]],
  곡성: [["전라", "谷城"], ["전라", "玉果"]],
  장성: [["전라", "長城"], ["전라", "珍原"]],
  서귀포: [["전라", "旌義"], ["전라", "大靜"]],
  동해: [["강원", "三陟"]],
  태백: [["강원", "三陟"]],
  속초: [["강원", "襄陽"]],
  고성: [["경상", "固城"], ["강원", "杆城"], ["강원", "高城"]],
  화천: [["강원", "狼川"]],
  평양: [["평안", "平壤"]],
  개성: [["구도", "開城"]],
};

/** Strip spaces and administrative suffixes: "포항시 북구" → "포항", "서울특별시" → "서울". */
export function normalizePlace(q: string): string {
  let s = q.replace(/\s+/g, "");
  s = s.replace(/(특별자치시|특별자치도|특별시|광역시)$/, "");
  const head = /^(.{2,}?)(시|군)(.+[구읍면동])?$/.exec(s);
  if (head) return head[1];
  return s;
}

export type Match = { goeul: Goeul; via: string | null };

/** Find 고을 for a place name typed in Korean (modern or old) or hanja. Direct name matches first, then aliases. */
export function findGoeul(query: string): Match[] {
  const s = normalizePlace(query);
  if (!s) return [];
  const out: Match[] = [];
  const seen = new Set<number>();
  const push = (g: Goeul, via: string | null) => {
    if (!seen.has(g.id)) {
      seen.add(g.id);
      out.push({ goeul: g, via });
    }
  };
  const aliasKey = s === "광주" ? null : s;
  for (const g of GOEUL) {
    const names = g.k.split("、");
    const hanja = g.h.split("、");
    if (names.includes(s) || hanja.includes(s)) push(g, null);
  }
  if (s === "광주") for (const [p, h] of ALIASES["광주광역시"]) push(GOEUL.find((g) => g.p === p && g.h === h)!, "광주광역시");
  const alias = aliasKey ? ALIASES[aliasKey] : undefined;
  if (alias) {
    for (const [p, h] of alias) {
      const g = GOEUL.find((x) => x.p === p && x.h === h);
      if (g) push(g, s);
    }
  }
  return out;
}

export type HometownQuery = { id: number; via: string | null };

export function formatHometown(q: HometownQuery): string {
  const p = new URLSearchParams({ g: String(q.id) });
  if (q.via) p.set("q", q.via);
  return p.toString();
}

export function parseHometown(search: string): HometownQuery | null {
  const p = new URLSearchParams(search);
  const id = Number(p.get("g"));
  if (!Number.isInteger(id) || !byId(id)) return null;
  const via = p.get("q");
  return { id, via: via ? via.slice(0, 20) : null };
}

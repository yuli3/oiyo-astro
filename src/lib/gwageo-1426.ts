/**
 * "과거시험 보러 가기" — sit the 1426 (세종 8년 丙午) 식년 문과.
 *
 * Facts used (Sejong Sillok year 8, wikisource oldid 2122908; SEDB 문과 database):
 * - 2/21 생원시 방방: 辛石堅 등 100인. 辛石堅 also passed the 문과 that year (병과 7위).
 * - 4/11 근정전 전시 (策會試入格生南秀文等). The 책문 asks about 慶源 (keep it, pull it back to 鏡城, or
 *   keep it as 태종's rule) and about Jurchen food demands at 閭延·江界.
 * - 4/13 방방: 文 34인 (乙3·丙7·同進士24, 장원 皇甫良), 武 28인 (장원 李宗蕃); 賜花·賜酒.
 * - 4/15 李君擧 swapped a 회시 경의 sheet: 杖八十. 6/16 魚變尾 had a 對讀官 fix his 賦 rhyme: 杖六十·徒一年
 *   (then reduced two degrees).
 * - Quotas: 문과 초시 240 → 회시 33 (this year 34 passed).
 * Outcome of the 慶源 debate (encykorea 육진): Sejong refused to give up "조종의 옛 땅"; 1432 영북진, from 1434
 * 김종서 set up the six garrisons and 경원부 moved north to 회질가.
 */

export type Bi = { ko: string; en: string };

/** 초장: 경서 구절 → 출전 (강경). Answers are standard attributions. */
export const BOOKS = ["논어", "맹자", "대학", "중용", "시경", "서경", "주역"] as const;
export type Book = (typeof BOOKS)[number];
export const BOOK_EN: Record<Book, string> = {
  논어: "Analects", 맹자: "Mencius", 대학: "Great Learning", 중용: "Doctrine of the Mean", 시경: "Book of Songs", 서경: "Book of Documents", 주역: "Book of Changes",
};

export type Classic = { id: string; text: string; book: Book; gloss: Bi };
export const CLASSICS: Classic[] = [
  { id: "c1", text: "學而時習之 不亦說乎", book: "논어", gloss: { ko: "배우고 때때로 익히면 기쁘지 아니한가", en: "To learn and practise it in due time: is that not a joy?" } },
  { id: "c2", text: "溫故而知新 可以爲師矣", book: "논어", gloss: { ko: "옛것을 익혀 새것을 알면 스승이 될 만하다", en: "Review the old to know the new, and you may teach." } },
  { id: "c3", text: "三人行 必有我師焉", book: "논어", gloss: { ko: "세 사람이 길을 가면 반드시 내 스승이 있다", en: "Among any three walking together, one can teach me." } },
  { id: "c4", text: "惻隱之心 仁之端也", book: "맹자", gloss: { ko: "남을 불쌍히 여기는 마음은 어짊의 실마리다", en: "Compassion is the sprout of benevolence." } },
  { id: "c5", text: "天時不如地利 地利不如人和", book: "맹자", gloss: { ko: "하늘의 때는 땅의 이로움만 못하고, 땅의 이로움은 사람의 화합만 못하다", en: "Good timing is less than good terrain, and terrain less than harmony among people." } },
  { id: "c6", text: "大學之道 在明明德 在親民 在止於至善", book: "대학", gloss: { ko: "큰 배움의 길은 밝은 덕을 밝히는 데 있다", en: "The way of great learning lies in making bright virtue shine." } },
  { id: "c7", text: "天命之謂性 率性之謂道", book: "중용", gloss: { ko: "하늘이 준 것을 본성이라 하고, 본성을 따르는 것을 도라 한다", en: "What Heaven gives is nature; following nature is the Way." } },
  { id: "c8", text: "關關雎鳩 在河之洲", book: "시경", gloss: { ko: "꾸룩꾸룩 물수리, 강가 모래톱에 있네", en: "Guan-guan cry the ospreys on the river isle." } },
  { id: "c9", text: "民惟邦本 本固邦寧", book: "서경", gloss: { ko: "백성은 나라의 근본이니 근본이 튼튼해야 나라가 편안하다", en: "The people are the root of the state; firm root, peaceful state." } },
  { id: "c10", text: "天行健 君子以自强不息", book: "주역", gloss: { ko: "하늘의 운행은 굳세니 군자는 스스로 힘써 쉬지 않는다", en: "Heaven moves with vigour; the gentleman strives without rest." } },
];

/** 중장: 賦 운 맞추기 (平水韻). 風∈一東, 香∈七陽, 天∈一先; distractors are from other rhyme groups. */
export type Rhyme = { id: string; group: string; answer: string; options: string[] };
export const RHYMES: Rhyme[] = [
  { id: "r1", group: "東", answer: "風", options: ["風", "光", "心", "天"] },
  { id: "r2", group: "陽", answer: "香", options: ["雲", "香", "東", "花"] },
  { id: "r3", group: "先", answer: "天", options: ["山", "江", "天", "風"] },
];

/** 종장 = 전시 책문 (4/11). The three views are the ones Sejong listed. */
export const POLICY = [
  { id: "keep", ko: "공험진 남쪽은 옛 땅이니 군민을 두어 지켜야 한다", en: "The land south of Gongheom is our old territory: settle and hold it." },
  { id: "retreat", ko: "경원은 삼면이 적이고 사람이 적으니 경성으로 물려야 한다", en: "Gyeongwon is exposed on three sides and thinly peopled: pull back to Gyeongseong." },
  { id: "law", ko: "경원에 군사를 둔 것은 태종의 법이니 바꿀 수 없다", en: "Garrisoning Gyeongwon was King Taejong's rule and cannot be changed." },
] as const;
export type PolicyId = (typeof POLICY)[number]["id"];
/** Sejong refused to cede "조종의 옛 땅" and later pushed north (육진), so "keep" matches what he did. */
export const SEJONG_CHOICE: PolicyId = "keep";

export type Rank = "jangwon" | "eul" | "byeong" | "dong" | "fail" | "caught";

/** Real 1426 passers used as neighbours on the result list (SEDB). */
export const PASSERS = {
  eul: [{ ko: "황보량", hanja: "皇甫良" }, { ko: "조전", hanja: "趙篆" }, { ko: "양계원", hanja: "楊繼元" }],
  byeong: [{ ko: "고승안", hanja: "高承顔" }, { ko: "남수문", hanja: "南秀文" }, { ko: "성한", hanja: "成漢" }],
  dong: [{ ko: "김맹헌", hanja: "金孟獻" }, { ko: "정창손", hanja: "鄭昌孫" }],
} as const;

export const QUOTA = { first: 240, final: 33, passed1426: 34, eul: 3, byeong: 7, dong: 24, mugwa: 28, saengwon: 100 } as const;

export type Score = { classics: number; rhymes: number; policy: PolicyId | null; cheated: boolean };

/**
 * 초장 3문 + 중장 3문 = 6. Passing the 회시 needs 4+ (33 of 240 got through, about one in seven).
 * The 전시 fails nobody; it only ranks. Matching Sejong's own answer adds a point.
 */
export function rankOf(s: Score): Rank {
  if (s.cheated) return "caught";
  const base = s.classics + s.rhymes;
  if (base < 4) return "fail";
  const total = base + (s.policy === SEJONG_CHOICE ? 1 : 0);
  if (total >= 7) return "jangwon";
  if (total === 6) return "eul";
  if (total === 5) return "byeong";
  return "dong";
}

export function shuffle<T>(xs: readonly T[], rand: () => number = Math.random): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Three classics questions, each with the right book and three other books. */
export function makeClassicQuiz(rand: () => number = Math.random) {
  return shuffle(CLASSICS, rand)
    .slice(0, 3)
    .map((c) => ({ ...c, options: shuffle([c.book, ...shuffle(BOOKS.filter((b) => b !== c.book), rand).slice(0, 3)], rand) }));
}

const RANKS: Rank[] = ["jangwon", "eul", "byeong", "dong", "fail", "caught"];

export function formatGwageo(rank: Rank, policy: PolicyId | null): string {
  const q = new URLSearchParams({ r: rank });
  if (policy) q.set("p", policy);
  return q.toString();
}

export function parseGwageo(search: string): { rank: Rank; policy: PolicyId | null } | null {
  const q = new URLSearchParams(search);
  const r = q.get("r") as Rank | null;
  if (!r || !RANKS.includes(r)) return null;
  const p = q.get("p");
  return { rank: r, policy: POLICY.some((x) => x.id === p) ? (p as PolicyId) : null };
}

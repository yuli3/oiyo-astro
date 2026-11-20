/**
 * "Me in the 1850 U.S. census": the seventh census (census day 1 June 1850).
 *
 * Sources:
 * - census.gov "1850 Fast Facts": total 23,191,876; 3,231 enumerators; 13 questions; NYC 515,547.
 * - census.gov 1850 questionnaire: the Schedule 1 columns, and the fact that Schedule 2 listed slave owners by name
 *   and the enslaved only by number, age, sex and colour.
 * - Wikipedia "1850 United States census": 3,204,313 enslaved; first census to cover every member of a household
 *   and to ask free residents' place of birth.
 * - Pew Research 2024-07-22 (IPUMS): 2.2 million foreign-born (9.7%): Ireland 1.00m, Germany 0.60m, UK 0.39m.
 * - 1850 census "free colored" total 434,495 (Seventh Census, Statistical View).
 * Weights are thousands of people and sum to the 23,192 thousand total. "native" is the remainder after the other
 * groups. Names, birthplaces, occupations and dollar values on the generated line are invented for the game.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type GroupId = "native" | "ireland" | "germany" | "uk" | "otherForeign" | "freeBlack" | "enslaved";
export type Sex = "m" | "f";

export const TOTAL_K = 23192;
const ENSLAVED_K = 3204;
const FREE_BLACK_K = 434;
const FOREIGN_K = 2200;
const IRELAND_K = 1000;
const GERMANY_K = 600;
const UK_K = 390;

export type Group = { id: GroupId; k: number; color: "W" | "B" | "M" | null; name: Six; life: Six };

export const GROUPS: Group[] = [
  {
    id: "native", k: TOTAL_K - ENSLAVED_K - FREE_BLACK_K - FOREIGN_K, color: "W",
    name: { ko: "미국 태생 백인", en: "U.S.-born white American", ja: "アメリカ生まれの白人", zh: "美国出生的白人", fr: "Blanc né aux États-Unis", es: "Blanco nacido en EE. UU." },
    life: { ko: "인구 셋 중 둘이 여기에 속해요. 대부분 농장에서 살았고, 서부로 가는 길이 막 열리던 때예요. 1850년 가장 큰 도시 뉴욕도 51만 명이었어요.", en: "About two in three Americans. Most lived on farms, and the road west was opening; even New York, the biggest city, had 515,547 people.", ja: "人口の3人に2人。多くは農場で暮らし、西部への道が開けつつありました。最大の都市ニューヨークでも51万人です。", zh: "约占三分之二。多数住在农场，西进之路正在打开；最大城市纽约也只有51.5万人。", fr: "Environ deux Américains sur trois, surtout fermiers ; New York, la plus grande ville, comptait 515 547 habitants.", es: "Unos dos de cada tres, casi todos en granjas; Nueva York, la mayor ciudad, tenía 515.547 habitantes." },
  },
  {
    id: "enslaved", k: ENSLAVED_K, color: null,
    name: { ko: "노예로 묶인 사람", en: "Enslaved person", ja: "奴隷とされた人", zh: "被奴役的人", fr: "Personne réduite en esclavage", es: "Persona esclavizada" },
    life: { ko: "1850년 미국에서 320만 명, 일곱 명 중 한 명꼴이 노예였어요. 센서스는 이 사람들의 이름을 적지 않았어요. 따로 만든 노예 명부에 주인의 이름 아래 나이·성별·피부색만 숫자처럼 적혔어요.", en: "3.2 million people, about one in seven Americans, were enslaved in 1850. The census did not write down their names: a separate slave schedule listed only the owner's name, then each person's age, sex and colour.", ja: "1850年のアメリカでは320万人、7人に1人が奴隷とされていました。国勢調査は彼らの名を記さず、別の奴隷台帳に所有者の名と年齢・性別・肌の色だけを記しました。", zh: "1850年美国有320万人、约七分之一的人口被奴役。普查不记录他们的名字，只在单独的奴隶表上写下奴隶主姓名，以及每人的年龄、性别和肤色。", fr: "3,2 millions de personnes, un Américain sur sept, étaient esclaves en 1850. Le recensement n'a pas noté leurs noms : seulement celui du propriétaire, puis l'âge, le sexe et la couleur.", es: "3,2 millones de personas, uno de cada siete, estaban esclavizadas en 1850. El censo no anotó sus nombres: solo el del dueño y la edad, sexo y color de cada persona." },
  },
  {
    id: "ireland", k: IRELAND_K, color: "W",
    name: { ko: "아일랜드에서 온 이민자", en: "Irish immigrant", ja: "アイルランドからの移民", zh: "爱尔兰移民", fr: "Immigré irlandais", es: "Inmigrante irlandés" },
    life: { ko: "대기근(1845~1852)을 피해 배를 탄 사람들이에요. 1850년 미국의 외국 태생 220만 명 중 100만 명이 아일랜드 출신이었어요.", en: "Many fled the Great Famine (1845–52). Of 2.2 million foreign-born Americans in 1850, a million were from Ireland.", ja: "大飢饉（1845～52年）を逃れて海を渡った人々。1850年の外国生まれ220万人のうち100万人がアイルランド出身でした。", zh: "许多人为逃离大饥荒（1845—1852）而来。1850年220万外国出生人口中，100万来自爱尔兰。", fr: "Beaucoup fuyaient la Grande Famine (1845–1852) : un million des 2,2 millions de nés à l'étranger venaient d'Irlande.", es: "Muchos huían de la Gran Hambruna (1845–1852): un millón de los 2,2 millones de nacidos fuera venían de Irlanda." },
  },
  {
    id: "germany", k: GERMANY_K, color: "W",
    name: { ko: "독일어권에서 온 이민자", en: "German immigrant", ja: "ドイツ語圏からの移民", zh: "德语地区移民", fr: "Immigré allemand", es: "Inmigrante alemán" },
    life: { ko: "1848년 혁명이 실패한 뒤 건너온 사람도 많았어요. 1850년 약 60만 명으로 두 번째로 큰 이민자 집단이었어요.", en: "Some came after the failed revolutions of 1848; about 600,000 in 1850, the second-largest immigrant group.", ja: "1848年革命の挫折後に渡った人も多く、1850年には約60万人で2番目に大きい移民集団でした。", zh: "不少人在1848年革命失败后移民，1850年约60万人，是第二大移民群体。", fr: "Certains arrivés après l'échec des révolutions de 1848 ; environ 600 000 en 1850.", es: "Algunos llegaron tras las revoluciones fallidas de 1848; unos 600.000 en 1850." },
  },
  {
    id: "freeBlack", k: FREE_BLACK_K, color: "B",
    name: { ko: "자유인 흑인", en: "Free Black American", ja: "自由黒人", zh: "自由黑人", fr: "Noir libre", es: "Negro libre" },
    life: { ko: "1850년 자유인 흑인은 약 43만 명이었어요. 같은 해 도망노예법이 통과돼, 자유인이어도 붙잡혀 남부로 끌려갈 위험 속에 살았어요.", en: "About 434,000 free Black Americans in 1850, the year the Fugitive Slave Act passed: even free people risked being seized and sent south.", ja: "1850年の自由黒人は約43万人。同年に逃亡奴隷法が成立し、自由人でも捕らえられ南部へ送られる危険の中で暮らしました。", zh: "1850年约有43.4万自由黑人。同年《逃亡奴隶法》通过，即便是自由人也面临被抓走送往南方的危险。", fr: "Environ 434 000 en 1850, l'année de la loi sur les esclaves fugitifs : même libres, ils risquaient d'être capturés.", es: "Unos 434.000 en 1850, el año de la Ley de Esclavos Fugitivos: incluso libres, corrían el riesgo de ser capturados." },
  },
  {
    id: "uk", k: UK_K, color: "W",
    name: { ko: "영국에서 온 이민자", en: "British immigrant", ja: "イギリスからの移民", zh: "英国移民", fr: "Immigré britannique", es: "Inmigrante británico" },
    life: { ko: "잉글랜드·스코틀랜드·웨일스에서 온 약 39만 명. 광부·기계공처럼 기술을 가지고 온 사람이 많았어요.", en: "About 390,000 from England, Scotland and Wales, many bringing trades like mining and machine work.", ja: "イングランド・スコットランド・ウェールズから約39万人。鉱夫や機械工など技術を持つ人が多くいました。", zh: "约39万人来自英格兰、苏格兰和威尔士，许多人带着采矿、机械等手艺。", fr: "Environ 390 000 venus de Grande-Bretagne, souvent mineurs ou mécaniciens.", es: "Unos 390.000 de Gran Bretaña, muchos mineros o mecánicos." },
  },
  {
    id: "otherForeign", k: FOREIGN_K - IRELAND_K - GERMANY_K - UK_K, color: "W",
    name: { ko: "다른 나라에서 온 이민자", en: "Immigrant from elsewhere", ja: "その他の国からの移民", zh: "其他国家移民", fr: "Immigré d'ailleurs", es: "Inmigrante de otro país" },
    life: { ko: "캐나다(약 15만)·프랑스(약 6만)·노르웨이 등에서 왔어요. 1849년 골드러시로 캘리포니아에 온 사람도 있어요.", en: "From Canada (about 150,000), France (about 60,000), Norway and beyond; some came for the 1849 gold rush.", ja: "カナダ（約15万）・フランス（約6万）・ノルウェーなどから。1849年のゴールドラッシュで来た人もいます。", zh: "来自加拿大（约15万）、法国（约6万）、挪威等地，也有人为1849年淘金热而来。", fr: "Du Canada (150 000), de France (60 000), de Norvège… certains pour la ruée vers l'or de 1849.", es: "De Canadá (150.000), Francia (60.000), Noruega…; algunos por la fiebre del oro de 1849." },
  },
];

export const groupById = (id: string) => GROUPS.find((g) => g.id === id) ?? null;
export const oneIn = (g: Group) => Math.max(1, Math.round(TOTAL_K / g.k));

export function drawGroup(rand: () => number = Math.random): Group {
  let x = rand() * TOTAL_K;
  for (const g of GROUPS) {
    if (x < g.k) return g;
    x -= g.k;
  }
  return GROUPS[0];
}

/** Common names of the time, used only on the invented line. */
const FIRST: Record<"en" | "ie" | "de", Record<Sex, string[]>> = {
  en: { m: ["John", "William", "James", "George", "Charles", "Thomas", "Henry", "Joseph"], f: ["Mary", "Elizabeth", "Sarah", "Margaret", "Martha", "Nancy", "Ann", "Jane"] },
  ie: { m: ["Patrick", "Michael", "John", "James", "Thomas", "Daniel", "Dennis", "Timothy"], f: ["Bridget", "Mary", "Catherine", "Margaret", "Ellen", "Honora", "Ann", "Julia"] },
  de: { m: ["Johann", "Heinrich", "Friedrich", "Georg", "Wilhelm", "Karl", "Jacob", "Peter"], f: ["Catharina", "Maria", "Elisabeth", "Margaretha", "Anna", "Barbara", "Christina", "Sophia"] },
};
const LAST: Record<"en" | "ie" | "de", string[]> = {
  en: ["Smith", "Brown", "Johnson", "Miller", "Davis", "Wilson", "Clark", "Taylor"],
  ie: ["Murphy", "Kelly", "Sullivan", "Walsh", "O'Brien", "Ryan", "Connor", "Byrne"],
  de: ["Schmidt", "Müller", "Meyer", "Wagner", "Becker", "Schneider", "Fischer", "Weber"],
};
const BIRTH: Record<GroupId, string[]> = {
  native: ["New York", "Pennsylvania", "Ohio", "Virginia", "Massachusetts", "Kentucky", "Tennessee", "North Carolina"],
  freeBlack: ["Maryland", "Virginia", "Pennsylvania", "New York", "North Carolina", "Louisiana"],
  enslaved: ["Virginia", "South Carolina", "Georgia", "Alabama", "Mississippi", "Louisiana"],
  ireland: ["Ireland"],
  germany: ["Prussia", "Bavaria", "Baden", "Hesse", "Württemberg"],
  uk: ["England", "Scotland", "Wales"],
  otherForeign: ["Canada", "France", "Norway", "Switzerland", "Holland", "Sweden"],
};
/** Schedule 1 asked the trade of males over 15 only. */
const TRADE: Record<GroupId, string[]> = {
  native: ["Farmer", "Farmer", "Farmer", "Laborer", "Carpenter", "Merchant", "Blacksmith", "Clerk"],
  ireland: ["Laborer", "Laborer", "Farmer", "Boatman", "Shoemaker", "Tailor"],
  germany: ["Farmer", "Baker", "Shoemaker", "Tailor", "Brewer", "Cabinetmaker"],
  uk: ["Miner", "Machinist", "Farmer", "Weaver", "Mason", "Merchant"],
  otherForeign: ["Farmer", "Miner", "Laborer", "Sailor", "Carpenter"],
  freeBlack: ["Laborer", "Barber", "Waiter", "Farmer", "Seaman", "Carpenter"],
  enslaved: [],
};

export type Entry = { group: GroupId; sex: Sex; age: number; n: number; s: number; b: number; t: number; v: number };

export function makeEntry(g: Group, sex: Sex, age: number, rand: () => number = Math.random): Entry {
  const i = (len: number) => Math.floor(rand() * Math.max(len, 1));
  const v = g.id === "enslaved" || age < 21 || rand() < 0.5 ? 0 : (1 + i(40)) * 50;
  return { group: g.id, sex, age, n: i(8), s: i(8), b: i(BIRTH[g.id].length), t: i(TRADE[g.id].length), v };
}

const origin = (id: GroupId): "en" | "ie" | "de" => (id === "ireland" ? "ie" : id === "germany" ? "de" : "en");

export type Line = { name: string | null; age: number; sex: "M" | "F"; color: string; trade: string; value: string; birth: string };

/** The line as an assistant marshal would have written it (Schedule 1), or the bare Schedule 2 tally. */
export function lineOf(e: Entry): Line {
  const g = groupById(e.group)!;
  const o = origin(e.group);
  const birth = BIRTH[e.group][e.b] ?? BIRTH[e.group][0];
  if (e.group === "enslaved") {
    return { name: null, age: e.age, sex: e.sex === "m" ? "M" : "F", color: e.n % 3 === 0 ? "M" : "B", trade: "", value: "", birth };
  }
  const trade = e.sex === "m" && e.age > 15 ? TRADE[e.group][e.t] ?? "" : "";
  return {
    name: `${FIRST[o][e.sex][e.n]} ${LAST[o][e.s]}`,
    age: e.age,
    sex: e.sex === "m" ? "M" : "F",
    color: g.id === "freeBlack" ? (e.n % 3 === 0 ? "M" : "B") : "",
    trade,
    value: e.v ? `$${e.v.toLocaleString("en-US")}` : "",
    birth,
  };
}

export function formatCensus(e: Entry): string {
  return new URLSearchParams({ g: e.group, x: e.sex, a: String(e.age), n: String(e.n), s: String(e.s), b: String(e.b), t: String(e.t), v: String(e.v) }).toString();
}

export function parseCensus(search: string): Entry | null {
  const q = new URLSearchParams(search);
  const g = groupById(q.get("g") ?? "");
  const x = q.get("x");
  if (!g || (x !== "m" && x !== "f")) return null;
  const num = (k: string, max: number) => {
    const v = Number(q.get(k));
    return Number.isInteger(v) && v >= 0 && v <= max ? v : null;
  };
  const age = num("a", 110), n = num("n", 7), s = num("s", 7), b = num("b", BIRTH[g.id].length - 1), t = num("t", 7), v = num("v", 2000);
  if (age === null || n === null || s === null || b === null || t === null || v === null) return null;
  return { group: g.id, sex: x, age, n, s, b, t, v: g.id === "enslaved" ? 0 : v };
}

export const FACTS = { enumerators: 3231, questions: 13, nyc: 515547, foreignPct: 9.7 } as const;

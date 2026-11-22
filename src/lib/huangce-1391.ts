/**
 * "Me in the Ming Yellow Registers, 1391" (time-slip season 3 #4).
 *
 * Sources (notes: /mnt/project-files/notes/timeslip-s3-huangce-ming-research.md):
 * - Yellow Registers: first compiled 1381 (Hongwu 14), again 1391, then every ten years to 1642; stored on the Houhu
 *   (Xuanwu Lake) islands, 1.7 million+ volumes by the late Ming, almost all lost in 1645 (en.wikipedia; thepaper.cn).
 * - Lijia: 110 households per li, the 10 richest serve as li heads in annual rotation, 100 form 10 jia (Britannica).
 * - Hereditary household categories (民·军·匠·灶 and 80+ service kinds), "户籍世代相承，严禁改籍" (cssn.cn).
 * - Military households about 20% of households in the early Ming (en.wikipedia Ming army); military + artisan
 *   about 23% (刘永华 estimate, aisixiang 121000). So weights: civilian 77, military 20, artisan 3.
 *   Salt (灶), Confucian, physician and clergy households have no reliable share; they are mentioned, not drawn.
 * - Entry format 旧管/新收/开除/实在, 男子成丁(16–60)/不成丁, 妇女大口/小口, 事产 (栾成显, ncnu Pp19.pdf).
 * - 1393 census: 60,545,812 people (en.wikipedia Population history of China).
 * Names, places, family sizes and property on the generated entry are invented for the game.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };

export const POPULATION_1393 = 60545812;
export const LI_SIZE = 110;
export const LI_HEADS = 10;

export type Category = { id: "min" | "jun" | "jiang"; w: number; ji: string; name: Six; duty: Six };

export const CATEGORIES: Category[] = [
  {
    id: "min", w: 77, ji: "民籍",
    name: { ko: "민호(民戶) · 농사짓는 백성", en: "Civilian household (民户)", ja: "民戸（農民の家）", zh: "民户", fr: "Foyer civil (民户)", es: "Hogar civil (民户)" },
    duty: { ko: "땅에 매긴 세금을 곡식으로 내고, 이갑 차례가 오면 세금 걷기와 마을 일을 맡아요. 열 집 가운데 여덟 집 가까이가 민호였어요.", en: "You pay the land tax in grain and, when your jia's turn comes round, help collect taxes and keep order. Nearly eight households in ten were civilian.", ja: "土地の税を穀物で納め、甲の番が回ってくると徴税や村の務めを担います。10戸のうち8戸近くが民戸でした。", zh: "以粮食缴纳田赋，轮到本甲时负责催征钱粮、维持乡里。将近八成人家是民户。", fr: "Vous payez l'impôt foncier en grain et, quand vient le tour de votre jia, aidez à le collecter. Près de huit foyers sur dix étaient civils.", es: "Pagas el impuesto de la tierra en grano y, cuando le toca a tu jia, ayudas a recaudarlo. Casi ocho de cada diez hogares eran civiles." },
  },
  {
    id: "jun", w: 20, ji: "军籍",
    name: { ko: "군호(軍戶) · 대대로 군역을 지는 집", en: "Military household (军户)", ja: "軍戸（代々兵役を担う家）", zh: "军户", fr: "Foyer militaire (军户)", es: "Hogar militar (军户)" },
    duty: { ko: "집안에서 한 사람이 위소(衛所)에 나가 군인이 되고, 그가 죽거나 도망치면 집안의 다른 남자가 대신 가야 해요. 신분은 대물림되고 바꿀 수 없었어요. 명 초에는 다섯 집에 한 집꼴이 군호였어요.", en: "One man of the house serves in a garrison; if he dies or deserts, another man of the family must take his place. The status was hereditary and could not be changed. In the early Ming about one household in five was military.", ja: "家から1人が衛所の兵となり、死んだり逃げたりすれば家の別の男が代わりに行きます。身分は世襲で変えられませんでした。明初には5戸に1戸が軍戸でした。", zh: "家中出一丁到卫所当兵，若死亡或逃亡，须由家中其他男丁补役。户籍世代相承，不得更改。明初约五户中有一户是军户。", fr: "Un homme de la maison sert dans une garnison ; s'il meurt ou déserte, un autre homme de la famille le remplace. Statut héréditaire et immuable ; environ un foyer sur cinq au début des Ming.", es: "Un hombre de la casa sirve en una guarnición; si muere o deserta, otro de la familia ocupa su lugar. Condición hereditaria e inmutable; uno de cada cinco hogares a comienzos de los Ming." },
  },
  {
    id: "jiang", w: 3, ji: "匠籍",
    name: { ko: "장호(匠戶) · 나라에 솜씨를 바치는 장인 집", en: "Artisan household (匠户)", ja: "匠戸（職人の家）", zh: "匠户", fr: "Foyer d'artisans (匠户)", es: "Hogar artesano (匠户)" },
    duty: { ko: "몇 해에 한 번씩 남경의 관영 공방에 가서 석 달 동안 일해요. 1393년에 이렇게 돌아가며 일한 장인이 232,089명이었어요. 이 신분도 대물림됐어요.", en: "Every few years you go to the state workshops in Nanjing for three months. In 1393, 232,089 rotating artisans were registered. This status was hereditary too.", ja: "数年に一度、南京の官営工房へ行き3か月働きます。1393年、こうした輪班匠は232,089人。この身分も世襲でした。", zh: "每隔几年到南京官营作坊服役三个月。1393年登记的轮班匠有232,089名。匠籍同样世袭。", fr: "Tous les quelques ans, trois mois dans les ateliers d'État de Nankin. 232 089 artisans tournants en 1393 ; statut héréditaire.", es: "Cada pocos años, tres meses en los talleres estatales de Nankín. 232.089 artesanos rotativos en 1393; condición hereditaria." },
  },
];

export const W_TOTAL = CATEGORIES.reduce((s, c) => s + c.w, 0);
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id) ?? null;

export const CRAFTS = ["木匠", "铁匠", "瓦匠", "石匠", "织匠", "染匠"];

export const PLACES = [
  "直隶徽州府休宁县", "直隶徽州府祁门县", "直隶苏州府吴县", "直隶应天府上元县", "浙江处州府丽水县",
  "江西吉安府庐陵县", "福建泉州府晋江县", "湖广武昌府江夏县", "山东济南府历城县", "山西太原府阳曲县",
];
const SURNAMES = ["王", "李", "张", "刘", "陈", "杨", "黄", "赵", "吴", "周", "徐", "孙"];
const GIVEN = ["寄佛", "务本", "景祥", "正茂", "仲安", "文显", "德成", "福保", "得原", "继宗", "兴祖", "伯通"];

export type Household = {
  cat: Category["id"];
  head: boolean;
  place: number;
  du: number;
  tu: number;
  sur: number;
  given: number;
  craft: number;
  /** 旧管: men 成丁, men 不成丁, women 大口, women 小口 */
  old: [number, number, number, number];
  born: number;
  died: number;
  land: number;
  rooms: number;
  oxen: number;
};

export function drawCategory(rand: () => number = Math.random): Category {
  let x = rand() * W_TOTAL;
  for (const c of CATEGORIES) {
    if (x < c.w) return c;
    x -= c.w;
  }
  return CATEGORIES[CATEGORIES.length - 1]!;
}

export function makeHousehold(cat: Category, rand: () => number = Math.random): Household {
  const i = (n: number) => Math.floor(rand() * n);
  const head = rand() < LI_HEADS / LI_SIZE;
  const old: [number, number, number, number] = [1 + i(3) + (head ? 1 : 0), i(3), 1 + i(3), i(3)];
  const died = i(2) && old[1] + old[3] > 0 ? 1 : 0;
  return {
    cat: cat.id, head, place: i(PLACES.length), du: 1 + i(40), tu: 1 + i(9), sur: i(SURNAMES.length), given: i(GIVEN.length), craft: i(CRAFTS.length),
    old, born: i(3), died, land: (head ? 40 : 4) + i(head ? 60 : 30), rooms: 1 + i(head ? 6 : 3), oxen: i(head ? 3 : 2),
  };
}

const DIGITS = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
/** Formal "large" numerals used in registers (壹贰叁…), 0–999. */
export function daxie(n: number): string {
  if (n <= 0) return "零";
  const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10;
  let s = "";
  if (h) s += DIGITS[h] + "佰";
  if (t) s += DIGITS[t] + "拾";
  else if (h && u) s += "零";
  if (u) s += DIGITS[u];
  return s;
}

export type Entry = { title: string; old: string[]; neu: string[]; gone: string[]; now: string[]; property: string[] };

export function totals(h: Household) {
  const [mc, mn, fd, fx] = h.old;
  const oldT = mc + mn + fd + fx;
  const nowT = oldT + h.born - h.died;
  const boyDied = h.died && mn > 0 ? 1 : 0;
  return { oldT, nowT, men: mc + mn + h.born - boyDied, women: fd + fx - (h.died - boyDied) };
}

/** The household's entry in the four-column (四柱) register format. Born children are entered as boys; deaths as 不成丁 or 小口. */
export function entryOf(h: Household): Entry {
  const c = categoryById(h.cat)!;
  const [mc, mn, fd, fx] = h.old;
  const t = totals(h);
  const name = `${SURNAMES[h.sur]}${GIVEN[h.given]}`;
  const ji = h.cat === "jiang" ? `${c.ji}（${CRAFTS[h.craft]}）` : c.ji;
  const deadBoy = h.died && mn > 0;
  return {
    title: `一户${name}系${PLACES[h.place]}${daxie(h.du)}都第${daxie(h.tu)}图 ${ji}${h.head ? " 里长" : " 甲首"}`,
    // Zero sub-counts are left out, as in surviving registers.
    old: [`人口${daxie(t.oldT)}口`, `男子成丁${daxie(mc)}口${mn ? ` 不成丁${daxie(mn)}口` : ""}`, `妇女大口${daxie(fd)}口${fx ? ` 小口${daxie(fx)}口` : ""}`],
    neu: h.born ? [`人口正收男子不成丁${daxie(h.born)}口`] : ["无"],
    gone: h.died ? [`人口正除${deadBoy ? "男子不成丁" : "妇女小口"}壹口`] : ["无"],
    now: [`人口${daxie(t.nowT)}口`, `男子${daxie(t.men)}口 妇女${daxie(t.women)}口`],
    property: [`民田${daxie(h.land)}亩`, `瓦房${daxie(h.rooms)}间`, h.oxen ? `黄牛${daxie(h.oxen)}头` : "头匹无"],
  };
}

export function formatHuangce(h: Household): string {
  return new URLSearchParams({ c: h.cat, h: h.head ? "1" : "0", p: String(h.place), d: String(h.du), t: String(h.tu), s: String(h.sur), g: String(h.given), k: String(h.craft), o: h.old.join("."), b: String(h.born), x: String(h.died), l: String(h.land), r: String(h.rooms), n: String(h.oxen) }).toString();
}

export function parseHuangce(search: string): Household | null {
  const q = new URLSearchParams(search);
  const cat = categoryById(q.get("c") ?? "");
  if (!cat) return null;
  const num = (k: string, min: number, max: number) => {
    const v = Number(q.get(k));
    return q.get(k) !== null && Number.isInteger(v) && v >= min && v <= max ? v : null;
  };
  const head = q.get("h") === "1" ? true : q.get("h") === "0" ? false : null;
  const old = (q.get("o") ?? "").split(".").map(Number);
  const vals = [num("p", 0, PLACES.length - 1), num("d", 1, 99), num("t", 1, 9), num("s", 0, SURNAMES.length - 1), num("g", 0, GIVEN.length - 1), num("k", 0, CRAFTS.length - 1), num("b", 0, 9), num("x", 0, 1), num("l", 0, 999), num("r", 0, 99), num("n", 0, 9)];
  if (head === null || vals.some((v) => v === null) || old.length !== 4 || old.some((v) => !Number.isInteger(v) || v < 0 || v > 20) || old[0]! < 1) return null;
  const [place, du, tu, sur, given, craft, born, died, land, rooms, oxen] = vals as number[];
  if (died! > 0 && old[1]! + old[3]! === 0) return null;
  return { cat: cat.id, head, place: place!, du: du!, tu: tu!, sur: sur!, given: given!, craft: craft!, old: old as Household["old"], born: born!, died: died!, land: land!, rooms: rooms!, oxen: oxen! };
}

/**
 * "Me in the 1872 Jinshin koseki (壬申戸籍)" (time-slip season 3 #5).
 *
 * Sources (notes: /mnt/project-files/notes/timeslip-s3-jinshin-koseki-research.md):
 * - 戸籍法 (太政官布告第170号, 1871-04-04), in force 明治5年2月1日; first count dated 明治5年1月29日 (1872-03-08).
 * - Category totals from ja.wikipedia 壬申戸籍 (日本全国戸籍表): total 33,110,825.
 * - 寺・氏神 were entered until 1885; 華族・士族 recorded 禄高, 平民 農・工・商・雑 + trade.
 * - Sealed 1968-03-29 (民事局長通達 日民甲777号) because it was used to trace burakumin descent.
 * Deliberate exclusions (2026-11-22, content rule): 皇族 (29) and 樺太人員 (2,358, Sakhalin indigenous people) are not
 * drawn, and no discriminatory label is ever drawn — the page only explains why the register is sealed.
 * There is no national standard form; the entry layout is a reconstruction, and names, places, ages and the
 * 平民 occupation split (about 80% farming) are invented for the game.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };

export const TOTAL_1872 = 33110825;

export type Class = { id: "kazoku" | "shizoku" | "sotsu" | "jishi" | "so" | "ni" | "shinkan" | "heimin"; n: number; label: string; name: Six; life: Six };

export const CLASSES: Class[] = [
  {
    id: "heimin", n: 30837271, label: "平民",
    name: { ko: "평민", en: "Commoner (heimin)", ja: "平民", zh: "平民", fr: "Roturier (heimin)", es: "Plebeyo (heimin)" },
    life: { ko: "열 명 중 아홉 명 넘게가 평민이었어요. 농사·장사·수공업을 했고, 1870년에야 성(苗字)을 쓸 수 있게 됐어요. 성을 반드시 쓰게 된 건 1875년부터예요.", en: "More than nine in ten were commoners: farmers, merchants and craftspeople. They were allowed surnames only in 1870, and required to have one from 1875.", ja: "10人に9人以上が平民でした。農・商・工を営み、苗字を名乗れるようになったのは1870年、必ず名乗るよう定められたのは1875年です。", zh: "九成以上是平民，务农、经商或做工。1870年才获准使用姓氏，1875年起必须有姓。", fr: "Plus de neuf sur dix étaient roturiers : paysans, marchands, artisans. Autorisés à porter un nom en 1870, obligés en 1875.", es: "Más de nueve de cada diez eran plebeyos: campesinos, comerciantes y artesanos. Pudieron usar apellido en 1870 y fue obligatorio desde 1875." },
  },
  {
    id: "shizoku", n: 1282167, label: "士族",
    name: { ko: "사족 (옛 무사 집안)", en: "Shizoku (former samurai)", ja: "士族", zh: "士族（旧武士）", fr: "Shizoku (anciens samouraïs)", es: "Shizoku (antiguos samuráis)" },
    life: { ko: "칼을 찼던 무사 집안이 '사족'이 됐어요. 번이 사라져 나라에서 녹봉(家祿)을 받았지만, 몇 해 뒤 녹봉이 끊기면서 많은 집이 장사나 교사, 경찰로 살길을 찾아야 했어요.", en: "Former samurai families became shizoku. With the domains abolished they drew a state stipend, but within a few years it was ended and many turned to trade, teaching or the police.", ja: "刀を差した武士の家が士族になりました。藩がなくなり国から家禄を受けましたが、数年後に禄が打ち切られ、多くの家が商売や教師、巡査に道を探しました。", zh: "佩刀的武士家成为士族。废藩后由国家发放家禄，但几年后家禄被取消，许多人家转去经商、教书或当巡查。", fr: "Les familles de samouraïs deviennent shizoku, avec une pension d'État bientôt supprimée ; beaucoup se tournent vers le commerce, l'enseignement ou la police.", es: "Las familias samurái pasan a shizoku, con una pensión estatal pronto suprimida; muchos se dedican al comercio, la enseñanza o la policía." },
  },
  {
    id: "sotsu", n: 659074, label: "卒",
    name: { ko: "졸 (하급 무사)", en: "Sotsu (low-ranking retainers)", ja: "卒", zh: "卒（下级武士）", fr: "Sotsu (vassaux de bas rang)", es: "Sotsu (vasallos de bajo rango)" },
    life: { ko: "아시가루 같은 하급 무사는 '졸'로 따로 적혔어요. 이 구분은 오래가지 않아, 바로 그해 대부분 사족이나 평민으로 옮겨졌어요.", en: "Foot soldiers and other low retainers were listed separately as sotsu. The category did not last: the same year most were moved to shizoku or commoner.", ja: "足軽などの下級武士は卒として別に記されました。この区分は長続きせず、同じ年のうちに多くが士族か平民に編入されました。", zh: "足轻等下级武士另记为“卒”。这一类别很快取消，当年大多被编入士族或平民。", fr: "Les fantassins et petits vassaux étaient inscrits à part comme sotsu ; la catégorie disparut dès l'année même.", es: "Los soldados de a pie y vasallos menores figuraban como sotsu; la categoría desapareció ese mismo año." },
  },
  {
    id: "so", n: 211846, label: "僧",
    name: { ko: "승려", en: "Buddhist monk", ja: "僧", zh: "僧", fr: "Moine bouddhiste", es: "Monje budista" },
    life: { ko: "에도 시대에는 절이 주민 명부(宗門人別帳)를 맡았는데, 이제 나라가 직접 호적을 만들었어요. 신불분리로 절의 힘이 크게 줄던 때였어요.", en: "In the Edo period temples kept the population registers; now the state did it directly. Temples were losing ground fast as Shinto and Buddhism were forcibly separated.", ja: "江戸時代は寺が宗門人別帳を管理していましたが、今や国が直接戸籍を作ります。神仏分離で寺の力が大きく削がれていた頃でした。", zh: "江户时代由寺院管理宗门人别帐，如今国家直接编户籍。神佛分离之下，寺院势力大减。", fr: "À l'époque d'Edo, les temples tenaient les registres ; désormais l'État. La séparation forcée du shintō et du bouddhisme affaiblissait les temples.", es: "En la era Edo los templos llevaban los registros; ahora el Estado. La separación forzosa de sintoísmo y budismo debilitaba a los templos." },
  },
  {
    id: "shinkan", n: 102477, label: "旧神官",
    name: { ko: "신관 (신사의 신직)", en: "Shinto priest", ja: "旧神官", zh: "神官", fr: "Prêtre shintō", es: "Sacerdote sintoísta" },
    life: { ko: "신사를 지키던 집안이에요. 메이지 정부는 신도를 나라의 중심에 두려 했고, 호적에도 집집마다 모시는 수호신(氏神)을 적게 했어요.", en: "Families who kept the shrines. The Meiji state put Shinto at its centre, and even the koseki recorded each household's tutelary shrine.", ja: "神社を守ってきた家です。明治政府は神道を国の中心に据え、戸籍にも家ごとの氏神を記させました。", zh: "守护神社的家族。明治政府以神道为国家中心，户籍上也登记各户的氏神。", fr: "Familles gardiennes des sanctuaires ; le registre notait même le sanctuaire protecteur de chaque foyer.", es: "Familias guardianas de santuarios; el registro anotaba incluso el santuario protector de cada hogar." },
  },
  {
    id: "ni", n: 9621, label: "尼",
    name: { ko: "비구니", en: "Buddhist nun", ja: "尼", zh: "尼", fr: "Nonne bouddhiste", es: "Monja budista" },
    life: { ko: "전국에 1만 명이 채 안 되는 비구니가 따로 적혔어요. 아주 드문 결과예요.", en: "Fewer than ten thousand nuns were listed nationwide. A very rare result.", ja: "全国で1万人に満たない尼が別に記されました。とても珍しい結果です。", zh: "全国登记的尼姑不到一万人，非常罕见。", fr: "Moins de dix mille nonnes dans tout le pays : un résultat très rare.", es: "Menos de diez mil monjas en todo el país: un resultado muy raro." },
  },
  {
    id: "jishi", n: 3316, label: "地士",
    name: { ko: "지사 (향사 출신)", en: "Jishi (rural gentry)", ja: "地士", zh: "地士（乡士）", fr: "Jishi (notables ruraux)", es: "Jishi (notables rurales)" },
    life: { ko: "농촌에 살며 무사 대우를 받던 향사 출신이에요. 전국에 3,316명뿐이라 아주 드물어요.", en: "Rural gentry with samurai-like standing. Only 3,316 nationwide.", ja: "農村に住み武士の待遇を受けた郷士の出。全国で3,316人だけです。", zh: "居于乡间、享有武士待遇的乡士出身，全国仅3,316人。", fr: "Notables ruraux au rang quasi samouraï : 3 316 dans tout le pays.", es: "Notables rurales con rango casi samurái: 3.316 en todo el país." },
  },
  {
    id: "kazoku", n: 2666, label: "華族",
    name: { ko: "화족 (옛 공가·다이묘)", en: "Kazoku (peers)", ja: "華族", zh: "华族（旧公卿、大名）", fr: "Kazoku (pairs)", es: "Kazoku (nobleza)" },
    life: { ko: "옛 궁정 귀족과 다이묘 집안이에요. 전국에 2,666명, 1만 2천 명 중 한 명꼴이에요. 도쿄에 살도록 정해졌어요.", en: "Former court nobles and daimyo families: 2,666 people, about one in 12,000. They were required to live in Tokyo.", ja: "旧公家と大名の家。全国2,666人、約1万2千人に1人。東京に住むよう定められました。", zh: "旧公卿和大名家族，共2,666人，约一万二千人中一人，规定须住东京。", fr: "Anciens nobles de cour et daimyos : 2 666 personnes, tenues de vivre à Tokyo.", es: "Antiguos nobles y daimios: 2.666 personas, obligadas a vivir en Tokio." },
  },
];

export const DRAW_TOTAL = CLASSES.reduce((s, c) => s + c.n, 0);
export const classById = (id: string) => CLASSES.find((c) => c.id === id) ?? null;
export const oneIn = (c: Class) => Math.max(1, Math.round(DRAW_TOTAL / c.n));

export function drawClass(rand: () => number = Math.random): Class {
  let x = rand() * DRAW_TOTAL;
  for (const c of CLASSES) {
    if (x < c.n) return c;
    x -= c.n;
  }
  return CLASSES[CLASSES.length - 1]!;
}

/** 平民 occupations, weights invented around "roughly 80% farming" (1879 Yamanashi: 83%). */
export const TRADES: { w: number; text: string }[] = [
  { w: 80, text: "農" }, { w: 8, text: "商 呉服商" }, { w: 6, text: "工 大工職" }, { w: 6, text: "雑業 日雇" },
];

const PLACES = ["武蔵国足立郡", "相模国高座郡", "近江国蒲生郡", "摂津国島上郡", "越後国蒲原郡", "肥後国飽田郡", "陸奥国伊達郡", "備中国窪屋郡", "信濃国佐久郡", "土佐国香美郡"];
const VILLAGES = ["中村", "上野村", "新田村", "大川村", "北原村", "川口村"];
const SURNAMES = ["鈴木", "佐藤", "田中", "高橋", "渡辺", "伊藤", "中村", "小林", "山本", "加藤"];
const MEN = ["太郎吉", "源蔵", "清兵衛", "与助", "茂七", "善右衛門", "藤吉", "勘助"];
const WOMEN = ["とめ", "きく", "まつ", "はな", "よね", "さく", "いと", "ふさ"];
const SECTS = ["浄土真宗 西念寺", "曹洞宗 長松寺", "日蓮宗 妙法寺", "浄土宗 光明寺", "真言宗 金剛寺"];
const SHRINES = ["八幡社", "稲荷社", "天満宮", "諏訪社", "日吉社"];

export type House = { cls: Class["id"]; place: number; village: number; daiku: number; shoku: number; sur: number; head: number; wife: number; age: number; kids: number; trade: number; sect: number; shrine: number; roku: number };

export function makeHouse(cls: Class, rand: () => number = Math.random): House {
  const i = (n: number) => Math.floor(rand() * n);
  let x = rand() * 100, trade = 0;
  for (let k = 0; k < TRADES.length; k += 1) {
    if (x < TRADES[k]!.w) { trade = k; break; }
    x -= TRADES[k]!.w;
  }
  return { cls: cls.id, place: i(PLACES.length), village: i(VILLAGES.length), daiku: 1 + i(9), shoku: 1 + i(9), sur: i(SURNAMES.length), head: i(MEN.length), wife: i(WOMEN.length), age: 22 + i(40), kids: i(5), trade, sect: i(SECTS.length), shrine: i(SHRINES.length), roku: 5 + i(30) };
}

const KD = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
/** Kanji numerals as written in Meiji registers (拾 for ten), 1–99. */
export function kanji(n: number): string {
  if (n <= 0) return "〇";
  const t = Math.floor(n / 10), u = n % 10;
  return (t ? (t === 1 ? "" : KD[t]) + "拾" : "") + KD[u];
}

export type Entry = { address: string; status: string; head: string; wife: string; children: string; temple: string; shrine: string };

export function entryOf(h: House): Entry {
  const c = classById(h.cls)!;
  const religious = h.cls === "so" || h.cls === "ni";
  const job = h.cls === "heimin" ? TRADES[h.trade]!.text : h.cls === "kazoku" || h.cls === "shizoku" || h.cls === "sotsu" ? `家禄 ${kanji(h.roku)}石` : h.cls === "shinkan" ? `${SHRINES[h.shrine]} 祠官` : h.cls === "jishi" ? "農" : "住職";
  const name = h.cls === "ni" ? `${WOMEN[h.wife]}尼` : `${SURNAMES[h.sur]}${MEN[h.head]}`;
  return {
    address: `${PLACES[h.place]} 第${kanji(h.daiku)}大区${kanji(h.shoku)}小区 ${VILLAGES[h.village]}`,
    status: `${c.label} ${job}`,
    head: `戸主 ${name} 年${kanji(h.age)}`,
    wife: religious ? "" : `妻 ${WOMEN[h.wife]} 年${kanji(Math.max(18, h.age - 3))}`,
    children: religious || !h.kids ? "" : `子 ${h.kids === 1 ? "一人" : kanji(h.kids) + "人"}`,
    temple: h.cls === "shinkan" ? "神葬" : religious ? SECTS[h.sect]! : `寺 ${SECTS[h.sect]}`,
    shrine: `氏神 ${SHRINES[h.shrine]}`,
  };
}

const FIELDS = ["place", "village", "daiku", "shoku", "sur", "head", "wife", "age", "kids", "trade", "sect", "shrine", "roku"] as const;
const MAX: Record<(typeof FIELDS)[number], [number, number]> = { place: [0, PLACES.length - 1], village: [0, VILLAGES.length - 1], daiku: [1, 9], shoku: [1, 9], sur: [0, SURNAMES.length - 1], head: [0, MEN.length - 1], wife: [0, WOMEN.length - 1], age: [15, 99], kids: [0, 9], trade: [0, TRADES.length - 1], sect: [0, SECTS.length - 1], shrine: [0, SHRINES.length - 1], roku: [1, 99] };

export function formatJinshin(h: House): string {
  return new URLSearchParams({ c: h.cls, v: FIELDS.map((f) => h[f]).join(".") }).toString();
}

export function parseJinshin(search: string): House | null {
  const q = new URLSearchParams(search);
  const cls = classById(q.get("c") ?? "");
  const vals = (q.get("v") ?? "").split(".").map(Number);
  if (!cls || vals.length !== FIELDS.length) return null;
  const h: Record<string, number | string> = { cls: cls.id };
  for (let k = 0; k < FIELDS.length; k += 1) {
    const f = FIELDS[k]!, v = vals[k]!, [lo, hi] = MAX[f];
    if (!Number.isInteger(v) || v < lo || v > hi) return null;
    h[f] = v;
  }
  return h as unknown as House;
}

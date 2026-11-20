/**
 * "江戸の人別帳の中の私" — draw a status by the Edo-period shares and write your own 宗門人別改帳 line.
 *
 * Shares (日本大百科全書「江戸時代」, 佐々木潤之介, via kotobank): 士 5–6%, 農 80–85%, 工 ~3%, 商 ~6%,
 * 賤民 ~1.7%, 神官・僧尼 ~1%. We use the midpoints as weights (‰), so they sum to 997 rather than 1,000.
 * Register facts (世界大百科事典・山川日本史小辞典・マイペディア via kotobank): head of house first, then family,
 * servants; each person tied to a 檀那寺 whose seal certified they were not Christian; 持高 and status
 * (<百姓><水呑>) on the head's line; earliest form 1634 (平戸町); shogunate order to all domains 1671 (寛文11);
 * in principle yearly; replaced by the 1871 戸籍法 / 1872 壬申戸籍.
 * The name, temple and holding on the generated line are invented for the game, never presented as real.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type StatusId = "samurai" | "hyakusho" | "shokunin" | "shonin" | "shukyo" | "senmin";
export type Sex = "m" | "f";

export type Status = { id: StatusId; permille: number; jaLabel: string; name: Six; life: Six };

export const STATUSES: Status[] = [
  {
    id: "hyakusho", permille: 825, jaLabel: "百姓",
    name: { ko: "백성(농민)", en: "Farmer (hyakushō)", ja: "百姓", zh: "百姓（农民）", fr: "Paysan (hyakushō)", es: "Campesino (hyakushō)" },
    life: { ko: "열 명 중 여덟 명이 이 신분이에요. 마을 인별장에는 '백성' 또는 땅이 없는 '미즈노미(水呑)'로 적히고, 가진 땅의 소출(持高)이 함께 적혀요.", en: "Eight in ten people. You are entered as hyakushō, or mizunomi if landless, with your holding in koku beside the head of house.", ja: "十人に八人がこの身分。人別帳には〈百姓〉あるいは土地を持たない〈水呑〉と書かれ、戸主の欄に持高が添えられます。", zh: "十人中有八人属此身份。人别帐上记为“百姓”，无地者记为“水吞”，户主栏注明持高。", fr: "Huit personnes sur dix. Inscrit comme hyakushō, ou mizunomi sans terre, avec la récolte de vos champs.", es: "Ocho de cada diez. Inscrito como hyakushō, o mizunomi si no tienes tierra, con la cosecha de tus campos." },
  },
  {
    id: "shonin", permille: 60, jaLabel: "商人",
    name: { ko: "상인", en: "Merchant", ja: "商人", zh: "商人", fr: "Marchand", es: "Comerciante" },
    life: { ko: "에도·오사카 같은 큰 도시의 조닌(町人)이에요. 1723년 에도의 조닌만 52만 6천 명, 무사까지 합치면 약 100만 명이 사는 도시였어요.", en: "A townsman of Edo or Osaka. In 1723 Edo had 526,000 townspeople, about a million with the samurai.", ja: "江戸や大坂の町人。1723年の江戸は町人だけで52万6000人、武士を含めると約100万人の都市でした。", zh: "江户、大坂的町人。1723年江户仅町人就有52.6万，连武士约百万人。", fr: "Citadin d'Edo ou d'Osaka : en 1723, Edo comptait 526 000 citadins, un million avec les samouraïs.", es: "Habitante de Edo u Osaka: en 1723 Edo tenía 526.000 vecinos, un millón con los samuráis." },
  },
  {
    id: "samurai", permille: 55, jaLabel: "武士",
    name: { ko: "무사(사무라이)", en: "Samurai", ja: "武士", zh: "武士", fr: "Samouraï", es: "Samurái" },
    life: { ko: "인구의 5~6%뿐인 지배 신분이에요. 칼을 차고 주군을 섬기며 녹봉으로 살아요.", en: "Only 5–6% of the people: the ruling class, serving a lord and living on a stipend.", ja: "人口の5～6%にすぎない支配身分。主君に仕え、禄で暮らします。", zh: "仅占人口5～6%的统治身份，侍奉主君，以俸禄为生。", fr: "5 à 6 % de la population : la classe dirigeante, au service d'un seigneur.", es: "Solo el 5–6 %: la clase dirigente, al servicio de un señor." },
  },
  {
    id: "shokunin", permille: 30, jaLabel: "職人",
    name: { ko: "장인", en: "Artisan", ja: "職人", zh: "工匠", fr: "Artisan", es: "Artesano" },
    life: { ko: "목수·대장장이·염색공처럼 손기술로 사는 사람이에요. 인구의 3% 안팎이었어요.", en: "A carpenter, smith or dyer living by your hands: about 3% of the people.", ja: "大工・鍛冶・染物師など手の技で生きる人。人口の3%前後でした。", zh: "木匠、铁匠、染匠等靠手艺为生的人，约占人口3%。", fr: "Charpentier, forgeron ou teinturier : environ 3 % de la population.", es: "Carpintero, herrero o tintorero: un 3 % de la población." },
  },
  {
    id: "senmin", permille: 17, jaLabel: "（被差別身分）",
    name: { ko: "차별받던 신분", en: "Outcast status", ja: "被差別身分", zh: "受歧视的身份", fr: "Statut de paria", es: "Estatus de paria" },
    life: { ko: "인구의 1.7% 안팎이 제도로 차별받는 신분에 묶여 있었어요. 이 차별은 신분의 이름이 없어진 뒤에도 오래 남았고, 지금도 지워야 할 역사예요.", en: "About 1.7% were bound to a status of legal discrimination. The prejudice outlived the system and is still being undone today.", ja: "人口の1.7%前後が、制度として差別される身分に置かれていました。この差別は制度がなくなった後も長く残り、いまも向き合うべき歴史です。", zh: "约1.7%的人被制度性地划为受歧视身份。这种歧视在制度废除后仍长期存在，至今仍需面对。", fr: "Environ 1,7 % étaient assignés à un statut discriminé ; ce préjugé a survécu au système.", es: "Cerca del 1,7 % estaba sujeto a un estatus discriminado; el prejuicio sobrevivió al sistema." },
  },
  {
    id: "shukyo", permille: 10, jaLabel: "僧",
    name: { ko: "신관·승려", en: "Priest or monk", ja: "神官・僧尼", zh: "神官·僧尼", fr: "Prêtre ou moine", es: "Sacerdote o monje" },
    life: { ko: "인구의 1% 안팎. 승려라면 바로 그 인별장에 도장을 찍어 마을 사람들이 기독교인이 아님을 보증해 주는 쪽이에요.", en: "About 1%. As a temple monk you are the one stamping the register to certify your parishioners are not Christian.", ja: "人口の1%前後。僧侶なら、まさに人別帳に印を押して檀家がキリシタンでないことを請け合う側です。", zh: "约占1%。若是僧人，你正是在人别帐上盖印、担保檀家不是基督徒的一方。", fr: "Environ 1 %. Moine, c'est vous qui tamponnez le registre pour certifier que vos fidèles ne sont pas chrétiens.", es: "Cerca del 1 %. Como monje, eres quien sella el registro para certificar que tus fieles no son cristianos." },
  },
];

export const TOTAL_PERMILLE = STATUSES.reduce((s, x) => s + x.permille, 0);

export function drawStatus(rand: () => number = Math.random): Status {
  let k = rand() * TOTAL_PERMILLE;
  for (const s of STATUSES) {
    if (k < s.permille) return s;
    k -= s.permille;
  }
  return STATUSES[0];
}

export const statusById = (id: string) => STATUSES.find((s) => s.id === id) ?? null;
export const oneIn = (s: Status) => Math.max(1, Math.round(TOTAL_PERMILLE / s.permille));

/** Common Edo-period given names, for the invented register line. */
export const NAMES: Record<Sex, string[]> = {
  m: ["太郎兵衛", "甚兵衛", "吉兵衛", "八右衛門", "与惣次", "源七", "伊之助", "長五郎", "清八", "善六"],
  f: ["きく", "はる", "よね", "とめ", "まつ", "うめ", "たけ", "さよ", "いと", "ふさ"],
};
export const TEMPLES = ["浄土真宗 西光寺", "浄土宗 長福寺", "曹洞宗 龍泉寺", "臨済宗 正覚寺", "日蓮宗 妙法寺", "真言宗 宝積寺"];

export type Entry = { status: StatusId; sex: Sex; name: string; temple: string; age: number; koku: number | null };

export function makeEntry(status: Status, sex: Sex, age: number, rand: () => number = Math.random): Entry {
  const pickOf = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const koku = status.id === "hyakusho" ? Math.round((1 + rand() * 14) * 10) / 10 : null;
  return { status: status.id, sex, name: pickOf(NAMES[sex]), temple: pickOf(TEMPLES), age, koku };
}

const KANJI = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
/** 34 → 三十四, 10 → 十, 7 → 七 (register style). */
export function kanjiAge(n: number): string {
  if (n <= 0) return "〇";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${t > 1 ? KANJI[t] : ""}${t >= 1 ? "十" : ""}${o ? KANJI[o] : ""}`;
}

/** 7.3 → 七石三斗, 12 → 十二石 (1 石 = 10 斗). */
export function kanjiKoku(k: number): string {
  const whole = Math.floor(k);
  const to = Math.round((k - whole) * 10);
  return `${whole ? kanjiAge(whole) + "石" : ""}${to ? KANJI[to] + "斗" : ""}` || "〇石";
}

export function formatNinbetsu(e: Entry): string {
  const q = new URLSearchParams({ s: e.status, x: e.sex, n: String(NAMES[e.sex].indexOf(e.name)), t: String(TEMPLES.indexOf(e.temple)), a: String(e.age) });
  if (e.koku !== null) q.set("k", String(e.koku));
  return q.toString();
}

export function parseNinbetsu(search: string): Entry | null {
  const q = new URLSearchParams(search);
  const s = statusById(q.get("s") ?? "");
  const x = q.get("x");
  if (!s || (x !== "m" && x !== "f")) return null;
  const name = NAMES[x][Number(q.get("n"))];
  const temple = TEMPLES[Number(q.get("t"))];
  const age = Number(q.get("a"));
  if (!name || !temple || !Number.isInteger(age) || age < 0 || age > 120) return null;
  const k = q.get("k");
  return { status: s.id, sex: x, name, temple, age, koku: s.id === "hyakusho" && k ? Number(k) : null };
}

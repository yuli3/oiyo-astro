/**
 * "Me in Domesday Book" — William I's survey of England, 1086.
 *
 * Sources:
 * - Wikipedia "Domesday Book": 13,418 places; 268,984 people tallied, each a head of household; H. C. Darby puts
 *   England at 1.2–1.6 million; 28,000 slaves, fewer than in 1066; 5,624 mills; the Anglo-Saxon Chronicle's
 *   "not even an ox, nor a cow, nor a swine"; Little Domesday = Norfolk, Suffolk, Essex; the far north, London
 *   and Winchester left out; "Domesday" = day of judgement.
 * - Class shares (H. C. Darby, Domesday England, 1977): villans 40.6%, bordars 30.4%, slaves 10.5%, sokemen 8.7%,
 *   freemen 5.0%, cottars 1.9%; the remaining 2.9% are burgesses, priests and others. Villans/cottars/slaves/
 *   sokemen/freemen percentages also quoted in J. P. Collins, "The Domesday Book" (2026).
 * - Holdings: villans 15–60 acres, bordars 5–10 (K. Bailey, Vauxhall History); cottars 1–5 acres (Collins).
 * Peasants were counted, not named. The manor, its numbers and values on the generated entry are invented, in the
 * style of the Phillimore translation.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type ClassId = "villan" | "bordar" | "slave" | "sokeman" | "freeman" | "other" | "cottar";

export const RECORDED = 268984;
export const PLACES = 13418;
export const MILLS = 5624;

export type DClass = { id: ClassId; permille: number; plural: string; name: Six; life: Six };

export const CLASSES: DClass[] = [
  {
    id: "villan", permille: 406, plural: "villagers",
    name: { ko: "빌런(마을 농민)", en: "Villan (villager)", ja: "ヴィラン（村の農民）", zh: "维兰（村民）", fr: "Vilain", es: "Villano (aldeano)" },
    life: { ko: "기록된 사람 열 명 중 네 명이에요. 마을 들판에 15~60에이커쯤 몫을 갖고, 대신 영주의 땅에서 일을 해 줘야 했어요. 쟁기를 끌 소도 함께 부렸어요.", en: "Four in ten of everyone recorded. You hold a share of the village fields, often 15–60 acres, and owe work on the lord's land; you help put a plough team in the field.", ja: "記録された人の10人に4人。村の畑に15～60エーカーほどの持ち分を持ち、その代わりに領主の土地で働く義務があります。", zh: "占记录人口的十分之四。在村里田地中有约15至60英亩的份地，作为交换要为领主耕作。", fr: "Quatre sur dix des personnes recensées : une part des champs (15 à 60 acres) contre des corvées pour le seigneur.", es: "Cuatro de cada diez registrados: una parte de los campos (15 a 60 acres) a cambio de trabajar las tierras del señor." },
  },
  {
    id: "bordar", permille: 304, plural: "smallholders",
    name: { ko: "보더(작은 땅 농민)", en: "Bordar (smallholder)", ja: "ボーダー（小農）", zh: "小农（bordar）", fr: "Bordier", es: "Bordero (pequeño campesino)" },
    life: { ko: "열 명 중 세 명. 5~10에이커쯤 되는 작은 땅을 부치며, 모자라는 몫은 남의 일을 거들어 채웠어요.", en: "Three in ten. A small plot of about 5–10 acres, topped up by working for others.", ja: "10人に3人。5～10エーカーほどの小さな土地を耕し、足りない分は人の仕事を手伝って補いました。", zh: "约占十分之三。耕种约5至10英亩的小块地，不够的靠替人干活补足。", fr: "Trois sur dix : un petit lopin de 5 à 10 acres, complété par du travail pour autrui.", es: "Tres de cada diez: una parcela de 5 a 10 acres, completada trabajando para otros." },
  },
  {
    id: "slave", permille: 105, plural: "slaves",
    name: { ko: "노예(세르부스)", en: "Slave (servus)", ja: "奴隷（セルウス）", zh: "奴隶（servus）", fr: "Esclave (servus)", es: "Esclavo (servus)" },
    life: { ko: "1086년 잉글랜드에 기록된 노예는 약 2만 8천 명, 열 명 중 한 명이었어요. 땅이 없고, 주인의 재산으로 사고팔렸어요. 1066년보다는 수가 줄어든 때였어요.", en: "About 28,000 recorded slaves, one in ten: no land of your own, the lord's property, bought and sold. Already fewer than in 1066.", ja: "1086年のイングランドに記録された奴隷は約2万8千人、10人に1人。土地を持たず、主人の財産として売買されました。1066年より数は減っていました。", zh: "1086年英格兰记录在册的奴隶约2.8万人，占十分之一。没有土地，是主人的财产，可被买卖。人数已比1066年少。", fr: "Environ 28 000 esclaves recensés, un sur dix : sans terre, propriété du seigneur, vendus et achetés. Déjà moins qu'en 1066.", es: "Unos 28.000 esclavos registrados, uno de cada diez: sin tierra, propiedad del señor, comprados y vendidos. Ya menos que en 1066." },
  },
  {
    id: "sokeman", permille: 87, plural: "Sokemen",
    name: { ko: "소크맨(자유 농민)", en: "Sokeman", ja: "ソークマン（自由農民）", zh: "索克曼（自由农）", fr: "Sokeman", es: "Sokeman (campesino libre)" },
    life: { ko: "법적으로 자유롭고 자기 땅이 있지만 어느 영주의 법정(소크)에 매여 있어요. 주로 옛 데인로 지역인 동부 잉글랜드에 많았어요.", en: "Legally free with land of your own, but bound to a lord's court, the soke. Most lived in the old Danelaw of eastern England.", ja: "法的に自由で自分の土地を持つが、領主の裁判権（ソーク）に結びついています。主に東部の旧デーンロウ地域に多くいました。", zh: "法律上自由、有自己的土地，但隶属某领主的法庭（soke）。多见于英格兰东部的旧丹麦法区。", fr: "Libre et propriétaire, mais rattaché à la cour d'un seigneur (la soke). Surtout dans l'ancien Danelaw.", es: "Libre y con tierra propia, pero ligado al tribunal de un señor (la soke). Sobre todo en el antiguo Danelaw." },
  },
  {
    id: "freeman", permille: 50, plural: "free men",
    name: { ko: "자유인(리베르 호모)", en: "Free man (liber homo)", ja: "自由人（リベル・ホモ）", zh: "自由人（liber homo）", fr: "Homme libre (liber homo)", es: "Hombre libre (liber homo)" },
    life: { ko: "온전히 자유로운 땅 주인이에요. 노퍽·서퍽 같은 동부에 몰려 있어서, 이 지역을 자세히 적은 '리틀 둠즈데이'에 많이 나와요.", en: "A fully free landholder. You cluster in Norfolk and Suffolk, so you fill the pages of Little Domesday.", ja: "完全に自由な土地保有者。ノーフォークやサフォークに多く、それらを詳しく記した「リトル・ドゥームズデイ」によく登場します。", zh: "完全自由的土地持有者，集中在诺福克、萨福克一带，因此常见于详记这些郡的《小末日审判书》。", fr: "Propriétaire pleinement libre, surtout en Norfolk et Suffolk : vous remplissez le Little Domesday.", es: "Propietario plenamente libre, sobre todo en Norfolk y Suffolk: llenas las páginas del Little Domesday." },
  },
  {
    id: "other", permille: 29, plural: "priests",
    name: { ko: "사제·도시민 등", en: "Priest, burgess or other", ja: "司祭・町人など", zh: "神父、市民等", fr: "Prêtre, bourgeois ou autre", es: "Sacerdote, burgués u otro" },
    life: { ko: "나머지 3% 안팎이에요. 마을 교회의 사제, 도시(버러)의 주민, 그 밖의 드문 신분이 여기에 들어요.", en: "The last 3% or so: the village priest, townsmen (burgesses) of the boroughs, and rarer kinds.", ja: "残りの3%前後。村の教会の司祭、町（バラ）の住民、そのほかの珍しい身分です。", zh: "剩下约3%：村教堂的神父、城镇（borough）居民以及其他少见的身份。", fr: "Les 3 % restants : le prêtre du village, les bourgeois des villes et d'autres plus rares.", es: "El 3 % restante: el cura del pueblo, los burgueses de las villas y otros más raros." },
  },
  {
    id: "cottar", permille: 19, plural: "cottagers",
    name: { ko: "코터(오두막 농민)", en: "Cottar (cottager)", ja: "コッター（小屋住み農民）", zh: "茅舍农（cottar）", fr: "Cottier", es: "Cotario" },
    life: { ko: "오두막과 1~5에이커쯤의 아주 작은 땅. 기록된 사람의 2% 남짓이에요.", en: "A cottage and a scrap of land, about 1–5 acres: some 2% of those recorded.", ja: "小屋と1～5エーカーほどのごく小さな土地。記録された人の2%あまりです。", zh: "一间茅舍和约1至5英亩的小块地，约占记录人口的2%。", fr: "Une chaumière et 1 à 5 acres : environ 2 % des recensés.", es: "Una cabaña y 1 a 5 acres: un 2 % de los registrados." },
  },
];

export const TOTAL_PERMILLE = CLASSES.reduce((s, c) => s + c.permille, 0);
export const classById = (id: string) => CLASSES.find((c) => c.id === id) ?? null;
export const oneIn = (c: DClass) => Math.max(1, Math.round(TOTAL_PERMILLE / c.permille));

export function drawClass(rand: () => number = Math.random): DClass {
  let x = rand() * TOTAL_PERMILLE;
  for (const c of CLASSES) {
    if (x < c.permille) return c;
    x -= c.permille;
  }
  return CLASSES[0];
}

export const MANORS = ["Ashby", "Newton", "Stoke", "Sutton", "Bradley", "Norton", "Thorpe", "Wootton", "Acton", "Hatfield"];
const ANY = ["Kent", "Sussex", "Hampshire", "Wiltshire", "Somerset", "Devon", "Oxfordshire", "Gloucestershire", "Worcestershire", "Warwickshire", "Northamptonshire", "Buckinghamshire"];
/** Sokemen and free men cluster in the east; the rest can be anywhere surveyed. */
export const COUNTIES: Record<ClassId, string[]> = {
  villan: ANY, bordar: ANY, slave: ["Gloucestershire", "Herefordshire", "Devon", "Cornwall", "Somerset", "Worcestershire"], cottar: ANY, other: ANY,
  sokeman: ["Lincolnshire", "Nottinghamshire", "Leicestershire", "Norfolk", "Suffolk"],
  freeman: ["Norfolk", "Suffolk", "Essex"],
};

export type Manor = { cls: ClassId; m: number; c: number; hides: number; ploughs: number; villan: number; bordar: number; slave: number; extra: number; meadow: number; mill: number; then: number; now: number };

export function makeManor(cls: DClass, rand: () => number = Math.random): Manor {
  const r = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  const villan = r(4, 14), bordar = r(2, 10), slave = r(0, 5);
  const then = r(2, 10);
  return {
    cls: cls.id, m: r(0, MANORS.length - 1), c: r(0, COUNTIES[cls.id].length - 1), hides: r(1, 6), ploughs: r(3, 12),
    villan: villan + (cls.id === "villan" ? 1 : 0), bordar: bordar + (cls.id === "bordar" ? 1 : 0), slave: slave + (cls.id === "slave" ? 1 : 0),
    extra: ["sokeman", "freeman", "cottar", "other"].includes(cls.id) ? r(1, 6) : 0,
    meadow: r(2, 30), mill: rand() < 0.5 ? r(2, 20) : 0, then, now: then + r(-2, 3),
  };
}

const hideWord = (n: number) => (n === 1 ? "1 hide" : `${n} hides`);

/** The entry in the manner of the Phillimore translation (English for every locale: that is the edition people read). */
export function entryOf(x: Manor): { place: string; text: string; count: number } {
  const cls = classById(x.cls)!;
  const place = `${MANORS[x.m]}, ${COUNTIES[x.cls][x.c]}`;
  const people = [`${x.villan} villagers`, `${x.bordar} smallholders`];
  let count = x.cls === "villan" ? x.villan : x.cls === "bordar" ? x.bordar : x.cls === "slave" ? x.slave : x.extra;
  if (x.cls === "other") {
    count = 1;
    people.push("a priest");
  } else if (x.extra) people.push(`${x.extra} ${cls.plural}`);
  const slaves = x.slave ? ` and ${x.slave} slave${x.slave > 1 ? "s" : ""}` : "";
  const text = [
    `In ${MANORS[x.m].toUpperCase()} the lord holds ${hideWord(x.hides)}. Land for ${x.ploughs} ploughs.`,
    `${people.join(", ")}${slaves}.`,
    `Meadow, ${x.meadow} acres.${x.mill ? ` A mill at ${x.mill}s.` : ""}`,
    `Value before 1066 £${x.then}; now £${Math.max(1, x.now)}.`,
  ].join(" ");
  return { place, text, count };
}

export function formatDomesday(x: Manor): string {
  return new URLSearchParams(Object.entries(x).map(([k, v]) => [k, String(v)])).toString();
}

export function parseDomesday(search: string): Manor | null {
  const q = new URLSearchParams(search);
  const cls = classById(q.get("cls") ?? "");
  if (!cls) return null;
  const keys = ["m", "c", "hides", "ploughs", "villan", "bordar", "slave", "extra", "meadow", "mill", "then", "now"] as const;
  const out: Record<string, number> = {};
  for (const k of keys) {
    const v = Number(q.get(k));
    if (!Number.isInteger(v) || v < -5 || v > 60) return null;
    out[k] = v;
  }
  if (out.m < 0 || out.m >= MANORS.length || out.c < 0 || out.c >= COUNTIES[cls.id].length) return null;
  return { cls: cls.id, ...(out as Omit<Manor, "cls">) };
}

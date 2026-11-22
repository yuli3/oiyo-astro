/**
 * "Me in the 1911 census of England and Wales" (time-slip season 3 #3). Census night: Sunday 2 April 1911.
 *
 * Sources (notes: /mnt/project-files/notes/timeslip-s3-census-1911-research.md):
 * - Vision of Britain, 1911 occupational orders by sex, England and Wales, persons aged 10+ (OCC_ORD1911_SEX).
 *   Occupied about 11.43 million males and 4.83 million females; about 10.03 million females were returned
 *   without an occupation. "other" is the remainder (commerce, professions, public service, paper, chemicals…).
 * - IPUMS image of the 1911 household schedule (16 columns, incl. the fertility questions for married women).
 * - The National Archives blog "No vote, no census" and UK Parliament (Emily Wilding Davison, "Found hiding in crypt
 *   of Westminster Hall"); Princess Sophia Duleep Singh's "No vote, no census" schedule.
 * Men without an occupation (schoolboys, retired) are left out: the table does not give their number.
 * Names, places, ages, children and households on the generated line are invented for the game.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type Sex = "m" | "f";

export const POPULATION_EW = 36070000;

export type Order = {
  id: string;
  /** Thousands, males and females aged 10+. */
  m: number;
  f: number;
  jobs: { m: string[]; f: string[] };
  industry: string;
  name: Six;
  life: Six;
};

const M_OCC = 11430;
const F_OCC = 4830;
const F_NONE = 10030;

const ORDERS_BASE: Order[] = [
  {
    id: "domestic", m: 388, f: 1734, industry: "Domestic service", jobs: { m: ["Butler", "Footman", "Groom", "Gardener (domestic)"], f: ["General servant (domestic)", "Housemaid", "Cook (domestic)", "Kitchenmaid", "Nursemaid", "Charwoman"] },
    name: { ko: "하인·하녀 (가사 서비스)", en: "Domestic service", ja: "家事使用人", zh: "家仆（家政服务）", fr: "Domesticité", es: "Servicio doméstico" },
    life: { ko: "일하는 여성 세 명 중 한 명 이상이 남의 집 하녀였어요. 새벽 6시 전에 일어나 불을 피우고, 한 달에 한나절 남짓 쉬었어요. 조사표에는 주인집 식구 아래 'Servant'로 적혔어요.", en: "More than one working woman in three was in service. Up before six to lay the fires, a half-day off now and then, and on the census form listed below the family as 'Servant'.", ja: "働く女性の3人に1人以上がメイドでした。6時前に起きて火をおこし、休みはたまの半日。調査票では主人一家の下に「Servant」と書かれました。", zh: "每三个职业女性中就有一个以上是女佣。六点前起床生火，偶尔才有半天假；在普查表上排在主人一家下面，写作“Servant”。", fr: "Plus d'une travailleuse sur trois était domestique : levée avant six heures pour les feux, une demi-journée de repos de temps en temps, inscrite sous la famille comme « Servant ».", es: "Más de una de cada tres trabajadoras servía en casas: en pie antes de las seis para encender el fuego, medio día libre de vez en cuando, y en el censo bajo la familia como «Servant»." },
  },
  {
    id: "metals", m: 1477, f: 101, industry: "Engineering", jobs: { m: ["Fitter (engineering)", "Boilermaker", "Iron moulder", "Steel smelter", "Turner", "Blacksmith"], f: ["Machinist (metal)", "Pen maker", "Nail maker"] },
    name: { ko: "금속·기계 노동자", en: "Metals and machines", ja: "金属・機械の労働者", zh: "金属与机械工人", fr: "Métaux et machines", es: "Metales y máquinas" },
    life: { ko: "1911년 남자 직업 1위 무리예요. 셰필드의 제강소, 버밍엄의 작은 공방, 조선소의 보일러를 만드는 사람들이에요. 세계의 공장 영국을 받치던 손이었죠.", en: "The biggest group of working men in 1911: Sheffield steel, Birmingham workshops, shipyard boilers. The hands behind the workshop of the world.", ja: "1911年の男性の職業で最大の集団。シェフィールドの製鋼所、バーミンガムの工房、造船所のボイラー。「世界の工場」を支えた手です。", zh: "1911年男性人数最多的职业类别：谢菲尔德的钢厂、伯明翰的作坊、造船厂的锅炉。是撑起“世界工厂”的双手。", fr: "Premier groupe d'hommes au travail en 1911 : aciéries de Sheffield, ateliers de Birmingham, chaudières des chantiers navals.", es: "El mayor grupo de hombres en 1911: acero de Sheffield, talleres de Birmingham, calderas de los astilleros." },
  },
  {
    id: "transport", m: 1399, f: 24, industry: "Railway", jobs: { m: ["Railway porter", "Carter", "Dock labourer", "Engine driver", "Tram conductor", "Seaman"], f: ["Tram conductor", "Railway clerk"] },
    name: { ko: "운송 노동자", en: "Transport", ja: "運輸の労働者", zh: "运输工人", fr: "Transports", es: "Transporte" },
    life: { ko: "기차·마차·전차·부두를 움직인 사람들이에요. 철도에서만 54만 명이 일했고, 말이 끄는 짐마차를 모는 '카터'도 여전히 흔했어요.", en: "Trains, carts, trams and docks: 543,000 worked for the railways alone, and horse-drawn carters were still everywhere.", ja: "汽車・荷馬車・路面電車・港を動かした人々。鉄道だけで54万人が働き、馬の荷車を引く「カーター」もまだあちこちにいました。", zh: "让火车、马车、电车和码头运转的人。仅铁路就有54万人，赶马车的车夫也随处可见。", fr: "Trains, charrettes, tramways et docks : 543 000 cheminots, et des charretiers partout.", es: "Trenes, carros, tranvías y muelles: 543.000 ferroviarios, y carreteros por todas partes." },
  },
  {
    id: "agriculture", m: 1141, f: 95, industry: "Agriculture", jobs: { m: ["Farm labourer", "Cowman", "Shepherd", "Farmer", "Ploughman", "Horseman on farm"], f: ["Dairymaid", "Farmer's daughter (assisting)", "Farm labourer"] },
    name: { ko: "농업 노동자", en: "Agriculture", ja: "農業の労働者", zh: "农业劳动者", fr: "Agriculture", es: "Agricultura" },
    life: { ko: "한때 나라의 중심이던 농사가 1911년엔 남자 직업 셋째로 밀렸어요. 많은 젊은이가 마을을 떠나 도시와 식민지로 갔어요.", en: "Once the heart of the country, farming was only the third-largest male occupation by 1911; many young people left for the towns and the colonies.", ja: "かつて国の中心だった農業は、1911年には男性の職業で3番目に。若者の多くが村を出て都市や植民地へ向かいました。", zh: "曾是国家支柱的农业，到1911年只排男性职业第三，许多年轻人离开村庄去了城市和殖民地。", fr: "Autrefois au cœur du pays, l'agriculture n'est plus que le troisième métier masculin ; les jeunes partent en ville ou aux colonies.", es: "Antes el corazón del país, en 1911 solo era el tercer oficio masculino; muchos jóvenes se iban a las ciudades y colonias." },
  },
  {
    id: "mines", m: 1039, f: 6, industry: "Coal mine", jobs: { m: ["Coal miner (hewer)", "Coal miner (putter)", "Pit pony driver", "Colliery banksman", "Quarryman"], f: ["Pit brow lass"] },
    name: { ko: "광부", en: "Mines and quarries", ja: "炭鉱夫", zh: "矿工", fr: "Mines et carrières", es: "Minas y canteras" },
    life: { ko: "탄광에서만 약 97만 명이 일했어요. 남웨일스·더럼·요크셔의 갱도에서 석탄을 캐 세계로 실어 보냈죠. 땅 위에서 석탄을 고르던 여자들 '핏 브로 래스'도 있었어요.", en: "Almost 970,000 worked in coal alone, cutting the coal that went round the world from South Wales, Durham and Yorkshire. Women still sorted coal at the pit head as 'pit brow lasses'.", ja: "炭鉱だけで約97万人。南ウェールズ・ダラム・ヨークシャーの坑道で掘った石炭が世界へ運ばれました。地上で石炭を選り分ける女性「ピット・ブロウ・ラス」もいました。", zh: "仅煤矿就有约97万人，在南威尔士、达勒姆和约克郡挖出运往全世界的煤。地面上还有拣煤的女工。", fr: "Près de 970 000 dans le charbon, du pays de Galles au Yorkshire ; des femmes triaient encore le charbon en surface.", es: "Casi 970.000 en el carbón, de Gales a Yorkshire; aún había mujeres que clasificaban carbón en la boca de la mina." },
  },
  {
    id: "building", m: 946, f: 1, industry: "Building", jobs: { m: ["Bricklayer", "Carpenter", "Plasterer", "Painter and decorator", "Builder's labourer", "Plumber"], f: ["Painter (building)"] },
    name: { ko: "건설 노동자", en: "Building", ja: "建設の労働者", zh: "建筑工人", fr: "Bâtiment", es: "Construcción" },
    life: { ko: "줄지어 선 붉은 벽돌집을 지은 사람들이에요. 일감이 계절과 경기에 따라 들쭉날쭉해, 겨울에는 일이 끊기기 일쑤였어요.", en: "The people who built the red-brick terraces. Work rose and fell with the seasons and the trade cycle, and winter often meant none.", ja: "並ぶ赤レンガの長屋を建てた人々。仕事は季節と景気で波があり、冬は途切れがちでした。", zh: "建起一排排红砖排屋的人。活计随季节和景气起伏，冬天常常没工可做。", fr: "Ceux qui bâtissaient les rangées de maisons en brique ; l'hiver, souvent pas de travail.", es: "Quienes construían las hileras de casas de ladrillo; en invierno, a menudo sin trabajo." },
  },
  {
    id: "food", m: 914, f: 475, industry: "Food and drink", jobs: { m: ["Baker", "Butcher", "Grocer's assistant", "Publican", "Brewer's labourer", "Milkman"], f: ["Barmaid", "Shop assistant (grocer)", "Confectioner", "Jam maker"] },
    name: { ko: "식품·음료 일꾼", en: "Food, drink and lodging", ja: "食品・飲料の仕事", zh: "食品饮料从业者", fr: "Alimentation et boissons", es: "Alimentación y bebidas" },
    life: { ko: "빵집·정육점·식료품점·펍에서 일했어요. 동네마다 펍이 있었고, 여자는 바메이드나 가게 점원으로 많이 일했어요.", en: "Bakers, butchers, grocers and publicans. Every street corner had a pub, and many women worked as barmaids and shop assistants.", ja: "パン屋・肉屋・食料品店・パブで働きました。どの町角にもパブがあり、女性はバーメイドや店員として多く働きました。", zh: "在面包店、肉铺、杂货店和酒馆工作。街角处处是酒馆，许多女性当酒吧女招待和店员。", fr: "Boulangers, bouchers, épiciers et patrons de pub ; beaucoup de femmes serveuses ou vendeuses.", es: "Panaderos, carniceros, tenderos y taberneros; muchas mujeres eran camareras o dependientas." },
  },
  {
    id: "textiles", m: 571, f: 746, industry: "Cotton", jobs: { m: ["Cotton spinner", "Wool comber", "Overlooker", "Dyer"], f: ["Cotton weaver", "Cotton winder", "Ring spinner", "Worsted weaver", "Lace maker"] },
    name: { ko: "방직 공장 노동자", en: "Textiles", ja: "紡績工場の労働者", zh: "纺织工人", fr: "Textile", es: "Textil" },
    life: { ko: "랭커셔의 면 공장과 요크셔의 모직 공장. 여자가 남자보다 많은 드문 산업이었고, 열두세 살에 공장에 들어가 반나절은 학교에 다니는 '하프타이머' 아이도 있었어요.", en: "Lancashire cotton and Yorkshire wool, one of the few trades with more women than men. Some children started at twelve as 'half-timers', half a day at the mill and half at school.", ja: "ランカシャーの綿工場とヨークシャーの毛織物工場。女性が男性より多い珍しい産業で、12歳ほどで工場と学校を半日ずつ通う「ハーフタイマー」の子もいました。", zh: "兰开夏的棉纺厂和约克郡的毛纺厂，是少有的女性多于男性的行业；还有十二三岁、半天做工半天上学的“半工童”。", fr: "Coton du Lancashire, laine du Yorkshire : plus de femmes que d'hommes, et des enfants « half-timers » à l'usine et à l'école.", es: "Algodón de Lancashire, lana de Yorkshire: más mujeres que hombres, y niños «half-timers» entre fábrica y escuela." },
  },
  {
    id: "dress", m: 439, f: 756, industry: "Dressmaking", jobs: { m: ["Tailor", "Boot maker", "Hatter", "Shoe repairer"], f: ["Dressmaker", "Milliner", "Tailoress", "Seamstress", "Shirt maker"] },
    name: { ko: "옷 만드는 사람", en: "Dress", ja: "服を作る人", zh: "制衣者", fr: "Habillement", es: "Confección" },
    life: { ko: "재봉사·모자 장인·구두장이예요. 여자 재봉사는 집에서 삯바느질을 하는 경우가 많아 조사표에 '집에서 일함' 칸이 따로 있었어요.", en: "Dressmakers, milliners and boot makers. So many women sewed at home that the form had a column for 'working at home'.", ja: "仕立て屋・帽子職人・靴職人。家で内職する女性が多く、調査票には「自宅で働く」欄がありました。", zh: "裁缝、帽匠和鞋匠。很多女性在家做针线活，所以普查表专门有“是否在家工作”一栏。", fr: "Couturières, modistes, cordonniers ; tant de femmes cousaient chez elles que le formulaire avait une colonne « travaille à domicile ».", es: "Modistas, sombrereras y zapateros; tantas mujeres cosían en casa que el formulario tenía una columna «trabaja en casa»." },
  },
];

const sumM = ORDERS_BASE.reduce((s, o) => s + o.m, 0);
const sumF = ORDERS_BASE.reduce((s, o) => s + o.f, 0);

export const ORDERS: Order[] = [
  ...ORDERS_BASE,
  {
    id: "other", m: M_OCC - sumM, f: F_OCC - sumF, industry: "Commerce", jobs: { m: ["Commercial clerk", "Schoolmaster", "Police constable", "Postman", "Printer", "Insurance agent"], f: ["Schoolmistress", "Typist", "Sick nurse", "Clerk (commercial)", "Telephone operator"] },
    name: { ko: "사무원·교사·경찰 등 그 밖의 일", en: "Clerks, teachers and other work", ja: "事務員・教師・警官など", zh: "职员、教师、警察等", fr: "Employés, instituteurs et autres", es: "Oficinistas, maestros y otros" },
    life: { ko: "사무원·교사·우편배달부·경찰·인쇄공 같은 일이에요. 타자기와 전화가 퍼지면서 젊은 여자 타이피스트·전화교환원이 막 늘어나던 때예요.", en: "Clerks, teachers, postmen, police and printers. Typewriters and telephones were bringing young women into offices as typists and operators.", ja: "事務員・教師・郵便配達・警官・印刷工など。タイプライターと電話が広まり、若い女性のタイピストや交換手が増え始めた頃です。", zh: "职员、教师、邮差、警察、印刷工等。打字机和电话普及，年轻女打字员和接线员正迅速增加。", fr: "Employés, instituteurs, facteurs, policiers, imprimeurs ; dactylos et téléphonistes se multiplient.", es: "Oficinistas, maestros, carteros, policías, impresores; aumentan mecanógrafas y telefonistas." },
  },
  {
    id: "home", m: 0, f: F_NONE, industry: "", jobs: { m: [], f: [""] },
    name: { ko: "직업란이 빈칸인 여성 (집안일)", en: "No occupation recorded (home)", ja: "職業欄が空白の女性（家事）", zh: "职业栏空白的女性（家务）", fr: "Sans profession déclarée (foyer)", es: "Sin ocupación registrada (hogar)" },
    life: { ko: "10세 이상 여성의 3분의 2인 약 1,000만 명이 '직업 없음'으로 적혔어요. 아이를 키우고 빨래·요리·하숙 손님 시중을 해도, 조사표의 직업 칸은 비었어요.", en: "About 10 million women and girls over ten, two in three, were returned with no occupation. Raising children, washing, cooking and looking after lodgers left the occupation column empty.", ja: "10歳以上の女性の3分の2、約1000万人が「職業なし」と記されました。子育て・洗濯・料理・下宿人の世話をしても、職業欄は空白でした。", zh: "十岁以上女性的三分之二、约1000万人被记为“无职业”。抚养孩子、洗衣做饭、照顾房客，职业栏依然空白。", fr: "Environ 10 millions de femmes et filles de plus de dix ans, deux sur trois, sans profession déclarée : enfants, lessive, cuisine et pensionnaires n'y figuraient pas.", es: "Unos 10 millones de mujeres y niñas mayores de diez años, dos de cada tres, sin ocupación registrada: niños, colada, cocina y huéspedes no contaban." },
  },
];

export const TOTAL = ORDERS.reduce((s, o) => s + o.m + o.f, 0);
export const orderById = (id: string) => ORDERS.find((o) => o.id === id) ?? null;
export const oneIn = (o: Order, sex: Sex) => Math.max(1, Math.round(TOTAL / Math.max(sex === "m" ? o.m : o.f, 1)));

export function drawPerson(rand: () => number = Math.random): { order: Order; sex: Sex } {
  let x = rand() * TOTAL;
  for (const o of ORDERS) {
    if (x < o.m) return { order: o, sex: "m" };
    x -= o.m;
    if (x < o.f) return { order: o, sex: "f" };
    x -= o.f;
  }
  return { order: ORDERS[0]!, sex: "f" };
}

const FIRST = {
  m: ["William", "John", "George", "Thomas", "James", "Arthur", "Frederick", "Albert", "Harry", "Ernest"],
  f: ["Mary", "Florence", "Annie", "Elizabeth", "Edith", "Alice", "Ethel", "Ada", "Lilian", "Gladys"],
};
const LAST = ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Johnson", "Roberts", "Robinson"];
const BIRTHPLACES: Record<string, string[]> = {
  domestic: ["Norfolk, Swaffham", "Somerset, Taunton", "Devon, Tiverton", "Wiltshire, Devizes"],
  metals: ["Yorkshire, Sheffield", "Warwickshire, Birmingham", "Staffordshire, Wolverhampton", "Durham, Jarrow"],
  transport: ["Lancashire, Liverpool", "London, Poplar", "Derbyshire, Derby", "Cheshire, Crewe"],
  agriculture: ["Lincolnshire, Louth", "Suffolk, Stowmarket", "Herefordshire, Ledbury", "Dorset, Sherborne"],
  mines: ["Glamorgan, Rhondda", "Durham, Seaham", "Yorkshire, Barnsley", "Nottinghamshire, Hucknall"],
  building: ["London, Islington", "Surrey, Croydon", "Kent, Chatham", "Lancashire, Salford"],
  food: ["London, Bermondsey", "Lancashire, Manchester", "Bristol", "Essex, West Ham"],
  textiles: ["Lancashire, Oldham", "Lancashire, Blackburn", "Yorkshire, Bradford", "Nottinghamshire, Nottingham"],
  dress: ["Northamptonshire, Northampton", "London, Stepney", "Leicestershire, Leicester", "Bedfordshire, Luton"],
  other: ["London, Lambeth", "Kent, Canterbury", "Gloucestershire, Cheltenham", "Hampshire, Southampton"],
  home: ["Lancashire, Bolton", "Glamorgan, Merthyr Tydfil", "London, Hackney", "Staffordshire, Stoke"],
};

export type Person = { order: string; sex: Sex; age: number; first: number; last: number; born: number; job: number; married: boolean; years: number; kids: number; died: number; boarder: boolean };

export function makePerson(order: Order, sex: Sex, rand: () => number = Math.random): Person {
  const i = (len: number) => Math.floor(rand() * Math.max(len, 1));
  const live = order.id === "domestic" && sex === "f";
  const age = live ? 15 + i(15) : 14 + Math.floor(rand() ** 1.3 * 50);
  const married = !live && age >= 21 && (order.id === "home" ? rand() < 0.75 : rand() < 0.5);
  const years = married ? Math.max(0, Math.min(age - 19, 1 + i(age - 19))) : 0;
  const kids = married && sex === "f" ? Math.min(years, i(Math.min(years, 6) + 2)) : 0;
  const died = kids > 1 && rand() < 0.4 ? 1 : 0;
  return { order: order.id, sex, age, first: i(10), last: i(LAST.length), born: i(4), job: i(order.jobs[sex].length), married, years, kids, died, boarder: !live && !married && rand() < 0.3 };
}

export type Schedule = {
  name: string; relation: string; age: string; marriage: string; years: string; born: string; living: string; died: string;
  occupation: string; industry: string; status: string; atHome: string; birthplace: string;
};

/** The person's line in the words of the 1911 household schedule. */
export function scheduleOf(p: Person): Schedule {
  const o = orderById(p.order)!;
  const married = p.married;
  const wife = married && p.sex === "f";
  const relation = o.id === "domestic" && p.sex === "f" ? "Servant" : wife ? "Wife" : married ? "Head" : p.boarder ? "Boarder" : p.sex === "m" ? "Son" : "Daughter";
  const occupation = o.jobs[p.sex][p.job] ?? "";
  const ownAccount = occupation === "Farmer" || occupation === "Dressmaker" || occupation === "Publican";
  return {
    name: `${FIRST[p.sex][p.first]} ${LAST[p.last]}`,
    relation,
    age: String(p.age),
    marriage: married ? "Married" : "Single",
    years: wife ? String(p.years) : "",
    born: wife ? String(p.kids) : "",
    living: wife ? String(p.kids - p.died) : "",
    died: wife ? String(p.died) : "",
    occupation,
    industry: occupation ? o.industry : "",
    status: occupation ? (ownAccount ? "Own account" : "Worker") : "",
    atHome: o.id === "dress" && p.sex === "f" ? "At home" : "",
    birthplace: BIRTHPLACES[o.id]![p.born] ?? "",
  };
}

export function formatCensus1911(p: Person): string {
  return new URLSearchParams({ o: p.order, x: p.sex, a: String(p.age), f: String(p.first), l: String(p.last), b: String(p.born), j: String(p.job), m: p.married ? "1" : "0", y: String(p.years), k: String(p.kids), d: String(p.died), r: p.boarder ? "1" : "0" }).toString();
}

export function parseCensus1911(search: string): Person | null {
  const q = new URLSearchParams(search);
  const o = orderById(q.get("o") ?? "");
  const sex = q.get("x");
  if (!o || (sex !== "m" && sex !== "f") || !o.jobs[sex].length) return null;
  const num = (k: string, min: number, max: number) => {
    const v = Number(q.get(k));
    return Number.isInteger(v) && v >= min && v <= max ? v : null;
  };
  const bit = (k: string) => (q.get(k) === "1" ? true : q.get(k) === "0" ? false : null);
  const age = num("a", 10, 99), first = num("f", 0, 9), last = num("l", 0, LAST.length - 1), born = num("b", 0, 3), job = num("j", 0, o.jobs[sex].length - 1);
  const years = num("y", 0, 80), kids = num("k", 0, 20), died = num("d", 0, 20);
  const married = bit("m"), boarder = bit("r");
  if ([age, first, last, born, job, years, kids, died].some((v) => v === null) || married === null || boarder === null || died! > kids!) return null;
  return { order: o.id, sex, age: age!, first: first!, last: last!, born: born!, job: job!, married, years: years!, kids: kids!, died: died!, boarder };
}

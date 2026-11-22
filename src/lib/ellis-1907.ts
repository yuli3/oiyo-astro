/**
 * "Me in a 1907 Ellis Island passenger list" (time-slip season 3 #2).
 *
 * Sources (notes: /mnt/project-files/notes/timeslip-s3-ellis-1907-research.md):
 * - Ellis Island handled 1,004,756 arrivals in 1907, its busiest year; record day 17 April 1907, 11,747 (history.com,
 *   American Immigration Council "Immigration 1907 v. 2017").
 * - Commissioner-General of Immigration, FY1907 report (as summarised in the press, Dec 1907): 1,285,349 admitted of
 *   1,295,413 applicants; 13,064 turned back; arrivals by country below; $25,599,893 brought in, "almost $20" each;
 *   573,923 showed less than $50 and 107,502 more.
 * - NARA blank form "List or Manifest of Alien Passengers for the United States" (1907): 29 columns.
 * The draw uses the FY1907 counts of the countries whose emigrants mostly landed at New York (Japan, China, Canada and
 * the West Indies are left out: they came by the Pacific, overland or to other ports). Names, towns, ages,
 * occupations, money and relatives on the generated line are invented for the game.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type Sex = "m" | "f";

export const ELLIS_1907 = 1004756;
export const RECORD_DAY = 11747;
export const ADMITTED_FY1907 = 1285349;
export const APPLIED_FY1907 = 1295413;
export const TURNED_BACK_FY1907 = 13064;
export const UNDER_50 = 573923;
export const OVER_50 = 107502;

type Names = { m: string[]; f: string[]; last: string[] };

export type Origin = {
  id: string;
  /** Admitted in FY1907 (all ports). */
  n: number;
  nationality: string;
  port: string;
  towns: string[];
  names: Names;
  jobs: { m: string[]; f: string[] };
  name: Six;
  life: Six;
};

export const ORIGINS: Origin[] = [
  {
    id: "austria-hungary", n: 355452, nationality: "Austria-Hungary", port: "Fiume", towns: ["Kaschau", "Lemberg", "Krakau", "Pressburg", "Agram", "Budapest", "Tarnów", "Ungvár"],
    names: { m: ["János", "Josef", "Stefan", "Mihály", "Andrej", "Franz", "Wasyl", "Jan"], f: ["Maria", "Anna", "Erzsébet", "Katarina", "Julia", "Rosa", "Zsuzsanna", "Helena"], last: ["Kovács", "Nagy", "Novak", "Horváth", "Kowalczyk", "Szabó", "Hrubý", "Tóth"] },
    jobs: { m: ["Laborer", "Laborer", "Farm laborer", "Farm laborer", "Miner", "Blacksmith", "Carpenter", "Tailor"], f: ["Servant", "Servant", "Housewife", "Farm laborer", "Seamstress"] },
    name: { ko: "오스트리아-헝가리에서 온 이민자", en: "From Austria-Hungary", ja: "オーストリア＝ハンガリーから", zh: "来自奥匈帝国", fr: "Venu d'Autriche-Hongrie", es: "Desde Austria-Hungría" },
    life: { ko: "1907년 가장 큰 무리예요. 헝가리인·슬로바키아인·폴란드인·크로아티아인·우크라이나인이 섞인 제국에서 35만 명이 왔고, 펜실베이니아 탄광과 제철소로 많이 갔어요.", en: "The largest group of 1907: 355,000 from an empire of Magyars, Slovaks, Poles, Croats and Ukrainians, many bound for Pennsylvania's mines and steel mills.", ja: "1907年最大の集団。マジャール人・スロバキア人・ポーランド人・クロアチア人などの帝国から35万人が来て、多くがペンシルベニアの炭鉱や製鉄所へ向かいました。", zh: "1907年最大的群体：来自匈牙利人、斯洛伐克人、波兰人、克罗地亚人等组成的帝国，共35万人，许多人前往宾夕法尼亚的煤矿和钢厂。", fr: "Le premier groupe de 1907 : 355 000 personnes d'un empire de Magyars, Slovaques, Polonais et Croates, souvent vers les mines et aciéries de Pennsylvanie.", es: "El mayor grupo de 1907: 355.000 de un imperio de magiares, eslovacos, polacos y croatas, muchos rumbo a las minas y acerías de Pensilvania." },
  },
  {
    id: "russia", n: 258943, nationality: "Russia", port: "Bremen", towns: ["Białystok", "Vilna", "Minsk", "Kovno", "Warsaw", "Łódź", "Grodno", "Pinsk"],
    names: { m: ["Moses", "Abraham", "Stanisław", "Józef", "Isaac", "Antanas", "Jacob", "Wojciech"], f: ["Sarah", "Rivka", "Marianna", "Leah", "Feiga", "Zofia", "Chana", "Ona"], last: ["Cohen", "Rabinowitz", "Kowalski", "Levin", "Wiśniewski", "Kaplan", "Petrauskas", "Goldberg"] },
    jobs: { m: ["Laborer", "Tailor", "Tailor", "Farm laborer", "Shoemaker", "Carpenter", "Merchant", "Locksmith"], f: ["Servant", "Dressmaker", "Housewife", "Seamstress", "Servant"] },
    name: { ko: "러시아 제국에서 온 이민자", en: "From the Russian Empire", ja: "ロシア帝国から", zh: "来自俄罗斯帝国", fr: "Venu de l'Empire russe", es: "Desde el Imperio ruso" },
    life: { ko: "1907년 26만 명. 1905년 혁명과 포그롬(유대인 학살)을 피해 떠난 유대인, 그리고 폴란드인·리투아니아인이 많았어요. 뉴욕 로어이스트사이드의 의류 공장으로 많이 갔어요.", en: "259,000 in 1907: many were Jews escaping the pogroms after 1905, along with Poles and Lithuanians. Many went straight to the garment shops of New York's Lower East Side.", ja: "1907年に26万人。1905年以後のポグロムを逃れたユダヤ人、ポーランド人、リトアニア人が多く、ニューヨークの縫製工場へ向かいました。", zh: "1907年约26万人：很多是逃离1905年后大屠杀的犹太人，以及波兰人和立陶宛人，许多人去了纽约下东区的制衣厂。", fr: "259 000 en 1907 : beaucoup de Juifs fuyant les pogroms d'après 1905, des Polonais et des Lituaniens, souvent vers les ateliers de confection du Lower East Side.", es: "259.000 en 1907: muchos judíos que huían de los pogromos tras 1905, además de polacos y lituanos, a menudo hacia los talleres de confección del Lower East Side." },
  },
  {
    id: "italy", n: 253751, nationality: "Italy", port: "Naples", towns: ["Avellino", "Potenza", "Cosenza", "Palermo", "Campobasso", "Caserta", "Bari", "Messina"],
    names: { m: ["Giuseppe", "Antonio", "Giovanni", "Francesco", "Vincenzo", "Salvatore", "Domenico", "Pasquale"], f: ["Maria", "Rosa", "Carmela", "Giuseppina", "Concetta", "Angela", "Filomena", "Teresa"], last: ["Russo", "Esposito", "Romano", "Greco", "Bruno", "Colombo", "Ricci", "Marino"] },
    jobs: { m: ["Laborer", "Laborer", "Laborer", "Farm laborer", "Farm laborer", "Shoemaker", "Barber", "Mason"], f: ["Housewife", "Housewife", "Farm laborer", "Servant", "Seamstress"] },
    name: { ko: "이탈리아에서 온 이민자", en: "From Italy", ja: "イタリアから", zh: "来自意大利", fr: "Venu d'Italie", es: "Desde Italia" },
    life: { ko: "1907년 25만 명, 대부분 가난한 남부와 시칠리아 출신이에요. 철도·지하철·건물 공사장에서 일하며 번 돈을 고향에 보내고, 몇 해 뒤 돌아가는 사람도 많았어요.", en: "254,000 in 1907, mostly from the poor south and Sicily. They dug railways, subways and foundations, sent money home, and many went back after a few seasons.", ja: "1907年に25万人、多くは貧しい南部とシチリアから。鉄道・地下鉄・建設現場で働いて故郷に送金し、数年で帰る人も多くいました。", zh: "1907年约25万人，大多来自贫穷的南部和西西里。他们修铁路、地铁和地基，把钱寄回家，不少人几年后返乡。", fr: "254 000 en 1907, surtout du Sud et de Sicile : chemins de fer, métro, chantiers, argent envoyé au pays, et beaucoup de retours.", es: "254.000 en 1907, sobre todo del sur y de Sicilia: ferrocarriles, metro y obras, dinero enviado a casa y muchos regresos." },
  },
  {
    id: "england", n: 56637, nationality: "Great Britain", port: "Liverpool", towns: ["Manchester", "Leeds", "Birmingham", "Liverpool", "Sheffield", "London", "Bolton", "Newcastle"],
    names: { m: ["William", "John", "George", "Thomas", "Arthur", "Albert", "Frederick", "Harry"], f: ["Mary", "Annie", "Elizabeth", "Florence", "Edith", "Alice", "Ellen", "Ada"], last: ["Smith", "Jones", "Taylor", "Brown", "Wright", "Walker", "Robinson", "Hall"] },
    jobs: { m: ["Machinist", "Clerk", "Miner", "Weaver", "Joiner", "Engineer", "Laborer", "Printer"], f: ["Domestic", "Weaver", "Clerk", "Dressmaker", "Housewife"] },
    name: { ko: "잉글랜드에서 온 이민자", en: "From England", ja: "イングランドから", zh: "来自英格兰", fr: "Venu d'Angleterre", es: "Desde Inglaterra" },
    life: { ko: "1907년 5만 7천 명. 영어를 하고 기술을 가진 사람이 많아, 공장 기술자나 사무원으로 빨리 자리 잡았어요.", en: "57,000 in 1907. They spoke English and often had a trade, so many settled fast as skilled workers and clerks.", ja: "1907年に5万7千人。英語ができ技術を持つ人が多く、工場の技術者や事務員としてすぐに定着しました。", zh: "1907年5.7万人。会说英语、多有手艺，很快就成了技工或职员。", fr: "57 000 en 1907, anglophones et souvent qualifiés : ouvriers spécialisés ou employés.", es: "57.000 en 1907, angloparlantes y a menudo con oficio: obreros cualificados o empleados." },
  },
  {
    id: "germany", n: 37807, nationality: "Germany", port: "Bremen", towns: ["Berlin", "Hamburg", "Posen", "Stuttgart", "München", "Breslau", "Köln", "Kassel"],
    names: { m: ["Wilhelm", "Karl", "Friedrich", "Heinrich", "Otto", "Hermann", "Johann", "Paul"], f: ["Anna", "Marie", "Martha", "Emma", "Frieda", "Bertha", "Elise", "Margarethe"], last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker"] },
    jobs: { m: ["Farmer", "Baker", "Butcher", "Machinist", "Carpenter", "Brewer", "Laborer", "Merchant"], f: ["Servant", "Servant", "Housewife", "Cook", "Dressmaker"] },
    name: { ko: "독일에서 온 이민자", en: "From Germany", ja: "ドイツから", zh: "来自德国", fr: "Venu d'Allemagne", es: "Desde Alemania" },
    life: { ko: "19세기에는 가장 큰 이민자 집단이었지만 1907년엔 3만 8천 명으로 줄었어요. 독일 경제가 좋아졌기 때문이에요. 먼저 건너간 친척이 있는 중서부로 많이 갔어요.", en: "Once the biggest immigrant group, down to 38,000 by 1907 as Germany's economy boomed. Many joined relatives already in the Midwest.", ja: "19世紀には最大の移民集団でしたが、ドイツ経済が好調になり1907年には3万8千人に。中西部の親族のもとへ向かう人が多くいました。", zh: "19世纪曾是最大移民群体，因德国经济好转，1907年降至3.8万人，多去中西部投奔亲属。", fr: "Autrefois premier groupe, 38 000 en 1907 grâce à l'essor allemand ; beaucoup rejoignaient de la famille dans le Midwest.", es: "Antes el mayor grupo, 38.000 en 1907 por el auge alemán; muchos se unían a parientes en el Medio Oeste." },
  },
  {
    id: "greece", n: 36590, nationality: "Greece", port: "Patras", towns: ["Tripoli", "Sparta", "Kalamata", "Patras", "Pyrgos", "Argos", "Megalopolis", "Nafplio"],
    names: { m: ["Georgios", "Ioannis", "Konstantinos", "Dimitrios", "Nikolaos", "Panagiotis", "Vasilios", "Christos"], f: ["Maria", "Eleni", "Aikaterini", "Vasiliki", "Georgia", "Sofia", "Anastasia", "Panagiota"], last: ["Papadopoulos", "Pappas", "Georgiou", "Nikolaou", "Dimitriou", "Karras", "Vlachos", "Economou"] },
    jobs: { m: ["Laborer", "Laborer", "Farm laborer", "Shepherd", "Cook", "Fruit seller", "Bootblack", "Waiter"], f: ["Housewife", "Servant", "Seamstress"] },
    name: { ko: "그리스에서 온 이민자", en: "From Greece", ja: "ギリシャから", zh: "来自希腊", fr: "Venu de Grèce", es: "Desde Grecia" },
    life: { ko: "1907년 3만 7천 명, 대부분 펠로폰네소스의 젊은 남자예요. 건포도 값이 폭락한 뒤 떠나와 철도 공사·구두닦이·과일 가게·식당으로 일을 시작했어요.", en: "37,000 in 1907, mostly young men from the Peloponnese after the currant price crash, starting out on railway gangs, as bootblacks, fruit sellers and in diners.", ja: "1907年に3万7千人、多くはレーズン価格暴落後のペロポネソスの若い男性。鉄道工事・靴磨き・果物屋・食堂から始めました。", zh: "1907年约3.7万人，多是葡萄干价格暴跌后离开伯罗奔尼撒的年轻男子，从修铁路、擦鞋、卖水果和开小饭馆做起。", fr: "37 000 en 1907, surtout de jeunes hommes du Péloponnèse après la crise du raisin sec : rail, cireurs, fruitiers, restaurants.", es: "37.000 en 1907, sobre todo jóvenes del Peloponeso tras la caída de la pasa: ferrocarril, limpiabotas, fruterías, restaurantes." },
  },
  {
    id: "ireland", n: 34530, nationality: "Great Britain", port: "Queenstown", towns: ["Cork", "Kerry", "Galway", "Mayo", "Clare", "Limerick", "Donegal", "Tipperary"],
    names: { m: ["Patrick", "John", "Michael", "Thomas", "James", "Daniel", "Denis", "Martin"], f: ["Mary", "Bridget", "Margaret", "Catherine", "Ellen", "Nora", "Hannah", "Julia"], last: ["Murphy", "Sullivan", "Kelly", "O'Brien", "Walsh", "Ryan", "Connor", "McCarthy"] },
    jobs: { m: ["Laborer", "Laborer", "Farm laborer", "Farmer", "Carpenter", "Clerk"], f: ["Servant", "Servant", "Servant", "Domestic", "Nurse"] },
    name: { ko: "아일랜드에서 온 이민자", en: "From Ireland", ja: "アイルランドから", zh: "来自爱尔兰", fr: "Venu d'Irlande", es: "Desde Irlanda" },
    life: { ko: "1907년 3만 5천 명. 아일랜드 이민은 특이하게 여자가 많았고, 혼자 건너와 부잣집 하녀로 일하며 고향에 돈을 보냈어요. 당시 국적 칸에는 '영국'이라고 적혔어요.", en: "35,000 in 1907. Unusually, many were young women travelling alone to work as servants and send money home. The nationality column said Great Britain.", ja: "1907年に3万5千人。珍しく女性が多く、一人で渡ってメイドとして働き故郷に送金しました。国籍欄には「英国」と書かれました。", zh: "1907年约3.5万人。少见的是女性很多，常独自渡海当女佣寄钱回家。国籍栏写的是“英国”。", fr: "35 000 en 1907, avec beaucoup de jeunes femmes seules, domestiques envoyant de l'argent au pays. La colonne nationalité indiquait Great Britain.", es: "35.000 en 1907, con muchas jóvenes solas que trabajaban de sirvientas y enviaban dinero. En nacionalidad ponía Great Britain." },
  },
  {
    id: "turkey", n: 20767, nationality: "Turkey", port: "Marseille", towns: ["Beirut", "Zahle", "Harput", "Smyrna", "Aleppo", "Trebizond", "Van", "Damascus"],
    names: { m: ["Hanna", "Elias", "Kevork", "Boghos", "Youssef", "Hagop", "Nicola", "Asad"], f: ["Mariam", "Rose", "Anoush", "Shamsa", "Takouhi", "Najla", "Zabel", "Hanneh"], last: ["Haddad", "Khoury", "Avedisian", "Nassar", "Kazanjian", "Saliba", "Der Bedrosian", "Abdo"] },
    jobs: { m: ["Peddler", "Peddler", "Laborer", "Merchant", "Shoemaker", "Weaver"], f: ["Housewife", "Peddler", "Seamstress"] },
    name: { ko: "오스만 제국에서 온 이민자", en: "From the Ottoman Empire", ja: "オスマン帝国から", zh: "来自奥斯曼帝国", fr: "Venu de l'Empire ottoman", es: "Desde el Imperio otomano" },
    life: { ko: "1907년 2만 1천 명. 지금의 레바논·시리아 출신 기독교인과 아르메니아인이 많았어요. 등짐을 지고 마을을 도는 행상으로 시작한 사람이 많았어요.", en: "21,000 in 1907, many of them Christians from today's Lebanon and Syria, and Armenians. Many started as pack peddlers walking from town to town.", ja: "1907年に2万1千人。今のレバノン・シリアのキリスト教徒やアルメニア人が多く、荷を背負った行商から始める人が多くいました。", zh: "1907年约2.1万人，多为今黎巴嫩、叙利亚的基督徒和亚美尼亚人，很多人从背包走街串巷的小贩做起。", fr: "21 000 en 1907, souvent chrétiens du Liban et de Syrie actuels, et Arméniens ; beaucoup commençaient colporteurs.", es: "21.000 en 1907, muchos cristianos del actual Líbano y Siria, y armenios; muchos empezaban como buhoneros." },
  },
  {
    id: "scotland", n: 19740, nationality: "Great Britain", port: "Glasgow", towns: ["Glasgow", "Edinburgh", "Dundee", "Aberdeen", "Paisley", "Greenock", "Motherwell", "Fife"],
    names: { m: ["James", "John", "William", "Robert", "David", "Alexander", "Andrew", "Thomas"], f: ["Margaret", "Mary", "Agnes", "Jessie", "Isabella", "Jane", "Janet", "Christina"], last: ["Smith", "Brown", "Wilson", "Campbell", "Stewart", "Thomson", "Robertson", "Macdonald"] },
    jobs: { m: ["Engineer", "Joiner", "Miner", "Boilermaker", "Clerk", "Plumber"], f: ["Domestic", "Weaver", "Housewife", "Clerk"] },
    name: { ko: "스코틀랜드에서 온 이민자", en: "From Scotland", ja: "スコットランドから", zh: "来自苏格兰", fr: "Venu d'Écosse", es: "Desde Escocia" },
    life: { ko: "1907년 2만 명. 조선소·탄광 기술자가 많았고, 미국 공장이 이런 숙련공을 반겼어요.", en: "20,000 in 1907, many of them shipyard and mine tradesmen whom American industry was glad to hire.", ja: "1907年に2万人。造船所や炭鉱の技術者が多く、アメリカの工場に歓迎されました。", zh: "1907年约2万人，多为造船厂和煤矿技工，美国工厂乐于雇用。", fr: "20 000 en 1907, souvent ouvriers des chantiers navals et des mines, très recherchés.", es: "20.000 en 1907, a menudo de astilleros y minas, muy buscados por la industria." },
  },
  {
    id: "balkans", n: 11253, nationality: "Bulgaria", port: "Trieste", towns: ["Sofia", "Plovdiv", "Vidin", "Tarnovo", "Pleven", "Shumen", "Ruse", "Stara Zagora"],
    names: { m: ["Ivan", "Georgi", "Petar", "Stoyan", "Dimitar", "Nikola", "Todor", "Hristo"], f: ["Maria", "Elena", "Yordanka", "Vasilka", "Stana", "Raina", "Rada", "Kata"], last: ["Petrov", "Ivanov", "Todorov", "Georgiev", "Stoyanov", "Popov", "Dimitrov", "Hristov"] },
    jobs: { m: ["Laborer", "Laborer", "Farm laborer", "Shepherd", "Baker"], f: ["Housewife", "Farm laborer"] },
    name: { ko: "발칸반도에서 온 이민자", en: "From the Balkans", ja: "バルカン半島から", zh: "来自巴尔干", fr: "Venu des Balkans", es: "Desde los Balcanes" },
    life: { ko: "불가리아·세르비아·몬테네그로에서 1907년 1만 1천 명. 대부분 젊은 남자가 혼자 와서 철도·제철소에서 일하고 돈을 모아 돌아가려 했어요.", en: "11,000 from Bulgaria, Serbia and Montenegro in 1907, mostly young men on their own, working railways and steel mills and planning to go home.", ja: "1907年にブルガリア・セルビア・モンテネグロから1万1千人。多くは若い男性が単身で来て、鉄道や製鉄所で働き帰郷を目指しました。", zh: "1907年约1.1万人来自保加利亚、塞尔维亚和黑山，多为单身年轻男子，在铁路和钢厂打工，打算攒钱回乡。", fr: "11 000 de Bulgarie, Serbie et Monténégro en 1907, surtout de jeunes hommes seuls dans le rail et l'acier.", es: "11.000 de Bulgaria, Serbia y Montenegro en 1907, sobre todo jóvenes solos en ferrocarriles y acerías." },
  },
  {
    id: "france", n: 9731, nationality: "France", port: "Le Havre", towns: ["Paris", "Lyon", "Bordeaux", "Pau", "Barcelonnette", "Le Havre", "Lille", "Nancy"],
    names: { m: ["Jean", "Pierre", "Louis", "Joseph", "Henri", "Marcel", "Émile", "Paul"], f: ["Marie", "Jeanne", "Louise", "Marguerite", "Germaine", "Berthe", "Lucie", "Hélène"], last: ["Martin", "Bernard", "Dubois", "Durand", "Laurent", "Moreau", "Lefebvre", "Garcia"] },
    jobs: { m: ["Cook", "Waiter", "Merchant", "Baker", "Clerk", "Shepherd"], f: ["Governess", "Cook", "Dressmaker", "Servant"] },
    name: { ko: "프랑스에서 온 이민자", en: "From France", ja: "フランスから", zh: "来自法国", fr: "Venu de France", es: "Desde Francia" },
    life: { ko: "1907년 1만 명 남짓으로 드문 편이에요. 요리사·웨이터·가정교사처럼 기술로 일자리를 구했고, 피레네 출신 목동은 서부 목장으로 갔어요.", en: "Fewer than 10,000 in 1907. Cooks, waiters and governesses found work through their skills; Pyrenean shepherds went to western ranches.", ja: "1907年は1万人足らずと少数。料理人・給仕・家庭教師など技能で職を得て、ピレネーの羊飼いは西部の牧場へ。", zh: "1907年不到1万人，较少见。厨师、侍者、家庭教师凭手艺找工作，比利牛斯的牧羊人去了西部牧场。", fr: "Moins de 10 000 en 1907 : cuisiniers, garçons, gouvernantes, et bergers pyrénéens vers les ranchs de l'Ouest.", es: "Menos de 10.000 en 1907: cocineros, camareros, institutrices, y pastores pirenaicos hacia los ranchos del Oeste." },
  },
];

export const TOTAL = ORIGINS.reduce((s, o) => s + o.n, 0);
export const originById = (id: string) => ORIGINS.find((o) => o.id === id) ?? null;
export const oneIn = (o: Origin) => Math.max(1, Math.round(TOTAL / o.n));

export function drawOrigin(rand: () => number = Math.random): Origin {
  let x = rand() * TOTAL;
  for (const o of ORIGINS) {
    if (x < o.n) return o;
    x -= o.n;
  }
  return ORIGINS[0]!;
}

const DESTINATIONS = ["New York, N.Y.", "Pittsburgh, Pa.", "Chicago, Ill.", "Cleveland, O.", "Boston, Mass.", "Philadelphia, Pa.", "Scranton, Pa.", "Buffalo, N.Y."];
const RELATIONS = ["brother", "cousin", "uncle", "husband", "friend", "brother-in-law", "sister", "father"];

export type Passenger = { origin: string; sex: Sex; age: number; first: number; last: number; town: number; job: number; dollars: number; dest: number; rel: number; married: boolean; read: boolean; paidSelf: boolean };

/** Share of FY1907 admitted aliens who showed $50 or more (107,502 of 681,425). */
export const OVER_50_SHARE = OVER_50 / (UNDER_50 + OVER_50);

export function makePassenger(o: Origin, rand: () => number = Math.random): Passenger {
  const i = (len: number) => Math.floor(rand() * len);
  const sex: Sex = rand() < 0.68 ? "m" : "f";
  const age = 16 + Math.floor(rand() ** 1.6 * 30);
  const over = rand() < OVER_50_SHARE;
  const dollars = over ? 50 + i(51) : Math.round(2 + rand() ** 2 * 45);
  return {
    origin: o.id, sex, age,
    first: i(o.names[sex].length), last: i(o.names.last.length), town: i(o.towns.length), job: i(o.jobs[sex].length),
    dollars, dest: i(DESTINATIONS.length), rel: i(RELATIONS.length),
    married: age > 22 && rand() < 0.5, read: rand() < 0.7, paidSelf: rand() < 0.6,
  };
}

export type ManifestLine = {
  name: string; age: string; sex: "M" | "F"; married: "M" | "S"; calling: string; read: string; nationality: string;
  residence: string; destination: string; paidBy: string; money: string; joining: string; port: string;
};

/** The line in the words of the 1907 form. */
export function manifestLine(p: Passenger): ManifestLine {
  const o = originById(p.origin)!;
  const rel = RELATIONS[p.rel]!;
  const relation = p.sex === "f" && rel === "husband" ? "husband" : rel === "husband" ? "brother" : rel;
  return {
    name: `${o.names.last[p.last]}, ${o.names[p.sex][p.first]}`,
    age: String(p.age),
    sex: p.sex === "m" ? "M" : "F",
    married: p.married ? "M" : "S",
    calling: o.jobs[p.sex][p.job]!,
    read: p.read || ["england", "scotland", "ireland", "germany", "france"].includes(p.origin) ? "yes / yes" : "no / no",
    nationality: o.nationality,
    residence: o.towns[p.town]!,
    destination: DESTINATIONS[p.dest]!,
    paidBy: p.paidSelf ? "self" : relation,
    money: `$${p.dollars}`,
    joining: `${relation}, ${DESTINATIONS[p.dest]!.split(",")[0]}`,
    port: o.port,
  };
}

export function formatEllis(p: Passenger): string {
  return new URLSearchParams({ o: p.origin, x: p.sex, a: String(p.age), f: String(p.first), l: String(p.last), t: String(p.town), j: String(p.job), d: String(p.dollars), c: String(p.dest), r: String(p.rel), m: p.married ? "1" : "0", w: p.read ? "1" : "0", p: p.paidSelf ? "1" : "0" }).toString();
}

export function parseEllis(search: string): Passenger | null {
  const q = new URLSearchParams(search);
  const o = originById(q.get("o") ?? "");
  const sex = q.get("x");
  if (!o || (sex !== "m" && sex !== "f")) return null;
  const num = (k: string, min: number, max: number) => {
    const v = Number(q.get(k));
    return Number.isInteger(v) && v >= min && v <= max ? v : null;
  };
  const bit = (k: string) => (q.get(k) === "1" ? true : q.get(k) === "0" ? false : null);
  const age = num("a", 1, 99), first = num("f", 0, o.names[sex].length - 1), last = num("l", 0, o.names.last.length - 1);
  const town = num("t", 0, o.towns.length - 1), job = num("j", 0, o.jobs[sex].length - 1), dollars = num("d", 0, 500);
  const dest = num("c", 0, DESTINATIONS.length - 1), rel = num("r", 0, RELATIONS.length - 1);
  const married = bit("m"), read = bit("w"), paidSelf = bit("p");
  if ([age, first, last, town, job, dollars, dest, rel].some((v) => v === null) || married === null || read === null || paidSelf === null) return null;
  return { origin: o.id, sex, age: age!, first: first!, last: last!, town: town!, job: job!, dollars: dollars!, dest: dest!, rel: rel!, married, read, paidSelf };
}

/**
 * "회빙환 시뮬레이터": the web-novel tropes (빙의 possession, 환생 rebirth, 타임슬립 arriving as yourself) played in
 * 1789, the 13th year of King Jeongjo, using the 1789 register episode's body draw (Daegu register status shares).
 *
 * Skill verdicts rest on dated facts: 훈민정음 1446; 고구마 seed brought from Tsushima by 조엄's 1763 embassy; 감자
 * reached Joseon in the 1820s; 사역원 trained Chinese and Japanese interpreters; 1791 신해통공 lifted most market
 * monopolies two years later. The survival score is a play value and the page says so.
 */
import { draw1789, format1789, parse1789, type Life1789, type Status } from "./joseon-1789";

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type Trope = "possess" | "reborn" | "slip";
export type Verdict = "works" | "partly" | "useless";
export type SkillId = "hangul" | "hanja" | "english" | "japanese" | "chinese" | "driving" | "cooking" | "excel" | "coding" | "swimming" | "hygiene" | "trading";

export type Skill = { id: SkillId; icon: string; verdict: Verdict; points: number; name: Six; why: Six };

const s = (id: SkillId, icon: string, verdict: Verdict, name: Six, why: Six): Skill => ({ id, icon, verdict, points: verdict === "works" ? 2 : verdict === "partly" ? 1 : 0, name, why });

export const SKILLS: Skill[] = [
  s("hangul", "ㄱ", "works", { ko: "한글 읽고 쓰기", en: "Reading and writing Hangul", ja: "ハングルの読み書き", zh: "读写韩文", fr: "Lire et écrire le hangeul", es: "Leer y escribir hangul" },
    { ko: "훈민정음은 1446년에 반포됐어요. 1789년엔 한글 편지와 소설이 널리 읽혀서 통해요. 다만 관청 문서는 한문이에요.", en: "Hangul was proclaimed in 1446; by 1789 letters and novels in it were widely read. Official papers, though, were in classical Chinese.", ja: "訓民正音は1446年に頒布。1789年にはハングルの手紙や小説が広く読まれていました。ただし官庁の文書は漢文です。", zh: "训民正音于1446年颁布，到1789年韩文书信和小说已广为流传。不过官府文书用汉文。", fr: "Le hangeul date de 1446 ; en 1789 lettres et romans en hangeul circulent. Mais l'administration écrit en chinois classique.", es: "El hangul se proclamó en 1446; en 1789 cartas y novelas en hangul circulaban. Pero la administración escribía en chino clásico." }),
  s("hanja", "漢", "partly", { ko: "한자 조금", en: "Some Chinese characters", ja: "漢字が少し", zh: "认识一些汉字", fr: "Quelques sinogrammes", es: "Algunos caracteres chinos" },
    { ko: "과거시험·공문서·족보가 모두 한문이라 아주 귀한 능력이에요. 그런데 신문 한자 수준으론 문장을 짓기 어려워요.", en: "Exams, documents and genealogies were all in classical Chinese, so this is gold, but newspaper-level characters will not let you write it.", ja: "科挙も公文書も族譜もすべて漢文なので貴重な力。ただ新聞の漢字程度では文章は書けません。", zh: "科举、公文、族谱全用汉文，非常珍贵。但报纸水平的汉字写不了文章。", fr: "Examens, actes, généalogies : tout est en chinois classique. Précieux, mais quelques caractères ne suffisent pas.", es: "Exámenes, documentos y genealogías: todo en chino clásico. Valioso, pero unos pocos caracteres no bastan." }),
  s("english", "A", "useless", { ko: "영어", en: "English", ja: "英語", zh: "英语", fr: "Anglais", es: "Inglés" },
    { ko: "1789년 조선에서 영어로 말할 상대는 사실상 없어요. 통역관 학교인 사역원도 중국어·일본어·몽골어·여진어만 가르쳤어요.", en: "There is practically nobody to speak English with. The interpreters' office, Sayeogwon, taught Chinese, Japanese, Mongolian and Jurchen.", ja: "1789年の朝鮮で英語を話す相手は事実上いません。通訳を育てる司訳院も中国語・日本語・モンゴル語・女真語だけでした。", zh: "1789年的朝鲜几乎没人可用英语交谈。培养译官的司译院只教汉语、日语、蒙古语和女真语。", fr: "Personne avec qui parler anglais. L'école des interprètes enseignait chinois, japonais, mongol et jurchen.", es: "Nadie con quien hablar inglés. La escuela de intérpretes enseñaba chino, japonés, mongol y yurchen." }),
  s("japanese", "あ", "works", { ko: "일본어", en: "Japanese", ja: "日本語", zh: "日语", fr: "Japonais", es: "Japonés" },
    { ko: "사역원의 왜학 역관이 될 수 있어요. 부산 왜관에선 쓰시마 상인과 매일 거래가 있었어요. 다만 18세기 일본어라 말투가 꽤 달라요.", en: "You could be a Japanese interpreter for the Sayeogwon; the Japan House in Busan traded with Tsushima daily. Mind the 18th-century accent.", ja: "司訳院の倭学訳官になれます。釜山の倭館では対馬の商人と日々取引がありました。ただし18世紀の日本語です。", zh: "可以当司译院的倭学译官，釜山倭馆每天都与对马商人交易。不过是18世纪的日语。", fr: "Interprète de japonais à la Sayeogwon ; la maison du Japon à Busan commerçait chaque jour avec Tsushima.", es: "Intérprete de japonés en la Sayeogwon; la casa de Japón en Busan comerciaba a diario con Tsushima." }),
  s("chinese", "中", "works", { ko: "중국어", en: "Mandarin", ja: "中国語", zh: "中文", fr: "Mandarin", es: "Mandarín" },
    { ko: "해마다 청나라 베이징으로 가는 사신단에 한학 역관으로 따라갈 수 있어요. 역관은 무역으로 큰돈을 벌기도 했어요.", en: "You could join the yearly embassy to Beijing as a Chinese interpreter; interpreters often grew rich on the side trade.", ja: "毎年清の北京へ向かう使節団に漢学訳官として同行できます。訳官は交易で財を成すこともありました。", zh: "可以随每年赴北京的使团担任汉学译官，译官常靠贸易致富。", fr: "Interprète dans l'ambassade annuelle à Pékin ; les interprètes s'enrichissaient souvent par le commerce.", es: "Intérprete en la embajada anual a Pekín; los intérpretes solían enriquecerse con el comercio." }),
  s("driving", "🚗", "useless", { ko: "운전", en: "Driving", ja: "運転", zh: "开车", fr: "Conduire", es: "Conducir" },
    { ko: "차가 없어요. 말이나 소달구지를 몰 줄 알아야 하는데, 그건 전혀 다른 기술이에요.", en: "No cars. Handling a horse or an ox cart is a different skill altogether.", ja: "車はありません。馬や牛車を扱うのはまったく別の技術です。", zh: "没有汽车。驾驭马匹或牛车完全是另一门手艺。", fr: "Pas de voiture ; mener un cheval ou une charrette à bœufs, c'est autre chose.", es: "No hay coches; llevar un caballo o una carreta de bueyes es otra cosa." }),
  s("cooking", "🍳", "partly", { ko: "요리", en: "Cooking", ja: "料理", zh: "做饭", fr: "Cuisine", es: "Cocina" },
    { ko: "고추는 있어요. 고구마는 1763년 통신사 조엄이 쓰시마에서 종자를 들여와 막 퍼지는 중이고, 감자는 1820년대에야 들어와요. 감자볶음은 못 해요.", en: "Chili peppers, yes. Sweet potatoes are just spreading after envoy Jo Eom brought seed from Tsushima in 1763; potatoes only arrive in the 1820s.", ja: "唐辛子はあります。サツマイモは1763年に通信使の趙曮が対馬から種芋を持ち帰り広まりつつあり、ジャガイモは1820年代にやっと来ます。", zh: "辣椒有。红薯是1763年通信使赵曮从对马带回种苗后才开始推广，土豆要到19世纪20年代才传入。", fr: "Le piment, oui. La patate douce se répand depuis 1763 ; la pomme de terre n'arrive que dans les années 1820.", es: "El chile, sí. El boniato se extiende desde 1763; la papa no llega hasta la década de 1820." }),
  s("excel", "📊", "partly", { ko: "엑셀·계산", en: "Spreadsheets and sums", ja: "エクセル・計算", zh: "Excel与算账", fr: "Tableurs et calcul", es: "Hojas de cálculo y cuentas" },
    { ko: "엑셀은 없지만 셈은 통해요. 관청 회계는 산원이 산가지로 셈했고, 산학 시험으로 뽑았어요.", en: "No spreadsheets, but arithmetic travels. Government accounts were kept by trained reckoners using counting rods, chosen by exam.", ja: "エクセルはなくても計算は通じます。役所の会計は算員が算木で計算し、算学の試験で選ばれました。", zh: "没有Excel，但算术有用。官府账目由算员用算筹计算，经算学考试选拔。", fr: "Pas de tableur, mais le calcul sert : les comptables officiels comptaient avec des baguettes, recrutés sur examen.", es: "Sin hojas de cálculo, pero las cuentas sirven: los contables oficiales usaban varillas, elegidos por examen." }),
  s("coding", "💻", "useless", { ko: "코딩", en: "Coding", ja: "コーディング", zh: "编程", fr: "Programmer", es: "Programar" },
    { ko: "전기가 없어요. 논리적으로 생각하는 습관만 남아요.", en: "No electricity. Only the habit of thinking in steps comes with you.", ja: "電気がありません。論理的に考える癖だけが残ります。", zh: "没有电，只剩下按步骤思考的习惯。", fr: "Pas d'électricité ; il vous reste l'art de raisonner par étapes.", es: "No hay electricidad; solo te queda pensar paso a paso." }),
  s("swimming", "🏊", "works", { ko: "수영", en: "Swimming", ja: "水泳", zh: "游泳", fr: "Nager", es: "Nadar" },
    { ko: "배를 타고 강을 건너는 일이 잦던 때라, 물에 빠져도 살아남는 사람이 돼요.", en: "River crossings by boat were routine; you are the one who survives falling in.", ja: "舟で川を渡るのが日常だった時代、落ちても生き残る人になれます。", zh: "那时常坐船过河，你会是落水后能活下来的人。", fr: "On traversait souvent les rivières en barque : vous survivez à la chute.", es: "Se cruzaban ríos en barca a menudo: sobrevives si caes al agua." }),
  s("hygiene", "🧼", "works", { ko: "손 씻기·물 끓여 마시기", en: "Handwashing and boiling water", ja: "手洗い・湯冷まし", zh: "洗手、喝开水", fr: "Se laver les mains, bouillir l'eau", es: "Lavarse las manos y hervir el agua" },
    { ko: "천연두·홍역 같은 돌림병이 사람을 많이 데려가던 시대예요. 손 씻기와 끓인 물만으로도 살아남을 확률이 올라가요.", en: "Smallpox and measles took many lives; handwashing and boiled water alone raise your odds.", ja: "天然痘や麻疹などの疫病が多くの命を奪った時代。手洗いと煮沸した水だけでも生存率が上がります。", zh: "天花、麻疹等瘟疫夺走许多生命的时代，仅洗手和喝开水就能提高存活率。", fr: "Variole et rougeole tuent beaucoup : se laver les mains et bouillir l'eau améliorent vos chances.", es: "La viruela y el sarampión mataban a muchos: lavarse las manos y hervir el agua mejoran tus opciones." }),
  s("trading", "📈", "partly", { ko: "주식·장사 감각", en: "A head for trading", ja: "株・商売の勘", zh: "炒股与生意头脑", fr: "Le sens des affaires", es: "Olfato para los negocios" },
    { ko: "주식은 없지만, 2년 뒤인 1791년 신해통공으로 시전 상인의 독점이 대부분 풀려요. 미리 알고 있으면 큰 기회예요.", en: "No stock market, but in 1791 (two years on) the Sinhae reform lifts most market monopolies. Knowing it early is a real edge.", ja: "株はありませんが、2年後の1791年の辛亥通共で市廛商人の独占がほぼ解かれます。先に知っていれば大きな機会です。", zh: "没有股市，但两年后的1791年辛亥通共将解除大部分市廛专卖。提前知道就是大机会。", fr: "Pas de Bourse, mais en 1791 la réforme Sinhae lève la plupart des monopoles marchands : un vrai avantage.", es: "No hay bolsa, pero en 1791 la reforma Sinhae levanta casi todos los monopolios: una gran ventaja." }),
];

export const skillById = (id: string) => SKILLS.find((x) => x.id === id) ?? null;
export const MAX_SKILLS = 3;

export type Run = { trope: Trope; skills: SkillId[]; body: Life1789 | null };

/** 빙의 takes over a 1789 adult; 환생 is born that year (age 1); 타임슬립 arrives as yourself with no register entry. */
export function makeRun(trope: Trope, skills: SkillId[], age: number, rand: () => number = Math.random): Run {
  const picked = skills.filter((x, i) => skillById(x) && skills.indexOf(x) === i).slice(0, MAX_SKILLS);
  if (trope === "slip") return { trope, skills: picked, body: null };
  const body = draw1789({ age: trope === "reborn" ? 1 : Math.max(16, Math.min(age, 60)) }, rand);
  return { trope, skills: picked, body };
}

const STATUS_BASE: Record<Status, number> = { yangban: 3, sangmin: 2, nobi: 1 };

/** Play score: the body's footing plus skill points; a time-slipper has no register entry and starts lower. */
export function score(run: Run): number {
  const base = run.body ? STATUS_BASE[run.body.status] : 0;
  const skills = run.skills.reduce((acc, id) => acc + (skillById(id)?.points ?? 0), 0);
  // 환생 keeps memories but must grow up first: half the skill value, rounded down.
  return base + (run.trope === "reborn" ? Math.floor(skills / 2) : skills);
}

export type Ending = "days3" | "year1" | "years10" | "lifetime" | "legend";
export function ending(sc: number): Ending {
  if (sc <= 1) return "days3";
  if (sc <= 3) return "year1";
  if (sc <= 5) return "years10";
  if (sc <= 7) return "lifetime";
  return "legend";
}

export function formatRun(run: Run): string {
  const q = new URLSearchParams({ tr: run.trope, sk: run.skills.join(".") });
  if (run.body) new URLSearchParams(format1789(run.body)).forEach((v, k) => q.set(`b${k}`, v));
  return q.toString();
}

export function parseRun(search: string): Run | null {
  const q = new URLSearchParams(search);
  const trope = q.get("tr");
  if (trope !== "possess" && trope !== "reborn" && trope !== "slip") return null;
  const raw = (q.get("sk") ?? "").split(".").filter(Boolean);
  if (raw.length > MAX_SKILLS || raw.some((x) => !skillById(x))) return null;
  const skills = raw as SkillId[];
  if (trope === "slip") return { trope, skills, body: null };
  const inner = new URLSearchParams();
  q.forEach((v, k) => {
    if (k.length === 2 && k[0] === "b") inner.set(k[1], v);
  });
  const body = parse1789(inner.toString());
  if (!body || (trope === "reborn" && body.age !== 1)) return null;
  return { trope, skills, body };
}

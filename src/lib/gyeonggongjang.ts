// 경공장(京工匠): 『경국대전』 체제의 서울 관청 소속 장인.
// 인원은 출처에서 관청별 숫자를 확인한 자리만 담았다(합계 약 1,560명, 전체 2,795명 중).
// 근거: 한국민족문화대백과 E0002288 「경공장」, E0004428 「공장」, E0004444; 실록위키 「군기시」「상의원」「주장」「조지서」「사기장」.

type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };

export const AGENCIES: { hanja: string; name: Six; role: Six }[] = [
  { hanja: "司饔院", name: { ko: "사옹원", en: "Saongwon", ja: "司饔院", zh: "司饔院", fr: "Saongwon", es: "Saongwon" }, role: { ko: "궁중 음식과 그릇", en: "royal kitchen and tableware", ja: "宮中の食膳と器", zh: "宫廷膳食与器皿", fr: "cuisine et vaisselle royales", es: "cocina y vajilla reales" } },
  { hanja: "內需司", name: { ko: "내수사", en: "Naesusa", ja: "内需司", zh: "内需司", fr: "Naesusa", es: "Naesusa" }, role: { ko: "왕실 재산 관리", en: "royal household estate", ja: "王室の財産管理", zh: "王室财产管理", fr: "biens de la maison royale", es: "bienes de la casa real" } },
  { hanja: "軍器寺", name: { ko: "군기시", en: "Gungisi", ja: "軍器寺", zh: "军器寺", fr: "Gungisi", es: "Gungisi" }, role: { ko: "무기 제조 (경공장 최대 관청)", en: "arms making (the largest workshop)", ja: "武器の製造（最大の官庁）", zh: "制造兵器（最大的官署）", fr: "fabrication d'armes (le plus grand atelier)", es: "fabricación de armas (el mayor taller)" } },
  { hanja: "繕工監", name: { ko: "선공감", en: "Seongonggam", ja: "繕工監", zh: "缮工监", fr: "Seongonggam", es: "Seongonggam" }, role: { ko: "토목과 영선", en: "building works and repairs", ja: "土木と営繕", zh: "土木营缮", fr: "travaux et réparations", es: "obras y reparaciones" } },
  { hanja: "尙衣院", name: { ko: "상의원", en: "Sanguiwon", ja: "尚衣院", zh: "尚衣院", fr: "Sangeuiwon", es: "Sangeuiwon" }, role: { ko: "왕의 옷과 궁중 보물", en: "royal clothing and treasures", ja: "王の衣服と宝物", zh: "御衣与宫中宝物", fr: "vêtements et trésors royaux", es: "ropa y tesoros reales" } },
  { hanja: "工曹", name: { ko: "공조", en: "Ministry of Works", ja: "工曹", zh: "工曹", fr: "ministère des Travaux", es: "Ministerio de Obras" }, role: { ko: "공업과 장인 행정", en: "crafts and artisan registers", ja: "工業と職人の行政", zh: "工匠行政", fr: "artisanat et registres", es: "oficios y registros" } },
  { hanja: "校書館", name: { ko: "교서관", en: "Gyoseogwan", ja: "校書館", zh: "校书馆", fr: "Gyoseogwan", es: "Gyoseogwan" }, role: { ko: "책 인쇄", en: "book printing", ja: "書籍の印刷", zh: "印书", fr: "impression des livres", es: "impresión de libros" } },
  { hanja: "造紙署", name: { ko: "조지서", en: "Jojiseo", ja: "造紙署", zh: "造纸署", fr: "Jojiseo", es: "Jojiseo" }, role: { ko: "종이 제조", en: "paper making", ja: "紙の製造", zh: "造纸", fr: "fabrication du papier", es: "fabricación de papel" } },
];

const A = { saong: 0, naesu: 1, gungi: 2, seongong: 3, sangui: 4, gongjo: 5, gyoseo: 6, joji: 7 } as const;

export type Trade = { hanja: string; name: Six; made: Six; posts: [number, number][] };

export const TRADES: Trade[] = [
  { hanja: "沙器匠", name: { ko: "사기장", en: "porcelain maker", ja: "沙器匠（焼き物）", zh: "沙器匠（瓷器）", fr: "potier de porcelaine", es: "ceramista de porcelana" }, made: { ko: "궁중에서 쓰는 사기 그릇", en: "porcelain for the palace table", ja: "宮中で使う磁器", zh: "宫中用的瓷器", fr: "la porcelaine de la table royale", es: "la porcelana de la mesa real" }, posts: [[A.saong, 380], [A.naesu, 6]] },
  { hanja: "冶匠", name: { ko: "야장", en: "blacksmith", ja: "冶匠（鍛冶）", zh: "冶匠（铁匠）", fr: "forgeron", es: "herrero" }, made: { ko: "쇠를 달궈 두드린 연장과 무기", en: "forged tools and blades", ja: "鍛えた道具と刃物", zh: "锻打的工具和兵器", fr: "outils et lames forgés", es: "herramientas y hojas forjadas" }, posts: [[A.gungi, 130], [A.seongong, 40], [A.sangui, 8]] },
  { hanja: "矢人", name: { ko: "시인", en: "arrow maker", ja: "矢人（矢）", zh: "矢人（箭）", fr: "flécher", es: "flechero" }, made: { ko: "화살", en: "arrows", ja: "矢", zh: "箭", fr: "des flèches", es: "flechas" }, posts: [[A.gungi, 150], [A.sangui, 21]] },
  { hanja: "弓人", name: { ko: "궁인", en: "bow maker", ja: "弓人（弓）", zh: "弓人（弓）", fr: "facteur d'arcs", es: "arquero artesano" }, made: { ko: "활", en: "bows", ja: "弓", zh: "弓", fr: "des arcs", es: "arcos" }, posts: [[A.gungi, 90], [A.sangui, 18]] },
  { hanja: "鍊匠", name: { ko: "연장", en: "metal refiner", ja: "錬匠", zh: "炼匠", fr: "affineur de métal", es: "refinador de metal" }, made: { ko: "쇠를 불려 무기 재료로 다듬는 일", en: "refined iron for weapons", ja: "武器用に鉄を精錬", zh: "为兵器炼铁", fr: "le fer affiné pour les armes", es: "hierro refinado para armas" }, posts: [[A.gungi, 160]] },
  { hanja: "綾羅匠", name: { ko: "능라장", en: "silk weaver", ja: "綾羅匠（絹）", zh: "绫罗匠（丝绸）", fr: "tisserand de soie", es: "tejedor de seda" }, made: { ko: "무늬 비단", en: "patterned silk", ja: "紋様の絹", zh: "提花丝绸", fr: "de la soie façonnée", es: "seda labrada" }, posts: [[A.sangui, 105]] },
  { hanja: "紡織匠", name: { ko: "방직장", en: "weaver", ja: "紡織匠", zh: "纺织匠", fr: "tisserand", es: "tejedor" }, made: { ko: "실을 자아 짠 옷감", en: "spun and woven cloth", ja: "紡いで織った布", zh: "纺织的布料", fr: "du tissu filé et tissé", es: "tela hilada y tejida" }, posts: [[A.sangui, 20]] },
  { hanja: "鍊絲匠", name: { ko: "연사장", en: "silk-thread finisher", ja: "練糸匠", zh: "练丝匠", fr: "apprêteur de fil de soie", es: "acabador de hilo de seda" }, made: { ko: "비단실을 삶아 부드럽게 다듬는 일", en: "boiled and softened silk thread", ja: "絹糸を練って柔らかくする", zh: "把丝线练软", fr: "le fil de soie bouilli et assoupli", es: "hilo de seda hervido y suavizado" }, posts: [[A.sangui, 75], [A.gungi, 2]] },
  { hanja: "針線匠", name: { ko: "침선장", en: "royal tailor", ja: "針線匠（裁縫）", zh: "针线匠（缝纫）", fr: "couturier royal", es: "sastre real" }, made: { ko: "왕실 옷의 바느질", en: "sewing for royal clothes", ja: "王室の衣服の縫製", zh: "王室衣物的缝制", fr: "la couture des habits royaux", es: "la costura de la ropa real" }, posts: [[A.sangui, 40]] },
  { hanja: "甲匠", name: { ko: "갑장", en: "armourer", ja: "甲匠（甲冑）", zh: "甲匠（铠甲）", fr: "armurier", es: "armero" }, made: { ko: "갑옷", en: "armour", ja: "甲冑", zh: "铠甲", fr: "des armures", es: "armaduras" }, posts: [[A.gungi, 35]] },
  { hanja: "鑄匠", name: { ko: "주장", en: "caster", ja: "鋳匠（鋳物）", zh: "铸匠", fr: "fondeur", es: "fundidor" }, made: { ko: "쇳물을 부어 만든 기물 (교서관이라면 활자)", en: "cast metalwork (movable type, at the printing office)", ja: "鋳物（校書館なら活字）", zh: "铸件（在校书馆则是活字）", fr: "des pièces coulées (des caractères, à l'imprimerie)", es: "piezas fundidas (tipos móviles, en la imprenta)" }, posts: [[A.gongjo, 20], [A.gungi, 20], [A.naesu, 10], [A.gyoseo, 8], [A.sangui, 4]] },
  { hanja: "漆匠", name: { ko: "칠장", en: "lacquerer", ja: "漆匠（漆）", zh: "漆匠", fr: "laqueur", es: "lacador" }, made: { ko: "옻칠", en: "lacquerwork", ja: "漆塗り", zh: "漆器", fr: "des laques", es: "lacas" }, posts: [[A.gungi, 12], [A.sangui, 8]] },
  { hanja: "銀匠", name: { ko: "은장", en: "silversmith", ja: "銀匠", zh: "银匠", fr: "orfèvre en argent", es: "platero" }, made: { ko: "은 장신구와 그릇", en: "silver ornaments and vessels", ja: "銀の装身具と器", zh: "银饰和银器", fr: "bijoux et vaisselle d'argent", es: "joyas y vajilla de plata" }, posts: [[A.sangui, 8]] },
  { hanja: "磨造匠", name: { ko: "마조장", en: "polisher", ja: "磨造匠", zh: "磨造匠", fr: "polisseur", es: "pulidor" }, made: { ko: "칼과 쇠붙이를 갈아 다듬는 일", en: "ground and polished blades", ja: "刃物を研ぎ磨く", zh: "磨制刀具", fr: "le polissage des lames", es: "el pulido de hojas" }, posts: [[A.gungi, 12]] },
  { hanja: "錚匠", name: { ko: "쟁장", en: "gong maker", ja: "錚匠（鉦）", zh: "铮匠（钲）", fr: "fabricant de gongs", es: "fabricante de gongs" }, made: { ko: "군대에서 쓰는 징", en: "army gongs", ja: "軍用の鉦", zh: "军用的钲", fr: "des gongs militaires", es: "gongs militares" }, posts: [[A.gungi, 11]] },
  { hanja: "弓弦匠", name: { ko: "궁현장", en: "bowstring maker", ja: "弓弦匠", zh: "弓弦匠", fr: "fabricant de cordes d'arc", es: "cordelero de arcos" }, made: { ko: "활시위", en: "bowstrings", ja: "弓の弦", zh: "弓弦", fr: "des cordes d'arc", es: "cuerdas de arco" }, posts: [[A.gungi, 6]] },
  { hanja: "鼓匠", name: { ko: "고장", en: "drum maker", ja: "鼓匠（太鼓）", zh: "鼓匠", fr: "fabricant de tambours", es: "fabricante de tambores" }, made: { ko: "군대에서 쓰는 북", en: "army drums", ja: "軍用の太鼓", zh: "军鼓", fr: "des tambours militaires", es: "tambores militares" }, posts: [[A.gungi, 4]] },
  { hanja: "阿膠匠", name: { ko: "아교장", en: "glue maker", ja: "阿膠匠（膠）", zh: "阿胶匠", fr: "fabricant de colle", es: "fabricante de cola" }, made: { ko: "활과 무기를 붙이는 아교", en: "glue for bows and weapons", ja: "弓や武器の膠", zh: "粘弓和兵器的胶", fr: "la colle des arcs", es: "cola para arcos" }, posts: [[A.gungi, 2]] },
  { hanja: "紙匠", name: { ko: "지장", en: "paper maker", ja: "紙匠（紙）", zh: "纸匠", fr: "papetier", es: "papelero" }, made: { ko: "닥나무 종이", en: "mulberry paper", ja: "楮の紙", zh: "楮皮纸", fr: "du papier de mûrier", es: "papel de morera" }, posts: [[A.joji, 81]] },
  { hanja: "簾匠", name: { ko: "염장", en: "screen maker", ja: "簾匠（簾）", zh: "帘匠", fr: "fabricant de stores", es: "fabricante de persianas" }, made: { ko: "종이를 뜨는 발", en: "screens for lifting paper", ja: "紙を漉く簾", zh: "抄纸的帘子", fr: "les tamis à papier", es: "tamices para papel" }, posts: [[A.joji, 8]] },
];

export const SEATS = TRADES.flatMap((t, ti) => t.posts.map(([ai, n], pi) => ({ ti, pi, ai, n })));
export const SEAT_TOTAL = SEATS.reduce((s, x) => s + x.n, 0);
export const TOTAL_GYEONG = 2795; // 경국대전 기준 경공장 총원(백과·실록위키), 우리역사넷은 2,841
export const TRADE_TOTAL = (t: Trade) => t.posts.reduce((s, [, n]) => s + n, 0);

export type Seat = { ti: number; pi: number };

export function drawSeat(rand: () => number = Math.random): Seat {
  let r = Math.floor(rand() * SEAT_TOTAL);
  for (const s of SEATS) {
    if (r < s.n) return { ti: s.ti, pi: s.pi };
    r -= s.n;
  }
  const last = SEATS[SEATS.length - 1]!;
  return { ti: last.ti, pi: last.pi };
}

/** 조지서 지장은 3교대, 나머지는 2교대(한국민족문화대백과 E0004444) */
export const shiftsOf = (s: Seat) => (TRADES[s.ti]!.posts[s.pi]![0] === A.joji ? 3 : 2);

export const formatSeat = (s: Seat) => `j=${s.ti}.${s.pi}`;
export function parseSeat(search: string): Seat | null {
  const v = new URLSearchParams(search).get("j");
  if (!v || !/^\d{1,2}\.\d$/.test(v)) return null;
  const [ti, pi] = v.split(".").map(Number) as [number, number];
  if (!TRADES[ti] || !TRADES[ti]!.posts[pi]) return null;
  return { ti, pi };
}

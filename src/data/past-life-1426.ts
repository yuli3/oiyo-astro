// 600 years ago = 1426 (Sejong year 8). Data for /past-life-1426/ (2026-11-02).
// Every weight below is a count copied from a named source; the trait vectors on the
// groups are authored game coordinates (see lib/past-life-1426.ts), not measurements.

export type Axis = "principle" | "tradition" | "action";
export type Vector = Record<Axis, number>;

type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };

// ── Joseon ──────────────────────────────────────────────────────────────────
// Seats = 정원 in 경국대전(1485) as summarised by 한국민족문화대백과 (외관직 E0039214) and
// Wikipedia "Politics of Joseon" (의정부 12, 사헌부 30, 사간원 5, 승지 6). The code was
// compiled 59 years after 1426, so numbers are the closest codified roster, not a 1426 census.
// 6조 정랑/좌랑: 이·호·예·공 3명씩, 병·형 4명씩 (경국대전 이전 京官職).
export type JoseonGroup = "council" | "ministry" | "censor" | "secretariat" | "magistrate" | "military";

export interface JoseonPost {
  id: string;
  ko: string;
  hanja: string;
  en: string;
  rank: string; // 품계, e.g. 정1품
  rankEn: string;
  seats: number;
  group: JoseonGroup;
}

export const JOSEON_POSTS: JoseonPost[] = [
  { id: "yeonguijeong", ko: "영의정", hanja: "領議政", en: "Chief State Councillor", rank: "정1품", rankEn: "Senior 1st rank", seats: 1, group: "council" },
  { id: "jwauijeong", ko: "좌의정", hanja: "左議政", en: "Left State Councillor", rank: "정1품", rankEn: "Senior 1st rank", seats: 1, group: "council" },
  { id: "uuijeong", ko: "우의정", hanja: "右議政", en: "Right State Councillor", rank: "정1품", rankEn: "Senior 1st rank", seats: 1, group: "council" },
  { id: "chanseong", ko: "찬성", hanja: "贊成", en: "Assistant State Councillor", rank: "종1품", rankEn: "Junior 1st rank", seats: 2, group: "council" },
  { id: "chamchan", ko: "참찬", hanja: "參贊", en: "State Council Adviser", rank: "정2품", rankEn: "Senior 2nd rank", seats: 2, group: "council" },
  { id: "sain", ko: "의정부 사인", hanja: "舍人", en: "State Council Secretary", rank: "정4품", rankEn: "Senior 4th rank", seats: 2, group: "ministry" },
  { id: "geomsang", ko: "의정부 검상", hanja: "檢詳", en: "State Council Examiner", rank: "정5품", rankEn: "Senior 5th rank", seats: 1, group: "ministry" },
  { id: "sarok", ko: "의정부 사록", hanja: "司錄", en: "State Council Recorder", rank: "정8품", rankEn: "Senior 8th rank", seats: 2, group: "ministry" },
  { id: "panseo", ko: "판서", hanja: "判書", en: "Minister (one of six ministries)", rank: "정2품", rankEn: "Senior 2nd rank", seats: 6, group: "ministry" },
  { id: "champan", ko: "참판", hanja: "參判", en: "Vice Minister", rank: "종2품", rankEn: "Junior 2nd rank", seats: 6, group: "ministry" },
  { id: "chamui", ko: "참의", hanja: "參議", en: "Ministry Counsellor", rank: "정3품", rankEn: "Senior 3rd rank", seats: 6, group: "ministry" },
  { id: "jeongnang", ko: "정랑", hanja: "正郞", en: "Ministry Director", rank: "정5품", rankEn: "Senior 5th rank", seats: 20, group: "ministry" },
  { id: "jwarang", ko: "좌랑", hanja: "佐郞", en: "Ministry Deputy Director", rank: "정6품", rankEn: "Senior 6th rank", seats: 20, group: "ministry" },
  { id: "daesaheon", ko: "대사헌", hanja: "大司憲", en: "Inspector-General", rank: "종2품", rankEn: "Junior 2nd rank", seats: 1, group: "censor" },
  { id: "jibui", ko: "집의", hanja: "執義", en: "Deputy Inspector", rank: "종3품", rankEn: "Junior 3rd rank", seats: 1, group: "censor" },
  { id: "jangnyeong", ko: "장령", hanja: "掌令", en: "Inspector", rank: "정4품", rankEn: "Senior 4th rank", seats: 2, group: "censor" },
  { id: "jipyeong", ko: "지평", hanja: "持平", en: "Junior Inspector", rank: "정5품", rankEn: "Senior 5th rank", seats: 2, group: "censor" },
  { id: "gamchal", ko: "감찰", hanja: "監察", en: "Audit Inspector", rank: "정6품", rankEn: "Senior 6th rank", seats: 24, group: "censor" },
  { id: "daesagan", ko: "대사간", hanja: "大司諫", en: "Censor-General", rank: "정3품", rankEn: "Senior 3rd rank", seats: 1, group: "censor" },
  { id: "sagan", ko: "사간", hanja: "司諫", en: "Deputy Censor", rank: "종3품", rankEn: "Junior 3rd rank", seats: 1, group: "censor" },
  { id: "heonnap", ko: "헌납", hanja: "獻納", en: "Censor", rank: "정5품", rankEn: "Senior 5th rank", seats: 1, group: "censor" },
  { id: "jeongeon", ko: "정언", hanja: "正言", en: "Junior Censor", rank: "정6품", rankEn: "Senior 6th rank", seats: 2, group: "censor" },
  { id: "doseungji", ko: "도승지", hanja: "都承旨", en: "Chief Royal Secretary", rank: "정3품 당상", rankEn: "Senior 3rd rank (upper)", seats: 1, group: "secretariat" },
  { id: "seungji", ko: "승지", hanja: "承旨", en: "Royal Secretary", rank: "정3품 당상", rankEn: "Senior 3rd rank (upper)", seats: 5, group: "secretariat" },
  { id: "gwanchalsa", ko: "관찰사", hanja: "觀察使", en: "Provincial Governor", rank: "종2품", rankEn: "Junior 2nd rank", seats: 8, group: "magistrate" },
  { id: "buyun", ko: "부윤", hanja: "府尹", en: "Prefect of a major city", rank: "종2품", rankEn: "Junior 2nd rank", seats: 4, group: "magistrate" },
  { id: "daedohobusa", ko: "대도호부사", hanja: "大都護府使", en: "Grand Protectorate Magistrate", rank: "정3품", rankEn: "Senior 3rd rank", seats: 4, group: "magistrate" },
  { id: "moksa", ko: "목사", hanja: "牧使", en: "Mok Magistrate", rank: "정3품", rankEn: "Senior 3rd rank", seats: 20, group: "magistrate" },
  { id: "dohobusa", ko: "도호부사", hanja: "都護府使", en: "Protectorate Magistrate", rank: "종3품", rankEn: "Junior 3rd rank", seats: 44, group: "magistrate" },
  { id: "gunsu", ko: "군수", hanja: "郡守", en: "County Magistrate", rank: "종4품", rankEn: "Junior 4th rank", seats: 82, group: "magistrate" },
  { id: "hyeollyeong", ko: "현령", hanja: "縣令", en: "District Magistrate", rank: "종5품", rankEn: "Junior 5th rank", seats: 34, group: "magistrate" },
  { id: "hyeongam", ko: "현감", hanja: "縣監", en: "Township Magistrate", rank: "종6품", rankEn: "Junior 6th rank", seats: 141, group: "magistrate" },
  { id: "jibangmugwan", ko: "지방 무관(병마·수군 지휘관)", hanja: "外官 武職", en: "Provincial military commander", rank: "종2품~종6품", rankEn: "Junior 2nd–6th rank", seats: 103, group: "military" },
];

export const JOSEON_SOURCES = [
  { label: "한국민족문화대백과사전 「외관직」", url: "https://encykorea.aks.ac.kr/Article/E0039214" },
  { label: "Wikipedia, Politics of Joseon (CC BY-SA 4.0)", url: "https://en.wikipedia.org/wiki/Politics_of_Joseon" },
];

// ── Europe, 1426 ────────────────────────────────────────────────────────────
// One throne per realm, the ruler who actually held it in 1426. Reign years follow the
// English Wikipedia article for each ruler (facts; Wikidata CC0 carries the same data).
export type RealmKind = "kingdom" | "empire" | "church" | "order" | "republic" | "duchy";

export interface Realm {
  id: string;
  name: Six;
  title: Six;
  ruler: string; // ruler's name in English (Latin script), shown for every locale
  reign: string;
  kind: RealmKind;
  note?: Partial<Six>;
}

const t = (ko: string, en: string, ja: string, zh: string, fr: string, es: string): Six => ({ ko, en, ja, zh, fr, es });
const KING = t("왕", "King", "国王", "国王", "Roi", "Rey");
const QUEEN = t("여왕", "Queen", "女王", "女王", "Reine", "Reina");
const DUKE = t("공작", "Duke", "公爵", "公爵", "Duc", "Duque");

export const REALMS_1426: Realm[] = [
  { id: "england", name: t("잉글랜드 왕국", "Kingdom of England", "イングランド王国", "英格兰王国", "Royaume d'Angleterre", "Reino de Inglaterra"), title: KING, ruler: "Henry VI", reign: "1422–1461", kind: "kingdom", note: t("네 살 왕이라 실제 정치는 섭정이 했어요.", "He was four; regents governed.", "4歳の王で、実際の政治は摂政が行いました。", "国王才四岁，由摄政理政。", "Il avait quatre ans ; des régents gouvernaient.", "Tenía cuatro años; gobernaban regentes.") },
  { id: "france", name: t("프랑스 왕국", "Kingdom of France", "フランス王国", "法兰西王国", "Royaume de France", "Reino de Francia"), title: KING, ruler: "Charles VII", reign: "1422–1461", kind: "kingdom", note: t("백년전쟁 중이라 잉글랜드 헨리 6세도 프랑스 왕을 자처했어요.", "Mid-Hundred Years' War; Henry VI of England also claimed the crown.", "百年戦争中で、イングランドのヘンリー6世も王位を主張しました。", "百年战争期间，英格兰亨利六世也自称法王。", "En pleine guerre de Cent Ans ; Henri VI d'Angleterre revendiquait aussi la couronne.", "En plena guerra de los Cien Años; Enrique VI de Inglaterra también reclamaba la corona.") },
  { id: "scotland", name: t("스코틀랜드 왕국", "Kingdom of Scotland", "スコットランド王国", "苏格兰王国", "Royaume d'Écosse", "Reino de Escocia"), title: KING, ruler: "James I", reign: "1406–1437", kind: "kingdom" },
  { id: "castile", name: t("카스티야 왕국", "Crown of Castile", "カスティーリャ王国", "卡斯蒂利亚王国", "Couronne de Castille", "Corona de Castilla"), title: KING, ruler: "John II", reign: "1406–1454", kind: "kingdom" },
  { id: "aragon", name: t("아라곤 왕국", "Crown of Aragon", "アラゴン王国", "阿拉贡王国", "Couronne d'Aragon", "Corona de Aragón"), title: KING, ruler: "Alfonso V", reign: "1416–1458", kind: "kingdom" },
  { id: "portugal", name: t("포르투갈 왕국", "Kingdom of Portugal", "ポルトガル王国", "葡萄牙王国", "Royaume de Portugal", "Reino de Portugal"), title: KING, ruler: "John I", reign: "1385–1433", kind: "kingdom", note: t("아들 엔히크 왕자가 대항해시대를 막 열던 때예요.", "His son Prince Henry was opening the age of exploration.", "息子のエンリケ王子が大航海時代を開きつつありました。", "其子恩里克王子正开启大航海时代。", "Son fils Henri le Navigateur ouvrait l'ère des découvertes.", "Su hijo Enrique el Navegante abría la era de los descubrimientos.") },
  { id: "navarre", name: t("나바라 왕국", "Kingdom of Navarre", "ナバラ王国", "纳瓦拉王国", "Royaume de Navarre", "Reino de Navarra"), title: QUEEN, ruler: "Blanche I", reign: "1425–1441", kind: "kingdom" },
  { id: "kalmar", name: t("칼마르 동맹(덴마크·노르웨이·스웨덴)", "Kalmar Union (Denmark, Norway, Sweden)", "カルマル同盟（デンマーク・ノルウェー・スウェーデン）", "卡尔马联盟（丹麦·挪威·瑞典）", "Union de Kalmar (Danemark, Norvège, Suède)", "Unión de Kalmar (Dinamarca, Noruega, Suecia)"), title: KING, ruler: "Eric of Pomerania", reign: "1396–1439", kind: "kingdom", note: t("왕관 하나로 북유럽 세 나라를 다스렸어요.", "One crown over three Nordic kingdoms.", "一つの王冠で北欧三国を治めました。", "一顶王冠统治北欧三国。", "Une seule couronne pour trois royaumes nordiques.", "Una sola corona para tres reinos nórdicos.") },
  { id: "poland", name: t("폴란드 왕국", "Kingdom of Poland", "ポーランド王国", "波兰王国", "Royaume de Pologne", "Reino de Polonia"), title: KING, ruler: "Władysław II Jagiełło", reign: "1386–1434", kind: "kingdom" },
  { id: "lithuania", name: t("리투아니아 대공국", "Grand Duchy of Lithuania", "リトアニア大公国", "立陶宛大公国", "Grand-duché de Lituanie", "Gran Ducado de Lituania"), title: t("대공", "Grand Duke", "大公", "大公", "Grand-duc", "Gran duque"), ruler: "Vytautas", reign: "1392–1430", kind: "duchy", note: t("당시 유럽에서 가장 넓은 나라 중 하나였어요.", "One of the largest states in Europe at the time.", "当時ヨーロッパで最も広い国の一つでした。", "当时欧洲疆域最大的国家之一。", "L'un des plus vastes États d'Europe à l'époque.", "Uno de los estados más extensos de Europa entonces.") },
  { id: "hungary", name: t("헝가리 왕국", "Kingdom of Hungary", "ハンガリー王国", "匈牙利王国", "Royaume de Hongrie", "Reino de Hungría"), title: KING, ruler: "Sigismund", reign: "1387–1437", kind: "kingdom" },
  { id: "hre", name: t("신성로마제국", "Holy Roman Empire", "神聖ローマ帝国", "神圣罗马帝国", "Saint-Empire romain germanique", "Sacro Imperio Romano Germánico"), title: t("로마왕(황제 선출자)", "King of the Romans", "ローマ王", "罗马人民的国王", "Roi des Romains", "Rey de romanos"), ruler: "Sigismund", reign: "1411–1437", kind: "empire", note: t("헝가리 왕과 같은 사람이에요. 황제 대관은 1433년이에요.", "Same man as the King of Hungary; crowned emperor in 1433.", "ハンガリー王と同一人物で、皇帝戴冠は1433年です。", "与匈牙利国王是同一人，1433年加冕为皇帝。", "Le même que le roi de Hongrie ; couronné empereur en 1433.", "El mismo que el rey de Hungría; coronado emperador en 1433.") },
  { id: "naples", name: t("나폴리 왕국", "Kingdom of Naples", "ナポリ王国", "那不勒斯王国", "Royaume de Naples", "Reino de Nápoles"), title: QUEEN, ruler: "Joanna II", reign: "1414–1435", kind: "kingdom" },
  { id: "cyprus", name: t("키프로스 왕국", "Kingdom of Cyprus", "キプロス王国", "塞浦路斯王国", "Royaume de Chypre", "Reino de Chipre"), title: KING, ruler: "Janus", reign: "1398–1432", kind: "kingdom", note: t("1426년 이집트 맘루크군에 패해 포로가 됐어요.", "Captured by the Mamluks in 1426.", "1426年にマムルーク軍に敗れ捕虜となりました。", "1426年被马穆鲁克军俘虏。", "Capturé par les Mamelouks en 1426.", "Capturado por los mamelucos en 1426.") },
  { id: "bosnia", name: t("보스니아 왕국", "Kingdom of Bosnia", "ボスニア王国", "波斯尼亚王国", "Royaume de Bosnie", "Reino de Bosnia"), title: KING, ruler: "Tvrtko II", reign: "1421–1443", kind: "kingdom" },
  { id: "papal", name: t("교황령", "Papal States", "教皇領", "教皇国", "États pontificaux", "Estados Pontificios"), title: t("교황", "Pope", "教皇", "教宗", "Pape", "Papa"), ruler: "Martin V", reign: "1417–1431", kind: "church", note: t("교회 대분열을 끝낸 교황이에요.", "The pope who ended the Western Schism.", "教会大分裂を終わらせた教皇です。", "结束西方教会大分裂的教宗。", "Le pape qui mit fin au Grand Schisme.", "El papa que puso fin al Cisma de Occidente.") },
  { id: "venice", name: t("베네치아 공화국", "Republic of Venice", "ヴェネツィア共和国", "威尼斯共和国", "République de Venise", "República de Venecia"), title: t("도제", "Doge", "ドージェ", "总督", "Doge", "Dux"), ruler: "Francesco Foscari", reign: "1423–1457", kind: "republic" },
  { id: "florence", name: t("피렌체 공화국", "Republic of Florence", "フィレンツェ共和国", "佛罗伦萨共和国", "République de Florence", "República de Florencia"), title: t("정의의 기수(곤팔로니에레)", "Gonfaloniere of Justice", "正義の旗手", "正义旗手", "Gonfalonier de justice", "Gonfaloniero de justicia"), ruler: "—", reign: "1426", kind: "republic", note: t("두 달마다 추첨으로 바뀌는 자리라 이름 대신 자리만 남겨요.", "Rotated every two months by lot, so no single holder.", "2か月ごとにくじで交代する職なので、名前は載せません。", "每两个月抽签轮换，所以不写具体人名。", "Tiré au sort tous les deux mois : pas de titulaire unique.", "Se sorteaba cada dos meses: no hay un único titular.") },
  { id: "milan", name: t("밀라노 공국", "Duchy of Milan", "ミラノ公国", "米兰公国", "Duché de Milan", "Ducado de Milán"), title: DUKE, ruler: "Filippo Maria Visconti", reign: "1412–1447", kind: "duchy" },
  { id: "savoy", name: t("사보이아 공국", "Duchy of Savoy", "サヴォイア公国", "萨伏依公国", "Duché de Savoie", "Ducado de Saboya"), title: DUKE, ruler: "Amadeus VIII", reign: "1416–1440", kind: "duchy" },
  { id: "burgundy", name: t("부르고뉴 공국", "Duchy of Burgundy", "ブルゴーニュ公国", "勃艮第公国", "Duché de Bourgogne", "Ducado de Borgoña"), title: DUKE, ruler: "Philip the Good", reign: "1419–1467", kind: "duchy" },
  { id: "brittany", name: t("브르타뉴 공국", "Duchy of Brittany", "ブルターニュ公国", "布列塔尼公国", "Duché de Bretagne", "Ducado de Bretaña"), title: DUKE, ruler: "John V", reign: "1399–1442", kind: "duchy" },
  { id: "austria", name: t("오스트리아 공국", "Duchy of Austria", "オーストリア公国", "奥地利公国", "Duché d'Autriche", "Ducado de Austria"), title: DUKE, ruler: "Albert V", reign: "1404–1439", kind: "duchy" },
  { id: "moldavia", name: t("몰다비아 공국", "Principality of Moldavia", "モルダヴィア公国", "摩尔达维亚公国", "Principauté de Moldavie", "Principado de Moldavia"), title: t("공(보이보드)", "Voivode", "公", "大公", "Voïvode", "Voivoda"), ruler: "Alexander the Good", reign: "1400–1432", kind: "duchy" },
  { id: "serbia", name: t("세르비아 전제공국", "Serbian Despotate", "セルビア専制公国", "塞尔维亚君主国", "Despotat de Serbie", "Despotado de Serbia"), title: t("전제공", "Despot", "専制公", "君主", "Despote", "Déspota"), ruler: "Stefan Lazarević", reign: "1402–1427", kind: "duchy" },
  { id: "muscovy", name: t("모스크바 대공국", "Grand Duchy of Moscow", "モスクワ大公国", "莫斯科大公国", "Grand-duché de Moscou", "Gran Ducado de Moscú"), title: t("대공", "Grand Prince", "大公", "大公", "Grand-prince", "Gran príncipe"), ruler: "Vasily II", reign: "1425–1462", kind: "duchy" },
  { id: "byzantium", name: t("동로마(비잔티움) 제국", "Byzantine Empire", "東ローマ（ビザンツ）帝国", "东罗马（拜占庭）帝国", "Empire byzantin", "Imperio bizantino"), title: t("황제", "Emperor", "皇帝", "皇帝", "Empereur", "Emperador"), ruler: "John VIII Palaiologos", reign: "1425–1448", kind: "empire", note: t("콘스탄티노폴리스 함락 27년 전이에요.", "27 years before the fall of Constantinople.", "コンスタンティノープル陥落の27年前です。", "君士坦丁堡陷落前27年。", "27 ans avant la chute de Constantinople.", "27 años antes de la caída de Constantinopla.") },
  { id: "ottoman", name: t("오스만 제국", "Ottoman Empire", "オスマン帝国", "奥斯曼帝国", "Empire ottoman", "Imperio otomano"), title: t("술탄", "Sultan", "スルタン", "苏丹", "Sultan", "Sultán"), ruler: "Murad II", reign: "1421–1451", kind: "empire" },
  { id: "teutonic", name: t("튜턴 기사단국", "State of the Teutonic Order", "ドイツ騎士団国", "条顿骑士团国", "État monastique des chevaliers Teutoniques", "Estado de la Orden Teutónica"), title: t("기사단장", "Grand Master", "総長", "大团长", "Grand maître", "Gran maestre"), ruler: "Paul von Rusdorf", reign: "1422–1441", kind: "order" },
  { id: "hospitaller", name: t("로도스 구호기사단", "Knights Hospitaller (Rhodes)", "ロードス騎士団", "罗得岛医院骑士团", "Hospitaliers (Rhodes)", "Hospitalarios (Rodas)"), title: t("기사단장", "Grand Master", "総長", "大团长", "Grand maître", "Gran maestre"), ruler: "Antoni de Fluvià", reign: "1421–1437", kind: "order" },
];

export const EUROPE_SOURCES = [
  { label: "Wikipedia ruler articles (CC BY-SA 4.0) · Wikidata (CC0)", url: "https://www.wikidata.org/" },
];

// ── United States ───────────────────────────────────────────────────────────
// Births by state of residence, 2024. KFF table of CDC NCHS NVSS natality data (CDC WONDER),
// fetched 2026-11-02. US federal data is public domain. Total 3,628,934.
export type UsRegion = "northeast" | "midwest" | "south" | "west"; // US Census Bureau regions

export interface UsState {
  code: string;
  births: number;
  region: UsRegion;
  name: Six;
}

const s = (code: string, births: number, region: UsRegion, en: string, ko: string, ja: string, zh: string, fr = en, es = en): UsState => ({
  code, births, region, name: { ko, en, ja, zh, fr, es },
});

export const US_STATES: UsState[] = [
  s("AL", 57934, "south", "Alabama", "앨라배마", "アラバマ", "亚拉巴马"),
  s("AK", 8943, "west", "Alaska", "알래스카", "アラスカ", "阿拉斯加"),
  s("AZ", 78711, "west", "Arizona", "애리조나", "アリゾナ", "亚利桑那"),
  s("AR", 35395, "south", "Arkansas", "아칸소", "アーカンソー", "阿肯色"),
  s("CA", 402075, "west", "California", "캘리포니아", "カリフォルニア", "加利福尼亚", "Californie"),
  s("CO", 64268, "west", "Colorado", "콜로라도", "コロラド", "科罗拉多"),
  s("CT", 34599, "northeast", "Connecticut", "코네티컷", "コネチカット", "康涅狄格"),
  s("DE", 10550, "south", "Delaware", "델라웨어", "デラウェア", "特拉华"),
  s("DC", 7616, "south", "District of Columbia", "워싱턴 D.C.", "ワシントンD.C.", "华盛顿特区", "District de Columbia", "Distrito de Columbia"),
  s("FL", 224389, "south", "Florida", "플로리다", "フロリダ", "佛罗里达", "Floride"),
  s("GA", 126437, "south", "Georgia", "조지아", "ジョージア", "佐治亚", "Géorgie"),
  s("HI", 14917, "west", "Hawaii", "하와이", "ハワイ", "夏威夷", "Hawaï", "Hawái"),
  s("ID", 23276, "west", "Idaho", "아이다호", "アイダホ", "爱达荷"),
  s("IL", 125731, "midwest", "Illinois", "일리노이", "イリノイ", "伊利诺伊"),
  s("IN", 80257, "midwest", "Indiana", "인디애나", "インディアナ", "印第安纳"),
  s("IA", 36436, "midwest", "Iowa", "아이오와", "アイオワ", "艾奥瓦"),
  s("KS", 33984, "midwest", "Kansas", "캔자스", "カンザス", "堪萨斯"),
  s("KY", 52913, "south", "Kentucky", "켄터키", "ケンタッキー", "肯塔基"),
  s("LA", 53305, "south", "Louisiana", "루이지애나", "ルイジアナ", "路易斯安那", "Louisiane", "Luisiana"),
  s("ME", 11601, "northeast", "Maine", "메인", "メイン", "缅因"),
  s("MD", 65797, "south", "Maryland", "메릴랜드", "メリーランド", "马里兰"),
  s("MA", 68184, "northeast", "Massachusetts", "매사추세츠", "マサチューセッツ", "马萨诸塞"),
  s("MI", 99525, "midwest", "Michigan", "미시간", "ミシガン", "密歇根", "Michigan", "Míchigan"),
  s("MN", 62110, "midwest", "Minnesota", "미네소타", "ミネソタ", "明尼苏达"),
  s("MS", 33473, "south", "Mississippi", "미시시피", "ミシシッピ", "密西西比", "Mississippi", "Misisipi"),
  s("MO", 67998, "midwest", "Missouri", "미주리", "ミズーリ", "密苏里", "Missouri", "Misuri"),
  s("MT", 11331, "west", "Montana", "몬태나", "モンタナ", "蒙大拿"),
  s("NE", 24785, "midwest", "Nebraska", "네브래스카", "ネブラスカ", "内布拉斯加"),
  s("NV", 32381, "west", "Nevada", "네바다", "ネバダ", "内华达"),
  s("NH", 11770, "northeast", "New Hampshire", "뉴햄프셔", "ニューハンプシャー", "新罕布什尔", "New Hampshire", "Nuevo Hampshire"),
  s("NJ", 101372, "northeast", "New Jersey", "뉴저지", "ニュージャージー", "新泽西", "New Jersey", "Nueva Jersey"),
  s("NM", 21328, "west", "New Mexico", "뉴멕시코", "ニューメキシコ", "新墨西哥", "Nouveau-Mexique", "Nuevo México"),
  s("NY", 205489, "northeast", "New York", "뉴욕", "ニューヨーク", "纽约", "État de New York", "Nueva York"),
  s("NC", 122856, "south", "North Carolina", "노스캐롤라이나", "ノースカロライナ", "北卡罗来纳", "Caroline du Nord", "Carolina del Norte"),
  s("ND", 9634, "midwest", "North Dakota", "노스다코타", "ノースダコタ", "北达科他", "Dakota du Nord", "Dakota del Norte"),
  s("OH", 126795, "midwest", "Ohio", "오하이오", "オハイオ", "俄亥俄"),
  s("OK", 47962, "south", "Oklahoma", "오클라호마", "オクラホマ", "俄克拉何马"),
  s("OR", 38963, "west", "Oregon", "오리건", "オレゴン", "俄勒冈", "Oregon", "Oregón"),
  s("PA", 127299, "northeast", "Pennsylvania", "펜실베이니아", "ペンシルベニア", "宾夕法尼亚", "Pennsylvanie", "Pensilvania"),
  s("RI", 10009, "northeast", "Rhode Island", "로드아일랜드", "ロードアイランド", "罗得岛"),
  s("SC", 58768, "south", "South Carolina", "사우스캐롤라이나", "サウスカロライナ", "南卡罗来纳", "Caroline du Sud", "Carolina del Sur"),
  s("SD", 11451, "midwest", "South Dakota", "사우스다코타", "サウスダコタ", "南达科他", "Dakota du Sud", "Dakota del Sur"),
  s("TN", 83833, "south", "Tennessee", "테네시", "テネシー", "田纳西"),
  s("TX", 390828, "south", "Texas", "텍사스", "テキサス", "得克萨斯"),
  s("UT", 46664, "west", "Utah", "유타", "ユタ", "犹他"),
  s("VT", 5023, "northeast", "Vermont", "버몬트", "バーモント", "佛蒙特"),
  s("VA", 94054, "south", "Virginia", "버지니아", "バージニア", "弗吉尼亚", "Virginie"),
  s("WA", 83118, "west", "Washington", "워싱턴주", "ワシントン州", "华盛顿州", "État de Washington", "Washington"),
  s("WV", 17022, "south", "West Virginia", "웨스트버지니아", "ウェストバージニア", "西弗吉尼亚", "Virginie-Occidentale", "Virginia Occidental"),
  s("WI", 59686, "midwest", "Wisconsin", "위스콘신", "ウィスコンシン", "威斯康星"),
  s("WY", 6089, "west", "Wyoming", "와이오밍", "ワイオミング", "怀俄明"),
];

export const US_SOURCES = [
  { label: "CDC NCHS NVSS natality 2024 via KFF State Health Facts", url: "https://www.kff.org/other/state-indicator/number-of-births/" },
];

// ── Authored trait coordinates (game design, 2026-11-02) ────────────────────
// Axes reuse the Joseon two-lens axes: principle(+원칙/명분 · −실리), tradition(+전통 ·
// −변화), action(+행동 · −숙고). These are NOT empirical claims about offices, realms or states.
export const JOSEON_GROUP_VECTORS: Record<JoseonGroup, Vector> = {
  council: { principle: 0.4, tradition: 0.9, action: -0.3 },
  ministry: { principle: -0.5, tradition: 0.3, action: 0.2 },
  censor: { principle: 1, tradition: 0.1, action: 0.6 },
  secretariat: { principle: 0.2, tradition: 0.5, action: -0.8 },
  magistrate: { principle: -0.6, tradition: -0.2, action: 0.5 },
  military: { principle: -0.2, tradition: -0.6, action: 1 },
};

export const REALM_KIND_VECTORS: Record<RealmKind, Vector> = {
  kingdom: { principle: 0.1, tradition: 0.6, action: 0.3 },
  empire: { principle: 0.4, tradition: 1, action: 0.6 },
  church: { principle: 1, tradition: 0.8, action: -0.6 },
  order: { principle: 0.8, tradition: 0.3, action: 1 },
  republic: { principle: -0.8, tradition: -0.4, action: -0.1 },
  duchy: { principle: -0.4, tradition: -0.2, action: 0.6 },
};

export const US_REGION_VECTORS: Record<UsRegion, Vector> = {
  northeast: { principle: 0.6, tradition: 0.1, action: -0.5 },
  south: { principle: 0.1, tradition: 0.9, action: 0.2 },
  midwest: { principle: -0.4, tradition: 0.4, action: -0.6 },
  west: { principle: -0.4, tradition: -0.9, action: 0.8 },
};

// ── Joseon provinces (세종실록 지리지, compiled 1432, printed with the Sejong Sillok 1454) ──
// 호·구 per 도 and three of each 도's listed 厥貢 (tribute) items, read from the Wikisource
// transcription of 세종실록 148–155권 on 2026-11-02. The original text is public domain.
// Recorded 口 counts tax-liable people, not everyone: the total (692,477) is far below the real
// population, so this is "where the registers put you", not a census share.
export interface JoseonProvince {
  id: string;
  ko: string;
  hanja: string;
  en: string;
  households: number;
  people: number;
  volume: number;
  tribute: { hanja: string; ko: string; en: string; fr: string; es: string }[];
}

const tr = (hanja: string, ko: string, en: string, fr: string, es: string) => ({ hanja, ko, en, fr, es });

export const JOSEON_PROVINCES: JoseonProvince[] = [
  { id: "gyeonggi", ko: "경기", hanja: "京畿", en: "Gyeonggi", households: 20882, people: 50352, volume: 148, tribute: [tr("木瓜", "모과", "quince", "coing", "membrillo"), tr("栗", "밤", "chestnuts", "châtaignes", "castañas"), tr("山參", "산삼", "wild ginseng", "ginseng sauvage", "ginseng silvestre")] },
  { id: "chungcheong", ko: "충청도", hanja: "忠淸道", en: "Chungcheong", households: 24170, people: 100790, volume: 149, tribute: [tr("虎皮", "호랑이 가죽", "tiger pelts", "peaux de tigre", "pieles de tigre"), tr("熊皮", "곰 가죽", "bear hides", "peaux d'ours", "pieles de oso"), tr("鹿", "사슴", "deer", "cerfs", "ciervos")] },
  { id: "gyeongsang", ko: "경상도", hanja: "慶尙道", en: "Gyeongsang", households: 42227, people: 173759, volume: 150, tribute: [tr("虎皮", "호랑이 가죽", "tiger pelts", "peaux de tigre", "pieles de tigre"), tr("鹿皮", "사슴 가죽", "deerskins", "peaux de cerf", "pieles de ciervo"), tr("山水獺皮", "수달 가죽", "otter pelts", "peaux de loutre", "pieles de nutria")] },
  { id: "jeolla", ko: "전라도", hanja: "全羅道", en: "Jeolla", households: 24073, people: 94248, volume: 151, tribute: [tr("蜂蜜", "꿀", "honey", "miel", "miel"), tr("黃蠟", "밀랍", "beeswax", "cire d'abeille", "cera de abeja"), tr("虎皮", "호랑이 가죽", "tiger pelts", "peaux de tigre", "pieles de tigre")] },
  { id: "hwanghae", ko: "황해도", hanja: "黃海道", en: "Hwanghae", households: 23511, people: 71897, volume: 152, tribute: [tr("栗", "밤", "chestnuts", "châtaignes", "castañas"), tr("松子", "잣", "pine nuts", "pignons", "piñones"), tr("五味子", "오미자", "magnolia berries", "baies de schisandra", "bayas de esquisandra")] },
  { id: "gangwon", ko: "강원도", hanja: "江原道", en: "Gangwon", households: 11084, people: 29009, volume: 153, tribute: [tr("蜂蜜", "꿀", "honey", "miel", "miel"), tr("松子", "잣", "pine nuts", "pignons", "piñones"), tr("胡桃", "호두", "walnuts", "noix", "nueces")] },
  { id: "pyeongan", ko: "평안도", hanja: "平安道", en: "Pyeongan", households: 41167, people: 105444, volume: 154, tribute: [tr("貂", "담비", "sable", "zibeline", "marta cebellina"), tr("靑鼠", "청서 가죽", "squirrel furs", "fourrures d'écureuil", "pieles de ardilla"), tr("豹", "표범", "leopard", "léopard", "leopardo")] },
  { id: "hamgil", ko: "함길도", hanja: "咸吉道", en: "Hamgil", households: 14739, people: 66978, volume: 155, tribute: [tr("豹皮", "표범 가죽", "leopard pelts", "peaux de léopard", "pieles de leopardo"), tr("鹿角", "녹각", "deer antlers", "bois de cerf", "astas de ciervo"), tr("狐尾", "여우 꼬리", "fox tails", "queues de renard", "colas de zorro")] },
];

export const PROVINCE_SOURCES = [
  { label: "세종실록 지리지 148–155권 (위키문헌 전사)", url: "https://ko.wikisource.org/wiki/%EC%A1%B0%EC%84%A0%EC%99%95%EC%A1%B0%EC%8B%A4%EB%A1%9D/%EC%84%B8%EC%A2%85%EC%9E%A5%ED%97%8C%EB%8C%80%EC%99%95%EC%8B%A4%EB%A1%9D/152%EA%B6%8C" },
];

// ── Official robe colour by rank (경국대전 공복 단령, 한국민족문화대백과 「관복」 E0004850) ──
// 1품~정3품 홍포, 종3품~6품 청포, 7~9품 녹포. 홀: 4품 이상 상홀(象笏), 5품 이하 목홀(木笏) (「공복」 E0004314).
// 「공복」 E0004314: these boundaries are the 공복 rule set in 1426(세종 8) 2월 as carried into 경국대전, so they fit 1426.
export type Robe = "red" | "blue" | "green";
export const ROBE_SOURCES = [
  { label: "한국민족문화대백과 「관복」", url: "https://encykorea.aks.ac.kr/Article/E0004850" },
  { label: "한국민족문화대백과 「공복」", url: "https://encykorea.aks.ac.kr/Article/E0004314" },
];

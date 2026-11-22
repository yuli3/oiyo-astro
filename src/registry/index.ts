import { dailyManifest } from "@/app/[locale]/daily/manifest";
import { ontologyManifest } from "@/app/[locale]/ontology/manifest";
import type { FeatureManifest } from "@/types/manifest";

// Strength Keyword Finder — self-discovery word tool (#2).
const strengthKeywordsManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Sparkles",
  id: "strength-keywords",
  path: "/strengths/keywords",
  status: "production",
  name: {
    zh: "优势关键词",
    en: "Strength Keywords",
    es: "Palabras clave de fortalezas",
    fr: "Mots-clés de forces",
    ja: "強みキーワード",
    ko: "강점 키워드 찾기",
  },
  description: {
    zh: "选择你喜欢的动词和名词，汇集你的优势关键词。",
    en: "Pick the verbs and nouns that resonate and gather your strength keywords.",
    es: "Elige verbos y sustantivos que resuenan y reúne tus palabras clave de fortalezas.",
    fr: "Choisissez les verbes et noms qui résonnent et rassemblez vos mots-clés de forces.",
    ja: "惹かれる動詞・名詞を選んで自分の強みキーワードを集めます。",
    ko: "끌리는 동사·명사를 골라 나의 강점 키워드를 모아보는 자기 발견 도구.",
  },
};

// Today's Journal — daily reflective prompt + private localStorage journal (G14).
const journalManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "NotebookPen",
  id: "journal-today",
  path: "/journal/today",
  status: "production",
  name: {
    zh: "今日日记",
    en: "Today's Journal",
    es: "Diario de hoy",
    fr: "Journal du jour",
    ja: "今日のジャーナル",
    ko: "오늘의 저널",
  },
  description: {
    zh: "每天回答一个反思问题，记录只保存在浏览器中。",
    en: "Answer one reflective question a day; entries stay only in your browser.",
    es: "Responde una pregunta reflexiva al día; las entradas quedan solo en tu navegador.",
    fr: "Répondez à une question par jour ; les entrées restent dans votre navigateur.",
    ja: "1日1問の問いに答える。記録はブラウザにのみ保存。",
    ko: "하루 한 질문에 답하는 비공개 셀프 저널링(브라우저 저장).",
  },
};

// Emotion Release — name → breathe → sage line → release (G20).
const emotionReleaseManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Wind",
  id: "emotion-release",
  path: "/emotion/release",
  status: "production",
  name: {
    zh: "释放情绪", en: "Let the Feeling Pass", es: "Deja pasar la emoción",
    fr: "Laisser passer l'émotion", ja: "感情を流す", ko: "감정 흘려보내기",
  },
  description: {
    zh: "为情绪命名、呼吸、收到一句箴言、放下。2分钟自我关怀。",
    en: "Name the feeling, breathe, receive one sage line, set it down. A 2-min self-care ritual.",
    es: "Nombra la emoción, respira, recibe una frase y suéltala. Ritual de autocuidado de 2 min.",
    fr: "Nommez l'émotion, respirez, recevez une phrase, lâchez prise. Rituel de 2 min.",
    ja: "感情に名前をつけ、呼吸し、一文を受け取り、手放す。2分のセルフケア。",
    ko: "감정에 이름 붙이고 호흡하고 선현의 한 문장으로 내려놓는 2분 의식.",
  },
};

// Interval Timer — custom HIIT/Tabata workout timer (G15).
const intervalTimerManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Timer",
  id: "interval-timer",
  path: "/interval/timer",
  status: "production",
  name: {
    zh: "间歇运动计时器", en: "Interval Timer", es: "Temporizador de intervalos",
    fr: "Minuteur d'intervalles", ja: "インターバルタイマー", ko: "인터벌 운동 타이머",
  },
  description: {
    zh: "自定义运动/休息/组数的间歇计时器，适合塔巴塔与HIIT。",
    en: "Custom work/rest/rounds interval timer for Tabata and HIIT.",
    es: "Temporizador de intervalos personalizable para Tabata y HIIT.",
    fr: "Minuteur d'intervalles personnalisable pour Tabata et HIIT.",
    ja: "運動・休憩・セットを設定できるタバタ／HIIT用タイマー。",
    ko: "운동·휴식·세트 커스텀 인터벌 타이머(타바타·HIIT·홈트).",
  },
};

// Money Parking Guide — which vehicle fits your goal (G16).
const moneyParkingManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "PiggyBank",
  id: "money-parking",
  path: "/money/parking",
  status: "production",
  name: {
    zh: "资金存放指南", en: "Money Parking Guide", es: "Guía de dónde poner el dinero",
    fr: "Guide où placer son argent", ja: "資金の置き場ガイド", ko: "자금 보관처 가이드",
  },
  description: {
    zh: "按目的推荐资金存放处（活期/CMA/定期/养老/ETF）。教育用途。",
    en: "By goal, which vehicle fits — savings/CMA/deposit/retirement/ETF. Educational.",
    es: "Por objetivo, qué vehículo encaja. Educativo, no es asesoría.",
    fr: "Selon l'objectif, quel placement convient. Éducatif.",
    ja: "目的別に資金の置き場を案内（預金/CMA/年金/ETF）。教育目的。",
    ko: "목적별 자금 보관처 추천(파킹통장·CMA·예적금·IRP·ETF). 교육용.",
  },
};

// Adventurer's Guild — gamified self-care quest hub (G13).
const guildManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Castle",
  id: "adventurer-guild",
  path: "/guild",
  status: "production",
  name: {
    zh: "冒险者公会", en: "Adventurer's Guild", es: "Gremio de aventureros",
    fr: "Guilde des aventuriers", ja: "冒険者ギルド", ko: "모험가 길드",
  },
  description: {
    zh: "把日记/呼吸/运动等自我关怀变成任务，用经验值、等级、连续天数和徽章坚持下去。",
    en: "Turn journaling/breathing/exercise self-care into quests with XP, levels, streaks and badges.",
    es: "Convierte el autocuidado en misiones con XP, niveles, rachas e insignias.",
    fr: "Transformez l'auto-soin en quêtes avec XP, niveaux, séries et badges.",
    ja: "ジャーナル・呼吸・運動などのセルフケアをクエスト化。経験値・レベル・連続日数・バッジで継続。",
    ko: "저널·호흡·운동 같은 자기돌봄을 퀘스트로. 경험치·레벨·연속일·배지로 꾸준함을 만드는 허브.",
  },
};

// Pranayama (yoga breathing) guide — 8 traditional techniques with a guided pacer.
const pranayamaManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Wind",
  id: "pranayama",
  path: "/pranayama",
  status: "production",
  name: {
    zh: "瑜伽呼吸（调息）指南", en: "Yoga Breathing (Pranayama)", es: "Respiración yóguica (Pranayama)",
    fr: "Respiration yoga (Pranayama)", ja: "ヨガ呼吸（プラーナーヤーマ）", ko: "요가 호흡(프라나야마)",
  },
  description: {
    zh: "交替鼻孔、乌加依、蜂鸣等8种经典瑜伽呼吸法，配动画节拍器与步骤、功效、注意事项。",
    en: "8 classic pranayama techniques (alternate nostril, Ujjayi, Bhramari…) with an animated pacer, steps, benefits and cautions.",
    es: "8 técnicas clásicas de pranayama con marcador animado, pasos, beneficios y precauciones.",
    fr: "8 techniques classiques de pranayama avec rythmeur animé, étapes, bienfaits et précautions.",
    ja: "片鼻呼吸・ウジャイ・ブラーマリーなど8種の調息法を、アニメーションのペーサーと手順・効果・注意で案内。",
    ko: "교호 호흡·우자이·브라마리 등 요가 호흡 8종을 애니메이션 페이서와 단계·효과·주의로 안내.",
  },
};

// 나에게 맞는 나라 — surfaces the country-archetype ontology engine.
const countryMatchManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Globe",
  id: "country-match",
  path: "/country/match",
  status: "production",
  name: {
    zh: "找到适合你的国家", en: "Find Your Country Match", es: "Encuentra tu país ideal",
    fr: "Trouvez votre pays idéal", ja: "自分に合う国を探す", ko: "나에게 맞는 나라 찾기",
  },
  description: {
    zh: "用几个生活方式偏好，找出最适合你的国家。旅行·移居灵感。",
    en: "A few lifestyle preferences reveal the countries that fit you best — travel & relocation inspiration.",
    es: "Unas preferencias de estilo de vida revelan los países que mejor te encajan.",
    fr: "Quelques préférences de style de vie révèlent les pays qui vous correspondent.",
    ja: "いくつかのライフスタイルの好みから、あなたに合う国を見つけます。旅行・移住のヒントに。",
    ko: "라이프스타일 취향 몇 가지로 당신과 가장 잘 맞는 나라를 찾아주는 테스트. 여행·이주 영감.",
  },
};

// 600년 전 나는? — 1426 Joseon office / European throne / US state draw (2026-11-02).
const pastLife1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#7c3aed",
  domain: "ontology",
  icon: "Crown",
  id: "past-life-1426",
  path: "/past-life-1426",
  status: "production",
  name: {
    zh: "600年前的我 — 朝鲜官职·欧洲王座·美国州",
    en: "600 years ago — Joseon office, European throne, US state",
    es: "Hace 600 años — cargo en Joseon, trono europeo, estado de EE. UU.",
    fr: "Il y a 600 ans — charge à Joseon, trône européen, État américain",
    ja: "600年前のわたし — 朝鮮の官職・欧州の玉座・米国の州",
    ko: "600년 전 나는? — 조선 관직·유럽 왕좌·미국 주",
  },
  description: {
    zh: "按经国大典编制、1426年欧洲实际君主、美国2024年各州出生数抽取。也可按性格匹配。",
    en: "Drawn from Gyeongguk daejeon seat counts, Europe's actual 1426 rulers and 2024 US births by state. Or match by traits.",
    es: "Sorteo con plazas del Gyeongguk daejeon, los gobernantes reales de 1426 y nacimientos de 2024 por estado.",
    fr: "Tirage d'après les effectifs du Gyeongguk daejeon, les souverains réels de 1426 et les naissances 2024 par État.",
    ja: "経国大典の定員、1426年の実在の君主、米国2024年の州別出生で抽選。性格に合わせることも。",
    ko: "경국대전 관직 정원, 1426년 실제 유럽 군주, 2024년 미국 주별 출생 수로 뽑아요. 성향으로 맞출 수도 있어요.",
  },
};

const joseon1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#a8322d",
  domain: "ontology",
  icon: "Landmark",
  id: "joseon-1426",
  path: "/joseon-1426",
  status: "production",
  name: { zh: "600年前朝鲜的我", en: "You in Joseon, 1426", es: "Tú en Joseon, 1426", fr: "Vous à Joseon, 1426", ja: "600年前の朝鮮のわたし", ko: "600년 전 조선의 나" },
  description: { zh: "按经国大典编制和世宗实录地理志人口抽取官职、故乡、官服与俸禄。", en: "Your 1426 office, province, robe and stipend from Gyeongguk daejeon seats and the Sejong Sillok gazetteer.", es: "Tu cargo, provincia, túnica y estipendio en 1426 según fuentes de Joseon.", fr: "Votre charge, province, robe et traitement en 1426 d'après les sources de Joseon.", ja: "経国大典の定員と世宗実録地理志で1426年の官職・故郷・官服・禄俸を引きます。", ko: "경국대전 정원과 세종실록지리지로 1426년 내 관직·고향·관복·녹봉을 뽑아요." },
};

const sillaGolpumManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#6b3d8f",
  domain: "ontology",
  icon: "Landmark",
  id: "silla-golpum",
  path: "/silla-golpum",
  status: "production",
  name: { zh: "1300年前新罗的我", en: "You in Silla: bone rank", es: "Tú en Silla: rango de hueso", fr: "Vous à Silla : rang d'os", ja: "1300年前の新羅のわたし", ko: "1300년 전 신라의 나" },
  description: { zh: "按新罗骨品制抽取身份与官等，看才干是否被骨品之墙挡住。", en: "Your Silla bone rank and court rank, with the real ceilings and robe colours.", es: "Tu rango de hueso y de corte en Silla, con los techos reales.", fr: "Votre rang d'os et de cour à Silla, avec les vrais plafonds.", ja: "新羅の骨品と官位を引き、骨品の壁に阻まれるかを見せます。", ko: "골품과 17관등으로 신라의 나를 뽑고, 골품의 벽에 막히는지 보여줘요." },
};

const joseonTimeManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#8a5a2b",
  domain: "ontology",
  icon: "Clock",
  id: "joseon-time",
  path: "/joseon-time",
  status: "production",
  name: { ko: "지금 시각을 조선 시각으로", en: "Now, in Joseon time", ja: "今を朝鮮の時刻で", zh: "此刻的朝鲜时刻", fr: "Maintenant, à l'heure de Joseon", es: "Ahora, en hora de Joseon" },
  description: { ko: "지금 몇 시예요? 한양 해시계로는 '신시 정이각'. 자격루 종·북·징, 인정·파루 통금까지 바꿔 봐요.", en: "What time is it on the Hanyang sundial? Double hours, kak, night watches and the curfew bells.", ja: "今は漢陽の日時計で何時？十二時・刻・更点・人定と罷漏まで。", zh: "汉阳日晷上现在几点？时辰、刻、更点和宵禁钟声。", fr: "Quelle heure au cadran solaire de Hanyang ? Heures doubles, kak, veilles et couvre-feu.", es: "¿Qué hora marca el reloj de sol de Hanyang? Horas dobles, kak, vigilias y toque de queda." },
};

const future2626Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2d4a6b",
  domain: "ontology",
  icon: "Landmark",
  id: "future-2626",
  path: "/future-2626",
  status: "production",
  name: { ko: "2626 미래 박물관 속 내 물건", en: "Your things in a museum, 2626", ja: "2626年の博物館の私の物", zh: "2626年博物馆里的我的东西", fr: "Vos affaires au musée en 2626", es: "Tus cosas en un museo en 2626" },
  description: { ko: "거꾸로 타임슬립. 내 스마트폰·이어폰·텀블러가 600년 뒤 박물관 유물이 된다면, 학자들은 뭐라고 설명할까요?", en: "Time-slip in reverse: how would a museum in 2626 label your phone, earbuds and tumbler?", ja: "逆さまのタイムスリップ。私のスマホやイヤホンが600年後の博物館でどう説明される？", zh: "反向穿越：六百年后的博物馆会怎样介绍你的手机、耳机和保温杯？", fr: "Voyage à l'envers : comment un musée de 2626 décrirait-il votre téléphone ?", es: "Viaje al revés: ¿cómo describiría un museo de 2626 tu móvil?" },
};

const joseonNamesManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2f4a3a",
  domain: "ontology",
  icon: "PenTool",
  id: "joseon-names",
  path: "/joseon-names",
  status: "production",
  name: { ko: "조선 시대 내 이름 짓기", en: "My names in Joseon Korea", ja: "朝鮮時代の私の名前", zh: "我在朝鲜时代的名字", fr: "Mes noms dans la Corée de Joseon", es: "Mis nombres en la Corea de Joseon" },
  description: { ko: "아명(개똥이·바우…) → 항렬자가 든 관명 → 관례 때 받는 자 → 스스로 짓는 호까지, 조선 시대 평생 불린 내 이름들을 받아 봐요.", en: "From a lowly childhood name to a formal name with a generation character, a courtesy name and a pen name: your names through a Joseon life.", ja: "幼名から行列字の入った冠名、冠礼の字、号まで、朝鮮時代に一生呼ばれた名前をもらいます。", zh: "从乳名到带行辈字的冠名、冠礼时的字和自取的号，领取你在朝鲜时代一生的名字。", fr: "Du nom d'enfance au nom officiel avec caractère de génération, nom de courtoisie et nom de plume.", es: "Del nombre de infancia al nombre oficial con carácter generacional, nombre de cortesía y seudónimo." },
};

const jinshin1872Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#7a2e2e",
  domain: "ontology",
  icon: "BookOpen",
  id: "jinshin-1872",
  path: "/jinshin-1872",
  status: "production",
  name: { ko: "1872 임신호적 속 우리 집", en: "Your household in the 1872 Jinshin koseki", ja: "壬申戸籍の中のわが家", zh: "1872年壬申户籍里的我家", fr: "Votre foyer au koseki Jinshin de 1872", es: "Tu hogar en el koseki Jinshin de 1872" },
  description: { ko: "1872년 일본 첫 전국 호적의 실제 족칭 집계(평민 3,084만·사족 128만·화족 2,666명…)로 우리 집을 뽑고, 호적 한 장을 재구성해 봐요.", en: "Drawn by the real 1872 status totals (30.8M commoners, 1.28M shizoku, 2,666 kazoku…), with a reconstructed koseki entry.", ja: "明治5年の初の全国戸籍の族籍集計（平民3,084万・士族128万・華族2,666人…）で引き、戸籍一枚を再構成します。", zh: "按1872年日本首次全国户籍的族称统计（平民3084万、士族128万、华族2666人……）抽取，并重构一页户籍。", fr: "Tiré selon les vrais totaux de 1872 (30,8 M roturiers, 1,28 M shizoku, 2 666 kazoku…), avec une inscription reconstituée.", es: "Sorteado según los totales reales de 1872 (30,8 M plebeyos, 1,28 M shizoku, 2.666 kazoku…), con una inscripción reconstruida." },
};

const huangce1391Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#8a6a12",
  domain: "ontology",
  icon: "BookOpen",
  id: "huangce-1391",
  path: "/huangce-1391",
  status: "production",
  name: { ko: "1391 명나라 황책 속 우리 집", en: "Your household in the 1391 Ming Yellow Register", ja: "1391年明の黄冊の中のわが家", zh: "1391年明代黄册里的我家", fr: "Votre foyer au registre jaune Ming de 1391", es: "Tu hogar en el registro amarillo Ming de 1391" },
  description: { ko: "명 초 실제 호적 비율(민호·군호 약 20%·장호)로 우리 집 호적을 뽑고, 황책의 사주식(구관·신수·개제·실재)으로 우리 집 기록을 적어 봐요.", en: "Drawn by early Ming household categories (civilian, about 20% military, artisan), with your entry in the register's four-column format.", ja: "明初の戸籍比率（民戸・軍戸約20%・匠戸）で引き、黄冊の四柱式でわが家の記録を書きます。", zh: "按明初户籍比例（民户、约20%军户、匠户）抽取，并以黄册四柱式写下我家的登记。", fr: "Tiré selon les catégories de foyers du début des Ming (civil, environ 20 % militaire, artisan), avec votre inscription en quatre colonnes.", es: "Sorteado según las categorías de hogares de inicios Ming (civil, cerca del 20 % militar, artesano), con tu inscripción en cuatro columnas." },
};

const census1911Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#5a2a3a",
  domain: "ontology",
  icon: "ScrollText",
  id: "census-1911",
  path: "/census-1911",
  status: "production",
  name: { ko: "1911 영국 센서스 속 나", en: "You in the 1911 census", ja: "1911年英国国勢調査の中の私", zh: "1911年英国人口普查中的我", fr: "Vous au recensement anglais de 1911", es: "Tú en el censo inglés de 1911" },
  description: { zh: "按1911年英格兰和威尔士真实职业分布（男女分列）抽出你，并按1911年住户普查表的栏目写下你的一行。", en: "Drawn by the real 1911 England and Wales occupations by sex, with your line in the 1911 household schedule's columns.", es: "Sorteado según las ocupaciones reales de 1911 por sexo, con tu línea en las columnas de la hoja del hogar.", fr: "Tiré selon les vrais métiers de 1911 par sexe, avec votre ligne dans les colonnes du bulletin de ménage.", ja: "1911年イングランド・ウェールズの実際の男女別職業分布で引き、世帯調査票の欄にあなたの一行を書きます。", ko: "1911년 잉글랜드·웨일스의 실제 남녀별 직업 분포로 나를 뽑고, 그해 가구 조사표 칸에 내 한 줄을 적어 봐요." },
};

const ellis1907Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#1f4a5a",
  domain: "ontology",
  icon: "Ship",
  id: "ellis-1907",
  path: "/ellis-1907",
  status: "production",
  name: { zh: "1907年埃利斯岛乘客名单中的我", en: "You on a 1907 Ellis Island manifest", es: "Tú en Ellis Island en 1907", fr: "Vous à Ellis Island en 1907", ja: "1907年エリス島の乗客名簿の中の私", ko: "1907 엘리스섬 승객 명부 속 나" },
  description: { zh: "按1907财年的真实来源国比例抽出你，并在1907年乘客名单格式中写下你的一行。", en: "Drawn by the real FY1907 countries of origin, with your line written in the 1907 manifest's columns.", es: "Sorteado según los países de origen reales de 1907, con tu línea en las columnas de la lista de 1907.", fr: "Tiré selon les vrais pays d'origine de 1907, avec votre ligne dans les colonnes de la liste de 1907.", ja: "1907会計年度の実際の出身国比率で引き、1907年の乗客名簿の欄にあなたの一行を書きます。", ko: "1907년 실제 출신국 비율로 나를 뽑고, 그해 승객 명부 양식의 칸에 내 한 줄을 적어 봐요." },
};

const parallelLivesManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2b1708",
  domain: "ontology",
  icon: "GitCommitVertical",
  id: "parallel-lives",
  path: "/parallel-lives",
  status: "production",
  name: { zh: "我的平行人生年表", en: "My parallel lives", es: "Mis vidas paralelas", fr: "Mes vies parallèles", ja: "わたしの並行人生年表", ko: "나의 평행 인생 연표" },
  description: { zh: "把时空穿越系列中抽到的结果按时代排成一张年表，并保存为图片。", en: "Every result you drew in the time-slip series on one timeline, saved as an image.", es: "Todos tus resultados de la serie en una línea de tiempo, guardada como imagen.", fr: "Tous vos résultats de la série sur une frise, à enregistrer en image.", ja: "タイムスリップ・シリーズで引いた結果を時代順の年表にまとめ、画像で保存します。", ko: "타임슬립 시리즈에서 뽑은 나의 결과를 시대순 연표 한 장으로 모아 이미지로 저장해요." },
};

const birthdayCalendarsManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#1f3a6b",
  domain: "ontology",
  icon: "CalendarDays",
  id: "birthday-calendars",
  path: "/birthday-calendars",
  status: "production",
  name: { zh: "我的生日，7种历法", en: "My birthday in 7 old calendars", es: "Mi cumpleaños en 7 calendarios", fr: "Mon anniversaire en 7 calendriers", ja: "誕生日を7つの暦で", ko: "내 생일, 옛 달력 7개로" },
  description: { zh: "把生日换算成法国共和历（当天的植物名）、干支、玛雅长纪历、儒略历、伊斯兰历、希伯来历和日本年号。", en: "Your birthday in the French Republican calendar (with its day name), the sexagenary cycle, the Maya Long Count, Julian, Islamic, Hebrew and Japanese era dates.", es: "Tu cumpleaños en el calendario republicano francés (con el nombre del día), el ciclo sexagenario, la cuenta larga maya y los calendarios juliano, islámico, hebreo y japonés.", fr: "Votre anniversaire dans le calendrier républicain (avec le nom du jour), le cycle sexagésimal, le compte long maya, et les calendriers julien, hégirien, hébraïque et japonais.", ja: "誕生日をフランス革命暦（その日の名前）・干支・マヤ長期暦・ユリウス暦・イスラム暦・ヘブライ暦・元号に変換します。", ko: "내 생일을 프랑스 혁명력(그날의 이름)·60갑자·마야 장주기력·율리우스력·이슬람력·히브리력·일본 연호로 한 번에 바꿔 봐요." },
};

const hoebinghwan1789Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2f4a3a",
  domain: "ontology",
  icon: "Sparkles",
  id: "hoebinghwan-1789",
  path: "/hoebinghwan-1789",
  status: "production",
  name: { zh: "穿越模拟器 1789", en: "Isekai simulator: 1789", es: "Simulador isekai: 1789", fr: "Simulateur d'isekai : 1789", ja: "転生シミュレーター 1789", ko: "회빙환 시뮬레이터" },
  description: { zh: "附身、转生或穿越到1789年的朝鲜，看你的现代技能是否管用。", en: "Possessed, reborn or time-slipped into 1789 Joseon: see which of your modern skills would work.", es: "Poseído, renacido o caído en la Corea de 1789: qué habilidades modernas servirían.", fr: "Possédé, réincarné ou projeté en Corée en 1789 : quels talents modernes serviraient.", ja: "1789年の朝鮮に憑依・転生・タイムスリップ。現代の技術は通じる？", ko: "1789년 조선으로 빙의·환생·타임슬립하면 내 현대 기술이 통할지 실제 역사로 따져 봐요." },
};

const domesday1086Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#6b2a2a",
  domain: "ontology",
  icon: "BookOpen",
  id: "domesday-1086",
  path: "/domesday-1086",
  status: "production",
  name: { zh: "1086年末日审判书中的我", en: "You in Domesday Book, 1086", es: "Tú en el Domesday Book (1086)", fr: "Vous dans le Domesday Book (1086)", ja: "1086年ドゥームズデイ・ブックの中の私", ko: "1086 둠즈데이 북 속 나" },
  description: { zh: "按1086年记录人口的阶层比例抽出你，并读你所在庄园的条目。", en: "Draw your class by the 1086 recorded population (villans, bordars, slaves, sokemen…) and read the entry for your manor.", es: "Tu clase según la población registrada en 1086 y la entrada de tu feudo.", fr: "Votre condition selon la population recensée en 1086 et l'article de votre manoir.", ja: "1086年に記録された人々の身分割合で自分を引き、荘園の記録を読みます。", ko: "1086년 기록된 사람들의 신분 비율로 나를 뽑고, 내가 사는 장원의 기록을 보여줘요." },
};

const census1850Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#1f3a5f",
  domain: "ontology",
  icon: "ClipboardList",
  id: "census-1850",
  path: "/census-1850",
  status: "production",
  name: { zh: "1850年美国普查中的我", en: "You in the 1850 U.S. census", es: "Tú en el censo de EE. UU. de 1850", fr: "Vous dans le recensement américain de 1850", ja: "1850年アメリカ国勢調査の中の私", ko: "1850 미국 센서스 속 나" },
  description: { zh: "按1850年美国人口构成抽出你是谁，并写出普查员记下的你的一行。", en: "Draw who you were by the real 1850 population and see the line a census marshal would have written, or why there was none.", es: "Quién eras según la población real de 1850 y la línea que habría escrito el empadronador.", fr: "Qui vous étiez selon la population réelle de 1850 et la ligne qu'aurait écrite l'agent recenseur.", ja: "1850年アメリカの人口構成で自分を引き、調査員が書いた一行を見せます。", ko: "1850년 미국 인구 구성으로 내가 누구였는지 뽑고, 조사원이 적었을 내 한 줄을 보여줘요." },
};

const ninbetsuEdoManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#5a3a6b",
  domain: "ontology",
  icon: "ScrollText",
  id: "ninbetsu-edo",
  path: "/ninbetsu-edo",
  status: "production",
  name: { zh: "江户人别帐中的我", en: "You in an Edo-period temple register", es: "Tú en un registro del período Edo", fr: "Vous dans un registre de l'époque d'Edo", ja: "江戸の人別帳の中の私", ko: "에도 인별장 속 나" },
  description: { zh: "按江户时代身份比例抽出你的身份，并写出你在宗门人别改帐上的一行。", en: "Draw your status by Edo-period population shares and see your line in a shūmon ninbetsu aratamechō.", es: "Tu estatus según las proporciones del período Edo y tu línea en el registro de templos.", fr: "Votre statut selon les proportions de l'époque d'Edo et votre ligne au registre des temples.", ja: "江戸時代の身分構成の割合であなたの身分を引き、宗門人別改帳のあなたの一行を書き出します。", ko: "에도 시대 신분 비율로 내 신분을 뽑고, 종문인별개장에 적힌 내 한 줄을 보여줘요." },
};

const tongsinsa1763Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#1f4e6b",
  domain: "ontology",
  icon: "Ship",
  id: "tongsinsa-1763",
  path: "/tongsinsa-1763",
  status: "production",
  name: { zh: "朝鲜通信使团中的我", en: "You in the 1763 embassy to Japan", es: "Tú en la embajada coreana de 1763", fr: "Vous dans l'ambassade coréenne de 1763", ja: "朝鮮通信使一行の中の私", ko: "조선통신사 일행 속 나" },
  description: { zh: "1763年癸未通信使477人中，你是三使、译官、制述官、画员还是格军？", en: "Among the 477 of the 1763 Joseon embassy to Edo, are you an envoy, interpreter, poet, painter or oarsman?", es: "Entre los 477 de la embajada de 1763 a Edo, ¿qué papel tienes?", fr: "Parmi les 477 de l'ambassade de 1763 à Edo, quel est votre rôle ?", ja: "1763年癸未通信使477人のうち、あなたは三使・訳官・製述官・画員・格軍のどれ？", ko: "1763년 계미통신사 477명 가운데 나는 삼사·역관·제술관·화원·격군 중 누구일까요?" },
};

const banchado1795Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2f5d50",
  domain: "ontology",
  icon: "Flag",
  id: "banchado-1795",
  path: "/banchado-1795",
  status: "production",
  name: { zh: "1795华城行幸班次图中的我", en: "You in the 1795 royal procession", es: "Tú en el cortejo real de 1795", fr: "Vous dans le cortège royal de 1795", ja: "1795年 華城行幸の班次図の中の私", ko: "1795 화성 행차 반차도 속 나" },
  description: { zh: "在正祖1795年华城行幸班次图所画的1,779人中，抽出你的位置：擎旗兵、骑马乐手、宫女、轿夫或官员。", en: "Find your place among the 1,779 people drawn in King Jeongjo's 1795 procession to Hwaseong: flag bearer, mounted band, court lady, palanquin crew or official.", es: "Tu lugar entre las 1.779 personas del cortejo de 1795 del rey Jeongjo.", fr: "Votre place parmi les 1 779 personnages du cortège royal de 1795.", ja: "正祖の1795年華城行幸を描いた班次図の1,779人の中から、あなたの位置を引きます。", ko: "정조의 1795년 화성 행차를 그린 반차도 속 1,779명 가운데 내 자리를 뽑아요. 깃발수·말 탄 악대·나인·가마 수행원·관원." },
};

const gwageo1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#7a2e2e",
  domain: "ontology",
  icon: "ScrollText",
  id: "gwageo-1426",
  path: "/gwageo-1426",
  status: "production",
  name: { zh: "去考1426年的科举", en: "Sit the 1426 civil exam", es: "Presenta el examen civil de 1426", fr: "Passez l'examen civil de 1426", ja: "1426年の科挙を受けに行く", ko: "과거시험 보러 가기" },
  description: { zh: "参加世宗八年丙午式年文科：讲经、作赋、回答世宗真实的策问，看你在真实及第名单中排第几。", en: "Sit Sejong's 1426 civil exam: classics, rhymes and the king's real policy question, then find your place on the real pass list.", es: "Presenta el examen de 1426: clásicos, rimas y la pregunta real del rey Sejong.", fr: "Passez l'examen de 1426 : classiques, rimes et la vraie question du roi Sejong.", ja: "世宗8年丙午の式年文科へ。講経・賦・世宗の実際の策問に答え、実際の合格者名簿での順位を見ます。", ko: "세종 8년 병오 식년 문과에 응시해요. 경서 강경, 부 운 맞추기, 세종의 실제 책문을 거쳐 그해 진짜 급제자 명단 속 내 자리를 보여줘요." },
};

const lunch1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#8a5a2b",
  domain: "ontology",
  icon: "UtensilsCrossed",
  id: "lunch-1426",
  path: "/lunch-1426",
  status: "production",
  name: { zh: "把今天的午餐带回600年前", en: "Your lunch, 600 years ago", es: "Tu almuerzo, hace 600 años", fr: "Votre déjeuner, il y a 600 ans", ja: "今日のランチを600年前へ", ko: "오늘 점심을 600년 전으로" },
  description: { zh: "把今天的午餐带回1426年的朝鲜：辣椒、土豆、洋葱都还没来，哪些食材能留下？", en: "Take today's lunch back to 1426 Korea: no chili, potato or onion yet. See which ingredients survive.", es: "Lleva tu almuerzo a la Corea de 1426: sin chile, papa ni cebolla. ¿Qué ingredientes sobreviven?", fr: "Ramenez votre déjeuner dans la Corée de 1426 : ni piment, ni pomme de terre, ni oignon. Que reste-t-il ?", ja: "今日のランチを1426年の朝鮮へ。唐辛子もじゃがいもも玉ねぎもまだない。何が残る？", ko: "오늘 점심을 1426년 조선으로 가져가요. 고추도 감자도 양파도 없던 때, 어떤 재료가 살아남을까요?" },
};

const sillok1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#3d4f6b",
  domain: "ontology",
  icon: "BookOpen",
  id: "sillok-1426",
  path: "/sillok-1426",
  status: "production",
  name: { zh: "我生日那天的实录", en: "Your birthday in the 1426 annals", es: "Tu cumpleaños en los anales de 1426", fr: "Votre anniversaire dans les annales de 1426", ja: "誕生日の実録", ko: "내 생일의 실록" },
  description: { zh: "世宗八年（1426）你生日那天，《世宗实录》记了什么：原文与白话摘要。", en: "What the Sejong Sillok recorded on your birthday in 1426: the original entry with a plain summary.", es: "Qué anotaron los Anales de Sejong el día de tu cumpleaños en 1426.", fr: "Ce que notent les Annales de Sejong le jour de votre anniversaire en 1426.", ja: "世宗8年（1426）、あなたの誕生日に実録は何を記したか。原文とやさしい要約。", ko: "세종 8년(1426) 내 생일에 실록에는 무슨 일이 적혔을까요? 원문과 쉬운 풀이로 보여줘요." },
};

const hometown1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#5b4a2f",
  domain: "ontology",
  icon: "MapPin",
  id: "hometown-1426",
  path: "/hometown-1426",
  status: "production",
  name: { zh: "600年前我家乡是哪个郡县？", en: "Your town in 1432 Joseon", es: "Tu ciudad en la Corea de 1432", fr: "Votre ville dans la Corée de 1432", ja: "600年前、わが町はどの郡県？", ko: "내 동네는 600년 전 어느 고을?" },
  description: { zh: "按《世宗实录·地理志》找出你住的地方当年是哪个郡县：户口、排名与土产。", en: "Find the county your Korean town belonged to in the Sejong Sillok gazetteer: households, head count, rank and local specialties.", es: "El distrito al que pertenecía tu ciudad coreana en el registro de Sejong: hogares, personas, puesto y productos.", fr: "Le district de votre ville coréenne dans le registre de Sejong : foyers, inscrits, rang et spécialités.", ja: "世宗実録地理志で、いまの町が当時どの郡県だったか。戸口・順位・土産まで。", ko: "세종실록 지리지로 지금 사는 곳이 그때 어느 고을이었는지 찾아요. 호구·순위·토산까지." },
};

const ancestors1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2f5d50",
  domain: "ontology",
  icon: "Network",
  id: "ancestors-1426",
  path: "/ancestors-1426",
  status: "production",
  name: { zh: "600年前我有多少祖先？", en: "How many ancestors in 1426?", es: "¿Cuántos antepasados en 1426?", fr: "Combien d'ancêtres en 1426 ?", ja: "600年前の祖先は何人？", ko: "600년 전 내 조상은 몇 명?" },
  description: { zh: "家谱格子每代翻倍，而1426年的人数有限：算出不同祖先数与共同祖先的年代。", en: "Your tree doubles each generation but 1426 had only so many people: distinct ancestors, share of everyone then, and when common ancestors appear.", es: "Tu árbol se duplica, pero en 1426 había gente finita: antepasados distintos y cuándo aparecen los comunes.", fr: "Votre arbre double à chaque génération, mais 1426 comptait un nombre fini de gens : ancêtres distincts et ancêtres communs.", ja: "家系図は世代ごとに倍、でも1426年の人数は有限。異なる祖先の数と共通祖先の時代を計算します。", ko: "족보 칸은 세대마다 두 배지만 1426년 사람 수는 정해져 있어요. 서로 다른 조상 수와 공통 조상이 나타나는 때를 계산해요." },
};

const joseon1789Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#7a4a1f",
  domain: "ontology",
  icon: "ScrollText",
  id: "joseon-1789",
  path: "/joseon-1789",
  status: "production",
  name: { zh: "1789年户籍里的我", en: "You in Joseon's 1789 register", es: "Tú en el registro de Joseon de 1789", fr: "Vous au registre de Joseon en 1789", ja: "1789年戸籍の中のわたし", ko: "1789년 호적 속 나" },
  description: { zh: "按大邱户籍的身份比例抽取1789年的身份、职役、名字与一天，写成户籍上的一行。", en: "Your 1789 status, register title, name, family and day, written as a line of a Joseon household register.", es: "Tu estatus, título, nombre, familia y día en 1789, como una línea del registro de Joseon.", fr: "Votre statut, titre, nom, famille et journée en 1789, écrits comme une ligne du registre de Joseon.", ja: "大邱戸籍の身分比率で1789年の身分・職役・名前・一日を引き、戸籍の一行にします。", ko: "대구 호적의 신분 비율로 1789년 내 신분·직역·이름·가족·하루를 뽑아 호적 한 줄로 보여줘요." },
};

const france1789Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#1f3f8f",
  domain: "ontology",
  icon: "Flag",
  id: "france-1789",
  path: "/france-1789",
  status: "production",
  name: { zh: "1789年法国的我", en: "You in France, 1789", es: "Tú en Francia, 1789", fr: "Qui étiez-vous en 1789 ?", ja: "1789年フランスのわたし", ko: "1789년 프랑스의 나" },
  description: { zh: "按勒费弗尔的等级人口估计抽取身份，并看你是否当选三级会议代表。", en: "Clergy, nobility or Third Estate by Lefebvre's estimates, and whether you sat in the Estates-General.", es: "Clero, nobleza o tercer estado según Lefebvre, y si fuiste diputado.", fr: "Clergé, noblesse ou tiers état selon Lefebvre, et votre place aux États généraux.", ja: "ルフェーヴルの推計で身分を引き、三部会の代表になれたかを見せます。", ko: "르페브르 추정 인구로 신분을 뽑고, 삼부회 대표가 됐는지 보여줘요." },
};

const europe1426Manifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#7c3aed",
  domain: "ontology",
  icon: "Crown",
  id: "europe-1426",
  path: "/europe-1426",
  status: "production",
  name: { zh: "1426年欧洲王座", en: "Your throne in 1426 Europe", es: "Tu trono en 1426", fr: "Votre trône en 1426", ja: "1426年欧州の玉座", ko: "600년 전 유럽의 왕좌" },
  description: { zh: "1426年欧洲30个真实王座之一，附君主肖像和同龄名人。", en: "One of 30 real thrones of 1426 Europe, with the ruler's portrait and famous people your age.", es: "Uno de los 30 tronos reales de 1426, con retrato y famosos de tu edad.", fr: "L'un des 30 vrais trônes de 1426, avec portrait et célébrités de votre âge.", ja: "1426年欧州の実在30の玉座から一つ。君主の肖像と同い年の有名人も。", ko: "1426년 유럽에 실제로 있던 30개 왕좌 중 하나. 군주 초상과 동갑 유명인까지." },
};

const usBirthStateManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2563eb",
  domain: "ontology",
  icon: "Baby",
  id: "us-birth-state",
  path: "/us-birth-state",
  status: "production",
  name: { zh: "如果生在美国", en: "Born in the US", es: "Nacido en EE. UU.", fr: "Né aux États-Unis", ja: "米国で生まれたら", ko: "미국에서 태어났다면" },
  description: { zh: "按2024年各州出生数抽州，再按SSA名字统计取名。", en: "A state by 2024 births and a name from SSA baby-name data, on a birth certificate.", es: "Un estado según los nacimientos de 2024 y un nombre según la SSA.", fr: "Un État selon les naissances 2024 et un prénom selon la SSA.", ja: "2024年の州別出生で州を、SSAの統計で名前を引きます。", ko: "2024년 주별 출생 수로 주를, SSA 아기 이름 통계로 이름을 뽑아요." },
};

const reincarnationCountryManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#059669",
  domain: "ontology",
  icon: "Globe",
  id: "reincarnation-country",
  path: "/reincarnation-country",
  status: "production",
  name: {
    zh: "投胎 — 如果再出生会在哪国",
    en: "Reincarnation — if you were born again",
    es: "Reencarnación — si nacieras de nuevo",
    fr: "Réincarnation — si vous renaissiez",
    ja: "転生 — 生まれ変わるとしたら",
    ko: "환생 — 다시 태어난다면 어느 나라",
  },
  description: {
    zh: "按当前新生儿或当前人口加权抽取下一个国家。可独立抽取多次。",
    en: "A weighted draw of your next country using current births or current population.",
    es: "Sorteo ponderado del siguiente país según nacimientos o población actuales.",
    fr: "Tirage pondéré du prochain pays selon les naissances ou la population.",
    ja: "いまの出生または人口の重みで、次に生まれる国を抽選します。",
    ko: "지금 태어나는 아이 기준 또는 현재 인구 기준으로 환생 국가를 가중 추첨합니다.",
  },
};

// 삶의 균형 진단 — surfaces the balance (Wheel of Life) ontology engine.
const balanceWheelManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "CircleDashed",
  id: "life-balance",
  path: "/life-balance",
  status: "production",
  name: {
    zh: "生活平衡测评", en: "Wheel of Life", es: "Rueda de la vida",
    fr: "Roue de la vie", ja: "人生のバランス診断", ko: "삶의 균형 진단",
  },
  description: {
    zh: "对健康·关系·事业等8个生活领域评分，了解整体平衡与需改善之处。",
    en: "Rate 8 life areas to see your overall balance and where to focus first.",
    es: "Evalúa 8 áreas de vida para ver tu equilibrio y dónde enfocarte.",
    fr: "Évaluez 8 domaines de vie pour voir votre équilibre et vos priorités.",
    ja: "健康・人間関係・キャリアなど8領域から人生全体のバランスと改善点を診断。",
    ko: "건강·관계·커리어 등 8개 영역으로 삶의 전체 균형과 보완할 영역을 진단.",
  },
};

// Business Cashflow Explorer — how different industries make money (educational).
const cashflowManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "TrendingUp",
  id: "business-cashflow",
  path: "/business-cashflow",
  status: "production",
  name: {
    zh: "商业现金流", en: "How Businesses Make Money", es: "Cómo gana dinero un negocio",
    fr: "Comment les entreprises gagnent", ja: "ビジネスの稼ぎ方", ko: "사업은 어떻게 돈을 버나",
  },
  description: {
    zh: "租赁·补习班·银行·油管主等业种的收入·成本·净利现金流一图对比。",
    en: "Compare how rentals, academies, banks, YouTubers and more make money — revenue, costs and net profit as a flow.",
    es: "Compara cómo ganan dinero alquileres, academias, bancos, YouTubers y más.",
    fr: "Comparez comment gagnent locations, écoles, banques, YouTubeurs, etc.",
    ja: "賃貸・塾・銀行・YouTuberなど業種別に収益源・費用・純利益の流れを比較。",
    ko: "렌트·학원·은행·유튜버 등 업종별 수익원·비용·순이익 현금흐름을 한눈에 비교.",
  },
};

// Income Statement Builder game — classify accounts, watch profit layers build.
const incomeStatementGameManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "BarChart3",
  id: "income-statement-game",
  path: "/income-statement-game",
  status: "production",
  name: {
    zh: "损益表制作游戏", en: "Income Statement Game", es: "Juego del estado de resultados",
    fr: "Jeu du compte de résultat", ja: "損益計算書ゲーム", ko: "손익계산서 만들기 게임",
  },
  description: {
    zh: "把账户分类到正确科目，逐步搭建毛利→营业利润→净利润。",
    en: "Classify accounts into the right line and watch gross → operating → net profit build up.",
    es: "Clasifica cuentas y observa cómo se forman las utilidades.",
    fr: "Classez les comptes et voyez les niveaux de profit se construire.",
    ja: "勘定を正しい行に分類し、利益が段階的に積み上がる様子を学ぶ。",
    ko: "계정과목을 분류하며 매출총이익→영업이익→당기순이익을 단계별로 익히는 게임.",
  },
};

// Income tax calculation flow visualizer/estimator (Korea comprehensive income tax).
const incomeTaxFlowManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Receipt",
  id: "income-tax-flow",
  path: "/income-tax-flow",
  status: "production",
  name: {
    zh: "综合所得税计算流程", en: "Income Tax Flow", es: "Flujo del impuesto sobre la renta",
    fr: "Flux de l'impôt sur le revenu", ja: "所得税の計算フロー", ko: "종합소득세 계산 흐름",
  },
  description: {
    zh: "从所得金额到课税标准·算出税额·应纳税额，分步演示并解释。",
    en: "Walk income tax step by step: income → base → computed → payable, each term explained.",
    es: "Recorre el impuesto paso a paso con cada término explicado.",
    fr: "Parcourez l'impôt étape par étape, chaque terme expliqué.",
    ja: "所得金額→課税標準→算出税額→納付税額を段階的に解説。",
    ko: "소득금액→과세표준→산출세액→납부세액을 단계별로 설명하는 계산 흐름.",
  },
};

export const FEATURE_REGISTRY: FeatureManifest[] = [
  ontologyManifest,
  dailyManifest,
  strengthKeywordsManifest,
  journalManifest,
  emotionReleaseManifest,
  intervalTimerManifest,
  moneyParkingManifest,
  guildManifest,
  pranayamaManifest,
  countryMatchManifest,
  reincarnationCountryManifest,
  pastLife1426Manifest,
  sillaGolpumManifest,
  joseon1426Manifest,
  europe1426Manifest,
  joseonTimeManifest,
  future2626Manifest,
  joseonNamesManifest,
  jinshin1872Manifest,
  huangce1391Manifest,
  census1911Manifest,
  ellis1907Manifest,
  parallelLivesManifest,
  birthdayCalendarsManifest,
  hoebinghwan1789Manifest,
  domesday1086Manifest,
  census1850Manifest,
  ninbetsuEdoManifest,
  tongsinsa1763Manifest,
  banchado1795Manifest,
  gwageo1426Manifest,
  lunch1426Manifest,
  sillok1426Manifest,
  hometown1426Manifest,
  ancestors1426Manifest,
  joseon1789Manifest,
  france1789Manifest,
  usBirthStateManifest,
  balanceWheelManifest,
  cashflowManifest,
  incomeStatementGameManifest,
  incomeTaxFlowManifest,
];

// Helper to get features easily
export const getFeaturesByDomain = (domain: string) =>
  FEATURE_REGISTRY.filter((f) => f.domain === domain);
export const getFeatureById = (id: string) =>
  FEATURE_REGISTRY.find((f) => f.id === id);

// Backwards compatibility for now, but deprecated. Use FEATURE_REGISTRY.
export const features: Record<string, FeatureManifest> =
  FEATURE_REGISTRY.reduce(
    (acc, f) => {
      acc[f.id] = f;
      return acc;
    },
    {} as Record<string, FeatureManifest>,
  );

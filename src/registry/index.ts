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

// Payday Menu Roulette — random meal picker + small treat idea (G11).
const menuRouletteManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Utensils",
  id: "menu-roulette",
  path: "/menu/roulette",
  status: "production",
  name: {
    zh: "发薪日菜单轮盘", en: "Payday Menu Roulette", es: "Ruleta de menú",
    fr: "Roulette du menu", ja: "給料日メニュールーレット", ko: "월급날 메뉴 룰렛",
  },
  description: {
    zh: "不知道吃什么？转动轮盘随机推荐一餐。",
    en: "Can't decide what to eat? Spin for a random meal by cuisine.",
    es: "¿No sabes qué comer? Gira para una comida aleatoria.",
    fr: "Indécis sur le repas ? Tournez pour un plat aléatoire.",
    ja: "何食べるか迷ったら回す。料理別ランダム推薦。",
    ko: "뭐 먹지 고민될 때 돌리는 메뉴 추천 룰렛(+월급날 작은 사치).",
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

// Lotto Win Simulator — spend a jackpot, see your priorities (G10).
const lottoSimManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Coins",
  id: "lotto-simulator",
  path: "/lotto/simulator",
  status: "production",
  name: {
    zh: "彩票中奖模拟器", en: "Lotto Win Simulator", es: "Simulador de lotería",
    fr: "Simulateur de gain loto", ja: "宝くじ当選シミュレーター", ko: "로또 당첨 시뮬레이터",
  },
  description: {
    zh: "选择奖金，自由花在房子车旅行上，余额实时变化。",
    en: "Pick a jackpot and spend it on home/car/travel; balance updates live.",
    es: "Elige un premio y gástalo; el saldo se actualiza en vivo.",
    fr: "Choisissez un gain et dépensez-le ; le solde se met à jour.",
    ja: "当選金を選んで自由に使う。残額がリアルタイム更新。",
    ko: "당첨금을 골라 집·차·여행에 써보는 시뮬(잔액 실시간).",
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

// 해외금융계좌 신고 자가진단 — Korea overseas financial account reporting checker.
const foreignAccountManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Landmark",
  id: "foreign-account",
  path: "/foreign-account",
  status: "production",
  name: {
    zh: "海外金融账户申报自测", en: "Overseas Account Reporting Checker", es: "Verificador de cuentas en el extranjero",
    fr: "Vérificateur de comptes étrangers", ja: "海外金融口座申告セルフチェック", ko: "해외금융계좌 신고 자가진단",
  },
  description: {
    zh: "把海外存款、股票（RSU）、基金、保险、虚拟资产折算为韩元，判断月末合计是否超过5亿韩元及申报基准日。",
    en: "Convert overseas deposit/stock(RSU)/fund/insurance/crypto balances to KRW and check the ₩500M month-end test and basis date.",
    es: "Convierte saldos de cuentas en el extranjero a KRW y comprueba el umbral de ₩500M a fin de mes.",
    fr: "Convertit les soldes de comptes étrangers en KRW et vérifie le seuil de 500M₩ en fin de mois.",
    ja: "海外の預金・株式（RSU）・ファンド・保険・暗号資産を韓国ウォン換算し、月末合計が5億ウォン超か・申告基準日を判定。",
    ko: "해외 예금·주식(RSU)·펀드·보험·가상자산을 원화로 환산해 매월 말일 5억원 초과 여부와 신고 기준일을 자가진단.",
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

// Overseas Stock / RSU capital-gains tax estimator (Korea resident).
const overseasStockTaxManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#16a34a",
  domain: "ontology",
  icon: "Calculator",
  id: "overseas-stock-tax",
  path: "/overseas-stock-tax",
  status: "production",
  name: {
    zh: "海外股票·RSU税金计算", en: "Foreign Stock & RSU Tax", es: "Impuesto acciones extranjeras y RSU",
    fr: "Impôt actions étrangères & RSU", ja: "海外株式・RSU 税金計算", ko: "해외주식·RSU 양도세 계산기",
  },
  description: {
    zh: "估算韩国居民海外股票及美企RSU的资本利得税(年250万韩元扣除·22%)。",
    en: "Estimate Korean capital-gains tax on foreign stocks and US-company RSUs (₩2.5M deduction, 22%).",
    es: "Estima el impuesto coreano sobre acciones extranjeras y RSU (deducción ₩2.5M, 22%).",
    fr: "Estimez l'impôt coréen sur actions étrangères et RSU (déduction ₩2,5M, 22%).",
    ja: "海外株式・米企業RSUの韓国譲渡所得税を試算(年250万ウォン控除・22%)。",
    ko: "해외주식 양도차익과 미국 회사 RSU의 양도소득세를 계산(연 250만 공제·22%).",
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

const taxCalendarManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#059669",
  domain: "ontology",
  icon: "Timer",
  id: "tax-calendar",
  path: "/tax-calendar",
  status: "production",
  name: {
    zh: "韩国报税日历", en: "Korean Tax Calendar", es: "Calendario fiscal coreano",
    fr: "Calendrier fiscal coréen", ja: "韓国税務カレンダー", ko: "세금 신고 캘린더",
  },
  description: {
    zh: "按纳税人查看韩国国税与地方税的年度申报缴纳日程及下次截止倒计时。",
    en: "Korea's national & local tax deadlines by taxpayer, with a live D-day to the next filing.",
    es: "Los plazos fiscales nacionales y locales de Corea por contribuyente, con cuenta atrás.",
    fr: "Les échéances fiscales coréennes (national et local) par contribuable, avec compte à rebours.",
    ja: "韓国の国税・地方税の年間申告・納付日程を対象者別に確認、次の締切までのD-day付き。",
    ko: "부가세·종소세·법인세·재산세 등 국세·지방세 연간 신고·납부 일정을 대상자별로 보고 다음 마감 D-day 확인.",
  },
};

const financialRatiosManifest: FeatureManifest = {
  badge: "new",
  category: ["ontology"],
  color: "#2563eb",
  domain: "ontology",
  icon: "Calculator",
  id: "financial-ratios",
  path: "/financial-ratios",
  status: "production",
  name: {
    zh: "财务比率探索器", en: "Financial Ratio Explorer", es: "Explorador de ratios financieros",
    fr: "Explorateur de ratios financiers", ja: "財務比率エクスプローラー", ko: "재무비율 탐색기",
  },
  description: {
    zh: "在示例财务报表中选择比率，分子分母以两色联动高亮，学习流动比率·ROE等。",
    en: "Pick a ratio on sample statements; its numerator and denominator light up in two colors. Learn current ratio, ROE and more.",
    es: "Elige un ratio en estados de ejemplo; numerador y denominador se iluminan en dos colores.",
    fr: "Choisissez un ratio sur des états d'exemple ; numérateur et dénominateur s'illuminent en deux couleurs.",
    ja: "サンプル財務諸表で比率を選ぶと分子・分母が2色で連動。流動比率・ROEなどを学ぶ。",
    ko: "샘플 재무제표에서 비율을 고르면 분자·분모가 2색으로 연동. 유동비율·부채비율·ROE 등 학습.",
  },
};

export const FEATURE_REGISTRY: FeatureManifest[] = [
  ontologyManifest,
  dailyManifest,
  strengthKeywordsManifest,
  journalManifest,
  menuRouletteManifest,
  emotionReleaseManifest,
  intervalTimerManifest,
  lottoSimManifest,
  moneyParkingManifest,
  guildManifest,
  pranayamaManifest,
  foreignAccountManifest,
  countryMatchManifest,
  balanceWheelManifest,
  cashflowManifest,
  overseasStockTaxManifest,
  incomeStatementGameManifest,
  incomeTaxFlowManifest,
  taxCalendarManifest,
  financialRatiosManifest,
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

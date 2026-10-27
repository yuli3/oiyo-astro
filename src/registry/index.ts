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

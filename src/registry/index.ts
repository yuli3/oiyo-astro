import { dailyManifest } from "@/app/[locale]/daily/manifest";
import { ontologyManifest } from "@/app/[locale]/ontology/manifest";
import { FeatureManifest } from "@/types/manifest";

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
    cn: "优势关键词",
    en: "Strength Keywords",
    es: "Palabras clave de fortalezas",
    fr: "Mots-clés de forces",
    ja: "強みキーワード",
    ko: "강점 키워드 찾기",
  },
  description: {
    cn: "选择你喜欢的动词和名词，汇集你的优势关键词。",
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
    cn: "今日日记",
    en: "Today's Journal",
    es: "Diario de hoy",
    fr: "Journal du jour",
    ja: "今日のジャーナル",
    ko: "오늘의 저널",
  },
  description: {
    cn: "每天回答一个反思问题，记录只保存在浏览器中。",
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
    cn: "发薪日菜单轮盘", en: "Payday Menu Roulette", es: "Ruleta de menú",
    fr: "Roulette du menu", ja: "給料日メニュールーレット", ko: "월급날 메뉴 룰렛",
  },
  description: {
    cn: "不知道吃什么？转动轮盘随机推荐一餐。",
    en: "Can't decide what to eat? Spin for a random meal by cuisine.",
    es: "¿No sabes qué comer? Gira para una comida aleatoria.",
    fr: "Indécis sur le repas ? Tournez pour un plat aléatoire.",
    ja: "何食べるか迷ったら回す。料理別ランダム推薦。",
    ko: "뭐 먹지 고민될 때 돌리는 메뉴 추천 룰렛(+월급날 작은 사치).",
  },
};

export const FEATURE_REGISTRY: FeatureManifest[] = [
  ontologyManifest,
  dailyManifest,
  strengthKeywordsManifest,
  journalManifest,
  menuRouletteManifest,
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

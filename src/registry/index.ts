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

export const FEATURE_REGISTRY: FeatureManifest[] = [
  ontologyManifest,
  dailyManifest,
  strengthKeywordsManifest,
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

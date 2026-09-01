// /tests 의 질문 중심 IA — 2026-09-01.
//
// 방문자는 척도명("BWAS", "GSE")이 아니라 지금 궁금한 질문으로 검사를 고른다.
// 이 파일은 **분류만** 소유한다. 검사 자체(제목·설명·아이콘·href)는 여전히
// tests/index.astro 의 배열이 정본이며 여기서 복제하지 않는다 — 복제하면 두
// 목록이 갈라지고, 갈라진 쪽이 어느 쪽인지 아무도 모르게 된다.
//
// 근거: company-brain/projects/oiyo-ecosystem/planned-unstarted-work-execution-prd-2026-08-26.md §4
import type { Locale } from "../i18n";

export type LaneId = "self" | "relationships" | "work" | "mood";

export interface QuestionLane {
  id: LaneId;
  /** 카드 묶음의 첫 surface. 분류명이 아니라 방문자의 질문이다. */
  question: Record<Locale, string>;
  /** 짧은 라벨 — 목차·앵커용. 질문을 대신하지 않는다. */
  label: Record<Locale, string>;
}

export const QUESTION_LANES: QuestionLane[] = [
  {
    id: "self",
    question: {
      ko: "나는 어떤 사람인가?",
      en: "What kind of person am I?",
      ja: "私はどんな人間か？",
      zh: "我是什么样的人？",
      fr: "Quel genre de personne suis-je ?",
      es: "¿Qué clase de persona soy?",
    },
    label: { ko: "성격", en: "Personality", ja: "性格", zh: "性格", fr: "Personnalité", es: "Personalidad" },
  },
  {
    id: "relationships",
    question: {
      ko: "나는 가까운 사람과 어떻게 연결되는가?",
      en: "How do I connect with the people close to me?",
      ja: "私は身近な人とどうつながるか？",
      zh: "我如何与亲近的人建立联系？",
      fr: "Comment je me lie aux personnes proches ?",
      es: "¿Cómo me vinculo con las personas cercanas?",
    },
    label: { ko: "관계", en: "Relationships", ja: "関係", zh: "关系", fr: "Relations", es: "Relaciones" },
  },
  {
    id: "work",
    question: {
      ko: "나는 어떻게 일하고 선택하는가?",
      en: "How do I work and decide?",
      ja: "私はどう働き、どう選ぶか？",
      zh: "我如何工作与选择？",
      fr: "Comment je travaille et je décide ?",
      es: "¿Cómo trabajo y decido?",
    },
    label: { ko: "일", en: "Work", ja: "仕事", zh: "工作", fr: "Travail", es: "Trabajo" },
  },
  {
    id: "mood",
    question: {
      ko: "요즘 내 상태는 어떤가?",
      en: "How am I doing lately?",
      ja: "最近の私の状態は？",
      zh: "我最近的状态如何？",
      fr: "Comment je vais ces temps-ci ?",
      es: "¿Cómo estoy últimamente?",
    },
    label: { ko: "지금 마음", en: "Right now", ja: "今の心", zh: "此刻心情", fr: "En ce moment", es: "Ahora mismo" },
  },
];

/**
 * 검사 경로 → lane. 경로는 로케일 접두사 **없는** 형태다(`localePath` 이전 값).
 *
 * 사주·타로·수비학·띠·별자리 등 운세 실행면은 여기에 없다. 삭제가 아니라
 * 허브 역할 분리이며 각 canonical route 는 그대로 살아 있다.
 */
export const LANE_BY_PATH: Record<string, LaneId> = {
  // 나는 어떤 사람인가
  "/mbti/test": "self",
  "/enneagram/test": "self",
  "/big5/test": "self",
  "/shadow-self-test": "self",
  "/curiosity-test": "self",
  "/playfulness-test": "self",
  "/self-concept-clarity-test": "self",
  "/inner-child-test": "self",
  "/locus-of-control-test": "self",
  "/personal-color/test": "self",
  "/narcissism/test": "self",
  "/political/test": "self",

  // 가까운 사람과 어떻게 연결되는가
  "/attachment-style/test": "relationships",
  "/love-language/test": "relationships",
  "/empathy/test": "relationships",
  "/eq/test": "relationships",
  "/relationship-boredom-test": "relationships",
  "/jealousy-type-test": "relationships",
  "/social-comparison-test": "relationships",
  "/emotional-expressiveness-test": "relationships",
  "/assertiveness-test": "relationships",

  // 어떻게 일하고 선택하는가
  "/mbti/career": "work",
  "/workaholic-test": "work",
  "/self-efficacy-test": "work",
  "/self-control-test": "work",
  "/entrepreneurial-aptitude-test": "work",
  "/investment-type/test": "work",
  "/perfectionism/test": "work",
  "/lazy-perfectionist/test": "work",
  "/money-anxiety-test": "work",
  "/inner-strength/test": "work",
  "/habit-builder/30-days": "work",

  // 요즘 내 상태는 어떤가 — YMYL. 선별이지 진단이 아니라는 경계 문구를 유지한다.
  "/depression/test": "mood",
  "/anxiety/test": "mood",
  "/social-anxiety/test": "mood",
  "/adhd/test": "mood",
  "/lethargy/test": "mood",
  "/burnout/test": "mood",
  "/anger-style/test": "mood",
  "/sleep-type/test": "mood",
  "/self-esteem/test": "mood",
  "/fomo-test": "mood",
  "/emotional-labor-test": "mood",
};

/** "지금 마음"은 선별 도구 묶음이라 묶음 단위 비진단 경계가 필요하다. */
export const MOOD_BOUNDARY: Record<Locale, string> = {
  ko: "선별 도구이며 진단이 아닙니다. 결과가 걱정되면 전문가와 상의하세요.",
  en: "These are screening tools, not diagnoses. If a result worries you, talk to a professional.",
  ja: "スクリーニングであり診断ではありません。結果が気になる場合は専門家にご相談ください。",
  zh: "这些是筛查工具，不是诊断。若结果令你担心，请咨询专业人士。",
  fr: "Ce sont des outils de dépistage, pas des diagnostics. Si un résultat vous inquiète, consultez un professionnel.",
  es: "Son herramientas de cribado, no diagnósticos. Si un resultado te preocupa, consulta a un profesional.",
};

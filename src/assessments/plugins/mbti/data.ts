import type {
  AssessmentLocale,
  AssessmentLocaleBundle,
  InstrumentDefinition,
} from "../../core";

export const MBTI_AXES = ["EI", "SN", "TF", "JP"] as const;
export type MbtiAxis = (typeof MBTI_AXES)[number];
export type MbtiPreference = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export const MBTI_POLES: Record<MbtiAxis, readonly [MbtiPreference, MbtiPreference]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const;

interface ItemCopy {
  axis: MbtiAxis;
  en: readonly [string, string, string];
  id: string;
  ko: readonly [string, string, string];
}

const ITEM_COPY: ItemCopy[] = [
  { id: "q1", axis: "EI", ko: ["에너지가 떨어졌을 때 나는 보통...", "사람들과 만나 이야기하며 회복한다", "혼자 조용히 쉬며 회복한다"], en: ["When your energy is low, you usually...", "Recharge by talking with people", "Recharge through quiet time alone"] },
  { id: "q2", axis: "SN", ko: ["새로운 정보를 볼 때 먼저 끌리는 것은?", "구체적인 사실과 실제 사례", "패턴, 의미, 가능성"], en: ["When you meet new information, what grabs you first?", "Concrete facts and real examples", "Patterns, meanings, and possibilities"] },
  { id: "q3", axis: "TF", ko: ["중요한 결정을 내릴 때 더 신뢰하는 기준은?", "논리와 일관성", "가치와 사람에게 미칠 영향"], en: ["For important decisions, you trust...", "Logic and consistency", "Values and impact on people"] },
  { id: "q4", axis: "JP", ko: ["일정과 계획에 대한 나의 감각은?", "미리 정리해두면 마음이 편하다", "상황에 맞춰 바꿀 여지가 있어야 편하다"], en: ["Your natural feel for plans is...", "Clear structure helps me relax", "Room to adapt helps me relax"] },
  { id: "q5", axis: "EI", ko: ["모임에서 나는 주로...", "여러 사람과 폭넓게 대화한다", "소수와 깊게 대화한다"], en: ["At gatherings, you tend to...", "Talk broadly with many people", "Talk deeply with a few people"] },
  { id: "q6", axis: "SN", ko: ["문제를 해결할 때 선호하는 출발점은?", "이미 검증된 방법과 절차", "새로운 가설과 큰 그림"], en: ["When solving problems, you prefer starting from...", "Proven methods and procedures", "New hypotheses and the big picture"] },
  { id: "q7", axis: "TF", ko: ["갈등 상황에서 내가 먼저 찾는 것은?", "공정하고 객관적인 해결책", "관계의 회복과 정서적 균형"], en: ["In conflict, you first look for...", "A fair and objective solution", "Relational repair and emotional balance"] },
  { id: "q8", axis: "JP", ko: ["여행을 준비할 때 나는...", "동선과 예약을 미리 정한다", "핵심만 정하고 즉흥을 즐긴다"], en: ["When planning travel, you...", "Set the route and bookings early", "Keep the essentials and improvise"] },
  { id: "q9", axis: "EI", ko: ["아이디어를 정리할 때 더 자연스러운 방식은?", "말하면서 생각이 선명해진다", "생각한 뒤 말해야 선명하다"], en: ["Your ideas become clearer when...", "You talk them through", "You think before speaking"] },
  { id: "q10", axis: "SN", ko: ["설명을 들을 때 더 좋은 방식은?", "단계별 예시와 세부사항", "원리와 전체 구조"], en: ["A helpful explanation gives you...", "Step-by-step examples and details", "Principles and overall structure"] },
  { id: "q11", axis: "TF", ko: ["피드백을 줄 때 내가 더 신경 쓰는 것은?", "정확하고 솔직한 개선점", "받는 사람이 감당할 수 있는 표현"], en: ["When giving feedback, you focus more on...", "Accurate, honest improvement points", "Words the person can receive well"] },
  { id: "q12", axis: "JP", ko: ["마감이 다가오면 나는...", "미리 끝내고 수정한다", "막판 집중력으로 처리한다"], en: ["As a deadline approaches, you...", "Finish early and revise", "Use last-minute focus"] },
  { id: "q13", axis: "EI", ko: ["긴 하루 뒤 더 끌리는 선택은?", "가벼운 만남이나 대화", "나만의 공간과 침묵"], en: ["After a long day, you are more drawn to...", "A light hangout or conversation", "Your own space and silence"] },
  { id: "q14", axis: "SN", ko: ["나는 보통...", "현재 가능한 것에 집중한다", "앞으로 가능해질 것에 집중한다"], en: ["You usually focus on...", "What is practical now", "What could become possible"] },
  { id: "q15", axis: "TF", ko: ["좋은 판단이란?", "감정보다 기준이 흔들리지 않는 것", "상황과 사람의 맥락을 살피는 것"], en: ["Good judgment means...", "Keeping standards steady beyond emotion", "Reading the context and people involved"] },
  { id: "q16", axis: "JP", ko: ["선택지를 대하는 나의 방식은?", "빨리 결정하고 실행한다", "가능성을 더 열어둔다"], en: ["With options, you prefer to...", "Decide and move quickly", "Keep possibilities open longer"] },
];

export const MBTI_INSTRUMENT: InstrumentDefinition = {
  items: ITEM_COPY.map((item) => ({
    constructId: `personality.mbti.preference.${item.axis}`,
    id: item.id,
    promptKey: `items.${item.id}.prompt`,
    required: true,
    responseScaleId: `preference-${item.axis}`,
  })),
  responseScales: MBTI_AXES.map((axis) => ({
    id: `preference-${axis}`,
    kind: "single-select",
    options: MBTI_POLES[axis].map((value) => ({
      labelKey: `preferences.${value}`,
      value,
    })),
  })),
  version: "mbti-oiyo-preference-16-v1",
};

function stringsFor(language: "en" | "ko"): Record<string, string> {
  const axisLabels: Record<MbtiAxis, readonly [string, string]> = language === "ko"
    ? { EI: ["외향", "내향"], SN: ["감각", "직관"], TF: ["사고", "감정"], JP: ["판단", "인식"] }
    : { EI: ["Extraversion", "Introversion"], SN: ["Sensing", "Intuition"], TF: ["Thinking", "Feeling"], JP: ["Judging", "Perceiving"] };
  const entries: [string, string][] = ITEM_COPY.flatMap((item) => {
      const [prompt, first, second] = item[language];
      const [firstPole, secondPole] = MBTI_POLES[item.axis];
      return [
        [`items.${item.id}.prompt`, prompt],
        [`items.${item.id}.${firstPole}`, first],
        [`items.${item.id}.${secondPole}`, second],
      ];
    });
  for (const axis of MBTI_AXES) {
    const [firstPole, secondPole] = MBTI_POLES[axis];
    const [firstLabel, secondLabel] = axisLabels[axis];
    entries.push([`mbti.axis.${axis}`, `${firstLabel}–${secondLabel}`]);
    entries.push([`preferences.${firstPole}`, `${firstPole} — ${firstLabel}`]);
    entries.push([`preferences.${secondPole}`, `${secondPole} — ${secondLabel}`]);
  }
  entries.push([
    "mbti.caveat.reflective-not-official",
    language === "ko"
      ? "네 선호축을 돌아보는 OIYO 자체 문항이며 공식 MBTI® 검사나 진단 도구가 아닙니다."
      : "OIYO-authored prompts for reflecting on four preference axes; not the official MBTI® assessment or a diagnostic tool.",
  ]);
  for (const type of MBTI_TYPES) {
    entries.push([`mbti.types.${type}.title`, type]);
    entries.push([
      `mbti.types.${type}.body`,
      language === "ko"
        ? `${type}는 현재 네 선호축 응답에서 파생된 요약입니다. 축의 강도와 경계도 함께 살펴보세요.`
        : `${type} is a summary derived from your current four-axis preferences. Read it alongside each axis strength and boundary.`,
    ]);
  }
  return Object.fromEntries(entries);
}

const META: Record<AssessmentLocale, { description: string; disclaimer: string; name: string }> = {
  ko: { name: "MBTI 선호 프레임워크", description: "16문항으로 네 가지 성격 선호 축을 돌아봅니다.", disclaimer: "OIYO가 만든 자기성찰용 문항이며 공식 MBTI® 검사, 임상 진단 또는 채용 도구가 아닙니다." },
  en: { name: "MBTI Preference Framework", description: "Reflect on four personality-preference axes through 16 prompts.", disclaimer: "These are OIYO-authored reflection prompts, not the official MBTI® assessment, a clinical diagnosis, or a hiring tool." },
  ja: { name: "MBTI Preference Framework", description: "Reflect on four personality-preference axes through 16 prompts.", disclaimer: "OIYO-authored reflection prompts; not the official MBTI® assessment, diagnosis, or hiring tool." },
  zh: { name: "MBTI Preference Framework", description: "Reflect on four personality-preference axes through 16 prompts.", disclaimer: "OIYO-authored reflection prompts; not the official MBTI® assessment, diagnosis, or hiring tool." },
  fr: { name: "MBTI Preference Framework", description: "Reflect on four personality-preference axes through 16 prompts.", disclaimer: "OIYO-authored reflection prompts; not the official MBTI® assessment, diagnosis, or hiring tool." },
  es: { name: "MBTI Preference Framework", description: "Reflect on four personality-preference axes through 16 prompts.", disclaimer: "OIYO-authored reflection prompts; not the official MBTI® assessment, diagnosis, or hiring tool." },
};

export function mbtiLocaleBundle(): AssessmentLocaleBundle {
  const en = stringsFor("en");
  return Object.fromEntries(
    Object.entries(META).map(([locale, value]) => [locale, {
      content: {
        ...value,
        seoDescription: value.description,
        seoTitle: value.name,
        strings: locale === "ko" ? stringsFor("ko") : en,
      },
      status: locale === "ko" || locale === "en" ? "reviewed" : "draft",
    }]),
  ) as AssessmentLocaleBundle;
}

export const MBTI_ITEM_PROVENANCE =
  "All 16 preference prompts are original OIYO-authored items. This reflective framework is not the official MBTI® instrument and makes no claim of equivalence or validation.";

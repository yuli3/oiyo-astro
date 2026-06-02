// src/lib/relationship-mbti.ts

export interface Question {
  dimension: string;
  id: string;
  options: { id: string; text: string }[];
  text: string;
}

export interface RelationshipMbtiResult {
  description: string;
  dimensions: {
    approach: "A" | "P";
    attraction: "Q" | "S";
    defensiveness: "D" | "I";
    flirting: "E" | "M";
  };
  primary: string;
  title: string;
}

export const RELATIONSHIP_MBTI_QUESTIONS: Record<string, Question[]> = {
  ko: [
    {
      dimension: "approach",
      id: "q1",
      options: [
        { id: "A", text: "적극적으로 다가가 먼저 말을 건다." },
        { id: "P", text: "상대방이 먼저 다가오길 기다린다." },
      ],
      text: "마음에 드는 상대를 발견했을 때, 나는...",
    },
    {
      dimension: "attraction",
      id: "q2",
      options: [
        { id: "Q", text: "그렇다, 금방 사랑에 빠진다." },
        { id: "S", text: "아니다, 천천히 알아가는 편이다." },
      ],
      text: "나는 누군가에게 쉽게 마음이 가는 편이다.",
    },
    {
      dimension: "flirting",
      id: "q3",
      options: [
        { id: "E", text: "감정 표현을 솔직하게 하는 편이다." },
        { id: "M", text: "속마음을 잘 드러내지 않아 신비주의처럼 보인다." },
      ],
      text: "썸을 탈 때 나의 모습은...",
    },
    {
      dimension: "defensiveness",
      id: "q4",
      options: [
        { id: "D", text: "문제를 직접적으로 마주하고 해결하려 한다." },
        { id: "I", text: "상황을 피하거나 간접적으로 불만을 표현한다." },
      ],
      text: "연인과 갈등이 생겼을 때 나는...",
    },
    {
      dimension: "approach",
      id: "q5",
      options: [
        { id: "A", text: "내가 먼저 하는 편이다." },
        { id: "P", text: "상대방이 해주길 바라는 편이다." },
      ],
      text: "데이트 신청은 주로...",
    },
    {
      dimension: "attraction",
      id: "q6",
      options: [
        { id: "Q", text: "그렇다, 쉽게 감동받고 마음이 커진다." },
        { id: "S", text: "아니다, 여러 번의 일관된 행동을 보고 판단한다." },
      ],
      text: "상대방의 작은 행동 하나하나에 큰 의미를 부여하는 편이다.",
    },
    {
      dimension: "flirting",
      id: "q7",
      options: [
        { id: "E", text: "칭찬이나 선물 등으로 명확하게 표현한다." },
        { id: "M", text: "은근한 눈빛이나 가벼운 스킨십으로 암시한다." },
      ],
      text: "관심 있는 상대에게 나의 마음을 표현할 때...",
    },
    {
      dimension: "defensiveness",
      id: "q8",
      options: [
        { id: "D", text: "솔직하게 서운한 점을 이야기한다." },
        { id: "I", text: "말을 안 하거나 퉁명스럽게 행동한다." },
      ],
      text: "상대방에게 서운함을 느낄 때...",
    },
    {
      dimension: "approach",
      id: "q9",
      options: [
        { id: "A", text: "그렇다." },
        { id: "P", text: "아니다." },
      ],
      text: "나는 관계에서 주도권을 잡는 편이다.",
    },
    {
      dimension: "attraction",
      id: "q10",
      options: [
        { id: "Q", text: "그렇다, 첫인상이 매우 중요하다." },
        { id: "S", text: "아니다, 시간을 두고 알아봐야 한다." },
      ],
      text: "첫인상이 좋았던 사람에게 호감을 느끼는 편이다.",
    },
    {
      dimension: "flirting",
      id: "q11",
      options: [
        { id: "E", text: "연락을 자주 하고 만남을 적극적으로 주선한다." },
        { id: "M", text: "가끔은 거리를 두며 상대방의 반응을 살핀다." },
      ],
      text: "썸 단계에서 나는...",
    },
    {
      dimension: "defensiveness",
      id: "q12",
      options: [
        { id: "D", text: "끝까지 해결책을 찾으려 노력한다." },
        { id: "I", text: "쉽게 관계를 포기하는 편이다." },
      ],
      text: "관계에 위기가 왔을 때, 나는...",
    },
  ],
};

export const RELATIONSHIP_MBTI_RESULTS: Record<
  string,
  { description: string; title: string }
> = {
  AQED: {
    description:
      "적극적으로 다가가 빠르게 사랑에 빠지고, 감정 표현에 솔직하며 갈등도 정면으로 돌파하는 당신! 화끈한 연애를 즐기는 당신은 매력적인 연인입니다.",
    title: "열정적인 불도저",
  },
  AQEI: {
    description:
      "적극적이고 금방 사랑에 빠지지만, 갈등 상황에서는 마음의 상처를 받고 회피하는 경향이 있네요. 당신의 열정적인 사랑을 지키기 위해 때로는 용기가 필요해요.",
    title: "뜨거운 로맨티스트",
  },
  // ... 14 more result types
  PSMD: {
    description:
      "수동적이고 신중하게 사랑을 시작하며, 속마음을 잘 드러내지 않지만 문제 상황에서는 이성적으로 해결하려는 당신. 당신의 진심을 알아주는 사람을 만나면 최고의 연인이 될 거예요.",
    title: "신중한 철벽 수비수",
  },
  PSMI: {
    description:
      "다가오길 기다리며, 천천히 사랑에 빠지고, 감정 표현도 조심스러운 당신. 갈등을 싫어해 평화로운 연애를 지향하지만, 때로는 당신의 속마음을 보여주는 것도 중요해요.",
    title: "조용한 평화주의자",
  },
};

export function calculateRelationshipMbti(
  answers: Record<string, string>,
): RelationshipMbtiResult {
  // dimensions calculation removed as unused

  // A simple majority vote for each dimension
  const approach =
    Object.values(answers).filter((v) => v === "A").length >= 2 ? "A" : "P";
  const attraction =
    Object.values(answers).filter((v) => v === "Q").length >= 2 ? "Q" : "S";
  const flirting =
    Object.values(answers).filter((v) => v === "E").length >= 2 ? "E" : "M";
  const defensiveness =
    Object.values(answers).filter((v) => v === "D").length >= 2 ? "D" : "I";

  const finalDimensions = {
    approach: approach as "A" | "P",
    attraction: attraction as "Q" | "S",
    defensiveness: defensiveness as "D" | "I",
    flirting: flirting as "E" | "M",
  };

  const primary = `${approach}${attraction}${flirting}${defensiveness}`;

  const result =
    RELATIONSHIP_MBTI_RESULTS[primary] || RELATIONSHIP_MBTI_RESULTS["PSMI"];

  return {
    dimensions: finalDimensions,
    primary,
    ...result,
  };
}

import { LocalizedText } from "@/types/manifest";

import { ConflictResponseType } from "./types";

export interface ConflictResponseQuestion {
  emoji: string; // Emoji for visual context
  id: string;
  options: {
    emoji: string;
    id: string;
    scores: Record<ConflictResponseType, number>;
    text: LocalizedText;
  }[];
  text: LocalizedText;
}

export const CONFLICT_RESPONSE_QUESTIONS: ConflictResponseQuestion[] = [
  // 1. Credit Stealing
  {
    emoji: "💡",
    id: "1",
    options: [
      {
        emoji: "😶",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: {
          en: "Say nothing but feel resentful",
          ko: "아무 말 안하지만 속으로 분노한다",
        },
      },
      {
        emoji: "🗣️",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 0,
        },
        text: {
          en: "Confront them immediately in front of everyone",
          ko: "그 자리에서 바로 따진다",
        },
      },
      {
        emoji: "🤝",
        id: "c",
        scores: {
          analytical: 2,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 3,
        },
        text: {
          en: "Gently clarify the origin of the idea",
          ko: "부드럽게 아이디어의 출처를 밝힌다",
        },
      },
      {
        emoji: "📋",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 1,
        },
        text: {
          en: "Document it and speak to HR privately",
          ko: "기록해두고 나중에 HR과 상의한다",
        },
      },
    ],
    text: {
      cn: "Colleague takes credit:",
      en: "Your colleague takes credit for your idea in a meeting. Your reaction?",
      es: "Colleague takes credit:",
      fr: "Colleague takes credit:",
      ja: "Colleague takes credit:",
      ko: "동료가 회의에서 당신의 아이디어를 자신의 공으로 돌립니다. 당신의 반응은?",
    },
  },
  // 2. Unfair Criticism
  {
    emoji: "👔",
    id: "2",
    options: [
      {
        emoji: "🙇",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 2,
        },
        text: {
          en: "Apologize to end the scene quickly",
          ko: "빨리 상황을 끝내려 사과한다",
        },
      },
      {
        emoji: "🛡️",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 0,
        },
        text: {
          en: "Defend yourself and correct facts immediately",
          ko: "즉시 사실관계를 정정하며 방어한다",
        },
      },
      {
        emoji: "💬",
        id: "c",
        scores: {
          analytical: 2,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 3,
        },
        text: {
          en: "Acknowledge feedback and suggest private talk",
          ko: "일단 수용 후 따로 대화를 청한다",
        },
      },
      {
        emoji: "❓",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 2,
        },
        text: {
          en: "Ask for specific examples of the issue",
          ko: "구체적인 문제 사례를 되묻는다",
        },
      },
    ],
    text: {
      cn: "Unfair criticism:",
      en: "Boss criticizes you unfairly in public. You:",
      es: "Unfair criticism:",
      fr: "Unfair criticism:",
      ja: "Unfair criticism:",
      ko: "상사가 공개적인 자리에서 부당하게 비판합니다. 당신은:",
    },
  },
  // 3. Flaky Friend
  {
    emoji: "📅",
    id: "3",
    options: [
      {
        emoji: "😅",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: {
          en: 'Say "it is okay" but stop inviting them',
          ko: "괜찮다고 하고 다시는 안 부른다",
        },
      },
      {
        emoji: "😤",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 1,
        },
        text: {
          en: "Tell them they are being disrespectful",
          ko: "무례하다고 직설적으로 말한다",
        },
      },
      {
        emoji: "💙",
        id: "c",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 3,
        },
        text: {
          en: "Share your disappointment and check on them",
          ko: "서운함을 표현하고 무슨 일인지 묻는다",
        },
      },
      {
        emoji: "📊",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 2,
        },
        text: {
          en: "Point out the pattern and ask for explanation",
          ko: "반복되는 패턴을 지적하고 설명을 요구한다",
        },
      },
    ],
    text: {
      cn: "Flaky friend:",
      en: "Friend cancels last minute for the 3rd time. You:",
      es: "Flaky friend:",
      fr: "Flaky friend:",
      ja: "Flaky friend:",
      ko: "친구가 세 번 연속 당일 취소를 했습니다. 당신은:",
    },
  },
  // 4. Meeting Disagreement
  {
    emoji: "🤔",
    id: "4",
    options: [
      {
        emoji: "🤐",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: {
          en: "Stay quiet to avoid conflict",
          ko: "갈등을 피해 조용히 있는다",
        },
      },
      {
        emoji: "⚡",
        id: "b",
        scores: {
          analytical: 2,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 1,
        },
        text: {
          en: "Voice opposition clearly and argue",
          ko: "반대를 분명히 하고 논쟁한다",
        },
      },
      {
        emoji: "🌉",
        id: "c",
        scores: {
          analytical: 2,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 3,
        },
        text: {
          en: "Express concern while validating others",
          ko: "타인을 존중하며 우려를 표한다",
        },
      },
      {
        emoji: "📈",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 2,
          harmonizing: 2,
        },
        text: {
          en: "Present data proving why it is wrong",
          ko: "잘못된 이유를 데이터로 증명한다",
        },
      },
    ],
    text: {
      cn: "Disagreement:",
      en: "Strongly disagree with a decision in a meeting. You:",
      es: "Disagreement:",
      fr: "Disagreement:",
      ja: "Disagreement:",
      ko: "회의 중 결정에 강력히 반대합니다. 당신은:",
    },
  },
  // 5. Line Cutter
  {
    emoji: "🚶",
    id: "5",
    options: [
      {
        emoji: "😕",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 2,
        },
        text: {
          en: "Ignore it to avoid awkwardness",
          ko: "어색해질까 봐 모른 척한다",
        },
      },
      {
        emoji: "✋",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 0,
        },
        text: {
          en: "Tell them firmly to move back",
          ko: "뒤로 가라고 단호히 말한다",
        },
      },
      {
        emoji: "😊",
        id: "c",
        scores: {
          analytical: 1,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 3,
        },
        text: {
          en: "Politely inform them of the line",
          ko: "줄이 있다고 정중히 알려준다",
        },
      },
      {
        emoji: "🤷",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 2,
          confrontational: 0,
          harmonizing: 2,
        },
        text: {
          en: "Assess if it was an emergency first",
          ko: "급한 사정이 있는지 먼저 판단한다",
        },
      },
    ],
    text: {
      cn: "Line cutter:",
      en: "Someone cuts in line. You:",
      es: "Line cutter:",
      fr: "Line cutter:",
      ja: "Line cutter:",
      ko: "누군가 새치기를 했습니다. 당신은:",
    },
  },
  // 6. Partner Hurt
  {
    emoji: "💔",
    id: "6",
    options: [
      {
        emoji: "🌧️",
        id: "a",
        scores: {
          analytical: 1,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 0,
        },
        text: {
          en: "Act distant hoping they notice",
          ko: "눈치채길 바라며 차갑게 군다",
        },
      },
      {
        emoji: "🔥",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 1,
        },
        text: { en: "Confront them immediately", ko: "그 즉시 따져 묻는다" },
      },
      {
        emoji: "💚",
        id: "c",
        scores: {
          analytical: 2,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 3,
        },
        text: {
          en: "Calmly share feelings and ask understanding",
          ko: "감정을 차분히 말하고 이해를 구한다",
        },
      },
      {
        emoji: "🧠",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 0,
          harmonizing: 2,
        },
        text: {
          en: "Analyze why you feel hurt first",
          ko: "왜 상처받았는지 먼저 분석한다",
        },
      },
    ],
    text: {
      cn: "Partner hurt:",
      en: "Partner hurts your feelings. You:",
      es: "Partner hurt:",
      fr: "Partner hurt:",
      ja: "Partner hurt:",
      ko: "연인이 당신에게 상처를 줬습니다. 당신은:",
    },
  },
  // 7. Passive Aggresive Family
  {
    emoji: "🍽️",
    id: "7",
    options: [
      {
        emoji: "🙈",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: {
          en: "Change subject to keep peace",
          ko: "평화를 위해 화제를 돌린다",
        },
      },
      {
        emoji: "💢",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 0,
        },
        text: { en: "Call it out directly", ko: "비꼬지 말라고 받아친다" },
      },
      {
        emoji: "😄",
        id: "c",
        scores: {
          analytical: 1,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 3,
        },
        text: { en: "Diffuse with humor", ko: "농담으로 분위기를 푼다" },
      },
      {
        emoji: "🎯",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 2,
          harmonizing: 2,
        },
        text: {
          en: "Ask calmly what they meant",
          ko: "무슨 의도인지 차분히 묻는다",
        },
      },
    ],
    text: {
      cn: "Passive aggressive:",
      en: "Family member makes passive-aggressive comment. You:",
      es: "Passive aggressive:",
      fr: "Passive aggressive:",
      ja: "Passive aggressive:",
      ko: "가족이 비꼬는 말을 던집니다. 당신은:",
    },
  },
  // 8. Past Conflict Colleague
  {
    emoji: "🤝",
    id: "8",
    options: [
      {
        emoji: "😬",
        id: "a",
        scores: {
          analytical: 1,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: { en: "Minimize interaction", ko: "대화를 최소화하고 피한다" },
      },
      {
        emoji: "⚔️",
        id: "b",
        scores: {
          analytical: 2,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 1,
        },
        text: {
          en: "Address past issues first",
          ko: "과거 문제를 먼저 짚고 넘어간다",
        },
      },
      {
        emoji: "🌱",
        id: "c",
        scores: {
          analytical: 1,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 3,
        },
        text: { en: "Focus on fresh start", ko: "새로운 관계 형성에 집중한다" },
      },
      {
        emoji: "📐",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 2,
          harmonizing: 2,
        },
        text: { en: "Set clear boundaries", ko: "명확한 업무 경계를 긋는다" },
      },
    ],
    text: {
      cn: "Past enemy:",
      en: "Assigned to work with past enemy. You:",
      es: "Past enemy:",
      fr: "Past enemy:",
      ja: "Past enemy:",
      ko: "과거에 싸웠던 사람과 한 팀이 되었습니다. 당신은:",
    },
  },
  // 9. Rumors
  {
    emoji: "👥",
    id: "9",
    options: [
      {
        emoji: "🤞",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: { en: "Wait for it to pass", ko: "지나가길 기다리며 무시한다" },
      },
      {
        emoji: "👊",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 0,
        },
        text: { en: "Confront the source", ko: "유포자를 찾아가 따진다" },
      },
      {
        emoji: "🕊️",
        id: "c",
        scores: {
          analytical: 2,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 3,
        },
        text: {
          en: "Clarify truth gently",
          ko: "중요한 사람들에게만 조용히 해명한다",
        },
      },
      {
        emoji: "📑",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 2,
        },
        text: {
          en: "Gather facts and report",
          ko: "증거를 모아 공식 대응한다",
        },
      },
    ],
    text: {
      cn: "Rumors:",
      en: "Someone spreading rumors about you. You:",
      es: "Rumors:",
      fr: "Rumors:",
      ja: "Rumors:",
      ko: "당신에 대한 헛소문이 돕니다. 당신은:",
    },
  },
  // 10. Admit Wrong
  {
    emoji: "💭",
    id: "10",
    options: [
      {
        emoji: "🤫",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: { en: "Stay quiet", ko: "입을 다물고 화제를 돌린다" },
      },
      {
        emoji: "🙏",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 2,
          harmonizing: 2,
        },
        text: { en: "Apologize loudly", ko: "깨끗하게 사과한다" },
      },
      {
        emoji: "🫂",
        id: "c",
        scores: {
          analytical: 1,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 3,
        },
        text: { en: "Focus on repair", ko: "실수를 인정하고 수습하려 한다" },
      },
      {
        emoji: "📝",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 2,
        },
        text: {
          en: "Explain your learning",
          ko: "왜 틀렸는지 분석하여 설명한다",
        },
      },
    ],
    text: {
      cn: "Wrong:",
      en: "You realize you were wrong in argument. You:",
      es: "Wrong:",
      fr: "Wrong:",
      ja: "Wrong:",
      ko: "말싸움 중 당신이 틀렸음을 깨달았습니다. 당신은:",
    },
  },
  // 11. Group Project Slacker (New)
  {
    emoji: "😫",
    id: "11",
    options: [
      {
        emoji: "🏋️",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 1,
        },
        text: { en: "Do their work silently", ko: "그냥 내가 다 해버린다" },
      },
      {
        emoji: "📢",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 0,
        },
        text: {
          en: "Call them out in group chat",
          ko: "단톡방에서 공개 저격한다",
        },
      },
      {
        emoji: "🤝",
        id: "c",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 3,
        },
        text: { en: "Encourage them to join", ko: "참여를 독려하며 도와준다" },
      },
      {
        emoji: "📉",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 1,
          confrontational: 1,
          harmonizing: 0,
        },
        text: {
          en: "Report contribution stats",
          ko: "기여도 통계를 근거로 제외시킨다",
        },
      },
    ],
    text: {
      cn: "Slacker:",
      en: "Team member contributes nothing. You:",
      es: "Slacker:",
      fr: "Slacker:",
      ja: "Slacker:",
      ko: "팀원이 아무 일도 안 합니다. 당신은:",
    },
  },
  // 12. Broken Promise (New)
  {
    emoji: "💸",
    id: "12",
    options: [
      {
        emoji: "🤐",
        id: "a",
        scores: {
          analytical: 0,
          avoidant: 3,
          confrontational: 0,
          harmonizing: 0,
        },
        text: {
          en: "Never mention it but resent them",
          ko: "말 못 하고 속만 끓인다",
        },
      },
      {
        emoji: "😡",
        id: "b",
        scores: {
          analytical: 1,
          avoidant: 0,
          confrontational: 3,
          harmonizing: 0,
        },
        text: { en: "Demand payment now", ko: "당장 내놓으라고 독촉한다" },
      },
      {
        emoji: "🤔",
        id: "c",
        scores: {
          analytical: 1,
          avoidant: 1,
          confrontational: 0,
          harmonizing: 3,
        },
        text: { en: "Hint gently about it", ko: "넌지시 요즘 사정을 묻는다" },
      },
      {
        emoji: "🔗",
        id: "d",
        scores: {
          analytical: 3,
          avoidant: 0,
          confrontational: 1,
          harmonizing: 1,
        },
        text: {
          en: "Send payment reminder link",
          ko: "송금 요청 링크를 보낸다",
        },
      },
    ],
    text: {
      cn: "Debt:",
      en: "Someone borrows money and forgets to pay back. You:",
      es: "Debt:",
      fr: "Debt:",
      ja: "Debt:",
      ko: "돈을 빌려간 지인이 갚지 않습니다. 당신은:",
    },
  },
];

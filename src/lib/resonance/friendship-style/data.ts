import type { FriendshipAttachmentType, FriendshipQuestion } from "./types";

export const FRIENDSHIP_QUESTIONS: FriendshipQuestion[] = [
  {
    id: "fs_1",
    options: [
      {
        id: "a",
        text: {
          en: "I assume they are busy and go about my business.",
          ko: "바쁜 일이 있겠거니 하고 내 할 일을 한다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I worry if I did something wrong and keep checking my phone.",
          ko: "내가 뭘 잘못했나 걱정하며 계속 폰을 확인한다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I don't really care about other people's messages.",
          ko: "남의 연락에 크게 연연하지 않는다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I feel angry or sad because I think they are distancing themselves.",
          ko: "상대가 나를 멀리하려는 것 같아 화가 나거나 슬프다.",
        },
        weights: { anxious: 2, avoidant_fearful: 2 },
      },
    ],
    text: {
      en: "What do you think when a friend takes long to reply?",
      ko: "친구가 연락이 늦어지면 어떤 생각이 드나요?",
    },
  },
  {
    id: "fs_2",
    options: [
      {
        id: "a",
        text: {
          en: "I naturally share my feelings if needed.",
          ko: "필요하다면 자연스럽게 내 감정을 공유한다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I pour out more and seek validation because I'm afraid they will leave.",
          ko: "상대가 나를 떠날까 봐 더 많이 쏟아내고 확인받으려 한다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I feel there is no need to talk about private things.",
          ko: "사적인 이야기는 굳이 할 필요 없다고 느낀다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I want to speak, but I'm afraid it will become a weakness later.",
          ko: "말하고 싶지만 나중에 약점이 될까 봐 두렵다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "How do you feel about opening up your heart?",
      ko: "속마음을 터놓는 것에 대해 어떻게 느끼나요?",
    },
  },
  // Adding more questions to reach 12
  {
    id: "fs_3",
    options: [
      {
        id: "a",
        text: {
          en: "I like it because I feel a deeper bond.",
          ko: "더 깊은 유대감을 느껴서 좋다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I feel more anxious because I'm afraid the relationship will break.",
          ko: "이 관계가 깨질까 봐 오히려 더 불안하다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I feel my privacy is being invaded and keep distance.",
          ko: "사생활이 침해받는 것 같아 거리를 둔다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I like it but push away because I might get hurt at any time.",
          ko: "좋으면서도 언제든지 상처받을까 봐 밀어낸다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "When you feel you are getting too close to a friend?",
      ko: "친구와 너무 가까워진다고 느낄 때?",
    },
  },
  {
    id: "fs_4",
    options: [
      {
        id: "a",
        text: {
          en: "I quietly listen and comfort them.",
          ko: "옆에서 묵묵히 들어주며 위로한다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I suffer as if it were my business and help almost obsessively.",
          ko: "마치 내 일처럼 괴로워하며 집착할 정도로 돕는다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I offer only solutions or observe rather than emotional comfort.",
          ko: "감정적인 위로보다는 해결책만 제시하거나 관조한다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I worry they might affect me and carefully avoid them.",
          ko: "나까지 힘들게 할까 봐 걱정하며 조심스럽게 피한다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "Your attitude when a friend is struggling?",
      ko: "친구가 힘들어할 때 나의 태도는?",
    },
  },
  {
    id: "fs_5",
    options: [
      {
        id: "a",
        text: {
          en: "I talk to coordinate their position and mine.",
          ko: "상대의 입장과 나의 입장을 조율하려 대화한다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I cater to them unconditionally for fear they will hate me.",
          ko: "상대가 나를 싫어하게 될까 봐 무조건 맞춘다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I think it's a nuisance and cut off contact.",
          ko: "귀찮은 일이라 생각하고 연락을 끊는다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I want to explode but hold it in and swallow tears for fear of abandonment.",
          ko: "폭발하고 싶지만 동시에 버려질까 봐 참고 울음을 삼킨다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "Your reaction when a conflict arises?",
      ko: "갈등이 생겼을 때 나의 행동은?",
    },
  },
  {
    id: "fs_6",
    options: [
      {
        id: "a",
        text: {
          en: "I enjoy new meetings but keep clear lines.",
          ko: "새로운 만남은 즐기되 선은 확실히 지킨다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I try my best to show charm to others anyhow.",
          ko: "어떻게든 다른 사람에게 매력을 보이려 애쓴다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I want to go home quickly; being alone is most comfortable.",
          ko: "빨리 집에 가고 싶고 혼자 있는 게 제일 편하다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I observe surroundings and try to please people, but it's hard.",
          ko: "주변을 관찰하며 사람들의 비위를 맞추려 하지만 힘들다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "At a party or gathering with many people?",
      ko: "사람들이 많은 파티나 모임에서?",
    },
  },
  {
    id: "fs_7",
    options: [
      {
        id: "a",
        text: {
          en: "Partners who support each other and grow together.",
          ko: "서로를 지지하고 함께 성장하는 동반자.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "A lifeline that fills my loneliness and emptiness.",
          ko: "나의 외로움과 공허함을 채워주는 생명줄.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "A social contract that does not invade each other's lines.",
          ko: "서로의 선을 침범하지 않는 사회적 계약.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "A dangerous rope I want to lean on but could betray at any time.",
          ko: "기대고 싶지만 언제든 배신할 수 있는 위험한 밧줄.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "What do you think is the definition of a relationship?",
      ko: "관계의 정의는 무엇이라고 생각하나요?",
    },
  },
  {
    id: "fs_8",
    options: [
      {
        id: "a",
        text: {
          en: "I feel that trust has deepened.",
          ko: "더 신뢰가 깊어진 기분이 든다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I end up forcing them to tell a secret as much as mine.",
          ko: "상대도 나만큼의 비밀을 털어놓길 강요하게 된다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I regret it after speaking and think I shouldn't have told them.",
          ko: "말하고 나서 후회하고 괜히 알렸다고 생각한다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I tremble for fear this secret will become a blade attacking me.",
          ko: "이 비밀이 나를 공격하는 칼날이 될까 봐 떨린다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "How do you feel after sharing a secret?",
      ko: "비밀을 공유했을 때의 기분은?",
    },
  },
  {
    id: "fs_9",
    options: [
      {
        id: "a",
        text: {
          en: "I accept it happily and express gratitude.",
          ko: "기쁘게 받아들이고 감사함을 표한다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I react excessively, hoping the compliment will continue.",
          ko: "그 칭찬이 계속되길 바라며 과하게 반응한다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I think it's just a formality and move on dryly.",
          ko: "그냥 인사치레라고 생각하고 건조하게 넘긴다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I suspect they want something from me.",
          ko: "나에게 뭔가 원하는 것이 있나 의심한다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "Your reaction when receiving a compliment?",
      ko: "칭찬을 받았을 때의 반응은?",
    },
  },
  {
    id: "fs_10",
    options: [
      {
        id: "a",
        text: {
          en: "I feel regret but plan to have time alone.",
          ko: "아쉬워하되 혼자만의 시간을 가질 계획을 짠다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I get depressed thinking they got tired of meeting me.",
          ko: "나랑 만나는 게 귀찮아졌나 싶어 침울해진다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "Honestly it was a nuisance, so I think it's a good thing.",
          ko: "솔직히 귀찮았는데 잘됐다고 생각한다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I feel denied and don't contact them for a while.",
          ko: "부정당한 느낌이 들어 한동안 연락을 하지 않는다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "When an appointment is cancelled?",
      ko: "약속이 취소되었을 때?",
    },
  },
  {
    id: "fs_11",
    options: [
      {
        id: "a",
        text: {
          en: "I sincerely congratulate them or leave a comment.",
          ko: "진심으로 축하해주거나 댓글을 남긴다.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "I check if I wasn't invited and feel envy or alienation.",
          ko: "나는 안 불렀나 확인하며 시기나 소외감을 느낀다.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "I just pass it with little interest.",
          ko: "별 관심 없이 그냥 넘긴다.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "I get depressed because everyone else seems happy except me.",
          ko: "나만 빼고 다 행복해 보여서 우울해진다.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: {
      en: "When seeing a friend's news on social media?",
      ko: "SNS를 보며 친구의 소식을 접할 때?",
    },
  },
  {
    id: "fs_12",
    options: [
      {
        id: "a",
        text: {
          en: "A beautiful accompaniment that enriches life.",
          ko: "인생을 풍요롭게 만드는 아름다운 동행.",
        },
        weights: { secure: 3 },
      },
      {
        id: "b",
        text: {
          en: "An essential condition for survival that must never be broken.",
          ko: "절대 끊어져서는 안 되는 생존의 필수조건.",
        },
        weights: { anxious: 3 },
      },
      {
        id: "c",
        text: {
          en: "An efficient network for giving and receiving help when needed.",
          ko: "필요할 때 도움을 주고받는 효율적인 네트워크.",
        },
        weights: { avoidant_dismissive: 3 },
      },
      {
        id: "d",
        text: {
          en: "A haven with a high probability of being hurt but impossible to refuse.",
          ko: "상처받을 확률이 높지만 거부할 수 없는 안식처.",
        },
        weights: { avoidant_fearful: 3 },
      },
    ],
    text: { en: "What is friendship to you?", ko: "나에게 우정이란?" },
  },
];

export const FRIENDSHIP_STYLE_RESULTS: Record<FriendshipAttachmentType, any> = {
  anxious: {
    connectionAdvice: {
      en: "Before seeking answers from others, take time to listen to your inner voice first.",
      ko: "타인에게서 답을 찾기 전에, 당신 내면의 목소리를 먼저 들어주는 시간을 가지세요.",
    },
    description: {
      en: "Constantly seeks validation in relationships and has a fear of abandonment.",
      ko: "관계 속에서 끊임없이 확신을 얻으려 하며, 버려지는 것에 대한 두려움이 있습니다.",
    },
    title: { en: "Earnest Resonance (Anxious)", ko: "간절한 공명 (Anxious)" },
    vulnerability: {
      en: "Small reactions from the other cause great vibrations, leading to high emotional consumption.",
      ko: "상대방의 작은 반응에도 큰 파동이 일어 감정 소모가 큽니다.",
    },
  },
  avoidant_dismissive: {
    connectionAdvice: {
      en: "Inviting others into your domain does not mean taking away your freedom.",
      ko: "타인을 당신의 영역에 초대하는 것이 당신의 자유를 뺏는 것은 아닙니다.",
    },
    description: {
      en: "Has very strong self-reliance and feels burdened by getting too close to others.",
      ko: "자립심이 매우 강하며, 타인과 너무 가까워지는 것을 부담스러워합니다.",
    },
    title: {
      en: "Solitary Resonance (Dismissive-Avoidant)",
      ko: "고독한 공명 (Dismissive-Avoidant)",
    },
    vulnerability: {
      en: "You might be left alone at a crucial moment, and deep emotional exchange can be disconnected.",
      ko: "결정적인 순간에 혼자 남겨질 수 있으며, 깊은 정서적 교류가 단절될 수 있습니다.",
    },
  },
  avoidant_fearful: {
    connectionAdvice: {
      en: "You need practice building trust slowly from small things. No need to show everything at once.",
      ko: "작은 신뢰부터 천천히 쌓아가는 연습이 필요합니다. 한 번에 모든 것을 보여줄 필요는 없습니다.",
    },
    description: {
      en: "Wants intimacy but feels ambivalent for fear of getting hurt.",
      ko: "친밀감을 원하면서도 상처받을까 봐 두려워 양가감정을 느낍니다.",
    },
    title: {
      en: "Wary Resonance (Fearful-Avoidant)",
      ko: "경계하는 공명 (Fearful-Avoidant)",
    },
    vulnerability: {
      en: "An unstable frequency that can inflict or receive great hurt from the closest person.",
      ko: "가장 가까운 사람에게 큰 상처를 줄 수도, 받을 수도 있는 불안정한 주파수입니다.",
    },
  },
  secure: {
    connectionAdvice: {
      en: "Maintain your current healthy self-esteem and become the center of a wider social network.",
      ko: "지금의 건강한 자존감을 유지하며 더 넓은 소셜 네트워크의 중심이 되어보세요.",
    },
    description: {
      en: "Forms a harmonious relationship by trusting others and being trusted.",
      ko: "타인을 신뢰하고 자신도 신뢰받는 조화로운 관계를 형성합니다.",
    },
    title: { en: "Stable Resonance (Secure)", ko: "안정적인 공명 (Secure)" },
    vulnerability: {
      en: "Sometimes you can be defenseless against the negative energy of others in hardship.",
      ko: "때로는 고난을 겪는 타인의 부정적인 에너지에 무방비하게 노출될 수 있습니다.",
    },
  },
};

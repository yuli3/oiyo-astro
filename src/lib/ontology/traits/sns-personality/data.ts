export const SNS_QUESTIONS: Record<string, any[]> = {
  zh: [],
  en: [
    {
      emoji: "📱",
      id: "1",
      options: [
        {
          emoji: "📸",
          id: "a",
          scores: {
            instagrammer: 3,
            lurker: 0,
            multi: 1,
            tiktoker: 1,
            tweeter: 0,
            youtuber: 1,
          },
          text: "Posting pretty photos",
        },
        {
          emoji: "🎥",
          id: "b",
          scores: {
            instagrammer: 1,
            lurker: 0,
            multi: 1,
            tiktoker: 1,
            tweeter: 0,
            youtuber: 3,
          },
          text: "Making long-form videos",
        },
        {
          emoji: "💬",
          id: "c",
          scores: {
            instagrammer: 0,
            lurker: 0,
            multi: 1,
            tiktoker: 0,
            tweeter: 3,
            youtuber: 0,
          },
          text: "Sharing real-time opinions",
        },
        {
          emoji: "🎵",
          id: "d",
          scores: {
            instagrammer: 1,
            lurker: 0,
            multi: 1,
            tiktoker: 3,
            tweeter: 0,
            youtuber: 1,
          },
          text: "Creating short-form videos",
        },
        {
          emoji: "🌐",
          id: "e",
          scores: {
            instagrammer: 1,
            lurker: 0,
            multi: 3,
            tiktoker: 1,
            tweeter: 1,
            youtuber: 1,
          },
          text: "Using all platforms",
        },
        {
          emoji: "👀",
          id: "f",
          scores: {
            instagrammer: 0,
            lurker: 3,
            multi: 0,
            tiktoker: 0,
            tweeter: 0,
            youtuber: 0,
          },
          text: "Just watching",
        },
      ],
      text: "What is your favorite activity on social media?",
    },
  ],
  es: [],
  fr: [],
  ja: [],
  ko: [
    {
      emoji: "📱",
      id: "1",
      options: [
        {
          emoji: "📸",
          id: "a",
          scores: {
            instagrammer: 3,
            lurker: 0,
            multi: 1,
            tiktoker: 1,
            tweeter: 0,
            youtuber: 1,
          },
          text: "예쁜 사진 올리기",
        },
        {
          emoji: "🎥",
          id: "b",
          scores: {
            instagrammer: 1,
            lurker: 0,
            multi: 1,
            tiktoker: 1,
            tweeter: 0,
            youtuber: 3,
          },
          text: "긴 영상 만들기",
        },
        {
          emoji: "💬",
          id: "c",
          scores: {
            instagrammer: 0,
            lurker: 0,
            multi: 1,
            tiktoker: 0,
            tweeter: 3,
            youtuber: 0,
          },
          text: "실시간 의견 공유",
        },
        {
          emoji: "🎵",
          id: "d",
          scores: {
            instagrammer: 1,
            lurker: 0,
            multi: 1,
            tiktoker: 3,
            tweeter: 0,
            youtuber: 1,
          },
          text: "짧은 영상 만들기",
        },
        {
          emoji: "🌐",
          id: "e",
          scores: {
            instagrammer: 1,
            lurker: 0,
            multi: 3,
            tiktoker: 1,
            tweeter: 1,
            youtuber: 1,
          },
          text: "모든 플랫폼 활용",
        },
        {
          emoji: "👀",
          id: "f",
          scores: {
            instagrammer: 0,
            lurker: 3,
            multi: 0,
            tiktoker: 0,
            tweeter: 0,
            youtuber: 0,
          },
          text: "보기만 하기",
        },
      ],
      text: "SNS에서 가장 즐겨하는 활동은?",
    },
  ],
};

SNS_QUESTIONS.ja = SNS_QUESTIONS.en;
SNS_QUESTIONS.cn = SNS_QUESTIONS.en;
SNS_QUESTIONS.fr = SNS_QUESTIONS.en;
SNS_QUESTIONS.es = SNS_QUESTIONS.en;

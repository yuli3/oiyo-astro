import { LearningStyle, LearningStyleQuestion } from "./types";

export const LEARNING_STYLE_LABELS: Record<
  LearningStyle,
  { en: string; ko: string }
> = {
  auditory: { en: "Auditory Learner", ko: "청각적 학습자" },
  kinesthetic: { en: "Kinesthetic Learner", ko: "신체운동적 학습자" },
  reading: { en: "Reading/Writing Learner", ko: "읽기/쓰기 학습자" },
  visual: { en: "Visual Learner", ko: "시각적 학습자" },
};

export const LEARNING_STYLE_STUDY_TIPS: Record<
  LearningStyle,
  { en: string[]; ko: string[] }
> = {
  auditory: {
    en: [
      "Listen to recorded lectures and audiobooks",
      "Participate in study groups and discussions",
      "Read notes and materials aloud to yourself",
      "Use mnemonics and rhymes to remember information",
      "Explain concepts to others out loud",
      "Listen to background music while studying (if helpful)",
      "Record yourself reading notes and play them back",
    ],
    ko: [
      "녹음된 강의나 오디오북 듣기",
      "스터디 그룹이나 토론에 참여하기",
      "노트나 학습 자료를 스스로에게 소리 내어 읽어주기",
      "기억을 돕기 위해 연상 기호나 리듬 활용하기",
      "개념을 다른 사람에게 말로 설명해주기",
      "도움이 된다면 공부할 때 배경 음악 듣기",
      "자신의 목소리로 노트를 읽어 녹음하고 다시 듣기",
    ],
  },
  kinesthetic: {
    en: [
      "Take frequent breaks and move around while studying",
      "Use hands-on activities and experiments when possible",
      "Write notes by hand rather than typing",
      "Use manipulatives and physical models",
      "Study while standing or walking",
      "Act out concepts or use role-playing",
      "Create physical flashcards you can handle and sort",
    ],
    ko: [
      "공부하는 동안 자주 휴식을 취하고 몸을 움직이기",
      "가능하다면 직접 해보는 활동이나 실험 참여하기",
      "타이핑보다는 손으로 직접 노트 필기하기",
      "물리적 모델이나 교구 활용하기",
      "서 있거나 걸어 다니면서 공부하기",
      "개념을 직접 연기해보거나 역할극 해보기",
      "직접 손으로 만지고 분류할 수 있는 플래시 카드 만들기",
    ],
  },
  reading: {
    en: [
      "Take detailed written notes during lectures and while reading",
      "Rewrite notes in your own words to reinforce learning",
      "Use lists, outlines, and written summaries",
      "Read multiple sources on the same topic",
      "Write essays and reports to process information",
      "Use textbooks and written materials as primary resources",
      "Create written flashcards and practice tests",
    ],
    ko: [
      "강의를 듣거나 독서할 때 상세하게 기록하기",
      "학습을 강화하기 위해 자신의 언어로 다시 써보기",
      "목록, 개요, 서면 요약본 활용하기",
      "같은 주제에 대해 다양한 자료 읽어보기",
      "정보를 처리하기 위해 에세이나 리포트 작성하기",
      "교과서와 서면 자료를 주요 학습 원천으로 삼기",
      "직접 질문지를 만들거나 연습 테스트 해보기",
    ],
  },
  visual: {
    en: [
      "Use mind maps, flowcharts, and diagrams to organize information",
      "Highlight important text with different colors",
      "Watch educational videos and visual demonstrations",
      "Create visual summaries and infographics",
      "Use flashcards with images and diagrams",
      "Sit where you can see the instructor and visual aids clearly",
      "Draw pictures and diagrams to illustrate concepts",
    ],
    ko: [
      "마인드맵, 순서도, 다이어그램을 사용하여 정보 정리하기",
      "중요한 텍스트에 다양한 색깔로 하이라이트 하기",
      "교육용 영상이나 시각적 시연 시청하기",
      "시각적 요약본이나 인포그래픽 만들기",
      "이미지와 다이어그램이 포함된 플래시 카드 사용하기",
      "강사와 시각 자료가 잘 보이는 곳에 앉기",
      "개념을 설명하기 위해 직접 그림이나 도표 그리기",
    ],
  },
};

export const LEARNING_STYLE_ENVIRONMENTS: Record<
  LearningStyle,
  { en: string; ko: string }
> = {
  auditory: {
    en: "Quiet spaces where you can speak aloud or listen to audio without disturbing others. You benefit from environments that allow for discussion and verbal processing.",
    ko: "다른 사람을 방해하지 않고 소리 내어 말하거나 오디오를 들을 수 있는 조용한 공간. 토론과 구두 처리가 가능한 환경에서 큰 도움을 얻습니다.",
  },
  kinesthetic: {
    en: "Flexible spaces where you can move around, use hands-on materials, and take breaks. You learn best in active environments with room for physical engagement.",
    ko: "몸을 움직이고 재료를 만지며 휴식을 취할 수 있는 유연한 공간. 신체적 참여가 가능한 활동적인 환경에서 가장 효과적으로 학습합니다.",
  },
  reading: {
    en: "Quiet, comfortable spaces with good lighting for reading and writing. You prefer environments with access to books, papers, and writing materials.",
    ko: "읽기와 쓰기에 적합한 조명이 있고 조용하며 안락한 공간. 많은 책, 종이, 그리고 필기구를 사용할 수 있는 환경을 선호합니다.",
  },
  visual: {
    en: "Well-lit spaces with visual aids, whiteboards, charts, and minimal visual distractions. You thrive in environments where you can see information clearly displayed.",
    ko: "시각 자료, 화이트보드, 차트가 있고 시각적 방해 요소가 적은 밝은 공간. 정보가 명확하게 시각화되어 표시되는 환경에서 가장 잘 집중합니다.",
  },
};

export const LEARNING_STYLE_DESCRIPTIONS: Record<
  LearningStyle,
  { en: string; ko: string }
> = {
  auditory: {
    en: "You learn best through listening and verbal instruction. You prefer discussions, lectures, and explaining concepts aloud to understand and remember information.",
    ko: "듣기와 구두 설명을 통해 가장 잘 배웁니다. 토론, 강의, 그리고 개념을 소리 내어 설명하는 과정을 통해 정보를 이해하고 기억하는 것을 선호합니다.",
  },
  kinesthetic: {
    en: "You learn best through hands-on experience and physical activity. You prefer to learn by doing, moving around, and engaging with materials directly.",
    ko: "직접적인 경험과 신체 활동을 통해 가장 잘 배웁니다. 직접 해보고, 움직이고, 재료를 직접 만지며 학습하는 것을 선호합니다.",
  },
  reading: {
    en: "You learn best through reading and writing. You prefer text-based information, note-taking, and processing information through written words.",
    ko: "읽기와 쓰기를 통해 가장 잘 배웁니다. 텍스트 기반의 정보, 노트 필기, 그리고 글을 통해 정보를 처리하는 것을 선호합니다.",
  },
  visual: {
    en: "You learn best through visual information like charts, diagrams, images, and spatial relationships. You prefer to see concepts illustrated and often think in pictures.",
    ko: "차트, 다이어그램, 이미지, 공간적 관계와 같은 시각적 정보를 통해 가장 잘 배웁니다. 개념이 그림으로 표현되는 것을 선호하며 종종 이미지로 생각합니다.",
  },
};

export const LEARNING_STYLE_QUESTIONS: LearningStyleQuestion[] = [
  {
    id: "1",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "See diagrams, charts, or visual demonstrations",
          ko: "다이어그램, 차트 또는 시각적 시연 보기",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Hear someone explain it or discuss it",
          ko: "누군가의 설명이나 토론 듣기",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Try it out hands-on and practice doing it",
          ko: "직접 만져보고 실제로 연습해보기",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: { en: "Read about it in detail", ko: "자세한 설명글 읽어보기" },
        weight: 3,
      },
    ],
    scenario: {
      en: "When learning something new, you prefer to:",
      ko: "새로운 것을 배울 때 당신은:",
    },
  },
  {
    id: "2",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Visualize the number or write it down",
          ko: "번호를 시각화하거나 종이에 적어봄",
        },
        weight: 2,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Repeat it out loud several times",
          ko: "소리 내어 여러 번 반복해서 말함",
        },
        weight: 2,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Dial it several times to build muscle memory",
          ko: "손가락 움직임을 기억하기 위해 여러 번 눌러봄",
        },
        weight: 2,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Write it down and read it back",
          ko: "적어둔 것을 반복해서 읽어봄",
        },
        weight: 2,
      },
    ],
    scenario: {
      en: "When you need to remember a phone number, you:",
      ko: "전화번호를 기억해야 할 때 당신은:",
    },
  },
  {
    id: "3",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Uses visual aids like slides, diagrams, and videos",
          ko: "슬라이드, 다이어그램, 영상 등 시각 자료 활용",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Explains concepts verbally and encourages discussion",
          ko: "말로 설명하고 토론을 유도",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Provides hands-on activities and demonstrations",
          ko: "직접 해보는 활동이나 시연 제공",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Provides detailed written materials and readings",
          ko: "자세한 텍스트 자료와 읽기물 제공",
        },
        weight: 3,
      },
    ],
    scenario: {
      en: "In a classroom setting, you learn best when the instructor:",
      ko: "수업 시간에 강사가 어떻게 할 때 가장 잘 배워지나요?",
    },
  },
  {
    id: "4",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Create colorful mind maps and visual summaries",
          ko: "컬러풀한 마인드맵이나 시각적 요약본 만들기",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Study with others and discuss the material aloud",
          ko: "다른 사람과 함께 토론하며 큰 소리로 공부하기",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Use flashcards and practice problems actively",
          ko: "플래시 카드를 사용하거나 실제로 문제를 풀어보기",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Read through notes and textbooks multiple times",
          ko: "노트와 교과서를 여러 번 읽어보기",
        },
        weight: 3,
      },
    ],
    scenario: {
      en: "When studying for a test, you find it most helpful to:",
      ko: "시험 공부를 할 때 가장 도움이 되는 방법은?",
    },
  },
  {
    id: "5",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Draw diagrams or pictures to visualize the solution",
          ko: "해결책을 시각화하기 위해 그림이나 도식 그리기",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Talk through the problem out loud",
          ko: "문제를 해결하는 과정을 말로 설명해보기",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Work through it step by step with your hands",
          ko: "직접 몸이나 손을 움직여 단계별로 해결하기",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Write out the problem and potential solutions",
          ko: "문제와 해결 가능한 방안들을 글로 적어보기",
        },
        weight: 3,
      },
    ],
    scenario: {
      en: "When you're trying to solve a problem, you typically:",
      ko: "문제를 해결하려고 할 때 주로 어떻게 하나요?",
    },
  },
  {
    id: "6",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "See it presented in charts, graphs, or images",
          ko: "차트, 그래프, 이미지로 제시될 때",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Hear it in a lecture or discussion",
          ko: "강의나 토론에서 직접 들을 때",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Experience it through practice and repetition",
          ko: "실제 연습과 반복을 통해 경험할 때",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Read it in textbooks or written materials",
          ko: "교과서나 텍스트로 읽을 때",
        },
        weight: 3,
      },
    ],
    scenario: {
      en: "You remember information best when you:",
      ko: "정보를 가장 잘 기억할 때는 언제인가요?",
    },
  },
  {
    id: "7",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Draw a map or show them visually",
          ko: "지도를 그려주거나 시각적으로 보여줌",
        },
        weight: 2,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Explain the route verbally step by step",
          ko: "말로 경로를 차근차근 설명해줌",
        },
        weight: 2,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Walk with them or physically point the way",
          ko: "같이 가거나 직접 몸짓으로 방향을 가르쳐줌",
        },
        weight: 2,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Write down detailed directions",
          ko: "상세한 설명을 글로 적어줌",
        },
        weight: 2,
      },
    ],
    scenario: {
      en: "When giving directions to someone, you would most likely:",
      ko: "누군가에게 길을 가르쳐줄 때 당신은 주로:",
    },
  },
  {
    id: "8",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Good lighting and visual organization with charts on the walls",
          ko: "밝고 깨끗하며 벽에 차트가 있는 시각적으로 정돈된 곳",
        },
        weight: 2,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "A quiet space where you can speak aloud without interruption",
          ko: "방해받지 않고 큰 소리로 말할 수 있는 조용한 곳",
        },
        weight: 2,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Room to move around and manipulate study materials",
          ko: "움직일 수 있거나 학습 도구를 만질 수 있는 충분한 공간",
        },
        weight: 2,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "A comfortable reading area with plenty of books and writing space",
          ko: "책이 많고 글을 쓸 수 있는 책상이 있는 아늑한 독서 공간",
        },
        weight: 2,
      },
    ],
    scenario: {
      en: "Your ideal study environment includes:",
      ko: "당신이 생각하는 이상적인 공부 환경은?",
    },
  },
  {
    id: "9",
    options: [
      {
        id: "a",
        style: "visual",
        text: { en: "Face and how they look", ko: "얼굴과 겉모습" },
        weight: 2,
      },
      {
        id: "b",
        style: "auditory",
        text: { en: "Voice and how they sound", ko: "목소리와 말투" },
        weight: 2,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Handshake and physical presence",
          ko: "악수할 때의 느낌이나 신체적 존재감",
        },
        weight: 2,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Name after seeing it written down",
          ko: "글자로 적힌 명함이나 이름을 본 후의 이름",
        },
        weight: 2,
      },
    ],
    scenario: {
      en: "When you meet someone new, you're most likely to remember their:",
      ko: "새로운 사람을 만났을 때 무엇을 가장 잘 기억하나요?",
    },
  },
  {
    id: "10",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Watch video tutorials and see demonstrations",
          ko: "튜토리얼 영상이나 시연 장면 시청",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Have someone explain it to you step by step",
          ko: "누군가에게 직접 설명을 듣기",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Just start using it and learn by trial and error",
          ko: "일단 직접 써보면서 시행착오로 배우기",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Read the manual or written instructions",
          ko: "매뉴얼이나 텍스트 설명서 읽기",
        },
        weight: 3,
      },
    ],
    scenario: {
      en: "To learn a new software program, you would prefer to:",
      ko: "새로운 소프트웨어 프로그램을 배울 때 선호하는 방식은?",
    },
  },
  {
    id: "11",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Look at the diagrams in the instructions",
          ko: "설명서에 있는 다이어그램부터 확인",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Have someone explain the instructions or listen to a video",
          ko: "설명을 듣거나 조립 영상을 참고",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Just start building and figure it out as you go",
          ko: "일단 시작하고 조립하면서 방법을 파악",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Read the written instructions step-by-step",
          ko: "텍스트로 된 설명서를 꼼꼼히 읽음",
        },
        weight: 3,
      },
    ],
    scenario: {
      en: "When assembling a piece of furniture, you:",
      ko: "가구를 조립할 때 당신은:",
    },
  },
  {
    id: "12",
    options: [
      {
        id: "a",
        style: "visual",
        text: {
          en: "Visualize your timeline or use a color-coded calendar",
          ko: "타임라인을 시각화하거나 색깔별로 구분된 캘린더 사용",
        },
        weight: 3,
      },
      {
        id: "b",
        style: "auditory",
        text: {
          en: "Talk through your plan aloud with yourself or others",
          ko: "스스로 일정을 말해보거나 타인에게 설명",
        },
        weight: 3,
      },
      {
        id: "c",
        style: "kinesthetic",
        text: {
          en: "Write tasks on sticky notes you can physically re-arrange",
          ko: "포스트잇에 적어서 물리적으로 순서를 배치",
        },
        weight: 3,
      },
      {
        id: "d",
        style: "reading",
        text: {
          en: "Make a detailed written to-do list",
          ko: "상세한 텍스트로 된 할 일 목록 작성",
        },
        weight: 3,
      },
    ],
    scenario: {
      en: "When planning your day, you prefer to:",
      ko: "하루 계획을 세울 때 선호하는 방식은?",
    },
  },
];

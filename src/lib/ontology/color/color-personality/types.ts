import { Locale } from "@/i18n";

export interface ColorPersonalityQuestion {
  id: number;
  options: Array<{
    color: string;
    emoji: string;
    scores: Record<string, number>;
    text: string;
  }>;
  text: string;
}

export interface ColorPersonalityResult {
  careerSuggestions: string[];
  challenges: string[];
  compatibleTypes: string[];
  description: string;
  emoji: string;
  idealColors: string[];
  name: string;
  relationshipTips: string[];
  strengths: string[];
  traits: string[];
  type: "blue" | "green" | "red" | "yellow";
}

export interface ColorPersonalityScores {
  blue: number;
  green: number;
  red: number;
  yellow: number;
}

export const COLOR_PERSONALITY_LABELS: Record<
  Locale,
  Record<string, string>
> = {
  cn: {
    blue: "深思熟虑的分析师",
    green: "和谐的支持者",
    red: "充满活力的领导者",
    yellow: "热情的创造者",
  },
  en: {
    blue: "The Thoughtful Analyst",
    green: "The Harmonious Supporter",
    red: "The Dynamic Leader",
    yellow: "The Enthusiastic Creator",
  },
  es: {
    blue: "Analista reflexivo",
    green: "Seguidor armonioso",
    red: "Líder dinámico",
    yellow: "Creador entusiasta",
  },
  fr: {
    blue: "Analyste réfléchi",
    green: "Soutien harmonieux",
    red: "Leader dynamique",
    yellow: "Créateur enthousiaste",
  },
  ja: {
    blue: "思慮深いアナリスト",
    green: "調和のとれたサポーター",
    red: "ダイナミックなリーダー",
    yellow: "熱狂的なクリエイター",
  },
  ko: {
    blue: "사려 깊은 분석가",
    green: "조화로운 지원자",
    red: "역동적인 리더",
    yellow: "열정적인 창조자",
  },
};

export const COLOR_PERSONALITY_DESCRIPTIONS: Record<
  Locale,
  Record<string, string>
> = {
  cn: {
    blue: "你善于分析、可靠且注重细节。",
    green: "你富有同情心、稳定且注重和谐。",
    red: "你充满动力、志向远大，是天生的领导者。",
    yellow: "你乐观、大方且富有社交活力。",
  },
  en: {
    blue: "You are analytical, reliable, and detail-oriented.",
    green: "You are caring, stable, and focused on harmony.",
    red: "You are driven, ambitious, and natural-born leader.",
    yellow: "You are optimistic, creative, and socially energetic.",
  },
  es: {
    blue: "Eres analítico, confiable y detallista.",
    green: "Eres cariñoso, estable y te enfocas en la armonía.",
    red: "Eres una persona impulsada, ambiciosa y líder nato.",
    yellow: "Eres optimista, creativo y socialmente enérgico.",
  },
  fr: {
    blue: "Vous êtes analytique, fiable et soucieux du détail.",
    green: "Vous êtes attentionné, stable et axé sur l'harmonie.",
    red: "Vous êtes motivé, ambitieux et un leader né.",
    yellow: "Vous êtes optimiste, créatif et socialement énergique.",
  },
  ja: {
    blue: "あなたは分析的で信頼でき、細部にまで気を配ります。",
    green: "あなたは思いやりがあり安定しており、調和を重視します Bird。",
    red: "あなたは意欲的で野心的、そして生まれながらのリーダーです。",
    yellow: "あなたは楽観的で創造的、そして社会的にエネルギッシュです。",
  },
  ko: {
    blue: "당신은 분석적이고 신뢰할 수 있으며 세부사항에 주의를 기울입니다.",
    green: "당신은 배려심이 많고 안정적이며 조화에 중점을 둡니다.",
    red: "당신은 의욕적이고 야심적이며 타고난 리더입니다.",
    yellow: "당신은 낙관적이고 창의적이며 사회적으로 활기찹니다.",
  },
};

// Backfill missing locales for descriptions
["ja", "cn", "es", "fr"].forEach((loc) => {
  (COLOR_PERSONALITY_DESCRIPTIONS as any)[loc] =
    COLOR_PERSONALITY_DESCRIPTIONS.en;
});

export const COLOR_PERSONALITY_TRAITS: Record<
  Locale,
  Record<string, string[]>
> = {
  cn: {} as any,
  en: {
    blue: [
      "Analytical and logical",
      "Detail-oriented and precise",
      "Reliable and trustworthy",
      "Values quality over quantity",
      "Prefers structure and organization",
    ],
    green: [
      "Cooperative and team-oriented",
      "Empathetic and caring",
      "Patient and even-tempered",
      "Values stability and security",
      "Natural peacemaker",
    ],
    red: [
      "Confident and assertive",
      "Goal-oriented and results-driven",
      "Natural leadership abilities",
      "Quick decision-maker",
      "Competitive and ambitious",
    ],
    yellow: [
      "Optimistic and enthusiastic",
      "Creative and innovative",
      "Social and outgoing",
      "Flexible and adaptable",
      "Inspiring and motivational",
    ],
  },
  es: {} as any,
  fr: {} as any,
  ja: {} as any,
  ko: {
    blue: [
      "분석적이고 논리적",
      "세부사항 중심적이고 정확함",
      "신뢰할 수 있고 성실함",
      "양보다 질을 중시",
      "구조와 조직 선호",
    ],
    green: [
      "협조적이고 팀 중심적",
      "공감 능력이 뛰어나고 배려심 깊음",
      "인내심 있고 침착함",
      "안정성과 보안 중시",
      "타고난 평화주의자",
    ],
    red: [
      "자신감 넘치고 단호함",
      "목표 중심적이고 결과 지향적",
      "타고난 리더십 능력",
      "빠른 의사결정자",
      "경쟁적이고 야심참",
    ],
    yellow: [
      "낙관적이고 열정적",
      "창의적이고 혁신적",
      "사교적이고 외향적",
      "유연하고 적응력이 뛰어남",
      "영감을 주고 동기부여함",
    ],
  },
};

// Backfill missing locales for traits
["ja", "cn", "es", "fr"].forEach((loc) => {
  (COLOR_PERSONALITY_TRAITS as any)[loc] = COLOR_PERSONALITY_TRAITS.en;
});

export const COLOR_PERSONALITY_STRENGTHS: Record<
  Locale,
  Record<string, string[]>
> = {
  cn: {} as any,
  en: {
    blue: [
      "Excellent problem-solving skills",
      "High attention to detail",
      "Creates systematic processes",
      "Maintains high standards",
      "Provides stability and consistency",
    ],
    green: [
      "Builds strong relationships",
      "Creates harmonious environments",
      "Excellent listener and supporter",
      "Loyal and dependable",
      "Mediates conflicts effectively",
    ],
    red: [
      "Excellent in crisis situations",
      "Motivates and inspires others",
      "Takes initiative effectively",
      "Handles pressure well",
      "Drives results and achievement",
    ],
    yellow: [
      "Brings energy and positivity",
      "Excellent at brainstorming ideas",
      "Adapts quickly to changes",
      "Motivates and inspires others",
      "Creates enjoyable atmospheres",
    ],
  },
  es: {} as any,
  fr: {} as any,
  ja: {} as any,
  ko: {
    blue: [
      "뛰어난 문제 해결 능력",
      "높은 주의력",
      "체계적인 프로세스 구축",
      "높은 기준 유지",
      "안정성과 일관성 제공",
    ],
    green: [
      "강한 관계 구축",
      "조화로운 환경 조성",
      "뛰어난 경청자이자 지원자",
      "충성심 있고 의존할 수 있음",
      "갈등을 효과적으로 중재",
    ],
    red: [
      "위기 상황에서 뛰어남",
      "다른 사람들에게 동기를 부여하고 영감을 줌",
      "효과적으로 주도권을 잡음",
      "압박감을 잘 견딤",
      "결과와 성취를 이끌어냄",
    ],
    yellow: [
      "에너지와 긍정성을 가져다줌",
      "아이디어 브레인스토밍에 뛰어남",
      "변화에 빠르게 적응",
      "다른 사람들에게 동기부여와 영감을 줌",
      "즐거운 분위기 조성",
    ],
  },
};

// Backfill missing locales for strengths
["ja", "cn", "es", "fr"].forEach((loc) => {
  (COLOR_PERSONALITY_STRENGTHS as any)[loc] = COLOR_PERSONALITY_STRENGTHS.en;
});

export const COLOR_PERSONALITY_CHALLENGES: Record<
  Locale,
  Record<string, string[]>
> = {
  cn: {} as any,
  en: {
    blue: [
      "Can be overly critical or perfectionist",
      "May struggle with sudden changes",
      "Sometimes hesitant to take risks",
      "Can get overwhelmed by too many options",
      "May appear distant or unemotional",
    ],
    green: [
      "May avoid necessary confrontations",
      "Can be indecisive to avoid conflict",
      "Sometimes sacrifices own needs",
      "May resist change even when beneficial",
      "Can be taken advantage of by others",
    ],
    red: [
      "Can be impatient with slower-paced individuals",
      "May overlook emotional needs",
      "Sometimes too direct in communication",
      "Can be perceived as aggressive",
      "Difficulty delegating control",
    ],
    yellow: [
      "Can be disorganized or scattered",
      "May struggle with routine tasks",
      "Sometimes lacks attention to detail",
      "Can be overly optimistic",
      "May have difficulty with follow-through",
    ],
  },
  es: {} as any,
  fr: {} as any,
  ja: {} as any,
  ko: {
    blue: [
      "지나치게 비판적이거나 완벽주의적일 수 있음",
      "갑작스러운 변화에 어려움을 겪을 수 있음",
      "때로는 위험을 감수하는 데 주저함",
      "너무 많은 선택지에 압도될 수 있음",
      "냉담하거나 감정이 없어 보일 수 있음",
    ],
    green: [
      "필요한 대립을 피할 수 있음",
      "갈등을 피하기 위해 우유부단할 수 있음",
      "때로는 자신의 필요를 희생함",
      "유익할 때도 변화에 저항할 수 있음",
      "다른 사람들에게 이용당할 수 있음",
    ],
    red: [
      "느린 속도의 개인들에게 참을성이 없을 수 있음",
      "감정적 필요를 간과할 수 있음",
      "때로는 소통이 너무 직접적",
      "공격적으로 인식될 수 있음",
      "권한 위임에 어려움",
    ],
    yellow: [
      "무질서하거나 산만할 수 있음",
      "일상적인 업무에 어려움을 겪을 수 있음",
      "때로는 세부사항에 대한 주의가 부족",
      "지나치게 낙관적일 수 있음",
      "후속 조치에 어려움이 있을 수 있음",
    ],
  },
};

// Backfill missing locales for challenges
["ja", "cn", "es", "fr"].forEach((loc) => {
  (COLOR_PERSONALITY_CHALLENGES as any)[loc] = COLOR_PERSONALITY_CHALLENGES.en;
});

export const COLOR_PERSONALITY_IDEAL_COLORS: Record<
  Locale,
  Record<string, string[]>
> = {
  cn: {} as any,
  en: {
    blue: [
      "Calm blues and navy",
      "Sophisticated grays",
      "Clean whites and off-whites",
      "Muted pastels",
      "Classic earth tones",
    ] as string[],
    green: [
      "Natural greens and forest tones",
      "Warm earth browns",
      "Soft creams and beiges",
      "Gentle pastels",
      "Muted nature-inspired hues",
    ] as string[],
    red: [
      "Bold reds and crimsons",
      "Deep burgundy and maroon",
      "Strong blacks and whites",
      "Metallic silvers and golds",
      "Rich navy blues",
    ] as string[],
    yellow: [
      "Bright yellows and golds",
      "Vibrant oranges and corals",
      "Cheerful pinks and purples",
      "Energetic greens",
      "Bold, contrasting combinations",
    ] as string[],
  },
  es: {} as any,
  fr: {} as any,
  ja: {} as any,
  ko: {
    blue: [
      "차분한 파랑과 네이비",
      "세련된 회색",
      "깨끗한 흰색과 오프화이트",
      "부드러운 파스텔",
      "클래식한 어스 톤",
    ] as string[],
    green: [
      "자연스러운 초록과 숲 톤",
      "따뜻한 땅 갈색",
      "부드러운 크림과 베이지",
      "온화한 파스텔",
      "자연에서 영감을 받은 차분한 색조",
    ] as string[],
    red: [
      "대담한 빨강과 진홍색",
      "깊은 부르고뉴와 밤색",
      "강한 검정과 흰색",
      "메탈릭 실버와 골드",
      "풍부한 네이비 블루",
    ] as string[],
    yellow: [
      "밝은 노랑과 골드",
      "생생한 오렌지와 코랄",
      "쾌활한 핑크와 퍼플",
      "활기찬 초록",
      "대담하고 대조적인 조합",
    ] as string[],
  },
};

// Backfill missing locales for ideal colors
["ja", "cn", "es", "fr"].forEach((loc) => {
  (COLOR_PERSONALITY_IDEAL_COLORS as any)[loc] =
    COLOR_PERSONALITY_IDEAL_COLORS.en;
});

export const COLOR_PERSONALITY_CAREER_SUGGESTIONS: Record<
  Locale,
  Record<string, string[]>
> = {
  cn: {} as any,
  en: {
    blue: [
      "Data analyst or scientist",
      "Accountant or financial advisor",
      "Engineer or architect",
      "Researcher or academic",
      "Quality assurance specialist",
      "Librarian or archivist",
      "Medical professional",
    ],
    green: [
      "Counselor or therapist",
      "Teacher or educator",
      "Human resources specialist",
      "Healthcare worker",
      "Social worker",
      "Environmental scientist",
      "Non-profit organization roles",
    ],
    red: [
      "Executive or CEO",
      "Sales manager",
      "Entrepreneur",
      "Military officer",
      "Emergency services",
      "Sports coach",
      "Project manager",
    ],
    yellow: [
      "Creative director or designer",
      "Marketing or advertising professional",
      "Event planner",
      "Entertainer or performer",
      "Innovation consultant",
      "Public relations specialist",
      "Motivational speaker",
    ],
  },
  es: {} as any,
  fr: {} as any,
  ja: {} as any,
  ko: {
    blue: [
      "데이터 분석가 또는 과학자",
      "회계사 또는 재정 고문",
      "엔지니어 또는 건축가",
      "연구원 또는 학자",
      "품질 보증 전문가",
      "사서 또는 아키비스트",
      "의료 전문가",
    ],
    green: [
      "상담사 또는 치료사",
      "교사 또는 교육자",
      "인사 전문가",
      "의료 종사자",
      "사회복지사",
      "환경 과학자",
      "비영리 조직 역할",
    ],
    red: [
      "경영진 또는 CEO",
      "영업 매니저",
      "기업가",
      "군 장교",
      "응급 서비스",
      "스포츠 코치",
      "프로젝트 매니저",
    ],
    yellow: [
      "크리에이티브 디렉터 또는 디자이너",
      "마케팅 또는 광고 전문가",
      "이벤트 플래너",
      "연예인 또는 공연자",
      "혁신 컨설턴트",
      "홍보 전문가",
      "동기부여 강연자",
    ],
  },
};

// Backfill missing locales for career suggestions
["ja", "cn", "es", "fr"].forEach((loc) => {
  (COLOR_PERSONALITY_CAREER_SUGGESTIONS as any)[loc] =
    COLOR_PERSONALITY_CAREER_SUGGESTIONS.en;
});

export const COLOR_PERSONALITY_RELATIONSHIP_TIPS: Record<
  Locale,
  Record<string, string[]>
> = {
  cn: {} as any,
  en: {
    blue: [
      "Express emotions more openly",
      "Appreciate spontaneity occasionally",
      "Focus on the big picture sometimes",
      "Practice flexibility in plans",
      "Show affection through thoughtful gestures",
    ],
    green: [
      "Express your needs more clearly",
      "Practice saying no when necessary",
      "Embrace positive changes",
      "Take initiative occasionally",
      "Value your own opinions and desires",
    ],
    red: [
      "Practice active listening with partners",
      "Allow space for others' opinions",
      "Show appreciation through actions",
      "Be patient with different decision-making styles",
      "Balance assertiveness with empathy",
    ],
    yellow: [
      "Practice follow-through on commitments",
      "Pay attention to important details",
      "Balance enthusiasm with listening",
      "Be mindful of others' energy levels",
      "Create structure for important goals",
    ],
  },
  es: {} as any,
  fr: {} as any,
  ja: {} as any,
  ko: {
    blue: [
      "감정을 더 공개적으로 표현",
      "때때로 자발성 인정",
      "때로는 큰 그림에 집중",
      "계획에서 유연성 연습",
      "사려 깊은 제스처를 통한 애정 표현",
    ],
    green: [
      "자신의 필요를 더 명확하게 표현",
      "필요할 때 거절하는 연습",
      "긍정적인 변화 수용",
      "때때로 주도권 잡기",
      "자신의 의견과 욕구 소중히 여기기",
    ],
    red: [
      "파트너와 적극적인 경청 연습",
      "다른 사람들의 의견을 위한 공간 허용",
      "행동을 통한 감사 표현",
      "다른 의사결정 스타일에 인내심 갖기",
      "적극성과 공감의 균형 맞추기",
    ],
    yellow: [
      "약속에 대한 후속 조치 연습",
      "중요한 세부사항에 주의",
      "열정과 경청의 균형",
      "다른 사람들의 에너지 수준 고려",
      "중요한 목표를 위한 구조 만들기",
    ],
  },
};

// Backfill missing locales for relationship tips
["ja", "cn", "es", "fr"].forEach((loc) => {
  (COLOR_PERSONALITY_RELATIONSHIP_TIPS as any)[loc] =
    COLOR_PERSONALITY_RELATIONSHIP_TIPS.en;
});

import { Locale } from "@/i18n";

export type FriendshipStyle =
  | "adventurer"
  | "entertainer"
  | "organizer"
  | "supporter"
  | "thinker";

export interface FriendshipStyleQuestion {
  id: string;
  options: {
    id: string;
    style: FriendshipStyle;
    text: Record<Locale, string>;
    weight: number;
  }[];
  scenario: Record<Locale, string>;
}

export interface FriendshipStyleResult {
  compatibility: FriendshipStyle[];
  description: string;
  percentages: Record<FriendshipStyle, number>;
  primary: FriendshipStyle;
  scores: Record<FriendshipStyle, number>;
  secondary: FriendshipStyle;
  traits: string[];
}

export const FRIENDSHIP_STYLE_LABELS: Record<
  FriendshipStyle,
  Record<Locale, string>
> = {
  adventurer: {
    cn: "冒险家",
    en: "The Adventurer",
    es: "El Aventurero",
    fr: "L'Aventurier",
    ja: "冒険家",
    ko: "모험가",
  },
  entertainer: {
    cn: "表演者",
    en: "The Entertainer",
    es: "El Animador",
    fr: "L'Animateur",
    ja: "エンターテイナー",
    ko: "엔터테이너",
  },
  organizer: {
    cn: "组织者",
    en: "The Organizer",
    es: "El Organizador",
    fr: "L'Organisateur",
    ja: "オーガナイザー",
    ko: "조직가",
  },
  supporter: {
    cn: "支持者",
    en: "The Supporter",
    es: "El Seguidor",
    fr: "Le Soutien",
    ja: "サポーター",
    ko: "서포터",
  },
  thinker: {
    cn: "深思者",
    en: "The Thinker",
    es: "El Pensador",
    fr: "Le Penseur",
    ja: "思想家",
    ko: "사색가",
  },
};

export const FRIENDSHIP_STYLE_DESCRIPTIONS: Record<
  FriendshipStyle,
  Record<Locale, string>
> = {
  adventurer: {
    cn: "你是一位自发的、能带来兴奋和新体验的朋友。你喜欢和朋友们一起尝试新事物。",
    en: "You are the spontaneous friend who brings excitement and new experiences. You love trying new things with your friends.",
    es: "Eres el amigo espontáneo que aporta emoción y nuevas experiencias. Te encanta probar cosas nuevas con tus amigos.",
    fr: "Vous êtes l'ami spontané qui apporte de l'excitation et de nouvelles expériences. Vous aimez essayer de nouvelles choses avec vos amis.",
    ja: "あなたは刺激と新しい経験をもたらす自発的な友人です。友人と一緒に新しいことに挑戦するのが大好きです。",
    ko: "당신은 설렘과 새로운 경험을 가져다주는 즉흥적인 친구입니다. 친구들과 함께 새로운 시도를 하는 것을 좋아합니다.",
  },
  entertainer: {
    cn: "你是社交达人，为每一次聚会带来欢乐和活力。你喜欢逗人发笑。",
    en: "You are the social butterfly who brings joy and energy to every gathering. You love making people laugh.",
    es: "Eres el alma de la fiesta que aporta alegría y energía a cada reunión. Te encanta hacer reír a la gente.",
    fr: "Vous êtes le boute-en-train qui apporte joie et énergie à chaque rassemblement. Vous adorez faire rire les gens.",
    ja: "あなたはあらゆる集まりに喜びとエネルギーをもたらす社交的な人です。人々を笑わせるのが大好きです。",
    ko: "당신은 모든 모임에 기쁨과 에너지를 가져다주는 소셜 버터플라이입니다. 사람들을 웃게 만드는 것을 좋아합니다.",
  },
  organizer: {
    cn: "你是一位可靠的朋友，让大家保持联系并策划聚会。你喜欢协调小组活动。",
    en: "You are the reliable friend who keeps everyone connected and plans gatherings. You enjoy coordinating group activities.",
    es: "Eres el amigo fiable que mantiene a todos conectados y planifica las reuniones. Disfrutas coordinando actividades grupales.",
    fr: "Vous êtes l'ami fiable qui maintient tout le monde connecté et planifie les rassemblements. Vous aimez coordonner les activités de groupe.",
    ja: "あなたは全員をつなぎとめ、集まりを計画する信頼できる友人です。グループ活動の調整を楽しみます。",
    ko: "당신은 모든 사람을 연결하고 모임을 계획하는 신뢰할 수 있는 친구입니다. 그룹 활동을 조정하는 것을 즐깁니다.",
  },
  supporter: {
    cn: "你是一位充满爱心的朋友，总是倾向于倾听并提供情感支持。你重视深层次、有意义的联系。",
    en: "You are the caring friend who always listens and provides emotional support. You value deep, meaningful connections.",
    es: "Eres el amigo cariñoso que siempre escucha y brinda apoyo emocional. Valoras las conexiones profundas y significativas.",
    fr: "Vous êtes l'ami attentionné qui écoute toujours et apporte un soutien émotionnel. Vous accordez de l'importance aux liens profonds et significatifs.",
    ja: "あなたは常に耳を傾け、感情的なサポートを提供する思いやりのある友人です。深くて意味のあるつながりを大切にします。",
    ko: "당신은 항상 경청하고 정서적 지지를 제공하는 배려심 깊은 친구입니다. 깊고 의미 있는 관계를 소중히 여깁니다.",
  },
  thinker: {
    cn: "你是一位体贴的朋友，享受深度的对话和智力上的联系。你更喜欢质量而非数量。",
    en: "You are the thoughtful friend who enjoys deep conversations and intellectual connections. You prefer quality over quantity.",
    es: "Eres el amigo reflexivo que disfruta de las conversaciones profundas y las conexiones intelectuales. Prefieres la calidad a la cantidad.",
    fr: "Vous êtes l'ami réfléchi qui apprécie les conversations profondes et les connexions intellectuelles. Vous préférez la qualité à la quantité.",
    ja: "あなたは深い会話と知的なつながりを楽しむ思慮深い友人です。量より質を好みます。",
    ko: "당신은 깊은 대화와 지적 연결을 즐기는 사려 깊은 친구입니다. 양보다 질을 선호합니다.",
  },
};

export const FRIENDSHIP_STYLE_TRAITS: Record<
  FriendshipStyle,
  Record<Locale, string[]>
> = {
  adventurer: {
    cn: ["自发的", "令人鼓舞的", "寻求难忘体验", "活力四射", "思想开放"],
    en: [
      "Spontaneous",
      "Encouraging",
      "Memorable seeker",
      "High energy",
      "Open-minded",
    ],
    es: [
      "Espontáneo",
      "Alentador",
      "Buscador de recuerdos",
      "Gran energía",
      "Mente abierta",
    ],
    fr: [
      "Spontané",
      "Encourageant",
      "Chercheur de souvenirs",
      "Grande énergie",
      "Esprit ouvert",
    ],
    ja: [
      "自発的",
      "励まし上手",
      "思い出作り",
      "ハイエネルギー",
      "オープンマインド",
    ],
    ko: [
      "즉흥적임",
      "격려하는 성격",
      "추억 메이커",
      "에너지 넘침",
      "열린 마음",
    ],
  },
  entertainer: {
    cn: ["快乐的", "打破僵局的人", "正能量", "幽默的", "充满活力的"],
    en: ["Joyful", "Ice-breaker", "Positive energy", "Humorous", "Dynamic"],
    es: [
      "Alegre",
      "Rompehielos",
      "Energía positiva",
      "Humorístico",
      "Dinámico",
    ],
    fr: [
      "Joyeux",
      "Brise-glace",
      "Énergie positive",
      "Humoristique",
      "Dynamique",
    ],
    ja: [
      "陽気",
      "アイスブレーカー",
      "ポジティブエネルギー",
      "ユーモラス",
      "ダイナミック",
    ],
    ko: [
      "즐거움 선사",
      "분위기 메이커",
      "긍정적 에너지",
      "유머러스함",
      "역동적임",
    ],
  },
  organizer: {
    cn: ["可靠的", "协调的", "面向计划", "包容性", "社交粘合剂"],
    en: [
      "Reliable",
      "Coordinated",
      "Plan-oriented",
      "inclusive",
      "Social glue",
    ],
    es: [
      "Fiable",
      "Coordinado",
      "Orientado a los planes",
      "Inclusivo",
      "Pegamento social",
    ],
    fr: ["Fiable", "Coordonné", "Axé sur les plans", "Inclusif", "Lien social"],
    ja: ["信頼できる", "調整上手", "計画的", "包括的", "社交の絆"],
    ko: [
      "신뢰할 수 있음",
      "조화로운 조정",
      "계획 중심",
      "포용적임",
      "사회의 접착제",
    ],
  },
  supporter: {
    cn: ["优秀的倾听者", "富有同情心", "忠实的知己", "情感投入", "宝贵的顾问"],
    en: [
      "Great listener",
      "Empathetic",
      "Loyal confidant",
      "Emotionally available",
      "Valuable advisor",
    ],
    es: [
      "Gran oyente",
      "Empático",
      "Confidente leal",
      "Disponible emocionalmente",
      "Consejero valioso",
    ],
    fr: [
      "Excellent auditeur",
      "Empathique",
      "Confident loyal",
      "Disponible émotionnellement",
      "Conseiller précieux",
    ],
    ja: [
      "聞き上手",
      "共感力",
      "忠実な相談相手",
      "感情的に寄り添う",
      "貴重な助言者",
    ],
    ko: [
      "경청 능력 탁월",
      "공감 능력 뛰어남",
      "충직한 비밀 유지자",
      "정서적 지지",
      "가치 있는 조언자",
    ],
  },
  thinker: {
    cn: ["深思熟虑", "真实的", "反思的", "知识分子", "注重质量"],
    en: [
      "Deep thinker",
      "Authentic",
      "Reflective",
      "Intellectual",
      "Quality-focused",
    ],
    es: [
      "Pensador profundo",
      "Auténtico",
      "Reflexivo",
      "Intelectual",
      "Enfocado en la calidad",
    ],
    fr: [
      "Penseur profond",
      "Authentique",
      "Réfléchi",
      "Intellectuel",
      "Axé sur la qualité",
    ],
    ja: ["思索家", "本物的", "内省的", "知的", "質重視"],
    ko: [
      "깊은 생각",
      "진정성 있음",
      "성찰적임",
      "지적인 매력",
      "질적 관계 중시",
    ],
  },
};

export const FRIENDSHIP_STYLE_COMPATIBILITY: Record<
  FriendshipStyle,
  FriendshipStyle[]
> = {
  adventurer: ["entertainer", "supporter", "organizer"],
  entertainer: ["adventurer", "organizer", "supporter"],
  organizer: ["supporter", "entertainer", "thinker"],
  supporter: ["thinker", "organizer", "adventurer"],
  thinker: ["supporter", "thinker", "organizer"],
};

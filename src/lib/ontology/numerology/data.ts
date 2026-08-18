import type { LocalizedText } from "@/types/manifest";

import type { NumerologyMeaning } from "./types";

export const LETTER_TO_NUMBER: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

export const VOWELS = ["A", "E", "I", "O", "U"];

export const NUMEROLOGY_MEANINGS: Record<number, NumerologyMeaning> = {
  1: {
    archetype: "leader",
    description: {
      zh: "领导者的数字，代表独立和创造力的核心本质。",
      en: "The number of the leader, representing the core essence of this vibration.",
      es: "El número del líder, que representa la esencia central de esta vibración.",
      fr: "Le nombre du leader, représentant l'essence même de cette vibration.",
      ja: "リーダーの数で、独立と創造性の核心的な本質を表します。",
      ko: "리더의 숫자로, 독립과 창의의 핵심 본질을 나타냅니다.",
    },
    element: "fire",
    keywords: {
      zh: "独立, 领导力, 创新, 抱负, 开拓",
      en: "Independence, Leadership, Innovation, Ambition, Pioneering",
      es: "Independencia, Liderazgo, Innovación, Ambición, Pionero",
      fr: "Indépendance, Leadership, Innovation, Ambition, Pionnier",
      ja: "独立, リーダーシップ, 革新, 野心, 先駆け",
      ko: "독립, 리더십, 혁신, 야망, 개척",
    },
    name: {
      zh: "领导者",
      en: "The Leader",
      es: "El Líder",
      fr: "Le Leader",
      ja: "指導者",
      ko: "리더",
    },
    number: 1,
  },
  2: {
    archetype: "healer",
    description: {
      zh: "和平使者的数字，代表这种和谐与合作的的核心本质。",
      en: "The number of the peacemaker, representing the core essence of this vibration.",
      es: "El número del mediador, que representa la esencia central de esta vibración.",
      fr: "Le nombre du pacificateur, représentant l'essence même de cette vibration.",
      ja: "平和主義者の数で、調和と協力の核心的な本質を表します。",
      ko: "평화 중재자의 숫자로, 조화와 협력의 핵심 본질을 나타냅니다.",
    },
    element: "water",
    keywords: {
      zh: "合作, 和谐, 外交, 敏感, 伙伴关系",
      en: "Cooperation, Harmony, Diplomacy, Sensitivity, Partnership",
      es: "Cooperación, Armonía, Diplomacia, Sensibilidad, Asociación",
      fr: "Coopération, Harmonie, Diplomatie, Sensibilité, Partenariat",
      ja: "協力, 調和, 外交, 感受性, パートナーシップ",
      ko: "협력, 조화, 외교, 감수성, 동반자",
    },
    name: {
      zh: "和平使者",
      en: "The Peacemaker",
      es: "El Mediador",
      fr: "Le Pacificateur",
      ja: "平和主義者",
      ko: "중재자",
    },
    number: 2,
  },
  3: {
    archetype: "creator",
    description: {
      zh: "创意沟通者的数字，代表自我表达和灵感的核心本质。",
      en: "The number of the creative communicator, representing the core essence of this vibration.",
      es: "El número del comunicador creativo, que representa la esencia central de esta vibración.",
      fr: "Le nombre du communicateur créatif, représentant l'essence même de cette vibration.",
      ja: "創造的な表現者の数で、自己表現とインスピレーションの核心的な本質を表します。",
      ko: "창의적 소통가의 숫자로, 자기 표현과 영감의 핵심 본질을 나타냅니다.",
    },
    element: "air",
    keywords: {
      zh: "创造力, 沟通, 乐观主义, 自我表达, 灵感",
      en: "Creativity, Communication, Optimism, Self-expression, Inspiration",
      es: "Creatividad, Comunicación, Optimismo, Autoexpresión, Inspiración",
      fr: "Créativité, Communication, Optimisme, Expression de soi, Inspiration",
      ja: "創造性, 疎通, 楽観主義, 自己表現, インスピレーション",
      ko: "창의성, 소통, 낙관주의, 자기표현, 영감",
    },
    name: {
      zh: "创意沟通者",
      en: "The Creative Communicator",
      es: "El Comunicador Creativo",
      fr: "Le Communicateur Créatif",
      ja: "創造的な表現者",
      ko: "예술적 소통가",
    },
    number: 3,
  },
  4: {
    archetype: "protector",
    description: {
      zh: "务实建设者的数字，代表稳定和基础的核心本质。",
      en: "The number of the practical builder, representing the core essence of this vibration.",
      es: "El número del constructor práctico, que representa la esencia central de esta vibración.",
      fr: "Le nombre du bâtisseur pratique, représentant l'essence même de cette vibration.",
      ja: "実務的な構築者の数で、安定と基盤の核心的な本質を表します。",
      ko: "실천적 건설가의 숫자로, 안정과 기반의 핵심 본질을 나타냅니다.",
    },
    element: "earth",
    keywords: {
      zh: "稳定, 努力, 组织, 可靠性, 实用性",
      en: "Stability, Hard work, Organization, Reliability, Practicality",
      es: "Estabilidad, Trabajo duro, Organización, Fiabilidad, Practicidad",
      fr: "Stabilité, Travail acharné, Organisation, Fiabilité, Praticité",
      ja: "安定, 努力, 組織, 信頼性, 実用性",
      ko: "안정, 노력, 조직, 신뢰성, 실용성",
    },
    name: {
      zh: "务实建设者",
      en: "The Practical Builder",
      es: "El Constructor Práctico",
      fr: "Le Bâtisseur Pratique",
      ja: "実務的な構築者",
      ko: "실천적 건설가",
    },
    number: 4,
  },
  5: {
    archetype: "explorer",
    description: {
      zh: "自由追求者的数字，代表变化和冒险的核心本质。",
      en: "The number of the freedom seeker, representing change and adventure.",
      es: "El número del buscador de libertad, que representa el cambio y la aventura.",
      fr: "Le nombre du chercheur de liberté, représentant le changement et l'aventure.",
      ja: "自由な探求者の数で、変化と冒険の核心的な本質を表します。",
      ko: "자유로운 탐험가의 숫자로, 변화와 모험의 핵심 본질을 나타냅니다.",
    },
    element: "fire",
    keywords: {
      zh: "自由, 冒险, 变化, 多才多艺, 好奇心",
      en: "Freedom, Adventure, Change, Versatility, Curiosity",
      es: "Libertad, Aventura, Cambio, Versatilidad, Curiosidad",
      fr: "Liberté, Aventure, Changement, Polyvalence, Curiosité",
      ja: "自由, 冒険, 変化, 多才, 好奇心",
      ko: "자유, 모험, 변화, 다재다능, 호기심",
    },
    name: {
      zh: "自由追求者",
      en: "The Freedom Seeker",
      es: "El Buscador de Libertad",
      fr: "Le Chercheur de Liberté",
      ja: "自由な探求者",
      ko: "자유로운 탐험가",
    },
    number: 5,
  },
  6: {
    archetype: "healer",
    description: {
      zh: "养育者的数字，代表责任和关怀的核心本质。",
      en: "The number of the nurturer, representing responsibility and care.",
      es: "El número del cuidador, que representa la responsabilidad y el cuidado.",
      fr: "Le nombre du nourricier, représentant la responsabilité et le soin.",
      ja: "養育者の数で、責任感と配慮の核心的な本質を表します。",
      ko: "양육자의 숫자로, 책임감과 보살핌의 핵심 본질을 나타냅니다.",
    },
    element: "earth",
    keywords: {
      zh: "责任, 关怀, 家庭, 社区, 服务",
      en: "Responsibility, Care, Family, Community, Service",
      es: "Responsabilidad, Cuidado, Familia, Comunidad, Servicio",
      fr: "Responsabilité, Soin, Famille, Communauté, Service",
      ja: "責任, 配慮, 家族, コミュニティ, 奉仕",
      ko: "책임, 보살핌, 가족, 공동체, 봉사",
    },
    name: {
      zh: "养育者",
      en: "The Nurturer",
      es: "El Cuidador",
      fr: "Le Nourricier",
      ja: "養育者",
      ko: "양육자",
    },
    number: 6,
  },
  7: {
    archetype: "sage",
    description: {
      zh: "真理寻求者的数字，代表精神觉醒和内在智慧。",
      en: "The number of the seeker, representing spiritual awakening and inner wisdom.",
      es: "El número del buscador, que representa el despertar espiritual y la sabiduría interior.",
      fr: "Le nombre du chercheur, représentant l'éveil spirituel et la sagesse intérieure.",
      ja: "真理探究者の数で、霊的覚醒と内面の知恵を表します。",
      ko: "진리 탐구자의 숫자로, 영적 각성과 내면의 지혜를 나타냅니다.",
    },
    element: "water",
    keywords: {
      zh: "灵性, 智慧, 内省, 分析, 孤独",
      en: "Spirituality, Wisdom, Introspection, Analysis, Solitude",
      es: "Espiritualidad, Sabiduría, Introspección, Análisis, Soledad",
      fr: "Spiritualité, Sagesse, Introspection, Analyse, Solitude",
      ja: "霊性, 知恵, 内省, 分析, 孤独",
      ko: "영성, 지혜, 성찰, 분석, 고독",
    },
    name: {
      zh: "真理寻求者",
      en: "The Seeker",
      es: "El Buscador",
      fr: "Le Chercheur",
      ja: "真理探究者",
      ko: "진리 탐구자",
    },
    number: 7,
  },
  8: {
    archetype: "ruler",
    description: {
      zh: "成就者的数字，代表物质成功和权威。",
      en: "The number of the achiever, representing material success and authority.",
      es: "El número del logrador, que representa el éxito material y la autoridad.",
      fr: "Le nombre du réalisateur, représentant le succès matériel et l'autorité.",
      ja: "達成者の数で、物質的成功と権威を表します。",
      ko: "성취자의 숫자로, 물질적 성공과 권위를 나타냅니다.",
    },
    element: "earth",
    keywords: {
      zh: "成功, 权力, 权威, 富足, 执行",
      en: "Success, Power, Authority, Abundance, Executive",
      es: "Éxito, Poder, Autoridad, Abundancia, Ejecutivo",
      fr: "Succès, Pouvoir, Autorité, Abondance, Exécutif",
      ja: "成功, 力, 権威, 豊かさ, 経営",
      ko: "성공, 힘, 권위, 풍요, 경영",
    },
    name: {
      zh: "成就者",
      en: "The Achiever",
      es: "El Logrador",
      fr: "Le Réalisateur",
      ja: "達成者",
      ko: "성취자",
    },
    number: 8,
  },
  9: {
    archetype: "sage",
    description: {
      zh: "人道主义者的数字，代表完成和普遍的爱。",
      en: "The number of the humanitarian, representing completion and universal love.",
      es: "El número del humanitario, que representa la finalización y el amor universal.",
      fr: "Le nombre de l'humanitaire, représentant l'achèvement et l'amour universel.",
      ja: "人道主義者の数で、完成と普遍的な愛を表します。",
      ko: "인도주의자의 숫자로, 완성과 보편적 사랑을 나타냅니다.",
    },
    element: "fire",
    keywords: {
      zh: "人道主义, 同情, 完成, 无私, 宽容",
      en: "Humanitarianism, Compassion, Completion, Selflessness, Tolerance",
      es: "Humanitarismo, Compasión, Finalización, Abnegación, Tolerancia",
      fr: "Humanitarisme, Compassion, Achèvement, Altruisme, Tolérance",
      ja: "人道主義, 慈悲, 完成, 無私, 寛容",
      ko: "인애, 연민, 완성, 이타심, 관용",
    },
    name: {
      zh: "人道主义者",
      en: "The Humanitarian",
      es: "El Humanitario",
      fr: "L'Humanitaire",
      ja: "人道主義者",
      ko: "인도주의자",
    },
    number: 9,
  },
  11: {
    archetype: "magician",
    description: {
      zh: "代表直觉、精神洞察和启蒙的大师数字。",
      en: "A master number representing intuition, spiritual insight, and illumination.",
      es: "Un número maestro que representa la intuición, la visión espiritual y la iluminación.",
      fr: "Un maître nombre représentant l'intuition, la perspicacité spirituelle et l'illumination.",
      ja: "直感、霊的洞察、啓蒙を表すマスターナンバーです。",
      ko: "직관, 영적 통찰, 깨달음을 나타내는 마스터 숫자입니다.",
    },
    element: "air",
    keywords: {
      zh: "直觉, 灵性, 启蒙, 灵感, 理想主义",
      en: "Intuition, Spirituality, Enlightenment, Inspiration, Idealism",
      es: "Intuición, Espiritualidad, Iluminación, Inspiración, Idealismo",
      fr: "Intuition, Spiritualité, Illumination, Inspiration, Idéalisme",
      ja: "直感, 霊性, 悟り, インスピレーション, 理想主義",
      ko: "직관, 영성, 깨달음, 영감, 이상주의",
    },
    name: {
      zh: "大师启蒙者",
      en: "The Master Illuminator",
      es: "El Maestro Iluminador",
      fr: "Le Maître Illuminateur",
      ja: "マスター・イルミネーター",
      ko: "마스터 일루미네이터",
    },
    number: 11,
  },
  22: {
    archetype: "creator",
    description: {
      zh: "代表将梦想变为现实的能力的大师数字。",
      en: "A master number representing the ability to turn dreams into reality.",
      es: "Un número maestro que representa la capacidad de convertir los sueños en realidad.",
      fr: "Un maître nombre représentant la capacité de transformer les rêves en réalité.",
      ja: "夢を現実に変える能力を表すマスターナンバーです。",
      ko: "꿈을 현실로 만드는 능력을 나타내는 마스터 숫자입니다.",
    },
    element: "earth",
    keywords: {
      zh: "精通, 建设, 实现, 力量, 愿景",
      en: "Mastery, Construction, Realization, Power, Vision",
      es: "Maestría, Construcción, Realización, Poder, Visión",
      fr: "Maîtrise, Construction, Réalisation, Pouvoir, Vision",
      ja: "熟達, 建設, 実現, 力, ビジョン",
      ko: "숙달, 건설, 실현, 힘, 비전",
    },
    name: {
      zh: "大师建设者",
      en: "The Master Builder",
      es: "El Maestro Constructor",
      fr: "Le Maître Bâtisseur",
      ja: "マスター・ビルダー",
      ko: "마스터 빌더",
    },
    number: 22,
  },
  33: {
    archetype: "guide",
    description: {
      zh: "代表慈悲服务和精神教导的大师数字。",
      en: "A master number representing compassionate service and spiritual teaching.",
      es: "Un número maestro que representa el servicio compasivo y la enseñanza espiritual.",
      fr: "Un maître nombre représentant le service compatissant et l'enseignement spirituel.",
      ja: "慈悲深い奉仕と霊的教えを表すマスターナンバーです。",
      ko: "자비로운 봉사와 영적 가르침을 나타내는 마스터 숫자입니다.",
    },
    element: "water",
    keywords: {
      zh: "同情, 教导, 疗愈, 指导, 祝福",
      en: "Compassion, Teaching, Healing, Guidance, Blessing",
      es: "Compasión, Enseñanza, Curación, Guía, Bendición",
      fr: "Compassion, Enseignement, Guérison, Orientation, Bénédiction",
      ja: "慈悲, 教え, 癒し, 導き, 祝福",
      ko: "연민, 가르침, 치유, 인도, 축복",
    },
    name: {
      zh: "大师导师",
      en: "The Master Teacher",
      es: "El Maestro Maestro",
      fr: "Le Maître Enseignant",
      ja: "マスター・ティーチャー",
      ko: "마스터 티처",
    },
    number: 33,
  },
};

export const PERSONAL_YEAR_MEANINGS: Record<
  number,
  { description: LocalizedText; theme: LocalizedText }
> = {
  1: {
    description: {
      zh: "为未来播种的时刻。",
      en: "A time to plant seeds for the future.",
      es: "Un momento para plantar semillas para el futuro.",
      fr: "Un moment pour planter les graines du futur.",
      ja: "未来のために種をまく時期です。",
      ko: "미래를 위해 씨앗을 뿌리는 시기입니다.",
    },
    theme: {
      zh: "新的开始",
      en: "New Beginnings",
      es: "Nuevos comienzos",
      fr: "Nouveaux commencements",
      ja: "新しい始まり",
      ko: "새로운 시작",
    },
  },
  2: {
    description: {
      zh: "关注关系并等待结果。",
      en: "Focus on relationships and waiting for results.",
      es: "Céntrate en las relaciones y espera los resultados.",
      fr: "Concentrez-vous sur les relations et attendez les résultats.",
      ja: "関係に集中し、結果を待つ時期です。",
      ko: "관계에 집중하고 결과를 기다리는 시기입니다.",
    },
    theme: {
      zh: "耐心与合作",
      en: "Patience and Partnership",
      es: "Paciencia y asociación",
      fr: "Patience et partenariat",
      ja: "忍耐とパートナーシップ",
      ko: "인내와 협력",
    },
  },
  3: {
    description: {
      zh: "表现自己，享受生活。",
      en: "Express yourself and enjoy life.",
      es: "Exprésate y disfruta la vida.",
      fr: "Exprimez-vous et profitez de la vie.",
      ja: "自分を表現し、人生を楽しんでください。",
      ko: "자신을 표현하고 삶을 즐기는 시기입니다.",
    },
    theme: {
      zh: "创造力与快乐",
      en: "Creativity and Joy",
      es: "Creatividad y alegría",
      fr: "Créativité et joie",
      ja: "創造性と喜び",
      ko: "창의성과 기쁨",
    },
  },
  4: {
    description: {
      zh: "为你的目标建立坚实的基础。",
      en: "Build a solid foundation for your goals.",
      es: "Construye una base sólida para tus objetivos.",
      fr: "Construisez une fondation solide pour vos objectifs.",
      ja: "目標のために強固な基盤を築く時期です。",
      ko: "목표를 위한 단단한 기반을 다지는 시기입니다.",
    },
    theme: {
      zh: "努力与基础",
      en: "Hard Work and Foundation",
      es: "Trabajo duro y base",
      fr: "Travail acharné et fondation",
      ja: "努力と基盤",
      ko: "노력과 기반",
    },
  },
  5: {
    description: {
      zh: "接受变化并探索新的机遇。",
      en: "Embrace change and explore new opportunities.",
      es: "Acepta el cambio y explora nuevas oportunidades.",
      fr: "Acceptez le changement et explorez de nouvelles opportunités.",
      ja: "変化を受け入れ、新しい機会を探索してください。",
      ko: "변화를 받아들이고 새로운 기회를 탐험하세요.",
    },
    theme: {
      zh: "变化与自由",
      en: "Change and Freedom",
      es: "Cambio y libertad",
      fr: "Changement et liberté",
      ja: "変化と自由",
      ko: "변화와 자유",
    },
  },
  6: {
    description: {
      zh: "关注家庭、家人和责任。",
      en: "Focus on home, family, and duty.",
      es: "Céntrate en el hogar, la familia y el deber.",
      fr: "Concentrez-vous sur le foyer, la famille et le devoir.",
      ja: "家庭、家族、義務に集中してください。",
      ko: "가정, 가족, 의무에 집중하세요.",
    },
    theme: {
      zh: "责任与家庭",
      en: "Responsibility and Family",
      es: "Responsabilidad y familia",
      fr: "Responsabilité et famille",
      ja: "責任と家族",
      ko: "책임과 가족",
    },
  },
  7: {
    description: {
      zh: "内心反省并发展你的灵性。",
      en: "Look inward and develop your spirituality.",
      es: "Mira hacia adentro y desarrolla tu espiritualidad.",
      fr: "Regardez à l'intérieur et développez votre spiritualité.",
      ja: "内面を見つめ、霊性を高めてください。",
      ko: "내면을 들여다보고 영성을 발전시키세요.",
    },
    theme: {
      zh: "反思与成长",
      en: "Reflection and Growth",
      es: "Reflexión y crecimiento",
      fr: "Réflexion et croissance",
      ja: "内省と成長",
      ko: "성찰과 성장",
    },
  },
  8: {
    description: {
      zh: "收获回报并行使权力的时刻。",
      en: "A time to harvest rewards and exercise authority.",
      es: "Un momento para cosechar recompensas y ejercer autoridad.",
      fr: "Un moment pour récolter les récompenses et exercer l'autorité.",
      ja: "報酬を受け取り、権威を行使する時期です。",
      ko: "보상을 수확하고 권위를 행사하는 시기입니다.",
    },
    theme: {
      zh: "成功与权力",
      en: "Success and Power",
      es: "Éxito y poder",
      fr: "Succès et pouvoir",
      ja: "成功と力",
      ko: "성공과 힘",
    },
  },
  9: {
    description: {
      zh: "结束周期并为新事物做准备。",
      en: "Finish cycles and prepare for the new.",
      es: "Termina ciclos y prepárate para lo nuevo.",
      fr: "Terminez les cycles et préparez le nouveau.",
      ja: "サイクルを終え、新しい準備をしてください。",
      ko: "주기를 마무리하고 새로운 것을 준비하세요.",
    },
    theme: {
      zh: "完成与放手",
      en: "Completion and Letting Go",
      es: "Finalización y soltar",
      fr: "Achèvement et lâcher-prise",
      ja: "完成と手放し",
      ko: "완성과 놓아주기",
    },
  },
};

export const NUMEROLOGY_INTERPRETATIONS: Record<number, any> = {
  1: {
    advice: {
      en: [
        "Exhibit true leadership by cooperating with others.",
        "Translate confidence into creative energy.",
      ],
      ko: [
        "타인과 협력하며 진정한 리더십을 발휘하세요.",
        "자신감을 창의적 에너지로 전환하세요.",
      ],
    },
    career: {
      en: ["Executive", "Inventor", "Self-employed", "Politician"],
      ko: ["경영자", "발명가", "자영업", "정치인"],
    },
    challenges: {
      en: ["Self-centered", "Impatience", "Dominance"],
      ko: ["자기 중심적", "급한 성격", "지배욕"],
    },
    strengths: {
      en: ["Independence", "Leadership", "Innovation"],
      ko: ["독립성", "리더십", "혁신"],
    },
  },
  2: {
    advice: {
      en: [
        "Enjoy the joy of helping others while maintaining inner peace.",
        "Learn the courage to say no.",
      ],
      ko: [
        "내면의 평화를 유지하며 타인을 돕는 기쁨을 누리세요.",
        "거절하는 용기를 배우세요.",
      ],
    },
    career: {
      en: ["Counselor", "Diplomat", "Artist", "Mediator"],
      ko: ["상담가", "외교관", "예술가", "중재자"],
    },
    challenges: {
      en: ["Excessive dependency", "Indecisiveness", "Introversion"],
      ko: ["지나친 의존", "우유부단", "내성적임"],
    },
    strengths: {
      en: ["Harmony", "Sensitivity", "Diplomacy"],
      ko: ["조화", "민감성", "외교력"],
    },
  },
  3: {
    advice: {
      en: [
        "Focus your creative energy in one place.",
        "Explore values beyond superficial pleasures.",
      ],
      ko: [
        "창의적 에너지를 한 곳에 집중시키세요.",
        "표면적인 즐거움 너머의 가치를 탐구하세요.",
      ],
    },
    career: {
      en: ["Writer", "Actor", "Designer", "Public Speaker"],
      ko: ["작가", "연기자", "디자이너", "강연자"],
    },
    challenges: {
      en: ["Distraction", "Overspending", "Lack of depth"],
      ko: ["산만함", "과소비", "깊이 부족"],
    },
    strengths: {
      en: ["Creativity", "Sociability", "Optimism"],
      ko: ["창의성", "사교성", "낙관주의"],
    },
  },
  4: {
    advice: {
      en: [
        "Don't fear change, but maintain your solidity.",
        "Take time to recharge through rest.",
      ],
      ko: [
        "변화를 두려워 말되, 당신의 견고함을 유지하세요.",
        "휴식을 통해 재충전 시간을 가지세요.",
      ],
    },
    career: {
      en: ["Engineer", "Accountant", "Manager", "Architect"],
      ko: ["엔지니어", "회계사", "관리자", "건축가"],
    },
    challenges: {
      en: ["Conservatism", "Lack of flexibility", "Stubbornness"],
      ko: ["보수성", "유연성 부족", "완고함"],
    },
    strengths: {
      en: ["Hard work", "Organization", "Practicality"],
      ko: ["성실함", "조직력", "실용성"],
    },
  },
  5: {
    advice: {
      en: [
        "Learn to find responsibility within freedom.",
        "Utilize change positively.",
      ],
      ko: [
        "자유 속에서 책임을 찾는 법을 배우세요.",
        "변화를 긍정적으로 활용하세요.",
      ],
    },
    career: {
      en: ["Traveler", "Marketer", "Sales", "Journalist"],
      ko: ["여행가", "마케터", "영업", "기자"],
    },
    challenges: {
      en: ["Irresponsibility", "Distraction", "Addictive tendencies"],
      ko: ["무책임", "산만함", "중독 성향"],
    },
    strengths: {
      en: ["Adventure", "Versatility", "Adaptability"],
      ko: ["모험심", "다재다능", "적응력"],
    },
  },
  6: {
    advice: {
      en: [
        "Practice balanced love by watching others grow.",
        "Don't neglect taking care of yourself.",
      ],
      ko: [
        "타인의 성장을 지켜보며 균형 잡힌 사랑을 실천하세요.",
        "자신을 돌보는 일도 소홀히 마세요.",
      ],
    },
    career: {
      en: ["Healthcare", "Teacher", "Social Work", "Counselor"],
      ko: ["의료인", "교사", "사회복지", "상담가"],
    },
    challenges: {
      en: ["Intrusiveness", "Perfectionism", "Self-sacrifice"],
      ko: ["간섭주의", "완벽주의", "자기희생"],
    },
    strengths: {
      en: ["Nurturing", "Responsibility", "Empathy"],
      ko: ["보살핌", "책임감", "공감"],
    },
  },
  7: {
    advice: {
      en: [
        "Discover inner truth through solitude.",
        "Maintain your connection with the world.",
      ],
      ko: [
        "고독을 통해 내면의 진리를 발견하세요.",
        "세상과 소통하는 끈을 놓지 마세요.",
      ],
    },
    career: {
      en: ["Researcher", "Philosopher", "Tech Expert", "Psychologist"],
      ko: ["연구원", "철학자", "기술 전문가", "심리학자"],
    },
    challenges: {
      en: ["Cynicism", "Isolation", "Excessive criticism"],
      ko: ["냉소주의", "고립", "지나친 비판"],
    },
    strengths: {
      en: ["Insight", "Analysis", "Spirituality"],
      ko: ["통찰력", "분석력", "영성"],
    },
  },
  8: {
    advice: {
      en: [
        "Balance material success and spiritual growth.",
        "True power comes from love.",
      ],
      ko: [
        "물질적 성공과 정신적 성장의 균형을 맞추세요.",
        "진정한 힘은 사랑에서 나옵니다.",
      ],
    },
    career: {
      en: [
        "Entrepreneur",
        "Legal Professional",
        "Finance Expert",
        "Administrator",
      ],
      ko: ["사업가", "법조인", "재무 전문가", "행정가"],
    },
    challenges: {
      en: ["Materialism", "Abuse of power", "Ruthlessness"],
      ko: ["물질주의", "권력 남용", "무정함"],
    },
    strengths: {
      en: ["Achievement", "Authority", "Execution"],
      ko: ["성취력", "권위", "실행력"],
    },
  },
  9: {
    advice: {
      en: [
        "Illuminated the world through universal love.",
        "Let go of obsession with the past and move forward.",
      ],
      ko: [
        "보편적 사랑을 통해 세상을 환하게 비추세요.",
        "과거의 집착을 버리고 미래로 나가세요.",
      ],
    },
    career: {
      en: ["Philanthropist", "Artist", "Environmentalist", "Healer"],
      ko: ["자선가", "예술가", "환경 운동가", "치유자"],
    },
    challenges: {
      en: ["Sentimentalism", "Self-centered", "Unrealistic"],
      ko: ["감상주의", "자기중심적", "비현실적"],
    },
    strengths: {
      en: ["Humanitarianism", "Wisdom", "Tolerance"],
      ko: ["인도주의", "지혜", "관용"],
    },
  },
  11: {
    advice: {
      en: [
        "Translate your inspiration into concrete action.",
        "Sublimate inner anxiety into faith.",
      ],
      ko: [
        "당신의 영감을 구체적인 행동으로 옮기세요.",
        "내면의 불안을 신념으로 승화시키세요.",
      ],
    },
    career: {
      en: ["Prophet", "Spiritual Teacher", "Inventor", "Artist"],
      ko: ["예언자", "정신적 스승", "발명가", "예술가"],
    },
    challenges: {
      en: ["Excessive anxiety", "Unrealistic", "Sensitivity"],
      ko: ["지나친 불안", "비현실적", "예민함"],
    },
    strengths: {
      en: ["Intuition", "Inspiration", "Idealism"],
      ko: ["직관", "영감", "이상주의"],
    },
  },
  22: {
    advice: {
      en: [
        "Build a grand vision into earthly reality.",
        "Don't forget the value of cooperation.",
      ],
      ko: [
        "거대한 비전을 지상의 현실로 구축하세요.",
        "협력의 가치를 잊지 마세요.",
      ],
    },
    career: {
      en: [
        "Master Architect",
        "Innovator",
        "Head of Non-profit",
        "Policy Maker",
      ],
      ko: ["대형 건축가", "혁신가", "자선 단체장", "정책 입안자"],
    },
    challenges: {
      en: ["Pressure", "Arrogance", "Frustration"],
      ko: ["압박감", "오만함", "좌절"],
    },
    strengths: {
      en: ["Mastery", "Realization", "Vision"],
      ko: ["숙달", "결과 실현", "비전"],
    },
  },
  33: {
    advice: {
      en: [
        "Use your ability to heal the world with humility.",
        "Take care of your own emotional state first.",
      ],
      ko: [
        "세상을 치유하는 당신의 능력을 겸손히 사용하세요.",
        "자신의 감정 상태를 먼저 돌보세요.",
      ],
    },
    career: {
      en: ["Spiritual Leader", "Vocalist", "Healing Expert", "Educator"],
      ko: ["정신적 지도자", "성악가", "치유 전문가", "교육자"],
    },
    challenges: {
      en: ["Heavy responsibility", "Superiority complex", "Sacrifice"],
      ko: ["과중한 책임감", "우월감", "희생"],
    },
    strengths: {
      en: ["Unconditional love", "Teaching", "Healing"],
      ko: ["무조건적인 사랑", "가르침", "치유"],
    },
  },
};

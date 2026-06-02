import { LocalizedText } from "@/types/manifest";

export interface EnneagramShard {
  types: Record<
    EnneagramTypeId,
    {
      compatibility: {
        best: EnneagramTypeId[];
        challenging: EnneagramTypeId[];
        good: EnneagramTypeId[];
      };
      coreMotivation: LocalizedText;
      description: LocalizedText;
      subtitle: LocalizedText;
      title: LocalizedText;
    }
  >;
}

export type EnneagramTypeId =
  | "type1"
  | "type2"
  | "type3"
  | "type4"
  | "type5"
  | "type6"
  | "type7"
  | "type8"
  | "type9";

export const enneagramData: EnneagramShard = {
  types: {
    type1: {
      compatibility: {
        best: ["type2", "type7"],
        challenging: ["type4", "type8"],
        good: ["type3", "type5", "type6"],
      },
      coreMotivation: {
        cn: "道徳上的完美。",
        en: "To be morally perfect.",
        es: "Ser moralmente perfecto.",
        fr: "Être moralement parfait.",
        ja: "道徳的に完璧であること。",
        ko: "도덕적으로 완벽하기를 원함.",
      },
      description: {
        cn: "追求正义和道德。",
        en: "Pursues righteousness and morality.",
        es: "Busca la rectitud y la moralidad.",
        fr: "Poursuit la droiture et la moralité.",
        ja: "正義と道徳を追求します。",
        ko: "올바름과 도덕성을 추구합니다.",
      },
      subtitle: {
        cn: "原则和理想主义",
        en: "Principled and idealistic",
        es: "Idealista y con principios",
        fr: "Idéaliste et de principes",
        ja: "理想主義",
        ko: "원칭적이고 이상주의적인",
      },
      title: {
        cn: "完美主义者",
        en: "The Reformer",
        es: "El Reformador",
        fr: "Le Réformateur",
        ja: "改革者",
        ko: "완벽주의자",
      },
    },
    type2: {
      compatibility: {
        best: ["type4", "type8"],
        challenging: ["type5", "type9"],
        good: ["type1", "type3", "type7"],
      },
      coreMotivation: {
        cn: "被爱和被需要。",
        en: "To be loved and needed.",
        es: "Ser amado y necesitado.",
        fr: "Être aimé et nécessaire.",
        ja: "愛され、必要とされること。",
        ko: "사랑받고 필요한 존재가 되기를 원함.",
      },
      description: {
        cn: "在帮助他人中找到快乐。",
        en: "Finds joy in helping others.",
        es: "Encuentra alegría en ayudar a los demás.",
        fr: "Trouve de la joie à aider les autres.",
        ja: "他者を助けることに喜びを見出します。",
        ko: "다른 사람을 돕는 것에서 기쁨을 찾습니다.",
      },
      subtitle: {
        cn: "热情和关心",
        en: "Warm and caring",
        es: "Cálido y cariñoso",
        fr: "Chaleureux et attentionné",
        ja: "温かく思いやりのある",
        ko: "따뜻하고 배려심 많은",
      },
      title: {
        cn: "助人者",
        en: "The Helper",
        es: "El Ayudador",
        fr: "L'Altruiste",
        ja: "助け手",
        ko: "조력자",
      },
    },
    type3: {
      compatibility: {
        best: ["type6", "type9"],
        challenging: ["type4", "type5"],
        good: ["type1", "type2", "type7"],
      },
      coreMotivation: {
        cn: "成功并获得价值。",
        en: "To succeed and be valued.",
        es: "Tener éxito y ser valorado.",
        fr: "Réussir et être valorisé.",
        ja: "成功し、価値を認められること。",
        ko: "성공하고 가치 있게 인정받기를 원함.",
      },
      description: {
        cn: "追求成功和认可。",
        en: "Pursues success and recognition.",
        es: "Busca el éxito y el reconocimiento.",
        fr: "Poursuit le succès et la reconnaissance.",
        ja: "成功と承認を追求します。",
        ko: "성공과 인정을 추구합니다.",
      },
      subtitle: {
        cn: "目标导向和高效",
        en: "Goal-oriented and efficient",
        es: "Orientado a objetivos y eficiente",
        fr: "Axé sur les objectifs et efficace",
        ja: "目標志向で効率的",
        ko: "목표 지향적이고 효율적인",
      },
      title: {
        cn: "成就者",
        en: "The Achiever",
        es: "El Triunfador",
        fr: "Le Battant",
        ja: "達成者",
        ko: "성취자",
      },
    },
    type4: {
      compatibility: {
        best: ["type1", "type5"],
        challenging: ["type3", "type8"],
        good: ["type2", "type7", "type9"],
      },
      coreMotivation: {
        cn: "发现真实的自我。",
        en: "To discover true self.",
        es: "Descubrir el verdadero yo.",
        fr: "Découvrir son vrai moi.",
        ja: "真実の自分を発見すること。",
        ko: "진정한 자신을 발견하기를 원함.",
      },
      description: {
        cn: "重视真实性和独特身份。",
        en: "Values authenticity and unique ontology.",
        es: "Valora la autenticidad y la identidad única.",
        fr: "Valorise l'authenticité et l'identité unique.",
        ja: "本物志向と独自のアイデンティティを重視します。",
        ko: "진정성과 독특한 정체성을 중요시합니다.",
      },
      subtitle: {
        cn: "富有创造力和敏感性",
        en: "Creative and sensitive",
        es: "Creativo y sensible",
        fr: "Créatif et sensible",
        ja: "創造的で感受性の豊かな",
        ko: "창의적이고 감성적인",
      },
      title: {
        cn: "艺术型",
        en: "The Individualist",
        es: "El Individualista",
        fr: "L'Individualiste",
        ja: "芸術家",
        ko: "예술가",
      },
    },
    type5: {
      compatibility: {
        best: ["type4", "type7"],
        challenging: ["type2", "type8"],
        good: ["type1", "type6", "type9"],
      },
      coreMotivation: {
        cn: "有能力和博学。",
        en: "To be capable and knowledgeable.",
        es: "Ser capaz y conocedor.",
        fr: "Être capable et savant.",
        ja: "能力があり、知識が豊富であること。",
        ko: "능력 있고 지식이 풍부하기를 원함.",
      },
      description: {
        cn: "追求知识和理解。",
        en: "Pursues knowledge and understanding.",
        es: "Busca el conocimiento y la comprensión.",
        fr: "Poursuit la connaissance et la compréhension.",
        ja: "知識と理解を追求します。",
        ko: "지식과 이해를 추구합니다.",
      },
      subtitle: {
        cn: "理智和敏锐",
        en: "Intellectual and insightful",
        es: "Intelectual y perspicaz",
        fr: "Intellectuel et perspicace",
        ja: "知的で洞察力のある",
        ko: "지적이고 통찰력 있는",
      },
      title: {
        cn: "理智型",
        en: "The Investigator",
        es: "El Investigador",
        fr: "L'Observateur",
        ja: "探究者",
        ko: "탐구자",
      },
    },
    type6: {
      compatibility: {
        best: ["type3", "type9"],
        challenging: ["type4", "type7"],
        good: ["type1", "type2", "type8"],
      },
      coreMotivation: {
        cn: "获得安全和支持。",
        en: "To have security and support.",
        es: "Tener seguridad y apoyo.",
        fr: "Avoir de la sécurité et du soutien.",
        ja: "安全とサポートを得ること。",
        ko: "안전하고 지지받기를 원함.",
      },
      description: {
        cn: "寻求安全和确定性。",
        en: "Seek safety and certainty.",
        es: "Busca seguridad y certeza.",
        fr: "Recherche la sécurité et la certitude.",
        ja: "安全と確実性を追求します。",
        ko: "안전과 확실성을 추구합니다.",
      },
      subtitle: {
        cn: "负责和可靠",
        en: "Responsible and trustworthy",
        es: "Responsable y confiable",
        fr: "Responsable et digne de confiance",
        ja: "責任感があり信頼できる",
        ko: "책임감 있고 신뢰할 수 있는",
      },
      title: {
        cn: "忠诚型",
        en: "The Loyalist",
        es: "El Leal",
        fr: "Le Loyaliste",
        ja: "忠実家",
        ko: "충성가",
      },
    },
    type7: {
      compatibility: {
        best: ["type5", "type1"],
        challenging: ["type4", "type8"],
        good: ["type2", "type3", "type9"],
      },
      coreMotivation: {
        cn: "快乐和满足。",
        en: "To be happy and satisfied.",
        es: "Ser feliz y estar satisfecho.",
        fr: "Être heureux et satisfait.",
        ja: "幸せで満足すること。",
        ko: "행복하고 만족스럽기를 원함.",
      },
      description: {
        cn: "追求新体验和快乐生活。",
        en: "Pursues new experiences and joyful life.",
        es: "Busca nuevas experiencias y una vida alegre.",
        fr: "Poursuit de nouvelles expériences et une vie joyeuse.",
        ja: "新しい経験と楽しい人生を追求します。",
        ko: "새로운 경험과 즐거운 삶을 추구합니다.",
      },
      subtitle: {
        cn: "乐观和冒险",
        en: "Optimistic and adventurous",
        es: "Optimista y aventurero",
        fr: "Optimiste et aventureux",
        ja: "楽観的で冒険的な",
        ko: "낙관적이고 모험을 즐기는",
      },
      title: {
        cn: "活跃型",
        en: "The Enthusiast",
        es: "El Entusiasta",
        fr: "L'Épicurien",
        ja: "熱狂家",
        ko: "열정가",
      },
    },
    type8: {
      compatibility: {
        best: ["type2", "type9"],
        challenging: ["type1", "type5"],
        good: ["type3", "type6", "type7"],
      },
      coreMotivation: {
        cn: "强大和有影响力。",
        en: "To be strong and influential.",
        es: "Ser fuerte e influyente.",
        fr: "Être fort et influent.",
        ja: "強く、影響力があること。",
        ko: "강하고 영향력 있기를 원함.",
      },
      description: {
        cn: "寻求控制和正义。",
        en: "Seek control and justice.",
        es: "Busca control y justicia.",
        fr: "Recherche le contrôle et la justice.",
        ja: "制御と正義を追求します。",
        ko: "통제와 정의를 추구합니다.",
      },
      subtitle: {
        cn: "强大和自信",
        en: "Powerful and confident",
        es: "Poderoso y seguro",
        fr: "Puissant et confiant",
        ja: "強力で自信のある",
        ko: "강력하고 자신감 있는",
      },
      title: {
        cn: "领袖型",
        en: "The Challenger",
        es: "El Desafiador",
        fr: "Le Chef",
        ja: "挑戦者",
        ko: "도전자",
      },
    },
    type9: {
      compatibility: {
        best: ["type3", "type6"],
        challenging: ["type8", "type1"],
        good: ["type2", "type7", "type4"],
      },
      coreMotivation: {
        cn: "拥有和平与和谐。",
        en: "To have peace and harmony.",
        es: "Tener paz y armonía.",
        fr: "Avoir la paix et l'harmonie.",
        ja: "平和で調和していること。",
        ko: "평화롭고 조화롭기를 원함.",
      },
      description: {
        cn: "避免冲突并寻求内在和平。",
        en: "Avoid conflict and seek inner peace.",
        es: "Evita el conflicto y busca la paz interior.",
        fr: "Évite les conflits et recherche la paix intérieure.",
        ja: "葛藤を避け、内面的な平和を追求します。",
        ko: "갈등을 회피하고 내적 평화를 추구합니다.",
      },
      subtitle: {
        cn: "和平和和谐",
        en: "Peaceful and harmony-seeking",
        es: "Pacífico y en busca de armonía",
        fr: "Paisible et en quête d'harmonie",
        ja: "平和的で調和を求める",
        ko: "평화롭고 조화를 추구하는",
      },
      title: {
        cn: "和平型",
        en: "The Peacemaker",
        es: "El Pacificador",
        fr: "Le Médiateur",
        ja: "平和主義者",
        ko: "평화주의자",
      },
    },
  },
};

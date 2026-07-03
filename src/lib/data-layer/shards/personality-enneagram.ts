import { LocalizedText } from "@/types/manifest";

export interface EnneagramQuestion {
  id: number;
  options: {
    text: LocalizedText;
    type: EnneagramType;
    weight: number;
  }[];
  text: LocalizedText;
}

export type EnneagramType =
  | "type1"
  | "type2"
  | "type3"
  | "type4"
  | "type5"
  | "type6"
  | "type7"
  | "type8"
  | "type9";

export interface EnneagramTypeDetail {
  compatibility: {
    best: EnneagramType[];
    challenging: EnneagramType[];
    good: EnneagramType[];
  };
  coreMotivation: LocalizedText;
  description: LocalizedText;
  subtitle: LocalizedText;
  title: LocalizedText;
  triad: "gut" | "head" | "heart";
}

export const ENNEAGRAM_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 1,
    options: [
      {
        text: {
          zh: "完美分析以找到正确的解决方案",
          en: "Analyze it perfectly to find the right solution",
          es: "Analizar perfectamente para encontrar la solución",
          fr: "Analyser parfaitement pour trouver la solution",
          ja: "分析して正しい解決策を見つける",
          ko: "올바른 해결책을 찾기 위해 완벽하게 분석한다",
        },
        type: "type1",
        weight: 3,
      },
      {
        text: {
          zh: "正面面对并控制局面",
          en: "Confront it head-on and take control",
          es: "Enfrentar de frente y tomar el control",
          fr: "Affronter de front et prendre le contrôle",
          ja: "真っ向から立ち向かって主導権를 쥐기",
          ko: "적극적으로 맞서서 문제를 해결한다",
        },
        type: "type8",
        weight: 3,
      },
      {
        text: {
          zh: "保持冷静并花时间思考",
          en: "Stay calm and take time to think",
          es: "Mantener la calma y tomar tiempo para pensar",
          fr: "Rester calme et prendre le temps de réfléchir",
          ja: "冷静さを保ち、時間をかけて考える",
          ko: "평온함을 유지하며 시간을 두고 생각한다",
        },
        type: "type9",
        weight: 3,
      },
      {
        text: {
          zh: "仔细考虑多种方案",
          en: "Consider multiple scenarios carefully",
          es: "Considerar cuidadosamente múltiples escenarios",
          fr: "Envisager soigneusement plusieurs scénarios",
          ja: "複数のシナリオを慎重に検討する",
          ko: "여러 시나리오를 고려하며 신중하게 접근한다",
        },
        type: "type6",
        weight: 3,
      },
    ],
    text: {
      zh: "面对困难情况时，我通常...",
      en: "When facing a difficult situation, I typically...",
      es: "Al enfrentar una situación difícil, suelo...",
      fr: "Face à une situation difficile, je vais généralement...",
      ja: "困難な状況に直面したとき、私は主に...",
      ko: "어려운 상황에 직면했을 때, 나는 주로...",
    },
  },
  {
    id: 2,
    options: [
      {
        text: {
          zh: "热情的心和乐于助人",
          en: "My warm heart and willingness to help",
          es: "Mi corazón cálido y disposición para ayudar",
          fr: "Mon cœur chaleureux et ma volonté d'aider",
          ja: "温かい心、助けの手",
          ko: "다른 사람을 도우려는 따뜻한 마음",
        },
        type: "type2",
        weight: 3,
      },
      {
        text: {
          zh: "我的驱动力和实现目标的能力",
          en: "My drive and ability to achieve goals",
          es: "Mi empuje y capacidad para lograr metas",
          fr: "Ma motivation et ma capacité à atteindre des objectifs",
          ja: "目標達成の推進力と能力",
          ko: "목표를 달성하는 추진력과 능력",
        },
        type: "type3",
        weight: 3,
      },
      {
        text: {
          zh: "真实而富有创造力的表达方式",
          en: "My authentic and creative expression",
          es: "Mi expresión auténtica y creativa",
          fr: "Mon expression authentique et créative",
          ja: "独創的で真正性のある表現力",
          ko: "독창적이고 진정성 있는 표현력",
        },
        type: "type4",
        weight: 3,
      },
      {
        text: {
          zh: "积极有趣的活力",
          en: "My positive and fun energy",
          es: "Mi energía positiva y divertida",
          fr: "Mon énergie positive et amusante",
          ja: "前向きで楽しいエネルギー",
          ko: "긍정적이고 즐거운 에너지",
        },
        type: "type7",
        weight: 3,
      },
    ],
    text: {
      zh: "人们最欣赏我的地方是...",
      en: "People most appreciate me for...",
      es: "La gente me aprecia más por...",
      fr: "Les gens m'apprécient surtout pour...",
      ja: "人々が私を最も高く評価する点は...",
      ko: "사람들이 나를 가장 많이 평가하는 점은...",
    },
  },
  {
    id: 3,
    options: [
      {
        text: {
          zh: "彻底研究并首先收集知识",
          en: "Research thoroughly and gather knowledge first",
          es: "Investigar a fondo y reunir conocimientos primero",
          fr: "Effectuer des recherches approfondies et recueillir des connaissances",
          ja: "徹底的に調査し、知識を蓄える",
          ko: "철저하게 조사하고 지식을 쌓은 후 시작한다",
        },
        type: "type5",
        weight: 3,
      },
      {
        text: {
          zh: "制定成功策略并迅速行动",
          en: "Develop a strategy for success and act quickly",
          es: "Desarrollar una estrategia para el éxito y actuar rápidamente",
          fr: "Développer une stratégie de réussite et agir rapidement",
          ja: "成功のための戦略を立て、すぐに行動する",
          ko: "성공을 위한 전략을 세우고 빠르게 실행한다",
        },
        type: "type3",
        weight: 3,
      },
      {
        text: {
          zh: "兴奋地探索各种可能性",
          en: "Explore various possibilities with excitement",
          es: "Explorar diversas posibilidades con entusiasmo",
          fr: "Explorer diverses possibilités avec enthousiasme",
          ja: "様々な可能性を興奮気味に探る",
          ko: "다양한 가능성을 탐색하며 흥미롭게 시작한다",
        },
        type: "type7",
        weight: 3,
      },
      {
        text: {
          zh: "制定系统计划并循序渐进",
          en: "Create a systematic plan and proceed step by step",
          es: "Crear un plan sistemático y proceder paso a paso",
          fr: "Créer un plan systématique et procéder étape par étape",
          ja: "体系的な計画を立て、一歩ずつ進む",
          ko: "체계적인 계획을 만들고 단계별로 진행한다",
        },
        type: "type1",
        weight: 3,
      },
    ],
    text: {
      zh: "开始一个新项目时，我...",
      en: "When starting a new project, I...",
      es: "Al comenzar un nuevo proyecto, yo...",
      fr: "Quand je commence un nouveau projet, je...",
      ja: "新しいプロジェクトを始めるとき、私は...",
      ko: "새로운 프로젝트를 시작할 때, 나는...",
    },
  },
  {
    id: 4,
    options: [
      {
        text: {
          zh: "犯错或被批评",
          en: "Making mistakes or being criticized",
          es: "Cometer errores o ser criticado",
          fr: "Faire des erreurs ou être critiqué",
          ja: "間違いや批判",
          ko: "실수를 하거나 비난받는 것",
        },
        type: "type1",
        weight: 3,
      },
      {
        text: {
          zh: "不被爱或不被需要",
          en: "Being unloved or unwanted",
          es: "No ser amado o no ser deseado",
          fr: "Ne pas être aimé ou ne pas être désiré",
          ja: "愛されない、必要とされない",
          ko: "사랑받지 못하거나 필요없는 사람이 되는 것",
        },
        type: "type2",
        weight: 3,
      },
      {
        text: {
          zh: "平庸或失去自我",
          en: "Being ordinary or losing my ontology",
          es: "Ser ordinario o perder mi identidad",
          fr: "Être ordinaire ou perdre mon identité",
          ja: "平凡になる、アイデンティティの喪失",
          ko: "평범해지거나 정체성을 잃는 것",
        },
        type: "type4",
        weight: 3,
      },
      {
        text: {
          zh: "无能或无知",
          en: "Being incompetent or ignorant",
          es: "Ser incompetente o ignorante",
          fr: "Être incompétent ou ignorant",
          ja: "無能、無知と思われること",
          ko: "무능하거나 무지하다고 여겨지는 것",
        },
        type: "type5",
        weight: 3,
      },
    ],
    text: {
      zh: "我最害怕的是...",
      en: "What I fear most is...",
      es: "Lo que más temo es...",
      fr: "Ce que je crains le plus, c'est...",
      ja: "私が最も恐れているのは...",
      ko: "내가 가장 두려워하는 것은...",
    },
  },
  {
    id: 5,
    options: [
      {
        text: {
          zh: "直接对抗并强势主张我的立场",
          en: "Confront directly and assert my position strongly",
          es: "Confrontar directamente y afirmar mi posición con firmeza",
          fr: "Confronter directement et affirmer ma position avec force",
          ja: "直接対決、自説を強く主張",
          ko: "직접적으로 맞서며 내 의견을 강하게 주장한다",
        },
        type: "type8",
        weight: 3,
      },
      {
        text: {
          zh: "寻求妥协以维持和平",
          en: "Seek compromise to maintain peace",
          es: "Buscar un compromiso para mantener la paz",
          fr: "Chercher un compromis pour maintenir la paix",
          ja: "平和のために妥協点を探る",
          ko: "평화를 위해 타협점을 찾으려 노력한다",
        },
        type: "type9",
        weight: 3,
      },
      {
        text: {
          zh: "在行动前咨询值得信赖的人",
          en: "Consult with trusted people before acting",
          es: "Consultar con personas de confianza antes de actuar",
          fr: "Consulter des personnes de confiance avant d'agir",
          ja: "信頼できる人に相談してから対処",
          ko: "신뢰할 수 있는 사람들과 상의하며 대처한다",
        },
        type: "type6",
        weight: 3,
      },
      {
        text: {
          zh: "压抑情绪并以逻辑方式处理",
          en: "Suppress emotions and approach logically",
          es: "Suprimir las emociones y abordar lógicamente",
          fr: "Réprimer mes émotions et adopter une approche logique",
          ja: "感情を抑え、論理的にアプローチ",
          ko: "감정을 억제하고 논리적으로 접근한다",
        },
        type: "type5",
        weight: 3,
      },
    ],
    text: {
      zh: "在冲突情况下，我通常...",
      en: "In conflict situations, I usually...",
      es: "En situaciones de conflicto, suelo...",
      fr: "Dans les situations de conflit, j'ai tendance à...",
      ja: "葛藤が生じたとき、私は通常...",
      ko: "갈등 상황에서 나는 주로...",
    },
  },
  {
    id: 6,
    options: [
      {
        text: {
          zh: "取得成功和获得认可",
          en: "Achieving success and recognition",
          es: "Lograr el éxito y el reconocimiento",
          fr: "Atteindre le succès et la reconnaissance",
          ja: "成功、承認",
          ko: "성공하고 인정받는 것",
        },
        type: "type3",
        weight: 3,
      },
      {
        text: {
          zh: "拥有自由和快乐的体验",
          en: "Having freedom and joyful experiences",
          es: "Tener libertad y experiencias alegres",
          fr: "Avoir de la liberté et des expériences joyeuses",
          ja: "自由、楽しい経験",
          ko: "자유롭고 즐거운 경험을 하는 것",
        },
        type: "type7",
        weight: 3,
      },
      {
        text: {
          zh: "帮助他人和被爱",
          en: "Helping others and being loved",
          es: "Ayudar a los demás y ser amado",
          fr: "Aider les autres et être aimé",
          ja: "他者を助け、愛されること",
          ko: "다른 사람을 돕고 사랑받는 것",
        },
        type: "type2",
        weight: 3,
      },
      {
        text: {
          zh: "表达真实的自我并被理解",
          en: "Expressing my true self and being understood",
          es: "Expresar mi verdadero yo y ser comprendido",
          fr: "Exprimer mon vrai moi et être compris",
          ja: "本当の自分を示し、理解されること",
          ko: "진정한 나를 표현하고 이해받는 것",
        },
        type: "type4",
        weight: 3,
      },
    ],
    text: {
      zh: "我最大的动力是...",
      en: "My greatest motivation is...",
      es: "Mi mayor motivación es...",
      fr: "Ma plus grande motivation, c'est...",
      ja: "私の最大の動機は...",
      ko: "나의 가장 큰 동기는...",
    },
  },
  {
    id: 7,
    options: [
      {
        text: {
          zh: "变得更加追求完美和挑剔",
          en: "Become more perfectionistic and critical",
          es: "Volverme más perfeccionista y crítico",
          fr: "Devenir plus perfectionniste et critique",
          ja: "より完璧主義的、批判的になる",
          ko: "더욱 완벽하려 하고 비판적이 된다",
        },
        type: "type1",
        weight: 3,
      },
      {
        text: {
          zh: "变得情绪化和忧郁",
          en: "Get deeply emotional and melancholic",
          es: "Volverme profundamente emocional y melancólico",
          fr: "Devenir profondément émotif et mélancolique",
          ja: "感情に浸り、憂鬱になる",
          ko: "감정에 깊이 빠지고 우울해진다",
        },
        type: "type4",
        weight: 3,
      },
      {
        text: {
          zh: "寻求更多活动以转移注意力",
          en: "Seek more activities to distract myself",
          es: "Buscar más actividades para distraerme",
          fr: "Chercher plus d'activités pour me distraire",
          ja: "気分転換に活動を増やす",
          ko: "더 많은 활동으로 기분을 전환하려 한다",
        },
        type: "type7",
        weight: 3,
      },
      {
        text: {
          zh: "退缩或变得冷漠",
          en: "Withdraw or become apathetic",
          es: "Retirarme o volverme apático",
          fr: "Me retirer ou devenir apathique",
          ja: "引きこもるか、無気力になる",
          ko: "회피하거나 무관심해진다",
        },
        type: "type9",
        weight: 3,
      },
    ],
    text: {
      zh: "当感到压力时，我倾向于...",
      en: "When stressed, I tend to...",
      es: "Cuando estoy estresado, tiendo a...",
      fr: "Quand je suis stressé, j'ai tendance à...",
      ja: "ストレスを受けたとき、私は...",
      ko: "스트레스를 받을 때, 나는...",
    },
  },
  {
    id: 8,
    options: [
      {
        text: {
          zh: "基于全面的信息和分析",
          en: "Based on thorough information and analysis",
          es: "Basado en información y análisis exhaustivos",
          fr: "Basé sur des informations et des analyses approfondies",
          ja: "十分な情報と分析に基づく",
          ko: "충분한 정보와 분석을 바탕으로 결정한다",
        },
        type: "type5",
        weight: 3,
      },
      {
        text: {
          zh: "相信直觉并迅速决定",
          en: "Trust my gut and decide quickly",
          es: "Confiar en mi instinto y decidir rápidamente",
          fr: "Faire confiance à mon instinct et décider rapidement",
          ja: "直感を信じ、素早く決める",
          ko: "직관을 믿고 빠르게 결단을 내린다",
        },
        type: "type8",
        weight: 3,
      },
      {
        text: {
          zh: "考虑多种可能性并安全选择",
          en: "Consider multiple possibilities and choose safely",
          es: "Considerar múltiples posibilidades y elegir de manera segura",
          fr: "Envisager plusieurs possibilités et choisir en toute sécurité",
          ja: "可能性を検討し、安全に選ぶ",
          ko: "여러 가능성을 고려하고 안전한 선택을 한다",
        },
        type: "type6",
        weight: 3,
      },
      {
        text: {
          zh: "首先考虑他人的需求",
          en: "Consider others' needs first",
          es: "Considerar primero las necesidades de los demás",
          fr: "Considérer d'abord les besoins des autres",
          ja: "他者のニーズを優先する",
          ko: "다른 사람의 필요를 먼저 생각하며 결정한다",
        },
        type: "type2",
        weight: 3,
      },
    ],
    text: {
      zh: "我的决策风格是...",
      en: "My decision-making style is...",
      es: "Mi estilo de toma de decisiones es...",
      fr: "Mon style de prise de décision est...",
      ja: "私の意思決定スタイルは...",
      ko: "나의 의사결정 방식은...",
    },
  },
  {
    id: 9,
    options: [
      {
        text: {
          zh: "正直和坚持原则",
          en: "Integrity and adherence to principles",
          es: "Integridad y adhesión a los principios",
          fr: "L'intégrité et l'adhésion aux principes",
          ja: "誠実、原則遵守",
          ko: "원칙과 윤리를 지키는 성실함",
        },
        type: "type1",
        weight: 3,
      },
      {
        text: {
          zh: "朝着目标的坚持和效率",
          en: "Persistence and efficiency toward goals",
          es: "Perseverancia y eficiencia hacia las metas",
          fr: "La persévérance et l'efficacité vers les objectifs",
          ja: "目標に向かう粘り強さと効率",
          ko: "목표를 향한 끈기와 효율성",
        },
        type: "type3",
        weight: 3,
      },
      {
        text: {
          zh: "责任感和可靠性",
          en: "Responsibility and reliability",
          es: "Responsabilidad y confiabilidad",
          fr: "Responsabilité et fiabilité",
          ja: "責任感、信頼",
          ko: "책임감과 신뢰할 수 있는 성격",
        },
        type: "type6",
        weight: 3,
      },
      {
        text: {
          zh: "强大的领导力和果断性",
          en: "Strong leadership and decisiveness",
          es: "Liderazgo fuerte y decisión",
          fr: "Un leadership fort et de la détermination",
          ja: "強力なリーダーシップ、決断力",
          ko: "강한 리더십과 결단력",
        },
        type: "type8",
        weight: 3,
      },
    ],
    text: {
      zh: "我最大的优势是...",
      en: "My greatest strength is...",
      es: "Mi mayor fortaleza es...",
      fr: "Ma plus grande force, c'est...",
      ja: "私の最大の強みは...",
      ko: "나의 강점은...",
    },
  },
  {
    id: 10,
    options: [
      {
        text: {
          zh: "独自安静地学习或研究",
          en: "Study or research alone quietly",
          es: "Estudiar o investigar solo y en silencio",
          fr: "Étudier ou faire des recherches seul et au calme",
          ja: "一人で静かに勉強や研究をする",
          ko: "혼자 조용히 공부하거나 연구한다",
        },
        type: "type5",
        weight: 3,
      },
      {
        text: {
          zh: "享受新活动和冒险",
          en: "Enjoy new activities and adventures",
          es: "Disfrutar de nuevas actividades y aventuras",
          fr: "Profiter de nouvelles activités et d'aventures",
          ja: "新しい活動、冒険を楽しむ",
          ko: "새로운 활동과 모험을 즐긴다",
        },
        type: "type7",
        weight: 3,
      },
      {
        text: {
          zh: "舒适放松或进行平静的活动",
          en: "Relax comfortably or do peaceful activities",
          es: "Relajarme cómodamente o realizar actividades pacíficas",
          fr: "Se détendre confortablement ou faire des activités paisibles",
          ja: "リラックス、平和な活動",
          ko: "편안하게 쉬거나 평화로운 활동을 한다",
        },
        type: "type9",
        weight: 3,
      },
      {
        text: {
          zh: "进行创意或艺术表达",
          en: "Engage in creative or artistic expression",
          es: "Participar en expresiones creativas o artísticas",
          fr: "S'engager dans une expression créative ou artistique",
          ja: "創造的、芸術的表現",
          ko: "창의적인 표현이나 예술 활동을 한다",
        },
        type: "type4",
        weight: 3,
      },
    ],
    text: {
      zh: "闲暇时间，我通常...",
      en: "During my free time, I usually...",
      es: "En mi tiempo libre, suelo...",
      fr: "Pendant mon temps libre, je suis généralement...",
      ja: "自由時間、私は通常...",
      ko: "휴식 시간에 나는 주로...",
    },
  },
  {
    id: 11,
    options: [
      {
        text: {
          zh: "设定目标并领导团队",
          en: "Setting goals and leading the team",
          es: "Establecer metas y liderar el equipo",
          fr: "Fixer des objectifs et diriger l'équipe",
          ja: "目標設定、チームを率いる",
          ko: "목표를 설정하고 팀을 이끄는 리더",
        },
        type: "type3",
        weight: 3,
      },
      {
        text: {
          zh: "支持和帮助团队成员",
          en: "Supporting and helping team members",
          es: "Apoyar y ayudar a los miembros del equipo",
          fr: "Soutenir et aider les membres de l'équipe",
          ja: "チームメンバーをサポート、支援",
          ko: "팀원들을 지원하고 돕는 조력자",
        },
        type: "type2",
        weight: 3,
      },
      {
        text: {
          zh: "提供专业知识",
          en: "Providing specialized knowledge",
          es: "Proporcionar conocimientos especializados",
          fr: "Fournir des connaissances spécialisées",
          ja: "専門知識を提供",
          ko: "전문 지식을 제공하는 전문가",
        },
        type: "type5",
        weight: 3,
      },
      {
        text: {
          zh: "调解并创造和谐",
          en: "Mediating and creating harmony",
          es: "Mediar y crear armonía",
          fr: "Médiateur et créateur d'harmonie",
          ja: "仲裁、調和",
          ko: "중재하고 조화를 만드는 평화주의자",
        },
        type: "type9",
        weight: 3,
      },
    ],
    text: {
      zh: "在团队项目中，我的角色通常是...",
      en: "In team projects, my role is typically...",
      es: "En los proyectos de equipo, mi papel es normalmente...",
      fr: "Dans les projets d'équipe, mon rôle est généralement...",
      ja: "チームプロジェクトでの私の役割は通常...",
      ko: "팀 프로젝트에서 나의 역할은...",
    },
  },
  {
    id: 12,
    options: [
      {
        text: {
          zh: "道德正确且完美的生活",
          en: "A morally right and perfect life",
          es: "Una vida moralmente correcta y perfecta",
          fr: "Une vie moralement droite et parfaite",
          ja: "道徳的に正しく完璧な人生",
          ko: "도덕적으로 올바르고 완벽한 삶",
        },
        type: "type1",
        weight: 3,
      },
      {
        text: {
          zh: "充满各种体验的自由生活",
          en: "A free life full of diverse experiences",
          es: "Una vida libre llena de experiencias diversas",
          fr: "Une vie libre pleine d'expériences diverses",
          ja: "自由、多様な経験に満ちる人生",
          ko: "자유롭고 다양한 경험으로 가득한 삶",
        },
        type: "type7",
        weight: 3,
      },
      {
        text: {
          zh: "强大、独立且有影响力的生活",
          en: "A strong, independent, and influential life",
          es: "Una vida fuerte, independiente e influyente",
          fr: "Une vie forte, indépendante et influente",
          ja: "強く、独立した、影響力ある人生",
          ko: "강하고 독립적이며 영향력 있는 삶",
        },
        type: "type8",
        weight: 3,
      },
      {
        text: {
          zh: "真实而有意义的生活",
          en: "An authentic and meaningful life",
          es: "Una vida auténtica y significativa",
          fr: "Une vie authentique et pleine de sens",
          ja: "真正性、意味のある人生",
          ko: "진정성 있고 의미 있는 삶",
        },
        type: "type4",
        weight: 3,
      },
    ],
    text: {
      zh: "我的理想生活是...",
      en: "My ideal life would be...",
      es: "Mi vida ideal sería...",
      fr: "Ma vie idéale serait...",
      ja: "私の理想的な人生は...",
      ko: "나의 이상적인 삶은...",
    },
  },
];

export const ENNEAGRAM_TYPES: Record<EnneagramType, EnneagramTypeDetail> = {
  type1: {
    compatibility: {
      best: ["type2", "type7"],
      challenging: ["type4", "type8"],
      good: ["type3", "type5", "type6"],
    },
    coreMotivation: {
      zh: "道徳上的完美。",
      en: "To be morally perfect.",
      es: "Ser moralmente perfecto.",
      fr: "Être moralement parfait.",
      ja: "道徳的に完璧であること。",
      ko: "도덕적으로 완벽하기를 원함.",
    },
    description: {
      zh: "追求正义和道德。",
      en: "Pursues righteousness and morality.",
      es: "Busca la rectitud y la moralidad.",
      fr: "Poursuit la droiture et la moralité.",
      ja: "正義と道徳を追求します。",
      ko: "올바름과 도덕성을 추구합니다.",
    },
    subtitle: {
      zh: "原则和理想主义",
      en: "Principled and idealistic",
      es: "Idealista y con principios",
      fr: "Idéaliste et de principes",
      ja: "理想主義",
      ko: "원칭적이고 이상주의적인",
    },
    title: {
      zh: "完美主义者",
      en: "The Reformer",
      es: "El Reformador",
      fr: "Le Réformateur",
      ja: "改革者",
      ko: "완벽주의자",
    },
    triad: "gut",
  },
  type2: {
    compatibility: {
      best: ["type4", "type8"],
      challenging: ["type5", "type9"],
      good: ["type1", "type3", "type7"],
    },
    coreMotivation: {
      zh: "被爱和被需要。",
      en: "To be loved and needed.",
      es: "Ser amado y necesitado.",
      fr: "Être aimé et nécessaire.",
      ja: "愛され、必要とされること。",
      ko: "사랑받고 필요한 존재가 되기를 원함.",
    },
    description: {
      zh: "在帮助他人中找到快乐。",
      en: "Finds joy in helping others.",
      es: "Encuentra alegría en ayudar a los demás.",
      fr: "Trouve de la joie à aider les autres.",
      ja: "他者を助けることに喜びを見出します。",
      ko: "다른 사람을 돕는 것에서 기쁨을 찾습니다.",
    },
    subtitle: {
      zh: "热情和关心",
      en: "Warm and caring",
      es: "Cálido y cariñoso",
      fr: "Chaleureux et attentionné",
      ja: "温かく思いやりのある",
      ko: "따뜻하고 배려심 많은",
    },
    title: {
      zh: "助人者",
      en: "The Helper",
      es: "El Ayudador",
      fr: "L'Altruiste",
      ja: "助け手",
      ko: "조력자",
    },
    triad: "heart",
  },
  type3: {
    compatibility: {
      best: ["type6", "type9"],
      challenging: ["type4", "type5"],
      good: ["type1", "type2", "type7"],
    },
    coreMotivation: {
      zh: "成功并获得价值。",
      en: "To succeed and be valued.",
      es: "Tener éxito y ser valorado.",
      fr: "Réussir et être valorisé.",
      ja: "成功し、価値を認められること。",
      ko: "성공하고 가치 있게 인정받기를 원함.",
    },
    description: {
      zh: "追求成功和认可。",
      en: "Pursues success and recognition.",
      es: "Busca el éxito y el reconocimiento.",
      fr: "Poursuit le succès et la reconnaissance.",
      ja: "成功と承認を追求します。",
      ko: "성공과 인정을 추구합니다.",
    },
    subtitle: {
      zh: "目标导向和高效",
      en: "Goal-oriented and efficient",
      es: "Orientado a objetivos y eficiente",
      fr: "Axé sur les objectifs et efficace",
      ja: "目標志向で効率的",
      ko: "목표 지향적이고 효율적인",
    },
    title: {
      zh: "成就者",
      en: "The Achiever",
      es: "El Triunfador",
      fr: "Le Battant",
      ja: "達成者",
      ko: "성취자",
    },
    triad: "heart",
  },
  type4: {
    compatibility: {
      best: ["type1", "type5"],
      challenging: ["type3", "type8"],
      good: ["type2", "type7", "type9"],
    },
    coreMotivation: {
      zh: "发现真实的自我。",
      en: "To discover true self.",
      es: "Descubrir el verdadero yo.",
      fr: "Découvrir son vrai moi.",
      ja: "真実の自分を発見すること。",
      ko: "진정한 자신을 발견하기를 원함.",
    },
    description: {
      zh: "重视真实性和独特身份。",
      en: "Values authenticity and unique ontology.",
      es: "Valora la autenticidad y la identidad única.",
      fr: "Valorise l'authenticité et l'identité unique.",
      ja: "本物志向と独自のアイ덴티티를 重視합니다.",
      ko: "진정성과 독특한 정체성을 중요시합니다.",
    },
    subtitle: {
      zh: "富有创造力和敏感性",
      en: "Creative and sensitive",
      es: "Creativo y sensible",
      fr: "Créatif et sensible",
      ja: "創造的で感受性の豊かな",
      ko: "창의적이고 감성적인",
    },
    title: {
      zh: "艺术型",
      en: "The Individualist",
      es: "El Individualista",
      fr: "L'Individualiste",
      ja: "예술가",
      ko: "예술가",
    },
    triad: "heart",
  },
  type5: {
    compatibility: {
      best: ["type4", "type7"],
      challenging: ["type2", "type8"],
      good: ["type1", "type6", "type9"],
    },
    coreMotivation: {
      zh: "有能力和博学。",
      en: "To be capable and knowledgeable.",
      es: "Ser capaz y conocedor.",
      fr: "Être capable et savant.",
      ja: "能力があり、知識が豊富であること。",
      ko: "능력 있고 지식이 풍부하기를 원함.",
    },
    description: {
      zh: "追求知识和理解。",
      en: "Pursues knowledge and understanding.",
      es: "Busca el conocimiento y la comprensión.",
      fr: "Poursuit la connaissance et la compréhension.",
      ja: "知識と理解を追求します。",
      ko: "지식과 이해를 추구합니다.",
    },
    subtitle: {
      zh: "理智和敏锐",
      en: "Intellectual and insightful",
      es: "Intelectual y perspicaz",
      fr: "Intellectuel et perspicace",
      ja: "知的で洞察力のある",
      ko: "지적이고 통찰력 있는",
    },
    title: {
      zh: "理智型",
      en: "The Investigator",
      es: "El Investigador",
      fr: "L'Observateur",
      ja: "探究者",
      ko: "탐구자",
    },
    triad: "head",
  },
  type6: {
    compatibility: {
      best: ["type3", "type9"],
      challenging: ["type4", "type7"],
      good: ["type1", "type2", "type8"],
    },
    coreMotivation: {
      zh: "获得安全和支持 Marc.",
      en: "To have security and support.",
      es: "Tener seguridad y apoyo.",
      fr: "Avoir de la sécurité et du soutien.",
      ja: "安全とサポートを得ること Marc.",
      ko: "안전하고 지지받기를 원함.",
    },
    description: {
      zh: "寻求安全和确定性。",
      en: "Seek safety and certainty.",
      es: "Busca seguridad y certeza.",
      fr: "Recherche la sécurité et la certitude.",
      ja: "安全と確実性を追求します。",
      ko: "안전과 확실성을 추구합니다.",
    },
    subtitle: {
      zh: "负责和可靠",
      en: "Responsible and trustworthy",
      es: "Responsable y confiable",
      fr: "Responsable et digne de confiance",
      ja: "責任感があり信頼できる",
      ko: "책임감 있고 신뢰할 수 있는",
    },
    title: {
      zh: "忠诚型",
      en: "The Loyalist",
      es: "El Leal",
      fr: "Le Loyaliste",
      ja: "忠実家",
      ko: "충성가",
    },
    triad: "head",
  },
  type7: {
    compatibility: {
      best: ["type5", "type1"],
      challenging: ["type4", "type8"],
      good: ["type2", "type3", "type9"],
    },
    coreMotivation: {
      zh: "快乐和满足。",
      en: "To be happy and satisfied.",
      es: "Ser feliz y estar satisfecho.",
      fr: "Être heureux et satisfait.",
      ja: "幸せで満足すること。",
      ko: "행복하고 만족스럽기를 원함.",
    },
    description: {
      zh: "追求新体验和快乐生活 Marc.",
      en: "Pursues new experiences and joyful life.",
      es: "Busca nuevas experiencias y una vida alegre.",
      fr: "Poursuit de nouvelles expériences et une vie joyeuse.",
      ja: "新しい経験と楽しい人生を追求します。",
      ko: "새로운 경험과 즐거운 삶을 추구합니다.",
    },
    subtitle: {
      zh: "乐观和冒险",
      en: "Optimistic and adventurous",
      es: "Optimista y aventurero",
      fr: "Optimiste et aventureux",
      ja: "楽観的で冒険的な",
      ko: "낙관적이고 모험을 즐기는",
    },
    title: {
      zh: "活跃型",
      en: "The Enthusiast",
      es: "El Entusiasta",
      fr: "L'Épicurien",
      ja: "熱狂家",
      ko: "열정가",
    },
    triad: "head",
  },
  type8: {
    compatibility: {
      best: ["type2", "type9"],
      challenging: ["type1", "type5"],
      good: ["type3", "type6", "type7"],
    },
    coreMotivation: {
      zh: "强大和有影响力 Marc.",
      en: "To be strong and influential.",
      es: "Ser fuerte e influyente.",
      fr: "Être fort et influent.",
      ja: "強く、影響力があること Marc.",
      ko: "강하고 영향력 있기를 원함 Marc.",
    },
    description: {
      zh: "寻求控制和正义 Marc.",
      en: "Seek control and justice.",
      es: "Busca control y justicia.",
      fr: "Recherche le contrôle et la justice.",
      ja: "制御と正義を追求します Marc.",
      ko: "통제와 정의를 추구합니다.",
    },
    subtitle: {
      zh: "强大和自信 Marc.",
      en: "Powerful and confident",
      es: "Poderoso y seguro.",
      fr: "Puissant et confiant.",
      ja: "強力で自信のある Marc.",
      ko: "강력하고 자신감 있는",
    },
    title: {
      zh: "领袖型",
      en: "The Challenger",
      es: "El Desafiador",
      fr: "Le Chef",
      ja: "挑戦者",
      ko: "도전자",
    },
    triad: "gut",
  },
  type9: {
    compatibility: {
      best: ["type3", "type6", "type8"],
      challenging: ["type8", "type1"],
      good: ["type2", "type7", "type4"],
    },
    coreMotivation: {
      zh: "拥有和平与和谐 Marc.",
      en: "To have peace and harmony.",
      es: "Tener paz y armonía.",
      fr: "Avoir la paix et l'harmonie.",
      ja: "平和で調和していること Marc.",
      ko: "평화롭고 조화롭기를 원함 Marc.",
    },
    description: {
      zh: "避免冲突并寻求内在和平 Marc.",
      en: "Avoid conflict and seek inner peace.",
      es: "Evita el conflicto y busca la paz interior.",
      fr: "Évite les conflits et recherche la paix intérieure.",
      ja: "葛藤を避け、内面的な平和を追求します Marc.",
      ko: "갈등을 회피하고 내적 평화를 추구합니다.",
    },
    subtitle: {
      zh: "和平和和谐 Marc.",
      en: "Peaceful and harmony-seeking",
      es: "Pacífico y en busca de armonía.",
      fr: "Paisible et en quête d'harmonie.",
      ja: "平和的で調和を求める Marc.",
      ko: "평화롭고 조화를 추구하는",
    },
    title: {
      zh: "和平型",
      en: "The Peacemaker",
      es: "El Pacificador",
      fr: "Le Médiateur",
      ja: "平和主義者",
      ko: "평화주의자",
    },
    triad: "gut",
  },
};

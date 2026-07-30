import type { LocalizedText } from "@/types/manifest";

import type { BalanceCategoryKey } from "./types";

export interface BalanceQuestion {
  category: BalanceCategoryKey;
  id: string;
  options: {
    id: string;
    score: number; // 0-100? Or 1-5 mapped to 20,40,60,80,100
    text: LocalizedText;
  }[];
  text: LocalizedText;
}

const scaleOptions = (
  localeKey: string,
): { id: string; score: number; text: LocalizedText }[] => [
  {
    id: "1",
    score: 20,
    text: {
      cn: "非常不满意",
      en: "Very Dissatisfied",
      es: "Muy insatisfecho",
      fr: "Très insatisfait",
      ja: "非常に不満",
      ko: "매우 불만족",
    },
  },
  {
    id: "2",
    score: 40,
    text: {
      cn: "不满意",
      en: "Dissatisfied",
      es: "Insatisfecho",
      fr: "Insatisfait",
      ja: "不満",
      ko: "불만족",
    },
  },
  {
    id: "3",
    score: 60,
    text: {
      cn: "一般",
      en: "Neutral",
      es: "Neutral",
      fr: "Neutre",
      ja: "どちらでもない",
      ko: "보통",
    },
  },
  {
    id: "4",
    score: 80,
    text: {
      cn: "满意",
      en: "Satisfied",
      es: "Satisfecho",
      fr: "Satisfait",
      ja: "満足",
      ko: "만족",
    },
  },
  {
    id: "5",
    score: 100,
    text: {
      cn: "非常满意",
      en: "Very Satisfied",
      es: "Muy satisfecho",
      fr: "Très satisfait",
      ja: "非常に満足",
      ko: "매우 만족",
    },
  },
];

export const BALANCE_QUESTIONS: BalanceQuestion[] = [
  // Health
  {
    category: "health",
    id: "health_1",
    options: scaleOptions("energy"),
    text: {
      en: "How do you feel about your energy levels throughout the day?",
      es: "¿Cómo te sientes con respecto a tus niveles de energía durante el día?",
      fr: "Que pensez-vous de votre niveau d'énergie tout au long de la journée ?",
      ja: "一日を通した自分のエネルギーレベルについてどう感じていますか？",
      ko: "하루 동안의 에너지 수준에 대해 어떻게 느끼시나요?",
      zh: "你如何看待自己一整天的精力水平？",
    },
  },
  {
    category: "health",
    id: "health_2",
    options: scaleOptions("fitness"),
    text: {
      en: "Are you satisfied with your physical fitness and diet?",
      es: "¿Estás satisfecho con tu condición física y tu alimentación?",
      fr: "Êtes-vous satisfait de votre forme physique et de votre alimentation ?",
      ja: "自分の体力や食生活に満足していますか？",
      ko: "당신의 신체 건강 상태와 식단에 만족하시나요?",
      zh: "你对自己的身体状态和饮食满意吗？",
    },
  },

  // Relationships
  {
    category: "relationships",
    id: "rel_1",
    options: scaleOptions("connect"),
    text: {
      en: "How connected do you feel to your family and friends?",
      es: "¿Qué tan conectado te sientes con tu familia y tus amigos?",
      fr: "À quel point vous sentez-vous connecté à votre famille et à vos amis ?",
      ja: "家族や友人とのつながりをどのくらい感じていますか？",
      ko: "가족 및 친구들과 얼마나 깊이 연결되어 있다고 느끼시나요?",
      zh: "你觉得自己与家人和朋友的联系有多紧密？",
    },
  },
  {
    category: "relationships",
    id: "rel_2",
    options: scaleOptions("romantic"),
    text: {
      en: "Are your romantic or close relationships fulfilling?",
      es: "¿Tus relaciones románticas o cercanas te resultan satisfactorias?",
      fr: "Vos relations amoureuses ou proches sont-elles épanouissantes ?",
      ja: "恋愛関係や親しい人間関係に充実感がありますか？",
      ko: "당신의 연애나 가까운 인간관계가 충만하다고 느끼시나요?",
      zh: "你的恋爱关系或亲密关系让你感到充实吗？",
    },
  },

  // Career
  {
    category: "career",
    id: "car_1",
    options: scaleOptions("meaning"),
    text: {
      en: "Do you find meaning and purpose in your daily work?",
      es: "¿Encuentras significado y propósito en tu trabajo diario?",
      fr: "Trouvez-vous du sens et un objectif dans votre travail quotidien ?",
      ja: "日々の仕事に意味や目的を見出していますか？",
      ko: "매일의 업무에서 의미와 목적을 찾고 계신가요?",
      zh: "你能在日常工作中找到意义和目标吗？",
    },
  },
  {
    category: "career",
    id: "car_2",
    options: scaleOptions("growth"),
    text: {
      en: "Are you satisfied with your professional growth and trajectory?",
      es: "¿Estás satisfecho con tu crecimiento profesional y tu trayectoria?",
      fr: "Êtes-vous satisfait de votre évolution professionnelle et de votre trajectoire ?",
      ja: "自分の職業的な成長や進路に満足していますか？",
      ko: "당신의 직업적 성장과 경로에 만족하시나요?",
      zh: "你对自己的职业成长和发展轨迹满意吗？",
    },
  },

  // Finance
  {
    category: "finance",
    id: "fin_1",
    options: scaleOptions("secure"),
    text: {
      en: "How secure do you feel about your current financial situation?",
      es: "¿Qué tan seguro te sientes con respecto a tu situación financiera actual?",
      fr: "Dans quelle mesure vous sentez-vous en sécurité par rapport à votre situation financière actuelle ?",
      ja: "現在の経済状況について、どのくらい安心感がありますか？",
      ko: "현재 재정 상태에 대해 얼마나 안정감을 느끼시나요?",
      zh: "你对目前的财务状况有多大的安全感？",
    },
  },
  {
    category: "finance",
    id: "fin_2",
    options: scaleOptions("plans"),
    text: {
      en: "Are you sticking to your financial plans and savings goals?",
      es: "¿Estás siguiendo tus planes financieros y tus metas de ahorro?",
      fr: "Respectez-vous vos plans financiers et vos objectifs d'épargne ?",
      ja: "財務計画や貯蓄目標を守れていますか？",
      ko: "저축 목표와 재정 계획을 잘 지키고 계신가요?",
      zh: "你是否在坚持自己的财务计划和储蓄目标？",
    },
  },

  // Personal
  {
    category: "personal",
    id: "per_1",
    options: scaleOptions("learning"),
    text: {
      en: "Are you consistently learning new things or growing as a person?",
      es: "¿Estás aprendiendo cosas nuevas de forma constante o creciendo como persona?",
      fr: "Apprenez-vous régulièrement de nouvelles choses ou évoluez-vous en tant que personne ?",
      ja: "継続的に新しいことを学んだり、人として成長したりしていますか？",
      ko: "지속적으로 새로운 것을 배우거나 성장하고 계신가요?",
      zh: "你是否持续学习新事物，或作为一个人不断成长？",
    },
  },
  {
    category: "personal",
    id: "per_2",
    options: scaleOptions("hobbies"),
    text: {
      en: "Do you make enough time for your hobbies and interests?",
      es: "¿Dedicas suficiente tiempo a tus pasatiempos e intereses?",
      fr: "Consacrez-vous assez de temps à vos loisirs et à vos centres d'intérêt ?",
      ja: "趣味や関心ごとのために十分な時間を作れていますか？",
      ko: "취미와 관심사를 위한 시간을 충분히 갖고 계신가요?",
      zh: "你是否为自己的爱好和兴趣留出了足够的时间？",
    },
  },

  // Environment
  {
    category: "environment",
    id: "env_1",
    options: scaleOptions("home"),
    text: {
      en: "Does your home environment bring you peace and comfort?",
      es: "¿Tu entorno doméstico te aporta paz y comodidad?",
      fr: "Votre environnement domestique vous apporte-t-il paix et confort ?",
      ja: "自宅の環境はあなたに安らぎや快適さをもたらしていますか？",
      ko: "당신의 집 환경은 평화와 편안함을 주나요?",
      zh: "你的居住环境能带给你平静和舒适吗？",
    },
  },
  {
    category: "environment",
    id: "env_2",
    options: scaleOptions("area"),
    text: {
      en: "Are you satisfied with the area or city you live in?",
      es: "¿Estás satisfecho con la zona o ciudad donde vives?",
      fr: "Êtes-vous satisfait du quartier ou de la ville où vous vivez ?",
      ja: "自分が住んでいる地域や都市に満足していますか？",
      ko: "당신이 사는 지역이나 도시에 만족하시나요?",
      zh: "你对自己居住的地区或城市满意吗？",
    },
  },

  // Fun
  {
    category: "fun",
    id: "fun_1",
    options: scaleOptions("laugh"),
    text: {
      en: "How often do you laugh or have fun purely for enjoyment?",
      es: "¿Con qué frecuencia ríes o te diviertes simplemente por disfrutar?",
      fr: "À quelle fréquence riez-vous ou vous amusez-vous uniquement pour le plaisir ?",
      ja: "純粋に楽しむために笑ったり遊んだりすることはどのくらいありますか？",
      ko: "순수한 즐거움을 위해 웃거나 노는 시간이 얼마나 되나요?",
      zh: "你多久会为了单纯的快乐而大笑或玩乐？",
    },
  },
  {
    category: "fun",
    id: "fun_2",
    options: scaleOptions("leisure"),
    text: {
      en: "Are you satisfied with your work-life balance and leisure time?",
      es: "¿Estás satisfecho con tu equilibrio entre trabajo y vida personal y con tu tiempo libre?",
      fr: "Êtes-vous satisfait de votre équilibre entre vie professionnelle et vie personnelle et de votre temps libre ?",
      ja: "仕事と生活のバランスや余暇の時間に満足していますか？",
      ko: "일과 삶의 균형, 그리고 여가 시간에 만족하시나요?",
      zh: "你对自己的工作与生活平衡以及休闲时间满意吗？",
    },
  },

  // Contribution
  {
    category: "contribution",
    id: "con_1",
    options: scaleOptions("impact"),
    text: {
      en: "Do you feel you are making a positive impact on others?",
      es: "¿Sientes que estás generando un impacto positivo en los demás?",
      fr: "Avez-vous le sentiment d'avoir un impact positif sur les autres ?",
      ja: "他の人に良い影響を与えていると感じていますか？",
      ko: "타인에게 긍정적인 영향을 주고 있다고 느끼시나요?",
      zh: "你觉得自己正在对他人产生积极影响吗？",
    },
  },
  {
    category: "contribution",
    id: "con_2",
    options: scaleOptions("service"),
    text: {
      en: "Are you involved in any community service or helping activities?",
      es: "¿Participas en algún servicio comunitario o actividad de ayuda?",
      fr: "Participez-vous à des actions communautaires ou à des activités d'aide ?",
      ja: "地域奉仕や誰かを助ける活動に参加していますか？",
      ko: "지역 사회 봉사나 돕는 활동에 참여하고 계신가요?",
      zh: "你是否参与任何社区服务或帮助他人的活动？",
    },
  },
];

/**
 * Enhanced Level System for Achievement Platform
 * Comprehensive leveling with Korean cultural elements
 */

export interface LevelingStats {
  averageLevel: number;
  levelDistribution: Record<number, number>;
  topLevels: Array<{
    level: number;
    prestigeLevel?: number;
    sessionId?: string;
    totalXP: number;
    userId?: string;
  }>;
  totalUsers: number;
}

import type { Locale } from "@/i18n";

export interface LevelPerk {
  description: Record<Locale, string>;
  id: string;
  name: Record<Locale, string>;
  type: "bonus" | "cosmetic" | "feature" | "unlock";
  value?: number | string;
}

export interface LevelTier {
  badge: string;
  category:
    | "advanced"
    | "beginner"
    | "expert"
    | "intermediate"
    | "legend"
    | "master";
  color: string;
  glowColor: string;
  level: number;
  perks: LevelPerk[];
  requiredXP: number;
  title: LevelTitle;
}

export interface LevelTitle {
  cultural?: {
    meaning: string;
    reference: string; // 문화적 참조 (예: 조선시대 관직, 무예 단계 등)
  };
  description: Record<Locale, string>;
  name: Record<Locale, string>;
}

export interface UserLevel {
  badge: string;
  currentXP: number;
  level: number;
  perks: LevelPerk[];
  prestige?: number; // For levels beyond max
  title: LevelTitle;
  totalXP: number;
  xpToNextLevel: number;
}

export interface XPSource {
  baseXP: number;
  description: Record<Locale, string>;
  maxDaily?: number;
  multiplier?: number;
  source: string;
}

// Korean-inspired Level Titles (조선시대 관직 + 현대적 해석)
export const LEVEL_TITLES: LevelTitle[] = [
  // Levels 1-10: 입문자 (Beginner)
  {
    description: {
      zh: "踏入性格世界第一步的探险家",
      en: "A newcomer taking first steps into the world of personality",
      es: "Un recién llegado que da sus primeros pasos en el mundo de la personalidad",
      fr: "Un nouveau venu faisant ses premiers pas dans le monde de la personnalité",
      ja: "性格の世界への第一歩を踏み出したエクスプローラー",
      ko: "성격의 세계에 첫 발을 내딛은 탐험가",
    },
    name: {
      zh: "性格探险家",
      en: "Personality Explorer",
      es: "Explorador de Personalidad",
      fr: "Explorateur de Personnalité",
      ja: "性格エクスプローラー",
      ko: "성격 탐험가",
    },
  },
  {
    description: {
      zh: "开启寻找自我之旅的人",
      en: "One who has begun the journey of self-discovery",
      es: "Alguien que ha comenzado el viaje del autodescubrimiento",
      fr: "Quelqu'un qui a commencé le voyage de la découverte de soi",
      ja: "自分の本当の姿を探す旅を始めた人",
      ko: "자신의 모습을 찾아가는 여정을 시작한 사람",
    },
    name: {
      zh: "自我发现者",
      en: "Self Discoverer",
      es: "Descubridor de Sí Mismo",
      fr: "Découvreur de Soi",
      ja: "自己発見者",
      ko: "자아 발견자",
    },
  },
  {
    description: {
      zh: "开始阅读心灵语言的初学者",
      en: "A beginner who starts to read the language of the mind",
      es: "Un principiante que comienza a leer el lenguaje de la mente",
      fr: "Un débutant qui commence à lire le langage de l'esprit",
      ja: "心の言語を読み始めた初心者",
      ko: "마음의 언어를 읽기 시작한 초심자",
    },
    name: {
      zh: "心灵读者",
      en: "Mind Reader",
      es: "Lector de Mentes",
      fr: "Lecteur d'Esprit",
      ja: "心の読書家",
      ko: "마음 독서가",
    },
  },
  {
    cultural: {
      meaning: "전통 교육기관에서 배우는 학생",
      reference: "서당 학동",
    },
    description: {
      zh: "积极学习性格理论的学生",
      en: "An eager student learning personality theories",
      es: "Un estudiante entusiasta que aprende teorías de personalidad",
      fr: "Un étudiant enthousiaste apprenant les théories de la personnalité",
      ja: "性格理論を熱心に学ぶ学生",
      ko: "성격 이론을 배워가는 열성적인 학생",
    },
    name: {
      zh: "性格学子",
      en: "Personality Student",
      es: "Estudiante de Personalidad",
      fr: "Étudiant en Personnalité",
      ja: "性格学徒",
      ko: "성향 학도",
    },
  },
  {
    description: {
      zh: "正在打好心理学基础的学徒",
      en: "An apprentice building foundations in psychology",
      es: "Un aprendiz que construye las bases de la psicología",
      fr: "Un apprenti établissant les bases de la psychologie",
      ja: "心理学の基礎を築いている見習い",
      ko: "심리학의 기초를 닦아가는 견습생",
    },
    name: {
      zh: "心理学徒",
      en: "Psychology Apprentice",
      es: "Aprendiz de Psicología",
      fr: "Apprenti en Psychologie",
      ja: "心理見習い",
      ko: "심리 견습생",
    },
  },

  // Levels 5-15: 중급자 (Intermediate)
  {
    description: {
      zh: "能够分析性格模式的中级者",
      en: "An intermediate who can analyze personality patterns",
      es: "Un intermedio que puede analizar patrones de personalidad",
      fr: "Un intermédiaire capable d'analyser les schémas de personnalité",
      ja: "性格のパターンを分析できる中級者",
      ko: "성격의 패턴을 분석할 수 있는 중급자",
    },
    name: {
      zh: "性格分析师",
      en: "Personality Analyst",
      es: "Analista de Personalidad",
      fr: "Analyste de Personnalité",
      ja: "性格分析家",
      ko: "성격 분석가",
    },
  },
  {
    description: {
      zh: "能够解释复杂心理结构的人",
      en: "One capable of interpreting complex mind structures",
      es: "Alguien capaz de interpretar estructuras mentales complejas",
      fr: "Quelqu'un capable d'interpréter des structures mentales complexes",
      ja: "複雑な心の構造を解釈できる能力者",
      ko: "복잡한 마음의 구조를 해석하는 능력자",
    },
    name: {
      zh: "心灵解释者",
      en: "Mind Interpreter",
      es: "Intérprete de Mentes",
      fr: "Interprète d'Esprit",
      ja: "心の解釈者",
      ko: "마음 해석자",
    },
  },
  {
    description: {
      zh: "系统研究人格和性格的专家",
      en: "A specialist systematically studying character and personality",
      es: "Un especialista que estudia sistemáticamente el carácter y la personalidad",
      fr: "Un spécialiste étudiant systématiquement le caractère et la personnalité",
      ja: "人格と性格を体系的に研究する専門家",
      ko: "인성과 성격을 체계적으로 연구하는 전문가",
    },
    name: {
      zh: "人格研究员",
      en: "Character Researcher",
      es: "Investigador de Carácter",
      fr: "Chercheur en Caractère",
      ja: "人格研究員",
      ko: "인성 연구원",
    },
  },
  {
    cultural: {
      meaning: "학문과 도덕을 중시하는 지식인",
      reference: "조선 선비",
    },
    description: {
      zh: "了解他人心性并提供建议的咨询师",
      en: "A counselor who understands and advises on others' personalities",
      es: "Un consejero que entiende y aconseja sobre las personalidades de los demás",
      fr: "Un conseiller qui comprend et conseille sur les personnalités des autres",
      ja: "他人の心性を理解し助言するカウンセラー",
      ko: "다른 사람의 심성을 이해하고 조언하는 상담사",
    },
    name: {
      zh: "心性咨询师",
      en: "Personality Counselor",
      es: "Consejero de Personalidad",
      fr: "Conseiller en Personnalité",
      ja: "心性相談士",
      ko: "심성 상담사",
    },
  },
  {
    description: {
      zh: "在性格研究领域具有专业知识 walls 的专家",
      en: "A specialist with professional knowledge in personality studies",
      es: "Un especialista con conocimientos profesionales en estudios de personalidad",
      fr: "Un spécialiste ayant des connaissances professionnelles en études de la personnalité",
      ja: "性格分野の専門的知識を備えた専門家",
      ko: "성격 분야의 전문적 지식을 갖춘 전문가",
    },
    name: {
      zh: "性格专家",
      en: "Personality Specialist",
      es: "Especialista en Personalidad",
      fr: "Spécialiste en Personnalité",
      ja: "性格専門家",
      ko: "성격 전문가",
    },
  },

  // Levels 15-25: 고급자 (Advanced)
  {
    description: {
      zh: "达到心理学深厚境界的高手",
      en: "A master who has reached deep levels of psychological understanding",
      es: "Un maestro que ha alcanzado niveles profundos de comprensión psicológica",
      fr: "Un maître qui a atteint des niveaux profonds de compréhension psychologique",
      ja: "心理学の深い境地に達した達人",
      ko: "심리학의 깊은 경지에 이른 고수",
    },
    name: {
      zh: "心理高手",
      en: "Psychology Master",
      es: "Maestro de la Psicología",
      fr: "Maître en Psychologie",
      ja: "心理の達人",
      ko: "심리 고수",
    },
  },
  {
    cultural: {
      meaning: "높은 학문적 성취를 이룬 대학자",
      reference: "조선 대학자",
    },
    description: {
      zh: "深入了解人性本持的贤者",
      en: "A sage with deep understanding of human nature",
      es: "Un sabio con una profunda comprensión de la naturaleza humana",
      fr: "Un sage ayant une profonde compréhension de la nature humaine",
      ja: "人間の本性を深く理解する賢者",
      ko: "인간 본성을 깊이 이해하는 현자",
    },
    name: {
      zh: "人类理解贤者",
      en: "Human Understanding Sage",
      es: "Sabio de la Comprensión Humana",
      fr: "Sage de la Compréhension Humaine",
      ja: "人間理解の賢者",
      ko: "인간 이해자",
    },
  },
  {
    description: {
      zh: "洞察性格方方面面的贤者",
      en: "A sage who sees through all aspects of personality",
      es: "Un sabio que ve a través de todos los aspectos de la personalidad",
      fr: "Un sage qui voit à travers tous les aspects de la personnalité",
      ja: "性格のすべての面を見通す賢者",
      ko: "성격의 모든 면을 꿰뚫어 보는 현자",
    },
    name: {
      zh: "性格贤者",
      en: "Personality Sage",
      es: "Sabio de la Personalidad",
      fr: "Sage de la Personnalité",
      ja: "性格の賢者",
      ko: "성격 현자",
    },
  },
  {
    description: {
      zh: "向他人传授心灵智慧的导师",
      en: "A teacher who imparts wisdom of the mind to others",
      es: "Un maestro que imparte sabiduría de la mente a los demás",
      fr: "Un maître qui transmet la sagesse de l'esprit aux autres",
      ja: "他人に心の知恵を伝える師",
      ko: "다른 이들에게 마음의 지혜를 전하는 스승",
    },
    name: {
      zh: "心灵导师",
      en: "Mind Teacher",
      es: "Maestro de la Mente",
      fr: "Maître de l'Esprit",
      ja: "心の師",
      ko: "마음 스승",
    },
  },
  {
    description: {
      zh: "在心理学领域被公认为大师的人物",
      en: "A recognized grandmaster in the field of psychology",
      es: "Un gran maestro reconocido en el campo de la psicología",
      fr: "Un grand maître reconnu dans le domaine de la psychologie",
      ja: "心理学の分野で大家として認められた人物",
      ko: "심리학 분야의 대가로 인정받는 인물",
    },
    name: {
      zh: "心理大家",
      en: "Psychology Grandmaster",
      es: "Gran Maestro de la Psicología",
      fr: "Grand Maître en Psychologie",
      ja: "心理の大家",
      ko: "심리 대가",
    },
  },
  {
    description: {
      zh: "对人格有深刻哲学洞察的思想家",
      en: "A philosopher with deep insights into human character",
      es: "Un filósofo con profundos conocimientos sobre el carácter humano",
      fr: "Un philosophe ayant des connaissances approfondies sur le caractère humain",
      ja: "人格についての哲学的洞察を持つ思想家",
      ko: "인성에 대한 철학적 통찰을 가진 사상가",
    },
    name: {
      zh: "人格哲学家",
      en: "Character Philosopher",
      es: "Filósofo del Carácter",
      fr: "Philosophe du Caractère",
      ja: "人格哲学者",
      ko: "인성 철학자",
    },
  },
  {
    cultural: {
      meaning: "역사를 기록하고 편찬하는 관리",
      reference: "조선 정사편찬관",
    },
    description: {
      zh: "了解性格类型历史和演变的历史学家",
      en: "A historian who knows the history and evolution of personality types",
      es: "Un historiador que conoce la historia y la evolución de los tipos de personalidad",
      fr: "Un historien qui connaît l'histoire et l'évolution des types de personnalité",
      ja: "性格タイプの歴史と変遷を知る歴史家",
      ko: "성격 유형의 역사와 변천을 아는 정서사",
    },
    name: {
      zh: "性格历史学家",
      en: "Personality Historian",
      es: "Historiador de la Personalidad",
      fr: "Historien de la Personnalité",
      ja: "性格歴史家",
      ko: "성격 정서사",
    },
  },
  {
    description: {
      zh: "洞悉心灵奥秘的道士境界",
      en: "A sage who penetrates the mysteries of the mind",
      es: "Un sabio que penetra los misterios de la mente",
      fr: "Un sage qui pénètre les mystères de l'esprit",
      ja: "心の神秘を貫く道士の境地",
      ko: "마음의 신비를 꿰뚫는 도인의 경지",
    },
    name: {
      zh: "心性道士",
      en: "Mind Sage",
      es: "Sabio de la Mente",
      fr: "Sage de l'Esprit",
      ja: "心性の道士",
      ko: "심성 도사",
    },
  },
  {
    description: {
      zh: "对人性具有完全洞察力的大师",
      en: "A master with complete insight into human nature",
      es: "Un maestro con una visión completa de la naturaleza humana",
      fr: "Un maître ayant une vision complète de la nature humaine",
      ja: "人間の本性に対する完全な洞察力を持つ大家",
      ko: "인간 본성에 대한 완전한 통찰력을 가진 대가",
    },
    name: {
      zh: "人类洞察大师",
      en: "Human Insight Master",
      es: "Maestro de la Perspicacia Humana",
      fr: "Maître de l'Intuition Humaine",
      ja: "人間洞察の大家",
      ko: "인간 통찰자",
    },
  },
  {
    description: {
      zh: "达到性格领域最高境界的宗师",
      en: "A grandmaster who has reached the highest level in personality studies",
      es: "Un gran maestro que ha alcanzado el nivel más alto en estudios de personalidad",
      fr: "Un grand maître ayant atteint le plus haut niveau dans les études de la personnalité",
      ja: "性格分野の最高境地に達した宗師",
      ko: "성격 분야의 최고 경지에 이른 종사",
    },
    name: {
      zh: "性格宗师",
      en: "Personality Grandmaster",
      es: "Gran Maestro de la Personalidad",
      fr: "Grand Maître de la Personnalité",
      ja: "性格の宗師",
      ko: "성격 종사",
    },
  },
  {
    cultural: {
      meaning: "도를 깨우쳐 초월한 경지의 인물",
      reference: "도교 선인",
    },
    description: {
      zh: "体悟心理学真理的仙人",
      en: "An immortal sage who has embodied the truth of psychology",
      es: "Un sabio inmortal que ha encarnado la verdad de la psicología",
      fr: "Un sage immortel qui a incarné la vérité de la psychologie",
      ja: "心理学の真理を体得した仙人",
      ko: "심리학의 진리를 체득한 선인",
    },
    name: {
      zh: "心理仙人",
      en: "Psychology Sage Immortal",
      es: "Inmortal Sabio de la Psicología",
      fr: "Sage Immortel de la Psychologie",
      ja: "心理の仙人",
      ko: "심리 선인",
    },
  },
  {
    description: {
      zh: "达到人格完美的圣人",
      en: "A saint who has achieved perfection in character understanding",
      es: "Un santo que ha alcanzado la perfección en la comprensión del carácter",
      fr: "Un saint ayant atteint la perfection dans la compréhension du caractère",
      ja: "人格の完成に達した聖人",
      ko: "인성의 완전함에 이른 성인",
    },
    name: {
      zh: "人格圣人",
      en: "Character Saint",
      es: "Santo del Carácter",
      fr: "Saint du Caractère",
      ja: "人格の聖人",
      ko: "인성 성인",
    },
  },
  {
    description: {
      zh: "悟透心灵所有秘密的道人",
      en: "An enlightened one who has realized all secrets of the mind",
      es: "Un iluminado que ha realizado todos los secretos de la mente",
      fr: "Un éveillé qui a réalisé tous les secrets de l'esprit",
      ja: "心のすべての秘密を悟った道人",
      ko: "마음의 모든 비밀을 깨달은 도인",
    },
    name: {
      zh: "心灵道人",
      en: "Mind Enlightened One",
      es: "Iluminado de la Mente",
      fr: "Éveillé de l'Esprit",
      ja: "心の道人",
      ko: "마음 도인",
    },
  },
  {
    description: {
      zh: "成为性格领域传说的永恒存在",
      en: "An immortal being who has become a legend in personality studies",
      es: "Un ser inmortal que se ha convertido en leyenda en los estudios de personalidad",
      fr: "Un être immortel devenu une légende dans les études de la personnalité",
      ja: "性格分野の伝説となった不滅の存在",
      ko: "성격 분야의 전설이 된 불멸의 존재",
    },
    name: {
      zh: "性格传说",
      en: "Personality Legend",
      es: "Leyenda de la Personalidad",
      fr: "Légende de la Personnalité",
      ja: "性格の伝説",
      ko: "성격 전설",
    },
  },
  {
    description: {
      zh: "在宇宙层面理解心理的终极存在",
      en: "The ultimate being who understands psychology on a cosmic scale",
      es: "El ser definitivo que entiende la psicología a escala cósmica",
      fr: "L'être ultime qui comprend la psychologie à l'échelle cosmique",
      ja: "宇宙的次元で心理を理解する究極の存在",
      ko: "우주적 차원에서 심리를 이해하는 궁극의 존재",
    },
    name: {
      zh: "宇宙心理师",
      en: "Cosmic Psychologist",
      es: "Psicólogo Cósmico",
      fr: "Psychologue Cosmique",
      ja: "宇宙心理士",
      ko: "우주 심리사",
    },
  },
];

// Level Perks that unlock at specific levels
export const LEVEL_PERKS: Record<number, LevelPerk[]> = {
  2: [
    {
      description: {
        zh: "分享结果时获得额外XP",
        en: "Gain bonus XP when sharing results",
        es: "Gana XP de bonificación al compartir resultados",
        fr: "Gagnez des XP bonus lors du partage des résultats",
        ja: "結果をシェアすると追加XPを獲得",
        ko: "결과 공유 시 추가 XP 획득",
      },
      id: "share_bonus",
      name: {
        zh: "分享奖金",
        en: "Share Bonus",
        es: "Bono por Compartir",
        fr: "Bonus de Partage",
        ja: "シェアボーナス",
        ko: "공유 보너스",
      },
      type: "bonus",
      value: "10%",
    },
  ],

  5: [
    {
      description: {
        zh: "提供更详细的性格分析结果",
        en: "Access to more detailed personality analysis",
        es: "Acceso a un análisis de personalidad más detallado",
        fr: "Accès à une analyse de personnalité plus détaillée",
        ja: "より詳細な性格分析結果を提供",
        ko: "더 자세한 성격 분석 결과 제공",
      },
      id: "detailed_analysis",
      name: {
        zh: "详细分析",
        en: "Detailed Analysis",
        es: "Análisis Detallado",
        fr: "Analyse Détaillée",
        ja: "詳細分析",
        ko: "상세 분석",
      },
      type: "feature",
    },
  ],

  10: [
    {
      description: {
        zh: "与他人的性格比较功能",
        en: "Personality comparison tool with others",
        es: "Herramienta de comparación de personalidad con otros",
        fr: "Outil de comparaison de personnalité avec d'autres",
        ja: "他人との性格比較機能",
        ko: "다른 사람과의 성격 비교 기능",
      },
      id: "comparison_tool",
      name: {
        zh: "比较工具",
        en: "Comparison Tool",
        es: "Herramienta de Comparación",
        fr: "Outil de Comparaison",
        ja: "比較ツール",
        ko: "비교 도구",
      },
      type: "unlock",
    },
  ],

  15: [
    {
      description: {
        zh: "获取性格趋势和统计信息",
        en: "Access to personality trends and statistics",
        es: "Acceso a tendencias y estadísticas de personalidad",
        fr: "Accès aux tendances et statistiques de personnalité",
        ja: "性格トレンドおよび統計情報へのアクセス",
        ko: "성격 트렌드 및 통계 정보 접근",
      },
      id: "trend_insights",
      name: {
        zh: "趋势洞察",
        en: "Trend Insights",
        es: "Perspectivas de Tendencia",
        fr: "Aperçus des Tendances",
        ja: "トレンドインサイト",
        ko: "트렌드 인사이트",
      },
      type: "feature",
    },
  ],

  20: [
    {
      description: {
        zh: "设置个性化徽章和标题",
        en: "Customize personal badges and titles",
        es: "Personalizar insignias y títulos personales",
        fr: "Personnaliser les badges et titres personnels",
        ja: "パーソナライズされたバッジとタイトルの設定",
        ko: "개인화된 배지 및 타이틀 설정",
      },
      id: "custom_badges",
      name: {
        zh: "自定义徽章",
        en: "Custom Badges",
        es: "Insignias Personalizadas",
        fr: "Badges Personnalisés",
        ja: "カスタムバッジ",
        ko: "커스텀 배지",
      },
      type: "cosmetic",
    },
  ],

  25: [
    {
      description: {
        zh: "能够向其他用户提供建议",
        en: "Ability to provide advice to other users",
        es: "Capacidad de brindar consejos a otros usuarios",
        fr: "Capacité à fournir des conseils aux autres utilisateurs",
        ja: "他のユーザーにアドバイスを提供可能",
        ko: "다른 사용자에게 조언 제공 가능",
      },
      id: "mentor_status",
      name: {
        zh: "导师资格",
        en: "Mentor Status",
        es: "Estado de Mentor",
        fr: "Statut de Mentor",
        ja: "メンター資格",
        ko: "멘토 자격",
      },
      type: "unlock",
    },
  ],

  30: [
    {
      description: {
        zh: "基于AI的个性化分析服务",
        en: "AI-powered personalized analysis service",
        es: "Servicio de análisis personalizado basado en IA",
        fr: "Service d'analyse personnalisée alimenté par l'IA",
        ja: "AIベースのパーソナライズされた分析サービス",
        ko: "AI 기반 개인화 분석 서비스",
      },
      id: "advanced_ai",
      name: {
        zh: "高级AI分析",
        en: "Advanced AI Analysis",
        es: "Análisis de IA Avanzado",
        fr: "Analyse IA Avancée",
        ja: "高度なAI分析",
        ko: "고급 AI 분석",
      },
      type: "feature",
    },
  ],

  35: [
    {
      description: {
        zh: "在社区中获得传奇地位",
        en: "Achieve legendary status in the community",
        es: "Lograr el estado de leyenda en la comunidad",
        fr: "Atteindre un statut légendaire dans la communauté",
        ja: "コミュニティで伝説的なステータスを獲得",
        ko: "커뮤니티에서 전설적 지위 획득",
      },
      id: "legend_status",
      name: {
        zh: "传奇地位",
        en: "Legend Status",
        es: "Estado de Leyenda",
        fr: "Statut de Légende",
        ja: "伝説のステータス",
        ko: "전설 지위",
      },
      type: "cosmetic",
    },
  ],

  40: [
    {
      description: {
        zh: "访问最深层性格分析",
        en: "Access to the deepest level of personality analysis",
        es: "Acceso al nivel más profundo de análisis de personalidad",
        fr: "Accès au niveau le plus profond de l'analyse de la personnalité",
        ja: "最も深いレベルの性格分析へのアクセス",
        ko: "가장 깊은 수준의 성격 분석",
      },
      id: "cosmic_insights",
      name: {
        zh: "宇宙洞察",
        en: "Cosmic Insights",
        es: "Perspicacia Cósmica",
        fr: "Intuition Cosmique",
        ja: "宇宙的洞察",
        ko: "우주적 통찰",
      },
      type: "feature",
    },
  ],
};

// XP Sources with Korean cultural bonuses
export const XP_SOURCES: Record<string, XPSource> = {
  community_post: {
    baseXP: 30,
    description: {
      zh: "发布社区文章",
      en: "Create community post",
      es: "Crear publicación en la comunidad",
      fr: "Créer une publication dans la communauté",
      ja: "コミュニティ記事作成",
      ko: "커뮤니티 게시글 작성",
    },
    maxDaily: 150,
    source: "community_post",
  },

  cultural_test: {
    baseXP: 75,
    description: {
      zh: "韩国传统测试（四柱命理，血型）",
      en: "Korean traditional tests (Saju, Blood type)",
      es: "Pruebas tradicionales coreanas (Saju, tipo de sangre)",
      fr: "Tests traditionnels coréens (Saju, groupe sanguin)",
      ja: "韓国の伝統的なテスト（四柱推命、血液型）",
      ko: "한국 전통 테스트 (사주, 혈액형)",
    },
    multiplier: 1.5,
    source: "cultural_test",
  },

  daily_visit: {
    baseXP: 15,
    description: {
      zh: "每日访问",
      en: "Daily visit",
      es: "Visita diaria",
      fr: "Visite quotidienne",
      ja: "毎日訪問",
      ko: "일일 방문",
    },
    maxDaily: 15,
    source: "daily_visit",
  },

  helping_others: {
    baseXP: 40,
    description: {
      zh: "帮助其他用户",
      en: "Help other users",
      es: "Ayudar a otros usuarios",
      fr: "Aider d'autres utilisateurs",
      ja: "他のユーザーを助ける",
      ko: "다른 사용자 도움",
    },
    source: "helping_others",
  },

  perfect_score: {
    baseXP: 100,
    description: {
      zh: "完美的测试分数",
      en: "Perfect test score",
      es: "Puntaje de prueba perfecto",
      fr: "Score de test parfait",
      ja: "完璧なテストスコア",
      ko: "완벽한 테스트 점수",
    },
    source: "perfect_score",
  },

  result_sharing: {
    baseXP: 25,
    description: {
      zh: "分享测试结果",
      en: "Share test results",
      es: "Compartir resultados de la prueba",
      fr: "Partager les résultats du test",
      ja: "テスト結果をシェア",
      ko: "결과 공유하기",
    },
    maxDaily: 200,
    source: "result_sharing",
  },

  streak_bonus: {
    baseXP: 20,
    description: {
      zh: "连续活动奖金",
      en: "Activity streak bonus",
      es: "Bono por racha de actividad",
      fr: "Bonus de série d'activité",
      ja: "連続活動ボーナス",
      ko: "연속 활동 보너스",
    },
    multiplier: 1.2,
    source: "streak_bonus",
  },

  test_completion: {
    baseXP: 50,
    description: {
      zh: "完成性格测试",
      en: "Complete personality test",
      es: "Prueba de personalidad completada",
      fr: "Test de personnalité terminé",
      ja: "性格テスト完了",
      ko: "성격 테스트 완료",
    },
    source: "test_completion",
  },
};

// Level calculation with prestige system
export function calculateLevel(totalXP: number): UserLevel {
  let level = 1;
  let currentLevelXP = 0;
  let prestige = 0;

  // Find current level
  while (level <= 50) {
    const requiredXP = calculateRequiredXP(level);
    if (totalXP < requiredXP) break;
    currentLevelXP = requiredXP;
    level++;
  }

  // Handle prestige (levels beyond 50)
  if (level > 50) {
    prestige = Math.floor((level - 50) / 10);
    level = 50;
  }

  const actualLevel = Math.min(level - 1, 50);
  const nextLevelXP = level <= 50 ? calculateRequiredXP(level) : 0;
  const currentXP = totalXP - currentLevelXP;
  const xpToNextLevel = nextLevelXP > 0 ? nextLevelXP - totalXP : 0;

  // Get title and perks
  const titleIndex = Math.min(actualLevel, LEVEL_TITLES.length - 1);
  const title = LEVEL_TITLES[titleIndex];

  const perks: LevelPerk[] = [];
  for (let i = 1; i <= actualLevel; i++) {
    if (LEVEL_PERKS[i]) {
      perks.push(...LEVEL_PERKS[i]);
    }
  }

  return {
    badge: getLevelBadge(actualLevel),
    currentXP,
    level: actualLevel,
    perks,
    prestige: prestige > 0 ? prestige : undefined,
    title,
    totalXP,
    xpToNextLevel,
  };
}

// Enhanced leveling formula with exponential growth
export function calculateRequiredXP(level: number): number {
  if (level <= 0) return 0;
  if (level === 1) return 100;

  // Exponential formula: base * (level^1.8) + bonus
  const base = 100;
  const exponent = 1.8;
  const bonus = (level - 1) * 50;

  return Math.floor(base * Math.pow(level, exponent) + bonus);
}

// Calculate XP gain with multipliers and limits
export function calculateXPGain(
  source: string,
  userLevel: number,
  dailyXP: Record<string, number> = {},
  bonusMultiplier: number = 1,
): number {
  const xpSource = XP_SOURCES[source];
  if (!xpSource) return 0;

  // Check daily limits
  if (xpSource.maxDaily && dailyXP[source] >= xpSource.maxDaily) {
    return 0;
  }

  let baseXP = xpSource.baseXP;

  // Apply source multiplier
  if (xpSource.multiplier) {
    baseXP *= xpSource.multiplier;
  }

  // Apply bonus multiplier (from achievements, events, etc.)
  baseXP *= bonusMultiplier;

  // Level-based bonus (small bonus for higher levels)
  const levelBonus = 1 + userLevel * 0.02; // 2% per level
  baseXP *= levelBonus;

  // Apply daily limit
  if (xpSource.maxDaily) {
    const remainingDaily = xpSource.maxDaily - (dailyXP[source] || 0);
    baseXP = Math.min(baseXP, remainingDaily);
  }

  return Math.floor(baseXP);
}

// Achievement integration
export function getAchievementXPBonus(achievements: string[]): number {
  let bonus = 1;

  // Specific achievement bonuses
  if (achievements.includes("share_master")) bonus += 0.1;
  if (achievements.includes("completionist")) bonus += 0.15;
  if (achievements.includes("rare_combination")) bonus += 0.2;
  if (achievements.includes("perfect_match")) bonus += 0.25;

  return bonus;
}

// Get level tier information
export function getLevelTier(level: number): LevelTier {
  const titleIndex = Math.min(level, LEVEL_TITLES.length - 1);
  const title = LEVEL_TITLES[titleIndex];

  let category: LevelTier["category"] = "beginner";
  let color = "green-500";
  let glowColor = "green-400";

  if (level >= 35) {
    category = "legend";
    color = "amber-500";
    glowColor = "amber-400";
  } else if (level >= 25) {
    category = "master";
    color = "yellow-500";
    glowColor = "yellow-400";
  } else if (level >= 15) {
    category = "expert";
    color = "red-500";
    glowColor = "red-400";
  } else if (level >= 10) {
    category = "advanced";
    color = "teal-500";
    glowColor = "teal-400";
  } else if (level >= 5) {
    category = "intermediate";
    color = "green-500";
    glowColor = "green-400";
  }

  const perks: LevelPerk[] = [];
  for (let i = 1; i <= level; i++) {
    if (LEVEL_PERKS[i]) {
      perks.push(...LEVEL_PERKS[i]);
    }
  }

  return {
    badge: getLevelBadge(level),
    category,
    color,
    glowColor,
    level,
    perks,
    requiredXP: calculateRequiredXP(level),
    title,
  };
}

// Get appropriate badge for level
function getLevelBadge(level: number): string {
  if (level >= 40) return "🌌"; // Cosmic
  if (level >= 35) return "👑"; // Legend
  if (level >= 30) return "🔮"; // Master
  if (level >= 25) return "🎓"; // Expert
  if (level >= 20) return "⭐"; // Advanced
  if (level >= 15) return "🏆"; // Skilled
  if (level >= 10) return "🎯"; // Intermediate
  if (level >= 5) return "📚"; // Student
  return "🌱"; // Beginner
}

const LevelSystem = {
  calculateLevel,
  calculateRequiredXP,
  calculateXPGain,
  getAchievementXPBonus,
  getLevelTier,
  LEVEL_PERKS,
  LEVEL_TITLES,
  XP_SOURCES,
};

export default LevelSystem;

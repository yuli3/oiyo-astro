import { Locale } from "@/i18n";

export const COLOR_PERSONALITY_LABELS: Record<
  Locale,
  Record<string, string>
> = {
  zh: {
    blue: "蓝色 (分析)",
    green: "绿色 (稳定)",
    red: "红色 (领导力)",
    yellow: "黄色 (活力)",
  },
  en: {
    blue: "Blue (Analysis)",
    green: "Green (Stability)",
    red: "Red (Leadership)",
    yellow: "Yellow (Energy)",
  },
  es: {
    blue: "Azul (Análisis)",
    green: "Verde (Estabilidad)",
    red: "Rojo (Liderazgo)",
    yellow: "Amarillo (Energía)",
  },
  fr: {
    blue: "Bleu (Analyse)",
    green: "Vert (Stabilité)",
    red: "Rouge (Leadership)",
    yellow: "Jaune (Énergie)",
  },
  ja: {
    blue: "青 (分析)",
    green: "緑 (安定)",
    red: "赤 (リーダーシップ)",
    yellow: "黄 (活力)",
  },
  ko: {
    blue: "파랑 (분석)",
    green: "초록 (안정)",
    red: "빨강 (리더십)",
    yellow: "노랑 (활발)",
  },
};

export const COMM_STYLE_LABELS: Record<Locale, Record<string, string>> = {
  zh: {
    analytical: "分析",
    diplomatic: "外交",
    direct: "直接",
    supportive: "支持",
  },
  en: {
    analytical: "Analytical",
    diplomatic: "Diplomatic",
    direct: "Direct",
    supportive: "Supportive",
  },
  es: {
    analytical: "Analítico",
    diplomatic: "Diplomático",
    direct: "Directo",
    supportive: "Apoyo",
  },
  fr: {
    analytique: "Analytique",
    diplomatique: "Diplomatique",
    direct: "Direct",
    soutenant: "Soutenant",
  },
  ja: {
    analytical: "分析的",
    diplomatic: "外交的",
    direct: "直接的",
    supportive: "協力的",
  },
  ko: {
    analytical: "분석적",
    diplomatic: "외교적",
    direct: "직접적",
    supportive: "지원적",
  },
};

export const TWIN_MATCH_STRINGS: Record<
  Locale,
  {
    differences: {
      colorDiff: {
        description: (c1: string, c2: string) => string;
        growth: string;
      };
      growth: { complementary: string; perspective: string };
      typeDiff: { description: (t1: string, t2: string) => string };
    };
    insights: {
      activityMatch: string;
      complementary: string;
      high: string;
      medium: string;
      personalityMatch: string;
      veryHigh: string;
    };
    similarities: {
      activity: { description: string; details: string[] };
      highCompat: { description: string; details: string[] };
      sameColor: { description: (color: string) => string; details: string[] };
      sameComm: { description: (style: string) => string; details: string[] };
      sameType: { description: (type: string) => string; details: string[] };
    };
    suggestions: {
      commonality: string;
      complementary: string[];
      general: string[];
      personality: string[];
    };
  }
> = {
  zh: {
    differences: {
      colorDiff: {
        description: (c1, c2) => `${c1} vs ${c2} 风格`,
        growth: "学习不同工作方式的机会",
      },
      growth: {
        complementary: "可以通过学习彼此长处而成长的关系",
        perspective: "通过不同视角开阔视野的机会",
      },
      typeDiff: { description: (t1, t2) => `${t1} vs ${t2} 性格差异` },
    },
    insights: {
      activityMatch: "💬 由于活动水平相似，可以持续交流",
      complementary: "📈 通过互补特征共同成长的关系",
      high: "✨ 高相容性：发展成为好朋友或导师的潜力",
      medium: "🤝 中等相容性：通过不同视角学习和成长的机会",
      personalityMatch: "🧠 性格类型匹配度高，沟通自然",
      veryHigh: "🌟 极高的相容性：可能建立深刻的理解和共鸣",
    },
    similarities: {
      activity: {
        description: "社区活跃度相似",
        details: ["参与度相似", "兴趣可能重叠", "沟通频率协调"],
      },
      highCompat: {
        description: "个性相容性高",
        details: ["互补特征", "平衡的视角", "互相学习的地方很多"],
      },
      sameColor: {
        description: (c) => `相同的${c}性格`,
        details: ["相似的工作风格", "相似的价值观", "可能有共同兴趣"],
      },
      sameComm: {
        description: (s) => `${s}沟通风格一致`,
        details: ["沟通顺畅", "相似的表达风格", "理解度高"],
      },
      sameType: {
        description: (t) => `相同的${t}性格类型`,
        details: ["相似的思维模式", "共同的行为风格", "相似的决策方式"],
      },
    },
    suggestions: {
      commonality: "🔗 基于共同点开始对话",
      complementary: ["🌟 交换不同观点并分享学习", "📚 就对方的长处寻求建议"],
      general: ["☕ 用轻松的话题自然地开始对话", "🎨 谈论共同的兴趣或爱好"],
      personality: [
        "💭 分享有关性格类型的经历和烦恼",
        "🎯 谈论相似的目标或挑战",
      ],
    },
  },
  en: {
    differences: {
      colorDiff: {
        description: (c1, c2) => `${c1} vs ${c2} style`,
        growth: "Opportunity to learn different work approach",
      },
      growth: {
        complementary: "Relationship to grow by learning strengths",
        perspective: "Opportunity to widen perspective",
      },
      typeDiff: {
        description: (t1, t2) => `${t1} vs ${t2} personality difference`,
      },
    },
    insights: {
      activityMatch:
        "💬 Continuous exchange possible due to similar activity levels",
      complementary:
        "📈 Relationship that grows through mutual complementary traits",
      high: "✨ High compatibility: Potential for good friend or mentor",
      medium:
        "🤝 Medium compatibility: Opportunity for learning and growth from different perspectives",
      personalityMatch:
        "🧠 High personality type match allows natural communication",
      veryHigh:
        "🌟 Very high compatibility: Deep understanding and empathy possible",
    },
    similarities: {
      activity: {
        description: "Similar community activity level",
        details: [
          "Similar participation",
          "Potential interest overlap",
          "Communication frequency harmony",
        ],
      },
      highCompat: {
        description: "High personality compatibility",
        details: [
          "Complementary traits",
          "Balanced perspective",
          "Much to learn from each other",
        ],
      },
      sameColor: {
        description: (c) => `Same ${c} personality`,
        details: [
          "Similar work style",
          "Similar values",
          "Likely shared interests",
        ],
      },
      sameComm: {
        description: (s) => `${s} communication match`,
        details: [
          "Smooth communication expected",
          "Similar expression style",
          "High understanding",
        ],
      },
      sameType: {
        description: (t) => `Same ${t} personality type`,
        details: [
          "Similar thought patterns",
          "Common behavior style",
          "Similar decision making",
        ],
      },
    },
    suggestions: {
      commonality: "🔗 Start conversation based on commonalities",
      complementary: [
        "🌟 Exchange different perspectives and share learning",
        "📚 Ask for advice on each other's strengths",
      ],
      general: [
        "☕ Start conversation naturally with light topics",
        "🎨 Talk about common interests or hobbies",
      ],
      personality: [
        "💭 Share experiences and worries about personality type",
        "🎯 Talk about similar goals or challenges",
      ],
    },
  },
  es: {
    differences: {
      colorDiff: {
        description: (c1, c2) => `Estilo ${c1} vs ${c2}`,
        growth: "Oportunidad de aprender un enfoque de trabajo diferente",
      },
      growth: {
        complementary: "Relación para crecer aprendiendo fortalezas",
        perspective: "Oportunidad para ampliar la perspectiva",
      },
      typeDiff: {
        description: (t1, t2) => `Diferencia de personalidad ${t1} vs ${t2}`,
      },
    },
    insights: {
      activityMatch:
        "💬 Intercambio continuo posible debido a niveles de actividad similares",
      complementary:
        "📈 Relación que crece a través de rasgos complementarios mutuos",
      high: "✨ Alta compatibilidad: Potencial para buen amigo o mentor",
      medium:
        "🤝 Compatibilidad media: Oportunidad de aprendizaje y crecimiento desde diferentes perspectivas",
      personalityMatch:
        "🧠 La alta coincidencia de tipo de personalidad permite una comunicación natural",
      veryHigh:
        "🌟 Compatibilidad muy alta: Posible comprensión y empatía profundas",
    },
    similarities: {
      activity: {
        description: "Nivel de actividad comunitaria similar",
        details: [
          "Participación similar",
          "Posible superposición de intereses",
          "Armonía en la frecuencia de comunicación",
        ],
      },
      highCompat: {
        description: "Alta compatibilidad de personalidad",
        details: [
          "Rasgos complementarios",
          "Perspectiva equilibrada",
          "Mucho que aprender el uno del otro",
        ],
      },
      sameColor: {
        description: (c) => `Misma personalidad ${c}`,
        details: [
          "Estilo de trabajo similar",
          "Valores similares",
          "Posibles intereses compartidos",
        ],
      },
      sameComm: {
        description: (s) => `Coincidencia de comunicación ${s}`,
        details: [
          "Se espera una comunicación fluida",
          "Estilo de expresión similar",
          "Alta comprensión",
        ],
      },
      sameType: {
        description: (t) => `Mismo tipo de personalidad ${t}`,
        details: [
          "Patrones de pensamiento similares",
          "Estilo de comportamiento común",
          "Toma de decisiones similar",
        ],
      },
    },
    suggestions: {
      commonality: "🔗 Inicia una conversación basada en puntos en común",
      complementary: [
        "🌟 Intercambia diferentes perspectivas y comparte aprendizajes",
        "📚 Pide consejo sobre las fortalezas del otro",
      ],
      general: [
        "☕ Inicia la conversación de forma natural con temas ligeros",
        "🎨 Habla sobre intereses o pasatiempos comunes",
      ],
      personality: [
        "💭 Comparte experiencias y preocupaciones sobre el tipo de personalidad",
        "🎯 Habla sobre objetivos o desafíos similares",
      ],
    },
  },
  fr: {
    differences: {
      colorDiff: {
        description: (c1, c2) => `Style ${c1} vs ${c2}`,
        growth: "Opportunité d'apprendre une approche de travail différente",
      },
      growth: {
        complementary: "Relation pour grandir en apprenant des forces",
        perspective: "Opportunité d'élargir la perspective",
      },
      typeDiff: {
        description: (t1, t2) => `Différence de personnalité ${t1} vs ${t2}`,
      },
    },
    insights: {
      activityMatch:
        "💬 Échange continu possible grâce à des niveaux d'activité similaires",
      complementary:
        "📈 Relation qui grandit grâce à des traits complémentaires mutuels",
      high: "✨ Haute compatibilité : Potentiel pour devenir bon ami ou mentor",
      medium:
        "🤝 Compatibilité moyenne : Opportunité d'apprentissage et de croissance à partir de perspectives différentes",
      personalityMatch:
        "🧠 La correspondance élevée des types de personnalité permet une communication naturelle",
      veryHigh:
        "🌟 Très haute compatibilité : Compréhension profonde et empathie possibles",
    },
    similarities: {
      activity: {
        description: "Niveau d'activité communautaire similaire",
        details: [
          "Participation similaire",
          "Chevauchement d'intérêts possible",
          "Harmonie de la fréquence de communication",
        ],
      },
      highCompat: {
        description: "Haute compatibilité de personnalité",
        details: [
          "Traits complémentaires",
          "Perspective équilibrée",
          "Beaucoup à apprendre l'un de l'autre",
        ],
      },
      sameColor: {
        description: (c) => `Même personnalité ${c}`,
        details: [
          "Style de travail similaire",
          "Valeurs similaires",
          "Intérêts communs probables",
        ],
      },
      sameComm: {
        description: (s) => `Correspondance de communication ${s}`,
        details: [
          "Communication fluide attendue",
          "Style d'expression similaire",
          "Haute compréhension",
        ],
      },
      sameType: {
        description: (t) => `Même type de personnalité ${t}`,
        details: [
          "Schémas de pensée similaires",
          "Style de comportement commun",
          "Prise de décision similaire",
        ],
      },
    },
    suggestions: {
      commonality: "🔗 Commencez la conversation sur la base de points communs",
      complementary: [
        "🌟 Échangez différentes perspectives et partagez vos apprentissages",
        "📚 Demandez conseil sur les forces de l'autre",
      ],
      general: [
        "☕ Commencez la conversation naturellement avec des sujets légers",
        "🎨 Parlez d'intérêts ou de passe-temps communs",
      ],
      personality: [
        "💭 Partagez des expériences et des préoccupations sur le type de personnalité",
        "🎯 Parlez d'objectifs ou de défis similaires",
      ],
    },
  },
  ja: {
    differences: {
      colorDiff: {
        description: (c1, c2) => `${c1} vs ${c2} スタイル`,
        growth: "異なる仕事のアプローチを学ぶ機会",
      },
      growth: {
        complementary: "お互いの強みを学び成長できる関係",
        perspective: "多様な視点を通じて視野を広げる機会",
      },
      typeDiff: { description: (t1, t2) => `${t1} vs ${t2} 性格の違い` },
    },
    insights: {
      activityMatch: "💬 活動レベルが似ているため、継続的な交流が可能",
      complementary: "📈 相互補完的な特性により共に成長できる関係",
      high: "✨ 高い相性：良い友人やメンターになる可能性",
      medium: "🤝 中程度の相性：異なる視点からの学びと成長の機会",
      personalityMatch:
        "🧠 性格タイプの一致度が高く、自然なコミュニケーションが可能",
      veryHigh: "🌟 非常に高い相性：深い理解と共感が可能",
    },
    similarities: {
      activity: {
        description: "似たコミュニティ活動レベル",
        details: [
          "参加度が似ている",
          "興味の重複の可能性",
          "コミュニケーション頻度の調和",
        ],
      },
      highCompat: {
        description: "高い性格の相性",
        details: [
          "補完的な特性",
          "バランスの取れた視点",
          "お互いから学ぶことが多い",
        ],
      },
      sameColor: {
        description: (c) => `同じ${c}性格`,
        details: ["似た仕事のスタイル", "似た価値観", "共通の興味の可能性"],
      },
      sameComm: {
        description: (s) => `${s}コミュニケーションの一致`,
        details: ["円滑なコミュニケーション", "似た表現スタイル", "高い理解度"],
      },
      sameType: {
        description: (t) => `同じ${t}性格タイプ`,
        details: ["似た思考パターン", "共通の行動スタイル", "似た意思決定方法"],
      },
    },
    suggestions: {
      commonality: "🔗 共通点に基づいて会話を始めてみてください",
      complementary: [
        "🌟 異なる視点を交換し、学びを共有してください",
        "📚 相手の強みについてアドバイスを求めてみてください",
      ],
      general: [
        "☕ 軽い話題で自然に会話を始めてみてください",
        "🎨 共通の趣味や興味について話してみてください",
      ],
      personality: [
        "💭 性格タイプに関連する経験や悩みについて話してみてください",
        "🎯 似た目標や課題について話してみてください",
      ],
    },
  },
  ko: {
    differences: {
      colorDiff: {
        description: (c1, c2) => `${c1} vs ${c2} 스타일`,
        growth: "다른 업무 접근 방식을 학습할 기회",
      },
      growth: {
        complementary: "서로의 강점을 배우며 성장할 수 있는 관계",
        perspective: "다양한 관점을 통해 시야를 넓힐 기회",
      },
      typeDiff: { description: (t1, t2) => `${t1} vs ${t2} 성격 차이` },
    },
    insights: {
      activityMatch: "💬 비슷한 활동 수준으로 지속적인 교류 가능",
      complementary: "📈 상호 보완적 특성으로 함께 성장할 수 있는 관계",
      high: "✨ 높은 호환성: 좋은 친구나 멘토 관계 발전 가능",
      medium: "🤝 중간 호환성: 서로 다른 관점으로 배움과 성장 기회",
      personalityMatch: "🧠 성격 유형 일치도가 높아 자연스러운 소통 가능",
      veryHigh: "🌟 매우 높은 호환성: 깊은 이해와 공감대 형성 가능",
    },
    similarities: {
      activity: {
        description: "비슷한 커뮤니티 활동 수준",
        details: ["참여도 유사", "관심사 중복 가능성", "소통 빈도 조화"],
      },
      highCompat: {
        description: "높은 성격 호환성",
        details: ["상호 보완적 특성", "균형잡힌 관점", "서로 배울 점이 많음"],
      },
      sameColor: {
        description: (c) => `같은 ${c} 성격`,
        details: ["유사한 업무 스타일", "비슷한 가치관", "공통 관심사 가능성"],
      },
      sameComm: {
        description: (s) => `${s} 소통 스타일 일치`,
        details: ["원활한 의사소통 예상", "비슷한 표현 방식", "이해도 높음"],
      },
      sameType: {
        description: (t) => `같은 ${t} 성격 유형`,
        details: [
          "비슷한 사고 패턴",
          "공통된 행동 스타일",
          "유사한 의사결정 방식",
        ],
      },
    },
    suggestions: {
      commonality: "🔗 공통점을 바탕으로 대화를 시작해보세요",
      complementary: [
        "🌟 서로 다른 관점을 교환하며 배움을 나눠보세요",
        "📚 상대방의 강점 분야에 대해 조언을 구해보세요",
      ],
      general: [
        "☕ 가벼운 주제로 자연스럽게 대화를 시작해보세요",
        "🎨 공통 관심사나 취미에 대해 이야기해보세요",
      ],
      personality: [
        "💭 성격 유형 관련 경험과 고민을 나눠보세요",
        "🎯 비슷한 목표나 챌린지에 대해 이야기해보세요",
      ],
    },
  },
};

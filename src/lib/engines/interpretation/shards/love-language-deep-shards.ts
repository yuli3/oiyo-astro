import type { SixLangString } from "../engine.contract";

/**
 * Love Language Shard Data
 * Love language data separated from logic.
 */

export type LoveLanguageType = "gifts" | "service" | "time" | "touch" | "words";

export const LOVE_LANGUAGE_DATA: Record<
  LoveLanguageType,
  {
    expressions: SixLangString[];
    name: SixLangString;
    narrative: SixLangString;
  }
> = {
  gifts: {
    expressions: [
      {
        en: "Thoughtful gifts that show you're known",
        es: "Regalos considerados que demuestran que te conocen",
        fr: "Des cadeaux attentionnés qui montrent qu'on vous connaît",
        ja: "あなたが理解されていることを示す心のこもった贈り物",
        ko: "당신이 알려져 있음을 보여주는 사려 깊은 선물",
        zh: "显示你被了解的体贴礼物",
      },
      {
        en: "Small surprises and tokens of affection",
        es: "Pequeñas sorpresas y muestras de afecto",
        fr: "Petites surprises et marques d'affection",
        ja: "ささやかな驚きや愛情のしるし",
        ko: "작은 놀라움과 애정의 토큰",
        zh: "小小的惊喜和爱意的象征",
      },
      {
        en: "Remembering special occasions",
        es: "Recordar ocasiones especiales",
        fr: "Se souvenir des occasions spéciales",
        ja: "特別な日を覚えていること",
        ko: "특별한 날 기억하기",
        zh: "记得特别的时刻",
      },
      {
        en: "Physical symbols of love and commitment",
        es: "Símbolos físicos de amor y compromiso",
        fr: "Symboles physiques d'amour et d'engagement",
        ja: "愛と献身の物理的な象徴",
        ko: "사랑과 헌신의 물리적 상징",
        zh: "爱与承诺的物理象征",
      },
    ],
    name: {
      en: "Receiving Gifts",
      es: "Recibir Regalos",
      fr: "Cadeaux",
      ja: "贈り物",
      ko: "선물",
      zh: "礼物",
    },
    narrative: {
      en: "You feel most loved through thoughtful gifts - not necessarily expensive, but meaningful.",
      es: "Te sientes más amado a través de regalos considerados - no necesariamente caros, pero significativos.",
      fr: "Vous vous sentez le plus aimé à travers des cadeaux attentionnés - pas nécessairement chers, mais significatifs.",
      ja: "心のこもった贈り物を通じて最も愛されていると感じます。",
      ko: "사려 깊은 선물을 통해 가장 사랑받는다고 느낍니다 - 반드시 비싼 것이 아니라 의미 있는 것.",
      zh: "通过体贴的礼物你会感到最被爱——不一定昂贵，但要有意义。",
    },
  },
  service: {
    expressions: [
      {
        en: "Helping with tasks without being asked",
        es: "Ayudar con tareas sin que te lo pidan",
        fr: "Aider aux tâches sans qu'on vous le demande",
        ja: "頼まれる前に仕事をてつだう",
        ko: "요청 없이 일을 도와주기",
        zh: "无需开口便主动帮忙做事",
      },
      {
        en: "Taking care of responsibilities you dislike",
        es: "Hacerse cargo de responsabilidades que no te gustan",
        fr: "Prendre en charge les responsabilités que vous n'aimez pas",
        ja: "あなたが嫌いな責任を引き受ける",
        ko: "당신이 싫어하는 책임을 돌보기",
        zh: "替你处理你讨厌的责任",
      },
      {
        en: "Practical support during stressful times",
        es: "Apoyo práctico durante momentos estresantes",
        fr: "Soutien pratique pendant les périodes stressantes",
        ja: "ストレスの多い時期の実際的なサポート",
        ko: "스트레스 시기의 실질적 지원",
        zh: "压力大时的实际支持",
      },
      {
        en: "Making your life easier in tangible ways",
        es: "Hacer tu vida más fácil de maneras tangibles",
        fr: "Vous faciliter la vie de manière tangible",
        ja: "具体的な方法で生活を楽にする",
        ko: "실질적인 방식으로 삶을 더 쉽게 만들기",
        zh: "以具体的方式让你的生活变得更轻松",
      },
    ],
    name: {
      en: "Acts of Service",
      es: "Actos de Servicio",
      fr: "Services Rendus",
      ja: "奉仕の行為",
      ko: "봉사의 행동",
      zh: "服务行为",
    },
    narrative: {
      en: "You feel most loved when someone does something helpful for you - actions speak louder than words.",
      es: "Te sientes más amado cuando alguien hace algo útil por ti - las acciones hablan más que las palabras.",
      fr: "Vous vous sentez le plus aimé lorsque quelqu'un fait quelque chose d'utile pour vous - les actes sont plus éloquents que les mots.",
      ja: "誰かがあなたのために助けになることをしてくれるとき、最も愛されていると感じます。",
      ko: "누군가 당신을 위해 도움이 되는 일을 할 때 가장 사랑받는다고 느낍니다 - 행동이 말보다 웅변합니다.",
      zh: "当有人为你做有益的事情时，你会感到最被爱——行动胜于言语。",
    },
  },
  time: {
    expressions: [
      {
        en: "Uninterrupted, focused conversations",
        es: "Conversaciones enfocadas y sin interrupciones",
        fr: "Conversations ininterrompues et concentrées",
        ja: "邪魔されない集中した会話",
        ko: "방해받지 않는, 집중된 대화",
        zh: "不受干扰、专注的对话",
      },
      {
        en: "Shared activities and experiences",
        es: "Actividades y experiencias compartidas",
        fr: "Activités et expériences partagées",
        ja: "共有された活動や経験",
        ko: "공유된 활동과 경험",
        zh: "共享的活动和体验",
      },
      {
        en: "Eye contact and full presence",
        es: "Contacto visual y presencia plena",
        fr: "Contact visuel et présence totale",
        ja: "アイコンタクトと完全な連帯感",
        ko: "눈 맞춤과 완전한 존재",
        zh: "眼神交流和全心全意的陪伴",
      },
      {
        en: "Phones away during time together",
        es: "Guardar los teléfonos cuando están juntos",
        fr: "Téléphones rangés pendant les moments ensemble",
        ja: "一緒にいるときはスマホを置く",
        ko: "함께하는 시간에 전화기 치우기",
        zh: "在一起时收起手机",
      },
    ],
    name: {
      en: "Quality Time",
      es: "Tiempo de Calidad",
      fr: "Moments de Qualité",
      ja: "クオリティタイム",
      ko: "함께하는 시간",
      zh: "精心时刻",
    },
    narrative: {
      en: "You feel most loved when someone gives you their undivided attention.",
      es: "Te sientes más amado cuando alguien te da su atención completa.",
      fr: "Vous vous sentez le plus aimé lorsque quelqu'un vous accorde toute son attention.",
      ja: "誰かがあなたに全神経を注いでくれるとき、最も愛されていると感じます。",
      ko: "누군가가 당신에게 온전한 관심을 줄 때 가장 사랑받는다고 느낍니다.",
      zh: "当有人全心全意关注你时，你会感到最被爱。",
    },
  },
  touch: {
    expressions: [
      {
        en: "Hugs, kisses, and physical affection",
        es: "Abrazos, besos y afecto físico",
        fr: "Câlins, baisers et affection physique",
        ja: "ハグ、キス、身体的な愛情表現",
        ko: "포옹, 키스, 신체적 애정",
        zh: "拥抱、亲吻和身体关爱",
      },
      {
        en: "Hand-holding and casual touch",
        es: "Tomarse de las manos y contacto casual",
        fr: "Se tenir la main et contact occasionnel",
        ja: "手をつなぐことやさりげない接触",
        ko: "손잡기와 일상적인 터치",
        zh: "牵手和偶然的接触",
      },
      {
        en: "Physical presence during difficult times",
        es: "Presencia física durante momentos difíciles",
        fr: "Présence physique dans les moments difficiles",
        ja: "困難な時期の物理的な寄り添い",
        ko: "어려운 시기의 물리적 존재",
        zh: "困难时期的身体陪伴",
      },
      {
        en: "Massage, cuddling, or physical comfort",
        es: "Masajes, abrazos o consuelo físico",
        fr: "Massage, câlins ou réconfort physique",
        ja: "マッサージ、抱きしめること、身体的な慰め",
        ko: "마사지, 껴안기, 물리적 위안",
        zh: "按摩、依偎或身体上的安慰",
      },
    ],
    name: {
      en: "Physical Touch",
      es: "Toque Físico",
      fr: "Toucher Physique",
      ja: "身体的接触",
      ko: "스킨십",
      zh: "身体接触",
    },
    narrative: {
      en: "You feel most loved through physical affection - hugs, holding hands, sitting close.",
      es: "Te sientes más amado a través del afecto físico - abrazos, tomarse de la mano, sentarse cerca.",
      fr: "Vous vous sentez le plus aimé par l'affection physique - câlins, se tenir la main, s'asseoir près l'un de l'autre.",
      ja: "身体的な愛情を通じて最も愛されていると感じます。",
      ko: "신체적 애정을 통해 가장 사랑받는다고 느낍니다 - 포옹, 손잡기, 가까이 앉기.",
      zh: "通过身体亲密接触你会感到最被爱——拥抱、牵手、坐得很近。",
    },
  },
  words: {
    expressions: [
      {
        en: "Verbal appreciation and gratitude",
        es: "Aprecio verbal y gratitud",
        fr: "Appréciation verbale et gratitude",
        ja: "口頭での感謝とありがたみ",
        ko: "말로 하는 감사와 고마움",
        zh: "言语上的赞赏和感激",
      },
      {
        en: "Written love notes and messages",
        es: "Notas de amor y mensajes escritos",
        fr: "Mots d'amour et messages écrits",
        ja: "手書きのラブレターやメッセージ",
        ko: "사랑의 편지와 메시지",
        zh: "手写的爱心小纸条和讯息",
      },
      {
        en: "Compliments and encouragement",
        es: "Cumplidos y aliento",
        fr: "Compliments et encouragements",
        ja: "褒め言葉と励まし",
        ko: "칭칭과 격려",
        zh: "称赞和鼓励",
      },
      {
        en: "Words that recognize your efforts",
        es: "Palabras que reconocen tus esfuerzos",
        fr: "Des mots qui reconnaissent vos efforts",
        ja: "努力を認める言葉",
        ko: "노력을 인정하는 말",
        zh: "认可你努力的话语",
      },
    ],
    name: {
      en: "Words of Affirmation",
      es: "Palabras de Afirmación",
      fr: "Paroles Valorisantes",
      ja: "肯定の言葉",
      ko: "인정하는 말",
      zh: "肯定的言语",
    },
    narrative: {
      en: "You feel most loved when people express appreciation, encouragement, and affection through words.",
      es: "Te sientes más amado cuando las personas expresan aprecio, aliento y afecto a través de palabras.",
      fr: "Vous vous sentez le plus aimé lorsque les gens expriment leur appréciation, leurs encouragements et leur affection par des mots.",
      ja: "人々が言葉で感謝、励まし、愛情を表現するとき、最も愛されていると感じます。",
      ko: "사람들이 말로 감사, 격려, 애정을 표현할 때 가장 사랑받는다고 느낍니다.",
      zh: "当人们用言语表达感谢、鼓励和爱时，你会感到最被爱。",
    },
  },
};

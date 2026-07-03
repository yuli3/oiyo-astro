import { RiasecQuestion, RiasecType } from "./types";

export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  // 1. Realistic vs Social
  {
    id: "r_1",
    options: [
      {
        id: "a",
        text: {
          zh: "组装家具或修理机器。",
          en: "Assemble furniture or repair machines.",
          es: "Montar muebles o reparar máquinas.",
          fr: "Assembler des meubles ou réparer des machines.",
          ja: "家具を組み立てたり機械を修理したりする。",
          ko: "가구를 조립하거나 기계를 수리한다.",
        },
        weights: { Realistic: 3 },
      },
      {
        id: "b",
        text: {
          zh: "和朋友聚会聊天。",
          en: "Gather with friends and talk.",
          es: "Reunirse con amigos y hablar.",
          fr: "Se réunir avec des amis et discuter.",
          ja: "友達と集まって話をする。",
          ko: "친구들과 모여 이야기를 나눈다.",
        },
        weights: { Social: 3 },
      },
    ],
    text: {
      zh: "周末你会怎么度过？",
      en: "How would you spend your time on a weekend?",
      es: "¿Cómo pasarías tu tiempo un fin de semana?",
      fr: "Comment passeriez-vous votre temps un week-end ?",
      ja: "週末を過ごすなら何をしますか？",
      ko: "주말에 시간을 보낸다면 무엇을 하시겠습니까?",
    },
  },
  // 2. Investigative vs Enterprising
  {
    id: "r_2",
    options: [
      {
        id: "a",
        text: {
          zh: "分析和研究相关资料。",
          en: "Analyze and research relevant data.",
          es: "Analizar e investigar datos relevantes.",
          fr: "Analyser et rechercher des données pertinentes.",
          ja: "関連資料を分析し研究する。",
          ko: "관련 자료를 분석하고 연구한다.",
        },
        weights: { Investigative: 3 },
      },
      {
        id: "b",
        text: {
          zh: "带领团队并设定目标。",
          en: "Lead the team and set goals.",
          es: "Liderar el equipo y establecer metas.",
          fr: "Diriger l'équipe et fixer des objectifs.",
          ja: "チームを率いて目標を提示する。",
          ko: "팀을 이끌고 목표를 제시한다.",
        },
        weights: { Enterprising: 3 },
      },
    ],
    text: {
      zh: "开始新项目时你的角色是？",
      en: "What is your role when starting a new project?",
      es: "¿Cuál es tu papel al iniciar un nuevo proyecto?",
      fr: "Quel est votre rôle lors du démarrage d'un nouveau projet ?",
      ja: "新しいプロジェクトを始めるときのあなたの役割は？",
      ko: "새로운 프로젝트를 시작할 때 당신의 역할은?",
    },
  },
  // 3. Artistic vs Conventional
  {
    id: "r_3",
    options: [
      {
        id: "a",
        text: {
          zh: "自由且允许表达的空间",
          en: "A space that allows freedom and expression.",
          es: "Un espacio que permite la libertad y la expresión.",
          fr: "Un espace qui permet la liberté et l'expression.",
          ja: "自由で表現が許される空間",
          ko: "자유롭고 표현이 허용되는 공간",
        },
        weights: { Artistic: 3 },
      },
      {
        id: "b",
        text: {
          zh: "系统且整洁的办公室",
          en: "Systematic and organized office.",
          es: "Oficina sistemática y organizada.",
          fr: "Bureau systématique et organisé.",
          ja: "体系的で整頓されたオフィス",
          ko: "체계적이고 정돈된 사무실",
        },
        weights: { Conventional: 3 },
      },
    ],
    text: {
      zh: "你喜欢什么样的工作环境？",
      en: "What work environment do you prefer?",
      es: "¿Qué entorno de trabajo prefieres?",
      fr: "Quel environnement de travail préférez-vous ?",
      ja: "どのような作業環境を好みますか？",
      ko: "어떤 작업 환경을 선호하시나요?",
    },
  },
  // 4. Realistic vs Investigative
  {
    id: "r_4",
    options: [
      {
        id: "a",
        text: {
          zh: "动手直接修理。",
          en: "Fix it by moving your body directly.",
          es: "Arreglarlo moviendo tu cuerpo directamente.",
          fr: "Le réparer en bougeant directement votre corps.",
          ja: "直接体を動かして直す。",
          ko: "직접 몸을 움직여 고친다.",
        },
        weights: { Realistic: 3 },
      },
      {
        id: "b",
        text: {
          zh: "逻辑性地找出原因。",
          en: "Logically identify the cause.",
          es: "Identificar lógicamente la causa.",
          fr: "Identifier logiquement la cause.",
          ja: "原因を論理的に把握する。",
          ko: "원인을 논리적으로 파악한다.",
        },
        weights: { Investigative: 3 },
      },
    ],
    text: {
      zh: "发生问题时你的解决方式是？",
      en: "What is your problem-solving style?",
      es: "¿Cuál es tu estilo de resolución de problemas?",
      fr: "Quel est votre style de résolution de problèmes ?",
      ja: "問題が発生したときのあなたの解決方式は？",
      ko: "문제가 발생했을 때 당신의 해결 방식은?",
    },
  },
  // 5. Artistic vs Social
  {
    id: "r_5",
    options: [
      {
        id: "a",
        text: {
          zh: "通过作品感动他人",
          en: "Inspiring others through creations.",
          es: "Inspirar a otros a través de creaciones.",
          fr: "Inspirer les autres à travers des créations.",
          ja: "創作物を通じて感動を与えること",
          ko: "창작물을 통해 감동을 주는 것",
        },
        weights: { Artistic: 3 },
      },
      {
        id: "b",
        text: {
          zh: "直接帮助和教导他人",
          en: "Helping and teaching people directly.",
          es: "Ayudar y enseñar a la gente directamente.",
          fr: "Aider et enseigner directement aux gens.",
          ja: "直接人を助け教えること",
          ko: "직접 사람을 돕고 가르치는 것",
        },
        weights: { Social: 3 },
      },
    ],
    text: {
      zh: "对你来说更有意义的是？",
      en: "What is more rewarding for you?",
      es: "¿Qué es más gratificante para ti?",
      fr: "Qu'est-ce qui est le plus gratifiant pour vous ?",
      ja: "あなたにとってもっとやりがいのあることは？",
      ko: "당신에게 더 보람찬 일은?",
    },
  },
  // 6. Enterprising vs Conventional
  {
    id: "r_6",
    options: [
      {
        id: "a",
        text: {
          zh: "冒险且果断的决策",
          en: "Adventurous and bold decisions.",
          es: "Decisiones aventureras y audaces.",
          fr: "Décisions aventureuses et audacieuses.",
          ja: "冒険的で大胆な決断",
          ko: "모험적이고 과감한 결단",
        },
        weights: { Enterprising: 3 },
      },
      {
        id: "b",
        text: {
          zh: "稳定且遵守规则的管理",
          en: "Stable and rule-abiding management.",
          es: "Gestión estable y respetuosa de las normas.",
          fr: "Gestion stable et respectueuse des règles.",
          ja: "安定的で規則を遵守する管理",
          ko: "안정적이고 규칙을 준수하는 관리",
        },
        weights: { Conventional: 3 },
      },
    ],
    text: {
      zh: "喜欢的领导风格是？",
      en: "Preferred leadership style?",
      es: "¿Estilo de liderazgo preferido?",
      fr: "Style de leadership préféré ?",
      ja: "好みのリーダーシップスタイルは？",
      ko: "선호하는 리더십 스타일은?",
    },
  },
  // 7. Realistic vs Conventional
  {
    id: "r_7",
    options: [
      {
        id: "a",
        text: {
          zh: "木工或登山",
          en: "Woodworking or hiking.",
          es: "Carpintería o senderismo.",
          fr: "Menuiserie ou randonnée.",
          ja: "木工や登山",
          ko: "목공예나 등산",
        },
        weights: { Realistic: 3 },
      },
      {
        id: "b",
        text: {
          zh: "集邮或整理数据",
          en: "Stamp collecting or data organizing.",
          es: "Coleccionar sellos u organizar datos.",
          fr: "Collection de timbres ou organisation de données.",
          ja: "切手収集やデータ整理",
          ko: "우표 수집이나 데이터 정리",
        },
        weights: { Conventional: 3 },
      },
    ],
    text: {
      zh: "如果要选一个爱好？",
      en: "If you choose one hobby?",
      es: "¿Si eliges un pasatiempo?",
      fr: "Si vous choisissez un passe-temps ?",
      ja: "趣味を一つ選ぶなら？",
      ko: "취미를 하나 선택한다면?",
    },
  },
  // 8. Investigative vs Artistic
  {
    id: "r_8",
    options: [
      {
        id: "a",
        text: {
          zh: "追求知识与真理",
          en: "Pursuit of knowledge and truth.",
          es: "Búsqueda del conocimiento y la verdad.",
          fr: "Poursuite de la connaissance et de la vérité.",
          ja: "知識と真理の探求",
          ko: "지식과 진리 탐구",
        },
        weights: { Investigative: 3 },
      },
      {
        id: "b",
        text: {
          zh: "美感与独创性",
          en: "Aesthetic sense and originality.",
          es: "Sentido estético y originalidad.",
          fr: "Sens esthétique et originalité.",
          ja: "美的感覚と独創性",
          ko: "미적 감각과 독창성",
        },
        weights: { Artistic: 3 },
      },
    ],
    text: {
      zh: "你认为更有价值的是？",
      en: "What value do you consider more important?",
      es: "¿Qué valor consideras más importante?",
      fr: "Quelle valeur considérez-vous comme plus importante ?",
      ja: "あなたがより重要だと考える価値は？",
      ko: "당신이 더 중요하게 생각하는 가치는?",
    },
  },
  // 9. Social vs Enterprising
  {
    id: "r_9",
    options: [
      {
        id: "a",
        text: {
          zh: "倾听并共情他人的故事。",
          en: "Listen and empathize with people.",
          es: "Escuchar y empatizar con la gente.",
          fr: "Écouter et faire preuve d'empathie envers les gens.",
          ja: "人々の話を聞いて共感する。",
          ko: "사람들의 이야기를 경청하고 공감한다.",
        },
        weights: { Social: 3 },
      },
      {
        id: "b",
        text: {
          zh: "主导气氛并介绍他人。",
          en: "Lead the mood and introduce people.",
          es: "Dirigir el ambiente y presentar a la gente.",
          fr: "Diriger l'ambiance et présenter les gens.",
          ja: "雰囲気を主導し人々を紹介する。",
          ko: "분위기를 주도하고 사람들을 소개한다.",
        },
        weights: { Enterprising: 3 },
      },
    ],
    text: {
      zh: "聚会时的你是什么样子？",
      en: "Your appearance at a party?",
      es: "¿Tu apariencia en una fiesta?",
      fr: "Votre apparence à une fête ?",
      ja: "パーティーでのあなたの姿は？",
      ko: "파티에서의 당신의 모습은?",
    },
  },
  // 10. Investigative vs Conventional
  {
    id: "r_10",
    options: [
      {
        id: "a",
        text: {
          zh: "科学理论或哲学书籍",
          en: "Science theory or philosophy books.",
          es: "Teoría científica o libros de filosofía.",
          fr: "Théorie scientifique ou livres de philosophie.",
          ja: "科学理論や哲学書",
          ko: "과학 이론이나 철학 서적",
        },
        weights: { Investigative: 3 },
      },
      {
        id: "b",
        text: {
          zh: "会计原理或实用指南",
          en: "Accounting principles or practical guides.",
          es: "Principios contables o guías prácticas.",
          fr: "Principes comptables ou guides pratiques.",
          ja: "会計原理や実用ガイド",
          ko: "회계 원리나 실용 가이드",
        },
        weights: { Conventional: 3 },
      },
    ],
    text: {
      zh: "如果在图书馆选书？",
      en: "If you pick a book at the library?",
      es: "¿Si eliges un libro en la biblioteca?",
      fr: "Si vous choisissez un livre à la bibliothèque ?",
      ja: "図書館で本を選ぶなら？",
      ko: "도서관에서 책을 고른다면?",
    },
  },
  // 11. Realistic vs Enterprising
  {
    id: "r_11",
    options: [
      {
        id: "a",
        text: {
          zh: "销售手工制作的工艺品",
          en: "Selling handmade crafts.",
          es: "Venta de artesanías hechas a mano.",
          fr: "Vente d'artisanat fait main.",
          ja: "直接製作した手工芸品の販売",
          ko: "직접 제작한 수공예품 판매",
        },
        weights: { Realistic: 3 },
      },
      {
        id: "b",
        text: {
          zh: "建立分销网络和营销代理",
          en: "Building distribution networks and marketing.",
          es: "Creación de redes de distribución y marketing.",
          fr: "Création de réseaux de distribution et marketing.",
          ja: "流通網を構築しマーケティング代行",
          ko: "유통망을 구축하고 마케팅 대행",
        },
        weights: { Enterprising: 3 },
      },
    ],
    text: {
      zh: "如果创业，会选什么项目？",
      en: " If you start a business, what item?",
      es: "¿Si inicias un negocio, qué artículo?",
      fr: "Si vous démarrez une entreprise, quel article ?",
      ja: "ビジネスをするならどんなアイテムで？",
      ko: "사업을 한다면 어떤 아이템으로?",
    },
  },
  // 12. Artistic vs Social
  {
    id: "r_12",
    options: [
      {
        id: "a",
        text: {
          zh: "博物馆和美术馆巡礼",
          en: "Museum and art gallery tour.",
          es: "Visita a museos y galerías de arte.",
          fr: "Visite de musées et galeries d'art.",
          ja: "博物館と美術館ツアー",
          ko: "박물관과 미술관 투어",
        },
        weights: { Artistic: 3 },
      },
      {
        id: "b",
        text: {
          zh: "与当地人交流的志愿活动",
          en: "Volunteering with locals.",
          es: "Voluntariado con los lugareños.",
          fr: "Bénévolat avec les locaux.",
          ja: "現地人と交流するボランティア活動",
          ko: "현지인과 어울리는 봉사활동",
        },
        weights: { Social: 3 },
      },
    ],
    text: {
      zh: "理想的假期计划是？",
      en: "Ideal vacation plan?",
      es: "¿Plan de vacaciones ideal?",
      fr: "Plan de vacances idéal ?",
      ja: "理想的な休暇計画は？",
      ko: "이상적인 휴가 계획은?",
    },
  },
];

export const RIASEC_RESULTS: Record<RiasecType, any> = {
  Artistic: {
    careers: [
      {
        zh: "设计师",
        en: "Designer",
        es: "Diseñador",
        fr: "Designer",
        ja: "デザイナー",
        ko: "디자이너",
      },
      {
        zh: "作家",
        en: "Writer",
        es: "Escritor",
        fr: "Écrivain",
        ja: "作家",
        ko: "작가",
      },
      {
        zh: "音乐家",
        en: "Musician",
        es: "Músico",
        fr: "Musicien",
        ja: "音楽家",
        ko: "음악가",
      },
    ],
    description: {
      zh: "想象力丰富且独创，喜欢自由的环境。讨厌墨守成规，情感表达丰富。",
      en: "Imaginative and original, prefers free environments. Dislikes routine and is emotionally expressive.",
      es: "Imaginativo y original, prefiere ambientes libres. Odia la rutina y es emocionalmente expresivo.",
      fr: "Imaginatif et original, préfère les environnements libres. Déteste la routine et est expressif émotionnellement.",
      ja: "想像力が豊かで独創的であり、自由な環境を好みます。型にはまったことを嫌い、感情表現が豊かです。",
      ko: "상상력이 풍부하고 독창적이며, 자유로운 환경을 선호합니다. 틀에 박힌 것을 싫어하고 감정 표현이 풍부합니다.",
    },
    title: {
      zh: "艺术型 (Artistic)",
      en: "The Creator (Artistic)",
      es: "El Creador (Artistic)",
      fr: "Le Créateur (Artistic)",
      ja: "芸術的 (Artistic)",
      ko: "예술형 (Artistic)",
    },
  },
  Conventional: {
    careers: [
      {
        zh: "会计师",
        en: "Accountant",
        es: "Contador",
        fr: "Comptable",
        ja: "会計士",
        ko: "회계사",
      },
      {
        zh: "职员",
        en: "Clerk",
        es: "Oficinista",
        fr: "Employé",
        ja: "事務員",
        ko: "사무원",
      },
      {
        zh: "数据分析师",
        en: "Data Analyst",
        es: "Analista de datos",
        fr: "Analyste de données",
        ja: "データアナリスト",
        ko: "데이터 분석가",
      },
    ],
    description: {
      zh: "准确系统，喜欢整理和记录数据。遵守规则，责任感强。",
      en: "Accurate and systematic, likes organizing and recording data. Follows rules and has a strong sense of responsibility.",
      es: "Preciso y sistemático, le gusta organizar y registrar datos. Sigue las reglas y tiene un fuerte sentido de la responsabilidad.",
      fr: "Précis et systématique, aime organiser et enregistrer des données. Respecte les règles et a un fort sens des responsabilités.",
      ja: "正確で体系的であり、資料を整理し記録することを好みます。規則を遵守し責任感が強いです。",
      ko: "정확하고 체계적이며, 자료를 정리하고 기록하는 일을 좋아합니다. 규칙을 준수하고 책임감이 강합니다.",
    },
    title: {
      zh: "常规型 (Conventional)",
      en: "The Organizer (Conventional)",
      es: "El Organizador (Conventional)",
      fr: "L'Organisateur (Conventional)",
      ja: "慣習的 (Conventional)",
      ko: "관습형 (Conventional)",
    },
  },
  Enterprising: {
    careers: [
      {
        zh: "高管",
        en: "Executive",
        es: "Ejecutivo",
        fr: "Cadre",
        ja: "経営者",
        ko: "경영자",
      },
      {
        zh: "律师",
        en: "Lawyer",
        es: "Abogado",
        fr: "Avocat",
        ja: "弁護士",
        ko: "변호사",
      },
      {
        zh: "销售专家",
        en: "Sales Expert",
        es: "Experto en ventas",
        fr: "Expert en vente",
        ja: "営業専門家",
        ko: "영업 전문가",
      },
    ],
    description: {
      zh: "有领导力和说服力，目标导向。重视经济成就和社会地位。",
      en: "Has leadership and persuasive skills, goal-oriented. Values economic achievement and social status.",
      es: "Tiene liderazgo y habilidades de persuasión, orientado a objetivos. Valora el logro económico y el estatus social.",
      fr: "A du leadership et des compétences de persuasion, axé sur les objectifs. Valorise la réussite économique et le statut social.",
      ja: "リーダーシップがあり説得力があり、目標志向的です。経済的な成就と社会的地位を重要視します。",
      ko: "리더십이 있고 설득력이 있으며, 목표 지향적입니다. 경제적 성취와 사회적 지위를 중요하게 생각합니다.",
    },
    title: {
      zh: "企业型 (Enterprising)",
      en: "The Persuader (Enterprising)",
      es: "El Persuasor (Enterprising)",
      fr: "Le Persuadeur (Enterprising)",
      ja: "企業的 (Enterprising)",
      ko: "진취형 (Enterprising)",
    },
  },
  Investigative: {
    careers: [
      {
        zh: "科学家",
        en: "Scientist",
        es: "Científico",
        fr: "Scientifique",
        ja: "科学者",
        ko: "과학자",
      },
      {
        zh: "研究员",
        en: "Researcher",
        es: "Investigador",
        fr: "Chercheur",
        ja: "研究員",
        ko: "연구원",
      },
      {
        zh: "医生",
        en: "Doctor",
        es: "Médico",
        fr: "Médecin",
        ja: "医師",
        ko: "의사",
      },
    ],
    description: {
      zh: "逻辑分析能力强，求知欲强。享受解决和理解复杂问题的过程。",
      en: "Logical and analytical, with strong intellectual curiosity. Enjoys the process of solving and understanding complex problems.",
      es: "Lógico y analítico, con gran curiosidad intelectual. Disfruta el proceso de resolver y comprender problemas complejos.",
      fr: "Logique et analytique, avec une forte curiosité intellectuelle. Apprécie le processus de résolution et de compréhension de problèmes complexes.",
      ja: "論理的で分析的であり、知的好奇心が強いです。複雑な問題を解決し理解する過程を楽しみます。",
      ko: "논리적이고 분석적이며, 지적 호기심이 강합니다. 복잡한 문제를 해결하고 이해하는 과정을 즐깁니다.",
    },
    title: {
      zh: "研究型 (Investigative)",
      en: "The Thinker (Investigative)",
      es: "El Pensador (Investigative)",
      fr: "Le Penseur (Investigative)",
      ja: "研究的 (Investigative)",
      ko: "탐구형 (Investigative)",
    },
  },
  Realistic: {
    careers: [
      {
        zh: "工程师",
        en: "Engineer",
        es: "Ingeniero",
        fr: "Ingénieur",
        ja: "エンジニア",
        ko: "엔지니어",
      },
      {
        zh: "建筑师",
        en: "Architect",
        es: "Arquitecto",
        fr: "Architecte",
        ja: "建築家",
        ko: "건축가",
      },
      {
        zh: "农民",
        en: "Farmer",
        es: "Granjero",
        fr: "Agriculteur",
        ja: "農家",
        ko: "농부",
      },
    ],
    description: {
      zh: "诚实真诚，喜欢与机器或工具打交道。喜欢用行动而不是言语来表达。",
      en: "Honest and sincere, prefers working with machines or tools. Likes to show through action rather than words.",
      es: "Honesto y sincero, prefiere trabajar con máquinas o herramientas. Le gusta demostrar con hechos más que con palabras.",
      fr: "Honnête et sincère, préfère travailler avec des machines ou des outils. Aime montrer par l'action plutôt que par les mots.",
      ja: "正直で誠実であり、機械や道具を扱う仕事を好みます。言葉少なく行動で示すことを好みます。",
      ko: "솔직하고 성실하며, 기계나 도구를 다루는 일을 선호합니다. 말이 적고 행동으로 보여주는 것을 좋아합니다.",
    },
    title: {
      zh: "现实型 (Realistic)",
      en: "The Doer (Realistic)",
      es: "El Hacedor (Realistic)",
      fr: "Le Pratiquant (Realistic)",
      ja: "現実的 (Realistic)",
      ko: "실재형 (Realistic)",
    },
  },
  Social: {
    careers: [
      {
        zh: "教师",
        en: "Teacher",
        es: "Maestro",
        fr: "Enseignant",
        ja: "教師",
        ko: "교사",
      },
      {
        zh: "咨询师",
        en: "Counselor",
        es: "Consejero",
        fr: "Conseiller",
        ja: "カウンセラー",
        ko: "상담사",
      },
      {
        zh: "社工",
        en: "Social Worker",
        es: "Trabajador social",
        fr: "Travailleur social",
        ja: "ソーシャルワーカー",
        ko: "사회복지사",
      },
    ],
    description: {
      zh: "喜欢帮助和教导他人，善良且善解人意。人际交往能力出色。",
      en: "Likes helping and teaching people, kind and understanding. Excellent interpersonal skills.",
      es: "Le gusta ayudar y enseñar a la gente, amable y comprensivo. Excelentes habilidades interpersonales.",
      fr: "Aime aider et enseigner aux gens, gentil et compréhensif. Excellentes compétences interpersonnelles.",
      ja: "人々を助け教えることを好み、親切で理解力があります。対人関係のスキルが優れています。",
      ko: "사람들을 돕고 가르치는 것을 좋아하며, 친절하고 이해심이 많습니다. 대인 관계 기술이 뛰어납니다.",
    },
    title: {
      zh: "社会型 (Social)",
      en: "The Helper (Social)",
      es: "El Ayudador (Social)",
      fr: "L'Aidant (Social)",
      ja: "社会的 (Social)",
      ko: "사회형 (Social)",
    },
  },
};

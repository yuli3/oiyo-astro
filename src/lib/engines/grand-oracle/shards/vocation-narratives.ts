import type { SixLangString } from "../../interpretation/engine.contract";

export const VOCATION_PATHWAYS: Record<string, SixLangString> = {
  // A - Artistic
  A: {
    en: "The path of the Creator. Chaos is your canvas. You translate the inexpressible into forms that others can feel and understand.",
    es: "El camino del Creador. El caos es tu lienzo. Traduces lo inexpresable en formas que otros pueden sentir y comprender.",
    fr: "Le chemin du Créateur. Le chaos est votre toile. Vous traduisez l'inexprimable en formes que les autres peuvent ressentir et comprendre.",
    ja: "創造者の道。混沌はあなたのキャンバスです。あなたは言葉にできないものを、他者が感じ理解できる形に翻訳します。",
    ko: "창조자의 길. 혼돈은 당신의 캔버스입니다. 당신은 말로 표현할 수 없는 것들을 타인이 느끼고 이해할 수 있는 형태로 번역합니다.",
    zh: "创造者之路。混沌是你的画布。你将无法言表的事物转化为他人能够感受和理解的形式。",
  },
  // C - Conventional
  C: {
    en: "The path of the Architect. Order is your legacy. You build the systems and structures that allow greatness to endure over time.",
    es: "El camino del Arquitecto. El orden es tu legado. Construyes los sistemas y estructuras que permiten que la grandeza perdure en el tiempo.",
    fr: "Le chemin de l'Architecte. L'ordre est votre héritage. Vous construisez des systèmes et des structures qui permettent à la grandeur de perdurer dans le temps.",
    ja: "設計者の道。秩序はあなたの遺産です。あなたは、偉大さが時を越えて持続するためのシステムや構造を構築します。",
    ko: "설계자의 길. 질서는 당신의 유산입니다. 당신은 위대함이 시간이 지나도 지속될 수 있도록 시스템과 구조를 구축합니다.",
    zh: "建筑师之路。秩序是你的遗产。你建立系统和结构，让伟大得以跨越时间的长河。",
  },
  // E - Enterprising
  E: {
    en: "The path of the Visionary. Influence is your medium. You see what could be, and you have the audacity to persuade the world to follow.",
    es: "El camino del Visionario. La influencia es tu medio. Ves lo que podría ser y tienes la audacia de persuadir al mundo para que te siga.",
    fr: "Le chemin du Visionnaire. L'influence est votre média. Vous voyez ce qui pourrait être, et vous avez l'audace de persuader le monde de vous suivre.",
    ja: "ビジョナリーの道。影響力はあなたの媒体です。あなたはあるべき姿を見据え、世界がそれに従うよう説得する大胆さを持っています。",
    ko: "비전가의 길. 영향력은 당신의 매개체입니다. 당신은 '가능한 미래'를 보며, 세상이 그 길을 따르도록 설득하는 대담함을 가졌습니다.",
    zh: "愿景家之路。影响力是你的媒介。你看到了未来的可能，并有胆量说服世界追随你的脚步。",
  },
  // I - Investigative
  I: {
    en: "The path of the Scholar. Your mind is a blade that dissects complexity. You honor the world by understanding its deepest mechanisms.",
    es: "El camino del Erudito. Tu mente es una hoja que disecciona la complejidad. Honras al mundo comprendiendo sus mecanismos más profundos.",
    fr: "Le chemin de l'Érudit. Votre esprit est une lame qui dissèque la complexité. Vous honorez le monde en comprenant ses mécanismes les plus profonds.",
    ja: "学者の道。あなたの知性は複雑さを解剖する刃です。あなたは世界の最も深い仕組みを理解することで、世界に敬意を表します。",
    ko: "학자의 길. 당신의 지성은 복잡함을 해부하는 칼날입니다. 당신은 세상의 가장 깊은 메커니즘을 이해함으로써 세상에 경의를 표합니다.",
    zh: "学者之路。你的思想是解剖复杂性的利刃。你通过理解世界最深层的机制来向世界致敬。",
  },
  // R - Realistic
  R: {
    en: "The path of the Maker. Your hands are the extension of your will. You find truth in what can be touched, built, and fixed.",
    es: "El camino del Hacedor. Tus manos son la extensión de tu voluntad. Encuentras la verdad en lo que se puede tocar, construir y arreglar.",
    fr: "Le chemin du Créateur technique. Vos mains sont l'extension de votre volonté. Vous trouvez la vérité dans ce qui peut être touché, construit et réparé.",
    ja: "製作者の道。あなたの手は自らの意志の延長です。あなたは、触れられ、建てられ、直されるものの中に真実を見出します。",
    ko: "제작자의 길. 당신의 손은 의지의 연장입니다. 당신은 만질 수 있고, 지을 수 있고, 고칠 수 있는 것에서 진실을 찾습니다.",
    zh: "制造者之路。你的双手是意志的延伸。你在可触碰、可建造和可修复的事物中寻找真理。",
  },
  // S - Social
  S: {
    en: "The path of the Humanist. Souls are your garden. You cultivate potentital in others, finding your own purpose in their growth.",
    es: "El camino del Humanista. Las almas son tu jardín. Cultivas el potencial en los demás, encontrando tu propio propósito en su crecimiento.",
    fr: "Le chemin de l'Humaniste. Les âmes sont votre jardin. Vous cultivez le potentiel chez les autres, trouvant votre propre but dans leur croissance.",
    ja: "ヒューマニストの道。魂はあなたの庭です。あなたは他者の潜在能力を育み、彼らの成長の中に自らの目的を見出します。",
    ko: "휴머니스트의 길. 영혼은 당신의 정원입니다. 당신은 타인의 잠재력을 경작하며, 그들의 성장 속에서 자신의 목적을 찾습니다.",
    zh: "人文主义者之路。灵魂是你的花园。你在他人身上培养潜力，在他人的成长中寻找自己的目标。",
  },
};

/**
 * Ten God x RIASEC Synergy Matrix
 * Maps dominant Ten God archetypes to synergistic career directions.
 */
export const TEN_GOD_RIASEC_SYNERGY: Record<
  string,
  { careers: SixLangString; synergy: SixLangString }
> = {
  BI_GYEON: {
    careers: {
      en: "Entrepreneurship, Freelance Consulting, Competitive Sports, Solo Practice (Law, Medicine)",
      es: "Emprendimiento, Consultoría Freelance, Deportes Competitivos, Práctica Individual (Leyes, Medicina)",
      fr: "Entrepreneuriat, Conseil indépendant, Sports de compétition, Cabinet individuel (Droit, Médecine)",
      ja: "起業、フリーランス・コンサルティング、競技スポーツ、個人開業（法務、医術）",
      ko: "창업, 프리랜서 컨설팅, 경쟁형 스포츠, 1인 전문직 (변호사, 의사)",
      zh: "创业、自由职业咨询、竞技体育、私人执业（律师、医生）",
    },
    synergy: {
      en: "Your independent 'Companion Star' thrives in self-directed careers where you set the pace.",
      es: "Tu 'Estrella Compañera' independiente prospera en carreras autodirigidas donde tú marcas el ritmo.",
      fr: "Votre 'Étoile Compagnon' indépendante s'épanouit dans des carrières autodirigées où vous fixez le rythme.",
      ja: "自らペースを決める自己主導型のキャリアにおいて、独立心の強い「比肩」が輝きます。",
      ko: "자기 주도형 커리어에서 속도를 정하는 독립적인 '비견(比肩)'이 빛을 발합니다.",
      zh: "你独立的“比肩”星在自我主导的职业中蓬勃发展，在那里你可以自己设定节奏。",
    },
  },
  GEOP_JAE: {
    careers: {
      en: "Sales, Investment Banking, Startups, Competitive Markets",
      es: "Ventas, Banca de Inversión, Startups, Mercados Competitivos",
      fr: "Vente, Banque d'investissement, Startups, Marchés compétitifs",
      ja: "営業、投資銀行、スタートアップ、競争市場",
      ko: "영업, 투자은행, 스타트업, 경쟁 시장",
      zh: "销售、投资银行、初创企业、竞争激烈的市场",
    },
    synergy: {
      en: "Your 'Rob Wealth' star craves the adrenaline of high-stakes environments.",
      es: "Tu estrella 'Robo de Riqueza' anhela la adrenalina de los entornos de alto riesgo.",
      fr: "Votre étoile 'Pillage de Richesse' a soif de l'adrénaline des environnements à enjeux élevés.",
      ja: "あなたの「劫財」は、ハイリスクな環境のアドレナリンを渇望します。",
      ko: "당신의 '겁재(劫財)'는 고위험 환경의 아드레날린을 갈구합니다.",
      zh: "你的“劫财”星渴望高风险环境带来的肾上腺素。",
    },
  },
  JEONG_GWAN: {
    careers: {
      en: "Government, Law, Corporate Management, Academia (Tenured)",
      es: "Gobierno, Leyes, Gestión Corporativa, Academia (Titular)",
      fr: "Gouvernement, Droit, Gestion d'entreprise, Academia (Titulaire)",
      ja: "公務員、法曹界、企業経営、アカデミア（終身雇用制）",
      ko: "공무원, 법조계, 기업 경영진, 학계 (정년 트랙)",
      zh: "政府部门、法律、企业管理、学术界（终身教职）",
    },
    synergy: {
      en: "The 'Direct Officer' finds fulfillment in structured hierarchies and clear paths to recognition.",
      es: "El 'Oficial Directo' encuentra satisfacción en jerarquías estructuradas y caminos claros hacia el reconocimiento.",
      fr: "L' 'Officier Direct' trouve son accomplissement dans les hiérarchies structurées et les voies claires vers la reconnaissance.",
      ja: "「正官」は、体系化されたヒエラルキーと、認められるための明確な道筋の中に達成感を見出します。",
      ko: "'정관(正官)'은 체계적인 위계와 명확한 인정 경로에서 성취감을 찾습니다.",
      zh: "“正官”在结构化的等级制度和明确的认可途径中寻找成就感。",
    },
  },
  JEONG_IN: {
    careers: {
      en: "Teaching, Research, Publishing, Mentorship Programs",
      es: "Enseñanza, Investigación, Publicación, Programas de Mentoría",
      fr: "Enseignement, Recherche, Édition, Programmes de mentorat",
      ja: "教育、研究、出版、メンターシップ・プログラム",
      ko: "교육, 연구, 출판, 멘토십 프로그램",
      zh: "教学、研究、出版、导师计划",
    },
    synergy: {
      en: "The 'Direct Seal' flourishes where wisdom is passed down and knowledge is revered.",
      es: "El 'Sello Directo' florece donde se transmite la sabiduría y se venera el conocimiento.",
      fr: "Le 'Sceau Direct' s'épanouit là où la sagesse est transmise et la connaissance est vénérée.",
      ja: "「正印」は、智慧が継承され、知識が尊ばれる場所で繁栄します。",
      ko: "'정인(正印)'은 지혜가 전수되고 지식이 존중받는 곳에서 번영합니다.",
      zh: "“正印”在智慧传承和知识受人尊敬的地方茁壮成长。",
    },
  },
  JEONG_JAE: {
    careers: {
      en: "Accounting, Financial Planning, Real Estate Management, Steady Employment",
      es: "Contabilidad, Planificación Financiera, Gestión de Bienes Raíces, Empleo Estable",
      fr: "Comptabilité, Planification financière, Gestion immobilière, Emploi stable",
      ja: "会計、ファイナンシャル・プランニング、不動産管理、安定雇用",
      ko: "회계, 재무 계획, 부동산 관리, 안정적 고용",
      zh: "会计、财务规划、房地产管理、稳定就业",
    },
    synergy: {
      en: "The 'Direct Wealth' star builds lasting security through patient accumulation.",
      es: "La estrella 'Riqueza Directa' construye una seguridad duradera a través de la acumulación paciente.",
      fr: "L'étoile 'Richesse Directe' construit une sécurité durable grâce à une accumulation patiente.",
      ja: "「正財」は、忍耐強い蓄積を通じて永続的な安定を築きます。",
      ko: "'정재(正財)'는 인내심 있는 축적을 통해 지속적인 안정을 구축합니다.",
      zh: "“正财”星通过耐心的积累建立持久的安全感。",
    },
  },
  PYEON_GWAN: {
    careers: {
      en: "Military, Emergency Services, Crisis Management, High-Pressure Roles",
      es: "Militar, Servicios de Emergencia, Gestión de Crisis, Roles de Alta Presión",
      fr: "Militaire, Services d'urgence, Gestion de crise, Rôles de haute pression",
      ja: "軍、救急サービス、危機管理、高負荷な役割",
      ko: "군인, 응급 서비스, 위기 관리, 고압적 역할",
      zh: "军事、应急服务、危机管理、高压角色",
    },
    synergy: {
      en: "The 'Seven Killings' star transforms pressure into power, thriving where others buckle.",
      es: "La estrella 'Siete Asesinatos' transforma la presión en poder, prosperando donde otros se rinden.",
      fr: "L'étoile 'Sept Tueries' transforme la pression en pouvoir, s'épanouissant là où les autres cèdent.",
      ja: "「七殺（偏官）」はプレッシャーを力に変え、他者が屈するような場所で繁栄します。",
      ko: "'편관(偏官, 칠살)'은 압박을 힘으로 전환하며, 타인이 굴복하는 곳에서 빛납니다.",
      zh: "“七杀”星将压力转化为动力，在他人屈服的地方茁壮成长。",
    },
  },
  PYEON_IN: {
    careers: {
      en: "Alternative Medicine, Occult Arts, Esoteric Studies, Unconventional Research",
      ko: "대체 의학, 신비학, 비전 연구, 비전통적 연구",
    },
    synergy: {
      en: "The 'Indirect Seal' finds truth in the uncharted territories of knowledge.",
      ko: "'편인(偏印)'은 지식의 미지의 영역에서 진실을 찾습니다.",
    },
  },
  PYEON_JAE: {
    careers: {
      en: "Trading, Venture Capital, Real Estate Speculation, Entertainment Industry",
      ko: "트레이딩, 벤처 캐피탈, 부동산 투기, 엔터테인먼트 산업",
    },
    synergy: {
      en: "The 'Indirect Wealth' star rides the waves of fortune, comfortable with risk.",
      ko: "'편재(偏財)'는 행운의 파도를 타며 위험에 편안합니다.",
    },
  },
  SANG_GWAN: {
    careers: {
      en: "Performance Arts, Avant-Garde Design, Social Activism, Disruptive Startups",
      ko: "공연 예술, 아방가르드 디자인, 사회 운동, 파괴적 스타트업",
    },
    synergy: {
      en: "The 'Hurting Officer' challenges conventions, creating new paradigms through rebellion.",
      ko: "'상관(傷官)'은 관습에 도전하며 반항을 통해 새로운 패러다임을 창출합니다.",
    },
  },
  SIK_SIN: {
    careers: {
      en: "Culinary Arts, Content Creation (YouTube, Writing), Wellness & Lifestyle Coaching",
      ko: "요리 예술, 콘텐츠 제작 (유튜브, 글쓰기), 웰니스 및 라이프스타일 코칭",
    },
    synergy: {
      en: "The 'Eating God' finds purpose in sharing pleasure and creativity with the world.",
      ko: "'식신(食神)'은 기쁨과 창의성을 세상과 나누는 데서 목적을 찾습니다.",
    },
  },
};

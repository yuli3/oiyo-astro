import { SixLangString } from "../engine.contract";

/**
 * Kabbalah Shard Data
 * Sephirot and Pillar narratives separated from logic.
 */

export const SEPHIROT_NARRATIVES: Record<
  string,
  {
    narrative: SixLangString;
    pillar: "Mercy" | "Middle" | "Severity";
  }
> = {
  binah: {
    narrative: {
      en: "Binah (Understanding): The great receptive intelligence. You possess the power to give form to ideas, to understand deeply, and to nurture concepts into reality.",
      es: "Binah (Entendimiento): La gran inteligencia receptiva. Posees el poder de dar forma a las ideas, de comprender profundamente y de nutrir conceptos hacia la realidad.",
      fr: "Binah (Compréhension) : La grande intelligence réceptive. Vous possédez le pouvoir de donner forme aux idées, de comprendre profondément et de nourrir des concepts vers la réalité.",
      ja: "ビナー（理解）：偉大な受容的知性. 아이디어에 형태를 부여하고, 깊이 이해하고, 개념을 현실로 양육하는 힘을 가지고 있습니다.",
      ko: "비나 (이해): 위대한 수용적 지성. 아이디어에 형태를 부여하고, 깊이 이해하고, 개념을 현실로 양육하는 힘을 가지고 있습니다.",
      zh: "比纳（理解）：伟大的接受性智慧。你拥有赋予想法形式、深刻理解并将概念培育成现实的力量。",
    },
    pillar: "Severity",
  },
  chesed: {
    narrative: {
      en: "Chesed (Mercy/Loving-kindness): The outpouring of divine love. You embody generosity, expansion, and unconditional giving. Your path is one of abundance and grace.",
      es: "Chesed (Misericordia): El derramamiento del amor divino. Encarnas la generosidad, la expansión y el dar incondicional. Tu camino es de abundancia y gracia.",
      fr: "Chesed (Miséricorde) : L'effusion de l'amour divin. Vous incarnez la générosité, l'expansion et le don inconditionnel. Votre chemin est celui de l'abondance et de la grâce.",
      ja: "ヘセド（慈悲/愛のある親切）：神聖な愛の流出. 관대함, 확장, 무조건적인 베풂을 구현합니다. 당신의 길은 풍요와 은총의 길입니다.",
      ko: "헤세드 (자비/사랑의 친절): 신성한 사랑의 분출. 관대함, 확장, 무조건적인 베풂을 구현합니다. 당신의 길은 풍요와 은총의 길입니다.",
      zh: "赫塞德（仁慈）：神圣之爱的倾泻。你体现慷慨、扩展和无条件的给予。你的道路是丰盛和恩典之路。",
    },
    pillar: "Mercy",
  },
  chokhmah: {
    narrative: {
      en: "Chokhmah (Wisdom): The flash of divine inspiration. You carry the seed of creative potential, the first burst of energy that initiates all manifestation.",
      es: "Chokhmah (Sabiduría): El destello de la inspiración divina. Llevas la semilla del potencial creativo, el primer estallido de energía que inicia toda manifestación.",
      fr: "Chokhmah (Sagesse) : L'éclair de l'inspiration divine. Vous portez la graine du potentiel créatif, la première explosion d'énergie qui initie toute manifestation.",
      ja: "ホクマー（知恵）：神聖なインスピレーションの閃き. 창조적 잠재력의 씨앗, 모든 현현을 시작하는 첫 번째 에너지 폭발을 지니고 있습니다.",
      ko: "호크마 (지혜): 신성한 영감의 섬광. 창조적 잠재력의 씨앗, 모든 현현을 시작하는 첫 번째 에너지 폭발을 지니고 있습니다.",
      zh: "霍克玛（智慧）：神圣灵感的闪光。你携带创造潜力的种子，启动所有显化的第一道能量爆发。",
    },
    pillar: "Mercy",
  },
  gevurah: {
    narrative: {
      en: "Gevurah (Severity/Strength): The power of restraint and judgment. You possess strong boundaries, discipline, and the courage to remove what is unnecessary.",
      es: "Gevurah (Severidad/Fuerza): El poder de la restricción y el juicio. Posees límites fuertes, disciplina y el coraje para eliminar lo innecesario.",
      fr: "Gevurah (Rigueur/Force) : Le pouvoir de la retenue et du jugement. Vous possédez des limites fortes, de la discipline et le courage de supprimer ce qui est inutile.",
      ja: "ゲブラー (厳格/力): 節制と審判の力。強い境界、規律、そして不要なものを排除する勇気を持っています。",
      ko: "게부라 (엄격/힘): 절제와 심판의 힘. 강한 경계, 규율, 그리고 불필요한 것을 제거하는 용기를 가지고 있습니다.",
      zh: "格布拉（严厉/力量）：克制和审判的力量。你拥有强大的界限感、纪律以及移除不必要事物的勇气。",
    },
    pillar: "Severity",
  },
  hod: {
    narrative: {
      en: "Hod (Splendor/Glory): The analytical and communicative intelligence. You value logic, communication, and the intellectual structures that organize reality.",
      es: "Hod (Esplendor/Gloria): La inteligencia analítica y comunicativa. Valoras la lógica, la comunicación y las estructuras intelectuales.",
      fr: "Hod (Splendeur/Gloire) : L'intelligence analytique et communicative. Vous valorisez la logique, la communication et les structures intellectuelles.",
      ja: "ホド (栄光/輝き): 分析的でコミュニケーション能力の高い知性。論理、コミュニケーション、そして現実を構成する知的構造を大切にします。",
      ko: "호드 (영광/광휘): 분석적이고 소통적인 지성. 논리, 소통, 현실을 조직하는 지적 구조를 소중히 여깁니다.",
      zh: "霍德（荣光）：分析和沟通的智慧。你重视逻辑、沟通以及组织现实的智力结构。",
    },
    pillar: "Severity",
  },
  keter: {
    narrative: {
      en: "Keter (Crown): The highest point of divine will. You are connected to pure consciousness and the source of all creation. Your life purpose involves transcendence and spiritual clarity.",
      es: "Keter (Corona): El punto más alto de la voluntad divina. Estás conectado con la conciencia pura y la fuente de toda creación. Tu propósito de vida implica trascendencia y claridad espiritual.",
      fr: "Keter (Couronne) : Le point culminant de la volonté divine. Vous êtes connecté à la conscience pure et à la source de toute création. Votre but de vie implique la transcendance et la clarté spirituelle.",
      ja: "ケテル（王冠）：神聖な意志の最高点. 순수 의식과 모든 창조의 근원과 연결되어 있습니다. 인생 목적은 초월과 영적 명료함을 포함합니다.",
      ko: "케테르 (왕관): 신성한 의지의 가장 높은 지점. 순수 의식과 모든 창조의 근원과 연결되어 있습니다. 인생 목적은 초월과 영적 명료함을 포함합니다.",
      zh: "凯特（王冠）：神圣意志的最高点。你与纯粹意识和所有创造的源头相连。你的人生目的涉及超越和灵性清明。",
    },
    pillar: "Middle",
  },
  malkhut: {
    narrative: {
      en: "Malkhut (Kingdom): The material world manifest. You are grounded in physical reality, called to bring spiritual wisdom into tangible form and action.",
      es: "Malkhut (Reino): El mundo material manifestado. Estás arraigado en la realidad física, llamado a traer sabiduría espiritual a formas tangibles y acción.",
      fr: "Malkhut (Royaume) : Le monde matériel manifesté. Vous êtes ancré dans la réalité physique, appelé à apporter la sagesse spirituelle sous une forme tangible et dans l'action.",
      ja: "マルクト（王国）：顕現した物質世界. 물리적 현실에 기반을 두고, 영적 지혜를 실체적 형태와 행동으로 가져오도록 부름받았습니다.",
      ko: "말쿠트 (왕국): 현현된 물질 세계. 물리적 현실에 기반을 두고, 영적 지혜를 실체적 형태와 행동으로 가져오도록 부름받았습니다.",
      zh: "马尔库特（王国）：显化的物质世界。你扎根于物质现实，被召唤将灵性智慧带入有形的形式和行动。",
    },
    pillar: "Middle",
  },
  netzach: {
    narrative: {
      en: "Netzach (Victory/Endurance): The force of persistent emotion and desire. You possess great endurance, artistic passion, and the power to overcome obstacles through feeling.",
      es: "Netzach (Victoria/Eternidad): La fuerza de la emoción y el deseo persistentes. Posees gran resistencia, pasión artística y el poder de superar obstáculos.",
      fr: "Netzach (Victoire/Éternité) : La force de l'émotion et du désir persistants. Vous possédez une grande endurance, une passion artistique et le pouvoir de surmonter les obstacles.",
      ja: "ネツァク (勝利/忍耐): 持続的な感情と欲求の力。強い忍耐力、芸術的な情熱、そして感情を通じて障害を克服する力を持っています。",
      ko: "네차흐 (승리/인내): 지속적인 감정과 욕망의 힘. 강한 인내심, 예술적 열정, 감정을 통해 장애물을 극복하는 힘을 가지고 있습니다.",
      zh: "内扎（胜利/永恒）：持久情感和欲望的力量。你拥有强大的忍耐力、艺术激情以及通过情感克服障碍的力量。",
    },
    pillar: "Mercy",
  },
  tiferet: {
    narrative: {
      en: "Tiferet (Beauty/Harmony): The heart center of the Tree. You are called to integrate opposites, to find beauty in balance, and to embody compassionate truth.",
      es: "Tiferet (Belleza): El centro del corazón del Árbol. Estás llamado a integrar los opuestos, a encontrar belleza en el equilibrio y a encarnar la verdad compasiva.",
      fr: "Tiferet (Beauté/Harmonie) : Le centre du cœur de l'Arbre. Vous êtes appelé à intégrer les opposés, à trouver la beauté dans l'équilibre et à incarner la vérité compatissante.",
      ja: "ティフェレト（美/調和）：木の心臓の中心. 반대를 통합하고, 균형 속에서 아름다움을 찾고, 자비로운 진리를 구현하도록 부름받았습니다.",
      ko: "티페렛 (아름다움/조화): 나무의 심장 중심. 반대를 통합하고, 균형 속에서 아름다움을 찾고, 자비로운 진리를 구현하도록 부름받았습니다.",
      zh: "提费雷特（美丽/和谐）：生命之树的心脏中心。你被召唤去整合对立面，在平衡中寻找美丽，并体现慈悲的真理。",
    },
    pillar: "Middle",
  },
  yesod: {
    narrative: {
      en: "Yesod (Foundation): The astral gateway between worlds. You have a strong connection to dreams, imagination, and the subtle energies that underpin reality.",
      es: "Yesod (Fundamento): La puerta astral entre mundos. Tienes una fuerte conexión con los sueños, la imaginación y las energías sutiles que sustentan la realidad.",
      fr: "Yesod (Fondation) : La porte astrale entre les mondes. Vous avez une forte connexion aux rêves, à l'imagination et aux énergies subtiles qui soutiennent la réalité.",
      ja: "イェソド（基盤）：世界間のアストラルゲートウェイ. 꿈, 상상력, 그리고 현실을 뒷받침하는 미묘한 에너지와 강한 연결을 가지고 있습니다.",
      ko: "예소드 (기초): 세계 사이의 아스트랄 관문. 꿈, 상상력, 그리고 현실을 뒷받침하는 미묘한 에너지와 강한 연결을 가지고 있습니다.",
      zh: "耶索德（基础）：世界之间的星光门户。你与梦想、想象力以及支撑现实的微妙能量有着强烈的联系。",
    },
    pillar: "Middle",
  },
};

export const PILLAR_NARRATIVES: Record<string, SixLangString> = {
  Mercy: {
    en: "Pillar of Mercy (Right): Your soul leans toward expansion, giving, and active creation. You are called to share abundance and inspire growth.",
    es: "Pilar de la Misericordia (Derecha): Tu alma se inclina hacia la expansión, el dar y la creación activa. Estás llamado a compartir la abundancia e inspirar el crecimiento.",
    fr: "Pilier de la Miséricorde (Droite) : Votre âme penche vers l'expansion, le don et la création active. Vous êtes appelé à partager l'abondance et à inspirer la croissance.",
    ja: "慈悲の柱（右）：あなたの魂は拡大、与えること、そして積極的な創造に傾いています。豊かさを分かち合い、成長にインスピレーションを与えるよう呼ばれています。",
    ko: "자비의 기둥 (오른쪽): 당신의 영혼은 확장, 베풂, 그리고 적극적인 창조를 향합니다. 풍요를 나누고 성장에 영감을 주도록 부름받았습니다.",
    zh: "慈悲之柱（右）：你的灵魂倾向于扩展、给予和积极创造。你被召唤分享丰盛并激励成长。",
  },
  Middle: {
    en: "Pillar of Balance (Center): Your soul walks the path of integration, balancing mercy and severity, expansion and contraction.",
    es: "Pilar del Equilibrio (Centro): Tu alma camina por el sendero de la integración, equilibrando misericordia y severidad, expansión y contracción.",
    fr: "Pilier de l'Équilibre (Centre) : Votre âme marche sur le chemin de l'intégration, équilibrant miséricorde et rigueur, expansion et contraction.",
    ja: "均衡の柱（中央）：あなたの魂は統合の道を歩み、慈悲と厳格、拡大と収縮のバランスを取ります。",
    ko: "균형의 기둥 (중앙): 당신의 영혼은 통합의 길을 걷고, 자비와 엄격, 확장과 수축의 균형을 맞춥니다.",
    zh: "平衡之柱（中央）：你的灵魂走在整合之路上，平衡慈悲与严厉、扩展与收缩。",
  },
  Severity: {
    en: "Pillar of Severity (Left): Your soul leans toward structure, discipline, and discernment. You are called to set boundaries and refine through challenge.",
    es: "Pilar de la Severidad (Izquierda): Tu alma se inclina hacia la estructura, la disciplina y el discernimiento. Estás llamado a establecer límites y refinar a través del desafío.",
    fr: "Pilier de la Rigueur (Gauche) : Votre âme penche vers la structure, la discipline et le discernement. Vous êtes appelé à fixer des limites et à affiner par le défi.",
    ja: "厳格の柱（左）：あなたの魂は構造、規律、そして識別に傾いています。境界を設定し、挑戦を通じて精錬するよう呼ばれています。",
    ko: "엄격의 기둥 (왼쪽): 당신의 영혼은 구조, 훈련, 그리고 분별을 향합니다. 경계를 세우고 도전을 통해 정제하도록 부름받았습니다.",
    zh: "严厉之柱（左）：你的灵魂倾向于结构、纪律和辨别。你被召唤设立界限并通过挑战进行精炼。",
  },
};

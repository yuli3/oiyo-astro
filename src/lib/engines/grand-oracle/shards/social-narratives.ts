import { FiveElement } from "@/lib/ontology/saju/types";

import { SixLangString } from "../../interpretation/engine.contract";

/**
 * Saju Element x TCI Trait Matrix
 * Produces unique social archetypes based on the synergy of nature (Saju) and nurture (TCI).
 */
export const SOCIAL_MATRIX: Record<
  FiveElement,
  Record<"balanced" | "highHA" | "highNS" | "highRD", SixLangString>
> = {
  [FiveElement.EARTH]: {
    balanced: {
      en: "The Solid Foundation: You provide stability and reliability, a rock upon which others can build.",
      es: "La Fundación Sólida: Proporcionas estabilidad y confiabilidad, una roca sobre la cual otros pueden construir.",
      fr: "La Fondation Solide : Vous offrez stabilité et fiabilité, un rocher sur lequel les autres peuvent construire.",
      ja: "確かな基盤：あなたは安定性と信頼を提供し、他者が築き上げることのできる岩となります。",
      ko: "견고한 기반: 당신은 안정성과 신뢰를 제공하며, 타인들이 기반으로 삼을 수 있는 반석이 됩니다.",
      zh: "坚实的根基：你提供稳定性和可靠性，是他人赖以建设的基石。",
    },
    highHA: {
      en: "The Cautious Anchor: Your earthiness combined with high harm avoidance makes you exceptionally stable but perhaps risk-averse.",
      es: "El Ancla Cautelosa: Tu naturaleza terrenal combinada con una alta evitación del daño te hace excepcionalmente estable pero quizás reacio al riesgo.",
      fr: "L'Ancre Prudente : Votre nature terre-à-terre combinée à une forte évitement du danger vous rend exceptionnellement stable mais peut-être réticent à prendre des risques.",
      ja: "慎重な錨：土（土）の安定感と高い危険回避が結びつき、非常に安定していますが、おそらくリスクを避ける傾向があります。",
      ko: "신중한 닻: 토(土)의 안정감과 높은 위험 회피 기질이 결합하여 뛰어난 안정성을 제공하지만, 위험을 피하는 경향이 있습니다.",
      zh: "谨慎的锚点：你的稳重结合高损害回避，使你异常稳定，但可能厌恶风险。",
    },
    highNS: {
      en: "The Exploratory Pragmatist: You seek novelty while staying grounded, turning wild ideas into practical realities.",
      es: "El Pragmático Exploratorio: Buscas la novedad mientras te mantienes conectado a tierra, convirtiendo ideas salvajes en realidades prácticas.",
      fr: "Le Pragmatiste Explorateur : Vous recherchez la nouveauté tout en restant ancré, transformant les idées folles en réalités pratiques.",
      ja: "探索的な実務家：地に足をつけながら新奇さを求め、突拍子もないアイデアを実用的な現実に変えます。",
      ko: "실용적 탐험가: 기반을 유지하면서 새로움을 추구하여, 거친 아이디어를 실용적 현실로 전환합니다.",
      zh: "探索性的务实者：你在保持稳重的同时寻求新奇，将疯狂的想法转化为实际的现实。",
    },
    highRD: {
      en: "The Community Builder: Your earth nature combined with high reward dependence makes you the heart of any social group.",
      es: "El Constructor de Comunidad: Tu naturaleza de tierra combinada con una alta dependencia de la recompensa te convierte en el corazón de cualquier grupo social.",
      fr: "Le Bâtisseur de Communauté : Votre nature terreuse combinée à une forte dépendance à la récompense fait de vous le cœur de tout groupe social.",
      ja: "コミュニティー・ビルダー：あなたの土の性質と高い報酬依存が結びつき、あらゆる社会グループの中心となります。",
      ko: "공동체 건설자: 토(土)의 본성과 높은 보상 의존 기질이 결합하여 모든 사회 집단의 중심이 됩니다.",
      zh: "社区建设者：你的土属性天性结合高报酬依赖，使你成为任何社交群体的核心。",
    },
  },
  [FiveElement.FIRE]: {
    balanced: {
      en: "The Charismatic Visionary: Your passion is tempered with wisdom, inspiring others with grounded enthusiasm.",
      es: "El Visionario Carismático: Tu pasión está templada con sabiduría, inspirando a otros con entusiasmo fundamentado.",
      fr: "Le Visionnaire Charismatique : Votre passion est tempérée par la sagesse, inspirant les autres avec un enthousiasme ancré.",
      ja: "カリスマ的なビジョナリー：あなたの情熱は知恵によって和らげられ、地に足の着いた熱意で他者を鼓舞します。",
      ko: "카리스마 있는 비전가: 열정에 지혜가 더해져, 현실에 기반한 열정으로 타인을 고무시킵니다.",
      zh: "魅力的愿景家：你的热情与智慧相结合，用脚踏实地的热诚激励他人。",
    },
    highHA: {
      en: "The Controlled Flame: Your fire burns intensely but carefully, achieving through focused determination rather than reckless action.",
      es: "La Llama Controlada: Tu fuego arde intensamente pero con cuidado, logrando objetivos a través de una determinación enfocada en lugar de una acción temeraria.",
      fr: "La Flamme Contrôlée : Votre feu brûle intensément mais prudemment, s'accomplissant par une détermination ciblée plutôt que par une action imprudente.",
      ja: "制御された炎：あなたの火は強烈ながらも慎重に燃え、無謀な行動ではなく集中した決意によって成し遂げます。",
      ko: "조절된 불꽃: 당신의 불은 강렬하지만 신중하게 타올라, 무모함 대신 집중된 결단력으로 성취합니다.",
      zh: "受控的火焰：你的火燃烧得猛烈但缜密，通过专注的决心而非鲁莽的行动取得成就。",
    },
    highNS: {
      en: "The Dynamic Catalyst: Fire meets fire—your social presence is electric, sparking transformation wherever you go.",
      es: "El Catalizador Dinámico: El fuego se encuentra con el fuego; tu presencia social es eléctrica, provocando transformación dondequiera que vayas.",
      fr: "Le Catalyseur Dynamique : Le feu rencontre le feu - votre présence sociale est électrique, déclenchant la transformation partout où vous allez.",
      ja: "ダイナミックな触媒：火と火の出会い—あなたの社会的な存在感は電撃的で、行く先々で変容を巻き起こします。",
      ko: "역동적 촉매: 불과 불의 만남—당신의 사회적 존재감은 전기적이며, 가는 곳마다 변화를 일으킵니다.",
      zh: "动态催化剂：火遇上火——你的社交存在感是带电的，无论走到哪里都能引发变革。",
    },
    highRD: {
      en: "The Warm Hearth: Your fire provides warmth and light to those around you, creating a magnetic center for community.",
      es: "El Hogar Cálido: Tu fuego proporciona calor y luz a quienes te rodean, creando un centro magnético para la comunidad.",
      fr: "Le Foyer Chaleureux : Votre feu procure chaleur et lumière à ceux qui vous entourent, créant un centre magnétique pour la communauté.",
      ja: "温かい暖炉：あなたの火は周囲に温もりと光を提供し、コミュニティーの磁石のような中心となります。",
      ko: "따뜻한 화롯불: 당신의 불은 주변에 온기와 빛을 제공하며, 공동체의 자석 같은 중심이 됩니다.",
      zh: "温暖的炉火：你的火为周围的人提供温暖和光明，成为社区磁石般的中心。",
    },
  },
  [FiveElement.METAL]: {
    balanced: {
      en: "The Principled Judge: You bring clarity and fairness, cutting through confusion with precise wisdom.",
      es: "El Juez de Principios: Aportas claridad y justicia, atravesando la confusión con sabiduría precisa.",
      fr: "Le Juge de Principes : Vous apportez clarté et équité, tranchant dans la confusion avec une sagesse précise.",
      ja: "毅然とした裁判官：あなたは明快さと公正さを提供し、的確な知恵で混乱を切り抜けます。",
      ko: "원칙적인 판관: 명확함과 공정함을 가져오며, 정교한 지혜로 혼란을 정리합니다.",
      zh: "有原则的判官：你带来清晰和公平，用精准的智慧化解混乱。",
    },
    highHA: {
      en: "The Meticulous Strategist: Your metal sharpness combined with caution makes you a master of calculated moves.",
      es: "El Estratega Meticuloso: Tu agudeza metálica combinada con la precaución te convierte en un maestro de los movimientos calculados.",
      fr: "Le Stratège Méticuleux : Votre tranchant mêlé à la prudence fait de vous un maître des mouvements calculés.",
      ja: "細心な戦略家：金の鋭さと慎重さが結びつき、計算された動きの達人となります。",
      ko: "세심한 전략가: 금(金)의 예리함과 신중함이 결합하여 계산된 움직임의 달인이 됩니다.",
      zh: "谨小慎微的策略家：你的锐利结合谨慎，使你成为经过深思熟虑行动的大师。",
    },
    highNS: {
      en: "The Innovative Critic: You combine cutting insight with a drive for the new, reforming systems from within.",
      es: "El Crítico Innovador: Combinas una visión agisada con un impulso por lo nuevo, reformando sistemas desde dentro.",
      fr: "Le Critique Innovateur : Vous combinez une vision tranchante avec une soif de nouveauté, réformant les systèmes de l'intérieur.",
      ja: "革新的な批評家：鋭い洞察力と新しさへの推進力を兼ね備え、内部からシステムを改革します。",
      ko: "혁신적 비평가: 날카로운 통찰과 새로움에 대한 추동력을 결합하여, 내부에서 시스템을 개혁합니다.",
      zh: "创新的评论家：你将敏锐的洞察力与对新事物的追求结合起来，从内部改革系统。",
    },
    highRD: {
      en: "The Loyal Knight: Your refined nature seeks genuine connection, forming few but deeply loyal relationships.",
      es: "El Caballero Leal: Tu naturaleza refinada busca una conexión genuina, formando pocas pero profundamente leales relaciones.",
      fr: "Le Chevalier Loyal : Votre nature raffinée recherche une connexion authentique, formant peu de relations mais profondément loyales.",
      ja: "忠実な騎士：あなたの洗練された性質は真のつながりを求め、数は少ないものの深く忠実な関係を築きます。",
      ko: "충성스러운 기사: 정제된 본성이 진정한 연결을 추구하며, 적은 수지만 깊이 있는 충성스러운 관계를 형성합니다.",
      zh: "忠诚的骑士：你文雅的天性寻求真正的联系，建立虽然稀少但深度忠诚的关系。",
    },
  },
  [FiveElement.WATER]: {
    balanced: {
      en: "The Intuitive Sage: Your depth allows you to see what others miss, guiding with quiet wisdom.",
      es: "El Sabio Intuitivo: Tu profundidad te permite ver lo que otros pasan por alto, guiando con sabiduría tranquila.",
      fr: "Le Sage Intuitif : Votre profondeur vous permet de voir ce que les autres manquent, guidant avec une sagesse silencieuse.",
      ja: "直感的な賢者：あなたの深みは他者が逃すものを見ることを可能にし、静かな知恵で導きます。",
      ko: "직관적 현자: 깊이가 타인들이 놓치는 것을 보게 해주며, 조용한 지혜로 이끕니다.",
      zh: "直觉型贤者：你的深度让你能看到他人忽略的事物，用安静的智慧引导他人。",
    },
    highHA: {
      en: "The Careful Seer: Your watery depth combined with caution makes you perceptive but reserved in sharing insights.",
      es: "El Vidente Cuidadoso: Tu profundidad acuosa combinada con la precaución te hace perceptivo pero reservado al compartir conocimientos.",
      fr: "Le Voyant Prudent : Votre profondeur aquatique combinée à la prudence vous rend perspicace mais réservé dans le partage d'idées.",
      ja: "慎重な見者：水の深さと慎重さが結びつき、洞察力に富んでいますが、洞察を共有することには控えめです。",
      ko: "신중한 선견자: 수(水)의 깊이와 신중함이 결합하여 통찰력이 뛰어나지만 공유에는 신중합니다.",
      zh: "细心的先行者：你的水属性深度结合谨慎，使你具有洞察力，但在分享见解时会有所保留。",
    },
    highNS: {
      en: "The Deep Diver: You plunge into unknown depths with enthusiasm, discovering hidden truths.",
      es: "El Buceador Profundo: Te sumerges en profundidades desconocidas con entusiasmo, descubriendo verdades ocultas.",
      fr: "Le Plongeur Profond : Vous vous plongez dans des profondeurs inconnues avec enthousiasme, découvrant des vérités cachées.",
      ja: "深海のダイバー：情熱を持って未知の深みへと飛び込み、隠された真実を発見します。",
      ko: "깊은 잠수부: 열정적으로 미지의 깊이로 뛰어들어 숨겨진 진실을 발견합니다.",
      zh: "深潜者：你满怀热情地潜入未知的深度，发现隐藏的真相。",
    },
    highRD: {
      en: "The Empathic Mirror: Your water nature reflects the emotions of others, creating deep emotional bonds.",
      es: "El Espejo Empático: Tu naturaleza de agua refleja las emociones de los demás, creando vínculos emocionales profundos.",
      fr: "Le Miroir Empathique : Votre nature aquatique reflète les émotions des autres, créant des liens émotionnels profonds.",
      ja: "共感の鏡：水の性質が他者の感情を映し出し、深い感情的な絆を築きます。",
      ko: "공감하는 거울: 수(水)의 본성이 타인의 감정을 비춰 깊은 정서적 유대를 형성합니다.",
      zh: "共情之镜：你的水属性天性反映他人的情绪，建立深层的情感纽带。",
    },
  },
  [FiveElement.WOOD]: {
    balanced: {
      en: "The Steady Explorer: You blend initiative with caution, growing slowly but surely through new experiences.",
      es: "El Explorador Constante: Combinas la iniciativa con la precaución, creciendo lenta pero seguramente a través de nuevas experiencias.",
      fr: "L'Explorateur Constant : Vous mêlez initiative et prudence, grandissant lentement mais sûrement à travers de nouvelles expériences.",
      ja: "着実な探検家：あなたは主導権と慎重さを融合させ、新しい経験を通じてゆっくりと、しかし確実に成長します。",
      ko: "신중한 탐험가: 당신은 주도권과 신중함을 조화시켜 새로운 경험을 통해 천천히, 그러나 확실하게 성장합니다.",
      zh: "稳健的探索者：你将主动性与谨慎相结合，通过新的体验缓慢但坚定地成长。",
    },
    highHA: {
      en: "The Protective Guardian: Your growth-oriented nature is tempered by a strong need for security, making you a cautious but reliable ally.",
      es: "El Guardián Protector: Tu naturaleza orientada al crecimiento está templada por una fuerte necesidad de seguridad, lo que te convierte en un aliado cauteloso pero confiable.",
      fr: "Le Gardien Protecteur : Votre nature orientée vers la croissance est tempérée par un fort besoin de sécurité, faisant de vous un allié prudent mais fiable.",
      ja: "保護的な守護者：あなたの成長志向の性質は強い安全欲求によって和らげられ、慎重ながらも信頼できる味方となります。",
      ko: "수호자적 성장형: 성장 지향적 본성이 강한 안전 욕구에 의해 완화되어, 신중하지만 믿음직한 동료가 됩니다.",
      zh: "保护性的守望者：你的成长导向天性因强烈的安全需求而变得温和，使你成为一个谨慎但可靠的盟友。",
    },
    highNS: {
      en: "The Trailblazer: Your wood element combined with high novelty-seeking makes you a pioneer who constantly pushes boundaries.",
      es: "El Pionero: Tu elemento madera combinado con una alta búsqueda de novedad te convierte en un pionero que constantemente supera los límites.",
      fr: "Le Pionnier : Votre élément bois combiné à une recherche élevée de nouveauté fait de vous un pionnier qui repousse constamment les limites.",
      ja: "先駆者：木（木）の性質と高い新奇性追求が結びつき、絶えず限界を押し広げるパイオニアとなります。",
      ko: "개척자: 목(木)의 성질과 높은 자극 추구 기질이 결합하여, 끊임없이 한계를 넓혀가는 선구자가 됩니다.",
      zh: "开拓者：你的木元素结合高新奇寻求，使你成为不断突破边界的先锋。",
    },
    highRD: {
      en: "The Nurturing Mentor: You grow by helping others grow, forming deep bonds through shared development.",
      es: "El Mentor Nutridor: Creces ayudando a otros a crecer, formando vínculos profundos a través del desarrollo compartido.",
      fr: "Le Mentor Nourricier : Vous grandissez en aidant les autres à grandir, formant des liens profonds à travers le développement partagé.",
      ja: "慈しみ育てるメンター：他者の成長を助けることで自らも成長し、共有された発展を通じて深い絆を形成します。",
      ko: "양육하는 멘토: 타인의 성장을 도우면서 함께 성장하며, 공유된 발전을 통해 깊은 유대를 형성합니다.",
      zh: "育人的导师：你通过帮助他人成长而成长，通过共同的发展建立深厚的联系。",
    },
  },
};

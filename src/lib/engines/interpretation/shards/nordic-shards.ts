import type { SixLangString } from "../engine.contract";

/**
 * Nordic Rune Shard Data
 * Rune and Aett narratives separated from logic.
 */

export const RUNE_NARRATIVES: Record<
  string,
  {
    aett: "Freya" | "Hagal" | "Tyr";
    narrative: SixLangString;
    symbol: string;
  }
> = {
  algiz: {
    aett: "Hagal",
    narrative: {
      en: "Algiz (ᛉ): Elk/Protection. You possess powerful defensive energy and a connection to the higher realms. This rune represents guardianship, divine warning, and the sanctuary of higher consciousness.",
      es: "Algiz (ᛉ): Protección. Posees una poderosa energía defensiva y guía espiritual.",
      fr: "Algiz (ᛉ) : Protection. Vous possédez une puissante énergie défensive et une guidance spirituelle.",
      ja: "アルジズ（ᛉ）：ヘラジカ/保護。あなたは強力な防御エネルギーと高次領域とのつながりを持っています。このルーンは、守護、神聖な警告、そして高次意識の聖域を表しています。",
      ko: "알기즈 (ᛉ): 엘크/보호. 당신은 강력한 방어 에너지와 고등 영역과의 연결을 소유하고 있습니다. 이 룬은 보초, 신성한 경고, 그리고 고등 의식의 성소를 상징합니다.",
      zh: "阿吉兹（ᛉ）：驼鹿/保护。你拥有强大的防御能量和与高层领域的联系。这个符文代表监护、神圣警告和高层意识的避难所。",
    },
    symbol: "ᛉ",
  },
  ansuz: {
    aett: "Freya",
    narrative: {
      en: "Ansuz (ᚨ): Odin/God. You are blessed with the gift of communication and divine inspiration. This rune connects you to wisdom, poetry, and the power of the spoken word.",
      es: "Ansuz (ᚨ): Odín/Dios. Estás bendecido con el don de la comunicación y la inspiración divina. Esta runa te conecta con la sabiduría, la poesía y el poder de la palabra hablada.",
      fr: "Ansuz (ᚨ) : Odin/Dieu. Vous êtes béni par le don de la communication et de l'inspiration divine. Cette rune vous relie à la sagesse, à la poésie et au pouvoir de la parole.",
      ja: "アンスズ（ᚨ）：オーディン/神。あなたはコミュニケーションと神聖なインスピレーションの賜物に恵まれています。このルーンはあなたを智恵、詩、そして語られた言葉の力へと結びつけます。",
      ko: "안수즈 (ᚨ): 오딘/신. 당신은 소통과 신성한 영감의 선물을 축복받았습니다. 이 룬은 지혜, 시, 그리고 말의 힘과 연결합니다.",
      zh: "安苏兹（ᚨ）：奥丁/神。你被赐予沟通和神圣灵感的礼物。这个符文将你与智慧、诗歌和言语的力量联系起来。",
    },
    symbol: "ᚨ",
  },
  berkana: {
    aett: "Tyr",
    narrative: {
      en: "Berkana (ᛒ): Birch/Birth. You embody the energy of growth, fertility, and new beginnings. This rune represents the nurturing power of the mother and the continuous cycle of renewal in all things.",
      es: "Berkana (ᛒ): Nacimiento. Encarnas el crecimiento y la regeneración.",
      fr: "Berkana (ᛒ) : Naissance. Vous incarnez la croissance et la régénération.",
      ja: "ベルカナ（ᛒ）：カバノキ/誕生。あなたは成長、豊穣、新しい始まりのエネルギーを体現しています。このルーンは、母なる育む力と、万物における絶え間ない再生のサイクルを表しています。",
      ko: "베르카나 (ᛒ): 자작나무/탄생. 당신은 성장, 풍요, 새로운 시작의 에너지를 구현합니다. 이 룬은 어머니의 양육하는 힘과 만물의 지속적인 갱신의 순환을 상징합니다.",
      zh: "伯卡纳（ᛒ）：桦树/出生。你体现了成长、繁殖和新开始的能量。这个符文代表母亲的滋养力量和万物不断更新的循环。",
    },
    symbol: "ᛒ",
  },
  dagaz: {
    aett: "Tyr",
    narrative: {
      en: "Dagaz (ᛞ): Day/Transformation. You embody the energy of total enlightenment and breakthrough. This rune represents the fusion of opposites and the clarity that comes at the peak of a clear, bright day.",
      es: "Dagaz (ᛞ): Día/Claridad. Encarnas la iluminación total y el avance.",
      fr: "Dagaz (ᛞ) : Jour/Clarté. Vous incarnez l'illumination totale et la percée.",
      ja: "ダガズ（ᛞ）：一日/変容。あなたは完全な啓蒙と突破のエネルギーを体現しています。このルーンは、対立するものの融合と、澄み渡った一日の絶頂に訪れる明晰さを表しています。",
      ko: "다가즈 (ᛞ): 하루/변형. 당신은 완전한 깨달음과 돌파의 에너지를 구현합니다. 이 룬은 대립물의 융합과 맑고 밝은 하루의 절정에 이르는 명료함을 상징합니다.",
      zh: "达格兹（ᛞ）：白昼/转化。你体现了完全启蒙和突破的能量。这个符文代表对立面的融合，以及在晴朗白昼巅峰时刻到来的清晰。",
    },
    symbol: "ᛞ",
  },
  ehwaz: {
    aett: "Tyr",
    narrative: {
      en: "Ehwaz (ᛖ): Horse/Partnership. You embody the energy of trust and cooperation. This rune represents moving forward together, speed with stability, and the harmonious bond between humans and their environment.",
      es: "Ehwaz (ᛖ): Caballo/Confianza. Encarnas el movimiento conjunto y la lealtad.",
      fr: "Ehwaz (ᛖ) : Cheval/Confiance. Vous incarnez le mouvement conjoint et la loyauté.",
      ja: "エーワズ（ᛖ）：馬/協力。あなたは信頼と協力のエネルギーを体現しています。このルーンは、共に前進すること、安定を伴うスピード、そして人間と環境の間の調和のとれた絆を表しています。",
      ko: "에와즈 (ᛖ): 말/동반자. 당신은 신뢰와 협력의 에너지를 구현합니다. 이 룬은 함께 앞으로 나아감, 안정성을 동반한 속도, 그리고 인간과 환경 사이의 조화로운 결속을 상징합니다.",
      zh: "埃瓦兹（ᛖ）：马/伙伴。你体现了信任和合作的能量。这个符文代表共同进步、兼顾速度与稳定性，以及人类与环境之间的和谐纽带。",
    },
    symbol: "ᛖ",
  },
  eihwaz: {
    aett: "Hagal",
    narrative: {
      en: "Eihwaz (ᛇ): Yew Tree/World Tree. You embody resilience and the connection between life and death. This rune represents endurance, protection, and the spiritual axis that provides stability through transformation.",
      es: "Eihwaz (ᛇ): Tejón. Representa la resistencia y la conexión entre mundos.",
      fr: "Eihwaz (ᛇ) : If. Représente la résilience et la connexion entre les mondes.",
      ja: "エイワズ（ᛇ）：イチイ/世界樹。あなたは回復力と生と死の結びつきを体現しています。このルーンは、持久力、保護、そして変容を通じて安定をもたらす霊的な軸を表しています。",
      ko: "에이와즈 (ᛇ): 주목/세계수. 당신은 회복력과 삶과 죽음의 연결을 구현합니다. 이 룬은 인내, 보호, 그리고 변형을 통해서도 안정을 제공하는 영적 축을 상징합니다.",
      zh: "爱瓦兹（ᛇ）：紫杉/世界树。你体现了韧性以及生与死的联系。这个符文代表耐力、保护和在转化中提供稳定性的精神轴心。",
    },
    symbol: "ᛇ",
  },
  fehu: {
    aett: "Freya",
    narrative: {
      en: "Fehu (ᚠ): Cattle/Wealth. You carry the energy of earned abundance. This rune speaks to material prosperity, but also warns against greed. Your power lies in circulation, not hoarding.",
      es: "Fehu (ᚠ): Ganado/Riqueza. Llevas la energía de la abundancia ganada. Esta runa habla de prosperidad material, pero advierte contra la codicia. Tu poder reside en la circulación, no en el acaparamiento.",
      fr: "Fehu (ᚠ) : Bétail/Richesse. Vous portez l'énergie de l'abondance méritée. Cette rune parle de prospérité matérielle, mais met aussi en garde contre l'avidité. Votre pouvoir réside dans la circulation, pas dans la thésaurisation.",
      ja: "フェフ（ᚠ）：家畜/富。あなたは稼いだ豊かさのエネルギーを持っています。このルーンは物質的な繁栄を語りますが、貪欲に対しても警告します。あなたの力は蓄積ではなく循環にあります。",
      ko: "페후 (ᚠ): 가축/부. 당신은 벌어들인 풍요의 에너지를 지니고 있습니다. 이 룬은 물질적 번영을 말하지만 탐욕에 대해서도 경고합니다. 당신의 힘은 축적이 아닌 순환에 있습니다.",
      zh: "费胡（ᚠ）：牲畜/财富。你携带着赚取的丰富能量。这个符文讲述物质繁荣，但也警告贪婪。你的力量在于流通，而非囤积。",
    },
    symbol: "ᚠ",
  },
  gebo: {
    aett: "Freya",
    narrative: {
      en: "Gebo (ᚷ): Gift. You embody the balance of giving and receiving. This rune represents partnership, hospitality, and the exchange that binds individuals together.",
      es: "Gebo (ᚷ): Regalo. Encarnas el equilibrio entre dar y recibir. Representa la asociación y la hospitalidad.",
      fr: "Gebo (ᚷ) : Cadeau. Vous incarnez l'équilibre entre donner et recevoir. Représente le partenariat et l'hospitalité.",
      ja: "ゲーボ（ᚷ）：贈り物。あなたは与えることと受け取ることのバランスを体现しています。このルーンはパートナーシップ、歓待、そして個人を結びつける交換を表しています。",
      ko: "게보 (ᚷ): 선물. 당신은 주고받는 균형을 구현합니다. 이 룬은 파트너십, 환대, 그리고 개인을 하나로 묶어주는 교환을 상징합니다.",
      zh: "盖伯（ᚷ）：礼物。你体现了施与受的平衡。这个符文代表伙伴关系、热情和将个人联系在一起的交换。",
    },
    symbol: "ᚷ",
  },
  hagalaz: {
    aett: "Hagal",
    narrative: {
      en: "Hagalaz (ᚺ): Hail. You understand the necessity of destruction for renewal. This rune represents sudden change, disruption, and the breakthrough that follows breaking down.",
      es: "Hagalaz (ᚺ): Granizo. Comprendes la necesidad de destrucción para la renovación. Esta runa representa el cambio repentino, la interrupción y el avance que sigue al colapso.",
      fr: "Hagalaz (ᚺ) : Grêle. Vous comprenez la nécessité de la destruction pour le renouveau. Cette rune représente le changement soudain, la perturbation et la percée qui suit l'effondrement.",
      ja: "ハガラズ（ᚺ）：雹。あなたは更新のための破壊の必要性を理解しています。このルーンは突然の変化、混乱、そして崩壊に続く突破を表しています。",
      ko: "하갈라즈 (ᚺ): 우박. 당신은 갱신을 위한 파괴의 필요성을 이해합니다. 이 룬은 갑작스러운 변화, 혼란, 그리고 무너짐 후에 따라오는 돌파를 나타냅니다.",
      zh: "哈加拉兹（ᚺ）：冰雹。你理解为了更新而破坏的必要性。这个符文代表突然的变化、混乱以及崩溃后的突破。",
    },
    symbol: "ᚺ",
  },
  ingwaz: {
    aett: "Tyr",
    narrative: {
      en: "Ingwaz (ᛜ): Seed/Inner Growth. You carry the energy of gestation and potential. This rune represents internal storage of power, future growth, and the quiet incubation that precedes a breakthrough.",
      es: "Ingwaz (ᛜ): Fertilidad/Potencial. Llevas la energía de la gestación y el reposo.",
      fr: "Ingwaz (ᛜ) : Fertilité/Potentiel. Vous portez l'énergie de la gestation et du repos.",
      ja: "イングワズ（ᛜ）：種/内なる成長。あなたは胎動と潜在能力のエネルギーを持っています。このルーンは、内なる力の蓄積、将来の成長、そして突破へと至る静かな潜伏期間を表しています。",
      ko: "잉와즈 (ᛜ): 씨앗/내면의 성장. 당신은 잉태와 잠재력의 에너지를 지니고 있습니다. 이 룬은 내부적인 힘의 저장, 미래의 성장, 그리고 돌파 전에 이루어지는 조용한 준비 기간을 상징합니다.",
      zh: "英格瓦兹（ᛜ）：种子/内在成长。你携带着酝酿和潜力的能量。这个符文代表力量的内在储备、未来的成长，以及突破前的安静孵化。",
    },
    symbol: "ᛜ",
  },
  isa: {
    aett: "Hagal",
    narrative: {
      en: "Isa (ᛁ): Ice. You carry the energy of stillness and inward focus. This rune represents a period of quiet development, internal strengthening, and the power to freeze movement until the time is right.",
      es: "Isa (ᛁ): Hielo. Representa la quietud, el enfoque interno y el fortalecimiento.",
      fr: "Isa (ᛁ) : Glace. Représente le calme, la concentration intérieure et le renforcement.",
      ja: "イーサ（ᛁ）：氷。あなたは静止と内面への集中のエネルギーを持っています。このルーンは、静かな発達の時期、内面の強化、そして適切な時期が来るまで動きを凍結する能力を表しています。",
      ko: "이샤 (ᛁ): 얼음. 당신은 고요함과 내면의 집중의 에너지를 지니고 있습니다. 이 룬은 조용한 발달의 시기, 내면의 강화, 그리고 적절한 때가 올 때까지 움직임을 얼리는 힘을 상징합니다.",
      zh: "伊莎（ᛁ）：冰。你携带着静止和向内聚焦的能量。这个符文代表一段安静的发展时期、内在加强，以及在时机成熟前冻结运动的力量。",
    },
    symbol: "ᛁ",
  },
  jera: {
    aett: "Hagal",
    narrative: {
      en: "Jera (ᛂ): Year/Harvest. You embody the natural cycle of effort and reward. This rune represents the fruition of long-term projects, the abundance of the harvest, and the wisdom of working with time.",
      es: "Jera (ᛂ): Cosecha. Encarnas el ciclo natural de esfuerzo y recompensa.",
      fr: "Jera (ᛂ) : Moisson. Vous incarnez le cycle naturel de l'effort et de la récompense.",
      ja: "ジェラ（ᛂ）：一年/収穫。あなたは努力と報酬の自然なサイクルを体現しています。このルーンは、長期的なプロジェクトの結実、収穫の豊かさ、そして時間を味方につける知恵を表しています。",
      ko: "제라 (ᛂ): 한 해/수확. 당신은 노력과 보상의 자연스러운 순환을 구현합니다. 이 룬은 장기 프로젝트의 결실, 풍성한 수확, 그리고 시간과 함께 일하는 지혜를 상징합니다.",
      zh: "耶拉（ᛂ）：一年/收获。你体现了努力与回报的自然循环。这个符文代表长期项目的结实、丰收的富饶，以及顺应时间工作的智慧。",
    },
    symbol: "ᛂ",
  },
  kenaz: {
    aett: "Freya",
    narrative: {
      en: "Kenaz (ᚲ): Torch/Knowledge. You carry the light of understanding and creativity. This rune represents internal fire, technical skill, and the power to illuminate the unseen.",
      es: "Kenaz (ᚲ): Antorcha/Conocimiento. Llevas la luz del entendimiento y la creatividad.",
      fr: "Kenaz (ᚲ) : Torche/Connaissance. Vous portez la lumière de la compréhension et de la créativité.",
      ja: "ケナズ（ᚲ）：松明/知識。あなたは理解と創造性の光を携えています。このルーンは内なる炎、技術的スキル、そして見えないものを照らす力を表しています。",
      ko: "케나즈 (ᚲ): 횃불/지식. 당신은 이해와 창의성의 빛을 가지고 있습니다. 이 룬은 내면의 불, 기술적 숙련도, 그리고 보이지 않는 것을 밝히는 힘을 상징합니다.",
      zh: "卡诺（ᚲ）：火炬/知识。你带着理解和创造的光芒。这个符文代表内在的火焰、技术技能和照亮未见之物的力量。",
    },
    symbol: "ᚲ",
  },
  laguz: {
    aett: "Tyr",
    narrative: {
      en: "Laguz (ᛚ): Water/Flow. You embody the energy of intuition and the deep emotional flow. This rune represents the subconscious, the cleansing power of water, and the fluid nature of existence.",
      es: "Laguz (ᛚ): Agua/Fluidez. Encarnas la intuición y el flujo emocional.",
      fr: "Laguz (ᛚ) : Eau/Fluidité. Vous incarnez l'intuition et le flux émotionnel.",
      ja: "ラグズ（ᛚ）：水/流れ。あなたは直感と深い感情の流れのエネルギーを体現しています。このルーンは、潜在意識、水の浄化力、そして存在の流動的な性質を表しています。",
      ko: "라구즈 (ᛚ): 물/흐름. 당신은 직관과 깊은 감정의 흐름의 에너지를 구현합니다. 이 룬은 잠재의식, 물의 정화 능력, 그리고 존재의 유동적 본질을 상징합니다.",
      zh: "拉格兹（ᛚ）：水/流动。你体现了直觉和深沉的情感流动。这个符文代表潜意识、水的净化力量以及存在的流动本质。",
    },
    symbol: "ᛚ",
  },
  mannaz: {
    aett: "Tyr",
    narrative: {
      en: "Mannaz (ᛗ): Human/Social. You carry the energy of self-realization and human connection. This rune represents intelligence, culture, and the shared wisdom that defines humanity.",
      es: "Mannaz (ᛗ): Humano. Representa la conciencia, la inteligencia y la humanidad.",
      fr: "Mannaz (ᛗ) : Humain. Représente la conscience, l'intelligence et l'humanité.",
      ja: "マンナズ（ᛗ）：人間/社会。あなたは自己実現と人間関係のエネルギーを持っています。このルーンは、知性、文化、そして人間性を定義する共有された知恵を表しています。",
      ko: "마나즈 (ᛗ): 인간/사회. 당신은 자아 실현과 인간 관계의 에너지를 지니고 있습니다. 이 룬은 지성, 문화, 그리고 인류를 정의하는 공유된 지혜를 상징합니다.",
      zh: "曼纳兹（ᛗ）：人类/社会。你携带着自我实现和人际关系的能量。这个符文代表智慧、文化和定义人性的共同智慧。",
    },
    symbol: "ᛗ",
  },
  nauthiz: {
    aett: "Hagal",
    narrative: {
      en: "Nauthiz (ᚾ): Need/Necessity. You carry the energy of resistance and the power of will. This rune represents the constraints that force growth and the ability to find your own 'inner sun' in times of scarcity.",
      es: "Nauthiz (ᚾ): Necesidad. Encarnas la resistencia y el poder de la voluntad ante la escasez.",
      fr: "Nauthiz (ᚾ) : Besoin/Nécessité. Vous incarnez la résistance et le pouvoir de la volonté face à la pénurie.",
      ja: "ナウディズ（ᚾ）：欠乏/必要。あなたは抵抗のエネルギーと意志の力を持っています。このルーンは、成長を余儀なくさせる制約と、不足している時に自分自身の「内なる太陽」を見つける能力を表しています。",
      ko: "나우디즈 (ᚾ): 결핍/필요. 당신은 저항의 에너지와 의지의 힘을 지니고 있습니다. 이 룬은 성장을 강요하는 제약과 부족한 시기에 자신만의 '내면의 태양'을 찾는 능력을 상징합니다.",
      zh: "纳奥帝斯（ᚾ）：匮乏/必要。你携带着抵抗的能量和意志的力量。这个符文代表迫使成长的限制，以及在匮乏时期寻找自己“内在太阳”的能力。",
    },
    symbol: "ᚾ",
  },
  othala: {
    aett: "Tyr",
    narrative: {
      en: "Othala (ᚫ): Inheritance/Legacy. You carry the energy of heritage and belonging. This rune represents ancestors, material legacy, and the stable foundations for future generations.",
      es: "Othala (ᚫ): Herencia. Representa el legado, los ancestros y el hogar.",
      fr: "Othala (ᚫ) : Héritage. Représente le legs, les ancêtres et le foyer.",
      ja: "オサラ（ᚫ）：相続/遺産。あなたは伝統と帰属のエネルギーを持っています。このルーンは、先祖、物質的な遺産、そして将来の世代のための安定した基盤を表しています。",
      ko: "오살라 (ᚫ): 상속/유산. 당신은 유산과 소속감의 에너지를 지니고 있습니다. 이 룬은 조상, 물질적 유산, 그리고 미래 세대를 위한 안정적인 기반을 상징합니다.",
      zh: "欧赛拉（ᚫ）：继承/遗产。你携带着遗产和归属感的能量。这个符文代表祖先、物质遗产以及为后代建立的稳定基础。",
    },
    symbol: "ᚫ",
  },
  perthro: {
    aett: "Hagal",
    narrative: {
      en: "Perthro (ᛈ): Dice Cup/Fate. You carry the energy of the unknown and the secret laws of destiny. This rune represents hidden knowledge, luck, and the initiation into mysteries.",
      es: "Perthro (ᛈ): Azar/Destino. Llevas la energía de lo desconocido y los secretos.",
      fr: "Perthro (ᛈ) : Sort/Destinée. Vous portez l'énergie de l'inconnu et des secrets.",
      ja: "ペルソ（ᛈ）：ダイスカップ/運命。あなたは未知のエネルギーと運命の秘密の法則を持っています。このルーンは、隠された知識、幸運、そして神秘へのイニシエーションを表しています。",
      ko: "페르트로 (ᛈ): 주사위 컵/운명. 당신은 미지의 에너지와 운명의 비밀 법칙을 지니고 있습니다. 이 룬은 숨겨진 지식, 행운, 그리고 신비에 대한 입문을 상징합니다.",
      zh: "佩斯洛（ᛈ）：骰子盅/命运。你携带着未知能量和命运的秘密法则。这个符文代表隐藏的知识、运气和揭开奥秘的启动。",
    },
    symbol: "ᛈ",
  },
  raido: {
    aett: "Freya",
    narrative: {
      en: "Raido (ᚱ): Wheel/Journey. You are on a journey, both physical and spiritual. This rune represents rhythm, travel, and the cosmic law of cause and effect. Everything is in motion.",
      es: "Raido (ᚱ): Rueda/Viaje. Estás en un viaje, tanto físico como espiritual. Representa el ritmo y la ley cósmica.",
      fr: "Raido (ᚱ) : Roue/Voyage. Vous êtes en voyage, tant physique que spirituel. Représente le rythme et la loi cosmique.",
      ja: "ライド（ᚱ）：車輪/旅。あなたは肉体的にも精神的にも旅の途中にあります。このルーンはリズム、旅、そして因果の宇宙法則を表しています。すべては動いています。",
      ko: "라이도 (ᚱ): 수레바퀴/여정. 당신은 육체적, 영적으로 여정 중에 있습니다. 이 룬은 리듬, 여행, 그리고 인과응보의 우주적 법칙을 의미합니다. 모든 것은 움직이고 있습니다.",
      zh: "莱多（ᚱ）：轮子/旅行。你正在进行肉体和精神的双重旅程。这个符文代表节奏、旅行和因果的宇宙法则。一切都在运动中。",
    },
    symbol: "ᚱ",
  },
  sowilo: {
    aett: "Hagal",
    narrative: {
      en: "Sowilo (ᛋ): Sun/Victory. You radiate the energy of success and life-force. This rune represents total clarity, health, and the triumphant power that conquers darkness through brilliance.",
      es: "Sowilo (ᛋ): Sol/Éxito. Irradias éxito y fuerza vital. Claridad total.",
      fr: "Sowilo (ᛋ) : Soleil/Succès. Vous rayonnez de succès et de force vitale.",
      ja: "ソウィロ（ᛋ）：太陽/勝利。あなたは成功と生命力の溢れるエネルギーを放っています。このルーンは、完全な明晰さ、健康、そして輝きによって闇を征服する勝利のパワーを表しています。",
      ko: "소윌로 (ᛋ): 태양/승리. 당신은 성공과 생명력의 에너지를 발산합니다. 이 룬은 완전한 명료함, 건강, 그리고 광채로 어둠을 정복하는 승리의 힘을 상징합니다.",
      zh: "索维罗（ᛋ）：太阳/胜利。你散发着成功和生命力的能量。这个符文代表完全的清晰、健康，以及通过光辉征服黑暗的胜利力量。",
    },
    symbol: "ᛋ",
  },
  thurisaz: {
    aett: "Freya",
    narrative: {
      en: "Thurisaz (ᚦ): Thor/Giant. You carry the energy of protection and directed force. This rune is the hammer that shatters obstacles and defends boundaries.",
      es: "Thurisaz (ᚦ): Thor/Gigante. Llevas la energía de protección y fuerza dirigida. Esta runa es el martillo que rompe obstáculos y defiende límites.",
      fr: "Thurisaz (ᚦ) : Thor/Géant. Vous portez l'énergie de la protection et de la force dirigée. Cette rune est le marteau qui brise les obstacles et défend les frontières.",
      ja: "スリサズ（ᚦ）：トール/巨人。あなたは保護と方向付けられた力のエネルギーを持っています。このルーンは障害を打ち砕き、境界を守るハンマーです。",
      ko: "투리사즈 (ᚦ): 토르/거인. 당신은 보호와 방향 지어진 힘의 에너지를 지니고 있습니다. 이 룬은 장애물을 부수고 경계를 방어하는 망치입니다.",
      zh: "苏里萨兹（ᚦ）：托尔/巨人。你携带保护和定向力量的能量。这个符文是粉碎障碍和守护边界的锤子。",
    },
    symbol: "ᚦ",
  },
  tiwaz: {
    aett: "Tyr",
    narrative: {
      en: "Tiwaz (ᛏ): Tyr/Victory. You carry the warrior spirit of honor and sacrifice. This rune represents justice, leadership, and the courage to do what is right.",
      es: "Tiwaz (ᛏ): Tyr/Victoria. Llevas el espíritu guerrero de honor y sacrificio. Esta runa representa la justicia, el liderazgo y el coraje para hacer lo correcto.",
      fr: "Tiwaz (ᛏ) : Tyr/Victoire. Vous portez l'esprit guerrier de l'honneur et du sacrifice. Cette rune représente la justice, le leadership et le courage de faire ce qui est juste.",
      ja: "ティワズ（ᛏ）：ティール/勝利。あなたは名誉と犠牲の戦士の精神を持っています。このルーンは正義、リーダーシップ、そして正しいことをする勇気を表しています。",
      ko: "티와즈 (ᛏ): 티르/승리. 당신은 명예와 희생의 전사 정신을 지니고 있습니다. 이 룬은 정의, 리더십, 그리고 옳은 일을 할 용기를 나타냅니다.",
      zh: "提瓦兹（ᛏ）：提尔/胜利。你携带着荣誉和牺牲的战士精神。这个符文代表正义、领导力和做正确事情的勇气。",
    },
    symbol: "ᛏ",
  },
  uruz: {
    aett: "Freya",
    narrative: {
      en: "Uruz (ᚢ): Auroch/Strength. You embody primal vitality and untamed power. This rune represents health, endurance, and the wild force of nature within you.",
      es: "Uruz (ᚢ): Uro/Fuerza. Encarnas la vitalidad primordial y el poder indómito. Esta runa representa la salud, la resistencia y la fuerza salvaje de la naturaleza en tu interior.",
      fr: "Uruz (ᚢ) : Aurochs/Force. Vous incarnez la vitalité primordiale et la puissance indomptée. Cette rune représente la santé, l'endurance et la force sauvage de la nature en vous.",
      ja: "ウルズ（ᚢ）：オーロックス/強さ。あなたは原初的な活力と手なずけられていない力を体現しています。このルーンは健康、持久力、そしてあなたの中の自然の野生の力を表しています。",
      ko: "우루즈 (ᚢ): 오록스/힘. 당신은 원초적 활력과 길들여지지 않은 힘을 구현합니다. 이 룬은 건강, 인내, 그리고 당신 안의 자연의 야생적 힘을 나타냅니다.",
      zh: "乌鲁兹（ᚢ）：原牛/力量。你体现原始活力和未驯服的力量。这个符文代表健康、耐力和你内心自然的野性力量。",
    },
    symbol: "ᚢ",
  },
  wunjo: {
    aett: "Freya",
    narrative: {
      en: "Wunjo (ᚹ): Joy. You carry the energy of harmony and fulfillment. This rune represents fellowship, peace, and the beauty that comes when life is in alignment.",
      es: "Wunjo (ᚹ): Alegría. Llevas la energía de la armonía y la plenitud. Representa la paz y la belleza.",
      fr: "Wunjo (ᚹ) : Joie. Vous portez l'énergie de l'harmonie et de l'accomplissement. Représente la paix et la beauté.",
      ja: "ウンジョー（ᚹ）：喜び。あなたは調和と成就のエネルギーを持っています。このルーンは仲間意識、平和、そして人生が調和しているときに訪れる美しさを表しています。",
      ko: "윈조 (ᚹ): 기쁨. 당신은 조화와 성취의 에너지를 지니고 있습니다. 이 룬은 동료애, 평화, 그리고 삶이 조화를 이룰 때 찾아오는 아름다움을 상징합니다.",
      zh: "温究（ᚹ）：喜悦。你携带着和谐与满足的能量。这个符文代表友谊、和平以及生活处于一致状态时产生的美好。",
    },
    symbol: "ᚹ",
  },
};

export const AETT_NARRATIVES: Record<string, SixLangString> = {
  Freya: {
    en: "Freya's Aett (1st Eight): Runes of creation, beginnings, and material foundations. Your path involves manifesting new realities.",
    es: "Aett de Freya (1er Ocho): Runas de creación, comienzos y fundamentos materiales. Tu camino implica manifestar nuevas realidades.",
    fr: "L'Aett de Freya (1er Huit) : Runes de création, de commencements et de fondations matérielles. Votre chemin implique la manifestation de nouvelles réalités.",
    ja: "フレイヤのエット（最初の8つ）：創造、始まり、物質的基盤のルーン。あなたの道は新しい現実を顕現することに関わっています。",
    ko: "프레이아의 에트 (첫 번째 여덟): 창조, 시작, 물질적 기반의 룬. 당신의 길은 새로운 현실을 현현시키는 것과 관련됩니다.",
    zh: "弗蕾亚的艾特（第一个八）：创造、开始和物质基础的符文。你的道路涉及显化新的现实。",
  },
  Hagal: {
    en: "Hagal's Aett (2nd Eight): Runes of transformation, challenge, and the forces of nature. Your path involves navigating change.",
    es: "Aett de Hagal (2do Ocho): Runas de transformación, desafío y las fuerzas de la naturaleza. Tu camino implica navegar el cambio.",
    fr: "L'Aett de Hagal (2ème Huit) : Runes de transformation, de défi et des forces de la nature. Votre chemin implique de naviguer à travers le changement.",
    ja: "ハガルのエット（2番目の8つ）：変容、挑戦、自然の力のルーン。あなたの道は変化を航行することに関わっています。",
    ko: "하갈의 에트 (두 번째 여덟): 변화, 도전, 자연의 힘의 룬. 당신의 길은 변화를 항해하는 것과 관련됩니다.",
    zh: "哈加尔的艾特（第二个八）：转化、挑战和自然力量的符文. 你的道路涉及驾驭变化.",
  },
  Tyr: {
    en: "Tyr's Aett (3rd Eight): Runes of achievement, social order, and spiritual culmination. Your path leads to fulfillment.",
    es: "Aett de Tyr (3er Ocho): Runas de logro, orden social y culminación espiritual. Tu camino conduce a la realización.",
    fr: "L'Aett de Tyr (3ème Huit) : Runes d'accomplissement, d'ordre social et de culmination spirituelle. Votre chemin mène à l'accomplissement.",
    ja: "ティールのエット（3番目の8つ）：達成、社会秩序、霊的完成のルーン。あなたの道は成就に導きます。",
    ko: "티르의 에트 (세 번째 여덟): 성취, 사회적 질서, 영적 완성의 룬. 당신의 길은 성취로 이어집니다.",
    zh: "提尔的艾特（第三个八）：成就、社会秩序和灵性圆满的符文。你的道路通向实现。",
  },
};

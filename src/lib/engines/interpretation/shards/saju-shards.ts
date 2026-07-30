import type { SixLangString } from "../engine.contract";

/**
 * Saju/Ganzhi Shard Data
 * Heavenly Stems, Earthly Branches, and 60 Combinations narratives separated from logic.
 */

export const HEAVENLY_STEM_NARRATIVES: Record<
  string,
  {
    element: string;
    narrative: SixLangString;
    polarity: "yang" | "yin";
  }
> = {
  byeong: {
    element: "Fire",
    narrative: {
      en: "Byeong (丙, Yang Fire): The blazing sun. You radiate warmth, visibility, and life-giving energy. Your presence illuminates all around you.",
      es: "Byeong (Yang Fuego): El sol ardiente. Irradias calidez, visibilidad y energía vital. Tu presencia ilumina todo a tu alrededor.",
      fr: "Byeong (Yang Feu) : Le soleil ardent. Vous rayonnez de chaleur, de visibilité et d'énergie vitale. Votre présence illumine tout autour de vous.",
      ja: "丙（ヒノエ、陽の火）：燃える太陽. 따뜻함, 가시성, 생명을 주는 에너지를 발산합니다. 당신의 존재가 주변 모든 것을 밝힙니다.",
      ko: "병(丙, 양화): 타오르는 태양. 따뜻함, 가시성, 생명을 주는 에너지를 발산합니다. 당신의 존재가 주변 모든 것을 밝힙니다.",
      zh: "丙（阳火）：炽热的太阳。你散发温暖、可见性和赋予生命的能量。你的存在照亮了周围的一切。",
    },
    polarity: "yang",
  },
  eul: {
    element: "Wood",
    narrative: {
      en: "Eul (乙, Yin Wood): The flexible vine. You embody adaptability and gentle persistence. Like ivy, you find your way around obstacles with grace.",
      es: "Eul (Yin Madera): La vid flexible. Encarnas la adaptabilidad y la persistencia suave. Como la hiedra, encuentras tu camino alrededor de los obstáculos con gracia.",
      fr: "Eul (Yin Bois) : La vigne flexible. Vous incarnez l'adaptabilité et la persévérance douce. Comme le lierre, vous contournez les obstacles avec grâce.",
      ja: "乙（キノト、陰の木）：柔軟なつる. 적응력과 부드러운 끈기를 구현합니다. 담쟁이처럼 우아하게 장애물을 돌아갑니다.",
      ko: "을(乙, 음목): 유연한 덩굴. 적응력과 부드러운 끈기를 구현합니다. 담쟁이처럼 우아하게 장애물을 돌아갑니다.",
      zh: "乙（阴木）：柔韧的藤蔓。你体现适应性和温柔的坚持。像常春藤一样，你优雅地绕过障碍。",
    },
    polarity: "yin",
  },
  gap: {
    element: "Wood",
    narrative: {
      en: "Gap (甲, Yang Wood): The towering tree. You embody growth, ambition, and upward movement. Like a great oak, you stand firm and reach for the sky.",
      es: "Gap (Yang Madera): El árbol imponente. Encarnas el crecimiento, la ambición y el movimiento ascendente. Como un gran roble, te mantienes firme y alcanzas el cielo.",
      fr: "Gap (Yang Bois) : L'arbre imposant. Vous incarnez la croissance, l'ambition et le mouvement ascendant. Comme un grand chêne, vous restez ferme et vous tendez vers le ciel.",
      ja: "甲（キノエ、陽の木）：そびえ立つ木. 성장, 야망, 상승 운동을 구현합니다. 큰 참나무처럼 굳건히 서서 하늘을 향해 뻗어갑니다.",
      ko: "갑(甲, 양목): 우뚝 솟은 나무. 성장, 야망, 상승 운동을 구현합니다. 큰 참나무처럼 굳건히 서서 하늘을 향해 뻗어갑니다.",
      zh: "甲（阳木）：参天大树。你体现成长、雄心和向上运动。像一棵巨大的橡树，你坚定地站立，向天空伸展。",
    },
    polarity: "yang",
  },
  gi: {
    element: "Earth",
    narrative: {
      en: "Gi (己, Yin Earth): The fertile field. You embody nurturing, cultivation, and patient growth. Like farmland, you support and nurture what is planted in you.",
      es: "Gi (Yin Tierra): El campo fértil. Encarnas la crianza, el cultivo y el crecimiento paciente. Como tierra de cultivo, apoyas y nutres lo que se planta en ti.",
      fr: "Gi (Yin Terre) : Le champ fertile. Vous incarnez l'éducation, la culture et la croissance patiente. Comme une terre agricole, vous soutenez et nourrissez ce qui est planté en vous.",
      ja: "己（ツチノト、陰の土）：肥沃な畑. 양육, 경작, 인내심 있는 성장을 구현합니다. 농지처럼 당신에게 심어진 것을 지원하고 키웁니다.",
      ko: "기(己, 음토): 비옥한 들판. 양육, 경작, 인내심 있는 성장을 구현합니다. 농지처럼 당신에게 심어진 것을 지원하고 키웁니다.",
      zh: "己（阴土）：肥沃的田野。你体现养育、耕作和耐心的成长。像农田一样，你支持并培育种植在你里面的东西。",
    },
    polarity: "yin",
  },
  gye: {
    element: "Water",
    narrative: {
      en: "Gye (癸, Yin Water): The gentle rain. You embody intuition, subtle nourishment, and quiet persistence. Like mist, you permeate and influence unseen.",
      es: "Gye (Yin Agua): La lluvia suave. Encarnas la intuición, la nutrición sutil y la persistencia tranquila. Como la niebla, permeas e influyes sin ser visto.",
      fr: "Gye (Yin Eau) : La pluie douce. Vous incarnez l'intuition, la nourriture subtile et la persévérance tranquille. Comme la brume, vous imprégnez et influencez sans être vu.",
      ja: "癸（ミズノト、陰の水）：穏やかな雨. 직관, 미묘한 양분, 조용한 끈기를 구현합니다. 안개처럼 보이지 않게 스며들고 영향을 미칩니다.",
      ko: "계(癸, 음수): 부드러운 비. 직관, 미묘한 양분, 조용한 끈기를 구현합니다. 안개처럼 보이지 않게 스며들고 영향을 미칩니다.",
      zh: "癸（阴水）：温柔的雨。你体现直觉、微妙的滋养和安静的坚持。像雾一样，你渗透并产生无形的影响。",
    },
    polarity: "yin",
  },
  gyeong: {
    element: "Metal",
    narrative: {
      en: "Gyeong (庚, Yang Metal): The forged sword. You embody decisiveness, precision, and cutting clarity. Your presence brings justice and sharp discernment.",
      es: "Gyeong (Yang Metal): La espada forjada. Encarnas la decisión, la precisión y la claridad cortante. Tu presencia trae justicia y agudo discernimiento.",
      fr: "Gyeong (Yang Métal) : L'épée forgée. Vous incarnez la décision, la précision et la clarté tranchante. Votre présence apporte justice et discernement aiguisé.",
      ja: "庚（カノエ、陽の金）：鍛えられた剣. 결단력, 정밀함, 명확한 명료함을 구현합니다. 당신의 존재가 정의와 날카로운 분별력을 가져옵니다.",
      ko: "경(庚, 양금): 벼려진 검. 결단력, 정밀함, 명확한 명료함을 구현합니다. 당신의 존재가 정의와 날카로운 분별력을 가져옵니다.",
      zh: "庚（阳金）：锻造之剑。你体现果断、精确和锋利的清晰度。你的存在带来正义和敏锐的辨别力。",
    },
    polarity: "yang",
  },
  im: {
    element: "Water",
    narrative: {
      en: "Im (壬, Yang Water): The great ocean. You embody wisdom, depth, and adaptable power. Like the sea, you hold vast potential and can reshape landscapes.",
      es: "Im (Yang Agua): El gran océano. Encarnas la sabiduría, la profundidad y el poder adaptable. Como el mar, tienes un vasto potencial y puedes remodelar paisajes.",
      fr: "Im (Yang Eau) : Le grand océan. Vous incarnez la sagesse, la profondeur et un pouvoir adaptable. Comme la mer, vous détenez un vaste potentiel et pouvez remodeler les paysages.",
      ja: "壬（ミズノエ、陽の水）：大海. 지혜, 깊이, 적응할 수 있는 힘을 구현합니다. 바다처럼 광대한 잠재력을 가지고 지형을 재형성할 수 있습니다.",
      ko: "임(壬, 양수): 큰 바다. 지혜, 깊이, 적응할 수 있는 힘을 구현합니다. 바다처럼 광대한 잠재력을 가지고 지형을 재형성할 수 있습니다.",
      zh: "壬（阳水）：大海。你体现智慧、深度和适应力强的力量。像大海一样，你拥有巨大的潜力，可以重塑地貌。",
    },
    polarity: "yang",
  },
  jeong: {
    element: "Fire",
    narrative: {
      en: "Jeong (丁, Yin Fire): The candle flame. You embody focused warmth and intimate illumination. Like a lamp in darkness, you guide with soft light.",
      es: "Jeong (Yin Fuego): La llama de la vela. Encarnas la calidez enfocada y la iluminación íntima. Como una lámpara en la oscuridad, guías con luz suave.",
      fr: "Jeong (Yin Feu) : La flamme de la bougie. Vous incarnez la chaleur concentrée et l'éclairage intime. Comme une lampe dans l'obscurité, vous guider avec une lumière douce.",
      ja: "丁（ヒノト、陰の火）：ろうそくの炎. 집중된 따뜻함과 친밀한 조명을 구현합니다. 어둠 속의 등불처럼 부드러운 빛으로 안내합니다.",
      ko: "정(丁, 음화): 촛불. 집중된 따뜻함과 친밀한 조명을 구현합니다. 어둠 속의 등불처럼 부드러운 빛으로 안내합니다.",
      zh: "丁（阴火）：烛光。你体现集中的温暖和亲密的照明。像黑暗中的灯，你用柔和的光指引。",
    },
    polarity: "yin",
  },
  mu: {
    element: "Earth",
    narrative: {
      en: "Mu (戊, Yang Earth): The great mountain. You embody stability, reliability, and immovable presence. Others find grounding in your steadfast nature.",
      es: "Mu (Yang Tierra): La gran montaña. Encarnas la estabilidad, la fiabilidad y la presencia inamovible. Otros encuentran fundamento en tu naturaleza firme.",
      fr: "Mu (Yang Terre) : La grande montagne. Vous incarnez la stabilité, la fiabilité et une présence inébranlable. Les autres trouvent un ancrage dans votre nature inébranlable.",
      ja: "戊（ツチノエ、陽の土）：大きな山. 안정, 신뢰성, 움직이지 않는 존재감을 구현합니다. 다른 사람들이 당신의 굳건한 성격에서 안정을 찾습니다.",
      ko: "무(戊, 양토): 큰 산. 안정, 신뢰성, 움직이지 않는 존재감을 구현합니다. 다른 사람들이 당신의 굳건한 성격에서 안정을 찾습니다.",
      zh: "戊（阳土）：大山。你体现稳定、可靠和不可动摇的存在感。他人在你坚定的本性中找到立足点。",
    },
    polarity: "yang",
  },
  shin: {
    element: "Metal",
    narrative: {
      en: "Shin (辛, Yin Metal): The precious jewel. You embody refinement, purity, and inner brilliance. Like a gem, you are valuable and beautiful under pressure.",
      es: "Shin (Yin Metal): La joya preciosa. Encarnas el refinamiento, la pureza y el brillo interior. Como una gema, eres valioso y hermoso bajo presión.",
      fr: "Shin (Yin Métal) : Le bijou précieux. Vous incarnez le raffinement, la pureté et l'éclat intérieur. Comme une pierre précieuse, vous êtes précieux et beau sous la pression.",
      ja: "辛（カノト、陰の金）：貴重な宝石. 정제, 순수함, 내면의 광채를 구현합니다. 보석처럼 압력 아래에서 가치 있고 아름답습니다.",
      ko: "신(辛, 음금): 귀한 보석. 정제, 순수함, 내면의 광채를 구현합니다. 보석처럼 압력 아래에서 가치 있고 아름답습니다.",
      zh: "辛（阴金）：珍贵的宝石。你体现精致、纯洁和内在的光辉。像宝石一样，你在压力下珍贵而美丽。",
    },
    polarity: "yin",
  },
};

export const EARTHLY_BRANCH_NARRATIVES: Record<
  string,
  {
    animal: string;
    element: string;
    hours: string;
    narrative: SixLangString;
  }
> = {
  chuk: {
    animal: "Ox",
    element: "Earth",
    hours: "01:00-03:00",
    narrative: {
      en: "Chuk (丑, Ox): Patient and diligent. You embody slow but unstoppable progress. Reliability and endurance define your path.",
      es: "Chuk (Buey): Paciente y diligente. Encarnas el progreso lento pero imparable. La fiabilidad y la resistencia definen tu camino.",
      fr: "Chuk (Bœuf) : Patient et diligent. Vous incarnez un progrès lent mais imparable. La fiabilité et l'endurance définissent votre chemin.",
      ja: "丑（ウシ）：忍耐強く勤勉です. 느리지만 멈출 수 없는 진전을 구현합니다. 신뢰성과 인내가 당신의 길을 정의합니다.",
      ko: "축(丑, 소): 인내심 있고 부지런합니다. 느리지만 멈출 수 없는 진전을 구현합니다. 신뢰성과 인내가 당신의 길을 정의합니다.",
      zh: "丑（牛）：耐心而勤奋。你体现缓慢但不可阻挡的进步。可靠和耐力定义了你的道路。",
    },
  },
  hae: {
    animal: "Pig",
    element: "Water",
    hours: "21:00-23:00",
    narrative: {
      en: "Hae (亥, Pig): Sincere and generous. You possess honest abundance and the wisdom to enjoy life's pleasures without excess.",
      es: "Hae (Cerdo): Sincero y generoso. Posees abundancia honesta y la sabiduría para disfrutar de los placeres de la vida sin excesos.",
      fr: "Hae (Cochon) : Sincère et généreux. Vous possédez une abondance honnête et la sagesse de profiter des plaisirs de la vie sans excès.",
      ja: "亥（イ、イノシシ）：誠実で寛大입니다. 정직한 풍요와 과잉 없이 삶의 즐거움을 누리는 지혜를 가지고 있습니다.",
      ko: "해(亥, 돼지): 진실하고 관대합니다. 정직한 풍요와 과잉 없이 삶의 즐거움을 누리는 지혜를 가지고 있습니다.",
      zh: "亥（猪）：真诚而慷慨向。你拥有诚实的富足和享受生活乐趣适度而不放纵的智慧。",
    },
  },
  in: {
    animal: "Tiger",
    element: "Wood",
    hours: "03:00-05:00",
    narrative: {
      en: "In (寅, Tiger): Brave and powerful. You carry the energy of the dawn, ready to spring into action with courage and dominance.",
      es: "In (Tigre): Valiente y poderoso. Llevas la energía del amanecer, listo para entrar en acción con coraje y dominio.",
      fr: "In (Tigre) : Courageux et puissant. Vous portez l'énergie de l'aube, prêt à passer à l'action avec courage et domination.",
      ja: "寅（トラ）：勇敢で強力です. 새벽의 에너지를 지니고 있으며, 용기와 지배력으로 행동에 뛰어들 준비가 되어 있습니다.",
      ko: "인(寅, 호랑이): 용감하고 강력합니다. 새벽의 에너지를 지니고 있으며, 용기와 지배력으로 행동에 뛰어들 준비가 되어 있습니다.",
      zh: "寅（虎）：勇敢而强大。你携带着黎明的能量，准备好以勇气和支配力投入行动。",
    },
  },
  ja: {
    animal: "Rat",
    element: "Water",
    hours: "23:00-01:00",
    narrative: {
      en: "Ja (子, Rat): Midnight energy. Quick-witted, resourceful, and strategic. You possess the ability to find opportunity in darkness.",
      es: "Ja (Rata): Energía de medianoche. Ingenioso, lleno de recursos y estratégico. Posees la capacidad de encontrar oportunidades en la oscuridad.",
      fr: "Ja (Rat) : L'énergie de minuit. Vif d'esprit, ingénieux et stratégique. Vous possédez la capacité de trouver des opportunités dans l'obscurité.",
      ja: "子（ネ、ネズミ）：真夜中のエネルギー. 재치 있고, 자원이 풍부하며, 전략적입니다. 어둠 속에서 기회를 찾는 능력을 가지고 있습니다.",
      ko: "자(子, 쥐): 자정의 에너지. 재치 있고, 자원이 풍부하며, 전략적입니다. 어둠 속에서 기회를 찾는 능력을 가지고 있습니다.",
      zh: "子（鼠）：午夜的能量。机智、足智多谋、具有战略眼光。你拥有在黑暗中寻找机会的能力。",
    },
  },
  jin: {
    animal: "Dragon",
    element: "Earth",
    hours: "07:00-09:00",
    narrative: {
      en: "Jin (辰, Dragon): Majestic and ambitious. You carry the energy of myth and greatness, destined for extraordinary achievements.",
      es: "Jin (Dragón): Majestuoso y ambicioso. Llevas la energía del mito y la grandeza, destinado a logros extraordinarios.",
      fr: "Jin (Dragon) : Majestueux et ambitieux. Vous portez l'énergie du mythe et de la grandeur, destiné à des réalisations extraordinaires.",
      ja: "辰（タツ、リュウ）：荘厳で野心적입니다. 신화와 위대함의 에너지를 지니고 있으며, 비범한 성취를 위해 운명지어져 있습니다.",
      ko: "진(辰, 용): 장엄하고 야심적입니다. 신화와 위대함의 에너지를 지니고 있으며, 비범한 성취를 위해 운명지어져 있습니다.",
      zh: "辰（龙）：雄伟而雄心勃勃。你携带着神话和伟大的能量，注定要取得非凡的成就。",
    },
  },
  mi: {
    animal: "Goat",
    element: "Earth",
    hours: "13:00-15:00",
    narrative: {
      en: "Mi (未, Goat): Creative and gentle. You bring artistic sensibility and compassionate care to all you touch.",
      es: "Mi (Cabra): Creativo y gentil. Aportas sensibilidad artística y cuidado compasivo a todo lo que tocas.",
      fr: "Mi (Chèvre) : Créatif et doux. Vous apportez une sensibilité artistique et des soins compatissants à tout ce que vous touchez.",
      ja: "未（ヒツジ）：創造的で穏やか입니다. 당신이 닿는 모든 것에 예술적 감수성과 자비로운 보살핌을 가져옵니다.",
      ko: "미(未, 양): 창의적이고 온화합니다. 당신이 닿는 모든 것에 예술적 감수성과 자비로운 보살핌을 가져옵니다.",
      zh: "未（羊）：富有创造力和温柔。你为你接触的一切带来艺术敏感性和富有同情心的关怀。",
    },
  },
  myo: {
    animal: "Rabbit",
    element: "Wood",
    hours: "05:00-07:00",
    narrative: {
      en: "Myo (卯, Rabbit): Gentle and diplomatic. You navigate the world with grace, seeing solutions before others see problems.",
      es: "Myo (Conejo): Gentil y diplomático. Navegas por el mundo con gracia, viendo soluciones antes de que otros vean problemas.",
      fr: "Myo (Lapin) : Doux et diplomate. Vous naviguez dans le monde avec grâce, voyant des solutions avant que les autres ne voient les problèmes.",
      ja: "卯（ウ、ウサギ）：穏やかで外交적입니다. 우아하게 세상을 항해하며, 다른 사람들이 문제를 보기 전에 해결책을 봅니다.",
      ko: "묘(卯, 토끼): 온유하고 외교적입니다. 우아하게 세상을 항해하며, 다른 사람들이 문제를 보기 전에 해결책을 봅니다.",
      zh: "卯（兔）：温柔且善于外交。你优雅地驾驭世界，在别人看到问题之前看到解决方案。",
    },
  },
  o: {
    animal: "Horse",
    element: "Fire",
    hours: "11:00-13:00",
    narrative: {
      en: "O (午, Horse): Free and passionate. You embody noon's peak energy - vital, active, and always moving toward the horizon.",
      es: "O (Caballo): Libre y apasionado. Encarnas la energía máxima del mediodía: vital, activo y siempre avanzando hacia el horizonte.",
      fr: "O (Cheval) : Libre et passionné. Vous incarnez l'énergie maximale de midi - vital, actif et toujours en mouvement vers l'horizon.",
      ja: "午（ウマ）：自由で情熱적입니다. 정오의 절정 에너지를 구현합니다 - 활력 있고, 활동적이며, 항상 지평선을 향해 나아갑니다.",
      ko: "오(午, 말): 자유롭고 열정적입니다. 정오의 절정 에너지를 구현합니다 - 활력 있고, 활동적이며, 항상 지평선을 향해 나아갑니다.",
      zh: "午（马）：自由而热情。你体现正午的巅峰能量——充满活力、积极主动，总是向着地平线前进。",
    },
  },
  sa: {
    animal: "Snake",
    element: "Fire",
    hours: "09:00-11:00",
    narrative: {
      en: "Sa (巳, Snake): Wise and intuitive. You possess deep intelligence and the ability to sense what others cannot perceive.",
      es: "Sa (Serpiente): Sabio e intuitivo. Posees una profunda inteligencia y la capacidad de sentir lo que otros no pueden percibir.",
      fr: "Sa (Serpent) : Sage et intuitif. Vous possédez une intelligence profonde et la capacité de sentir ce que les autres ne peuvent percevoir.",
      ja: "巳（ミ、ヘビ）：賢明で直感的입니다. 깊은 지성과 다른 사람들이 감지할 수 없는 것을 느끼는 능력을 가지고 있습니다.",
      ko: "사(巳, 뱀): 지혜롭고 직관적입니다. 깊은 지성과 다른 사람들이 감지할 수 없는 것을 느끼는 능력을 가지고 있습니다.",
      zh: "巳（蛇）：智慧而直觉。你拥有深厚的智慧和感知他人无法感知事物的能力。",
    },
  },
  shin_branch: {
    animal: "Monkey",
    element: "Metal",
    hours: "15:00-17:00",
    narrative: {
      en: "Shin (申, Monkey): Clever and versatile. Your quick mind finds solutions others miss, and your adaptability knows no bounds.",
      es: "Shin (Mono): Inteligente y versátil. Tu mente rápida encuentra soluciones que otros pasan por alto, y tu adaptabilidad no conoce límites.",
      fr: "Shin (Singe) : Intelligent et polyvalent. Votre esprit vif trouve des solutions que les autres manquent, et votre adaptabilité ne connaît aucune limite.",
      ja: "申（サル）：賢くて多才입니다. 당신의 빠른 정신이 다른 사람들이 놓치는 해결책을 찾고, 적응력에 한계가 없습니다.",
      ko: "신(申, 원숭이): 영리하고 다재다능합니다. 빠른 정신이 다른 사람들이 놓치는 해결책을 찾고, 적응력에 한계가 없습니다.",
      zh: "申（猴）：聪明且多才多艺。你敏捷的头脑能找到别人错过的解决方案，你的适应能力没有界限。",
    },
  },
  sul: {
    animal: "Dog",
    element: "Earth",
    hours: "19:00-21:00",
    narrative: {
      en: "Sul (戌, Dog): Loyal and protective. You embody duty, devotion, and the instinct to guard what you love.",
      es: "Sul (Perro): Leal y protector. Encarnas el deber, la devoción y el instinto de proteger lo que amas.",
      fr: "Sul (Chien) : Loyal et protecteur. Vous incarnez le devoir, le dévouement et l'instinct de protéger ce que vous aimez.",
      ja: "戌（イヌ）：忠実で保護的입니다. 의무, 헌신, 사랑하는 것을 지키려는 본능을 구현합니다.",
      ko: "술(戌, 개): 충성스럽고 보호적입니다. 의무, 헌신, 사랑하는 것을 지키려는 본능을 구현합니다.",
      zh: "戌（狗）：忠诚且具有保护性。你体现责任、奉献和守护所爱之人的本能。",
    },
  },
  yu: {
    animal: "Rooster",
    element: "Metal",
    hours: "17:00-19:00",
    narrative: {
      en: "Yu (酉, Rooster): Confident and observant. You herald truth with precision, noticing details that escape others.",
      es: "Yu (Gallo): Seguro y observador. Anuncias la verdad con precisión, notando detalles que escapan a los demás.",
      fr: "Yu (Coq) : Confiant et observateur. Vous annoncez la vérité avec précision, remarquant des détails qui échappent aux autres.",
      ja: "酉（トリ）：自信があり、観察力がい 뛰어납니다. 정확성으로 진실을 알리고, 다른 사람들이 놓치는 세부 사항을 알아챕니다.",
      ko: "유(酉, 닭): 자신감 있고 관찰력이 뛰어납니다. 정확성으로 진실을 알리고, 다른 사람들이 놓치는 세부 사항을 알아챕니다.",
      zh: "酉（鸡）：自信且善于观察。你精准地传达真理，注意到他人忽略的细节。",
    },
  },
};

export const GANZHI_COMBINATION_NARRATIVES: Record<string, SixLangString> = {
  "byeong-in": {
    en: "Byeong-In (丙寅): Yang Fire on Tiger. Solar brilliance meets primal power. A charismatic force that inspires action.",
    es: "Byeong-In (丙寅): Yang Fuego sobre Tigre. El brillo solar se encuentra con el poder primitivo. Una fuerza carismática que inspira acción.",
    fr: "Byeong-In (丙寅) : Feu Yang sur Tigre. L'éclat solaire rencontre la puissance primitive. Une force charismatique qui inspire l'action.",
    ja: "丙寅（ひのえ・とら）：태양의 광채가 원초적 힘을 만납니다. 행동에 영감을 주는 카리스마 있는 힘.",
    ko: "병인(丙寅): 호랑이 위의 양화. 태양의 광채가 원초적 힘을 만납니다. 행동에 영감을 주는 카리스마 있는 힘.",
    zh: "丙寅：太阳的光辉遇上原始的力量。激发行动的魅力力量。",
  },
  "eul-chuk": {
    en: "Eul-Chuk (乙丑): Yin Wood on Ox. Gentle persistence in stable ground. Flexible adaptation meets patient endurance.",
    es: "Eul-Chuk (乙丑): Yin Madera sobre Buey. Persistencia suave en terreno estable. La adaptación flexible se encuentra con la resistencia paciente.",
    fr: "Eul-Chuk (乙丑) : Bois Yin sur Bœuf. Persévérance douce sur un sol stable. L'adaptation flexible rencontre l'endurance patiente.",
    ja: "乙丑（きのと・うし）：안정된 땅에서의 부드러운 끈기. 유연한 적응이 인내심 있는 인내를 만납니다.",
    ko: "을축(乙丑): 소 위의 음목. 안정된 땅에서의 부드러운 끈기. 유연한 적응이 인내심 있는 인내를 만납니다.",
    zh: "乙丑：稳定地面上的温柔坚持。灵活的适应遇上耐心的持久。",
  },
  "eul-hae": {
    en: "Eul-Hae (乙亥): Yin Wood on Pig. Vine in abundance. Flexible growth nurtured by generous plenty.",
    es: "Eul-Hae (乙亥): Yin Madera sobre Cerdo. Vid en abundancia. Crecimiento flexible nutrido por una generosa abundancia.",
    fr: "Eul-Hae (乙亥) : Bois Yin sur Cochon. Vigne en abondance. Croissance flexible nourrie par une généreuse abondance.",
    ja: "乙亥（きのと・い）：풍요 속의 덩굴. 관대한 풍요로 양육된 유연한 성장.",
    ko: "을해(乙亥): 돼지 위의 음목. 풍요 속의 덩굴. 관대한 풍요로 양육된 유연한 성장.",
    zh: "乙亥：丰富的藤蔓。受慷慨丰富滋养的灵活生长。",
  },
  "gap-ja": {
    en: "Gap-Ja (甲子): Yang Wood on Rat. The beginning of all cycles. Strong initiative meets resourceful intelligence. A leader who builds from nothing.",
    es: "Gap-Ja (甲子): Yang Madera sobre Rata. El comienzo de todos los ciclos. La fuerte iniciativa se encuentra con la inteligencia ingeniosa. Un líder que construye desde la nada.",
    fr: "Gap-Ja (甲子) : Bois Yang sur Rat. Le début de tous les cycles. Une forte initiative rencontre une intelligence ingénieuse. Un leader qui construit à partir de rien.",
    ja: "甲子（きのえ・ね）：모든 순환의 시작. 강한 주도력이 자원 있는 지성을 만납니다. 무에서 유를 창조하는 리더.",
    ko: "갑자(甲子): 쥐 위의 양목. 모든 순환의 시작. 강한 주도력이 자원 있는 지성을 만납니다. 무에서 유를 창조하는 리더.",
    zh: "甲子：所有循环的开始。强大的主动性遇上足智多谋的智慧。从无到有的建立者。",
  },
  "gap-sul": {
    en: "Gap-Sul (甲戌): Yang Wood on Dog. Tree guardian. Growth energy protected by loyal devotion.",
    es: "Gap-Sul (甲戌): Yang Madera sobre Perro. Guardián del árbol. Energía de crecimiento protegida por una devoción leal.",
    fr: "Gap-Sul (甲戌) : Bois Yang sur Chien. Gardien de l'arbre. Énergie de croissance protégée par un dévouement loyal.",
    ja: "甲戌（きのえ・いぬ）：나무 수호자. 충성스러운 헌신으로 보호받는 성장 에너지.",
    ko: "갑술(甲戌): 개 위의 양목. 나무 수호자. 충성스러운 헌신으로 보호받는 성장 에너지.",
    zh: "甲戌：树的守护者。受忠诚奉献保护的生长能量。",
  },
  "gi-sa": {
    en: "Gi-Sa (己巳): Yin Earth on Snake. Fertile wisdom. Deep intuition nurtured by patient cultivation.",
    es: "Gi-Sa (己巳): Yin Tierra sobre Serpiente. Sabiduría fértil. Profunda intuición nutrida por el cultivo paciente.",
    fr: "Gi-Sa (己巳) : Terre Yin sur Serpent. Sagesse fertile. Intuition profonde nourrie par une culture patiente.",
    ja: "己巳（つちのと・み）：비옥한 지혜. 인내심 있는 경작으로 양육된 깊은 직관.",
    ko: "기사(己巳): 뱀 위의 음토. 비옥한 지혜. 인내심 있는 경작으로 양육된 깊은 직관.",
    zh: "己巳：肥沃的智慧。耐心耕耘培养出的深刻直觉。",
  },
  "gye-yu": {
    en: "Gye-Yu (癸酉): Yin Water on Rooster. Rain at dusk. Intuitive perception meets precise observation.",
    es: "Gye-Yu (癸酉): Yin Agua sobre Gallo. Lluvia al anochecer. La percepción intuitiva se encuentra con la observación precisa.",
    fr: "Gye-Yu (癸酉) : Eau Yin sur Coq. Pluie au crépuscule. La perception intuitive rencontre l'observation précise.",
    ja: "癸酉（みずのと・とり）：황혼의 비. 직관적 인식이 정밀한 관찰을 만납니다.",
    ko: "계유(癸酉): 닭 위의 음수. 황혼의 비. 직관적 인식이 정밀한 관찰을 만납니다.",
    zh: "癸酉：黄昏的雨。直觉感知遇上精确观察。",
  },
  "gyeong-o": {
    en: "Gyeong-O (庚午): Yang Metal on Horse. Sword in sunlight. Decisive action meets passionate freedom.",
    es: "Gyeong-O (庚午): Yang Metal sobre Caballo. Espada a la luz del sol. La acción decisiva se encuentra con la libertad apasionada.",
    fr: "Gyeong-O (庚午) : Métal Yang sur Cheval. Épée au soleil. L'action décisive rencontre la liberté passionnée.",
    ja: "庚午（かのえ・うま）：햇빛 속의 검. 결단력 있는 행동이 열정적 자유를 만납니다.",
    ko: "경오(庚午): 말 위의 양금. 햇빛 속의 검. 결단력 있는 행동이 열정적 자유를 만납니다.",
    zh: "庚午：阳光下的剑。果断的行动遇上充满激情的自由。",
  },
  "im-shin": {
    en: "Im-Shin (壬申): Yang Water on Monkey. Ocean of cleverness. Vast wisdom meets quick-witted versatility.",
    es: "Im-Shin (壬申): Yang Agua sobre Mono. Océano de astucia. La vasta sabiduría se encuentra con la versatilidad ingeniosa.",
    fr: "Im-Shin (壬申) : Eau Yang sur Singe. Océan d'intelligence. Une vaste sagesse rencontre une polyvalence vive d'esprit.",
    ja: "壬申（みずのえ・さる）：영리함의 바다. 광대한 지혜가 재치 있는 다재다능함을 만납니다.",
    ko: "임신(壬申): 원숭이 위의 양수. 영리함의 바다. 광대한 지혜가 재치 있는 다재다능함을 만납니다.",
    zh: "壬申：聪明的海洋。浩瀚的智慧遇上机智的多才多艺。",
  },
  "jeong-myo": {
    en: "Jeong-Myo (丁卯): Yin Fire on Rabbit. Candle light in the forest. Diplomatic warmth and artistic sensitivity.",
    es: "Jeong-Myo (丁卯): Yin Fuego sobre Conejo. Luz de vela en el bosque. Calidez diplomática y sensibilidad artística.",
    fr: "Jeong-Myo (丁卯) : Feu Yin sur Lapin. Lumière de bougie dans la forêt. Chaleur diplomatique et sensibilité artistique.",
    ja: "丁卯（ひのと・う）：숲 속의 촛불. 외교적 따뜻함과 예술적 감수성.",
    ko: "정묘(丁卯): 토끼 위의 음화. 숲 속의 촛불. 외교적 따뜻함과 예술적 감수성.",
    zh: "丁卯：森林中的烛光。外交的温暖和艺术的敏感性。",
  },
  "mu-jin": {
    en: "Mu-Jin (戊辰): Yang Earth on Dragon. Mountain meets myth. Unstoppable ambition grounded in solid reality.",
    es: "Mu-Jin (戊辰): Yang Tierra sobre Dragón. La montaña se encuentra con el mito. Ambición imparable fundamentada en la realidad sólida.",
    fr: "Mu-Jin (戊辰) : Terre Yang sur Dragon. La montagne rencontre le mythe. Une ambition imparable ancrée dans une réalité solide.",
    ja: "戊辰（つちのえ・たつ）：산이 신화를 만납니다. 확고한 현실에 기반한 멈출 수 없는 야망.",
    ko: "무진(戊辰): 용 위의 양토. 산이 신화를 만납니다. 확고한 현실에 기반한 멈출 수 없는 야망.",
    zh: "戊辰：山遇上神话。建立在坚实这一现实基础上的不可阻挡的雄心。",
  },
  "shin-mi": {
    en: "Shin-Mi (辛未): Yin Metal on Goat. Jewel in gentle hands. Refined artistry and compassionate precision.",
    es: "Shin-Mi (辛未): Yin Metal sobre Cabra. Joya en manos gentiles. Arte refinado y precisión compasiva.",
    fr: "Shin-Mi (辛未) : Métal Yin sur Chèvre. Joyau dans des mains douces. Art raffine et précision compatissante.",
    ja: "辛未（かのと・ひつじ）：온유한 손의 보석. 정제된 예술성과 자비로운 정밀함.",
    ko: "신미(辛未): 양 위의 음금. 온유한 손의 보석. 정제된 예술성과 자비로운 정밀함.",
    zh: "辛未：温柔手中的宝石。精致的艺术性和富有同情心的精确度。",
  },
};

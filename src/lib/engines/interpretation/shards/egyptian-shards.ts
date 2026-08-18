import type { SixLangString } from "../engine.contract";

/**
 * Egyptian Astrology Shard Data
 * Deity narratives and domains separated from logic.
 */

export const EGYPTIAN_DEITIES: Record<
  string,
  {
    domain: SixLangString;
    narrative: SixLangString;
    symbol: string;
  }
> = {
  amon_ra: {
    domain: {
      en: "The Sun, Creation, Kings",
      es: "El Sol, Creación, Reyes",
      fr: "Le Soleil, Création, Rois",
      ja: "太陽、創造、王",
      ko: "태양, 창조, 왕들",
      zh: "太阳、创造、王者",
    },
    narrative: {
      en: "Amon-Ra (Jan 8-21, Feb 1-11): The King of Gods. You carry the light of creation itself. Leadership, authority, and the power to illuminate the world around you.",
      es: "Amón-Ra (Ene 8-21, Feb 1-11): Rey de los Dioses. Llevas la luz de la creación. Liderazgo, autoridad y poder para iluminar el mundo.",
      fr: "Amon-Rê (8-21 janv, 1-11 fév): Le Roi des Dieux. Vous portez la lumière de la création. Leadership, autorité et le pouvoir d'illuminer le monde.",
      ja: "アモン・ラー (1/8-21, 2/1-11): 神々の王。創造の光そのものを宿しています。リーダーシップ、権威、周囲の世界を照らす力。",
      ko: "아몬라 (1/8-21, 2/1-11): 신들의 왕. 창조의 빛 자체를 지니고 있습니다. 리더십, 권위, 주변 세계를 비추는 힘.",
      zh: "阿蒙-拉 (1/8-21, 2/1-11): 众神之王。你承载着创造之光。拥有领导力、权威和照亮周围世界的力量。",
    },
    symbol: "☀️",
  },
  anubis: {
    domain: {
      en: "Death, Afterlife, Protection",
      es: "Muerte, Más Allá, Protección",
      fr: "Mort, Au-delà, Protection",
      ja: "死、死後の世界、保護",
      ko: "죽음, 사후세계, 보호",
      zh: "死亡、来世、保护",
    },
    narrative: {
      en: "Anubis (May 8-27, Jun 29 - Jul 13): The Guardian of the Dead. You understand transitions and transformations. Protector of souls in their journey between worlds.",
      es: "Anubis (May 8-27, Jun 29 - Jul 13): Guardián de los Muertos. Entiendes las transiciones. Protector de almas entre mundos.",
      fr: "Anubis (8-27 mai, 29 juin - 13 juil): Gardien des Morts. Vous comprenez les transitions. Protecteur des âmes entre les mondes.",
      ja: "アヌビス (5/8-27, 6/29-7/13): 死者の守護者。移行と変容を理解しています。世界の間を旅する魂の保護者。",
      ko: "아누비스 (5/8-27, 6/29-7/13): 죽은 자의 수호자. 전환과 변화를 이해합니다. 세계 사이를 여행하는 영혼의 보호자.",
      zh: "阿努比斯 (5/8-27, 6/29-7/13): 死者守护神。你理解转变和蜕变。灵魂在世界间旅程中的保护者。",
    },
    symbol: "🐺",
  },
  bastet: {
    domain: {
      en: "Home, Fertility, Protection",
      es: "Hogar, Fertilidad, Protección",
      fr: "Foyer, Fertilité, Protection",
      ja: "家庭、豊穣、保護",
      ko: "가정, 풍요, 보호",
      zh: "家庭、生育、保护",
    },
    narrative: {
      en: "Bastet (Jul 14-28, Sep 23-27, Oct 3-17): The Cat Goddess. You embody grace, sensuality, and fierce protection of those you love. Balance of gentleness and power.",
      es: "Bastet (Jul 14-28, Sep 23-27, Oct 3-17): Diosa Gato. Encarnas gracia, sensualidad y protección feroz. Equilibrio de gentileza y poder.",
      fr: "Bastet (14-28 juil, 23-27 sep, 3-17 oct): Déesse Chat. Vous incarnez la grâce, la sensualité et la protection féroce.",
      ja: "バステト (7/14-28, 9/23-27, 10/3-17): 猫の女神。優雅さ、官能性、愛する人々への激しい保護を体現しています。",
      ko: "바스테트 (7/14-28, 9/23-27, 10/3-17): 고양이 여신. 우아함, 관능성, 사랑하는 이들의 맹렬한 보호를 구현합니다.",
      zh: "巴斯特 (7/14-28, 9/23-27, 10/3-17): 猫女神。你体现了优雅、感性和对所爱之人的强烈保护。",
    },
    symbol: "🐱",
  },
  geb: {
    domain: {
      en: "Earth, Nature, Fertility",
      es: "Tierra, Naturaleza, Fertilidad",
      fr: "Terre, Nature, Fertilité",
      ja: "大地、自然、豊穣",
      ko: "대지, 자연, 풍요",
      zh: "大地、自然、生育",
    },
    narrative: {
      en: "Geb (Feb 12-29, Aug 20-31): The Earth God. You are grounded, reliable, and connected to the physical world. Your stability supports all growth.",
      es: "Geb (Feb 12-29, Ago 20-31): Dios de la Tierra. Estás conectado a tierra, eres confiable y estás unido al mundo físico.",
      fr: "Geb (12-29 fév, 20-31 août): Dieu de la Terre. Vous êtes ancré, fiable et connecté au monde physique.",
      ja: "ゲブ (2/12-29, 8/20-31):大地の神。地に足がついており、信頼でき、物理的な世界と繋がっています。",
      ko: "게브 (2/12-29, 8/20-31): 대지의 신. 현실에 기반하고, 신뢰할 수 있으며, 물질 세계와 연결되어 있습니다.",
      zh: "盖布 (2/12-29, 8/20-31): 大地之神。你脚踏实地、可靠，与物质世界紧密相连。",
    },
    symbol: "🌍",
  },
  horus: {
    domain: {
      en: "Sky, War, Kingship",
      es: "Cielo, Guerra, Realeza",
      fr: "Ciel, Guerre, Royauté",
      ja: "空、戦争、王権",
      ko: "하늘, 전쟁, 왕권",
      zh: "天空、战争、王权",
    },
    narrative: {
      en: "Horus (Apr 20 - May 7, Aug 12-19): The Sky Falcon. You possess sharp vision, noble courage, and the determination to reclaim what is rightfully yours.",
      es: "Horus (Abr 20-May 7, Ago 12-19): El Halcón del Cielo. Posees visión aguda, coraje noble y determinación.",
      fr: "Horus (20 avr-7 mai, 12-19 août): Le Faucon Céleste. Vous possédez une vision perçante et un noble courage.",
      ja: "ホルス (4/20-5/7, 8/12-19): 天空の隼。鋭い視覚、高潔な勇気、そして正当な権利を取り戻す決断力を持っています。",
      ko: "호루스 (4/20-5/7, 8/12-19): 하늘의 매. 날카로운 시각, 고귀한 용기, 정당하게 당신의 것을 되찾을 결단력을 가지고 있습니다.",
      zh: "荷鲁斯 (4/20-5/7, 8/12-19): 天空之隼。你拥有敏锐的视野、高尚的勇气和夺回属于你的一切的决心。",
    },
    symbol: "🦅",
  },
  isis: {
    domain: {
      en: "Magic, Motherhood, Wisdom",
      es: "Magia, Maternidad, Sabiduría",
      fr: "Magie, Maternité, Sagesse",
      ja: "魔法、母性、知恵",
      ko: "마법, 모성, 지혜",
      zh: "魔法、母性、智慧",
    },
    narrative: {
      en: "Isis (Mar 11-31, Oct 18-29, Dec 19-31): The Great Mother. You hold the secrets of magic and healing. Devoted, wise, and possessing power over life itself.",
      es: "Isis (Mar 11-31, Oct 18-29, Dic 19-31): La Gran Madre. Posees los secretos de la magia y la curación.",
      fr: "Isis (11-31 mar, 18-29 oct, 19-31 déc): La Grande Mère. Vous détenez les secrets de la magie et de la guérison.",
      ja: "イシス (3/11-31, 10/18-29, 12/19-31): 偉大なる母. 魔法と癒しの秘密を握っています. 献身的で賢明.",
      ko: "이시스 (3/11-31, 10/18-29, 12/19-31): 위대한 어머니. 마법과 치유의 비밀을 가지고 있습니다. 헌신적이고, 지혜롭고, 생명 자체에 대한 힘을 가지고 있습니다.",
      zh: "伊西斯 (3/11-31, 10/18-29, 12/19-31): 伟大的母亲。你掌握着魔法和治愈的秘密。忠诚、智慧。",
    },
    symbol: "✨",
  },
  mut: {
    domain: {
      en: "Motherhood, Sky, Creation",
      es: "Maternidad, Cielo, Creación",
      fr: "Maternité, Ciel, Création",
      ja: "母性、空、創造",
      ko: "모성, 하늘, 창조",
      zh: "母性、天空、创造",
    },
    narrative: {
      en: "Mut (Jan 22-31, Sep 8-22): The Mother of All. You embody nurturing power and creative authority. The womb from which all things emerge.",
      es: "Mut (Ene 22-31, Sep 8-22): Madre de Todo. Encarnas el poder nutritivo y la autoridad creativa.",
      fr: "Mout (22-31 janv, 8-22 sep): Mère de Tout. Vous incarnez le pouvoir nourricier et l'autorité créatrice.",
      ja: "ムト (1/22-31, 9/8-22): 万物の母. 育成の力と創造的な権威を体現しています.",
      ko: "무트 (1/22-31, 9/8-22): 모든 것의 어머니. 양육의 힘과 창조적 권위를 구현합니다. 모든 것이 나오는 자궁.",
      zh: "姆特 (1/22-31, 9/8-22): 万物之母。你体现了养育的力量和创造性的权威。",
    },
    symbol: "👑",
  },
  nile: {
    domain: {
      en: "Fertility, Abundance, Life",
      es: "Fertilidad, Abundancia, Vida",
      fr: "Fertilité, Abondance, Vie",
      ja: "豊穣、豊富、生命",
      ko: "풍요, 풍성, 생명",
      zh: "肥沃、富足、生命",
    },
    narrative: {
      en: "Nile (Jan 1-7, Jun 19-28, Sep 1-7, Nov 18-26): The Sacred River. You bring life wherever you flow. Prosperity, renewal, and the gift of abundance.",
      es: "Nilo (Ene 1-7, Jun 19-28, Sep 1-7, Nov 18-26): El Río Sagrado. Traes vida donde fluyes.",
      fr: "Nil (1-7 janv, 19-28 juin, 1-7 sep, 18-26 nov): Le Fleuve Sacré. Vous apportez la vie partout où vous coulez.",
      ja: "ナイル (1/1-7, 6/19-28, 9/1-7, 11/18-26): 聖なる川. 流れる場所すべてに命をもたらします.",
      ko: "나일 (1/1-7, 6/19-28, 9/1-7, 11/18-26): 신성한 강. 흐르는 곳마다 생명을 가져옵니다. 번영, 갱신, 풍요의 선물.",
      zh: "尼罗河 (1/1-7, 6/19-28, 9/1-7, 11/18-26): 神圣之河。你流经之处带来生命。",
    },
    symbol: "🌊",
  },
  osiris: {
    domain: {
      en: "Afterlife, Rebirth, Justice",
      es: "Más Allá, Renacimiento, Justicia",
      fr: "Au-delà, Renaissance, Justice",
      ja: "死後の世界、再生、正義",
      ko: "사후세계, 재탄생, 정의",
      zh: "来世、重生、正义",
    },
    narrative: {
      en: "Osiris (Mar 1-10, Nov 27 - Dec 18): The Lord of the Underworld. You understand the mysteries of death and rebirth. Judge of souls, king of resurrection.",
      es: "Osiris (Mar 1-10, Nov 27 - Dic 18): Señor del Inframundo. Entiendes los misterios de la muerte y el renacimiento.",
      fr: "Osiris (1-10 mar, 27 nov-18 déc): Seigneur des Enfers. Vous comprenez les mystères de la mort et de la renaissance.",
      ja: "オシリス (3/1-10, 11/27-12/18): 冥界の王。死と再生の神秘を理解しています。魂の裁定者にして、復活の王。",
      ko: "오시리스 (3/1-10, 11/27-12/18): 지하세계의 주인. 죽음과 재탄생의 신비를 이해합니다. 영혼의 심판자, 부활의 왕.",
      zh: "欧西里斯 (3/1-10, 11/27-12/18): 冥界之主。你理解死亡和重生的奥秘。",
    },
    symbol: "⚱️",
  },
  sekhmet: {
    domain: {
      en: "War, Healing, Power",
      es: "Guerra, Curación, Poder",
      fr: "Guerre, Guérison, Pouvoir",
      ja: "戦争、癒し、力",
      ko: "전쟁, 치유, 힘",
      zh: "战争、治愈、力量",
    },
    narrative: {
      en: "Sekhmet (Jul 29 - Aug 11, Oct 30 - Nov 7): The Lioness. You possess fierce power that can destroy or heal. Warrior goddess with the heart of fire.",
      es: "Sejmet (Jul 29 - Ago 11, Oct 30 - Nov 7): La Leona. Posees un poder feroz que puede destruir o curar.",
      fr: "Sekhmet (29 juil-11 août, 30 oct-7 nov): La Lionne. Vous possédez un pouvoir féroce qui peut détruire ou guérir.",
      ja: "セクメト (7/29-8/11, 10/30-11/7): 雌ライオン. 破壊も癒しもできる激しい力を持っています.",
      ko: "세크메트 (7/29-8/11, 10/30-11/7): 암사자. 파괴하거나 치유할 수 있는 맹렬한 힘을 가지고 있습니다. 불의 심장을 가진 전사 여신.",
      zh: "塞赫麦特 (7/29-8/11, 10/30-11/7): 母狮。你拥有可以毁灭或治愈的猛烈力量。",
    },
    symbol: "🦁",
  },
  seth: {
    domain: {
      en: "Chaos, Storm, Strength",
      es: "Caos, Tormenta, Fuerza",
      fr: "Chaos, Tempête, Force",
      ja: "混沌、嵐、強さ",
      ko: "혼돈, 폭풍, 힘",
      zh: "混沌、风暴、力量",
    },
    narrative: {
      en: "Seth (May 28 - Jun 18, Sep 28 - Oct 2): The Storm Lord. You embody raw power and necessary chaos. Nothing new can be built without first destroying the old.",
      es: "Set (May 28 - Jun 18, Sep 28 - Oct 2): Señor de la Tormenta. Encarnas el poder puro y el caos necesario.",
      fr: "Seth (28 mai-18 juin, 28-2 oct): Seigneur de la Tempête. Vous incarnez la puissance brute et le chaos nécessaire.",
      ja: "セト (5/28-6/18, 9/28-10/2): 嵐の王. 生の力と必要な混沌を体現しています.",
      ko: "세트 (5/28-6/18, 9/28-10/2): 폭풍의 군주. 원초적 힘과 필요한 혼돈을 구현합니다. 오래된 것을 파괴하지 않고는 새것을 세울 수 없습니다.",
      zh: "赛特 (5/28-6/18, 9/28-10/2): 风暴之主。你体现了原始力量和必要的混乱。",
    },
    symbol: "⚡",
  },
  thoth: {
    domain: {
      en: "Wisdom, Writing, Magic",
      es: "Sabiduría, Escritura, Magia",
      fr: "Sagesse, Écriture, Magie",
      ja: "知恵、執筆、魔法",
      ko: "지혜, 글쓰기, 마법",
      zh: "智慧、写作、魔法",
    },
    narrative: {
      en: "Thoth (Apr 1-19, Nov 8-17): The Ibis-Headed God of Wisdom. You are the keeper of knowledge, inventor of writing, and master of magical arts.",
      es: "Thot (Abr 1-19, Nov 8-17): El Dios de la Sabiduría. Eres el guardián del conocimiento.",
      fr: "Thot (1-19 avr, 8-17 nov): Dieu de la Sagesse à tête d'Ibis. Vous êtes le gardien de la connaissance.",
      ja: "トト (4/1-19, 11/8-17): 知識の守護者であり, 文字の発明者.",
      ko: "토트 (4/1-19, 11/8-17): 따오기 머리의 지혜의 신. 지식의 수호자, 글쓰기의 발명자, 마법 예술의 대가.",
      zh: "托特 (4/1-19, 11/8-17): 智慧之神。你是知识的守护者，文字的发明者。",
    },
    symbol: "📜",
  },
};

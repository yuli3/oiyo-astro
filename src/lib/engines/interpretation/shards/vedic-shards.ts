import type { SixLangString } from "../engine.contract";

/**
 * Vedic (Jyotish) Shard Data
 * Nakshatras and Rashis narratives separated from logic.
 */

export const NAKSHATRA_DATA: Record<
  string,
  { deity: string; narrative: SixLangString }
> = {
  anuradha: {
    deity: "Mitra (Friendship)",
    narrative: {
      en: "Anuradha: The star of devotion. You possess the power of loyalty, cooperation, and the ability to organize others. You bring harmony and success through partnership.",
      es: "Anuradha: La estrella de la devoción. Posees el poder de la lealtad y la cooperación.",
      fr: "Anuradha : L'étoile de la dévotion. Vous possédez le pouvoir de la loyauté et de la coopération.",
      ja: "アヌラーダ：献身の星。忠誠心、協力、そして他者を組織する力を持っています。パートナーシップを通じて調和と成功をもたらします。",
      ko: "아누라다: 헌신의 별. 충성심, 협력, 그리고 타인을 조직하는 힘을 지니고 있습니다. 파트너십을 통해 조화와 성공을 가져옵니다.",
      zh: "房宿：奉献之星。你拥有忠诚、合作和组织他人的力量。你通过伙伴关系带来和谐与成功。",
    },
  },
  ardra: {
    deity: "Rudra (Storm God)",
    narrative: {
      en: "Ardra: The star of storms. You carry the power of destruction that makes way for renewal. Intense emotions and transformative experiences.",
      es: "Ardra: La estrella de las tormentas. Llevas el poder de la destrucción que abre paso a la renovación. Emociones intensas y experiencias transformadoras.",
      fr: "Ardra : L'étoile des tempêtes. Vous portez le pouvoir de la destruction qui ouvre la voie au renouveau. Émotions intenses et expériences transformatrices.",
      ja: "アルドラ：嵐の星。更新のための道を作る破壊の力を持っています。激しい感情と変容的な経験。",
      ko: "아르드라: 폭풍의 별. 갱신을 위한 길을 만드는 파괴의 힘을 지니고 있습니다. 강렬한 감정과 변형적 경험.",
      zh: "参宿：风暴之星。你需要破坏的力量为更新开路。强烈的情感和转化的体验。",
    },
  },
  ashlesha: {
    deity: "Nagas (Serpent Deities)",
    narrative: {
      en: "Ashlesha: The embracing star. You possess serpent wisdom - the power of kundalini, mystical insight, and hypnotic influence.",
      es: "Ashlesha: La estrella que abraza. Posees la sabiduría de la serpiente: el poder de la kundalini, la perspicacia mística y la influencia hipnótica.",
      fr: "Ashlesha : L'étoile qui embrasse. Vous possédez la sagesse du serpent - le pouvoir de la kundalini, la perspicacité mystique et l'influence hypnotique.",
      ja: "アシュレーシャー：抱擁の星。蛇の知恵 - クンダリニーの力、神秘的な洞察力、そして催眠的な影響力を持っています。",
      ko: "아슐레샤: 포옹의 별. 뱀의 지혜 - 쿤달리니의 힘, 신비로운 통찰력, 최면적 영향력을 가지고 있습니다.",
      zh: "柳宿：拥抱之星。你拥有蛇的智慧——昆达里尼的力量、神秘的洞察力和催眠的影响力。",
    },
  },
  ashwini: {
    deity: "Ashwini Kumaras (Divine Physicians)",
    narrative: {
      en: "Ashwini: You are born under the star of healing and swift action. Like the divine physicians, you bring renewal and the power to restore what was lost.",
      es: "Ashwini: Naciste bajo la estrella de la sanación y la acción rápida. Como los médicos divinos, traes renovación y el poder de restaurar lo perdido.",
      fr: "Ashwini : Vous êtes né sous l'étoile de la guérison et de l'action rapide. Comme les médecins divins, vous apportez le renouveau et le pouvoir de restaurer ce qui a été perdu.",
      ja: "アシュヴィニー：癒しと迅速な行動の星の下に生まれました。神聖な医師たちのように、再生と失われたものを回復する力をもたらします。",
      ko: "아쉬위니: 치유와 신속한 행동의 별 아래 태어났습니다. 신성한 의사들처럼 재생과 잃어버린 것을 회복시키는 힘을 가져옵니다.",
      zh: "阿什维尼：你出生在治愈和快速行动之星下。如同神圣的医师，你带来更新和恢复失去之物的力量。",
    },
  },
  bharani: {
    deity: "Yama (God of Death/Dharma)",
    narrative: {
      en: "Bharani: You carry the energy of transformation and rebirth. Under Yama's watch, you understand the cycles of creation and dissolution.",
      es: "Bharani: Llevas la energía de la transformación y el renacimiento. Bajo la vigilancia de Yama, entiendes los ciclos de creación y disolución.",
      fr: "Bharani : Vous portez l'énergie de la transformation et de la renaissance. Sous la surveillance de Yama, vous comprenez les cycles de création et de dissolution.",
      ja: "バラニー：変容と再生のエネルギーを持っています。ヤマの見守りの下、創造と溶解のサイクルを理解します。",
      ko: "바라니: 변화와 재탄생의 에너지를 지니고 있습니다. 야마의 보호 아래, 창조와 해체의 순환을 이해합니다.",
      zh: "婆罗尼：你携带着转化和重生的能量。在阎摩的注视下，你理解创造和消解的循环。",
    },
  },
  chitra: {
    deity: "Vishvakarma (Divine Architect)",
    narrative: {
      en: "Chitra: The brilliant star. You are an artist and designer, blessed with the power to create beautiful, lasting works.",
      es: "Chitra: La estrella brillante. Eres un artista y diseñador, bendecido con le poder de crear obras bellas y duraderas.",
      fr: "Chitra : L'étoile brillante. Vous êtes un artiste et un designer, béni par le pouvoir de créer des œuvres belles et durables.",
      ja: "チトラー：輝く星. あなたは芸術家でありデザイナーであり, 美しく永続的な作品を創造する力を祝福されています。",
      ko: "치트라: 빛나는 별. 당신은 예술가이자 디자이너이며, 아름답고 지속적인 작품을 만드는 힘을 축복받았습니다.",
      zh: "角宿：灿烂之星。你是艺术家和设计师，被赋予创造美丽、持久作品的力量。",
    },
  },
  dhanishta: {
    deity: "Vasus (Gods of Abundance)",
    narrative: {
      en: "Dhanishta: The star of wealth. You possess the power to manifest abundance and the ability to influence others through your resources. You are a force of prosperity and success.",
      es: "Dhanishta: La estrella de la riqueza. Posees el poder de manifestar abundancia.",
      fr: "Dhanishta : L'étoile de la richesse. Vous possédez le pouvoir de manifester l'abondance.",
      ja: "ダニシュター：富の星。豊かさを顕現する力と、資源を通じて他者に影響を与える能力を持っています。繁栄と成功の源です。",
      ko: "다니슈타: 부의 별. 풍요를 현현시키는 힘과 자신의 자원을 통해 타인에게 영향을 미치는 능력을 지니고 있습니다. 번영과 성공의 원천입니다.",
      zh: "虚宿：财富之星。你拥有显化丰盛的力量以及通过你的资源影响他人的能力。你是繁荣和成功的力量。",
    },
  },
  hasta: {
    deity: "Savitar (Sun God)",
    narrative: {
      en: "Hasta: The star of the hand. You possess skill, dexterity, and the power to manifest through craft and cunning.",
      es: "Hasta: La estrella de la mano. Posees habilidad, destreza y el poder de manifestar a través de la artesanía y la astucia.",
      fr: "Hasta : L'étoile de la main. Vous possédez l'habileté, la dextérité et le pouvoir de manifester par l'artisanat et la ruse.",
      ja: "ハスタ：手の星。技術、器用さ、そして工芸と機知を通じて体現する力を持っています。",
      ko: "하스타: 손의 별. 기술, 손재주, 그리고 공예와 교묘함을 통해 현현시키는 힘을 가지고 있습니다.",
      zh: "轸宿：手之星。你拥有技能、灵巧通过工艺和机智显化的力量。",
    },
  },
  jyeshtha: {
    deity: "Indra (King of Gods)",
    narrative: {
      en: "Jyeshtha: The elder star. You possess seniority, authority, and the power to protect. You are a leader who understands responsibility and the weight of power.",
      es: "Jyeshtha: La estrella mayor. Posees autoridad y el poder de proteger.",
      fr: "Jyeshtha : L'étoile aînée. Vous possédez l'autorité et le pouvoir de protéger.",
      ja: "ジェーシュタ：長老の星。権威、指導力、そして保護する力を持っています。責任と権力の重みを理解するリーダーです。",
      ko: "제이슈타: 연장자의 별. 권위, 지도력, 그리고 보호하는 힘을 지니고 있습니다. 책임과 권력의 무게를 이해하는 리더입니다.",
      zh: "心宿：长者之星。你拥有资历、权威和保护的力量。你是一个理解责任和权力分量的领导者。",
    },
  },
  krittika: {
    deity: "Agni (God of Fire)",
    narrative: {
      en: "Krittika: The star of the celestial fire. You possess the power to cut through illusion and purify what is impure. Sharp mind and burning determination.",
      es: "Krittika: La estrella del fuego celestial. Posees el poder de cortar la ilusión y purificar lo impuro. Mente aguda y determinación ardiente.",
      fr: "Krittika : L'étoile du feu céleste. Vous possédez le pouvoir de couper à travers l'illusion et de purifier ce qui est impur. Esprit vif et détermination brûlante.",
      ja: "クリティカ：天の火の星。幻影を切り裂き、不純なものを浄化する力を持っています。鋭い精神と燃えるような決意。",
      ko: "크리티카: 천상 불의 별. 환상을 꿰뚫고 불순한 것을 정화하는 힘을 가지고 있습니다. 날카로운 정신과 불타는 결의.",
      zh: "克利蒂卡：天火之星。你拥有切断幻象和净化不洁的力量。敏锐的头脑和燃烧的决心。",
    },
  },
  magha: {
    deity: "Pitris (Ancestors)",
    narrative: {
      en: "Magha: The royal star. You are connected to your ancestors and carry the weight of lineage. Leadership and the power of legacy.",
      es: "Magha: La estrella real. Estás conectado con tus antepasados y llevas el peso del linaje. Liderazgo y el poder del legado.",
      fr: "Magha : L'étoile royale. Vous êtes connecté à vos ancêtres et portez le poids de la lignée. Leadership et pouvoir de l'héritage.",
      ja: "マガー：王家の星。祖先とつながっており、血統の重みを背負っています。リーダーシップと遺産の力。",
      ko: "마가: 왕족의 별. 조상과 연결되어 있으며 혈통의 무게를 지고 있습니다. 리더십과 유산의 힘.",
      zh: "星宿：皇室之星。你与祖先相连，肩负着血统的重量。领导力和遗产的力量。",
    },
  },
  mrigashira: {
    deity: "Soma (The Moon God)",
    narrative: {
      en: "Mrigashira: The searching star. You are a seeker, always questing for new experiences and knowledge. Restless yet gentle.",
      es: "Mrigashira: La estrella buscadora. Eres un buscador, siempre en busca de nuevas experiencias y conocimientos. Inquieto pero gentil.",
      fr: "Mrigashira : L'étoile chercheuse. Vous êtes un chercheur, toujours en quête de nouvelles expériences et connaissances. Agité mais doux.",
      ja: "ムリガシラ：探索の星。あなたは探求者であり、常に新しい経験と知識を求めています。落ち着きがないが穏やかです。",
      ko: "므리가쉬라: 탐색의 별. 당신은 탐구자이며, 항상 새로운 경험과 지식을 추구합니다. 불안하지만 부드럽습니다.",
      zh: "鹿首：探索之星。你是一个寻求者，总是寻求新的体验和知识。不安分但温柔。",
    },
  },
  mula: {
    deity: "Nirriti (Goddess of Dissolution)",
    narrative: {
      en: "Mula: The root star. You possess the power to get to the core of any matter. You are a seeker of truth who is not afraid to destroy what is false to find the real.",
      es: "Mula: La estrella raíz. Posees el poder de llegar al núcleo de cualquier asunto.",
      fr: "Mula : L'étoile racine. Vous possédez le pouvoir d'aller au cœur de n'importe quel sujet.",
      ja: "ムーラ：根の星。どんな問題でも核心に到達する力を持っています。真実を見つけるために、偽りのものを破壊することを恐れない求道者です。",
      ko: "물라: 뿌리의 별. 어떤 문제든 핵심에 도달하는 힘을 지니고 있습니다. 진실을 찾기 위해 거짓된 것을 파괴하기를 두려워하지 않는 구도자입니다.",
      zh: "尾宿：根源之星。你拥有触及任何事物核心的力量。你是一个真理的追求者，不怕为了寻找真实而破坏虚假之物。",
    },
  },
  punarvasu: {
    deity: "Aditi (Mother of Gods)",
    narrative: {
      en: "Punarvasu: The star of renewal. You have the ability to restore, return, and renew. Optimism and the power of second chances.",
      es: "Punarvasu: La estrella de la renovación. Tienes la habilidad de restaurar, regresar y renovar. Optimismo y el poder de las segundas oportunidades.",
      fr: "Punarvasu : L'étoile du renouveau. Vous avez la capacité de restaurer, de revenir et de renouveler. Optimisme et pouvoir des secondes chances.",
      ja: "プナルヴァス：再生の星。回復し、戻り、更新する能力を持っています。楽観主義とセカンドチャンスの力。",
      ko: "푸나르바수: 재생의 별. 회복하고, 돌아오고, 갱신하는 능력을 가지고 있습니다. 낙관주의와 두 번째 기회의 힘.",
      zh: "井宿：更新之星。你有恢复、回归和更新的能力。乐观和二次机会的力量。",
    },
  },
  purvaAshadha: {
    deity: "Apas (Water Goddess)",
    narrative: {
      en: "Purva Ashadha: The invincible star. You possess the power of purification and the ability to win over obstacles. You are a force of rejuvenation and strength.",
      es: "Purva Ashadha: La estrella invencible. Posees el poder de la purificación.",
      fr: "Purva Ashadha : L'étoile invincible. Vous possédez le pouvoir de la purification.",
      ja: "プールヴァ・アーシャーダー：無敵の星。浄化の力と障害を克服する能力を持っています。再生と強さの源です。",
      ko: "푸르바 아샤다: 무적의 별. 정화의 힘과 장애물을 극복하는 능력을 지니고 있습니다. 재생과 힘의 원천입니다.",
      zh: "箕宿：无敌之星。你拥有净化的力量和克服障碍的能力。你是康复和力量的源泉。",
    },
  },
  purvaBhadrapada: {
    deity: "Aja Ekapada (Fire Serpent)",
    narrative: {
      en: "Purva Bhadrapada: The star of purification. You possess the fire to transform and the power to leave the past behind. You are a powerful spiritual warrior who seeks higher truths.",
      es: "Purva Bhadrapada: La estrella de la purificación. Posees el fuego para transformar.",
      fr: "Purva Bhadrapada : L'étoile de la purification. Vous possédez le feu pour transformer.",
      ja: "プールヴァ・バドラパダー：浄化の星。変容させる火と過去を置き去る力を持っています。高次の真理を求める強力な霊的戦士です。",
      ko: "푸르바 바드라파다: 정화의 별. 변형시키는 불과 과거를 뒤로하는 힘을 지니고 있습니다. 고차원적 진리를 추구하는 강력한 영적 전사입니다.",
      zh: "室宿：净化之星。你拥有转化的火和告别过去的力量。你是一个寻求更高真理的强大灵性战士。",
    },
  },
  purvaPhalguni: {
    deity: "Bhaga (God of Fortune)",
    narrative: {
      en: "Purva Phalguni: The star of good fortune. You attract pleasure, creativity, and romantic fulfillment. Life should be enjoyed.",
      es: "Purva Phalguni: La estrella de la buena fortuna. Atraes placer, creatividad y plenitud romántica. La vida debe disfrutarse.",
      fr: "Purva Phalguni : L'étoile de la bonne fortune. Vous attirez le plaisir, la créativité et l'épanouissement romantique. La vie doit être appréciée.",
      ja: "プールヴァ・パールグニー：幸運の星。喜び、創造性、そしてロマンチックな成就を引き寄せます。人生は楽しまれるべきです。",
      ko: "푸르바 팔구니: 행운의 별. 즐거움, 창의성, 로맨틱한 성취를 끌어당깁니다. 삶은 즐겨야 합니다.",
      zh: "张宿：好运之星。你吸引快乐、创造力和浪漫的满足。生活应该被享受。",
    },
  },
  pushya: {
    deity: "Brihaspati (Jupiter)",
    narrative: {
      en: "Pushya: The most auspicious nakshatra. You are blessed with wisdom, nourishment, and the ability to nurture growth in all things.",
      es: "Pushya: El nakshatra más auspicioso. Estás bendecido con sabiduría, nutrición y la capacidad de fomentar el crecimiento en todas las cosas.",
      fr: "Pushya : Le nakshatra le plus propice. Vous êtes béni par la sagesse, la nourriture et la capacité de favoriser la croissance en toutes choses.",
      ja: "プシャー：最も吉兆なナクシャトラ。知恵、栄養、そしてすべてのものの成長を育む能力に恵まれています。",
      ko: "푸샤: 가장 길조로운 낙샤트라. 지혜, 양육, 모든 것의 성장을 돕는 능력을 축복받았습니다.",
      zh: "鬼宿：最吉祥的纳沙特拉。你被赋予智慧、滋养和培育万物生长的能力。",
    },
  },
  revati: {
    deity: "Pushan (Nourisher)",
    narrative: {
      en: "Revati: The star of safe travel. You possess the power to nourish and protect travelers on their journey. You are a gentle spirit who brings completion and prosperous endings.",
      es: "Revati: La estrella del viaje seguro. Posees el poder de nutrir y proteger.",
      fr: "Revati : L'étoile du voyage sûr. Vous possédez le pouvoir de nourrir et de protéger.",
      ja: "レヴァーティー：安全な旅の星。旅人を養い、保護する力を持っています。完成と繁栄する結末をもたらす、穏やかな精神の持ち主です。",
      ko: "레바티: 안전한 여정의 별. 여행하는 자들을 부양하고 보호하는 힘을 지니고 있습니다. 완성도와 번영하는 결말을 가져오는 온유한 영혼입니다.",
      zh: "奎宿：旅途安全之星。你拥有在旅途中滋养和保护旅行者的力量。你是一个温柔的灵魂，带来圆满和繁荣的结局。",
    },
  },
  rohini: {
    deity: "Brahma (The Creator)",
    narrative: {
      en: "Rohini: The most creative and fertile nakshatra. You are blessed with beauty, growth, and the capacity to manifest abundance.",
      es: "Rohini: El nakshatra más creativo y fértil. Estás bendecido con belleza, crecimiento y la capacidad de manifestar abundancia.",
      fr: "Rohini : Le nakshatra le plus créatif et fertile. Vous êtes béni par la beauté, la croissance et la capacité de manifester l'abondance.",
      ja: "ローヒニー：最も創造的で肥沃なナクシャトラ。美しさ、成長、豊かさを顕現する能力に恵まれています。",
      ko: "로히니: 가장 창조적이고 풍요로운 낙샤트라. 아름다움, 성장, 풍요를 현현시키는 능력을 축복받았습니다.",
      zh: "罗希尼：最具创造力和肥沃的纳沙特拉。你被赋予美丽、成长和显化丰盛的能力。",
    },
  },
  shatabhisha: {
    deity: "Varuna (God of Cosmic Waters)",
    narrative: {
      en: "Shatabhisha: The star of a hundred healers. You possess deep mystical insight and the power to heal through knowledge of the hidden laws of nature. You are a transformer and a visionary.",
      es: "Shatabhisha: La estrella de los cien sanadores. Posees una profunda visión mística.",
      fr: "Shatabhisha : L'étoile des cent guérisseurs. Vous possédez une profonde vision mystique.",
      ja: "シャタビシャー：百人の癒し手の星。深い神秘的な洞察力と、自然の隠れた法則に関する知識を通じて癒す力を持っています。あなたは変革者であり、ビジョナリーです。",
      ko: "샤타비샤: 백 명의 치유자의 별. 깊은 신비적 통찰력과 자연의 숨겨진 법칙에 대한 지식을 통해 치유하는 힘을 지니고 있습니다. 당신은 변조자이자 비전가입니다.",
      zh: "危宿：百医之星。你拥有深刻的神秘洞察力，以及通过了解自然隐藏法则进行治愈的力量。你是一个转化者和远见者。",
    },
  },
  shravana: {
    deity: "Vishnu (The Preserver)",
    narrative: {
      en: "Shravana: The star of hearing. You possess the power of cosmic listening and the ability to learn and preserve knowledge. You are a seeker of wisdom and truth.",
      es: "Shravana: La estrella del oído. Posees el poder de la escucha cósmica.",
      fr: "Shravana : L'étoile de l'ouïe. Vous possédez le pouvoir de l'écoute cosmique.",
      ja: "シュラヴァナ：聞く星。宇宙的な聴取の力と、知識を学び保存する能力を持っています。知恵と真実の求道者です。",
      ko: "슈라바나: 들음의 별. 우주적 청취의 힘과 지식을 배우고 보존하는 능력을 지니고 있습니다. 지혜와 진실의 구도자입니다.",
      zh: "女宿：倾听之星。你拥有宇宙倾听的力量以及学习和保存知识的能力。你是一个智慧和真理的追求者。",
    },
  },
  swati: {
    deity: "Vayu (God of Wind)",
    narrative: {
      en: "Swati: The star of independence. You possess the agility of the wind and the power of self-reliance. You are a independent spirit, always moving and adapting.",
      es: "Swati: La estrella de la independencia. Posees la agilidad del viento y el poder de la autosuficiencia.",
      fr: "Swati : L'étoile de l'indépendance. Vous possédez l'agilité du vent et le pouvoir de l'autosuffisance.",
      ja: "スワーティー：独立の星。風のような敏捷さと自立の力を持っています。あなたは常に動き、適応する独立した精神の持ち主です。",
      ko: "스와티: 독립의 별. 바람의 민첩성과 자립의 힘을 지니고 있습니다. 당신은 항상 움직이고 적응하는 독립적인 영혼입니다.",
      zh: "亢宿：独立之星。你拥有风般的敏捷和自力更生的力量。你是一个独立的灵魂，总是在运动和适应。",
    },
  },
  uttaraAshadha: {
    deity: "Vishwa Devas (Universal Gods)",
    narrative: {
      en: "Uttara Ashadha: The universal star. You possess permanent success and the power of consolidation. You are a leader who builds lasting structures and legacies.",
      es: "Uttara Ashadha: La estrella universal. Posees el éxito permanente.",
      fr: "Uttara Ashadha : L'étoile universelle. Vous possédez le succès permanent.",
      ja: "ウッタラ・アーシャーダー：普遍の星。恒久的な成功と統合の力を持っています。永続的な構造と遺産を築くリーダーです。",
      ko: "우타라 아샤다: 보편의 별. 영구적인 성공과 통합의 힘을 지니고 있습니다. 지속적인 구조와 유산을 구축하는 리더입니다.",
      zh: "斗宿：普遍之星。你拥有持久的成功和巩固的力量。你是一个建立持久结构和遗产的领导者。",
    },
  },
  uttaraBhadrapada: {
    deity: "Ahir Budhnya (Serpent of the Deep)",
    narrative: {
      en: "Uttara Bhadrapada: The star of the depth. You possess stable success and the power to control deep emotions and hidden knowledge. You are a grounded soul who brings wisdom to others.",
      es: "Uttara Bhadrapada: La estrella de la profundidad. Posees éxito estable y control emocional.",
      fr: "Uttara Bhadrapada : L'étoile de la profondeur. Vous possédez un succès stable et un contrôle émotionnel.",
      ja: "ウッタラ・バドラパダー：深みの星。安定した成功と、深い感情や隠された知識をコントロールする力を持っています。他者に知恵をもたらす、落ち着いた魂の持ち主です。",
      ko: "우타라 바드라파다: 깊이의 별. 안정적인 성공과 깊은 감정 및 숨겨진 지식을 통제하는 힘을 지니고 있습니다. 타인에게 지혜를 주는 안정된 영혼입니다.",
      zh: "壁宿：深度之星。你拥有稳定的成功以及控制深层情感和隐藏知识的力量。你是一个稳重的灵魂，给他人带来智慧。",
    },
  },
  uttaraPhalguni: {
    deity: "Aryaman (God of Contracts)",
    narrative: {
      en: "Uttara Phalguni: The star of patronage. You excel in partnerships, contracts, and creating lasting bonds of friendship.",
      es: "Uttara Phalguni: La estrella del patrocinio. Sobresales en asociaciones, contratos y en la creación de lazos duraderos de amistad.",
      fr: "Uttara Phalguni : L'étoile du patronage. Vous excellez dans les partenariats, les contrats et la création de liens d'amitié durables.",
      ja: "ウッタラ・パールグニー：後援の星。パートナーシップ、契約、そして永続的な友情の絆を築くことに長けています。",
      ko: "우타라 팔구니: 후원의 별. 파트너십, 계약, 그리고 지속적인 우정의 유대를 만드는 데 뛰어납니다.",
      zh: "翼宿：赞助之星。你擅长伙伴关系、契约和建立持久的友谊纽带。",
    },
  },
  vishakha: {
    deity: "Indra & Agni",
    narrative: {
      en: "Vishakha: The star of purpose. You possess intense focus and the determination to achieve your goals. You are a powerful force of accomplishment and conquest.",
      es: "Vishakha: La estrella del propósito. Posees un enfoque intenso y determinación.",
      fr: "Vishakha : L'étoile du but. Vous possédez une concentration intense et une détermination.",
      ja: "ヴィシャーカ：目的の星。強烈な集中力と目標達成への決意を持っています。あなたは成就と征服の強力な力です。",
      ko: "비샤카: 목적의 별. 강렬한 집중력과 목표 달성을 위한 결의를 지니고 있습니다. 당신은 성취와 정복의 강력한 힘입니다.",
      zh: "氐宿：目标之星。你拥有强烈的专注力和实现目标的决心。你是成就和征服的强大力量。",
    },
  },
};

export const RASHI_NARRATIVES: Record<string, SixLangString> = {
  dhanu: {
    en: "Moon in Dhanu (Sagittarius): Your emotional nature is optimistic and adventurous. You seek truth and process feelings through exploration and philosophical inquiry.",
    es: "Luna en Dhanu (Sagitario): Tu naturaleza emocional es optimista.",
    fr: "Lune en Dhanu (Sagittaire) : Votre nature émotionnelle est optimiste.",
    ja: "ダヌ（射手座）の月：感情的な性質は楽観的で冒険心があります。真実を求め、探索や哲学的探究を通じて感情を処理します。",
    ko: "다누(궁수자리)의 달: 감정 본성이 낙천적이고 모험적입니다. 진실을 추구하며 탐험과 철학적 탐구를 통해 감정을 처리합니다.",
    zh: "射手座的月亮：你的情感本性能乐观且渴望冒险。你寻求真理，通过探索和哲学探寻处理感情。",
  },
  kanya: {
    en: "Moon in Kanya (Virgo): Your emotions are analytical and service-oriented. You seek perfection and find peace through order and helpfulness.",
    es: "Luna en Kanya (Virgo): Tus emociones son analíticas y orientadas al servicio.",
    fr: "Lune en Kanya (Vierge) : Vos émotions sont analytiques et orientées vers le service.",
    ja: "カニャー（乙女座）の月：感情は分析的で奉仕指向です。完璧を求め、秩序と役に立つことを通じて安らぎを得ます。",
    ko: "카냐(처녀자리)의 달: 감정이 분석적이고 서비스 지향적입니다. 완벽을 추구하며 질서와 도움을 통해 평화를 얻습니다.",
    zh: "处女座的月亮：你的情感善于分析且以服务为导向。你寻求完美，通过秩序和助人为乐寻找平静。",
  },
  karka: {
    en: "Moon in Karka (Cancer): Your emotions are deep and nurturing. You are highly intuitive and find security in family and home environments.",
    es: "Luna en Karka (Cáncer): Tus emociones son profundas y protectoras.",
    fr: "Lune en Karka (Cancer) : Vos émotions sont profondes et protectrices.",
    ja: "カルカ（蟹座）の月：感情は深く、育みがあります。非常に直感的で、家族や家庭環境に安心を見出します。",
    ko: "카르카(게자리)의 달: 감정이 깊고 양육적입니다. 매우 직관적이며 가족과 가정 환경에서 안정을 찾습니다.",
    zh: "巨蟹座的月亮：你的情感深沉且具有滋养性。你高度直觉，在家庭和居家环境中寻找安全感。",
  },
  kumbha: {
    en: "Moon in Kumbha (Aquarius): Your emotional nature is unique and humanitarian. You seek innovation and process feelings through social progress and collective goals.",
    es: "Luna en Kumbha (Acuario): Tu naturaleza emocional es única.",
    fr: "Lune en Kumbha (Verseau) : Votre nature émotionnelle est unique.",
    ja: "クンバ（水瓶座）の月：感情的な性質は独特で人道的です。革新を求め、社会の進歩や集団的な目標を通じて感情を処理します。",
    ko: "쿰바(물병자리)의 달: 감정 본성이 독특하고 인도주의적입니다. 혁신을 추구하며 사회적 진보와 집단적 목표를 통해 감정을 처리합니다.",
    zh: "水瓶座的月亮：你的情感本性独特且具有人道主义精神。你寻求创新，通过社会进步和集体目标处理感情。",
  },
  makara: {
    en: "Moon in Makara (Capricorn): Your emotions are disciplined and goal-oriented. You seek structure and find security through achievement and social status.",
    es: "Luna en Makara (Capricornio): Tus emociones son disciplinadas.",
    fr: "Lune en Makara (Capricorne) : Vos émotions sont disciplinées.",
    ja: "マカラ（山羊座）の月：感情は規律正しく、目標指向です。構造を求め、達成や社会的地位を通じて安心を得ます。",
    ko: "마카라(염소자리)의 달: 감정이 절제되고 목표 지향적입니다. 구조를 추구하며 성취와 사회적 지위를 통해 안정을 얻습니다.",
    zh: "摩羯座的月亮：你的情感严谨且以目标为导向。你寻求结构，通过成就和社会地位寻找安全感。",
  },
  meena: {
    en: "Moon in Meena (Pisces): Your emotions are compassionate and dreamy. You seek spiritual connection and find peace through empathy and creative imagination.",
    es: "Luna en Meena (Piscis): Tus emociones son compasivas.",
    fr: "Lune en Meena (Poissons) : Vos émotions sont compassives.",
    ja: "ミーナ（魚座）の月：感情は慈愛に満ち、夢見がちです。霊的なつながりを求め、共感や創造的な想像力を通じて安らぎを得ます。",
    ko: "미나(물고기자리)의 달: 감정이 자비롭고 몽상적입니다. 영적 연결을 추구하며 공감과 창의적 상상력을 통해 평화를 얻습니다.",
    zh: "双鱼座的月亮：你的情感富有慈悲心且爱幻想。你寻求灵性连接，通过同理心和创造性想象寻找平静。",
  },
  mesha: {
    en: "Moon in Mesha (Aries): Your emotional nature is fiery and pioneering. You process feelings through action and seek independence.",
    es: "Luna en Mesha (Aries): Tu naturaleza emocional es fogosa y pionera. Procesas sentimientos a través de la acción y buscas independencia.",
    fr: "Lune en Mesha (Bélier) : Votre nature émotionnelle est ardente et pionnière. Vous traitez les sentiments par l'action et recherchez l'indépendance.",
    ja: "メーシャ（牡羊座）の月：感情的な性質は火のように先駆的です。行動を通して感情を処理し、独立を追求します。",
    ko: "메샤(양자리)의 달: 감정 본성이 열정적이고 개척적입니다. 행동을 통해 감정을 처리하며 독립을 추구합니다.",
    zh: "白羊座的月亮：你的情感本性火热而开拓。你通过行动处理感情，追求独立。",
  },
  mithuna: {
    en: "Moon in Mithuna (Gemini): Your emotional nature is communicative and curious. You process feelings through intellectualizing and varied experiences.",
    es: "Luna en Mithuna (Géminis): Tu naturaleza emocional es comunicativa y curiosa.",
    fr: "Lune en Mithuna (Gémeaux) : Votre nature émotionnelle est communicative et curieuse.",
    ja: "ミトゥナ（双子座）の月：感情的な性質はコミュニケーション豊かで好奇心旺盛です。知性化と多様な経験を通じて感情を処理します。",
    ko: "미투나(쌍둥이자리)의 달: 감정 본성이 소통적이고 호기심이 많습니다. 지적 작업과 다양한 경험을 통해 감정을 처리합니다.",
    zh: "双子座的月亮：你的情感本性善于沟通且充满好奇。你通过理智化和多样的体验来处理感情。",
  },
  simha: {
    en: "Moon in Simha (Leo): Your emotional nature is dramatic and warm. You seek recognition and process feelings through creative expression and leadership.",
    es: "Luna en Simha (Leo): Tu naturaleza emocional es dramática y cálida.",
    fr: "Lune en Simha (Lion) : Votre nature émotionnelle est dramatique et chaleureuse.",
    ja: "シンハ（獅子座）の月：感情的な性質はドラマチックで温かいです。承認を求め、創造的な表現やリーダーシップを通じて感情を処理します。",
    ko: "심하(사자자리)의 달: 감정 본성이 드라마틱하고 따뜻합니다. 인정을 추구하며 창의적 표현과 리더십을 통해 감정을 처리합니다.",
    zh: "狮子座的月亮：你的情感本性具有戏剧性且温暖。你寻求认可，通过创造性表达和领导力处理感情。",
  },
  tula: {
    en: "Moon in Tula (Libra): Your emotional nature focuses on harmony and relationships. You seek balance and process feelings through social interaction and aesthetics.",
    es: "Luna en Tula (Libra): Tu naturaleza emocional se centra en la armonía.",
    fr: "Lune en Tula (Balance) : Votre nature émotionnelle se concentre sur l'harmonie.",
    ja: "トゥラー（天秤座）の月：感情的な性質は調和と関係性に焦点を当てています。バランスを求め、社会的交流や美学を通じて感情を処理します。",
    ko: "툴라(천칭자리)의 달: 감정 본성이 조화와 관계에 집중합니다. 균형을 추구하며 사회적 상호작용과 미학을 통해 감정을 처리합니다.",
    zh: "天秤座的月亮：你的情感本性侧重于和谐与关系。你寻求平衡，通过社交互动和美学处理感情。",
  },
  vrishabha: {
    en: "Moon in Vrishabha (Taurus): Your emotions are grounded and sensual. You need stability and security to feel at peace.",
    es: "Luna en Vrishabha (Tauro): Tus emociones son estables y sensuales. Necesitas estabilidad y seguridad para sentirte en paz.",
    fr: "Lune en Vrishabha (Taureau) : Vos émotions sont ancrées et sensuelles. Vous avez besoin de stabilité et de sécurité pour vous sentir en paix.",
    ja: "ヴリシャバ（牡牛座）の月：感情は安定しており、感覚的です。安らぎを感じるためには安定と安全を必要とします。",
    ko: "브리샤바(황소자리)의 달: 감정이 안정되고 감각적입니다. 평화를 느끼려면 안정과 안전이 필요합니다.",
    zh: "金牛座的月亮：你的情感稳定而感性。你需要稳定和安全才能感到平静。",
  },
  vrishchika: {
    en: "Moon in Vrischika (Scorpio): Your emotions are intense and transformative. You seek depth and process feelings through investigation and powerful emotional experiences.",
    es: "Luna en Vrishchika (Escorpio): Tus emociones son intensas y transformadoras.",
    fr: "Lune en Vrischika (Scorpion) : Vos émotions sont intenses et transformatrices.",
    ja: "ヴリシュチカ（蠍座）の月：感情は激しく、変容をもたらします。深さを求め、探究や強力な感情的経験を通じて感情を処理します。",
    ko: "브리슈치카(전갈자리)의 달: 감정이 강렬하고 변형적입니다. 깊이를 추구하며 탐구와 강력한 감정적 경험을 통해 감정을 처리합니다.",
    zh: "天蝎座的月亮：你的情感强烈且具有转化性。你寻求深度，通过调查和强大的情感体验处理感情。",
  },
};

export const DEFAULT_NAKSHATRA_NARRATIVE: SixLangString = {
  en: "Your Nakshatra reveals your lunar destiny.",
  es: "Tu Nakshatra revela tu destino lunar.",
  fr: "Votre Nakshatra révèle votre destin lunaire.",
  ja: "あなたのナクシャトラは月の運命を明らかにします。",
  ko: "당신의 낙샤트라가 달의 운명을 드러냅니다.",
  zh: "你的纳沙特拉揭示了你的月亮命运。",
};

export const DEFAULT_RASHI_NARRATIVE: SixLangString = {
  en: "Your Rashi (Moon Sign) shapes your emotional core.",
  es: "Tu Rashi (Signo Lunar) forma tu núcleo emocional.",
  fr: "Votre Rashi (Signe Lunaire) façonne votre noyau émotionnel.",
  ja: "あなたのラシ（月星座）は感情の核心を形成します。",
  ko: "당신의 라쉬(달자리)가 감정의 핵심을 형성합니다.",
  zh: "你的拉希（月亮星座）塑造了你的情感核心。",
};

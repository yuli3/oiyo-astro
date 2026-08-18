import type { SixLangString } from "../engine.contract";

/**
 * Hellenistic Astrology Shard Data
 * Houses and Classical Planets narratives separated from logic.
 */

export const HELLENISTIC_HOUSES: Record<
  number,
  {
    greekName: string;
    lifeArea: SixLangString;
    narrative: SixLangString;
  }
> = {
  1: {
    greekName: "Horoskopos",
    lifeArea: {
      en: "Self, Appearance, Vitality",
      es: "Yo, Apariencia, Vitalidad",
      fr: "Soi, Apparence, Vitalité",
      ja: "自分、外見、活力",
      ko: "자아, 외모, 활력",
      zh: "自我、外貌、活力",
    },
    narrative: {
      en: "1st House (Ascendant): The Helm of Life. This house reveals your physical body, temperament, and how you project yourself into the world. The starting point of your destiny.",
      es: "Casa 1 (Ascendente): El Timón de la Vida. Revela tu cuerpo físico, temperamento y cómo te proyectas al mundo.",
      fr: "Maison 1 (Ascendant): Le Gouvernail de la Vie. Révèle votre corps physique, votre tempérament et votre projection dans le monde.",
      ja: "第1ハウス (アセンダント): 人生の舵。このハウスはあなたの肉体、気質、そして世界に自分を投影する方法を明らかにします。",
      ko: "1궁 (상승궁): 삶의 키. 이 하우스는 신체, 기질, 그리고 세상에 자신을 투사하는 방식을 드러냅니다. 운명의 시작점.",
      zh: "第一宫 (上升宫): 生命之舵。此宫揭示了你的身体、气质以及你在世人面前的形象。",
    },
  },
  2: {
    greekName: "Gate of Hades",
    lifeArea: {
      en: "Possessions, Resources, Livelihood",
      es: "Posesiones, Recursos, Sustento",
      fr: "Possessions, Ressources, Subsistance",
      ja: "所有、リソース、生計",
      ko: "소유, 자원, 생계",
      zh: "财产、资源、生计",
    },
    narrative: {
      en: "2nd House (Livelihood): The storehouse of your resources. This house governs what you possess, your earning capacity, and your relationship with material security.",
      es: "Casa 2 (Sustento): El almacén de tus recursos. Rige lo que posees y tu capacidad de ganancia.",
      fr: "Maison 2 (Ressources): L'entrepôt de vos ressources. Gouverne vos possessions et votre capacité de gain.",
      ja: "第2ハウス (生計): リソースの貯蔵庫。所有物、稼ぐ力、物質的な安定との関係を支配します。",
      ko: "2궁 (생계): 당신의 자원 창고. 이 하우스는 소유물, 수입 능력, 물질적 안정과의 관계를 지배합니다.",
      zh: "第二宫 (财帛宫): 资源的宝库。掌管你的财产、赚钱能力以及与物质安全的关系。",
    },
  },
  3: {
    greekName: "Thea",
    lifeArea: {
      en: "Siblings, Communication, Short Journeys",
      es: "Hermanos, Comunicación, Viajes Cortos",
      fr: "Fratrie, Communication, Courts Voyages",
      ja: "兄弟姉妹、コミュニケーション、短い旅行",
      ko: "형제자매, 소통, 짧은 여행",
      zh: "兄弟姐妹、沟通、短途旅行",
    },
    narrative: {
      en: "3rd House (Goddess): The house of the Moon goddess. Governs siblings, neighbors, communication, and short travels. Your immediate environment.",
      es: "Casa 3 (Diosa): La casa de la diosa Luna. Rige hermanos, comunicación y viajes cortos.",
      fr: "Maison 3 (Déesse): La maison de la déesse Lune. Gouverne la fratrie, la communication et les courts voyages.",
      ja: "第3ハウス (女神): 月の女神のハウス。兄弟姉妹、隣人、コミュニケーション、短い旅行を支配します。",
      ko: "3궁 (여신): 달의 여신의 하우스. 형제자매, 이웃, 소통, 짧은 여행을 지배합니다. 즉각적인 환경.",
      zh: "第三宫 (女神): 月亮女神之宫。掌管兄弟姐妹、邻居、沟通和短途旅行。",
    },
  },
  4: {
    greekName: "Hypogeion",
    lifeArea: {
      en: "Home, Family, Roots, Father",
      es: "Hogar, Familia, Raíces, Padre",
      fr: "Foyer, Famille, Racines, Père",
      ja: "家庭、家族、ルーツ、父親",
      ko: "가정, 가족, 뿌리, 아버지",
      zh: "家庭、家族、根基、父亲",
    },
    narrative: {
      en: "4th House (Underground): The foundation of your chart. Governs home, ancestry, the father, and your private life. Where you rest and regenerate.",
      es: "Casa 4 (Subterráneo): La base de tu carta. Rige el hogar, la ascendencia y la vida privada.",
      fr: "Maison 4 (Souterrain): La fondation de votre thème. Gouverne le foyer, l'ascendance et la vie privée.",
      ja: "第4ハウス (地下): チャートの基盤。家庭、祖先、父親、私生活を支配します。休息し再生する場所。",
      ko: "4궁 (지하): 차트의 기반. 집, 조상, 아버지, 사생활을 지배합니다. 휴식하고 재생하는 곳.",
      zh: "第四宫 (地下): 星盘的基础。掌管家庭、祖先、父亲和私生活。你休息和再生的地方。",
    },
  },
  5: {
    greekName: "Agathe Tyche",
    lifeArea: {
      en: "Children, Pleasure, Creativity",
      es: "Hijos, Placer, Creatividad",
      fr: "Enfants, Plaisir, Créativité",
      ja: "子供、喜び、創造性",
      ko: "자녀, 즐거움, 창의성",
      zh: "子女、快乐、创造力",
    },
    narrative: {
      en: "5th House (Good Fortune): The house of joy and creation. Governs children, romance, creativity, and the pleasures that make life worth living.",
      es: "Casa 5 (Buena Fortuna): La casa de la alegría. Rige niños, romance y creatividad.",
      fr: "Maison 5 (Bonne Fortune): La maison de la joie. Gouverne les enfants, la romance et la créativité.",
      ja: "第5ハウス (幸運): 喜びと創造のハウス。子供、ロマンス、創造性、人生を生きる価値のあるものにする喜びを支配します。",
      ko: "5궁 (행운): 기쁨과 창조의 하우스. 자녀, 로맨스, 창의성, 삶을 가치 있게 만드는 즐거움을 지배합니다.",
      zh: "第五宫 (好运): 欢乐与创造之宫。掌管子女、浪漫、创造力以及让生活有意义的乐趣。",
    },
  },
  6: {
    greekName: "Kake Tyche",
    lifeArea: {
      en: "Health, Service, Enemies",
      es: "Salud, Servicio, Enemigos",
      fr: "Santé, Service, Ennemis",
      ja: "健康、奉仕、敵",
      ko: "건강, 봉사, 적",
      zh: "健康、服务、敌人",
    },
    narrative: {
      en: "6th House (Bad Fortune): The house of struggle. Governs health challenges, daily work, servants, and open enemies. Where you overcome adversity.",
      es: "Casa 6 (Mala Fortuna): La casa de la lucha. Rige la salud, el trabajo diario y los enemigos.",
      fr: "Maison 6 (Mauvaise Fortune): La maison de la lutte. Gouverne la santé, le travail quotidien et les ennemis.",
      ja: "第6ハウス (悪運): 闘争のハウス。健康問題、日々の仕事、奉仕、公然の敵を支配します。",
      ko: "6궁 (악운): 투쟁의 하우스. 건강 도전, 일상 업무, 하인, 공개적인 적을 지배합니다. 역경을 극복하는 곳.",
      zh: "第六宫 (厄运): 斗争之宫。掌管健康挑战、日常工作和公开的敌人。",
    },
  },
  7: {
    greekName: "Dysis",
    lifeArea: {
      en: "Marriage, Partnerships, Others",
      es: "Matrimonio, Asociaciones, Otros",
      fr: "Mariage, Partenariats, Autres",
      ja: "結婚、パートナーシップ、他者",
      ko: "결혼, 파트너십, 타인",
      zh: "婚姻、伙伴关系、他者",
    },
    narrative: {
      en: "7th House (Setting): The house of the Other. Governs marriage, business partnerships, and all one-on-one relationships. Your mirror in the world.",
      es: "Casa 7 (Puesta): La casa del Otro. Rige el matrimonio y las asociaciones.",
      fr: "Maison 7 (Couchant): La maison de l'Autre. Gouverne le mariage et les partenariats.",
      ja: "第7ハウス (日没): 他者のハウス。結婚、ビジネスパートナーシップ、あらゆる1対1の関係を支配します。",
      ko: "7궁 (지는 곳): 타자의 하우스. 결혼, 비즈니스 파트너십, 모든 1:1 관계를 지배합니다. 세상에서의 당신의 거울.",
      zh: "第七宫 (日落): 他者之宫。掌管婚姻、商业伙伴关系和所有一对一关系。",
    },
  },
  8: {
    greekName: "Epikataphora",
    lifeArea: {
      en: "Death, Inheritance, Transformation",
      es: "Muerte, Herencia, Transformación",
      fr: "Mort, Héritage, Transformation",
      ja: "死、遺産、変容",
      ko: "죽음, 상속, 변형",
      zh: "死亡、遗产、转化",
    },
    narrative: {
      en: "8th House (Post-Descent): The house of death and rebirth. Governs inheritance, other people's resources, and the transformations that remake you.",
      es: "Casa 8 (Post-Descenso): La casa de la muerte y el renacimiento. Rige la herencia y la transformación.",
      fr: "Maison 8 (Post-Descente): La maison de la mort et de la renaissance. Gouverne l'héritage et la transformation.",
      ja: "第8ハウス (降下後): 死と再生のハウス。遺産、他人のリソース、あなたを作り変える変容を支配します。",
      ko: "8궁 (하강 후): 죽음과 재탄생의 하우스. 상속, 타인의 자원, 당신을 다시 만드는 변화를 지배합니다.",
      zh: "第八宫 (疾厄宫): 死与重生之宫。掌管遗产、他人资源和重塑你的转变。",
    },
  },
  9: {
    greekName: "Theos",
    lifeArea: {
      en: "Philosophy, Travel, Higher Learning",
      es: "Filosofía, Viajes, Educación Superior",
      fr: "Philosophie, Voyage, Éducation Supérieure",
      ja: "哲学、旅行、高等教育",
      ko: "철학, 여행, 고등 교육",
      zh: "哲学、旅行、高等教育",
    },
    narrative: {
      en: "9th House (God): The house of the Sun god. Governs philosophy, religion, long journeys, and the quest for meaning. Your search for truth.",
      es: "Casa 9 (Dios): La casa del dios Sol. Rige filosofía, religión y viajes largos.",
      fr: "Maison 9 (Dieu): La maison du dieu Soleil. Gouverne la philosophie, la religion et les longs voyages.",
      ja: "第9ハウス (神): 太陽神のハウス。哲学、宗教、長い旅、意味の探求を支配します。",
      ko: "9궁 (신): 태양신의 하우스. 철학, 종교, 긴 여행, 의미 추구를 지배합니다. 진리에 대한 탐색.",
      zh: "第九宫 (神): 太阳神之宫。掌管哲学、宗教、长途旅行和对意义的追求。",
    },
  },
  10: {
    greekName: "Mesoranema",
    lifeArea: {
      en: "Career, Reputation, Public Life",
      es: "Carrera, Reputación, Vida Pública",
      fr: "Carrière, Réputation, Vie Publique",
      ja: "キャリア、評判、公生活",
      ko: "경력, 명성, 공적 삶",
      zh: "事业、名声、公共生活",
    },
    narrative: {
      en: "10th House (Midheaven): The peak of the chart. Governs career, public reputation, and your actions that echo through history. Your legacy.",
      es: "Casa 10 (Medio Cielo): La cima de la carta. Rige la carrera y la reputación pública.",
      fr: "Maison 10 (Milieu du Ciel): Le sommet du thème. Gouverne la carrière et la réputation publique.",
      ja: "第10ハウス (中天): チャートの頂点。キャリア、社会的評判、歴史に響く行動を支配します。",
      ko: "10궁 (중천): 차트의 정점. 직업, 대중적 명성, 역사에 울려 퍼지는 당신의 행동을 지배합니다. 유산.",
      zh: "第十宫 (中天): 星盘的顶点。掌管事业、公众声誉和你的遗产。",
    },
  },
  11: {
    greekName: "Agathos Daimon",
    lifeArea: {
      en: "Friends, Hopes, Benefactors",
      es: "Amigos, Esperanzas, Benefactores",
      fr: "Amis, Espoirs, Bienfaiteurs",
      ja: "友人、希望、後援者",
      ko: "친구, 희망, 후원자",
      zh: "朋友、希望、恩人",
    },
    narrative: {
      en: "11th House (Good Spirit): The house of blessings. Governs friends, allies, hopes and dreams, and those who help you on your path.",
      es: "Casa 11 (Buen Espíritu): La casa de las bendiciones. Rige amigos, esperanzas y aliados.",
      fr: "Maison 11 (Bon Esprit): La maison des bénédictions. Gouverne les amis, les espoirs et les alliés.",
      ja: "第11ハウス (善き霊): 祝福のハウス。友人、同盟者、希望と夢, あなたの道で助けてくれる人々を支配します。",
      ko: "11궁 (좋은 영): 축복의 하우스. 친구, 동맹, 희망과 꿈, 당신의 길에서 도와주는 사람들을 지배합니다.",
      zh: "第十一宫 (善灵): 祝福之宫。掌管朋友、盟友、希望和梦想。",
    },
  },
  12: {
    greekName: "Kakos Daimon",
    lifeArea: {
      en: "Hidden Enemies, Imprisonment, Seclusion",
      es: "Enemigos Ocultos, Encarcelamiento, Reclusión",
      fr: "Ennemis Cachés, Emprisonnement, Seclusion",
      ja: "隠れた敵、監禁、隠遁",
      ko: "숨은 적, 감금, 은둔",
      zh: "隐藏的敌人、监禁、隐居",
    },
    narrative: {
      en: "12th House (Bad Spirit): The house of undoing. Governs hidden enemies, self-sabotage, isolation, and the unconscious patterns that bind you.",
      es: "Casa 12 (Mal Espíritu): La casa de la ruina. Rige enemigos ocultos y el aislamiento.",
      fr: "Maison 12 (Mauvais Esprit): La maison de la perte. Gouverne les ennemis cachés et l'isolement.",
      ja: "第12ハウス (悪霊): 破滅のハウス。隠れた敵、自己妨害、孤立、あなたを束縛する無意識のパターンを支配します。",
      ko: "12궁 (나쁜 영): 파멸의 하우스. 숨은 적, 자기 파괴, 고립, 당신을 구속하는 무의식적 패턴을 지배합니다.",
      zh: "第十二宫 (恶灵): 毁灭之宫。掌管隐形敌人、自我破坏和潜意识模式。",
    },
  },
};

export const CLASSICAL_PLANETS: Record<
  string,
  {
    dayNight: "Diurnal" | "Neutral" | "Nocturnal";
    domicile: string[];
    narrative: SixLangString;
    symbol: string;
  }
> = {
  jupiter: {
    dayNight: "Diurnal",
    domicile: ["Sagittarius", "Pisces"],
    narrative: {
      en: "Jupiter (Zeus): The greater benefic. Your capacity for growth, wisdom, and good fortune. The expansive principle of abundance.",
      es: "Jupiter (Zeus): El benéfico mayor. Crecimiento, sabiduría y fortuna.",
      fr: "Jupiter (Zeus): Le grand bénéfique. Croissance, sagesse et fortune.",
      ja: "木星 (ゼウス): 大吉星。成長、知恵、幸運への能力。豊かさの拡大原理。",
      ko: "목성 (제우스): 대길성. 성장, 지혜, 행운에 대한 능력. 풍요의 확장적 원리.",
      zh: "木星 (宙斯): 大吉星。你成长、智慧和好运的能力。",
    },
    symbol: "♃",
  },
  mars: {
    dayNight: "Nocturnal",
    domicile: ["Aries", "Scorpio"],
    narrative: {
      en: "Mars (Ares): The lesser malefic. Your drive, courage, and capacity for action. The warrior energy that overcomes obstacles.",
      es: "Marte (Ares): El maléfico menor. Tu impulso, coraje y acción.",
      fr: "Mars (Arès): Le petit maléfique. Votre dynamisme, courage et action.",
      ja: "火星 (アレス): 小凶星。あなたの意欲、勇気、行動力。障害を克服する戦士のエネルギー。",
      ko: "화성 (아레스): 소흉성. 추진력, 용기, 행동 능력. 장애물을 극복하는 전사 에너지.",
      zh: "火星 (阿瑞斯): 小凶星。你的动力、勇气和行动能力。",
    },
    symbol: "♂",
  },
  mercury: {
    dayNight: "Neutral",
    domicile: ["Gemini", "Virgo"],
    narrative: {
      en: "Mercury (Hermes): The messenger of the gods. Your mind, communication style, and ability to connect disparate ideas.",
      es: "Mercurio (Hermes): El mensajero. Tu mente y estilo de comunicación.",
      fr: "Mercure (Hermès): Le messager. Votre esprit et votre style de communication.",
      ja: "水星 (ヘルメス): 神々の使者。あなたの精神、コミュニケーションスタイル、異なるアイデアを結びつける能力。",
      ko: "수성 (헤르메스): 신들의 전령. 정신, 소통 스타일, 이질적인 아이디어를 연결하는 능력.",
      zh: "水星 (赫尔墨斯): 众神的信使。你的思维、沟通方式以及连接不同想法的能力。",
    },
    symbol: "☿",
  },
  moon: {
    dayNight: "Nocturnal",
    domicile: ["Cancer"],
    narrative: {
      en: "Moon (Selene): The mirror of the soul. Your emotional nature, habits, and the unconscious patterns that shape daily life.",
      es: "Luna (Selene): El espejo del alma. Tu naturaleza emocional y hábitos.",
      fr: "Lune (Séléné): Le miroir de l'âme. Votre nature émotionnelle et vos habitudes.",
      ja: "月 (セレネ): 魂の鏡。感情的な性質、習慣、そして日常生活を形成する無意識のパターン。",
      ko: "달 (셀레네): 영혼의 거울. 감정적 본성, 습관, 일상 생활을 형성하는 무의식적 패턴.",
      zh: "月亮 (塞勒涅): 灵魂之镜。你的情感本质、习惯以及塑造日常生活的潜意识模式。",
    },
    symbol: "☽",
  },
  saturn: {
    dayNight: "Diurnal",
    domicile: ["Capricorn", "Aquarius"],
    narrative: {
      en: "Saturn (Kronos): The greater malefic. Your relationship with time, limitation, and maturity. The teacher through hardship.",
      es: "Saturno (Cronos): El maléfico mayor. Tiempo, limitación y madurez.",
      fr: "Saturne (Chronos): Le grand maléfique. Temps, limitation et maturité.",
      ja: "土星 (クロノス): 大凶星。時間、制限、成熟との関係。困難を通じた教師。",
      ko: "토성 (크로노스): 대흉성. 시간, 제한, 성숙과의 관계. 고난을 통한 스승.",
      zh: "土星 (克洛诺斯): 大凶星。你与时间、限制和成熟的关系。",
    },
    symbol: "♄",
  },
  sun: {
    dayNight: "Diurnal",
    domicile: ["Leo"],
    narrative: {
      en: "Sun (Helios): The light of consciousness. Your vital force, life purpose, and the central flame around which your life orbits.",
      es: "Sol (Helios): La luz de la conciencia. Tu fuerza vital y propósito de vida.",
      fr: "Soleil (Hélios): La lumière de la conscience. Votre force vitale et votre but dans la vie.",
      ja: "太陽 (ヘリオス): 意識の光。生命力、人生の目的、そしてあなたの人生が周回する中心の炎。",
      ko: "태양 (헬리오스): 의식의 빛. 생명력, 삶의 목적, 그리고 당신의 삶이 궤도를 도는 중심 불꽃.",
      zh: "太阳 (赫利俄斯): 意识之光。你的生命力、人生目标以及生命围绕其旋转的中心火焰。",
    },
    symbol: "☉",
  },
  venus: {
    dayNight: "Nocturnal",
    domicile: ["Taurus", "Libra"],
    narrative: {
      en: "Venus (Aphrodite): The lesser benefic. Your capacity for love, beauty, pleasure, and the arts. What you find attractive.",
      es: "Venus (Afrodita): El benéfico menor. Tu capacidad para el amor y la belleza.",
      fr: "Vénus (Aphrodite): La petite bénéfique. Votre capacité d'amour et de beauté.",
      ja: "金星 (アフロディーテ): 小吉星。愛、美、喜び、芸術への能力。魅力的だと感じるもの。",
      ko: "금성 (아프로디테): 소길성. 사랑, 아름다움, 즐거움, 예술에 대한 능력. 당신이 매력적으로 느끼는 것.",
      zh: "金星 (阿芙罗狄蒂): 小吉星。你对爱、美、快乐和艺术的能力。",
    },
    symbol: "♀",
  },
};

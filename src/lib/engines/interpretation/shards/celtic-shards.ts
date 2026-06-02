import { SixLangString } from "../engine.contract";

/**
 * Celtic Shard Data
 * Celtic tree narratives and symbolism separated from logic.
 */

export const CELTIC_TREES: Record<
  string,
  {
    narrative: SixLangString;
    ogham: string;
    symbolism: SixLangString;
  }
> = {
  alder: {
    narrative: {
      en: "Alder (Fearn): The tree of the warrior. You have the courage to face challenges and the strength to protect what you love.",
      es: "Aliso (Fearn): El árbol del guerrero. Tienes el coraje para enfrentar desafíos.",
      fr: "Aulne (Fearn): L'arbre du guerrier. Vous avez le courage d'affronter les défis.",
      ja: "ハンノキ (フェアン): 戦士의 木。挑戦に立ち向かう勇気と、愛하는 것을 守る 強さ를 持っています。",
      ko: "오리나무 (파언): 전사의 나무. 도전에 맞설 용기와 사랑하는 것을 보호할 힘을 가지고 있습니다.",
      zh: "赤杨 (Fearn): 战士之树。你有面对挑战的勇气和保护所爱之人的力量。",
    },
    ogham: "ᚃ",
    symbolism: {
      en: "Courage, protection, foundation, the shield.",
      es: "Coraje, protección, fundamento, el escudo.",
      fr: "Courage, protection, fondation, le bouclier.",
      ja: "勇気、保護、基盤、盾.",
      ko: "용기, 보호, 기반, 방패.",
      zh: "勇气、保护、基础、盾牌.",
    },
  },
  ash: {
    narrative: {
      en: "Ash (Nion): The world tree connecting all realms. You are a bridge between worlds, linking the mundane and the spiritual.",
      es: "Fresno (Nion): El árbol del mundo. Eres un puente entre mundos.",
      fr: "Frêne (Nion): L'arbre du monde. Vous êtes un pont entre les mondes.",
      ja: "トネリコ (ニオン): 全領域をつなぐ世界樹。あなたは世界間の架け橋であり、日常と精神を結びつけます。",
      ko: "물푸레나무 (니온): 모든 영역을 연결하는 세계수. 당신은 세상의 다리이며, 일상과 영적인 것을 연결합니다.",
      zh: "白蜡树 (Nion): 连接所有领域的世界树。你是世界之间的桥梁，连接世俗与精神。",
    },
    ogham: "ᚅ",
    symbolism: {
      en: "Connection, wisdom, the link between inner and outer worlds.",
      es: "Conexión, sabiduría, el vínculo entre mundos internos y externos.",
      fr: "Connexion, sagesse, le lien entre les mondes intérieur et extérieur.",
      ja: "つながり、知恵、内面と外面の世界のリンク。",
      ko: "연결, 지혜, 내면과 외부 세계 사이의 연결.",
      zh: "连接、智慧、内心与外部世界的纽带。",
    },
  },
  birch: {
    narrative: {
      en: "Birch (Beith): The tree of new beginnings. You are a pioneer spirit, capable of thriving where others cannot. Your path is one of renewal and resilience.",
      es: "Abedul (Beith): El árbol de los nuevos comienzos. Eres un espíritu pionero, capaz de prosperar donde otros no pueden.",
      fr: "Bouleau (Beith): L'arbre des nouveaux commencements. Vous êtes un esprit pionnier, capable de prospérer là où d'autres ne le peuvent pas.",
      ja: "カバノキ (ベイス): 新たな始まりの木。あなたは開拓者精神を持ち、他の人ができない場所で繁栄することができます。",
      ko: "자작나무 (베이스): 새로운 시작의 나무. 당신은 개척 정신을 가지고 있으며, 다른 사람들이 할 수 없는 곳에서 번성할 수 있습니다.",
      zh: "桦树 (Beith): 新开始之树。你具有开拓精神，能在他人无法生存的地方茁壮成长。",
    },
    ogham: "ᚁ",
    symbolism: {
      en: "Purification, fresh starts, clearing the old to make way for the new.",
      es: "Purificación, nuevos comienzos, limpiar lo viejo para dar paso a lo nuevo.",
      fr: "Purification, nouveaux départs, faire place au nouveau.",
      ja: "浄化、新たな始まり、新しいもののために古いものを一掃する。",
      ko: "정화, 새로운 시작, 새로운 것을 위해 오래된 것을 정리.",
      zh: "净化、崭新的开始、除旧迎新。",
    },
  },
  elder: {
    narrative: {
      en: "Elder (Ruis): The tree of endings and rebirth. You understand the cycles of death and regeneration, the wisdom of completion.",
      es: "Saúco (Ruis): El árbol de los finales y el renacimiento. Entiendes los ciclos.",
      fr: "Sureau (Ruis): L'arbre des fins et de la renaissance. Vous comprenez les cycles.",
      ja: "ニワトコ (ル이스): 終わり와 再生의 木. 死와 再生의 サイクル, 完成의 知恵를 理解しています。",
      ko: "엘더 (루이스): 끝과 재탄생의 나무. 죽음과 재생의 순환, 완성의 지혜를 이해합니다.",
      zh: "接骨木 (Ruis): 终结与重生之树。你理解死亡与再生的循环，完成的智慧。",
    },
    ogham: "ᚏ",
    symbolism: {
      en: "Endings, regeneration, the Crone goddess, cycles.",
      es: "Finales, regeneración, la diosa anciana, ciclos.",
      fr: "Fins, régénération, la déesse aînée, cycles.",
      ja: "終わり, 再生, 老婦人 女神, サイクル.",
      ko: "끝, 재생, 노파 여신, 순환.",
      zh: "终结、再生、老妪女神、循环。",
    },
  },
  hawthorn: {
    narrative: {
      en: "Hawthorn (Huath): The tree of boundaries and cleansing. You guard the threshold between worlds and understand purification.",
      es: "Espino (Huath): El árbol de los límites y la limpieza. Guardas el umbral.",
      fr: "Aubépine (Huath): L'arbre des frontières et de la purification. Vous gardez le seuil.",
      ja: "サンザシ (ウアス): 境界と浄化の木。世界間の境界を守り、浄化を理解しています。",
      ko: "산사나무 (후아스): 경계와 정화의 나무. 세계 사이의 문턱을 지키고 정화를 이해합니다.",
      zh: "山楂 (Huath): 边界与净化之树。你守护着世界之间的门槛，理解净化。",
    },
    ogham: "ᚆ",
    symbolism: {
      en: "Cleansing, boundaries, fertility, the fairy realm.",
      es: "Limpieza, límites, fertilidad, el reino de las hadas.",
      fr: "Purification, frontières, fertilité, le royaume des fées.",
      ja: "浄화, 境界, 豊穣, 妖精의 領域.",
      ko: "정화, 경계, 풍요, 요정의 영역.",
      zh: "净化、边界、生育、精灵领域。",
    },
  },
  hazel: {
    narrative: {
      en: "Hazel (Coll): The tree of wisdom and knowledge. You are a natural seeker of truth with the power of divination.",
      es: "Avellano (Coll): El árbol de la sabiduría y el conocimiento. Eres un buscador de la verdad.",
      fr: "Noisetier (Coll): L'arbre de la sagesse et de la connaissance. Vous êtes un chercheur de vérité.",
      ja: "ハシバミ (コル): 知恵と知識の木。占いの力を持つ真理の探求者です。",
      ko: "개암나무 (콜): 지혜와 지식의 나무. 점술의 힘을 가진 타고난 진리 탐구자입니다.",
      zh: "榛树 (Coll): 智慧与知识之树。你是拥有占卜力量的天生真理寻求者。",
    },
    ogham: "ᚉ",
    symbolism: {
      en: "Wisdom, divination, inspiration, the salmon of knowledge.",
      es: "Sabiduría, adivinación, inspiración.",
      fr: "Sagesse, divination, inspiration.",
      ja: "知恵, 占い, インスピレーション, 知識의 鮭.",
      ko: "지혜, 점술, 영감, 지식의 연어.",
      zh: "智慧、占卜、灵感、知识之鲑。",
    },
  },
  holly: {
    narrative: {
      en: "Holly (Tinne): The tree of unconquerable energy. You possess warrior spirit and the ability to overcome any obstacle.",
      es: "Acebo (Tinne): El árbol de la energía inconquistable. Posees espíritu guerrero.",
      fr: "Houx (Tinne): L'arbre de l'énergie invincible. Vous possédez l'esprit guerrier.",
      ja: "ヒイラギ (ティネ): 征服できないエネルギーの木。戦士の精神とあらゆる障害を克服する能力を持っています。",
      ko: "호랑가시나무 (티네): 정복할 수 없는 에너지의 나무. 전사 정신과 어떤 장애물도 극복하는 능력을 가지고 있습니다.",
      zh: "冬青 (Tinne): 不可战胜的能量之树。你拥有战士精神和克服任何障碍的能力。",
    },
    ogham: "ᚈ",
    symbolism: {
      en: "Unconquerable energy, masculine power, victory.",
      es: "Energía inconquistable, poder masculino, victoria.",
      fr: "Énergie invincible, pouvoir masculin, victoire.",
      ja: "征服できないエネルギー, 男性的な力, 勝利.",
      ko: "정복할 수 없는 에너지, 남성적 힘, 승리.",
      zh: "不可战胜的能量、阳刚之力、胜利。",
    },
  },
  ivy: {
    narrative: {
      en: "Ivy (Gort): The tree of spiraling journey. You navigate life's labyrinth with persistence and find strength in connection.",
      es: "Hiedra (Gort): El árbol del viaje en espiral. Navegas el laberinto de la vida.",
      fr: "Lierre (Gort): L'arbre du voyage en spirale. Vous naviguez dans le labyrinth de la vie.",
      ja: "ツタ (ゴート): 螺旋の旅の木。粘り強さで人生の迷路を進み、つながりに強さを見出します。",
      ko: "담쟁이 (고트): 나선형 여행의 나무. 끈기로 삶의 미로를 항해하고 연결에서 힘을 찾습니다.",
      zh: "常春藤 (Gort): 螺旋旅程之树。你以毅力穿越生命的迷宫，在连接中找到力量。",
    },
    ogham: "ᚌ",
    symbolism: {
      en: "Perseverance, spiraling growth, hidden pathways.",
      es: "Perseverancia, crecimiento en espiral, caminos ocultos.",
      fr: "Persévérance, croissance en spirale, chemins cachés.",
      ja: "忍耐, 螺旋状의 成長, 隠された 経路.",
      ko: "인내, 나선형 성장, 숨겨진 경로.",
      zh: "毅力、螺旋生长、隐藏的路径。",
    },
  },
  oak: {
    narrative: {
      en: "Oak (Duir): The tree of strength and endurance. You are a natural protector and leader, with roots that run deep.",
      es: "Roble (Duir): El árbol de la fuerza y la resistencia. Eres un protector natural.",
      fr: "Chêne (Duir): L'arbre de la force et de l'endurance. Vous êtes un protecteur naturel.",
      ja: "オーク (ドゥイル): 強さと忍耐の木。あなたは生まれつきの保護者でありリーダーであり、根が深いです。",
      ko: "참나무 (두이르): 힘과 인내의 나무. 당신은 타고난 보호자이자 리더이며, 뿌리가 깊습니다.",
      zh: "橡树 (Duir): 力量与耐力之树。你是天生的保护者和领袖，根基深厚。",
    },
    ogham: "ᚇ",
    symbolism: {
      en: "Strength, protection, doorways between worlds, the king of the forest.",
      es: "Fuerza, protección, puertas entre mundos.",
      fr: "Force, protection, portes entre les mondes.",
      ja: "強さ, 保護, 世界間의 扉, 森의 王.",
      ko: "힘, 보호, 세계 사이의 문, 숲의 왕.",
      zh: "力量、保护、世界之门、森林之王。",
    },
  },
  reed: {
    narrative: {
      en: "Reed (Ngetal): The tree of direct action. You have the power to find order in chaos and strike with precision.",
      es: "Caña (Ngetal): El árbol de la acción directa. Tienes el poder de encontrar orden.",
      fr: "Roseau (Ngetal): L'arbre de l'action directe. Vous avez le pouvoir de trouver l'ordre.",
      ja: "アシ (ンゲタル): 直接行動の木. 混沌の中に秩序を見出し、正確に打つ力を持っています。",
      ko: "갈대 (나탈): 직접 행동의 나무. 혼돈 속에서 질서를 찾고 정확하게 공격하는 힘을 가지고 있습니다.",
      zh: "芦苇 (Ngetal): 直接行动之树。你有在混乱中寻找秩序并精准出击的力量。",
    },
    ogham: "ᚍ",
    symbolism: {
      en: "Direct action, finding direction, harmony.",
      es: "Acción directa, encontrar dirección, armonía.",
      fr: "Action directe, trouver une direction, harmonie.",
      ja: "直接 行動, 方向을 見つける, 調和.",
      ko: "직접 행동, 방향 찾기, 조화.",
      zh: "直接行动、寻找方向、和谐。",
    },
  },
  rowan: {
    narrative: {
      en: "Rowan (Luis): The tree of protection and vision. You have the gift of foresight and the power to ward off negative energies.",
      es: "Serbal (Luis): El árbol de la protección y la visión. Tienes el don de la previsión.",
      fr: "Sorbier (Luis): L'arbre de la protection et de la vision. Vous avez le don de prévoyance.",
      ja: "ナナカマド (ルイス): 保護とビジョンの木。予知能力と負のエネルギーを追い払う力を持っています。",
      ko: "마가목 (루이스): 보호와 비전의 나무. 예지력의 선물과 부정적인 에너지를 막아내는 힘을 가지고 있습니다.",
      zh: "花楸 (Luis): 保护与愿景之树。你有预见的天赋和抵御负能量的力量。",
    },
    ogham: "ᚂ",
    symbolism: {
      en: "Protection, divination, psychic vision, warding magic.",
      es: "Protección, adivinación, visión psíquica, magia defensiva.",
      fr: "Protection, divination, vision psychique, magie de protection.",
      ja: "保護、占い、霊的なビジョン、守護魔法。",
      ko: "보호, 점술, 영적 비전, 수호 마법.",
      zh: "保护、占卜、通灵视觉、防御魔法。",
    },
  },
  vine: {
    narrative: {
      en: "Vine (Muin): The tree of prophecy and harvest. You understand the balance of joy and responsibility, celebration and consequence.",
      es: "Vid (Muin): El árbol de la profecía y la cosecha. Entiendes el equilibrio de la alegría.",
      fr: "Vigne (Muin): L'arbre de la prophétie et de la récolte. Vous comprenez l'équilibre de la joie.",
      ja: "ブドウ (ム인): 予言과 収穫의 木. 喜び와 責任, 祝祭와 結果의 バランス를 理解しています。",
      ko: "포도나무 (무인): 예언과 수확의 나무. 기쁨과 책임, 축하와 결과의 균형을 이해합니다.",
      zh: "葡萄藤 (Muin): 预言与收获之树。你理解快乐与责任、庆祝与后果的平衡。",
    },
    ogham: "ᚋ",
    symbolism: {
      en: "Prophecy, prosperity, introspection, harvest.",
      es: "Profecía, prosperidad, introspección, cosecha.",
      fr: "Prophétie, prospérité, introspection, récolte.",
      ja: "予言, 繁栄, 内省, 収穫.",
      ko: "예언, 번영, 내성, 수확.",
      zh: "预言、繁荣、内省、收获。",
    },
  },
  willow: {
    narrative: {
      en: "Willow (Saille): The tree of intuition and the moon. You are deeply connected to the emotional realm and the cycles of water.",
      es: "Sauce (Saille): El árbol de la intuición y la luna. Estás conectado al reino emocional.",
      fr: "Saule (Saille): L'arbre de l'intuition et de la lune. Vous êtes connecté au royaume émotionnel.",
      ja: "ヤナギ (サイリー): 直感と月の木。感情の領域と水の循環に深くつながっています。",
      ko: "버드나무 (세일리): 직관과 달의 나무. 감정의 영역과 물의 순환에 깊이 연결되어 있습니다.",
      zh: "柳树 (Saille): 直觉与月亮之树。你与情感领域和水的循环紧密相连。",
    },
    ogham: "ᚄ",
    symbolism: {
      en: "Intuition, dreams, the subconscious, lunar cycles, flexibility.",
      es: "Intuición, sueños, el subconsciente, ciclos lunares.",
      fr: "Intuition, rêves, le subconscient, cycles lunaires.",
      ja: "直感、夢、潜在意識、月のサイクル、柔軟性。",
      ko: "직관, 꿈, 잠재의식, 달의 순환, 유연성.",
      zh: "直觉、梦境、潜意识、月亮周期、灵活性。",
    },
  },
};

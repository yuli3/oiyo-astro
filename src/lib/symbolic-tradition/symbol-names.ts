/**
 * 상징 이름 — 주역 64괘, 마야 20인장·13음조, 켈트 14수목.
 *
 * 예전 프로젝트의 i18n 묶음에도 이 이름들이 있지만 기계 번역이 섞여 있다
 * (켈트 Ash 가 "금연 건강 증진 협회", 음조 '섬기다'가 "노예"). 그래서 쓰지
 * 않고 여기서 다시 정한다. 괘 이름은 각 언어의 관용(한국어 음독 괘명, 일본어
 * 卦名, 중국어 简体, 서양어는 빌헬름 계열 번역)을 따른다.
 */

export type SymbolLang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

// ─── 주역 64괘 ──────────────────────────────────────────────────────────────

/** 번호 순. [한자 약칭, ko, en, ja, zh, fr, es, ko 한 줄 뜻] */
const HEX: ReadonlyArray<readonly [string, string, string, string, string, string, string, string]> = [
  ["乾", "중천건", "The Creative", "乾為天", "乾为天", "Le Créateur", "Lo Creativo", "하늘처럼 쉬지 않고 밀고 나가는 힘"],
  ["坤", "중지곤", "The Receptive", "坤為地", "坤为地", "Le Réceptif", "Lo Receptivo", "땅처럼 받아 안고 길러 내는 힘"],
  ["屯", "수뢰둔", "Difficulty at the Beginning", "水雷屯", "水雷屯", "La Difficulté initiale", "La Dificultad Inicial", "싹이 흙을 뚫는 첫 어려움"],
  ["蒙", "산수몽", "Youthful Folly", "山水蒙", "山水蒙", "La Folie juvénile", "La Necedad Juvenil", "아직 어려서 배우며 깨어나는 때"],
  ["需", "수천수", "Waiting", "水天需", "水天需", "L’Attente", "La Espera", "비를 기다리듯 때를 기다림"],
  ["訟", "천수송", "Conflict", "天水訟", "天水讼", "Le Conflit", "El Conflicto", "뜻이 엇갈려 다투는 자리"],
  ["師", "지수사", "The Army", "地水師", "地水师", "L’Armée", "El Ejército", "여럿을 모아 이끄는 힘"],
  ["比", "수지비", "Holding Together", "水地比", "水地比", "La Solidarité", "La Solidaridad", "가까이 모여 서로 기댐"],
  ["小畜", "풍천소축", "Small Taming", "風天小畜", "风天小畜", "Le Petit Apprivoiseur", "La Fuerza Domesticadora de lo Pequeño", "작게 모으고 조금씩 다스림"],
  ["履", "천택리", "Treading", "天沢履", "天泽履", "La Marche", "El Porte", "호랑이 꼬리를 밟듯 조심스러운 걸음"],
  ["泰", "지천태", "Peace", "地天泰", "地天泰", "La Paix", "La Paz", "하늘과 땅이 통해 두루 편안함"],
  ["否", "천지비", "Standstill", "天地否", "天地否", "La Stagnation", "El Estancamiento", "위아래가 막혀 멈춘 때"],
  ["同人", "천화동인", "Fellowship", "天火同人", "天火同人", "La Communauté avec les hommes", "Comunidad con los Hombres", "뜻을 같이하는 사람들"],
  ["大有", "화천대유", "Great Possession", "火天大有", "火天大有", "Le Grand Avoir", "La Posesión de lo Grande", "크게 가지고 널리 비춤"],
  ["謙", "지산겸", "Modesty", "地山謙", "地山谦", "L’Humilité", "La Modestia", "높아도 스스로 낮춤"],
  ["豫", "뇌지예", "Enthusiasm", "雷地豫", "雷地豫", "L’Enthousiasme", "El Entusiasmo", "미리 준비해 즐겁게 움직임"],
  ["隨", "택뢰수", "Following", "沢雷随", "泽雷随", "La Suite", "El Seguimiento", "때를 따라 함께 움직임"],
  ["蠱", "산풍고", "Work on the Decayed", "山風蠱", "山风蛊", "Le Travail sur ce qui est gâté", "El Trabajo en lo Echado a Perder", "묵은 것을 바로잡는 일"],
  ["臨", "지택림", "Approach", "地沢臨", "地泽临", "L’Approche", "El Acercamiento", "가까이 다가가 돌봄"],
  ["觀", "풍지관", "Contemplation", "風地観", "风地观", "La Contemplation", "La Contemplación", "한발 물러서 깊이 바라봄"],
  ["噬嗑", "화뢰서합", "Biting Through", "火雷噬嗑", "火雷噬嗑", "Mordre au travers", "La Mordedura Tajante", "가로막은 것을 깨물어 뚫음"],
  ["賁", "산화비", "Grace", "山火賁", "山火贲", "La Grâce", "La Gracia", "겉을 아름답게 꾸밈"],
  ["剝", "산지박", "Splitting Apart", "山地剥", "山地剥", "L’Éclatement", "La Desintegración", "껍질이 벗겨지듯 무너지는 때"],
  ["復", "지뢰복", "Return", "地雷復", "地雷复", "Le Retour", "El Retorno", "다시 돌아와 새로 시작함"],
  ["无妄", "천뢰무망", "Innocence", "天雷无妄", "天雷无妄", "L’Innocence", "La Inocencia", "꾸밈없이 거짓 없는 마음"],
  ["大畜", "산천대축", "Great Taming", "山天大畜", "山天大畜", "Le Grand Apprivoiseur", "La Fuerza Domesticadora de lo Grande", "크게 쌓아 두고 기름"],
  ["頤", "산뢰이", "Nourishment", "山雷頤", "山雷颐", "Les Commissures des lèvres", "Las Comisuras de la Boca", "기르고 먹이는 일"],
  ["大過", "택풍대과", "Great Exceeding", "沢風大過", "泽风大过", "La Prépondérance du grand", "La Preponderancia de lo Grande", "짐이 기둥을 넘어설 만큼 큼"],
  ["坎", "중수감", "The Abysmal", "坎為水", "坎为水", "L’Insondable", "Lo Abismal", "물이 거듭 흐르는 험한 길"],
  ["離", "중화리", "The Clinging", "離為火", "离为火", "Ce qui s’attache", "Lo Adherente", "불처럼 붙어서 밝힘"],
  ["咸", "택산함", "Influence", "沢山咸", "泽山咸", "L’Influence", "El Influjo", "서로 느끼고 감응함"],
  ["恆", "뇌풍항", "Duration", "雷風恒", "雷风恒", "La Durée", "La Duración", "오래도록 변함없음"],
  ["遯", "천산둔", "Retreat", "天山遯", "天山遁", "La Retraite", "La Retirada", "물러설 때를 앎"],
  ["大壯", "뇌천대장", "Great Power", "雷天大壮", "雷天大壮", "La Puissance du grand", "El Poder de lo Grande", "크게 굳세어지는 힘"],
  ["晉", "화지진", "Progress", "火地晋", "火地晋", "Le Progrès", "El Progreso", "해가 떠오르듯 나아감"],
  ["明夷", "지화명이", "Darkening of the Light", "地火明夷", "地火明夷", "L’Obscurcissement de la lumière", "El Oscurecimiento de la Luz", "빛을 감추고 견디는 때"],
  ["家人", "풍화가인", "The Family", "風火家人", "风火家人", "La Famille", "El Clan", "집안의 자리와 도리"],
  ["睽", "화택규", "Opposition", "火沢睽", "火泽睽", "L’Opposition", "El Antagonismo", "서로 등을 돌린 채 다름"],
  ["蹇", "수산건", "Obstruction", "水山蹇", "水山蹇", "L’Obstacle", "El Impedimento", "앞이 막혀 발을 절음"],
  ["解", "뇌수해", "Deliverance", "雷水解", "雷水解", "La Libération", "La Liberación", "얽힌 것이 풀림"],
  ["損", "산택손", "Decrease", "山沢損", "山泽损", "La Diminution", "La Merma", "덜어 내어 더함"],
  ["益", "풍뢰익", "Increase", "風雷益", "风雷益", "L’Augmentation", "El Aumento", "보태어 넉넉해짐"],
  ["夬", "택천쾌", "Breakthrough", "沢天夬", "泽天夬", "La Percée", "El Desbordamiento", "과감하게 결단함"],
  ["姤", "천풍구", "Coming to Meet", "天風姤", "天风姤", "Venir à la rencontre", "El Ir al Encuentro", "뜻밖에 마주침"],
  ["萃", "택지췌", "Gathering Together", "沢地萃", "泽地萃", "Le Rassemblement", "La Reunión", "사람과 힘이 모여듦"],
  ["升", "지풍승", "Pushing Upward", "地風升", "地风升", "La Poussée vers le haut", "La Subida", "나무가 자라듯 올라감"],
  ["困", "택수곤", "Oppression", "沢水困", "泽水困", "L’Accablement", "La Desazón", "물이 말라 곤궁한 때"],
  ["井", "수풍정", "The Well", "水風井", "水风井", "Le Puits", "El Pozo", "마르지 않는 우물"],
  ["革", "택화혁", "Revolution", "沢火革", "泽火革", "La Révolution", "La Revolución", "낡은 것을 바꾸어 새롭게 함"],
  ["鼎", "화풍정", "The Cauldron", "火風鼎", "火风鼎", "Le Chaudron", "El Caldero", "솥처럼 새것을 익혀 냄"],
  ["震", "중뢰진", "The Arousing", "震為雷", "震为雷", "L’Éveilleur", "Lo Suscitativo", "우레처럼 흔들어 깨움"],
  ["艮", "중산간", "Keeping Still", "艮為山", "艮为山", "L’Immobilisation", "El Aquietamiento", "산처럼 멈추어 섬"],
  ["漸", "풍산점", "Development", "風山漸", "风山渐", "Le Développement progressif", "La Evolución", "차근차근 나아감"],
  ["歸妹", "뇌택귀매", "The Marrying Maiden", "雷沢帰妹", "雷泽归妹", "L’Épousée", "La Muchacha que se Casa", "자리를 옮겨 새 식구가 됨"],
  ["豐", "뇌화풍", "Abundance", "雷火豊", "雷火丰", "L’Abondance", "La Plenitud", "가장 넉넉하고 성한 때"],
  ["旅", "화산려", "The Wanderer", "火山旅", "火山旅", "Le Voyageur", "El Andariego", "머물지 않고 떠도는 길손"],
  ["巽", "중풍손", "The Gentle", "巽為風", "巽为风", "Le Doux", "Lo Suave", "바람처럼 부드럽게 스며듦"],
  ["兌", "중택태", "The Joyous", "兌為沢", "兑为泽", "Le Serein", "Lo Sereno", "못처럼 기쁘게 나눔"],
  ["渙", "풍수환", "Dispersion", "風水渙", "风水涣", "La Dissolution", "La Disolución", "얼음이 풀려 흩어짐"],
  ["節", "수택절", "Limitation", "水沢節", "水泽节", "La Limitation", "La Restricción", "알맞게 마디를 둠"],
  ["中孚", "풍택중부", "Inner Truth", "風沢中孚", "风泽中孚", "La Vérité intérieure", "La Verdad Interior", "속에서 우러난 믿음"],
  ["小過", "뇌산소과", "Small Exceeding", "雷山小過", "雷山小过", "La Prépondérance du petit", "La Preponderancia de lo Pequeño", "작은 일에서 조금 지나침"],
  ["既濟", "수화기제", "After Completion", "水火既済", "水火既济", "Après l’accomplissement", "Después de la Consumación", "이미 건너 이룬 뒤"],
  ["未濟", "화수미제", "Before Completion", "火水未済", "火水未济", "Avant l’accomplissement", "Antes de la Consumación", "아직 다 건너지 못한 때"],
];

const HEX_COL: Record<SymbolLang, number> = { ko: 1, en: 2, ja: 3, zh: 4, fr: 5, es: 6 };

export function hexagramName(number: number, lang: SymbolLang): string {
  return HEX[number - 1][HEX_COL[lang]];
}

export function hexagramHan(number: number): string {
  return HEX[number - 1][0];
}

/** 한국어 한 줄 뜻. 다른 언어는 괘 이름 자체가 뜻을 담는다(서양어) 또는 한자 괘명이 본디 말이다. */
export function hexagramMeaningKo(number: number): string {
  return HEX[number - 1][7];
}

export const HEXAGRAM_COUNT = HEX.length;

// ─── 마야 ───────────────────────────────────────────────────────────────────

/** 20인장, 1 = 붉은 용. 드림스펠 명칭 */
const SEALS: Record<SymbolLang, string[]> = {
  ko: ["붉은 용", "흰 바람", "푸른 밤", "노란 씨앗", "붉은 뱀", "흰 세계를 잇는 자", "푸른 손", "노란 별", "붉은 달", "흰 개", "푸른 원숭이", "노란 사람", "붉은 하늘을 걷는 자", "흰 마법사", "푸른 독수리", "노란 전사", "붉은 지구", "흰 거울", "푸른 폭풍", "노란 태양"],
  en: ["Red Dragon", "White Wind", "Blue Night", "Yellow Seed", "Red Serpent", "White Worldbridger", "Blue Hand", "Yellow Star", "Red Moon", "White Dog", "Blue Monkey", "Yellow Human", "Red Skywalker", "White Wizard", "Blue Eagle", "Yellow Warrior", "Red Earth", "White Mirror", "Blue Storm", "Yellow Sun"],
  ja: ["赤い竜", "白い風", "青い夜", "黄色い種", "赤い蛇", "白い世界の橋渡し", "青い手", "黄色い星", "赤い月", "白い犬", "青い猿", "黄色い人", "赤い空歩く人", "白い魔法使い", "青い鷲", "黄色い戦士", "赤い地球", "白い鏡", "青い嵐", "黄色い太陽"],
  zh: ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界桥", "蓝手", "黄星星", "红月", "白狗", "蓝猴", "黄人", "红天行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜", "蓝风暴", "黄太阳"],
  fr: ["Dragon rouge", "Vent blanc", "Nuit bleue", "Graine jaune", "Serpent rouge", "Passeur de mondes blanc", "Main bleue", "Étoile jaune", "Lune rouge", "Chien blanc", "Singe bleu", "Humain jaune", "Marcheur du ciel rouge", "Sorcier blanc", "Aigle bleu", "Guerrier jaune", "Terre rouge", "Miroir blanc", "Tempête bleue", "Soleil jaune"],
  es: ["Dragón rojo", "Viento blanco", "Noche azul", "Semilla amarilla", "Serpiente roja", "Enlazador de mundos blanco", "Mano azul", "Estrella amarilla", "Luna roja", "Perro blanco", "Mono azul", "Humano amarillo", "Caminante del cielo rojo", "Mago blanco", "Águila azul", "Guerrero amarillo", "Tierra roja", "Espejo blanco", "Tormenta azul", "Sol amarillo"],
};

/** 13음조, 1 = 자석 */
const TONES: Record<SymbolLang, string[]> = {
  ko: ["자석", "달", "전기", "자기 존재", "배음", "율동", "공명", "은하", "태양", "행성", "스펙트럼", "수정", "우주"],
  en: ["Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", "Rhythmic", "Resonant", "Galactic", "Solar", "Planetary", "Spectral", "Crystal", "Cosmic"],
  ja: ["磁気", "月", "電気", "自己存在", "倍音", "律動", "共振", "銀河", "太陽", "惑星", "スペクトル", "水晶", "宇宙"],
  zh: ["磁性", "月亮", "电力", "自我存在", "超频", "韵律", "共振", "银河", "太阳", "行星", "光谱", "水晶", "宇宙"],
  fr: ["Magnétique", "Lunaire", "Électrique", "Auto-existant", "Harmonique", "Rythmique", "Résonnant", "Galactique", "Solaire", "Planétaire", "Spectral", "Cristal", "Cosmique"],
  es: ["Magnético", "Lunar", "Eléctrico", "Autoexistente", "Entonado", "Rítmico", "Resonante", "Galáctico", "Solar", "Planetario", "Espectral", "Cristal", "Cósmico"],
};

export function mayanSealName(seal: number, lang: SymbolLang): string {
  return SEALS[lang][seal - 1] ?? String(seal);
}

export function mayanToneName(tone: number, lang: SymbolLang): string {
  return TONES[lang][tone - 1] ?? String(tone);
}

// ─── 켈트 ───────────────────────────────────────────────────────────────────

const TREES: Record<string, Record<SymbolLang, string>> = {
  birch: { ko: "자작나무", en: "Birch", ja: "樺", zh: "桦树", fr: "Bouleau", es: "Abedul" },
  rowan: { ko: "마가목", en: "Rowan", ja: "ナナカマド", zh: "花楸", fr: "Sorbier", es: "Serbal" },
  ash: { ko: "물푸레나무", en: "Ash", ja: "トネリコ", zh: "白蜡树", fr: "Frêne", es: "Fresno" },
  alder: { ko: "오리나무", en: "Alder", ja: "ハンノキ", zh: "桤木", fr: "Aulne", es: "Aliso" },
  willow: { ko: "버드나무", en: "Willow", ja: "柳", zh: "柳树", fr: "Saule", es: "Sauce" },
  hawthorn: { ko: "산사나무", en: "Hawthorn", ja: "サンザシ", zh: "山楂", fr: "Aubépine", es: "Espino" },
  oak: { ko: "참나무", en: "Oak", ja: "オーク", zh: "橡树", fr: "Chêne", es: "Roble" },
  holly: { ko: "호랑가시나무", en: "Holly", ja: "ヒイラギ", zh: "冬青", fr: "Houx", es: "Acebo" },
  hazel: { ko: "개암나무", en: "Hazel", ja: "ハシバミ", zh: "榛树", fr: "Noisetier", es: "Avellano" },
  vine: { ko: "포도나무", en: "Vine", ja: "ブドウ", zh: "葡萄藤", fr: "Vigne", es: "Vid" },
  ivy: { ko: "담쟁이", en: "Ivy", ja: "ツタ", zh: "常春藤", fr: "Lierre", es: "Hiedra" },
  reed: { ko: "갈대", en: "Reed", ja: "葦", zh: "芦苇", fr: "Roseau", es: "Junco" },
  elder: { ko: "딱총나무", en: "Elder", ja: "ニワトコ", zh: "接骨木", fr: "Sureau", es: "Saúco" },
  nameless: { ko: "이름 없는 날", en: "The nameless day", ja: "名もなき日", zh: "无名之日", fr: "Le jour sans nom", es: "El día sin nombre" },
};

export function celticTreeName(id: string, lang: SymbolLang): string {
  return TREES[id]?.[lang] ?? id;
}

// ─── 이집트 12신(현대 달력) ─────────────────────────────────────────────────

const DEITIES: Record<string, Record<SymbolLang, string>> = {
  nile: { ko: "나일", en: "The Nile", ja: "ナイル", zh: "尼罗河", fr: "Le Nil", es: "El Nilo" },
  "amun-ra": { ko: "아문라", en: "Amun-Ra", ja: "アメン・ラー", zh: "阿蒙-拉", fr: "Amon-Rê", es: "Amón-Ra" },
  mut: { ko: "무트", en: "Mut", ja: "ムト", zh: "穆特", fr: "Mout", es: "Mut" },
  geb: { ko: "게브", en: "Geb", ja: "ゲブ", zh: "盖布", fr: "Geb", es: "Geb" },
  osiris: { ko: "오시리스", en: "Osiris", ja: "オシリス", zh: "奥西里斯", fr: "Osiris", es: "Osiris" },
  isis: { ko: "이시스", en: "Isis", ja: "イシス", zh: "伊西斯", fr: "Isis", es: "Isis" },
  thoth: { ko: "토트", en: "Thoth", ja: "トート", zh: "托特", fr: "Thot", es: "Tot" },
  horus: { ko: "호루스", en: "Horus", ja: "ホルス", zh: "荷鲁斯", fr: "Horus", es: "Horus" },
  anubis: { ko: "아누비스", en: "Anubis", ja: "アヌビス", zh: "阿努比斯", fr: "Anubis", es: "Anubis" },
  seth: { ko: "세트", en: "Seth", ja: "セト", zh: "赛特", fr: "Seth", es: "Set" },
  bastet: { ko: "바스테트", en: "Bastet", ja: "バステト", zh: "巴斯特", fr: "Bastet", es: "Bastet" },
  sekhmet: { ko: "세크메트", en: "Sekhmet", ja: "セクメト", zh: "塞赫麦特", fr: "Sekhmet", es: "Sejmet" },
};

export function egyptianDeityName(id: string, lang: SymbolLang): string {
  return DEITIES[id]?.[lang] ?? id;
}

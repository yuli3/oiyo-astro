/**
 * 아티클 topic 사전 — 6개 언어.
 *
 * 2026-09-21: 아티클 697편(ko)이 전부 `topic` 을 갖고 있는데 그것을 보여주는
 * 표면이 없어 65%가 고아였다. tags 는 1,492종에 ko/en·대소문자가 섞여 있어
 * 쓰지 않는다. topic 은 48종으로 닫혀 있고 글마다 하나뿐이라 색인의 축이 된다.
 *
 * 새 topic 이 들어오면 여기에 추가한다. 없으면 slug 를 그대로 보여주므로
 * 페이지가 깨지지는 않지만, 한국어 화면에 영문 slug 가 노출된다.
 */
export type TopicKey = string;

type TopicNames = Record<string, string>;

export const TOPIC_NAMES: Record<TopicKey, TopicNames> = {
  addiction: { ko: "중독", en: "Addiction", ja: "依存", zh: "成瘾", fr: "Addiction", es: "Adicción" },
  adler: { ko: "아들러 심리학", en: "Adlerian Psychology", ja: "アドラー心理学", zh: "阿德勒心理学", fr: "Psychologie adlérienne", es: "Psicología adleriana" },
  "art-therapy": { ko: "미술치료", en: "Art Therapy", ja: "芸術療法", zh: "艺术治疗", fr: "Art-thérapie", es: "Arteterapia" },
  astrology: { ko: "점성술", en: "Astrology", ja: "占星術", zh: "占星术", fr: "Astrologie", es: "Astrología" },
  attachment: { ko: "애착", en: "Attachment", ja: "愛着", zh: "依恋", fr: "Attachement", es: "Apego" },
  "behavioral-economics": { ko: "행동경제학", en: "Behavioral Economics", ja: "行動経済学", zh: "行为经济学", fr: "Économie comportementale", es: "Economía conductual" },
  "birth-symbols": { ko: "탄생 상징", en: "Birth Symbols", ja: "誕生の象徴", zh: "诞生象征", fr: "Symboles de naissance", es: "Símbolos de nacimiento" },
  "blood-type": { ko: "혈액형", en: "Blood Type", ja: "血液型", zh: "血型", fr: "Groupe sanguin", es: "Grupo sanguíneo" },
  burnout: { ko: "번아웃", en: "Burnout", ja: "燃え尽き", zh: "倦怠", fr: "Burn-out", es: "Burnout" },
  "celtic-myth": { ko: "켈트 신화", en: "Celtic Myth", ja: "ケルト神話", zh: "凯尔特神话", fr: "Mythologie celte", es: "Mitología celta" },
  "chinese-zodiac": { ko: "띠", en: "Chinese Zodiac", ja: "十二支", zh: "生肖", fr: "Zodiaque chinois", es: "Zodiaco chino" },
  chronotypes: { ko: "크로노타입", en: "Chronotypes", ja: "クロノタイプ", zh: "生物钟类型", fr: "Chronotypes", es: "Cronotipos" },
  "cognitive-bias": { ko: "인지 편향", en: "Cognitive Bias", ja: "認知バイアス", zh: "认知偏误", fr: "Biais cognitifs", es: "Sesgos cognitivos" },
  "color-personality": { ko: "색채 성격", en: "Color Personality", ja: "色彩性格", zh: "色彩性格", fr: "Personnalité des couleurs", es: "Personalidad del color" },
  "comparative-myth": { ko: "비교 신화", en: "Comparative Myth", ja: "比較神話", zh: "比较神话", fr: "Mythologie comparée", es: "Mitología comparada" },
  "dark-psychology": { ko: "어둠의 심리학", en: "Dark Psychology", ja: "ダーク心理学", zh: "黑暗心理学", fr: "Psychologie sombre", es: "Psicología oscura" },
  development: { ko: "발달 심리", en: "Development", ja: "発達心理", zh: "发展心理", fr: "Développement", es: "Desarrollo" },
  divination: { ko: "점술", en: "Divination", ja: "占い", zh: "占卜", fr: "Divination", es: "Adivinación" },
  dream: { ko: "꿈", en: "Dreams", ja: "夢", zh: "梦", fr: "Rêves", es: "Sueños" },
  "egyptian-myth": { ko: "이집트 신화", en: "Egyptian Myth", ja: "エジプト神話", zh: "埃及神话", fr: "Mythologie égyptienne", es: "Mitología egipcia" },
  emotion: { ko: "감정", en: "Emotion", ja: "感情", zh: "情绪", fr: "Émotions", es: "Emociones" },
  enneagram: { ko: "에니어그램", en: "Enneagram", ja: "エニアグラム", zh: "九型人格", fr: "Ennéagramme", es: "Eneagrama" },
  "esoteric-traditions": { ko: "비의 전통", en: "Esoteric Traditions", ja: "秘教の伝統", zh: "秘传传统", fr: "Traditions ésotériques", es: "Tradiciones esotéricas" },
  "feng-shui": { ko: "풍수", en: "Feng Shui", ja: "風水", zh: "风水", fr: "Feng shui", es: "Feng shui" },
  "folk-belief": { ko: "민간 신앙", en: "Folk Belief", ja: "民間信仰", zh: "民间信仰", fr: "Croyances populaires", es: "Creencias populares" },
  "fortune-reading": { ko: "운세 읽기", en: "Fortune Reading", ja: "運勢の読み方", zh: "运势解读", fr: "Lecture de la fortune", es: "Lectura de la fortuna" },
  "general-psychology": { ko: "일반 심리학", en: "General Psychology", ja: "一般心理学", zh: "普通心理学", fr: "Psychologie générale", es: "Psicología general" },
  "greek-myth": { ko: "그리스 신화", en: "Greek Myth", ja: "ギリシャ神話", zh: "希腊神话", fr: "Mythologie grecque", es: "Mitología griega" },
  jung: { ko: "융 심리학", en: "Jungian Psychology", ja: "ユング心理学", zh: "荣格心理学", fr: "Psychologie jungienne", es: "Psicología junguiana" },
  "korean-myth": { ko: "한국 신화", en: "Korean Myth", ja: "韓国神話", zh: "韩国神话", fr: "Mythologie coréenne", es: "Mitología coreana" },
  learning: { ko: "학습", en: "Learning", ja: "学習", zh: "学习", fr: "Apprentissage", es: "Aprendizaje" },
  mbti: { ko: "MBTI", en: "MBTI", ja: "MBTI", zh: "MBTI", fr: "MBTI", es: "MBTI" },
  motivation: { ko: "동기", en: "Motivation", ja: "動機づけ", zh: "动机", fr: "Motivation", es: "Motivación" },
  mysticism: { ko: "신비주의", en: "Mysticism", ja: "神秘主義", zh: "神秘主义", fr: "Mysticisme", es: "Misticismo" },
  needs: { ko: "욕구", en: "Needs", ja: "欲求", zh: "需求", fr: "Besoins", es: "Necesidades" },
  "norse-myth": { ko: "북유럽 신화", en: "Norse Myth", ja: "北欧神話", zh: "北欧神话", fr: "Mythologie nordique", es: "Mitología nórdica" },
  numerology: { ko: "수비학", en: "Numerology", ja: "数秘術", zh: "数字命理", fr: "Numérologie", es: "Numerología" },
  perfectionism: { ko: "완벽주의", en: "Perfectionism", ja: "完璧主義", zh: "完美主义", fr: "Perfectionnisme", es: "Perfeccionismo" },
  "personal-color": { ko: "퍼스널 컬러", en: "Personal Color", ja: "パーソナルカラー", zh: "个人色彩", fr: "Couleur personnelle", es: "Color personal" },
  physiognomy: { ko: "관상", en: "Physiognomy", ja: "人相", zh: "面相", fr: "Physiognomonie", es: "Fisiognomía" },
  "psychology-course": { ko: "심리학 강의", en: "Psychology Course", ja: "心理学講座", zh: "心理学课程", fr: "Cours de psychologie", es: "Curso de psicología" },
  relationship: { ko: "관계", en: "Relationships", ja: "人間関係", zh: "人际关系", fr: "Relations", es: "Relaciones" },
  saju: { ko: "사주", en: "Saju", ja: "四柱推命", zh: "四柱", fr: "Saju", es: "Saju" },
  self: { ko: "자기 이해", en: "Self", ja: "自己理解", zh: "自我认识", fr: "Connaissance de soi", es: "Autoconocimiento" },
  social: { ko: "사회 심리", en: "Social Psychology", ja: "社会心理", zh: "社会心理", fr: "Psychologie sociale", es: "Psicología social" },
  tarot: { ko: "타로", en: "Tarot", ja: "タロット", zh: "塔罗", fr: "Tarot", es: "Tarot" },
  therapy: { ko: "심리치료", en: "Therapy", ja: "心理療法", zh: "心理治疗", fr: "Thérapie", es: "Terapia" },
  work: { ko: "일", en: "Work", ja: "仕事", zh: "工作", fr: "Travail", es: "Trabajo" },
};

/** 사전에 없으면 slug 를 그대로 — 페이지는 깨지지 않되 누락이 눈에 띈다. */
export function topicName(topic: string, locale: string): string {
  return TOPIC_NAMES[topic]?.[locale] ?? TOPIC_NAMES[topic]?.en ?? topic;
}

/** topic 페이지를 만들 최소 글 수. 1편짜리는 색인에서 그 글로 직접 보낸다. */
export const MIN_TOPIC_ARTICLES = 2;

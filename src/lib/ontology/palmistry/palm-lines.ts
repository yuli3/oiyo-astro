export type PalmLocale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
export type PalmLineId = 'life' | 'heart' | 'head' | 'fate';

export interface PalmLine {
  id: PalmLineId;
  color: string;
  /** SVG overlay path for the line on the 300×375 right-palm guide image. */
  path: string;
  name: Record<PalmLocale, string>;
  /** One-line meaning. */
  meaning: Record<PalmLocale, string>;
  /** Short variation notes. */
  variations: Record<PalmLocale, string[]>;
}

export const PALM_LINES: PalmLine[] = [
  {
    id: 'heart',
    color: '#e11d48',
    path: 'M 90 171 C 128 157, 174 164, 224 190',
    name: { ko: '감정선', en: 'Heart Line', ja: '感情線', zh: '感情线', fr: 'Ligne de cœur', es: 'Línea del corazón' },
    meaning: {
      ko: '사랑·감정·인간관계의 방식을 상징합니다.',
      en: 'Reflects how you love, feel, and relate to others.',
      ja: '愛・感情・人間関係のあり方を象徴します。',
      zh: '象征你的爱情、情感与人际关系方式。',
      fr: 'Reflète votre manière d’aimer, de ressentir et de vous lier.',
      es: 'Refleja cómo amas, sientes y te relacionas.',
    },
    variations: {
      ko: ['검지까지 길게 뻗음 — 이상적인 사랑', '위로 굽음 — 감정 표현이 풍부', '곧고 짧음 — 신중하고 절제된 애정'],
      en: ['Long, reaching the index — idealistic love', 'Curving upward — expressive feelings', 'Straight and short — reserved affection'],
      ja: ['人差し指まで長い — 理想的な愛', '上に曲がる — 感情表現が豊か', 'まっすぐで短い — 控えめな愛情'],
      zh: ['延伸至食指 — 理想型的爱', '向上弯曲 — 情感表达丰富', '笔直而短 — 含蓄克制的感情'],
      fr: ['Longue jusqu’à l’index — amour idéaliste', 'Courbée vers le haut — émotions expressives', 'Droite et courte — affection réservée'],
      es: ['Larga hasta el índice — amor idealista', 'Curvada hacia arriba — emociones expresivas', 'Recta y corta — afecto reservado'],
    },
  },
  {
    id: 'head',
    color: '#2563eb',
    path: 'M 88 187 C 126 185, 171 201, 219 220',
    name: { ko: '두뇌선', en: 'Head Line', ja: '頭脳線', zh: '智慧线', fr: 'Ligne de tête', es: 'Línea de la cabeza' },
    meaning: {
      ko: '사고방식·지성·집중의 성향을 나타냅니다.',
      en: 'Shows your thinking style, intellect, and focus.',
      ja: '思考の仕方・知性・集中の傾向を示します。',
      zh: '显示你的思维方式、智力与专注倾向。',
      fr: 'Indique votre style de pensée, votre intellect et votre concentration.',
      es: 'Muestra tu estilo de pensamiento, intelecto y concentración.',
    },
    variations: {
      ko: ['길고 깊음 — 분석적·깊이 사고', '짧고 곧음 — 실용적·결단력', '생명선과 떨어져 시작 — 독립심·모험심'],
      en: ['Long and deep — analytical, deep thinker', 'Short and straight — practical, decisive', 'Starts apart from life line — independent, adventurous'],
      ja: ['長く深い — 分析的で深く考える', '短くまっすぐ — 実用的で決断力がある', '生命線と離れて始まる — 独立心・冒険心'],
      zh: ['长而深 — 分析型、思考深入', '短而直 — 务实、果断', '与生命线分离起始 — 独立、冒险'],
      fr: ['Longue et profonde — analytique, réfléchi', 'Courte et droite — pratique, décisif', 'Séparée de la ligne de vie — indépendant, aventureux'],
      es: ['Larga y profunda — analítico, reflexivo', 'Corta y recta — práctico, decidido', 'Separada de la línea de vida — independiente, aventurero'],
    },
  },
  {
    id: 'life',
    color: '#16a34a',
    path: 'M 89 171 C 70 203, 79 264, 130 306',
    name: { ko: '생명선', en: 'Life Line', ja: '生命線', zh: '生命线', fr: 'Ligne de vie', es: 'Línea de la vida' },
    meaning: {
      ko: '수명이 아니라 생명력·활력·삶의 질을 상징합니다.',
      en: 'Symbolizes vitality and quality of life — not lifespan.',
      ja: '寿命ではなく、生命力・活力・人生の質を象徴します。',
      zh: '象征的是生命力、活力与生活质量，而非寿命。',
      fr: 'Symbolise la vitalité et la qualité de vie, non la longévité.',
      es: 'Simboliza la vitalidad y la calidad de vida, no la longevidad.',
    },
    variations: {
      ko: ['깊고 뚜렷함 — 강한 활력', '넓게 휘어짐 — 안정적인 에너지', '이중선 — 회복력·보호력'],
      en: ['Deep and clear — strong vitality', 'Wide curve — steady energy', 'Double line — resilience and protection'],
      ja: ['深くはっきり — 強い活力', '大きく弧を描く — 安定したエネルギー', '二重線 — 回復力・保護力'],
      zh: ['深而清晰 — 活力旺盛', '弧度宽大 — 能量稳定', '双重线 — 恢复力与保护力'],
      fr: ['Profonde et nette — forte vitalité', 'Large courbe — énergie stable', 'Ligne double — résilience et protection'],
      es: ['Profunda y clara — gran vitalidad', 'Curva amplia — energía estable', 'Línea doble — resiliencia y protección'],
    },
  },
  {
    id: 'fate',
    color: '#A1A578',
    path: 'M 154 293 C 155 252, 154 211, 150 177',
    name: { ko: '운명선', en: 'Fate Line', ja: '運命線', zh: '命运线', fr: 'Ligne de destin', es: 'Línea del destino' },
    meaning: {
      ko: '일·진로·삶의 방향을 상징합니다. 없어도 나쁜 게 아니라 자유로운 삶을 뜻합니다.',
      en: 'Represents career and life direction. Its absence means a free, self-chosen life — not bad luck.',
      ja: '仕事・進路・人生の方向を象徴します。無くても悪い意味ではなく、自由な人生を表します。',
      zh: '象征事业与人生方向。没有它并非坏事，而代表自由、自主选择的人生。',
      fr: 'Représente la carrière et la direction de vie. Son absence signifie une vie libre et choisie.',
      es: 'Representa la carrera y el rumbo de vida. Su ausencia indica una vida libre y elegida.',
    },
    variations: {
      ko: ['손목에서 곧게 시작 — 이른 시기의 분명한 방향', '생명선에서 시작 — 가족·전통이 중요한 삶', '희미하거나 없음 — 스스로 길을 만드는 삶'],
      en: ['Rises straight from the wrist — early clear direction', 'Starts from the life line — family/tradition matters', 'Faint or absent — a self-directed life'],
      ja: ['手首からまっすぐ始まる — 早い時期の明確な方向', '生命線から始まる — 家族・伝統が大切な人生', '薄い・無い — 自分で道を作る人生'],
      zh: ['从手腕笔直起始 — 早年方向明确', '从生命线起始 — 重视家庭与传统', '浅淡或缺失 — 自主开创的人生'],
      fr: ['Part droit du poignet — direction précoce et claire', 'Part de la ligne de vie — famille/tradition importantes', 'Faible ou absente — une vie autodéterminée'],
      es: ['Sube recta desde la muñeca — rumbo temprano claro', 'Parte de la línea de vida — familia/tradición importan', 'Tenue o ausente — una vida autodirigida'],
    },
  },
];

// Right-palm-facing-viewer silhouette for a 300×360 viewBox — thumb on the
// left (as it appears when you hold up your own right palm), four fingers
// with natural length variation (middle longest, pinky shortest) and rounded
// webbing between them. Redrawn 2026-07-30 (previous shape read as "not like
// a real hand" — this one was checked visually at each control point before
// landing here; see [[palm-anatomy-svg-redesign-2026-07-30]]).
export const PALM_OUTLINE = [
  'M 108 345',
  // wrist → thumb-side heel of palm
  'C 90 340, 80 320, 80 298',
  'C 78 280, 82 262, 90 250',
  // thumb: outer edge up to a rounded tip, then back down the inner edge
  'C 76 246, 55 232, 44 214',
  'C 38 204, 37 196, 44 190',
  'C 52 184, 62 192, 72 206',
  'C 82 218, 92 228, 100 218',
  // index finger
  'C 100 195, 96 168, 88 148',
  'C 82 132, 84 112, 92 108',
  'C 100 105, 106 122, 108 148',
  'C 110 168, 112 190, 114 212',
  'L 120 210',
  // middle finger (longest)
  'C 118 175, 116 130, 118 90',
  'C 119 68, 122 58, 128 58',
  'C 134 58, 138 70, 138 92',
  'C 138 128, 138 172, 140 208',
  'L 146 206',
  // ring finger
  'C 145 182, 146 148, 150 118',
  'C 152 100, 156 88, 162 90',
  'C 168 92, 170 108, 168 130',
  'C 165 158, 162 182, 162 204',
  'L 168 200',
  // pinky (shortest)
  'C 170 178, 176 152, 184 138',
  'C 190 128, 198 128, 202 138',
  'C 206 150, 200 172, 190 190',
  'C 182 204, 174 214, 172 222',
  'L 190 232',
  // pinky-side heel of palm → wrist — one smooth outward curve, not two, so
  // it doesn't read as a stray 6th digit next to the pinky (2026-07-30 fix).
  'C 203 225, 219 220, 226 226',
  'C 233 232, 220 246, 194 252',
  'C 202 264, 208 280, 206 300',
  'C 204 320, 190 340, 170 346',
  'C 150 350, 126 350, 108 345',
  'Z',
].join(' ');

// 꿈 상징 사전 SSOT.
//
// 왜 여기에는 가벼운 것만 두는가: 상징별 본문(전통 해석·상황별 읽기·심리학적
// 관점·출처)은 explainers 컬렉션의 마크다운에 있다. 이 파일은 **색인과 도구가
// 쓰는 뼈대**만 담는다 — 이름, 분류, 검색 키워드, 이웃 상징. 본문까지 여기
// 넣으면 6로케일 × 상징 수만큼 문자열이 불어나 사전이 커질수록 손대기 어려워진다.
//
// 태도: 해몽은 문화적 상징 해석이지 예측이 아니다. 데이터에도 단정하는 말을
// 넣지 않는다. 각 상징 본문은 전통 해석과 심리학 연구를 **구분해서** 보여 준다.
import type { Locale } from '../i18n';

export type DreamCategory = 'body' | 'nature' | 'motion' | 'creature';

export interface DreamSymbol {
  /** 라우트 세그먼트. /{locale}/dream/{id} */
  id: string;
  emoji: string;
  category: DreamCategory;
  name: Record<Locale, string>;
  /** 검색·색인용 짧은 키워드. 본문의 주제어와 맞춘다. */
  keywords: Record<Locale, string[]>;
  /** 함께 보면 좋은 상징 id. 상호 참조는 양방향으로 맞춘다. */
  related: string[];
}

export const DREAM_CATEGORY_LABELS: Record<DreamCategory, Record<Locale, string>> = {
  body: { ko: '몸', en: 'Body', ja: '身体', zh: '身体', fr: 'Corps', es: 'Cuerpo' },
  nature: { ko: '자연', en: 'Nature', ja: '自然', zh: '自然', fr: 'Nature', es: 'Naturaleza' },
  motion: { ko: '움직임', en: 'Motion', ja: '動き', zh: '动作', fr: 'Mouvement', es: 'Movimiento' },
  creature: { ko: '생물', en: 'Creatures', ja: '生き物', zh: '生物', fr: 'Créatures', es: 'Criaturas' },
};

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    id: 'water',
    emoji: '💧',
    category: 'nature',
    name: { ko: '물', en: 'Water', ja: '水', zh: '水', fr: "L'eau", es: 'El agua' },
    keywords: {
      ko: ['감정', '정화', '흐름', '홍수', '맑은 물'],
      en: ['emotion', 'cleansing', 'flow', 'flood', 'clear water'],
      ja: ['感情', '浄化', '流れ', '洪水', '清水'],
      zh: ['情绪', '净化', '流动', '洪水', '清水'],
      fr: ['émotion', 'purification', 'flux', 'inondation', 'eau claire'],
      es: ['emoción', 'purificación', 'flujo', 'inundación', 'agua clara'],
    },
    related: ['falling', 'snake'],
  },
  {
    id: 'falling',
    emoji: '🕳️',
    category: 'motion',
    name: { ko: '추락', en: 'Falling', ja: '落下', zh: '坠落', fr: 'La chute', es: 'La caída' },
    keywords: {
      ko: ['통제 상실', '불안', '놓침', '높은 곳', '깨어남'],
      en: ['loss of control', 'anxiety', 'letting go', 'heights', 'waking'],
      ja: ['制御の喪失', '不安', '手放し', '高所', '目覚め'],
      zh: ['失控', '焦虑', '放手', '高处', '惊醒'],
      fr: ['perte de contrôle', 'anxiété', 'lâcher prise', 'hauteur', 'réveil'],
      es: ['pérdida de control', 'ansiedad', 'soltar', 'altura', 'despertar'],
    },
    related: ['water', 'teeth'],
  },
  {
    id: 'teeth',
    emoji: '🦷',
    category: 'body',
    name: {
      ko: '이빨 빠짐', en: 'Teeth falling out', ja: '歯が抜ける',
      zh: '牙齿脱落', fr: 'Perdre ses dents', es: 'Perder los dientes',
    },
    keywords: {
      ko: ['상실', '노화', '말', '자신감', '가족'],
      en: ['loss', 'aging', 'speech', 'confidence', 'family'],
      ja: ['喪失', '老い', '発話', '自信', '家族'],
      zh: ['丧失', '衰老', '言语', '自信', '家人'],
      fr: ['perte', 'vieillissement', 'parole', 'confiance', 'famille'],
      es: ['pérdida', 'envejecimiento', 'habla', 'confianza', 'familia'],
    },
    related: ['falling', 'snake'],
  },
  {
    id: 'snake',
    emoji: '🐍',
    category: 'creature',
    name: { ko: '뱀', en: 'Snake', ja: '蛇', zh: '蛇', fr: 'Le serpent', es: 'La serpiente' },
    keywords: {
      ko: ['재물', '태몽', '변화', '허물벗기', '두려움'],
      en: ['fortune', 'conception dream', 'change', 'shedding', 'fear'],
      ja: ['財', '胎夢', '変化', '脱皮', '恐れ'],
      zh: ['财运', '胎梦', '变化', '蜕皮', '恐惧'],
      fr: ['fortune', 'rêve de conception', 'changement', 'mue', 'peur'],
      es: ['fortuna', 'sueño de concepción', 'cambio', 'muda', 'miedo'],
    },
    related: ['water', 'teeth'],
  },
];

export const DREAM_SYMBOL_BY_ID: Record<string, DreamSymbol> = Object.fromEntries(
  DREAM_SYMBOLS.map((s) => [s.id, s]),
);

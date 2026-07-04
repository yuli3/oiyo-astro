// 주기형 운세 엔진 — AI 없이, 방대한 코퍼스 + 결정론적 시드로 생성.
// period(오늘/이번주/이번달) × system(오행·12지신·별자리) × 사용자 기준(생년/사인)을
// 해싱해 코퍼스에서 안정적으로 선택. 같은 주에는 같은 결과(재방문 신선도), 주가 바뀌면 갱신.
export type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
export type Period = 'today' | 'weekly' | 'monthly';

// ── 결정론적 시드 ──
export function periodKey(p: Period, d = new Date()): string {
  const y = d.getUTCFullYear();
  if (p === 'monthly') return `${y}-M${d.getUTCMonth() + 1}`;
  if (p === 'weekly') {
    // ISO 주차
    const dt = new Date(Date.UTC(y, d.getUTCMonth(), d.getUTCDate()));
    const day = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - day);
    const yStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    const wk = Math.ceil(((dt.getTime() - yStart.getTime()) / 86400000 + 1) / 7);
    return `${dt.getUTCFullYear()}-W${wk}`;
  }
  return `${y}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ── 12지신 / 별자리 산출 ──
const ZODIAC_ANIMAL = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'] as const;
export function animalOf(year: number): number { return ((year - 4) % 12 + 12) % 12; }

const STAR_SIGN = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;
export function signOf(month: number, day: number): number {
  const cut = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]; // 각 월의 전환일
  // 전환일 이후면 그 달에 시작하는 별자리(Aries=0), 이전이면 직전 별자리.
  return day < cut[month - 1] ? (month + 8) % 12 : (month + 9) % 12;
}

export const FIVE_ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
export function elementOf(year: number): number {
  // 천간 기준 오행(간이): 연도 끝자리 → 목목화화토토금금수수
  const map = [4, 4, 0, 0, 1, 1, 2, 2, 3, 3];
  return map[((year % 10) + 10) % 10];
}

// ── 코퍼스 (측면별 문장 풀 — 시드로 선택) ──
// 각 배열은 6로케일. 방대한 조합을 위해 축(과제·기회·주의·조언)을 나눠 조합한다.
type L = Record<Locale, string>;

const OPENING: Record<string, L[]> = {
  wood: [
    { ko: '새싹처럼 뻗어나가는 기운이 감돕니다.', en: 'An expanding, sprouting energy surrounds you.', ja: '芽吹くように伸びる気が漂います。', zh: '如新芽般舒展的气息环绕着你。', fr: 'Une énergie de croissance vous entoure.', es: 'Una energía de crecimiento te rodea.' },
    { ko: '유연하게 방향을 트는 것이 유리합니다.', en: 'Bending flexibly toward a new direction favors you.', ja: 'しなやかに方向を変えるのが吉。', zh: '灵活转向对你有利。', fr: 'Changer de direction avec souplesse vous est favorable.', es: 'Cambiar de rumbo con flexibilidad te favorece.' },
  ],
  fire: [
    { ko: '열정이 분명한 성과로 이어질 시기입니다.', en: 'Passion is poised to turn into visible results.', ja: '情熱が成果に変わる時期です。', zh: '热情正要化为可见的成果。', fr: 'La passion se transforme en résultats visibles.', es: 'La pasión se vuelve resultados visibles.' },
    { ko: '드러내되 다 태우지 않는 균형이 중요합니다.', en: 'Shine, but keep the balance not to burn out.', ja: '輝きつつ燃え尽きない均衡が大切。', zh: '发光但别耗尽，平衡最重要。', fr: 'Brillez sans vous consumer.', es: 'Brilla sin quemarte.' },
  ],
  earth: [
    { ko: '단단히 다지는 안정의 흐름입니다.', en: 'A steady, grounding flow of stability.', ja: '地に足のついた安定の流れ。', zh: '踏实稳固的稳定气流。', fr: 'Un flux stable qui vous ancre.', es: 'Un flujo estable que te ancla.' },
    { ko: '약속과 신뢰가 자산이 됩니다.', en: 'Promises kept become real assets.', ja: '約束と信頼が資産になります。', zh: '守信将成为你的资产。', fr: 'Les promesses tenues deviennent des atouts.', es: 'Las promesas cumplidas se vuelven activos.' },
  ],
  metal: [
    { ko: '정리하고 벼려낼수록 날카로워집니다.', en: 'The more you refine and cut away, the sharper you become.', ja: '整え研ぐほど鋭くなります。', zh: '越是整理磨砺，越显锋利。', fr: 'Plus vous affinez, plus vous êtes tranchant.', es: 'Cuanto más pules, más afilado estás.' },
    { ko: '원칙을 지키는 선택이 결실을 부릅니다.', en: 'Choices that hold your principles bear fruit.', ja: '原則を守る選択が実を結びます。', zh: '坚守原则的选择会结果。', fr: 'Les choix fidèles à vos principes portent leurs fruits.', es: 'Las decisiones fieles a tus principios dan fruto.' },
  ],
  water: [
    { ko: '흐르듯 적응하는 지혜가 빛납니다.', en: 'The wisdom to adapt like water shines.', ja: '水のように適応する知恵が光ります。', zh: '如水般顺应的智慧闪光。', fr: "La sagesse de s'adapter comme l'eau brille.", es: 'Brilla la sabiduría de fluir como el agua.' },
    { ko: '깊이 관찰하면 기회의 물길이 보입니다.', en: 'Observe deeply and the channel of opportunity appears.', ja: '深く観れば機会の水路が見えます。', zh: '深观则见机会之流。', fr: "Observez en profondeur et le canal de l'opportunité apparaît.", es: 'Observa a fondo y verás el cauce de la oportunidad.' },
  ],
};

const FOCUS: L[] = [
  { ko: '일과 배움에서 한 걸음 앞서갈 여지가 있습니다.', en: 'There is room to step ahead in work and learning.', ja: '仕事と学びで一歩先へ進む余地があります。', zh: '在工作与学习上有领先一步的空间。', fr: 'Il y a de la place pour avancer au travail et dans les études.', es: 'Hay espacio para avanzar en trabajo y aprendizaje.' },
  { ko: '가까운 관계에서 따뜻한 신호가 오갑니다.', en: 'Warm signals move within close relationships.', ja: '近しい関係で温かなサインが行き交います。', zh: '亲近关系中会有温暖的信号。', fr: 'Des signes chaleureux circulent dans vos relations proches.', es: 'Circulan señales cálidas en tus relaciones cercanas.' },
  { ko: '금전은 지키는 쪽이 늘리는 쪽보다 유리합니다.', en: 'With money, guarding beats grasping this time.', ja: '金銭は増やすより守る方が有利。', zh: '钱财上守成胜于进取。', fr: "Côté argent, préserver vaut mieux qu'accumuler.", es: 'En dinero, conservar supera a acumular.' },
  { ko: '몸의 리듬을 회복하면 판단이 맑아집니다.', en: 'Restore your body’s rhythm and judgment clears.', ja: '体のリズムを整えると判断が冴えます。', zh: '恢复身体节律，判断更清晰。', fr: 'Rétablissez votre rythme et votre jugement s’éclaircit.', es: 'Recupera tu ritmo y tu juicio se aclara.' },
];

const ADVICE: L[] = [
  { ko: '조언: 작게 시작하되 매일 이어가세요.', en: 'Advice: start small, but keep it daily.', ja: '助言: 小さく始め、毎日続けて。', zh: '建议：从小处开始，每天坚持。', fr: 'Conseil : commencez petit, mais chaque jour.', es: 'Consejo: empieza pequeño, pero a diario.' },
  { ko: '조언: 거절할 것을 먼저 정하세요.', en: 'Advice: decide first what to decline.', ja: '助言: 断ることから決めて。', zh: '建议：先决定要拒绝什么。', fr: 'Conseil : décidez d’abord ce que vous refusez.', es: 'Consejo: decide primero qué rechazar.' },
  { ko: '조언: 한 사람에게 진심을 전하세요.', en: 'Advice: bring your honesty to one person.', ja: '助言: 一人に本心を伝えて。', zh: '建议：向一个人袒露真心。', fr: 'Conseil : soyez sincère avec une personne.', es: 'Consejo: sé sincero con una persona.' },
  { ko: '조언: 오늘의 기록이 다음 기회를 부릅니다.', en: 'Advice: today’s notes summon tomorrow’s chance.', ja: '助言: 今日の記録が次の機会を呼ぶ。', zh: '建议：今天的记录会带来下次机会。', fr: 'Conseil : vos notes d’aujourd’hui appellent la chance de demain.', es: 'Consejo: tus notas de hoy invocan la próxima oportunidad.' },
];

// 안정적 선택: (기준 + 주기키 + 축이름) 해시로 인덱스
function pick<T>(arr: T[], seed: string): T { return arr[hash(seed) % arr.length]; }

export interface FortuneReading {
  opening: string; focus: string; advice: string;
}
export function reading(elementIdx: number, period: Period, base: string, locale: Locale, d = new Date()): FortuneReading {
  const el = FIVE_ELEMENTS[elementIdx];
  const pk = periodKey(period, d);
  const open = pick(OPENING[el], `${base}|${pk}|open`);
  const foc = pick(FOCUS, `${base}|${pk}|focus`);
  const adv = pick(ADVICE, `${base}|${pk}|advice`);
  return { opening: open[locale], focus: foc[locale], advice: adv[locale] };
}

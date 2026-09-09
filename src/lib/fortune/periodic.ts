// 주기형 운세 엔진 — AI 없이, 방대한 코퍼스 + 결정론적 시드로 생성.
// period(오늘/이번주/이번달) × system(오행·12지신·별자리) × 사용자 기준(생년/사인)을
// 해싱해 코퍼스에서 안정적으로 선택. 같은 주에는 같은 결과(재방문 신선도), 주가 바뀌면 갱신.
export type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
export type Period = 'today' | 'weekly' | 'monthly' | 'yearly';

// ── 결정론적 시드 ──
export function periodKey(p: Period, d = new Date()): string {
  const y = d.getUTCFullYear();
  if (p === 'yearly') return `${y}`;
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

// FNV-1a + murmur3 fmix32 마무리. fmix32 없이 FNV 만 쓰면 마지막 글자만
// 다른 문자열("…#12941" vs "…#12942")의 해시 상위 비트가 거의 같아진다.
// 그 결과 날짜를 하나씩 밀어 만든 시드가 사실상 같은 값이 되어, 며칠 동안
// 같은 운세·같은 점수가 나온다. (2026-09-09 발견)
export function seedHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}
const hash = seedHash;

/** 주기 순번(오늘=일수, 주간=주차, 월간=월수, 연간=연수). 순환 추첨의 x축이다. */
export function stepIndex(p: Period, d = new Date()): number {
  const ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  if (p === 'today') return Math.floor(ms / 86400000);
  if (p === 'weekly') return Math.floor(ms / (7 * 86400000));
  if (p === 'monthly') return d.getUTCFullYear() * 12 + d.getUTCMonth();
  return d.getUTCFullYear();
}

// ── 순환 추첨 ──
// 독립 해시 추첨은 같은 문장을 며칠 만에 다시 낸다(생일 문제). 실측으로 말띠
// 오프닝은 90일 동안 10개만 돌았고 한 문장은 15번 나왔다 — "어디서 많이 봤는데"의
// 정체다. 그래서 매 회차마다 풀 전체를 섞은 순열을 만들고 순번대로 하나씩 꺼낸다.
// 풀 크기가 n 이면 **n 주기 동안 같은 문장이 두 번 나오지 않는 것이 보장된다.**
// 회차가 넘어갈 때만 경계가 생기므로, 새 순열의 첫 항이 직전 순열의 끝 항과
// 같으면 한 칸 돌려 붙어 나오는 것도 막는다.

/** 시드에서 뽑은 mulberry32 PRNG. 순열을 만들 때만 쓴다. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** (시드, 회차)로 결정되는 0..n-1 순열. */
function permutation(n: number, seed: string, cycle: number): number[] {
  const next = rng(seedHash(`${seed}#c${cycle}`));
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 순환 추첨. 같은 시드로 t 를 하나씩 올리면 풀을 한 바퀴 다 돈 뒤에야 반복한다.
 * t 가 음수여도(과거 날짜 흐름 계산) 올바른 회차로 떨어지게 floor 나눗셈을 쓴다.
 */
/**
 * 한 회차의 순열을 직전 회차의 꼬리와 겹치지 않게 손본다.
 *
 * 회차 안에서는 중복이 없지만 경계는 다른 문제다. 어떤 항목이 이전 회차의
 * 끝자락에 나오고 다음 회차의 첫머리에 다시 나오면 **며칠 만에 재등장한다.**
 * 실측으로 풀이 96인데도 30일 안에 같은 문장이 세 번 나왔다.
 *
 * 그래서 새 순열의 **앞 K개**가 이전 순열의 **뒤 K개**와 겹치지 않게 교환한다.
 * 그러면 재등장 간격이 항상 K 를 넘는다 — 이전 꼬리에 있던 항목은 새 회차에서
 * K 이후에만 나오고, 꼬리 밖 항목은 이미 K 이상 떨어져 있다.
 *
 * 교환 상대는 **[K, n-K) 안에서만** 고른다. 꼬리(뒤 K개)를 건드리지 않아야
 * 손본 순열의 꼬리가 날 순열의 꼬리와 같아지고, 그래야 다음 회차가 날 순열만
 * 보고도 같은 판단을 할 수 있다. 이 조건이 없으면 c 의 꼬리를 알기 위해 c-1 을,
 * 다시 c-2 를 계산해야 해서 재귀가 끝나지 않는다.
 * 후보가 늘 남으려면 n - 2K > K, 즉 K < n/3 이어야 한다.
 */
function noRepeatWindow(n: number): number { return Math.max(0, Math.floor((n - 1) / 3)); }

function adjustedPermutation(n: number, seed: string, cycle: number): number[] {
  const perm = permutation(n, seed, cycle).slice();
  const k = noRepeatWindow(n);
  if (k < 1) return perm;
  const prevTail = new Set(permutation(n, seed, cycle - 1).slice(n - k));
  for (let i = 0; i < k; i++) {
    if (!prevTail.has(perm[i])) continue;
    for (let j = k; j < n - k; j++) {
      if (!prevTail.has(perm[j])) { [perm[i], perm[j]] = [perm[j], perm[i]]; break; }
    }
  }
  return perm;
}

export function pickCycled<T>(arr: T[], seed: string, t: number): T {
  const n = arr.length;
  if (n <= 1) return arr[0];
  const cycle = Math.floor(t / n);
  const pos = t - cycle * n;
  return arr[adjustedPermutation(n, seed, cycle)[pos]];
}

/** 풀 크기 n 에서 같은 항목이 다시 나오기까지 보장되는 최소 주기 수. */
export function guaranteedGap(n: number): number { return n <= 1 ? 0 : noRepeatWindow(n); }

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
  // 천간 기준 오행. 연도 끝자리 0=경, 1=신, 2=임, 3=계, 4=갑 … 9=기 이므로
  // 금·금·수·수·목·목·화·화·토·토 순서다. (2026-09-09: 이전 매핑은 두 칸 밀려
  // 1990 경오년을 水, 2024 갑진년을 火 로 냈다 — 오행 자체가 틀린 값이었다.)
  const map = [3, 3, 4, 4, 0, 0, 1, 1, 2, 2];
  return map[((year % 10) + 10) % 10];
}

/** 천간 인덱스(0=갑 … 9=계). 사주 라벨과 시드 개인화에 쓴다. */
export function stemOf(year: number): number { return ((year - 4) % 10 + 10) % 10; }

// ── 코퍼스 (측면별 문장 풀 — 시드로 선택) ──
// 각 배열은 6로케일. 방대한 조합을 위해 축(과제·기회·주의·조언)을 나눠 조합한다.
type L = Record<Locale, string>;
/** 오프닝은 카드의 헤드라인이라 점수와 어조가 어긋나면 바로 눈에 띈다.
 *  up = 순풍·성취, flat = 균형·관망, down = 소모·경계. */
type Tone = 'up' | 'flat' | 'down';
type ToneL = L & { t: Tone };

const OPENING: Record<string, ToneL[]> = {
  wood: [
    { ko: '새싹처럼 뻗어나가는 기운이 감돕니다.', en: 'An expanding, sprouting energy surrounds you.', ja: '芽吹くように伸びる気が漂います。', zh: '如新芽般舒展的气息环绕着你。', fr: 'Une énergie de croissance vous entoure.', es: 'Una energía de crecimiento te rodea.' , t: 'up' },
    { ko: '유연하게 방향을 트는 것이 유리합니다.', en: 'Bending flexibly toward a new direction favors you.', ja: 'しなやかに方向を変えるのが吉。', zh: '灵活转向对你有利。', fr: 'Changer de direction avec souplesse vous est favorable.', es: 'Cambiar de rumbo con flexibilidad te favorece.' , t: 'flat' },
    { ko: '곧게 자라나려는 의지가 강해지는 시기입니다.', en: 'The will to grow straight and tall is strengthening.', ja: 'まっすぐ伸びようとする意志が強まる時期です。', zh: '想要笔直生长的意志正在增强。', fr: 'La volonté de croître droit et haut se renforce.', es: 'La voluntad de crecer recto y alto se fortalece.' , t: 'up' },
    { ko: '새로운 가지를 뻗어볼 좋은 타이밍입니다.', en: 'A good time to branch out into something new.', ja: '新しい枝を伸ばすのに良いタイミングです。', zh: '是伸展新枝的好时机。', fr: 'Un bon moment pour vous ouvrir à quelque chose de nouveau.', es: 'Un buen momento para abrirte a algo nuevo.' , t: 'up' },
    { ko: '뿌리내림과 성장 사이에서 균형을 찾아야 합니다.', en: 'Find the balance between putting down roots and growing upward.', ja: '根を張ることと成長の間でバランスを取るべきです。', zh: '需要在扎根与成长之间找到平衡。', fr: "Trouvez l'équilibre entre enraciner et grandir.", es: 'Encuentra el equilibrio entre echar raíces y crecer.' , t: 'flat' },
    { ko: '아직 이름 붙지 않은 계획이 형태를 갖추기 시작합니다.', en: "A plan you haven't named yet starts taking shape.", ja: 'まだ名前のない計画が形を取り始めます。', zh: '一个尚未命名的计划开始成形。', fr: 'Un projet encore sans nom commence à prendre forme.', es: 'Un plan aún sin nombre empieza a tomar forma.' , t: 'up' },
    { ko: '주변보다 반 박자 이르게 움직여도 무리가 없습니다.', en: 'Moving half a beat ahead of others costs you nothing.', ja: '周りより半歩早く動いても無理はありません。', zh: '比周围人早半拍行动也不勉强。', fr: "Avancer d'un demi-temps sur les autres ne coûte rien.", es: 'Moverte medio paso antes que los demás no te cuesta nada.' , t: 'up' },
    { ko: '굽히는 것이 지는 것이 아닌 시기입니다.', en: 'A season where bending is not the same as losing.', ja: '曲げることが負けではない時期です。', zh: '此时弯曲并不等于失败。', fr: "Une saison où plier n'est pas perdre.", es: 'Una temporada en que doblarse no es perder.' , t: 'flat' },
    { ko: '가지치기를 해야 더 크게 자랍니다.', en: 'Prune, and you will grow larger for it.', ja: '枝を落としてこそ大きく育ちます。', zh: '修剪之后才会长得更大。', fr: 'Élaguez, et vous grandirez davantage.', es: 'Poda, y crecerás más por ello.' , t: 'flat' },
    { ko: '한 번 심어둔 것이 뒤늦게 싹을 냅니다.', en: 'Something you planted long ago sprouts late.', ja: 'かつて蒔いたものが遅れて芽を出します。', zh: '很久以前种下的东西迟迟发芽。', fr: 'Ce que vous aviez semé germe tardivement.', es: 'Algo que sembraste hace tiempo brota tarde.' , t: 'up' },
  ],
  fire: [
    { ko: '열정이 분명한 성과로 이어질 시기입니다.', en: 'Passion is poised to turn into visible results.', ja: '情熱が成果に変わる時期です。', zh: '热情正要化为可见的成果。', fr: 'La passion se transforme en résultats visibles.', es: 'La pasión se vuelve resultados visibles.' , t: 'up' },
    { ko: '드러내되 다 태우지 않는 균형이 중요합니다.', en: 'Shine, but keep the balance not to burn out.', ja: '輝きつつ燃え尽きない均衡が大切。', zh: '发光但别耗尽，平衡最重要。', fr: 'Brillez sans vous consumer.', es: 'Brilla sin quemarte.' , t: 'flat' },
    { ko: '안에서 타오르는 열기가 겉으로 드러나기 시작합니다.', en: 'The heat burning within begins to show on the outside.', ja: '内で燃える熱が外に現れ始めます。', zh: '内心燃烧的热情开始显现于外。', fr: 'La chaleur qui brûle en vous commence à se voir.', es: 'El calor que arde dentro empieza a notarse fuera.' , t: 'up' },
    { ko: '밝게 비추는 존재감이 주변을 끌어당깁니다.', en: 'A brightly shining presence draws others in.', ja: '明るく照らす存在感が周りを引き寄せます。', zh: '明亮的存在感吸引着周围的人。', fr: 'Une présence rayonnante attire les autres.', es: 'Una presencia radiante atrae a los demás.' , t: 'up' },
    { ko: '속도보다 지속하는 불꽃이 필요한 때입니다.', en: 'A moment that calls for a flame that lasts, not just burns fast.', ja: '速さより長く続く炎が必要な時です。', zh: '此刻需要的是持久而非急速的火焰。', fr: 'Un moment qui demande une flamme durable, pas seulement rapide.', es: 'Un momento que pide una llama duradera, no solo rápida.' , t: 'flat' },
    { ko: '눈에 띄는 자리를 피하지 않는 편이 낫습니다.', en: 'Better not to avoid the visible seat this time.', ja: '目立つ場所を避けない方が良いです。', zh: '这次不要回避引人注目的位置。', fr: 'Mieux vaut ne pas fuir la place visible.', es: 'Mejor no evitar el lugar visible.' , t: 'up' },
    { ko: '한순간의 감정이 오래 갈 인상을 남깁니다.', en: 'A momentary feeling leaves a lasting impression.', ja: '一瞬の感情が長く残る印象を作ります。', zh: '一瞬的情绪会留下长久的印象。', fr: 'Une émotion passagère laisse une impression durable.', es: 'Una emoción pasajera deja una impresión duradera.' , t: 'flat' },
    { ko: '불씨를 나눠줘도 내 불은 줄지 않습니다.', en: 'Sharing your spark does not shrink your own fire.', ja: '火種を分けても自分の火は減りません。', zh: '分出火种，自己的火并不会减少。', fr: "Partager votre étincelle n'éteint pas votre feu.", es: 'Compartir tu chispa no apaga tu fuego.' , t: 'up' },
    { ko: '빠르게 타오른 만큼 식는 속도도 살펴야 합니다.', en: 'What flares fast also cools fast — watch for it.', ja: '速く燃えた分、冷める速さも見るべきです。', zh: '燃得快也冷得快，需留意。', fr: "Ce qui s'embrase vite refroidit vite — surveillez-le.", es: 'Lo que arde rápido se enfría rápido: vigílalo.' , t: 'down' },
    { ko: '드러내지 않던 재능이 우연히 알려집니다.', en: 'A talent you kept quiet gets noticed by chance.', ja: '隠していた才能が偶然知られます。', zh: '一直藏着的才能偶然被人发现。', fr: 'Un talent tu se fait remarquer par hasard.', es: 'Un talento que callabas se nota por casualidad.' , t: 'up' },
  ],
  earth: [
    { ko: '단단히 다지는 안정의 흐름입니다.', en: 'A steady, grounding flow of stability.', ja: '地に足のついた安定の流れ。', zh: '踏实稳固的稳定气流。', fr: 'Un flux stable qui vous ancre.', es: 'Un flujo estable que te ancla.' , t: 'up' },
    { ko: '약속과 신뢰가 자산이 됩니다.', en: 'Promises kept become real assets.', ja: '約束と信頼が資産になります。', zh: '守信将成为你的资产。', fr: 'Les promesses tenues deviennent des atouts.', es: 'Las promesas cumplidas se vuelven activos.' , t: 'up' },
    { ko: '천천히 그러나 확실하게 기반이 다져집니다.', en: 'Slowly but surely, the foundation solidifies.', ja: 'ゆっくりだが確実に基盤が固まります。', zh: '根基正在缓慢而稳固地夯实。', fr: 'Lentement mais sûrement, les bases se consolident.', es: 'Lenta pero firmemente, la base se consolida.' , t: 'up' },
    { ko: '현실적인 계획이 오히려 큰 힘을 냅니다.', en: 'A realistic plan turns out to carry real power.', ja: '現実的な計画がむしろ大きな力を発揮します。', zh: '务实的计划反而能发挥更大的力量。', fr: 'Un plan réaliste se révèle étonnamment puissant.', es: 'Un plan realista resulta sorprendentemente poderoso.' , t: 'up' },
    { ko: '주변 사람을 품는 넉넉함이 빛을 발합니다.', en: 'A generous spirit that embraces others shines through.', ja: '周りの人を包む余裕が輝きを放ちます。', zh: '包容他人的宽厚之心正在闪光。', fr: 'Une générosité qui accueille les autres se met à briller.', es: 'Una generosidad que acoge a los demás empieza a brillar.' , t: 'up' },
    { ko: '한자리를 지키는 것이 가장 큰 전략입니다.', en: 'Holding your ground is the biggest strategy here.', ja: '一つの場所を守ることが最大の戦略です。', zh: '守住一个位置就是最大的策略。', fr: 'Tenir votre position est ici la meilleure stratégie.', es: 'Mantener tu lugar es aquí la mayor estrategia.' , t: 'flat' },
    { ko: '쌓아둔 것이 처음으로 값을 합니다.', en: 'What you stored up finally starts to pay.', ja: '積み上げたものが初めて役に立ちます。', zh: '积累的东西第一次派上用场。', fr: 'Ce que vous aviez accumulé commence enfin à payer.', es: 'Lo que acumulaste por fin empieza a rendir.' , t: 'up' },
    { ko: '남의 무게를 대신 지지 않아도 됩니다.', en: "You are not required to carry someone else's weight.", ja: '他人の重さまで背負わなくて大丈夫です。', zh: '不必替别人扛下重量。', fr: "Vous n'avez pas à porter le poids d'autrui.", es: 'No tienes que cargar el peso de otro.' , t: 'flat' },
    { ko: '느린 것과 멈춘 것은 다릅니다.', en: 'Slow and stopped are not the same thing.', ja: '遅いことと止まっていることは違います。', zh: '慢与停是两回事。', fr: 'Lent et arrêté ne sont pas la même chose.', es: 'Lento y detenido no son lo mismo.' , t: 'flat' },
    { ko: '경계를 분명히 그을수록 관계가 편해집니다.', en: 'The clearer your boundaries, the easier your relationships.', ja: '境界を明確にするほど関係が楽になります。', zh: '界限越清晰，关系越轻松。', fr: 'Plus vos limites sont nettes, plus vos relations sont simples.', es: 'Cuanto más claros tus límites, más fáciles tus vínculos.' , t: 'flat' },
  ],
  metal: [
    { ko: '정리하고 벼려낼수록 날카로워집니다.', en: 'The more you refine and cut away, the sharper you become.', ja: '整え研ぐほど鋭くなります。', zh: '越是整理磨砺，越显锋利。', fr: 'Plus vous affinez, plus vous êtes tranchant.', es: 'Cuanto más pules, más afilado estás.' , t: 'up' },
    { ko: '원칙을 지키는 선택이 결실을 부릅니다.', en: 'Choices that hold your principles bear fruit.', ja: '原則を守る選択が実を結びます。', zh: '坚守原则的选择会结果。', fr: 'Les choix fidèles à vos principes portent leurs fruits.', es: 'Las decisiones fieles a tus principios dan fruto.' , t: 'up' },
    { ko: '불필요한 것을 덜어낼수록 본질이 선명해집니다.', en: 'The more you cut away the unnecessary, the clearer the essence becomes.', ja: '不要なものを削るほど本質が鮮明になります。', zh: '越是删繁就简，本质越发清晰。', fr: "Plus vous éliminez le superflu, plus l'essentiel s'éclaircit.", es: 'Cuanto más eliminas lo innecesario, más claro se vuelve lo esencial.' , t: 'up' },
    { ko: '명확한 기준이 흔들리던 상황을 정리합니다.', en: 'A clear standard settles a situation that had been unstable.', ja: '明確な基準が揺れていた状況を整理します。', zh: '明确的标准会理清一度动摇的局面。', fr: "Un critère clair remet de l'ordre dans une situation instable.", es: 'Un criterio claro ordena una situación inestable.' , t: 'up' },
    { ko: '결단이 필요한 순간에 주저하지 않는 것이 유리합니다.', en: 'When a decision is needed, not hesitating works in your favor.', ja: '決断が必要な瞬間にためらわないことが有利です。', zh: '在需要决断之时不犹豫会对你有利。', fr: 'Ne pas hésiter au moment de décider joue en votre faveur.', es: 'No dudar en el momento de decidir juega a tu favor.' , t: 'flat' },
    { ko: '타협하지 않은 기준 하나가 평판을 만듭니다.', en: 'One standard you refused to bend builds your reputation.', ja: '譲らなかった基準一つが評判を作ります。', zh: '一条不肯让步的标准造就了口碑。', fr: 'Un critère non négocié forge votre réputation.', es: 'Un criterio que no cediste forja tu reputación.' , t: 'up' },
    { ko: '끝맺지 못한 일이 계속 마음을 갉아먹습니다.', en: 'An unfinished thing keeps gnawing at your mind.', ja: '終わらせていない事が心を削り続けます。', zh: '未了之事一直在消耗你的心神。', fr: "Une chose inachevée vous ronge l'esprit.", es: 'Algo sin terminar te sigue royendo la mente.' , t: 'down' },
    { ko: '차갑게 보이는 정확함이 결국 친절입니다.', en: 'Precision that looks cold turns out to be kindness.', ja: '冷たく見える正確さが結局は優しさです。', zh: '看似冷淡的精确其实是善意。', fr: 'Une précision qui paraît froide est en fait de la bienveillance.', es: 'Una precisión que parece fría resulta ser amabilidad.' , t: 'flat' },
    { ko: '버릴 것을 정하면 남길 것이 선명해집니다.', en: 'Decide what to discard and what stays becomes obvious.', ja: '捨てるものを決めれば残すものが見えます。', zh: '决定舍弃什么，留下什么就清楚了。', fr: 'Décidez quoi jeter et ce qui reste devient évident.', es: 'Decide qué desechar y lo que queda se vuelve obvio.' , t: 'flat' },
    { ko: '소리 내지 않은 원칙은 지켜지지 않습니다.', en: 'A principle never spoken aloud does not get respected.', ja: '口に出さない原則は守られません。', zh: '没有说出口的原则不会被遵守。', fr: "Un principe jamais énoncé n'est pas respecté.", es: 'Un principio nunca dicho no se respeta.' , t: 'down' },
  ],
  water: [
    { ko: '흐르듯 적응하는 지혜가 빛납니다.', en: 'The wisdom to adapt like water shines.', ja: '水のように適応する知恵が光ります。', zh: '如水般顺应的智慧闪光。', fr: "La sagesse de s'adapter comme l'eau brille.", es: 'Brilla la sabiduría de fluir como el agua.' , t: 'up' },
    { ko: '깊이 관찰하면 기회의 물길이 보입니다.', en: 'Observe deeply and the channel of opportunity appears.', ja: '深く観れば機会の水路が見えます。', zh: '深观则见机会之流。', fr: "Observez en profondeur et le canal de l'opportunité apparaît.", es: 'Observa a fondo y verás el cauce de la oportunidad.' , t: 'up' },
    { ko: '막히면 돌아가는 유연함이 길을 열어줍니다.', en: 'The flexibility to go around a blockage opens the way.', ja: '詰まったら回り道する柔軟さが道を開きます。', zh: '受阻时懂得绕行的灵活会为你开路。', fr: 'La souplesse de contourner un obstacle ouvre la voie.', es: 'La flexibilidad de rodear un obstáculo abre el camino.' , t: 'up' },
    { ko: '고요히 흐르는 생각이 답을 찾아냅니다.', en: 'Quietly flowing thoughts find their way to the answer.', ja: '静かに流れる思考が答えを見つけ出します。', zh: '静静流淌的思绪会找到答案。', fr: 'Des pensées qui coulent tranquillement trouvent la réponse.', es: 'Pensamientos que fluyen en calma encuentran la respuesta.' , t: 'up' },
    { ko: '낮은 곳으로 향하는 겸손함이 신뢰를 쌓습니다.', en: 'A humility that flows to the lowest place builds trust.', ja: '低きに向かう謙虚さが信頼を築きます。', zh: '如水般流向低处的谦逊会积累信任。', fr: 'Une humilité qui coule vers le plus bas construit la confiance.', es: 'Una humildad que fluye hacia lo más bajo construye confianza.' , t: 'up' },
    { ko: '서두르지 않는 사람이 결국 먼저 도착합니다.', en: 'The one who does not hurry arrives first in the end.', ja: '急がない人が結局先に着きます。', zh: '不急的人最终先到。', fr: 'Celui qui ne se presse pas arrive le premier.', es: 'Quien no se apresura llega primero al final.' , t: 'up' },
    { ko: '말을 아낄수록 듣게 되는 것이 많아집니다.', en: 'The less you say, the more you get to hear.', ja: '言葉を惜しむほど聞こえるものが増えます。', zh: '话说得越少，听到的越多。', fr: 'Moins vous parlez, plus vous entendez.', es: 'Cuanto menos hablas, más escuchas.' , t: 'flat' },
    { ko: '겉으로 잔잔해도 아래에서 방향이 바뀌고 있습니다.', en: 'Calm on the surface, the current below is already turning.', ja: '表面は静かでも下では向きが変わっています。', zh: '表面平静，水下方向已在改变。', fr: 'Calme en surface, le courant en dessous change déjà.', es: 'Calma en la superficie, la corriente abajo ya gira.' , t: 'flat' },
    { ko: '한 번 새어나간 것은 되담기 어렵습니다.', en: 'What has leaked out is hard to gather back.', ja: '一度漏れたものは戻しにくいです。', zh: '一旦泄露就难以收回。', fr: 'Ce qui a fui est difficile à récupérer.', es: 'Lo que se ha filtrado es difícil de recoger.' , t: 'down' },
    { ko: '기다림 자체가 하나의 선택입니다.', en: 'Waiting is itself a choice, not an absence of one.', ja: '待つこと自体が一つの選択です。', zh: '等待本身就是一种选择。', fr: 'Attendre est en soi un choix.', es: 'Esperar es en sí mismo una elección.' , t: 'flat' },
  ],
};


// 오행에 얽매이지 않는 공용 오프닝. 오행별 풀만 쓰면 한 카드가 평생 10문장만
// 보게 된다(2026-09-09 실측: 말띠 90일에 고유 10개, 한 문장은 15회).
// 모든 오행이 함께 쓰는 풀을 둬 카드당 실효 풀을 다섯 배로 넓힌다.
const SHARED_OPENING: ToneL[] = [
  { ko: '오래 준비한 것을 꺼내 보일 자리가 생깁니다.', en: 'A place opens up to show what you prepared for a long time.', ja: '長く準備したものを見せる場が生まれます。', zh: '准备已久的东西会有展示的机会。', fr: 'Une occasion se présente de montrer ce que vous avez longtemps préparé.', es: 'Surge un lugar para mostrar lo que preparaste durante mucho tiempo.', t: 'up' },
  { ko: '애매하던 것이 한 번에 분명해집니다.', en: 'Something that was vague becomes clear all at once.', ja: '曖昧だったものが一気にはっきりします。', zh: '含糊的事会一下子明朗起来。', fr: "Ce qui était flou devient net d'un coup.", es: 'Lo que era ambiguo se aclara de golpe.', t: 'up' },
  { ko: '먼저 건넨 말이 예상보다 큰 문을 엽니다.', en: 'A word you offer first opens a bigger door than expected.', ja: '先に掛けた一言が思ったより大きな扉を開きます。', zh: '主动说出的一句话会打开比预想更大的门。', fr: 'Un mot que vous offrez en premier ouvre une porte plus grande que prévu.', es: 'Una palabra que ofreces primero abre una puerta mayor de lo previsto.', t: 'up' },
  { ko: '남들이 지나친 자리에서 쓸 만한 것을 발견합니다.', en: 'You find something useful where others walked past.', ja: '人が通り過ぎた場所で使えるものを見つけます。', zh: '在别人错过的地方，你会发现有用的东西。', fr: "Vous trouvez de l'utile là où d'autres sont passés sans voir.", es: 'Encuentras algo útil donde otros pasaron de largo.', t: 'up' },
  { ko: '가벼운 마음으로 시작한 일이 오래갑니다.', en: 'Something begun lightly turns out to last.', ja: '軽い気持ちで始めた事が長く続きます。', zh: '随意开始的事反而会长久。', fr: 'Ce qui a commencé sans prétention finit par durer.', es: 'Lo que empezaste a la ligera acaba durando.', t: 'up' },
  { ko: '이미 가진 것을 다시 세어 보면 여유가 생깁니다.', en: 'Recount what you already have and room appears.', ja: '既に持つ物を数え直すと余裕が生まれます。', zh: '重新清点已有之物，你会宽裕起来。', fr: "Recomptez ce que vous avez déjà et l'aisance revient.", es: 'Vuelve a contar lo que ya tienes y aparece holgura.', t: 'up' },
  { ko: '설명하기 어려웠던 감각이 말이 되어 나옵니다.', en: 'A feeling you could not explain finally finds words.', ja: '説明しにくかった感覚が言葉になります。', zh: '难以言说的感觉终于找到了词语。', fr: 'Une sensation indicible trouve enfin ses mots.', es: 'Una sensación inexplicable por fin encuentra palabras.', t: 'up' },
  { ko: '한 사람의 인정이 열 사람의 소문보다 큽니다.', en: "One person's recognition outweighs ten people's rumours.", ja: '一人の認めが十人の噂より大きい。', zh: '一个人的认可胜过十个人的传言。', fr: "La reconnaissance d'un seul pèse plus que la rumeur de dix.", es: 'El reconocimiento de uno pesa más que el rumor de diez.', t: 'up' },
  { ko: '미뤄뒀던 연락 하나가 흐름을 바꿉니다.', en: 'One call you kept postponing changes the current.', ja: '後回しにしていた連絡一つが流れを変えます。', zh: '一个拖延已久的联络会改变走向。', fr: 'Un appel que vous remettiez change le courant.', es: 'Una llamada que aplazabas cambia la corriente.', t: 'up' },
  { ko: '작게 이긴 경험이 다음 판을 편하게 만듭니다.', en: 'A small win makes the next round easier.', ja: '小さく勝った経験が次を楽にします。', zh: '一次小胜会让下一局轻松许多。', fr: 'Une petite victoire rend la manche suivante plus facile.', es: 'Una pequeña victoria facilita la siguiente ronda.', t: 'up' },
  { ko: '굳이 증명하지 않아도 알아보는 사람이 있습니다.', en: 'Someone recognizes it without you having to prove it.', ja: '証明しなくても見抜く人がいます。', zh: '有人不需要你证明就能看出来。', fr: "Quelqu'un le voit sans que vous ayez à le prouver.", es: 'Alguien lo ve sin que tengas que demostrarlo.', t: 'up' },
  { ko: '돌아온 길이 결국 가장 빠른 길이었습니다.', en: 'The long way round turns out to have been the fastest.', ja: '回り道が結局は一番速い道でした。', zh: '绕过的路最终是最快的路。', fr: "Le détour s'avère avoir été le chemin le plus rapide.", es: 'El rodeo resultó ser el camino más rápido.', t: 'up' },
  { ko: '서로 다른 두 가지를 동시에 쥐고 있는 시기입니다.', en: 'A season of holding two different things at once.', ja: '異なる二つを同時に握っている時期です。', zh: '此时你正同时握着两样不同的东西。', fr: 'Une saison où vous tenez deux choses à la fois.', es: 'Una temporada en que sostienes dos cosas a la vez.', t: 'flat' },
  { ko: '결정을 내리기보다 조건을 정리할 때입니다.', en: 'A time to sort the conditions rather than make the call.', ja: '決めるより条件を整理する時です。', zh: '此刻该理清条件，而不是下决定。', fr: 'Le moment de clarifier les conditions plutôt que de trancher.', es: 'Momento de ordenar las condiciones, no de decidir.', t: 'flat' },
  { ko: '바뀐 것보다 그대로인 것을 확인하게 됩니다.', en: 'You end up checking what stayed the same, not what changed.', ja: '変わった事より変わらぬ事を確かめる事になります。', zh: '你会去确认没变的，而不是变了的。', fr: "Vous vérifiez ce qui n'a pas changé plutôt que l'inverse.", es: 'Acabas comprobando lo que sigue igual, no lo que cambió.', t: 'flat' },
  { ko: '바깥의 속도와 안의 속도가 다릅니다.', en: 'Your inner pace and the outside pace do not match.', ja: '外の速度と内の速度が違います。', zh: '外面的节奏和内心的节奏并不一致。', fr: 'Votre rythme intérieur et celui du dehors diffèrent.', es: 'Tu ritmo interior y el de fuera no coinciden.', t: 'flat' },
  { ko: '아직 이름 붙일 단계는 아닌 변화가 진행 중입니다.', en: 'A change too early to name is already under way.', ja: '名前を付ける段階ではない変化が進んでいます。', zh: '一场还无法命名的变化正在进行。', fr: 'Un changement encore innommable est déjà en cours.', es: 'Un cambio aún sin nombre ya está en marcha.', t: 'flat' },
  { ko: '누구의 편도 들지 않는 것이 답일 수 있습니다.', en: 'Taking no side may be the answer here.', ja: 'どちらの味方もしない事が答えかもしれません。', zh: '不站任何一边也许才是答案。', fr: 'Ne prendre aucun parti est peut-être la réponse.', es: 'No tomar partido puede ser la respuesta.', t: 'flat' },
  { ko: '같은 자리에서 각도만 바꿔도 다르게 보입니다.', en: 'Same spot, different angle — and it already looks different.', ja: '同じ場所でも角度を変えれば違って見えます。', zh: '同一位置，换个角度就不一样了。', fr: 'Même place, autre angle : tout paraît différent.', es: 'Mismo sitio, otro ángulo: ya se ve distinto.', t: 'flat' },
  { ko: '정답보다 견딜 만한 선택이 필요합니다.', en: 'What you need is a bearable choice, not a correct one.', ja: '正解より耐えられる選択が必要です。', zh: '你需要的是可承受的选择，而非正确答案。', fr: 'Il vous faut un choix supportable, pas un choix juste.', es: 'Necesitas una opción llevadera, no la correcta.', t: 'flat' },
  { ko: '기대와 계획을 분리해 두는 편이 낫습니다.', en: 'Better to keep expectation and plan in separate boxes.', ja: '期待と計画は分けておく方が良いです。', zh: '最好把期待和计划分开放。', fr: "Mieux vaut séparer l'attente et le plan.", es: 'Mejor mantén separadas expectativa y plan.', t: 'flat' },
  { ko: '지금은 넓히기보다 고르는 국면입니다.', en: 'This is a phase for choosing, not for widening.', ja: '今は広げるより選ぶ局面です。', zh: '当下是筛选而非扩张的阶段。', fr: "C'est une phase de tri, pas d'élargissement.", es: 'Es una fase de elegir, no de ampliar.', t: 'flat' },
  { ko: '여러 사람의 기대가 한꺼번에 몰려 무거워집니다.', en: 'Expectations from several people pile up at once.', ja: '複数の期待が一度に集まり重くなります。', zh: '多方期待同时压来，会让人吃力。', fr: "Les attentes de plusieurs s'accumulent d'un coup.", es: 'Las expectativas de varios se acumulan a la vez.', t: 'down' },
  { ko: '설명이 길어질수록 오해도 함께 길어집니다.', en: 'The longer the explanation, the longer the misunderstanding.', ja: '説明が長くなるほど誤解も長くなります。', zh: '解释越长，误会也越长。', fr: "Plus l'explication s'allonge, plus le malentendu s'allonge.", es: 'Cuanto más larga la explicación, más largo el malentendido.', t: 'down' },
  { ko: '익숙함이 판단을 흐리게 만드는 구간입니다.', en: 'A stretch where familiarity clouds your judgment.', ja: '慣れが判断を鈍らせる区間です。', zh: '熟悉感正在模糊你的判断。', fr: "Une zone où l'habitude brouille le jugement.", es: 'Un tramo donde la costumbre nubla el juicio.', t: 'down' },
  { ko: '빌려온 기준으로 자신을 재고 있습니다.', en: 'You are measuring yourself with a borrowed yardstick.', ja: '借り物の基準で自分を測っています。', zh: '你正用借来的标准衡量自己。', fr: 'Vous vous mesurez à une règle empruntée.', es: 'Te estás midiendo con una vara prestada.', t: 'down' },
  { ko: '한 번의 양보가 기본값이 되어가고 있습니다.', en: 'One concession is quietly becoming the default.', ja: '一度の譲歩が既定になりつつあります。', zh: '一次让步正在悄悄变成默认。', fr: 'Une concession devient peu à peu la norme.', es: 'Una concesión se está volviendo lo normal.', t: 'down' },
  { ko: '쓰는 힘보다 새는 힘이 많은 때입니다.', en: 'More energy is leaking out than being spent well.', ja: '使う力より漏れる力が多い時です。', zh: '此时消耗大于产出。', fr: "Plus d'énergie fuit qu'elle n'est employée.", es: 'Se escapa más energía de la que empleas.', t: 'down' },
  { ko: '확인하지 않은 가정 위에 계획이 얹혀 있습니다.', en: 'The plan rests on an assumption nobody checked.', ja: '確かめていない前提の上に計画が乗っています。', zh: '计划建立在未经核实的假设上。', fr: 'Le plan repose sur une hypothèse non vérifiée.', es: 'El plan se apoya en un supuesto sin verificar.', t: 'down' },
  { ko: '답을 미루는 것이 답을 주는 것보다 비쌉니다.', en: 'Delaying the answer costs more than giving it.', ja: '返事を先延ばす方が答えるより高くつきます。', zh: '拖延回答比给出回答代价更大。', fr: 'Différer la réponse coûte plus que la donner.', es: 'Aplazar la respuesta cuesta más que darla.', t: 'down' },
  { ko: '가까울수록 말을 아끼다 멀어지는 흐름입니다.', en: 'With those closest, held-back words create distance.', ja: '近いほど言葉を控えて遠ざかる流れです。', zh: '越亲近越少说，反而拉开了距离。', fr: 'Avec les plus proches, les mots retenus créent de la distance.', es: 'Con los más cercanos, callar crea distancia.', t: 'down' },
  { ko: '빠른 판단이 필요해 보이지만 실은 아닙니다.', en: 'It looks like it needs a fast call, but it does not.', ja: '速い判断が要るように見えて、実は違います。', zh: '看似需要速断，其实不然。', fr: 'Cela semble exiger une décision rapide, mais non.', es: 'Parece exigir una decisión rápida, pero no.', t: 'down' },
  { ko: '한동안 막혀 있던 자리에서 숨통이 트입니다.', en: 'A place that was blocked for a while finally breathes.', ja: '長く詰まっていた所に風が通ります。', zh: '堵了许久的地方终于透气了。', fr: 'Un endroit longtemps bloqué respire enfin.', es: 'Un lugar tiempo atascado por fin respira.', t: 'up' },
  { ko: '맡겨둔 일이 생각보다 잘 굴러가고 있습니다.', en: 'What you delegated is running better than you thought.', ja: '任せた事が思ったより上手く回っています。', zh: '交出去的事比你想的运转得好。', fr: 'Ce que vous avez délégué tourne mieux que prévu.', es: 'Lo que delegaste va mejor de lo que creías.', t: 'up' },
  { ko: '한 번 웃고 넘긴 실수가 관계를 단단하게 합니다.', en: 'A mistake laughed off makes the bond sturdier.', ja: '笑って流した失敗が関係を強くします。', zh: '一笑而过的失误让关系更牢。', fr: 'Une erreur prise avec humour resserre le lien.', es: 'Un error tomado con humor afianza el vínculo.', t: 'up' },
  { ko: '고쳐 쓰기로 한 것이 새것보다 잘 맞습니다.', en: 'What you chose to mend fits better than something new.', ja: '直して使う事にした物が新品より合います。', zh: '决定修补的东西比新的更合用。', fr: 'Ce que vous réparez vous va mieux que du neuf.', es: 'Lo que decides remendar te sienta mejor que lo nuevo.', t: 'up' },
  { ko: '무리라고 생각했던 일정이 의외로 맞아떨어집니다.', en: 'A schedule you thought impossible lines up after all.', ja: '無理だと思った日程が意外に噛み合います。', zh: '以为不可能的日程竟然对上了。', fr: "Un planning jugé impossible finit par s'emboîter.", es: 'Una agenda que creías imposible acaba encajando.', t: 'up' },
  { ko: '질문을 바꾸자 답이 따라 나옵니다.', en: 'Change the question and the answer follows.', ja: '問いを変えると答えが付いてきます。', zh: '换个问法，答案就跟来了。', fr: 'Changez la question et la réponse suit.', es: 'Cambia la pregunta y la respuesta llega.', t: 'up' },
  { ko: '주변이 조용한 것은 잘 굴러가고 있다는 뜻입니다.', en: "The quiet around you means it's running fine.", ja: '周りが静かなのは上手く回っている証です。', zh: '周围安静，说明一切运转正常。', fr: 'Le calme autour signifie que ça tourne bien.', es: 'La calma alrededor significa que va bien.', t: 'up' },
  { ko: '작은 호의가 예상 못 한 곳에서 돌아옵니다.', en: "A small kindness returns from somewhere you didn't expect.", ja: '小さな親切が思わぬ所から返ってきます。', zh: '一点善意会从意想不到的地方回来。', fr: "Une petite gentillesse revient d'où vous ne l'attendiez pas.", es: 'Una pequeña amabilidad vuelve de donde no esperabas.', t: 'up' },
  { ko: '오래 미뤄둔 자리를 정리하면 기회가 앉습니다.', en: 'Clear the seat you left cluttered and opportunity sits down.', ja: '放置していた場所を片づけると機会が座ります。', zh: '把久置的位置清出来，机会就会坐下。', fr: "Dégagez la place encombrée et l'occasion s'y installe.", es: 'Despeja el sitio abandonado y la oportunidad se sienta.', t: 'up' },
  { ko: '혼자 삼켰던 말을 꺼내도 괜찮은 자리가 옵니다.', en: 'A place arrives where the words you swallowed are safe.', ja: '飲み込んだ言葉を出しても大丈夫な場が来ます。', zh: '会有一个能说出憋着的话的场合。', fr: 'Vient un lieu où les mots ravalés sont accueillis.', es: 'Llega un lugar donde las palabras tragadas caben.', t: 'up' },
  { ko: '숫자가 아니라 반응이 먼저 좋아집니다.', en: 'Reactions improve before the numbers do.', ja: '数字より先に反応が良くなります。', zh: '反应会先于数字变好。', fr: "Les réactions s'améliorent avant les chiffres.", es: 'Las reacciones mejoran antes que las cifras.', t: 'up' },
  { ko: '버티던 시기가 지나간 것을 뒤늦게 알아차립니다.', en: 'You realise only later that the hard stretch has passed.', ja: '踏ん張る時期が過ぎた事に後から気づきます。', zh: '你会晚一步才发现难熬的日子过去了。', fr: 'Vous réalisez après coup que le dur est passé.', es: 'Te das cuenta tarde de que lo duro ya pasó.', t: 'up' },
  { ko: '판단을 보류하는 것도 하나의 입장입니다.', en: 'Withholding judgment is itself a position.', ja: '判断を保留する事も一つの立場です。', zh: '保留判断本身也是一种立场。', fr: 'Suspendre son jugement est aussi une position.', es: 'Reservar el juicio también es una postura.', t: 'flat' },
  { ko: '맞는 답이 여러 개라 고르기 어려운 시기입니다.', en: 'Several answers are right, which is why choosing is hard.', ja: '正解が複数あるから選びにくい時期です。', zh: '正确答案不止一个，所以难选。', fr: "Plusieurs réponses sont justes, d'où la difficulté.", es: 'Hay varias respuestas correctas; por eso cuesta elegir.', t: 'flat' },
  { ko: '남이 보는 나와 내가 아는 내가 어긋납니다.', en: 'How others see you and how you know yourself diverge.', ja: '人が見る自分と知っている自分がずれます。', zh: '别人眼中的你与你自知的你有出入。', fr: "L'image qu'on a de vous et la vôtre divergent.", es: 'Cómo te ven y cómo te sabes no coinciden.', t: 'flat' },
  { ko: '바꿀 수 있는 것과 없는 것을 나눠야 합니다.', en: 'Separate what you can change from what you cannot.', ja: '変えられる事と変えられない事を分けるべきです。', zh: '该分清什么能改、什么不能。', fr: 'Séparez ce qui se change de ce qui ne se change pas.', es: 'Separa lo que puedes cambiar de lo que no.', t: 'flat' },
  { ko: '일이 늘어난 게 아니라 회복이 줄었습니다.', en: "The work didn't grow — your recovery shrank.", ja: '仕事が増えたのでなく回復が減りました。', zh: '不是事变多了，是恢复变少了。', fr: "Le travail n'a pas augmenté : le repos a diminué.", es: 'No creció el trabajo: se encogió tu descanso.', t: 'down' },
  { ko: '책임지지 않는 사람의 의견이 가장 큽니다.', en: "The loudest opinion comes from whoever won't carry the outcome.", ja: '責任を負わない人の意見が一番大きい。', zh: '不担责的人声音最大。', fr: "L'avis le plus fort vient de qui ne portera rien.", es: 'La opinión más alta viene de quien no cargará nada.', t: 'down' },
  { ko: '한 번 더 확인하면 될 일을 감으로 넘기고 있습니다.', en: "You're going on instinct where one more check would do.", ja: 'もう一度確認すれば済む事を勘で流しています。', zh: '本可再核一次的事，你在凭感觉过。', fr: "Vous jouez à l'instinct là où une vérif suffirait.", es: 'Vas por instinto donde bastaría comprobar otra vez.', t: 'down' },
  { ko: '잘 지내는 척하는 비용이 커지고 있습니다.', en: "The cost of pretending you're fine is rising.", ja: '平気なふりの代償が大きくなっています。', zh: '假装无事的代价正在变大。', fr: 'Le coût de faire bonne figure augmente.', es: 'El coste de fingir que estás bien sube.', t: 'down' },
  { ko: '잘 안 되던 조합이 오늘은 맞아떨어집니다.', en: 'A combination that kept failing clicks today.', ja: '噛み合わなかった組み合わせが今日は合います。', zh: '一直不合的组合，今天对上了。', fr: "Une combinaison qui coinçait s'emboîte aujourd'hui.", es: 'Una combinación que fallaba hoy encaja.', t: 'up' },
  { ko: '애써 만든 자리가 이제야 제 역할을 합니다.', en: 'A place you worked to build finally does its job.', ja: '作り上げた場がようやく機能します。', zh: '辛苦搭起的位置终于起作用了。', fr: 'Un espace bâti à la peine remplit enfin son rôle.', es: 'Un lugar que costó construir por fin cumple.', t: 'up' },
  { ko: '주저하던 한 걸음이 생각보다 가볍습니다.', en: 'The step you hesitated over is lighter than expected.', ja: 'ためらった一歩が思ったより軽い。', zh: '犹豫的那一步比想的轻。', fr: 'Le pas hésitant est plus léger que prévu.', es: 'El paso que dudabas pesa menos de lo esperado.', t: 'up' },
  { ko: '바깥의 인정보다 스스로의 확신이 먼저 옵니다.', en: 'Your own certainty arrives before outside approval.', ja: '外の評価より自分の確信が先に来ます。', zh: '自我笃定先于外界认可到来。', fr: 'Votre certitude précède la reconnaissance extérieure.', es: 'Tu certeza llega antes que el reconocimiento ajeno.', t: 'up' },
  { ko: '느슨해 보이던 계획이 오히려 잘 굴러갑니다.', en: 'A plan that looked loose rolls along better for it.', ja: '緩く見えた計画がむしろ回ります。', zh: '看似松散的计划反而运转得好。', fr: "Un plan qui semblait lâche tourne d'autant mieux.", es: 'Un plan que parecía flojo rueda mejor así.', t: 'up' },
  { ko: '한때 손해로 보였던 선택의 값이 드러납니다.', en: 'A choice that looked like a loss shows its worth.', ja: '損に見えた選択の価値が現れます。', zh: '当初看似吃亏的选择显出了价值。', fr: 'Un choix qui semblait perdant révèle sa valeur.', es: 'Una elección que parecía pérdida muestra su valor.', t: 'up' },
  { ko: '말이 통하는 사람을 한 명 더 알게 됩니다.', en: 'You gain one more person you can actually talk to.', ja: '話の通じる人が一人増えます。', zh: '你会多认识一个说得通的人。', fr: 'Vous gagnez une personne de plus avec qui parler vrai.', es: 'Ganas una persona más con quien hablar de verdad.', t: 'up' },
  { ko: '고집스럽게 지킨 습관이 성과로 나타납니다.', en: 'A habit you kept stubbornly shows up as a result.', ja: '頑固に守った習慣が成果になります。', zh: '固执坚持的习惯化为成果。', fr: 'Une habitude tenue obstinément devient résultat.', es: 'Un hábito mantenido con terquedad se vuelve resultado.', t: 'up' },
  { ko: '계획에 없던 시간이 선물처럼 생깁니다.', en: 'Unplanned time arrives like a gift.', ja: '予定になかった時間が贈り物のように来ます。', zh: '计划外的时间像礼物般出现。', fr: 'Du temps non prévu arrive comme un cadeau.', es: 'Aparece tiempo no planeado, como un regalo.', t: 'up' },
  { ko: '누군가의 신뢰가 조건 없이 건네집니다.', en: "Someone's trust is handed over without conditions.", ja: '誰かの信頼が条件なしに渡されます。', zh: '有人无条件地把信任交给你。', fr: "La confiance de quelqu'un vous est donnée sans condition.", es: 'Alguien te entrega su confianza sin condiciones.', t: 'up' },
  { ko: '정리한 자리에 뜻밖의 여유가 남습니다.', en: 'Where you tidied, unexpected room is left over.', ja: '片づけた所に思わぬ余裕が残ります。', zh: '整理过的地方留下了意外的余裕。', fr: 'Là où vous avez rangé, il reste une aisance inattendue.', es: 'Donde ordenaste queda una holgura inesperada.', t: 'up' },
  { ko: '돌려받을 생각 없이 준 것이 돌아옵니다.', en: 'What you gave without expecting return comes back.', ja: '見返りなく渡した物が戻ります。', zh: '不求回报给出的东西回来了。', fr: 'Ce que vous avez donné sans attente revient.', es: 'Lo que diste sin esperar vuelve.', t: 'up' },
  { ko: '어렵게 배운 것이 남을 돕는 데 쓰입니다.', en: 'What you learned the hard way goes to helping someone.', ja: '苦労して学んだ事が人を助けます。', zh: '辛苦学来的东西用在了帮人上。', fr: 'Ce qui vous a coûté à apprendre sert à aider.', es: 'Lo que aprendiste con esfuerzo sirve para ayudar.', t: 'up' },
  { ko: '기다린 보람이 눈에 보이는 형태로 옵니다.', en: 'The waiting pays off in something you can see.', ja: '待った甲斐が目に見える形で来ます。', zh: '等待的回报以看得见的形式到来。', fr: "L'attente porte un fruit visible.", es: 'La espera da un fruto visible.', t: 'up' },
  { ko: '혼자라고 느꼈던 자리에 사람이 들어옵니다.', en: 'Someone steps into a place where you felt alone.', ja: '一人だと感じた場に人が入ります。', zh: '你觉得孤单的位置有人走进来。', fr: "Quelqu'un entre là où vous vous sentiez seul.", es: 'Alguien entra donde te sentías solo.', t: 'up' },
  { ko: '작은 인정이 오래 미룬 결심을 밀어줍니다.', en: 'A small acknowledgment pushes a long-delayed decision.', ja: '小さな認めが先送りの決心を後押しします。', zh: '一点认可推动了久拖的决心。', fr: 'Une petite reconnaissance décide ce que vous repoussiez.', es: 'Un pequeño reconocimiento empuja la decisión aplazada.', t: 'up' },
  { ko: '불편했던 관계에서 먼저 손이 옵니다.', en: 'A hand comes first from a relationship that was awkward.', ja: '気まずかった関係から先に手が来ます。', zh: '别扭的关系里，对方先伸了手。', fr: "D'une relation gênée, la main vient d'abord.", es: 'De una relación incómoda, la mano llega primero.', t: 'up' },
  { ko: '정확히 필요한 만큼만 주어지는 날입니다.', en: 'A day when exactly enough is given, no more.', ja: '必要な分だけがきちんと与えられる日です。', zh: '恰好够用的一天。', fr: "Un jour où l'on reçoit exactement ce qu'il faut.", es: 'Un día en que llega justo lo suficiente.', t: 'up' },
  { ko: '오래 붙들던 질문에 잠정적인 답이 생깁니다.', en: "A working answer forms for a question you'd held a long time.", ja: '長く抱えた問いに暫定の答えが出ます。', zh: '久悬的问题有了暂时的答案。', fr: "Une réponse provisoire naît d'une longue question.", es: 'Surge una respuesta provisional a una vieja pregunta.', t: 'up' },
  { ko: '남들이 어렵다고 한 일이 나에게는 맞습니다.', en: 'What others called hard happens to suit you.', ja: '人が難しいと言う事が自分には合います。', zh: '别人说难的事，对你正合适。', fr: "Ce que d'autres jugent dur vous convient.", es: 'Lo que otros llaman difícil te sienta bien.', t: 'up' },
  { ko: '애매하게 끝난 일이 좋은 쪽으로 매듭지어집니다.', en: 'Something left hanging ties off on the good side.', ja: '曖昧に終わった件が良い方に結ばれます。', zh: '悬而未决的事往好的一边收了口。', fr: 'Une affaire en suspens se noue du bon côté.', es: 'Algo que quedó abierto se cierra por el buen lado.', t: 'up' },
  { ko: '무리해서 얻은 것보다 자연히 온 것이 큽니다.', en: 'What came naturally outweighs what you forced.', ja: '無理して得た物より自然に来た物が大きい。', zh: '自然而来的比硬争来的更大。', fr: "Ce qui vient naturellement pèse plus que l'arraché.", es: 'Lo que llegó solo pesa más que lo forzado.', t: 'up' },
  { ko: '잊고 있던 재능이 필요한 자리에 놓입니다.', en: "A forgotten talent lands where it's needed.", ja: '忘れていた才能が必要な場に置かれます。', zh: '被遗忘的才能落到了需要它的地方。', fr: 'Un talent oublié tombe là où il faut.', es: 'Un talento olvidado cae donde hace falta.', t: 'up' },
  { ko: '사람 사이의 오해가 저절로 풀립니다.', en: 'A misunderstanding between people unravels on its own.', ja: '人と人の誤解が自然に解けます。', zh: '人与人的误会自行化解。', fr: 'Un malentendu se dénoue de lui-même.', es: 'Un malentendido se deshace solo.', t: 'up' },
  { ko: '들인 시간이 이제 이자를 붙여 돌아옵니다.', en: 'The time you put in comes back with interest.', ja: 'かけた時間が利息付きで戻ります。', zh: '投入的时间带着利息回来了。', fr: 'Le temps investi revient avec intérêts.', es: 'El tiempo invertido vuelve con intereses.', t: 'up' },
  { ko: '한 번 더 해보자는 마음이 결과를 바꿉니다.', en: 'The willingness to try once more changes the outcome.', ja: 'もう一度という気持ちが結果を変えます。', zh: '再试一次的心改变了结果。', fr: "L'envie d'un essai de plus change l'issue.", es: 'Las ganas de un intento más cambian el desenlace.', t: 'up' },
  { ko: '굳이 설명하지 않아도 통하는 자리가 생깁니다.', en: "A space appears where you don't have to explain.", ja: '説明しなくても通じる場ができます。', zh: '出现了不必解释就能懂的场合。', fr: "Naît un lieu où l'on n'a rien à expliquer.", es: 'Aparece un sitio donde no hace falta explicar.', t: 'up' },
  { ko: '가진 것이 적어도 쓰임새가 분명합니다.', en: 'You may hold little, but its use is clear.', ja: '持ち物は少なくても使い道は明確です。', zh: '拥有的不多，用处却很清楚。', fr: "Vous avez peu, mais l'usage est net.", es: 'Tienes poco, pero su uso es claro.', t: 'up' },
  { ko: '망설이던 지출이 좋은 투자로 판명됩니다.', en: 'A spend you hesitated over proves a good investment.', ja: '迷った出費が良い投資になります。', zh: '犹豫的那笔支出证明是好投资。', fr: "Une dépense hésitante s'avère un bon investissement.", es: 'Un gasto dudado resulta buena inversión.', t: 'up' },
  { ko: '주변이 나를 예상보다 높게 보고 있습니다.', en: 'Those around you rate you higher than you assumed.', ja: '周りは自分を思うより高く見ています。', zh: '周围人对你的评价比你以为的高。', fr: 'Votre entourage vous estime plus que vous ne croyez.', es: 'Tu entorno te valora más de lo que supones.', t: 'up' },
  { ko: '한 사람의 태도가 하루 전체를 밝힙니다.', en: "One person's manner lights the whole day.", ja: '一人の態度が一日を明るくします。', zh: '一个人的态度点亮了一整天。', fr: "L'attitude d'un seul éclaire la journée.", es: 'La actitud de uno ilumina el día entero.', t: 'up' },
  { ko: '멈춰 있던 일이 예고 없이 다시 움직입니다.', en: 'Something stalled starts moving again without warning.', ja: '止まっていた事が予告なく動き出します。', zh: '停滞的事毫无预兆地重新动了。', fr: 'Ce qui stagnait repart sans prévenir.', es: 'Lo detenido se mueve otra vez sin aviso.', t: 'up' },
  { ko: '솔직하게 말한 것이 가장 좋은 전략이었습니다.', en: 'Telling the truth turns out to have been the best strategy.', ja: '正直に言った事が最善の戦略でした。', zh: '如实说，反而是最好的策略。', fr: "Dire vrai s'avère la meilleure stratégie.", es: 'Decir la verdad resultó la mejor estrategia.', t: 'up' },
  { ko: '낯선 제안이 예상보다 나에게 잘 맞습니다.', en: 'An unfamiliar offer fits you better than expected.', ja: '初めての誘いが思いのほか合います。', zh: '陌生的提议比预想更适合你。', fr: 'Une proposition inhabituelle vous va mieux que prévu.', es: 'Una oferta poco común te queda mejor de lo previsto.', t: 'up' },
  { ko: '고요한 하루가 그 자체로 성과인 시기입니다.', en: 'A quiet day is itself the achievement now.', ja: '静かな一日がそれ自体成果である時期です。', zh: '此时，平静的一天本身就是成果。', fr: 'Une journée calme est en soi la réussite.', es: 'Un día tranquilo es en sí el logro.', t: 'up' },
  { ko: '작정하고 쉰 하루가 다음 주를 살립니다.', en: 'A day of deliberate rest saves the week ahead.', ja: '意図して休んだ一日が来週を救います。', zh: '刻意休息的一天救了下一周。', fr: 'Un repos délibéré sauve la semaine à venir.', es: 'Un descanso deliberado salva la semana siguiente.', t: 'up' },
  { ko: '미완성인 채로 내놓아도 반응이 좋습니다.', en: 'Put it out unfinished and it still lands well.', ja: '未完成のまま出しても反応は良いです。', zh: '即便未完成拿出来，反响也不错。', fr: 'Sorti inachevé, cela plaît quand même.', es: 'Aunque lo saques sin terminar, funciona.', t: 'up' },
  { ko: '잘 안 맞던 사람과 뜻밖의 접점이 생깁니다.', en: 'You find unexpected common ground with someone difficult.', ja: '合わなかった人と思わぬ接点ができます。', zh: '与合不来的人有了意外的交集。', fr: 'Un terrain commun surgit avec qui vous heurtait.', es: 'Surge un punto común con quien no encajabas.', t: 'up' },
  { ko: '책임을 나누자 속도가 붙습니다.', en: 'Share the responsibility and the pace picks up.', ja: '責任を分けると速度が出ます。', zh: '责任一分摊，速度就上来了。', fr: "Partagez la charge et le rythme s'accélère.", es: 'Reparte la carga y el ritmo sube.', t: 'up' },
  { ko: '한 번 정리한 원칙이 여러 결정을 대신합니다.', en: 'One principle settled now decides many things later.', ja: '一度定めた原則が多くの判断を代行します。', zh: '定下一条原则，代替了许多决定。', fr: 'Un principe posé une fois tranche bien des cas.', es: 'Un principio fijado decide muchos casos.', t: 'up' },
  { ko: '겉으로 드러나지 않던 노력이 언급됩니다.', en: 'Work that stayed invisible gets mentioned out loud.', ja: '見えなかった努力が口に出されます。', zh: '不为人见的努力被提起了。', fr: 'Un effort resté invisible est enfin nommé.', es: 'Un esfuerzo invisible es por fin mencionado.', t: 'up' },
  { ko: '불필요한 만남을 줄이자 마음이 넉넉해집니다.', en: 'Cut the needless meetings and the mind opens up.', ja: '無駄な会合を減らすと心が広がります。', zh: '减少无谓的见面，心就宽了。', fr: "Réduisez les rendez-vous inutiles : l'esprit s'ouvre.", es: 'Reduce encuentros innecesarios y la mente se ensancha.', t: 'up' },
  { ko: '계획보다 나은 우연이 끼어듭니다.', en: 'A coincidence better than your plan cuts in.', ja: '計画より良い偶然が割り込みます。', zh: '比计划更好的偶然插了进来。', fr: "Un hasard meilleur que le plan s'invite.", es: 'Se cuela una casualidad mejor que el plan.', t: 'up' },
  { ko: '스스로 정한 기준을 처음으로 지켜냅니다.', en: 'For the first time, you hold to a standard you set.', ja: '自分で決めた基準を初めて守り切ります。', zh: '你第一次守住了自己定的标准。', fr: 'Pour la première fois, vous tenez votre propre règle.', es: 'Por primera vez cumples tu propia norma.', t: 'up' },
  { ko: '과거의 나에게 고마워지는 순간이 옵니다.', en: 'A moment arrives when you thank your past self.', ja: '過去の自分に感謝する瞬間が来ます。', zh: '会有感谢过去的自己的一刻。', fr: "Vient l'instant où vous remerciez votre passé.", es: 'Llega el momento de agradecer a tu yo pasado.', t: 'up' },
  { ko: '적게 말하고 많이 얻는 자리가 있습니다.', en: "There's a room where saying less gets you more.", ja: '少なく話して多く得る場があります。', zh: '有个地方，少说反而多得。', fr: 'Il est un lieu où parler moins rapporte plus.', es: 'Hay un sitio donde hablar menos rinde más.', t: 'up' },
  { ko: '고른 길이 맞았다는 신호가 작게 옵니다.', en: 'A small sign confirms you took the right road.', ja: '選んだ道が正しいという小さな合図が来ます。', zh: '会有小小的信号确认你选对了路。', fr: 'Un petit signe confirme votre chemin.', es: 'Una pequeña señal confirma tu camino.', t: 'up' },
  { ko: '남을 돕는 일이 내 문제까지 풀어줍니다.', en: 'Helping someone else also unknots your own problem.', ja: '人を助ける事が自分の問題も解きます。', zh: '帮别人时，自己的问题也解开了。', fr: 'Aider autrui dénoue aussi votre propre nœud.', es: 'Ayudar a otro también desata tu nudo.', t: 'up' },
  { ko: '오래 준비한 말이 마침내 자리를 찾습니다.', en: 'Words long rehearsed finally find their moment.', ja: '長く用意した言葉がやっと場を得ます。', zh: '准备已久的话终于找到了场合。', fr: 'Des mots longtemps préparés trouvent leur moment.', es: 'Palabras largamente ensayadas hallan su momento.', t: 'up' },
  { ko: '무리 없이 거절해도 관계가 상하지 않습니다.', en: 'You can decline cleanly and the bond holds.', ja: '無理なく断っても関係は壊れません。', zh: '干脆拒绝，关系也不会坏。', fr: 'Refusez franchement : le lien tient.', es: 'Puedes negarte con claridad y el vínculo aguanta.', t: 'up' },
  { ko: '잊고 지낸 취미가 다시 힘이 됩니다.', en: "A hobby you'd set aside becomes a source of strength.", ja: '忘れていた趣味が再び力になります。', zh: '被搁下的爱好重新成了力量。', fr: 'Un loisir délaissé redevient une force.', es: 'Una afición dejada vuelve a dar fuerza.', t: 'up' },
  { ko: '몸이 가벼워지면서 판단도 빨라집니다.', en: 'As the body lightens, judgment quickens too.', ja: '体が軽くなると判断も速くなります。', zh: '身体一轻，判断也快了。', fr: "Le corps s'allège et le jugement s'accélère.", es: 'El cuerpo se aligera y el juicio se agiliza.', t: 'up' },
  { ko: '남긴 기록이 나중에 증거가 되어줍니다.', en: 'Notes you kept will serve later as evidence.', ja: '残した記録が後で証拠になります。', zh: '留下的记录日后会成为证据。', fr: 'Vos notes serviront plus tard de preuve.', es: 'Tus notas servirán luego como prueba.', t: 'up' },
  { ko: '작은 사과가 큰 문을 다시 엽니다.', en: 'A small apology reopens a large door.', ja: '小さな謝罪が大きな扉を開き直します。', zh: '一句小小的道歉重开了一扇大门。', fr: 'Une brève excuse rouvre une grande porte.', es: 'Una disculpa breve reabre una puerta grande.', t: 'up' },
  { ko: '나를 잘 아는 사람의 말이 정확히 맞습니다.', en: 'Someone who knows you well is exactly right.', ja: '自分をよく知る人の言葉が的確です。', zh: '了解你的人说得正中。', fr: 'Qui vous connaît bien voit juste.', es: 'Quien te conoce bien acierta de lleno.', t: 'up' },
  { ko: '불안했던 선택이 안정적으로 자리 잡습니다.', en: 'A choice that felt risky settles into place.', ja: '不安だった選択が安定して収まります。', zh: '曾令你不安的选择稳住了。', fr: 'Un choix inquiétant se stabilise.', es: 'Una elección que inquietaba se asienta.', t: 'up' },
  { ko: '주기적으로 하던 일에서 재미를 되찾습니다.', en: 'You rediscover pleasure in a routine task.', ja: '繰り返す作業に楽しさが戻ります。', zh: '你在例行的事里重新找到乐趣。', fr: 'Le plaisir revient dans une tâche routinière.', es: 'Reencuentras el gusto en una tarea rutinaria.', t: 'up' },
  { ko: '좁혀둔 선택지 안에서 답이 분명해집니다.', en: 'Within the options you narrowed, the answer is clear.', ja: '絞った選択肢の中で答えが明確になります。', zh: '在你缩小的选项里，答案清楚了。', fr: 'Parmi les options réduites, la réponse est nette.', es: 'Entre las opciones acotadas, la respuesta es clara.', t: 'up' },
  { ko: '먼저 나서지 않아도 자리가 주어집니다.', en: 'The place is offered without you stepping forward.', ja: '前に出なくても席が与えられます。', zh: '不用主动出头，位置就来了。', fr: 'La place vous revient sans avoir à avancer.', es: 'El lugar te llega sin tener que adelantarte.', t: 'up' },
  { ko: '정직한 실패담이 신뢰를 만듭니다.', en: 'An honest account of failure builds trust.', ja: '正直な失敗談が信頼を作ります。', zh: '坦诚的失败故事换来了信任。', fr: "Un récit d'échec honnête crée la confiance.", es: 'Un relato honesto de fracaso genera confianza.', t: 'up' },
  { ko: '이해받지 못하던 방식이 성과로 증명됩니다.', en: 'A method nobody understood proves itself in results.', ja: '理解されなかった方法が成果で証明されます。', zh: '不被理解的做法用成果证明了自己。', fr: 'Une méthode incomprise se prouve par les résultats.', es: 'Un método incomprendido se prueba con resultados.', t: 'up' },
  { ko: '작게 나눠 놓은 일이 예상보다 빨리 끝납니다.', en: 'Broken into pieces, it finishes sooner than expected.', ja: '小分けした仕事が予想より早く終わります。', zh: '拆小之后，比预想更早完成。', fr: 'Découpé en morceaux, cela finit plus tôt que prévu.', es: 'Troceado, acaba antes de lo previsto.', t: 'up' },
  { ko: '불편한 진실을 말한 뒤 오히려 편해집니다.', en: 'After saying the uncomfortable truth, things get easier.', ja: '不都合な真実を言った後にむしろ楽になります。', zh: '说出不便的真相后，反而轻松了。', fr: "Après la vérité qui dérange, tout s'allège.", es: 'Tras decir la verdad incómoda, todo alivia.', t: 'up' },
  { ko: '누구의 도움도 없이 해낸 일이 자신감이 됩니다.', en: 'Something done entirely alone becomes confidence.', ja: '誰の助けもなく成した事が自信になります。', zh: '独自完成的事变成了底气。', fr: 'Ce que vous avez fait seul devient assurance.', es: 'Lo hecho enteramente solo se vuelve confianza.', t: 'up' },
  { ko: '적당히 하는 법을 배우면서 오래 갑니다.', en: 'Learning to do it well enough is what makes it last.', ja: 'ほどほどを覚える事で長く続きます。', zh: '学会适可而止，才能长久。', fr: "Apprendre le suffisant, c'est durer.", es: 'Aprender el suficiente es lo que hace durar.', t: 'up' },
  { ko: '기대를 낮추자 결과가 좋아집니다.', en: 'Lower the expectation and the result improves.', ja: '期待を下げると結果が良くなります。', zh: '放低期待，结果反而更好。', fr: "Baissez l'attente et le résultat monte.", es: 'Baja la expectativa y el resultado sube.', t: 'up' },
  { ko: '한 통의 연락이 오래 막힌 길을 엽니다.', en: 'A single message opens a road long blocked.', ja: '一本の連絡が塞がった道を開きます。', zh: '一通联络打开了久堵的路。', fr: 'Un seul message ouvre une route bloquée.', es: 'Un solo mensaje abre un camino cerrado.', t: 'up' },
  { ko: '어제보다 오늘의 나를 조금 더 좋아하게 됩니다.', en: "You like today's version of yourself a little more.", ja: '昨日より今日の自分を少し好きになれます。', zh: '比起昨天，你更喜欢今天的自己一点。', fr: "Vous aimez un peu plus le vous d'aujourd'hui.", es: 'Te gustas un poco más que ayer.', t: 'up' },
  { ko: '이만하면 됐다는 감각과 더 할 수 있다는 감각이 겹칩니다.', en: "Enough and there's more in me arrive together.", ja: 'これで十分ともっとできるが重なります。', zh: '够了与还能再来，两种感觉重叠。', fr: 'Assez et je peux encore se superposent.', es: 'Ya basta y aún puedo se solapan.', t: 'flat' },
  { ko: '바뀐 환경에 몸이 아직 따라오지 않았습니다.', en: "Your body hasn't caught up with the changed setting.", ja: '変わった環境に体がまだ追いついていません。', zh: '身体还没跟上变化的环境。', fr: "Votre corps n'a pas encore rattrapé le changement.", es: 'Tu cuerpo aún no alcanza el cambio.', t: 'flat' },
  { ko: '좋고 나쁨을 판단하기엔 정보가 반쯤 왔습니다.', en: 'Only half the information has arrived; verdicts can wait.', ja: '良し悪しを決めるには情報が半分です。', zh: '判断好坏的信息只到了一半。', fr: "L'information n'est qu'à moitié là ; le verdict attend.", es: 'La información llegó a medias; el veredicto espera.', t: 'flat' },
  { ko: '어느 쪽을 골라도 잃는 것이 있습니다.', en: 'Either way you choose, something is lost.', ja: 'どちらを選んでも失う物があります。', zh: '无论选哪边都有失去。', fr: 'Quel que soit le choix, quelque chose se perd.', es: 'Elijas lo que elijas, algo se pierde.', t: 'flat' },
  { ko: '남이 정해준 속도로 걷고 있는 구간입니다.', en: "A stretch where you're walking at someone else's pace.", ja: '人が決めた速度で歩いている区間です。', zh: '这一段你在按别人的速度走。', fr: "Un tronçon parcouru au rythme d'un autre.", es: 'Un tramo caminado al ritmo de otro.', t: 'flat' },
  { ko: '아직 말할 단계가 아닌 이야기가 안에 있습니다.', en: "There's a story inside you that isn't ready to be told.", ja: 'まだ話す段階でない話が中にあります。', zh: '心里有个还不到说的时候的故事。', fr: "Une histoire en vous n'est pas mûre pour être dite.", es: 'Hay dentro una historia que aún no toca contar.', t: 'flat' },
  { ko: '잘하는 것과 하고 싶은 것이 갈라져 보입니다.', en: "What you're good at and what you want look like two roads.", ja: '得意な事とやりたい事が分かれて見えます。', zh: '擅长的和想做的看起来是两条路。', fr: 'Vos talents et vos envies semblent diverger.', es: 'Lo que sabes y lo que quieres parecen dos rutas.', t: 'flat' },
  { ko: '과정을 즐길 것인지 끝낼 것인지 정해야 합니다.', en: "Decide whether you're enjoying this or finishing it.", ja: '過程を楽しむのか終えるのか決める必要があります。', zh: '要决定是享受过程还是把它结束。', fr: 'Décidez si vous savourez ou si vous terminez.', es: 'Decide si lo disfrutas o lo terminas.', t: 'flat' },
  { ko: '결과가 나오기 전의 시간이 길게 느껴집니다.', en: 'The stretch before the result feels long.', ja: '結果が出るまでの時間が長く感じます。', zh: '出结果前的时间显得漫长。', fr: "L'attente avant le résultat paraît longue.", es: 'La espera antes del resultado se hace larga.', t: 'flat' },
  { ko: '가진 정보로는 아직 그림이 완성되지 않습니다.', en: 'With what you know, the picture is still incomplete.', ja: '持つ情報ではまだ絵が完成しません。', zh: '以现有信息，画面还没成形。', fr: "Avec ce que vous savez, l'image reste incomplète.", es: 'Con lo que sabes, el cuadro sigue incompleto.', t: 'flat' },
  { ko: '좋아하는 마음과 감당할 여력이 다릅니다.', en: 'Wanting it and having room for it are different things.', ja: '好きな気持ちと担える余力は別です。', zh: '喜欢与担得起，是两回事。', fr: 'Aimer et pouvoir porter sont deux choses.', es: 'Querer y poder sostenerlo son cosas distintas.', t: 'flat' },
  { ko: '옆 사람도 나만큼 확신이 없는 상태입니다.', en: 'The person beside you is no more certain than you are.', ja: '隣の人も自分と同じくらい確信がありません。', zh: '旁边的人和你一样没把握。', fr: "Votre voisin n'est pas plus sûr que vous.", es: 'Quien está a tu lado no está más seguro que tú.', t: 'flat' },
  { ko: '바꿀 시점은 맞지만 방향은 아직 흐립니다.', en: 'The timing to change is right; the direction is still hazy.', ja: '変える時期は合っていますが方向はまだ曖昧です。', zh: '该变的时机对了，方向还模糊。', fr: 'Le moment de changer est bon, la direction floue.', es: 'El momento de cambiar es bueno; el rumbo, borroso.', t: 'flat' },
  { ko: '잘 지내는 중인지 버티는 중인지 애매합니다.', en: "Hard to say whether you're doing well or just holding on.", ja: '元気なのか耐えているのか曖昧です。', zh: '说不清是过得好还是在硬撑。', fr: 'Difficile de dire si vous allez bien ou tenez bon.', es: 'Cuesta saber si estás bien o solo aguantando.', t: 'flat' },
  { ko: '일단 멈춰서 지금 위치를 확인할 때입니다.', en: 'Time to stop and check where you actually are.', ja: '一旦止まって現在地を確かめる時です。', zh: '是停下来确认自己位置的时候。', fr: "Le moment d'arrêter pour situer où vous êtes.", es: 'Momento de parar y ubicar dónde estás.', t: 'flat' },
  { ko: '남들과 다른 속도인 것이 문제는 아닙니다.', en: "Being on a different clock than others isn't the problem.", ja: '人と違う速度である事は問題ではありません。', zh: '与别人节奏不同，本身不是问题。', fr: "Aller à un autre rythme n'est pas le problème.", es: 'Ir a otro ritmo no es el problema.', t: 'flat' },
  { ko: '결정을 남에게 넘기고 싶은 마음이 듭니다.', en: 'You feel the pull to hand the decision to someone else.', ja: '決定を人に渡したい気持ちが湧きます。', zh: '你想把决定推给别人。', fr: "L'envie de déléguer la décision monte.", es: 'Te tienta pasarle la decisión a otro.', t: 'flat' },
  { ko: '아직 손대지 않은 쪽에 답이 있을 수 있습니다.', en: "The answer may be on the side you haven't touched.", ja: 'まだ触れていない側に答えがあるかもしれません。', zh: '答案也许在你还没碰的那一侧。', fr: 'La réponse est peut-être du côté non exploré.', es: 'La respuesta quizá esté en el lado no tocado.', t: 'flat' },
  { ko: '잘 되고 있다는 신호와 아니라는 신호가 같이 옵니다.', en: "Signals that it's working and that it isn't arrive together.", ja: '上手くいく合図と行かない合図が同時に来ます。', zh: '顺与不顺的信号同时到来。', fr: 'Les signes du oui et du non arrivent ensemble.', es: 'Llegan a la vez las señales de sí y de no.', t: 'flat' },
  { ko: '과거의 방식으로 지금을 설명하려 하고 있습니다.', en: "You're explaining the present with the old framework.", ja: '過去のやり方で今を説明しようとしています。', zh: '你在用旧办法解释现在。', fr: "Vous expliquez le présent avec l'ancien cadre.", es: 'Explicas el presente con el marco viejo.', t: 'flat' },
  { ko: '무엇을 원하는지보다 무엇이 싫은지가 분명합니다.', en: "What you don't want is clearer than what you do.", ja: '何が欲しいかより何が嫌かが明確です。', zh: '比起想要什么，讨厌什么更清楚。', fr: 'Ce que vous refusez est plus net que ce que vous voulez.', es: 'Lo que rechazas es más claro que lo que quieres.', t: 'flat' },
  { ko: '여기서 더 갈지 돌아설지 반반입니다.', en: 'Going further or turning back sits at fifty-fifty.', ja: '進むか戻るか半々です。', zh: '再走还是折返，五五开。', fr: 'Avancer ou revenir : cinquante-cinquante.', es: 'Seguir o volver: mitad y mitad.', t: 'flat' },
  { ko: '누구의 잘못도 아닌 어긋남이 있습니다.', en: "There's a mismatch that isn't anyone's fault.", ja: '誰のせいでもないすれ違いがあります。', zh: '有一种谁都没错的错位。', fr: 'Un décalage sans coupable existe.', es: 'Hay un desencuentro sin culpables.', t: 'flat' },
  { ko: '변화는 시작됐지만 아직 보이지 않습니다.', en: "The change has begun but isn't visible yet.", ja: '変化は始まっていますがまだ見えません。', zh: '变化已开始，只是还看不见。', fr: 'Le changement a commencé mais reste invisible.', es: 'El cambio empezó pero aún no se ve.', t: 'flat' },
  { ko: '들인 노력과 얻은 결과의 비율을 재보는 중입니다.', en: "You're weighing effort against what it returned.", ja: 'かけた労力と結果の比率を測っています。', zh: '你在衡量投入与所得的比例。', fr: "Vous pesez l'effort contre le rendement.", es: 'Estás pesando esfuerzo contra retorno.', t: 'flat' },
  { ko: '어제의 답이 오늘도 답인지 확실하지 않습니다.', en: "It's unclear whether yesterday's answer still holds.", ja: '昨日の答えが今日も答えか定かでありません。', zh: '昨天的答案今天还成立吗，不确定。', fr: "On ignore si la réponse d'hier tient encore.", es: 'No está claro si la respuesta de ayer aún vale.', t: 'flat' },
  { ko: '적당한 거리를 찾는 데 시간이 걸립니다.', en: 'Finding the right distance takes time.', ja: 'ちょうどよい距離を探すのに時間がかかります。', zh: '找到合适的距离需要时间。', fr: 'Trouver la bonne distance prend du temps.', es: 'Hallar la distancia justa lleva tiempo.', t: 'flat' },
  { ko: '바쁜 것도 한가한 것도 아닌 어중간한 흐름입니다.', en: 'Neither busy nor free — an in-between current.', ja: '忙しくも暇でもない中途半端な流れです。', zh: '不忙也不闲的中间状态。', fr: 'Ni occupé ni libre : un entre-deux.', es: 'Ni ocupado ni libre: un intermedio.', t: 'flat' },
  { ko: '남기고 싶은 것과 버려야 하는 것이 같습니다.', en: 'What you want to keep and what must go are the same thing.', ja: '残したい物と捨てるべき物が同じです。', zh: '想留下的和该丢的是同一件。', fr: "Ce que vous voulez garder est ce qu'il faut lâcher.", es: 'Lo que quieres guardar es lo que debe irse.', t: 'flat' },
  { ko: '지금 느끼는 답답함이 성장의 신호일 수 있습니다.', en: 'The stuffiness you feel may be a growth signal.', ja: '今の息苦しさは成長の合図かもしれません。', zh: '此刻的憋闷也许是成长的信号。', fr: "L'étouffement ressenti est peut-être une croissance.", es: 'La opresión que sientes quizá sea crecimiento.', t: 'flat' },
  { ko: '한쪽이 좋아지면 다른 쪽이 조금 나빠집니다.', en: 'When one side improves, the other dips a little.', ja: '一方が良くなると他方が少し悪くなります。', zh: '一边变好，另一边就稍差。', fr: "Quand un côté monte, l'autre baisse un peu.", es: 'Cuando un lado sube, el otro baja algo.', t: 'flat' },
  { ko: '설명하려 할수록 스스로도 헷갈립니다.', en: 'The more you try to explain it, the less sure you are.', ja: '説明しようとするほど自分も混乱します。', zh: '越想解释，自己越糊涂。', fr: 'Plus vous expliquez, moins vous êtes sûr.', es: 'Cuanto más lo explicas, menos seguro estás.', t: 'flat' },
  { ko: '모두가 아는 사실을 아무도 말하지 않고 있습니다.', en: 'Everyone knows it and nobody is saying it.', ja: '皆が知る事実を誰も言いません。', zh: '人人皆知，却无人说破。', fr: 'Tout le monde le sait, personne ne le dit.', es: 'Todos lo saben y nadie lo dice.', t: 'flat' },
  { ko: '이번엔 결과보다 태도가 기록으로 남습니다.', en: 'This time your manner, not the result, is what gets recorded.', ja: '今回は結果より態度が記録に残ります。', zh: '这一次，留下记录的是态度而非结果。', fr: "Cette fois, c'est l'attitude qui reste, pas le résultat.", es: 'Esta vez queda la actitud, no el resultado.', t: 'flat' },
  { ko: '천천히 가는 것과 멈추는 것 사이에 있습니다.', en: "You're somewhere between going slow and stopping.", ja: 'ゆっくり行くと止まるの間にいます。', zh: '你处在慢行与停下之间。', fr: 'Vous êtes entre ralentir et vous arrêter.', es: 'Estás entre ir despacio y detenerte.', t: 'flat' },
  { ko: '아직 정해지지 않은 것이 불안이 아니라 여지입니다.', en: "What's undecided is not anxiety but room.", ja: '未定である事は不安でなく余地です。', zh: '尚未定下的不是不安，是余地。', fr: "L'indécis n'est pas de l'angoisse mais de la marge.", es: 'Lo indeciso no es angustia sino margen.', t: 'flat' },
  { ko: '애쓸수록 상황이 더 엉키는 구간입니다.', en: 'A stretch where trying harder tangles it further.', ja: '頑張るほど絡まる区間です。', zh: '越使劲越乱的一段。', fr: "Plus vous forcez, plus cela s'emmêle.", es: 'Cuanto más fuerzas, más se enreda.', t: 'down' },
  { ko: '아무도 부탁하지 않은 책임을 지고 있습니다.', en: "You're carrying a responsibility nobody asked you to.", ja: '誰も頼んでいない責任を負っています。', zh: '你在扛没人要求你扛的责任。', fr: "Vous portez une charge que nul n'a demandée.", es: 'Cargas una responsabilidad que nadie pidió.', t: 'down' },
  { ko: '설명을 반복하다 정작 본인이 지칩니다.', en: 'Explaining it over and over is what wears you out.', ja: '説明を繰り返すうちに自分が疲れます。', zh: '反复解释，累的是自己。', fr: "À force d'expliquer, c'est vous qui vous épuisez.", es: 'De tanto explicar, el que se agota eres tú.', t: 'down' },
  { ko: '좋은 소식과 나쁜 소식이 같은 사람에게서 옵니다.', en: 'Good news and bad news come from the same person.', ja: '良い知らせと悪い知らせが同じ人から来ます。', zh: '好消息与坏消息来自同一个人。', fr: 'Bonne et mauvaise nouvelle viennent de la même personne.', es: 'Buena y mala noticia vienen de la misma persona.', t: 'down' },
  { ko: '기대를 접지 못해 계속 마음이 쓰입니다.', en: "You can't let the expectation go, so it keeps costing you.", ja: '期待を畳めず心が消耗します。', zh: '放不下期待，心一直被牵着。', fr: "Vous ne lâchez pas l'attente, et elle vous coûte.", es: 'No sueltas la expectativa y te sigue costando.', t: 'down' },
  { ko: '남의 문제를 내 문제처럼 지고 있습니다.', en: "You're carrying someone's problem as if it were yours.", ja: '他人の問題を自分の物のように背負っています。', zh: '你把别人的问题当成自己的扛。', fr: "Vous portez le problème d'autrui comme le vôtre.", es: 'Cargas el problema ajeno como si fuera tuyo.', t: 'down' },
  { ko: '잘 보이려는 마음이 판단을 무겁게 합니다.', en: 'Wanting to look good is weighing your judgment down.', ja: '良く見られたい気持ちが判断を重くします。', zh: '想被看好的心让判断变沉。', fr: 'Le désir de bien paraître alourdit le jugement.', es: 'Querer quedar bien te lastra el juicio.', t: 'down' },
  { ko: '떠난 것을 아직 보내지 못한 상태입니다.', en: "What's gone hasn't actually been let go of.", ja: '去った物をまだ手放せていません。', zh: '已经离开的，你还没真的放下。', fr: "Ce qui est parti n'est pas encore lâché.", es: 'Lo que se fue aún no lo has soltado.', t: 'down' },
  { ko: '작은 오해가 정정되지 않은 채 굳어갑니다.', en: 'A small misunderstanding is hardening uncorrected.', ja: '小さな誤解が正されないまま固まります。', zh: '小误会未被更正，正在固化。', fr: 'Un petit malentendu se fige sans correction.', es: 'Un malentendido pequeño se endurece sin corregir.', t: 'down' },
  { ko: '주변의 기대에 맞추다 방향을 잃습니다.', en: "Fitting others' expectations is costing you your direction.", ja: '周りの期待に合わせ方向を見失います。', zh: '迎合周围期待，丢了方向。', fr: 'À suivre les attentes, vous perdez votre cap.', es: 'Ajustándote a expectativas pierdes el rumbo.', t: 'down' },
  { ko: '힘든 것을 힘들다고 말하지 않고 있습니다.', en: "You're not saying that it's hard, and it is.", ja: 'つらい事をつらいと言えずにいます。', zh: '难受的事，你没说难受。', fr: "Vous ne dites pas que c'est dur, et ça l'est.", es: 'No dices que cuesta, y cuesta.', t: 'down' },
  { ko: '무엇을 위한 노력인지 흐려진 상태입니다.', en: 'What the effort is for has gone blurry.', ja: '何のための努力か曖昧になっています。', zh: '为了什么而努力，已经模糊了。', fr: "Le but de l'effort s'est brouillé.", es: 'Para qué es el esfuerzo se ha vuelto borroso.', t: 'down' },
  { ko: '정리하지 않은 감정이 다른 일에 새어 나옵니다.', en: 'Unprocessed feeling is leaking into unrelated things.', ja: '整理していない感情が別の事に漏れます。', zh: '没理清的情绪漏到了别的事上。', fr: 'Une émotion non traitée fuit ailleurs.', es: 'Una emoción sin procesar se filtra a otras cosas.', t: 'down' },
  { ko: '빨리 끝내려다 두 번 하게 됩니다.', en: 'Rushing to finish means doing it twice.', ja: '早く終えようとして二度手間になります。', zh: '急着完成，结果做了两遍。', fr: "Vouloir finir vite, c'est le faire deux fois.", es: 'Correr para acabar es hacerlo dos veces.', t: 'down' },
  { ko: '남과 비교하며 자기 몫을 작게 세고 있습니다.', en: "Comparing, you're counting your own share too small.", ja: '比べる事で自分の分を小さく数えています。', zh: '一比较，就把自己那份数小了。', fr: 'À force de comparer, vous minimisez votre part.', es: 'Comparando, cuentas tu parte demasiado pequeña.', t: 'down' },
  { ko: '거절하지 못한 일이 다른 약속을 밀어냅니다.', en: "What you couldn't refuse is pushing out other commitments.", ja: '断れなかった事が他の約束を押し出します。', zh: '没能拒绝的事挤掉了别的约定。', fr: "Ce que vous n'avez pu refuser chasse le reste.", es: 'Lo que no supiste rechazar desplaza lo demás.', t: 'down' },
  { ko: '좋았던 기억을 기준으로 지금을 낮게 봅니다.', en: 'Measured against a good memory, now looks worse than it is.', ja: '良い記憶を基準に今を低く見ています。', zh: '以美好回忆为尺，把当下看低了。', fr: 'Mesuré à un bon souvenir, le présent semble pauvre.', es: 'Medido contra un buen recuerdo, hoy parece peor.', t: 'down' },
  { ko: '확신 없이 시작한 일이 규모만 커지고 있습니다.', en: 'Something begun without conviction is only growing in size.', ja: '確信なく始めた事が規模だけ大きくなります。', zh: '没把握就开始的事，只在变大。', fr: 'Commencé sans conviction, cela ne fait que grossir.', es: 'Empezado sin convicción, solo crece de tamaño.', t: 'down' },
  { ko: '혼자 있는 시간이 회복이 아니라 도피가 됩니다.', en: 'Time alone has turned from recovery into escape.', ja: '一人の時間が回復でなく逃避になっています。', zh: '独处从恢复变成了逃避。', fr: 'Le temps seul est devenu fuite, plus repos.', es: 'El tiempo a solas pasó de descanso a huida.', t: 'down' },
  { ko: '고맙다는 말을 들을 자리에서 사과를 하고 있습니다.', en: "You're apologising where you should be thanked.", ja: '感謝される場で謝っています。', zh: '本该被道谢的场合，你却在道歉。', fr: "Vous vous excusez là où l'on devrait vous remercier.", es: 'Te disculpas donde deberían agradecerte.', t: 'down' },
  { ko: '한 사람의 말에 하루를 통째로 내주고 있습니다.', en: "One person's remark is taking your whole day.", ja: '一人の言葉に一日を明け渡しています。', zh: '一句话夺走了你一整天。', fr: "La phrase d'un seul vous prend la journée.", es: 'El comentario de uno se lleva tu día entero.', t: 'down' },
  { ko: '잘 되던 흐름이 욕심으로 끊깁니다.', en: 'A good run breaks on wanting more.', ja: '順調な流れが欲で切れます。', zh: '顺流因贪心而断。', fr: "Un bon élan se casse sur l'avidité.", es: 'Una buena racha se rompe por querer más.', t: 'down' },
  { ko: '보류가 길어져 선택지가 스스로 줄어듭니다.', en: 'Deferred too long, the options are shrinking by themselves.', ja: '保留が長引き選択肢が自ら減ります。', zh: '搁置太久，选项自行减少。', fr: "À force d'attendre, les options se ferment seules.", es: 'De tanto aplazar, las opciones se cierran solas.', t: 'down' },
  { ko: '남에게 관대하다는 평이 자기 착취를 가립니다.', en: 'Being known as generous is hiding how you overspend yourself.', ja: '寛大という評判が自己搾取を覆います。', zh: '宽厚的名声掩盖了自我压榨。', fr: 'La réputation de générosité masque votre épuisement.', es: 'La fama de generoso tapa cómo te explotas.', t: 'down' },
  { ko: '작은 통증과 작은 불만을 같은 서랍에 넣고 있습니다.', en: 'Small pains and small grievances go into the same drawer.', ja: '小さな痛みと不満を同じ引き出しに入れています。', zh: '小疼与小怨被放进了同一个抽屉。', fr: 'Douleurs et griefs finissent dans le même tiroir.', es: 'Dolores y quejas van al mismo cajón.', t: 'down' },
  { ko: '과정을 건너뛰고 결과만 원하는 마음이 큽니다.', en: 'The urge to skip the process and take the result is strong.', ja: '過程を飛ばし結果だけ欲しい気持ちが強い。', zh: '想跳过过程直取结果的念头很强。', fr: "L'envie de sauter le processus est forte.", es: 'Fuertes ganas de saltarse el proceso.', t: 'down' },
  { ko: '확인받고 싶은 마음이 판을 키우고 있습니다.', en: "Wanting reassurance is what's inflating this.", ja: '認められたい気持ちが事を大きくしています。', zh: '想被确认的心把事情搞大了。', fr: "Le besoin d'être rassuré grossit l'affaire.", es: 'La necesidad de validación lo está agrandando.', t: 'down' },
  { ko: '아직 준비되지 않았다는 말이 습관이 되었습니다.', en: 'Not ready yet has become a habit rather than a fact.', ja: 'まだ準備ができていないが口癖になりました。', zh: '还没准备好已成口头禅。', fr: 'Pas encore prêt est devenu une habitude.', es: 'Aún no estoy listo se volvió costumbre.', t: 'down' },
  { ko: '서로 다른 것을 같은 이름으로 부르고 있습니다.', en: 'Two different things are going by the same name.', ja: '違う物を同じ名で呼んでいます。', zh: '两件不同的事被叫成同一个名字。', fr: 'Deux choses distinctes portent le même nom.', es: 'Dos cosas distintas llevan el mismo nombre.', t: 'down' },
  { ko: '힘이 남았을 때 쉬지 않아 지금 비어 있습니다.', en: "You didn't rest while you had energy, so now there is none.", ja: '余力のある時に休まず今は空です。', zh: '有力气时没休息，如今空了。', fr: "Vous n'avez pas reposé à temps : la réserve est vide.", es: 'No descansaste con fuerzas y ahora no queda.', t: 'down' },
  { ko: '옳음을 증명하려다 관계를 쓰고 있습니다.', en: "Proving you're right is spending the relationship.", ja: '正しさを証明しようと関係を消費しています。', zh: '为证明正确，正在消耗关系。', fr: 'Prouver que vous avez raison dépense la relation.', es: 'Probar que tienes razón gasta el vínculo.', t: 'down' },
  { ko: '바꿀 수 없는 것에 오늘의 힘을 쓰고 있습니다.', en: "Today's energy is going to what cannot be changed.", ja: '変えられない事に今日の力を使っています。', zh: '今天的力气花在了改不了的事上。', fr: "L'énergie du jour part dans l'immuable.", es: 'La energía de hoy se va en lo inmutable.', t: 'down' },
  { ko: '애초에 원하지 않던 자리를 지키느라 힘이 듭니다.', en: "Holding a place you never wanted is what's draining you.", ja: '元々望まなかった場所を守る事に力を使っています。', zh: '守着本就不想要的位置，很耗力。', fr: 'Tenir une place non désirée vous épuise.', es: 'Sostener un lugar que no querías te agota.', t: 'down' },
  { ko: '서둘러 봉합한 자리가 다시 벌어집니다.', en: 'A seam you closed too fast is opening again.', ja: '急いで縫った所がまた開きます。', zh: '匆匆缝合的地方又裂开了。', fr: 'Une couture faite trop vite se rouvre.', es: 'Una costura hecha deprisa se vuelve a abrir.', t: 'down' },
  { ko: '남의 인정으로 하루의 값을 매기고 있습니다.', en: "You're pricing your day by someone else's approval.", ja: '人の承認で一日の値を決めています。', zh: '你在用别人的认可给一天定价。', fr: "Vous évaluez votre journée à l'approbation d'autrui.", es: 'Tasas tu día con la aprobación ajena.', t: 'down' },
  { ko: '모르는 척하는 것이 편해서 계속 모르는 척합니다.', en: 'Pretending not to know is easy, so you keep pretending.', ja: '知らないふりが楽で続けています。', zh: '装不知道很省事，于是继续装。', fr: "Faire l'ignorant est confortable, alors vous continuez.", es: 'Hacerte el desentendido es cómodo, y sigues.', t: 'down' },
  { ko: '정성을 들인 만큼 돌려받기를 기대하고 있습니다.', en: "You're expecting a return proportional to the care you gave.", ja: 'かけた分だけ返ってくる事を期待しています。', zh: '你在期待付出多少就回来多少。', fr: 'Vous attendez un retour à la mesure de vos soins.', es: 'Esperas retorno a la medida de tu esmero.', t: 'down' },
  { ko: '어제의 말을 오늘 주워 담느라 시간이 갑니다.', en: 'The day goes to walking back what you said yesterday.', ja: '昨日の言葉を今日拾い集めて時間が過ぎます。', zh: '一天都在收回昨天说的话。', fr: "La journée passe à rattraper les mots d'hier.", es: 'El día se va recogiendo lo que dijiste ayer.', t: 'down' },
  { ko: '잘 안 되는 이유를 밖에서만 찾고 있습니다.', en: "You're looking for the reason only outside yourself.", ja: '上手くいかない理由を外にだけ探しています。', zh: '你只在外面找不顺的理由。', fr: 'Vous cherchez la cause uniquement au-dehors.', es: 'Buscas la causa solo fuera de ti.', t: 'down' },
  { ko: '혼자 결정하고 혼자 서운해하는 구조가 반복됩니다.', en: 'Deciding alone then feeling hurt alone keeps repeating.', ja: '一人で決め一人で寂しくなる形が繰り返されます。', zh: '独自决定又独自委屈的循环在重复。', fr: 'Décider seul puis se vexer seul se répète.', es: 'Decidir solo y dolerte solo se repite.', t: 'down' },
  { ko: '계속 미루면 선택은 사라지고 결과만 남습니다.', en: 'Postpone long enough and only the outcome remains, not the choice.', ja: '先送りを続けると選択は消え結果だけ残ります。', zh: '一直拖，选择会消失，只剩结果。', fr: 'À trop repousser, il ne reste que le résultat.', es: 'De tanto aplazar solo queda el resultado.', t: 'down' },
  { ko: '작은 승리에 취해 다음 수를 놓치고 있습니다.', en: 'A small win is costing you the next move.', ja: '小さな勝利に酔い次の一手を逃しています。', zh: '被小胜冲昏，错过了下一步。', fr: 'Grisé par une petite victoire, vous ratez le coup suivant.', es: 'Ebrio de una victoria pequeña, pierdes la siguiente jugada.', t: 'down' },
  { ko: '말하지 않은 기대가 상대에게 실망으로 돌아옵니다.', en: 'An unspoken expectation returns to them as disappointment.', ja: '伝えない期待が相手には失望として返ります。', zh: '没说出口的期待，变成对方的失望回来。', fr: "Une attente tue revient à l'autre en déception.", es: 'Una expectativa callada le vuelve al otro como decepción.', t: 'down' },
  { ko: '잃을 것을 세느라 얻을 것을 못 보고 있습니다.', en: "Counting what you'd lose is blinding you to what you'd gain.", ja: '失う物を数え得る物が見えません。', zh: '忙着数会失去的，看不见会得到的。', fr: 'À compter les pertes, vous ne voyez plus les gains.', es: 'Contando pérdidas, no ves las ganancias.', t: 'down' },
  { ko: '남이 만든 기한에 내 리듬을 억지로 맞추고 있습니다.', en: "You're forcing your rhythm into someone else's deadline.", ja: '人の期限に自分のリズムを無理に合わせています。', zh: '你在硬把节奏塞进别人的期限。', fr: "Vous forcez votre rythme dans le délai d'un autre.", es: 'Fuerzas tu ritmo dentro del plazo de otro.', t: 'down' },
  { ko: '좋은 사람으로 남으려다 필요한 경계를 놓칩니다.', en: 'Staying the good one costs you a boundary you needed.', ja: 'いい人でいようとして必要な境界を失います。', zh: '为了当好人，丢了该有的界限。', fr: 'Rester le gentil vous coûte une limite nécessaire.', es: 'Seguir siendo el bueno te cuesta un límite.', t: 'down' },
  { ko: '확신에 찬 목소리가 정확한 정보를 덮고 있습니다.', en: 'A confident voice is drowning out accurate information.', ja: '自信ある声が正確な情報を覆っています。', zh: '自信的声音盖过了准确的信息。', fr: "Une voix assurée couvre l'information juste.", es: 'Una voz segura tapa la información correcta.', t: 'down' },
  { ko: '무리한 약속을 지키느라 정작 중요한 일이 밀립니다.', en: 'Keeping an overreaching promise pushes back what matters.', ja: '無理な約束を守り大事な事が後回しになります。', zh: '为守勉强的承诺，要紧事被挤后。', fr: "Tenir une promesse excessive relègue l'essentiel.", es: 'Cumplir una promesa excesiva desplaza lo importante.', t: 'down' },
  { ko: '설명할 자리가 아닌 곳에서 설명하고 있습니다.', en: "You're explaining in a room that isn't for explaining.", ja: '説明する場でない所で説明しています。', zh: '你在不该解释的场合解释。', fr: "Vous expliquez là où ce n'est pas le lieu.", es: 'Explicas donde no toca explicar.', t: 'down' },
  { ko: '잠깐의 인정이 긴 피로로 계산되고 있습니다.', en: 'A moment of recognition is being paid for with long fatigue.', ja: '一瞬の承認が長い疲れで支払われています。', zh: '一瞬的认可，用长久的疲惫在偿付。', fr: 'Un instant de reconnaissance se paie en longue fatigue.', es: 'Un instante de reconocimiento se paga con fatiga larga.', t: 'down' },
  { ko: '자기 몫이 아닌 감정까지 대신 느끼고 있습니다.', en: "You're feeling emotions that were never yours to carry.", ja: '自分の物でない感情まで代わりに感じています。', zh: '连不属于你的情绪也替人感受着。', fr: 'Vous ressentez des émotions qui ne vous reviennent pas.', es: 'Sientes emociones que no te tocaba cargar.', t: 'down' },
  { ko: '이미 답을 알면서 다른 답을 기다리고 있습니다.', en: 'You already know the answer and are waiting for another one.', ja: '答えを知りながら別の答えを待っています。', zh: '你已知答案，却在等另一个答案。', fr: 'Vous savez déjà et attendez une autre réponse.', es: 'Ya sabes la respuesta y esperas otra.', t: 'down' },
  { ko: '지금의 어려움을 성격 탓으로 돌리고 있습니다.', en: "You're blaming your character for a situational problem.", ja: '今の困難を性格のせいにしています。', zh: '你在把眼下的难处归咎于性格。', fr: 'Vous imputez au caractère une difficulté de situation.', es: 'Culpas a tu carácter de un problema de situación.', t: 'down' },
  { ko: '도움을 받은 뒤의 부담이 관계를 밀어냅니다.', en: 'The weight of having been helped is pushing the bond away.', ja: '助けられた後の負担が関係を遠ざけます。', zh: '受助后的负担正在推开关系。', fr: "Le poids d'avoir été aidé éloigne le lien.", es: 'El peso de haber sido ayudado aleja el vínculo.', t: 'down' },
  { ko: '완벽한 시작을 기다리다 계절이 지납니다.', en: 'Waiting for a perfect start, the season passes.', ja: '完璧な始まりを待つ間に季節が過ぎます。', zh: '等一个完美的开始，季节就过去了。', fr: 'À attendre le départ parfait, la saison passe.', es: 'Esperando el inicio perfecto, pasa la estación.', t: 'down' },
  { ko: '정리되지 않은 관계가 새로운 만남을 막습니다.', en: 'An unresolved relationship is blocking a new one.', ja: '整理されない関係が新しい出会いを塞ぎます。', zh: '未了的关系挡住了新的相遇。', fr: 'Une relation non close barre la suivante.', es: 'Una relación sin cerrar bloquea la siguiente.', t: 'down' },
  { ko: '남의 위기를 내 일정보다 앞에 두고 있습니다.', en: "Someone's crisis keeps outranking your own schedule.", ja: '人の危機を自分の予定より前に置いています。', zh: '你把别人的急事排在自己日程前面。', fr: "La crise d'autrui passe avant votre agenda.", es: 'La crisis ajena va antes que tu agenda.', t: 'down' },
  { ko: '잘하고 싶은 마음이 시작 자체를 막습니다.', en: 'Wanting to do it well is what stops you starting.', ja: '上手くやりたい気持ちが着手を妨げます。', zh: '想做好的心，阻住了开始。', fr: 'Vouloir bien faire empêche de commencer.', es: 'Querer hacerlo bien impide empezar.', t: 'down' },
  { ko: '한 번의 예외가 이미 두 번째를 부르고 있습니다.', en: 'One exception is already calling for a second.', ja: '一度の例外が既に二度目を呼んでいます。', zh: '一次破例已在召唤第二次。', fr: 'Une exception en appelle déjà une seconde.', es: 'Una excepción ya está llamando a la segunda.', t: 'down' },
  { ko: '감정을 아낀 자리에 오해가 채워집니다.', en: 'Where you withheld feeling, misunderstanding fills in.', ja: '感情を惜しんだ所に誤解が満ちます。', zh: '省下情绪的地方，被误会填满。', fr: "Là où vous avez retenu l'émotion, le malentendu s'installe.", es: 'Donde guardaste la emoción entra el malentendido.', t: 'down' },
  { ko: '힘든 티를 안 내다 도움을 놓치고 있습니다.', en: 'Hiding the strain is costing you the help.', ja: 'つらさを隠して助けを逃しています。', zh: '不露难色，也就错过了帮助。', fr: "Cacher l'effort vous prive de l'aide.", es: 'Ocultar el esfuerzo te quita la ayuda.', t: 'down' },
  { ko: '늘 하던 대로가 이번에는 통하지 않습니다.', en: "The usual way isn't going to work this time.", ja: 'いつも通りが今回は通じません。', zh: '一贯的做法这次行不通。', fr: 'La méthode habituelle ne passera pas cette fois.', es: 'Lo de siempre esta vez no funciona.', t: 'down' },
  { ko: '아끼는 마음이 통제로 보이고 있습니다.', en: 'Care is reading as control from the other side.', ja: '大切に思う気持ちが支配に見えています。', zh: '珍视之心，看起来像控制。', fr: 'Votre attention est perçue comme du contrôle.', es: 'Tu cuidado se lee como control.', t: 'down' },
  { ko: '작아 보이는 손해가 실은 반복되는 손해입니다.', en: 'A loss that looks small is a loss that repeats.', ja: '小さく見える損は繰り返す損です。', zh: '看似小的损失，其实在反复。', fr: 'Une perte qui semble petite est une perte répétée.', es: 'Una pérdida que parece pequeña se repite.', t: 'down' },
  { ko: '모두를 이해하려다 아무 편도 되지 못합니다.', en: "Understanding everyone leaves you on no one's side.", ja: '皆を理解しようとして誰の側にも立てません。', zh: '想理解所有人，结果谁的边都没站。', fr: "À vouloir comprendre tous, vous n'êtes d'aucun côté.", es: 'Queriendo entender a todos, no estás con nadie.', t: 'down' },
  { ko: '기대를 낮추라는 말이 위로가 되지 않습니다.', en: 'Lower your expectations is not landing as comfort.', ja: '期待を下げろという言葉は慰めになりません。', zh: '降低期待这话，安慰不了你。', fr: 'Baissez vos attentes ne console pas ici.', es: 'Baja tus expectativas no consuela aquí.', t: 'down' },
  { ko: '오래 참은 사람이 먼저 미안해하고 있습니다.', en: 'The one who endured longest is the one apologising.', ja: '一番我慢した人が先に謝っています。', zh: '忍得最久的人先道了歉。', fr: "Celui qui a le plus enduré s'excuse en premier.", es: 'Quien más aguantó es quien pide perdón.', t: 'down' },
  { ko: '결정을 미룬 대가를 지금 나눠 내고 있습니다.', en: "You're paying, in instalments, for a deferred decision.", ja: '先送りした決定の代償を分割で払っています。', zh: '你在分期偿付拖延决定的代价。', fr: 'Vous payez en plusieurs fois une décision différée.', es: 'Pagas a plazos una decisión aplazada.', t: 'down' },
  { ko: '계획이 아니라 불안이 오늘을 움직이고 있습니다.', en: 'Anxiety, not the plan, is driving today.', ja: '計画でなく不安が今日を動かしています。', zh: '推动今天的不是计划，是不安。', fr: "C'est l'angoisse, pas le plan, qui mène la journée.", es: 'Mueve tu día la ansiedad, no el plan.', t: 'down' },
  { ko: '좋았던 시절과 지금을 같은 자로 재고 있습니다.', en: "You're measuring now with the ruler of a better time.", ja: '良かった頃と今を同じ物差しで測っています。', zh: '你在用好时候的尺子量现在。', fr: "Vous mesurez le présent à l'aune du bon vieux temps.", es: 'Mides el ahora con la vara de otros tiempos.', t: 'down' },
  { ko: '들어주는 역할만 계속 맡고 있습니다.', en: 'You keep getting cast as the one who listens.', ja: '聞き役ばかり続けています。', zh: '你一直只当听众。', fr: "On vous cantonne au rôle d'écoutant.", es: 'Te toca siempre el papel de quien escucha.', t: 'down' },
  { ko: '성과가 없어서가 아니라 말하지 않아서 안 보입니다.', en: "It's unseen not for lack of results but for lack of saying so.", ja: '成果がないのでなく言わないから見えません。', zh: '不是没成果，是没说，所以没被看见。', fr: "Ce n'est pas l'absence de résultat, mais de parole.", es: 'No falta resultado: falta decirlo.', t: 'down' },
  { ko: '한 사람을 위해 여러 사람과 멀어지고 있습니다.', en: "For one person, you're drifting from several.", ja: '一人のために多くの人と遠ざかっています。', zh: '为了一个人，正在疏远许多人。', fr: 'Pour une personne, vous vous éloignez de plusieurs.', es: 'Por una persona, te alejas de varias.', t: 'down' },
  { ko: '이미 지난 일에 오늘의 힘을 빌려주고 있습니다.', en: "You're lending today's strength to something already over.", ja: '終わった事に今日の力を貸しています。', zh: '你把今天的力气借给了已过去的事。', fr: 'Vous prêtez la force du jour à ce qui est passé.', es: 'Prestas la fuerza de hoy a lo ya pasado.', t: 'down' },
  { ko: '바쁘다는 말이 대화를 대신하고 있습니다.', en: "I'm busy has started standing in for conversation.", ja: '忙しいが会話の代わりになっています。', zh: '我很忙已经替代了对话。', fr: 'Je suis occupé remplace désormais la conversation.', es: 'Estoy ocupado ya sustituye a la conversación.', t: 'down' },
  { ko: '고쳐야 할 것과 견뎌야 할 것을 섞고 있습니다.', en: "You're mixing what to fix with what to endure.", ja: '直す事と耐える事を混ぜています。', zh: '该修的和该忍的，你混在一起了。', fr: "Vous mêlez ce qu'il faut corriger et endurer.", es: 'Mezclas lo que hay que arreglar con lo que aguantar.', t: 'down' },
  { ko: '아무도 요구하지 않은 완성도를 좇고 있습니다.', en: "You're chasing a standard nobody asked for.", ja: '誰も求めていない完成度を追っています。', zh: '你在追一个没人要求的完成度。', fr: "Vous poursuivez une exigence que nul n'a posée.", es: 'Persigues un acabado que nadie pidió.', t: 'down' },
  { ko: '떠나야 할 때를 아는 것도 능력입니다.', en: "Knowing when to leave is also a skill, and it's needed now.", ja: '去る時を知る事も能力です。', zh: '懂得何时离开也是一种能力。', fr: 'Savoir quand partir est aussi une compétence.', es: 'Saber cuándo irse también es una destreza.', t: 'down' },
  { ko: '도움을 청할 사람 목록이 계속 짧아지고 있습니다.', en: 'Your list of people to ask keeps getting shorter.', ja: '頼れる人の名簿が短くなり続けています。', zh: '你能求助的名单越来越短。', fr: 'Votre liste de recours ne cesse de raccourcir.', es: 'Tu lista de a quién pedir se acorta.', t: 'down' },
  { ko: '남의 속도를 따라가느라 방향을 확인하지 못합니다.', en: 'Keeping up with others leaves no moment to check the heading.', ja: '人の速度を追い方向を確かめられません。', zh: '忙着追速度，没空确认方向。', fr: 'À suivre les autres, vous ne vérifiez plus le cap.', es: 'Siguiendo el ritmo ajeno, no revisas el rumbo.', t: 'down' },
  { ko: '잘 쉬는 법을 아직 배우지 못했습니다.', en: "You still haven't learned how to rest properly.", ja: '上手な休み方をまだ学んでいません。', zh: '你还没学会好好休息。', fr: "Vous n'avez pas encore appris à vous reposer.", es: 'Todavía no has aprendido a descansar bien.', t: 'down' },
  { ko: '문제를 인정하는 것이 지는 것처럼 느껴집니다.', en: "Admitting the problem feels like losing, and it isn't.", ja: '問題を認める事が負けのように感じます。', zh: '承认问题，感觉像认输。', fr: "Reconnaître le problème donne l'impression de perdre.", es: 'Admitir el problema se siente como perder.', t: 'down' },
  { ko: '괜찮다는 말이 스스로에게도 통하지 않습니다.', en: "I'm fine isn't convincing even you any more.", ja: '大丈夫が自分にも通じなくなっています。', zh: '没事这话，连自己都骗不过了。', fr: 'Ça va ne vous convainc même plus vous-même.', es: 'Estoy bien ya ni te convence a ti.', t: 'down' },
  { ko: '결정을 내리기엔 이르고 잊기엔 늦은 시점입니다.', en: 'Too early to decide, too late to forget.', ja: '決めるには早く忘れるには遅い時点です。', zh: '决定嫌早，忘掉嫌晚。', fr: 'Trop tôt pour trancher, trop tard pour oublier.', es: 'Pronto para decidir, tarde para olvidar.', t: 'flat' },
  { ko: '좋아지는 중인지 익숙해지는 중인지 모호합니다.', en: "Unclear whether it's improving or you're just used to it.", ja: '良くなっているのか慣れたのか曖昧です。', zh: '是变好了还是习惯了，说不清。', fr: "On ne sait si cela s'améliore ou si l'on s'habitue.", es: 'No se sabe si mejora o si te acostumbraste.', t: 'flat' },
  { ko: '답을 아는 사람과 답을 정할 사람이 다릅니다.', en: 'The one who knows the answer and the one who decides differ.', ja: '答えを知る人と決める人は別です。', zh: '知道答案的人和决定的人不是同一个。', fr: 'Qui sait la réponse et qui décide sont deux.', es: 'Quien sabe la respuesta y quien decide son distintos.', t: 'flat' },
  { ko: '잘 맞는 옷을 입은 것 같지만 확신은 없습니다.', en: "It seems to fit, but you're not certain.", ja: '似合っている気はしますが確信はありません。', zh: '感觉合身，但不确定。', fr: 'Cela semble aller, sans certitude.', es: 'Parece que encaja, pero sin certeza.', t: 'flat' },
  { ko: '정리할 것이 물건인지 관계인지 아직 모릅니다.', en: "You don't yet know whether it's objects or ties you need to clear.", ja: '片づける物か関係かまだ分かりません。', zh: '要理的是物件还是关系，还不知道。', fr: "Vous ignorez encore si c'est des objets ou des liens.", es: 'Aún no sabes si es de cosas o de vínculos.', t: 'flat' },
  { ko: '가는 방향은 맞지만 속도가 마음에 걸립니다.', en: 'The direction is right; the speed is what bothers you.', ja: '方向は合いますが速度が気になります。', zh: '方向没错，速度让你在意。', fr: 'La direction est juste, la vitesse inquiète.', es: 'El rumbo es correcto; la velocidad inquieta.', t: 'flat' },
  { ko: '남긴 여백이 게으름인지 여유인지 애매합니다.', en: 'The margin you left reads as either slack or laziness.', ja: '残した余白が余裕か怠けか曖昧です。', zh: '留的白，是从容还是懒散，模糊。', fr: 'La marge laissée passe pour aisance ou paresse.', es: 'El margen dejado parece holgura o pereza.', t: 'flat' },
  { ko: '결론을 미룬 대화가 아직 살아 있습니다.', en: 'A conversation left unconcluded is still alive.', ja: '結論を出さなかった会話がまだ生きています。', zh: '没下结论的对话还活着。', fr: 'Une conversation sans conclusion reste vivante.', es: 'Una conversación sin cerrar sigue viva.', t: 'flat' },
  { ko: '두 사람의 기억이 서로 다르게 남았습니다.', en: 'Two people kept two different versions of the same day.', ja: '二人の記憶が別々に残りました。', zh: '两个人的记忆留成了两个版本。', fr: 'Deux personnes ont gardé deux versions.', es: 'Dos personas guardaron dos versiones.', t: 'flat' },
  { ko: '지금 필요한 것은 답이 아니라 시간입니다.', en: "What's needed now is time, not an answer.", ja: '今必要なのは答えでなく時間です。', zh: '此刻需要的是时间，不是答案。', fr: "Ce qu'il faut, c'est du temps, pas une réponse.", es: 'Lo que hace falta es tiempo, no respuesta.', t: 'flat' },
  { ko: '한쪽 문이 닫히는 소리와 다른 문이 열리는 소리가 겹칩니다.', en: 'One door closing and another opening make the same sound.', ja: '閉まる扉と開く扉の音が重なります。', zh: '一扇门关的声音与另一扇开的重叠。', fr: 'La porte qui ferme et celle qui ouvre sonnent pareil.', es: 'La puerta que cierra y la que abre suenan igual.', t: 'flat' },
  { ko: '모으는 시기와 쓰는 시기의 경계에 있습니다.', en: 'You stand at the border between gathering and spending.', ja: '集める時期と使う時期の境にいます。', zh: '你站在积累与花用的边界上。', fr: 'Vous êtes à la frontière du récolter et du dépenser.', es: 'Estás en la frontera entre juntar y gastar.', t: 'flat' },
  { ko: '주변의 반응이 갈려 기준이 흔들립니다.', en: 'Reactions split, so your reference point wobbles.', ja: '周囲の反応が割れ基準が揺れます。', zh: '反应分歧，标准就晃了。', fr: 'Les avis se partagent et le repère vacille.', es: 'Las reacciones se dividen y el criterio tiembla.', t: 'flat' },
  { ko: '어렵지도 쉽지도 않은 일이 가장 오래 걸립니다.', en: "What's neither hard nor easy takes the longest.", ja: '難しくも易しくもない事が一番長引きます。', zh: '不难也不易的事最耗时。', fr: "Ni dur ni facile : c'est ce qui traîne le plus.", es: 'Ni difícil ni fácil: eso es lo que más tarda.', t: 'flat' },
  { ko: '지금 자리가 임시인지 정착인지 불분명합니다.', en: "It's unclear if this place is temporary or where you stay.", ja: '今の場所が仮か定住か不明です。', zh: '此处是暂居还是久留，不明。', fr: 'On ignore si ce lieu est provisoire ou définitif.', es: 'No está claro si este sitio es temporal o definitivo.', t: 'flat' },
  { ko: '누구도 틀리지 않았는데 결과가 좋지 않습니다.', en: "Nobody was wrong and the outcome still isn't good.", ja: '誰も間違っていないのに結果が良くありません。', zh: '没人做错，结果却不好。', fr: "Personne n'a tort et le résultat déçoit.", es: 'Nadie se equivocó y el resultado no es bueno.', t: 'flat' },
  { ko: '설명을 요구받지 않았지만 설명하고 싶습니다.', en: 'Nobody asked you to explain, and you want to.', ja: '説明を求められていないのに説明したい。', zh: '没人要你解释，你却想解释。', fr: 'On ne vous demande rien et vous voulez expliquer.', es: 'Nadie te pide explicación y quieres darla.', t: 'flat' },
  { ko: '올라가는 중인지 평평한 구간인지 모르겠습니다.', en: 'Hard to tell if this is a climb or a flat stretch.', ja: '上りか平坦か分かりません。', zh: '不知是在上坡还是平路。', fr: "Difficile de dire si ça monte ou si c'est plat.", es: 'No sabes si subes o si es llano.', t: 'flat' },
  { ko: '남에게 좋은 선택이 나에게도 좋은지 다릅니다.', en: "What's good for them isn't the same question as what's good for you.", ja: '人に良い選択が自分にも良いかは別です。', zh: '对别人好的选择，对你未必。', fr: "Bon pour eux n'est pas la même question que bon pour vous.", es: 'Bueno para ellos no es la misma pregunta.', t: 'flat' },
  { ko: '바꾸고 싶은 것과 바꿀 수 있는 것이 겹치지 않습니다.', en: "What you want to change and what you can change don't overlap.", ja: '変えたい物と変えられる物が重なりません。', zh: '想改的和能改的，不重合。', fr: 'Ce que vous voulez changer et ce que vous pouvez ne coïncident pas.', es: 'Lo que quieres cambiar y lo que puedes no coinciden.', t: 'flat' },
  { ko: '가까운 사람일수록 설명이 더 어려워집니다.', en: 'The closer the person, the harder the explaining.', ja: '近い人ほど説明が難しくなります。', zh: '越亲近的人，越难解释。', fr: 'Plus la personne est proche, plus expliquer est dur.', es: 'Cuanto más cercana la persona, más cuesta explicar.', t: 'flat' },
  { ko: '일이 줄지도 늘지도 않는 평행 구간입니다.', en: 'A parallel stretch where the load neither grows nor shrinks.', ja: '仕事が減りも増えもしない平行区間です。', zh: '活儿不增不减的平行段。', fr: 'Un tronçon parallèle : la charge ne bouge pas.', es: 'Un tramo paralelo: la carga ni sube ni baja.', t: 'flat' },
  { ko: '결심보다 조건을 바꿔야 할 시점입니다.', en: 'Time to change the conditions rather than the resolve.', ja: '決意より条件を変える時です。', zh: '该改的是条件，不是决心。', fr: 'Changez les conditions plutôt que la volonté.', es: 'Cambia las condiciones, no la determinación.', t: 'flat' },
  { ko: '오래된 습관이 아직 도움이 되는지 시험받습니다.', en: 'An old habit is being tested for whether it still helps.', ja: '古い習慣がまだ役立つか試されます。', zh: '旧习惯正被检验是否还有用。', fr: "Une vieille habitude passe l'épreuve de l'utilité.", es: 'Un hábito viejo se pone a prueba.', t: 'flat' },
  { ko: '무엇이 달라졌는지 남들이 먼저 알아챕니다.', en: 'Others notice what changed before you do.', ja: '何が変わったか他人が先に気づきます。', zh: '别人先察觉到变了什么。', fr: 'Les autres remarquent le changement avant vous.', es: 'Otros notan el cambio antes que tú.', t: 'flat' },
  { ko: '좋은 소식을 기다리는 자세 자체가 피곤합니다.', en: 'Waiting for good news is itself tiring.', ja: '良い知らせを待つ姿勢自体が疲れます。', zh: '等好消息这件事本身就累。', fr: 'Attendre une bonne nouvelle fatigue en soi.', es: 'Esperar buenas noticias ya cansa.', t: 'flat' },
  { ko: '두 가지 조언이 모두 맞는 말입니다.', en: 'Two contradictory pieces of advice are both correct.', ja: '二つの助言はどちらも正しいです。', zh: '两条相反的建议都对。', fr: 'Deux conseils opposés sont tous deux justes.', es: 'Dos consejos opuestos son ambos ciertos.', t: 'flat' },
  { ko: '아직 이름이 없는 감정이 하루를 물들입니다.', en: 'A feeling without a name colours the day.', ja: '名前のない感情が一日を染めます。', zh: '一种还没名字的情绪染了一天。', fr: 'Une émotion sans nom teinte la journée.', es: 'Una emoción sin nombre tiñe el día.', t: 'flat' },
  { ko: '결과보다 이 과정을 견딜 수 있는지가 문제입니다.', en: 'The question is whether you can bear the process, not the result.', ja: '結果より過程に耐えられるかが問題です。', zh: '问题是能否忍受过程，而非结果。', fr: 'La question est de tenir le processus, pas le résultat.', es: 'La cuestión es aguantar el proceso, no el resultado.', t: 'flat' },
  { ko: '남는 시간에 무엇을 할지 아직 정하지 못했습니다.', en: "You haven't decided what to do with the time that's freed up.", ja: '空いた時間に何をするかまだ決めていません。', zh: '空出来的时间做什么，还没定。', fr: "Vous n'avez pas décidé quoi faire du temps libéré.", es: 'No has decidido qué hacer con el tiempo libre.', t: 'flat' },
  { ko: '가장 큰 변화가 가장 조용히 지나갑니다.', en: 'The biggest change is passing the most quietly.', ja: '一番大きな変化が一番静かに過ぎます。', zh: '最大的变化最安静地经过。', fr: 'Le plus grand changement passe le plus discrètement.', es: 'El cambio mayor pasa del modo más callado.', t: 'flat' },
  { ko: '맞는 말과 지금 필요한 말이 다릅니다.', en: "What's true and what's needed right now are different.", ja: '正しい言葉と今必要な言葉は違います。', zh: '正确的话和此刻需要的话，不同。', fr: 'Le mot juste et le mot nécessaire diffèrent.', es: 'Lo cierto y lo necesario ahora no coinciden.', t: 'flat' },
  { ko: '한 발 물러서면 전체가 보이지만 세부가 흐려집니다.', en: 'Step back and you see the whole but lose the detail.', ja: '一歩引くと全体が見え細部が霞みます。', zh: '退一步见全局，细节就糊了。', fr: "Reculez : le tout apparaît, le détail s'efface.", es: 'Retrocede: ves el todo y pierdes el detalle.', t: 'flat' },
  { ko: '지금 상태를 유지하는 데도 힘이 듭니다.', en: 'Even holding the current state takes effort.', ja: '現状を保つのにも力が要ります。', zh: '连维持现状都要费力。', fr: "Même maintenir l'état actuel demande de l'effort.", es: 'Hasta mantener el estado actual cuesta.', t: 'flat' },
  { ko: '좋아하는 일이 일이 되면서 달라졌습니다.', en: 'Something you loved changed once it became work.', ja: '好きな事が仕事になって変わりました。', zh: '喜欢的事变成工作后就不同了。', fr: 'Ce que vous aimiez a changé en devenant travail.', es: 'Lo que amabas cambió al volverse trabajo.', t: 'flat' },
  { ko: '누구의 이야기를 먼저 들을지가 방향을 정합니다.', en: 'Whose account you hear first decides the direction.', ja: '誰の話を先に聞くかが方向を決めます。', zh: '先听谁的说法，决定了方向。', fr: "Qui vous écoutez d'abord fixe la direction.", es: 'A quién escuchas primero fija el rumbo.', t: 'flat' },
  { ko: '계획한 대로 되지 않았지만 나쁘지도 않습니다.', en: "It didn't go to plan, and it isn't bad either.", ja: '計画通りではありませんが悪くもありません。', zh: '没按计划来，但也不坏。', fr: 'Pas comme prévu, mais pas mauvais non plus.', es: 'No salió según el plan, y tampoco está mal.', t: 'flat' },
  { ko: '변화를 원하는 마음과 두려운 마음이 같은 크기입니다.', en: 'Wanting the change and fearing it weigh the same.', ja: '変化を望む心と恐れる心が同じ重さです。', zh: '想变与怕变，一样重。', fr: 'Le désir et la peur du changement pèsent pareil.', es: 'Deseo y miedo al cambio pesan igual.', t: 'flat' },
  { ko: '여기까지 온 이유를 잠깐 잊고 있습니다.', en: "You've briefly forgotten why you came this far.", ja: 'ここまで来た理由を少し忘れています。', zh: '你暂时忘了走到这一步的理由。', fr: 'Vous oubliez un instant pourquoi vous êtes venu si loin.', es: 'Olvidas un momento por qué llegaste hasta aquí.', t: 'flat' },
  { ko: '정답이 없다는 사실이 답인 상황입니다.', en: "The situation's answer is that there isn't one.", ja: '正解がないという事実が答えです。', zh: '没有标准答案，这就是答案。', fr: "La réponse est qu'il n'y en a pas.", es: 'La respuesta es que no la hay.', t: 'flat' },
  { ko: '이 일이 나에게 맞는지 아직 판단이 이릅니다.', en: "It's still early to judge whether this suits you.", ja: 'この仕事が合うか判断はまだ早いです。', zh: '这事适不适合你，判断还早。', fr: 'Il est tôt pour juger si cela vous convient.', es: 'Es pronto para juzgar si te conviene.', t: 'flat' },
  { ko: '잘 알던 사람의 새로운 면을 보게 됩니다.', en: 'You see a new side of someone you thought you knew.', ja: 'よく知る人の新しい面を見ます。', zh: '你会看到熟人的新一面。', fr: "Vous découvrez une facette d'un proche.", es: 'Ves una faceta nueva de alguien conocido.', t: 'flat' },
  { ko: '얻은 것과 놓친 것이 같은 무게입니다.', en: 'What you gained and what you missed weigh the same.', ja: '得た物と逃した物が同じ重さです。', zh: '得到的与错过的，一样重。', fr: 'Le gain et le manque pèsent pareil.', es: 'Lo ganado y lo perdido pesan igual.', t: 'flat' },
  { ko: '혼자 해도 되고 같이 해도 되는 일입니다.', en: 'This works alone and it works together.', ja: '一人でも一緒でも成り立つ事です。', zh: '一个人做也行，一起做也行。', fr: 'Cela marche seul comme à plusieurs.', es: 'Esto funciona solo y acompañado.', t: 'flat' },
  { ko: '결과를 보기 전까지는 무엇도 확정되지 않습니다.', en: 'Nothing is settled until the result is in.', ja: '結果が出るまで何も確定しません。', zh: '结果出来前，什么都没定。', fr: "Rien n'est fixé avant le résultat.", es: 'Nada está fijado hasta el resultado.', t: 'flat' },
  { ko: '작년의 나라면 다르게 골랐을 문제입니다.', en: "Last year's you would have chosen differently here.", ja: '去年の自分なら違う選択をしたでしょう。', zh: '去年的你会选得不一样。', fr: "Le vous d'il y a un an aurait choisi autrement.", es: 'El tú del año pasado habría elegido distinto.', t: 'flat' },
];

const FOCUS: L[] = [
  { ko: '일과 배움에서 한 걸음 앞서갈 여지가 있습니다.', en: 'There is room to step ahead in work and learning.', ja: '仕事と学びで一歩先へ進む余地があります。', zh: '在工作与学习上有领先一步的空间。', fr: 'Il y a de la place pour avancer au travail et dans les études.', es: 'Hay espacio para avanzar en trabajo y aprendizaje.' },
  { ko: '가까운 관계에서 따뜻한 신호가 오갑니다.', en: 'Warm signals move within close relationships.', ja: '近しい関係で温かなサインが行き交います。', zh: '亲近关系中会有温暖的信号。', fr: 'Des signes chaleureux circulent dans vos relations proches.', es: 'Circulan señales cálidas en tus relaciones cercanas.' },
  { ko: '금전은 지키는 쪽이 늘리는 쪽보다 유리합니다.', en: 'With money, guarding beats grasping this time.', ja: '金銭は増やすより守る方が有利。', zh: '钱财上守成胜于进取。', fr: "Côté argent, préserver vaut mieux qu'accumuler.", es: 'En dinero, conservar supera a acumular.' },
  { ko: '몸의 리듬을 회복하면 판단이 맑아집니다.', en: 'Restore your body’s rhythm and judgment clears.', ja: '体のリズムを整えると判断が冴えます。', zh: '恢复身体节律，判断更清晰。', fr: 'Rétablissez votre rythme et votre jugement s’éclaircit.', es: 'Recupera tu ritmo y tu juicio se aclara.' },
  { ko: '새로운 사람과의 만남이 뜻밖의 힌트를 줍니다.', en: 'A new encounter offers an unexpected hint.', ja: '新しい出会いが思わぬヒントをくれます。', zh: '一次新的相遇会带来意想不到的启示。', fr: 'Une nouvelle rencontre offre un indice inattendu.', es: 'Un nuevo encuentro ofrece una pista inesperada.' },
  { ko: '미뤄둔 일을 마무리하면 마음이 한결 가벼워집니다.', en: "Finishing what you've put off lightens your mind considerably.", ja: '先延ばしにした事を終えると心がぐっと軽くなります。', zh: '完成拖延已久的事，心情会轻松许多。', fr: "Terminer ce que vous remettiez à plus tard allège l'esprit.", es: 'Terminar lo que has postergado alivia mucho la mente.' },
  { ko: '혼자만의 시간이 생각을 정리하는 데 도움이 됩니다.', en: 'Time alone helps you sort out your thoughts.', ja: '一人の時間が考えを整理するのに役立ちます。', zh: '独处的时间有助于理清思绪。', fr: 'Un moment seul vous aide à clarifier vos pensées.', es: 'Un momento a solas te ayuda a ordenar tus pensamientos.' },
  { ko: '작은 변화가 하루의 분위기를 바꿉니다.', en: 'A small change shifts the whole mood of the day.', ja: '小さな変化が一日の雰囲気を変えます。', zh: '一个小小的变化会改变整天的气氛。', fr: "Un petit changement transforme l'ambiance de la journée.", es: 'Un pequeño cambio transforma el ambiente del día.' },
  { ko: '주변의 조언에 귀 기울이면 얻는 게 있습니다.', en: 'Listening to advice from those around you pays off.', ja: '周りの助言に耳を傾けると得るものがあります。', zh: '倾听身边人的建议会让你有所收获。', fr: 'Écouter les conseils de votre entourage porte ses fruits.', es: 'Escuchar los consejos de quienes te rodean da sus frutos.' },
  { ko: '계획보다 실행이 더 중요한 순간입니다.', en: 'A moment when action matters more than planning.', ja: '計画より実行が大事な瞬間です。', zh: '此刻，行动比计划更重要。', fr: 'Un moment où agir compte plus que planifier.', es: 'Un momento en que actuar importa más que planear.' },
  { ko: '연락이 뜸했던 사람에게서 소식이 옵니다.', en: 'News arrives from someone you had lost touch with.', ja: '疎遠だった人から連絡が来ます。', zh: '久未联系的人会带来消息。', fr: "Des nouvelles arrivent de quelqu'un perdu de vue.", es: 'Llegan noticias de alguien con quien perdiste el contacto.' },
  { ko: '돈보다 시간을 어디에 쓰는지가 중요해집니다.', en: 'Where you spend time matters more than where you spend money.', ja: 'お金より時間の使い道が重要になります。', zh: '比起花钱，时间花在哪里更重要。', fr: 'Où vous passez votre temps compte plus que votre argent.', es: 'Dónde gastas tu tiempo importa más que tu dinero.' },
  { ko: '한동안 미뤄둔 건강 신호를 확인할 때입니다.', en: 'Time to check the health signal you have been postponing.', ja: '先延ばしにした体のサインを確認する時です。', zh: '该检查一直拖延的健康信号了。', fr: 'Il est temps de vérifier ce signal de santé remis à plus tard.', es: 'Hora de revisar esa señal de salud que has postergado.' },
  { ko: '경쟁보다 협력이 더 빠른 길이 됩니다.', en: 'Cooperation turns out to be the faster route than competition.', ja: '競争より協力の方が速い道になります。', zh: '合作会比竞争更快。', fr: 'La coopération se révèle plus rapide que la compétition.', es: 'Cooperar resulta más rápido que competir.' },
  { ko: '취향이 맞는 사람과의 대화가 힘이 됩니다.', en: 'A conversation with someone who shares your taste restores you.', ja: '趣味の合う人との会話が力になります。', zh: '与趣味相投的人交谈会给你力量。', fr: "Une conversation avec quelqu'un de votre goût vous ressource.", es: 'Hablar con alguien de tu gusto te da fuerzas.' },
  { ko: '작은 지출이 모여 큰 흐름을 만듭니다.', en: 'Small expenses gather into a large current.', ja: '小さな出費が集まって大きな流れになります。', zh: '小额支出汇成大流。', fr: 'De petites dépenses forment un grand courant.', es: 'Pequeños gastos forman una gran corriente.' },
  { ko: '배운 것을 남에게 설명할 기회가 생깁니다.', en: 'A chance appears to explain what you learned to someone.', ja: '学んだ事を人に説明する機会が生まれます。', zh: '会有机会向别人讲解你学到的东西。', fr: "Une occasion d'expliquer ce que vous avez appris se présente.", es: 'Surge la ocasión de explicar lo aprendido a alguien.' },
  { ko: '집이나 방을 정리하면 생각도 정리됩니다.', en: 'Tidy your room and your thoughts follow.', ja: '部屋を片づけると考えも整います。', zh: '整理房间，思绪也会理顺。', fr: 'Rangez votre pièce et vos pensées suivront.', es: 'Ordena tu cuarto y tus ideas seguirán.' },
  { ko: '첫인상보다 두 번째 인상이 중요해집니다.', en: 'The second impression matters more than the first.', ja: '第一印象より二度目の印象が大事になります。', zh: '第二印象比第一印象更重要。', fr: 'La deuxième impression compte plus que la première.', es: 'La segunda impresión importa más que la primera.' },
  { ko: '웃어넘긴 말이 오래 남을 수 있습니다.', en: 'A remark you laughed off may linger longer than expected.', ja: '笑って流した一言が長く残るかもしれません。', zh: '一句一笑而过的话可能久久留存。', fr: "Une remarque balayée d'un rire peut rester longtemps.", es: 'Un comentario que reíste puede quedarse mucho tiempo.' },
  { ko: '서류나 숫자를 다시 확인할 일이 생깁니다.', en: 'Papers or numbers come back for a second look.', ja: '書類か数字を見直す用事が出てきます。', zh: '会有需要复核文件或数字的事。', fr: 'Des papiers ou des chiffres reviennent pour vérification.', es: 'Papeles o cifras vuelven para una segunda revisión.' },
  { ko: '오래된 물건을 정리하다 기억이 딸려 나옵니다.', en: 'Sorting old things pulls a memory out with them.', ja: '古い物を片づけると記憶が付いてきます。', zh: '整理旧物时，记忆会一并翻出来。', fr: 'Trier de vieux objets fait remonter un souvenir.', es: 'Ordenar cosas viejas saca un recuerdo contigo.' },
  { ko: '몸을 쓰는 활동이 머리를 맑게 합니다.', en: 'Moving your body clears your head.', ja: '体を動かす事が頭を澄ませます。', zh: '活动身体会让头脑清爽。', fr: 'Bouger votre corps éclaircit votre tête.', es: 'Mover el cuerpo te despeja la cabeza.' },
  { ko: '가족이나 오랜 친구 쪽에서 신호가 옵니다.', en: 'A signal comes from family or an old friend.', ja: '家族か旧友から知らせが来ます。', zh: '来自家人或旧友的信号。', fr: "Un signe vient de la famille ou d'un vieil ami.", es: 'Llega una señal de familia o de un viejo amigo.' },
  { ko: '지출 계획을 한 줄로 줄여 볼 만합니다.', en: 'Worth shrinking your spending plan to a single line.', ja: '支出計画を一行に縮めてみる価値があります。', zh: '不妨把开支计划压缩成一行。', fr: 'Cela vaut la peine de réduire votre budget à une ligne.', es: 'Vale la pena reducir tu plan de gastos a una línea.' },
  { ko: '배우던 것을 잠시 멈추면 오히려 정리됩니다.', en: "Pausing what you're learning is what sorts it out.", ja: '学びを一旦止めるとかえって整理されます。', zh: '暂停学习反而会理顺。', fr: "Mettre en pause l'apprentissage l'organise mieux.", es: 'Pausar lo que aprendes es lo que lo ordena.' },
  { ko: '맡은 일의 경계가 다시 그어집니다.', en: 'The boundary of your responsibilities gets redrawn.', ja: '担当の境界が引き直されます。', zh: '职责的边界会被重新划定。', fr: 'La frontière de vos responsabilités se redessine.', es: 'El límite de tus responsabilidades se redibuja.' },
  { ko: '먹고 자는 순서를 바꾸면 컨디션이 달라집니다.', en: 'Change the order of eating and sleeping and your state shifts.', ja: '食事と睡眠の順序を変えると調子が変わります。', zh: '调换吃与睡的顺序，状态会变。', fr: "Changez l'ordre des repas et du sommeil : votre état change.", es: 'Cambia el orden de comer y dormir y tu estado cambia.' },
  { ko: '보류해 둔 관계에 답을 줄 시점입니다.', en: 'Time to answer a relationship you left on hold.', ja: '保留していた関係に答えを出す時です。', zh: '该给搁置的关系一个答复了。', fr: 'Le moment de répondre à une relation en suspens.', es: 'Momento de responder a una relación en pausa.' },
  { ko: '혼자 하던 일에 사람을 하나 붙이면 빨라집니다.', en: 'Add one person to a solo task and it speeds up.', ja: '一人でしていた事に一人足すと速くなります。', zh: '给独做的事加一个人，进度会快。', fr: 'Ajoutez une personne à une tâche solo : ça accélère.', es: 'Suma una persona a la tarea en solitario y se acelera.' },
  { ko: '취미가 수입과 이어질 실마리가 보입니다.', en: 'A thread appears between a hobby and income.', ja: '趣味が収入につながる糸口が見えます。', zh: '兴趣与收入之间出现了线索。', fr: 'Un fil apparaît entre un loisir et un revenu.', es: 'Aparece un hilo entre una afición y el ingreso.' },
  { ko: '이동 중에 생각이 풀립니다.', en: "Thoughts loosen while you're in transit.", ja: '移動中に考えがほどけます。', zh: '在路上，思绪会松开。', fr: 'Vos pensées se dénouent en chemin.', es: 'Las ideas se sueltan mientras te desplazas.' },
  { ko: '문서보다 대화로 푸는 편이 빠릅니다.', en: 'Talking it out beats writing it up this time.', ja: '文書より会話で解く方が速い。', zh: '这次谈比写更快。', fr: "Parler résout plus vite qu'écrire.", es: 'Hablarlo va más rápido que escribirlo.' },
  { ko: '잘하는 것을 반복하는 쪽이 유리합니다.', en: "Repeating what you're good at works in your favour.", ja: '得意な事を繰り返す方が有利です。', zh: '重复你擅长的事更有利。', fr: 'Répéter ce que vous savez faire vous avantage.', es: 'Repetir lo que haces bien te favorece.' },
  { ko: '낯선 분야의 정보가 뜻밖에 쓰입니다.', en: 'Information from an unfamiliar field turns out useful.', ja: '畑違いの情報が思わぬ形で役立ちます。', zh: '陌生领域的信息意外派上用场。', fr: "Une info d'un domaine inconnu se révèle utile.", es: 'Información de un campo ajeno resulta útil.' },
  { ko: '한 사람의 태도가 하루의 온도를 정합니다.', en: "One person's attitude sets the temperature of the day.", ja: '一人の態度が一日の温度を決めます。', zh: '一个人的态度决定一天的温度。', fr: "L'attitude d'une personne fixe la température du jour.", es: 'La actitud de una persona marca la temperatura del día.' },
  { ko: '계약이나 약속의 세부가 중요해집니다.', en: 'The fine print of a deal or promise starts to matter.', ja: '契約や約束の細部が効いてきます。', zh: '合约或承诺的细节开始要紧。', fr: "Les détails d'un accord se mettent à compter.", es: 'La letra pequeña de un acuerdo empieza a importar.' },
  { ko: '쉬는 시간을 미리 잡아두는 편이 낫습니다.', en: 'Better to book your rest in advance.', ja: '休む時間を先に押さえる方が良いです。', zh: '最好提前把休息时间定下来。', fr: "Mieux vaut réserver votre repos à l'avance.", es: 'Mejor reserva tu descanso por adelantado.' },
  { ko: '겉으로 조용한 사람이 실질을 쥐고 있습니다.', en: 'The quiet one is holding the substance.', ja: '静かな人が実質を握っています。', zh: '安静的人握着实权。', fr: 'Le discret tient la substance.', es: 'El callado tiene la sustancia.' },
  { ko: '한 가지를 끝내야 다음이 열립니다.', en: 'Finish one thing and the next opens.', ja: '一つ終えてこそ次が開きます。', zh: '了结一件，下一件才会开。', fr: "Terminez une chose et la suivante s'ouvre.", es: 'Termina una cosa y se abre la siguiente.' },
  { ko: '멀리 있는 사람과의 시차가 변수입니다.', en: 'A time difference with someone far away is the variable.', ja: '遠くの人との時差が変数です。', zh: '与远方之人的时差是变数。', fr: 'Le décalage horaire avec un lointain est la variable.', es: 'La diferencia horaria con alguien lejano es la variable.' },
  { ko: '공간을 바꾸면 집중이 돌아옵니다.', en: 'Change the room and focus comes back.', ja: '場所を変えると集中が戻ります。', zh: '换个空间，专注就回来了。', fr: 'Changez de pièce et la concentration revient.', es: 'Cambia de espacio y vuelve la concentración.' },
  { ko: '작년 이맘때의 기록이 힌트를 줍니다.', en: 'Your notes from this time last year give a hint.', ja: '去年の今頃の記録がヒントをくれます。', zh: '去年此时的记录会给你提示。', fr: "Vos notes d'il y a un an donnent un indice.", es: 'Tus notas de esta época el año pasado dan una pista.' },
  { ko: '사과보다 정정이 필요한 상황입니다.', en: 'This calls for a correction, not an apology.', ja: '謝罪より訂正が要る状況です。', zh: '此刻需要的是更正，不是道歉。', fr: 'La situation demande une correction, pas des excuses.', es: 'Esto pide una corrección, no una disculpa.' },
  { ko: '숫자로 보이지 않는 성과가 쌓이는 중입니다.', en: "Results that don't show as numbers are piling up.", ja: '数字に出ない成果が積み上がっています。', zh: '数字之外的成果正在累积。', fr: "Des résultats invisibles en chiffres s'accumulent.", es: 'Se acumulan resultados que no salen en cifras.' },
  { ko: '도구를 바꾸는 것만으로 일이 줄어듭니다.', en: 'Swapping the tool alone cuts the work down.', ja: '道具を替えるだけで仕事が減ります。', zh: '仅仅换个工具，活就少了。', fr: "Changer d'outil suffit à réduire le travail.", es: 'Solo con cambiar la herramienta se reduce el trabajo.' },
  { ko: '듣기 싫은 말 안에 필요한 정보가 있습니다.', en: "The information you need sits inside the words you don't want to hear.", ja: '聞きたくない言葉の中に必要な情報があります。', zh: '不中听的话里有你需要的信息。', fr: "L'info utile est dans ce que vous ne voulez pas entendre.", es: 'La información útil está en lo que no quieres oír.' },
  { ko: '가격보다 조건을 협상할 여지가 있습니다.', en: "There's room to negotiate terms rather than price.", ja: '価格より条件を交渉する余地があります。', zh: '比起价格，条件更有商量余地。', fr: 'Il y a plus à négocier sur les termes que sur le prix.', es: 'Hay más margen en las condiciones que en el precio.' },
  { ko: '오래 미룬 병원 예약이 생각보다 가볍게 끝납니다.', en: 'A long-postponed appointment turns out lighter than feared.', ja: '先延ばした通院が思ったより軽く済みます。', zh: '拖了很久的就医比想象中轻松。', fr: "Un rendez-vous longtemps repoussé s'avère plus léger que prévu.", es: 'Una cita muy postergada resulta más leve de lo temido.' },
  { ko: '정기 결제 목록을 훑어볼 만한 시점입니다.', en: 'A good moment to scan your recurring charges.', ja: '定期支払いを見直す頃合いです。', zh: '该翻一翻订阅账单了。', fr: 'Le bon moment pour passer en revue vos abonnements.', es: 'Buen momento para repasar tus cargos recurrentes.' },
  { ko: '동료의 농담 속에 진짜 요청이 들어 있습니다.', en: "A real request hides inside a colleague's joke.", ja: '同僚の冗談の中に本当の依頼があります。', zh: '同事的玩笑里藏着真正的请求。', fr: "Une vraie demande se cache dans la plaisanterie d'un collègue.", es: 'Una petición real se esconde en la broma de un colega.' },
  { ko: '잘 쓰던 방식이 처음으로 걸리적거립니다.', en: 'A method that always worked starts getting in the way.', ja: '上手くいっていた方法が初めて邪魔になります。', zh: '一直好用的方法第一次成了阻碍。', fr: 'Une méthode fiable commence pour la première fois à gêner.', es: 'Un método fiable empieza por primera vez a estorbar.' },
  { ko: '가족의 건강 이야기가 화제로 올라옵니다.', en: 'Family health comes up in conversation.', ja: '家族の健康が話題に上がります。', zh: '家人的健康会被提起。', fr: 'La santé de la famille revient dans la conversation.', es: 'Sale el tema de la salud familiar.' },
  { ko: '사람보다 장소를 바꾸는 편이 효과적입니다.', en: 'Changing the place works better than changing the people.', ja: '人より場所を変える方が効きます。', zh: '换地方比换人更有效。', fr: 'Changer de lieu marche mieux que changer de gens.', es: 'Cambiar de sitio funciona mejor que cambiar de gente.' },
  { ko: '한 번 미룬 운동이 계속 미뤄지고 있습니다.', en: 'Exercise postponed once keeps getting postponed.', ja: '一度飛ばした運動がずっと後回しになっています。', zh: '跳过一次的运动一直在被推迟。', fr: "Un exercice sauté une fois continue de l'être.", es: 'El ejercicio saltado una vez sigue postergándose.' },
  { ko: '면접이나 발표 자리에서 첫 문장이 중요해집니다.', en: 'In an interview or a talk, the first sentence carries.', ja: '面接や発表では最初の一文が効きます。', zh: '面试或演讲时，第一句最要紧。', fr: 'En entretien ou en présentation, la première phrase compte.', es: 'En una entrevista o charla, la primera frase pesa.' },
  { ko: '잠깐 만난 사람이 오래 기억에 남습니다.', en: 'Someone you met briefly stays in memory for a long time.', ja: '少し会っただけの人が長く記憶に残ります。', zh: '短暂见过的人会长久留在记忆里。', fr: 'Une rencontre brève reste longtemps en mémoire.', es: 'Alguien que viste poco se queda mucho en la memoria.' },
  { ko: '빌려준 것을 돌려받을 이야기가 나옵니다.', en: "Talk turns to something you lent and haven't got back.", ja: '貸した物の話が出ます。', zh: '会说起借出去还没还的东西。', fr: 'On reparle de ce que vous avez prêté.', es: 'Sale el tema de algo que prestaste.' },
  { ko: '주말 계획이 평일의 밀도를 바꿉니다.', en: 'Weekend plans change the density of the weekdays.', ja: '週末の計画が平日の密度を変えます。', zh: '周末的安排会改变工作日的密度。', fr: 'Vos plans de week-end changent la densité de la semaine.', es: 'Los planes del finde cambian la densidad de la semana.' },
  { ko: '정리하지 못한 사진첩이 마음에 걸립니다.', en: 'An unsorted photo library keeps tugging at you.', ja: '整理していない写真が気に掛かります。', zh: '没整理的相册一直挂在心上。', fr: 'Une photothèque en désordre vous travaille.', es: 'Un álbum sin ordenar te sigue tirando.' },
  { ko: '작은 기술 하나를 익히면 하루가 짧아집니다.', en: 'Learn one small skill and the day gets shorter.', ja: '小さな技を一つ覚えると一日が短くなります。', zh: '学会一个小技巧，一天就变短了。', fr: 'Apprenez une petite compétence et la journée raccourcit.', es: 'Aprende una destreza pequeña y el día se acorta.' },
  { ko: '이력이나 포트폴리오를 다듬을 때가 됐습니다.', en: 'Time to tidy your CV or portfolio.', ja: '経歴やポートフォリオを整える時です。', zh: '该整理简历或作品集了。', fr: 'Le moment de soigner votre CV ou portfolio.', es: 'Hora de pulir tu CV o portafolio.' },
  { ko: '가까운 사람의 변화를 뒤늦게 알아차립니다.', en: 'You notice a change in someone close only belatedly.', ja: '近しい人の変化に遅れて気づきます。', zh: '你会晚一步察觉身边人的变化。', fr: 'Vous remarquez tardivement un changement chez un proche.', es: 'Notas tarde un cambio en alguien cercano.' },
  { ko: '공간을 정리하다 필요한 물건을 다시 찾습니다.', en: 'Tidying up, you rediscover something you needed.', ja: '片づけていて必要な物が出てきます。', zh: '整理时会重新找到需要的东西。', fr: "En rangeant, vous retrouvez ce qu'il vous fallait.", es: 'Ordenando, reencuentras lo que necesitabas.' },
  { ko: '반복 업무 하나를 남에게 넘길 기회가 옵니다.', en: 'A chance appears to hand off one repetitive task.', ja: '繰り返し作業を誰かに渡す機会が来ます。', zh: '会有机会把一项重复工作交出去。', fr: 'Une occasion de déléguer une tâche répétitive.', es: 'Surge la ocasión de delegar una tarea repetitiva.' },
  { ko: '소액이 새는 곳이 눈에 들어옵니다.', en: 'You spot where the small amounts are leaking.', ja: '少額が漏れている所が見えます。', zh: '你会看到小钱漏在哪里。', fr: 'Vous repérez où fuient les petites sommes.', es: 'Ves por dónde se escapan las cantidades pequeñas.' },
  { ko: '듣던 음악이나 읽던 책의 취향이 바뀝니다.', en: 'Your taste in what you listen to or read shifts.', ja: '聴く音楽や読む本の好みが変わります。', zh: '听什么、读什么的口味会变。', fr: 'Vos goûts musicaux ou de lecture changent.', es: 'Cambia tu gusto por lo que escuchas o lees.' },
  { ko: '한동안 안 쓰던 능력을 다시 꺼내게 됩니다.', en: "A skill you hadn't used in a while comes back out.", ja: 'しばらく使わなかった力を再び出します。', zh: '一段时间没用的能力会重新拿出来。', fr: 'Une compétence en sommeil ressort.', es: 'Vuelve a salir una habilidad que tenías guardada.' },
  { ko: '계절이 바뀌는 신호를 몸이 먼저 읽습니다.', en: 'Your body reads the change of season before you do.', ja: '季節の変わり目を体が先に読みます。', zh: '身体会先读出季节的变化。', fr: 'Votre corps lit le changement de saison avant vous.', es: 'Tu cuerpo lee el cambio de estación antes que tú.' },
  { ko: '협업 도구나 파일 정리 방식을 손볼 시점입니다.', en: 'Time to fix how you organise files or shared tools.', ja: 'ファイルや共同作業の整理を直す時です。', zh: '该整顿文件与协作工具的组织方式了。', fr: 'Le moment de revoir votre rangement de fichiers.', es: 'Hora de arreglar cómo organizas archivos y herramientas.' },
  { ko: '마음이 가는 쪽과 이득이 되는 쪽이 갈립니다.', en: 'What draws you and what pays you point different ways.', ja: '心が向く方と得になる方が分かれます。', zh: '心之所向与利之所在开始分岔。', fr: 'Ce qui vous attire et ce qui rapporte divergent.', es: 'Lo que te atrae y lo que te conviene se separan.' },
  { ko: '연말이나 분기 목표를 다시 볼 필요가 있습니다.', en: 'Worth revisiting your quarterly or year-end targets.', ja: '四半期や年末の目標を見直す必要があります。', zh: '有必要重看季度或年终目标。', fr: 'Il vaut la peine de revoir vos objectifs trimestriels.', es: 'Conviene revisar tus metas trimestrales o de fin de año.' },
  { ko: '주변의 소음이 집중을 방해하는 구간입니다.', en: 'A stretch where ambient noise is costing you focus.', ja: '周囲の音が集中を削る区間です。', zh: '周围的噪音正在削弱专注。', fr: 'Le bruit ambiant vous coûte de la concentration.', es: 'El ruido ambiental te está costando concentración.' },
  { ko: '오래된 계정이나 구독을 정리할 만합니다.', en: 'Worth clearing out old accounts or subscriptions.', ja: '古いアカウントや購読を整理する価値があります。', zh: '值得清理旧账号和订阅。', fr: 'Cela vaut le coup de faire le tri dans vos comptes.', es: 'Vale la pena limpiar cuentas y suscripciones viejas.' },
  { ko: '누군가의 부탁이 내 일정의 형태를 바꿉니다.', en: "Someone's request reshapes your schedule.", ja: '誰かの頼みが予定の形を変えます。', zh: '别人的请求会重塑你的日程。', fr: "La demande d'un autre remodèle votre agenda.", es: 'La petición de alguien reconfigura tu agenda.' },
  { ko: '잘 안 되던 대화가 장소를 바꾸자 풀립니다.', en: 'A stuck conversation loosens once you change the room.', ja: '進まなかった会話が場所を変えると解けます。', zh: '换个地方，卡住的对话就通了。', fr: 'Une conversation bloquée se dénoue ailleurs.', es: 'Una conversación atascada se suelta en otro sitio.' },
  { ko: '비슷한 일을 하는 사람의 방식을 훔쳐볼 때입니다.', en: 'Time to steal a method from someone doing similar work.', ja: '似た仕事をする人のやり方を盗む時です。', zh: '该去偷学同行的做法了。', fr: "Le moment de piquer la méthode d'un pair.", es: 'Hora de robarle el método a alguien que hace lo mismo.' },
  { ko: '손으로 쓰는 시간이 화면보다 정확합니다.', en: 'Time spent writing by hand beats time on a screen.', ja: '手で書く時間が画面より正確です。', zh: '手写的时间比屏幕更准确。', fr: "Le temps passé à écrire à la main vaut mieux qu'à l'écran.", es: 'El tiempo escribiendo a mano supera al de pantalla.' },
  { ko: '맡은 일보다 맡지 않은 일이 더 신경 쓰입니다.', en: "What you didn't take on bothers you more than what you did.", ja: '引き受けた事より断った事が気になります。', zh: '没接的活比接了的更让你在意。', fr: "Ce que vous n'avez pas pris vous préoccupe davantage.", es: 'Te inquieta más lo que no aceptaste que lo que sí.' },
  { ko: '친구의 결정에 내 이야기를 얹지 않는 편이 낫습니다.', en: "Better not to layer your story onto a friend's decision.", ja: '友の決断に自分の話を重ねない方が良いです。', zh: '别把自己的故事叠到朋友的决定上。', fr: 'Mieux vaut ne pas plaquer votre histoire sur son choix.', es: 'Mejor no superpongas tu historia a su decisión.' },
  { ko: '돈이 아니라 관계가 걸린 협상이 있습니다.', en: 'A negotiation where the stake is the relationship, not the money.', ja: '金でなく関係が懸かった交渉があります。', zh: '有一场赌的是关系而非金钱的谈判。', fr: "Une négociation où l'enjeu est la relation, pas l'argent.", es: 'Una negociación donde está en juego el vínculo, no el dinero.' },
  { ko: '규칙적인 시간에 먹는 것만으로 달라집니다.', en: 'Eating at regular hours alone changes things.', ja: '決まった時間に食べるだけで変わります。', zh: '仅仅按时吃饭就会不同。', fr: 'Manger à heures fixes suffit à changer les choses.', es: 'Comer a horas fijas ya lo cambia todo.' },
  { ko: '멀리 있는 목표보다 이번 주가 중요합니다.', en: 'This week matters more than the distant goal.', ja: '遠い目標よりこの一週間が大事です。', zh: '这一周比远方的目标更重要。', fr: "Cette semaine compte plus que l'objectif lointain.", es: 'Esta semana importa más que la meta lejana.' },
  { ko: '어릴 때 좋아하던 것이 다시 눈에 들어옵니다.', en: 'Something you loved as a child catches your eye again.', ja: '子供の頃好きだった物が再び目に入ります。', zh: '小时候喜欢的东西又映入眼帘。', fr: 'Ce que vous aimiez enfant vous accroche de nouveau.', es: 'Algo que amabas de niño vuelve a llamarte.' },
  { ko: '문서 하나를 끝까지 읽으면 오해가 풀립니다.', en: 'Read one document to the end and the misunderstanding clears.', ja: '書類を最後まで読むと誤解が解けます。', zh: '把一份文件读到底，误会就散了。', fr: "Lisez un document jusqu'au bout : le malentendu tombe.", es: 'Lee un documento entero y el malentendido se disuelve.' },
  { ko: '혼자 감당하던 비용을 나눌 방법이 있습니다.', en: "There's a way to split a cost you've been carrying alone.", ja: '一人で負っていた費用を分ける方法があります。', zh: '有办法分摊你独自承担的成本。', fr: 'Il existe un moyen de partager ce coût porté seul.', es: 'Hay forma de repartir un coste que cargas solo.' },
  { ko: '사소한 습관 하나가 평판을 만들고 있습니다.', en: 'One small habit is quietly building your reputation.', ja: '些細な習慣一つが評判を作っています。', zh: '一个小习惯正在塑造你的口碑。', fr: 'Une petite habitude construit votre réputation.', es: 'Un hábito pequeño te está construyendo la reputación.' },
  { ko: '이사나 자리 이동 이야기가 나옵니다.', en: 'Talk of a move or a change of seat comes up.', ja: '引越しや席替えの話が出ます。', zh: '会谈到搬家或换座位。', fr: 'On parle de déménagement ou de changement de place.', es: 'Surge el tema de una mudanza o cambio de sitio.' },
  { ko: '남이 만든 틀 안에서 내 색을 넣을 여지가 있습니다.', en: "There's room for your colour inside someone else's frame.", ja: '他人の枠の中に自分の色を入れる余地があります。', zh: '在别人的框架里仍有留下你颜色的余地。', fr: "Il y a place pour votre couleur dans le cadre d'un autre.", es: 'Hay sitio para tu color dentro del marco de otro.' },
  { ko: '계약서보다 대화 기록이 중요해집니다.', en: 'The chat log matters more than the contract this time.', ja: '契約書より会話の記録が重要になります。', zh: '这次聊天记录比合同更重要。', fr: "L'historique des échanges compte plus que le contrat.", es: 'El historial de mensajes pesa más que el contrato.' },
  { ko: '몸무게보다 잠의 질을 보는 편이 낫습니다.', en: 'Watch sleep quality rather than the scale.', ja: '体重より睡眠の質を見る方が良いです。', zh: '比起体重，更该看睡眠质量。', fr: 'Surveillez la qualité du sommeil plutôt que la balance.', es: 'Vigila la calidad del sueño, no la báscula.' },
  { ko: '자주 쓰는 말버릇이 상대에게 다르게 들립니다.', en: 'A phrase you overuse lands differently on the other side.', ja: '口癖が相手には違って聞こえます。', zh: '你的口头禅在对方听来是另一个意思。', fr: "Un tic de langage sonne autrement à l'autre bout.", es: 'Una muletilla tuya suena distinta del otro lado.' },
  { ko: '정보를 모으는 단계는 이미 지났습니다.', en: 'The information-gathering stage is already behind you.', ja: '情報を集める段階はもう過ぎました。', zh: '收集信息的阶段已经过去了。', fr: "La phase de collecte d'informations est passée.", es: 'La fase de reunir información ya quedó atrás.' },
  { ko: '낯선 도시나 동네를 걸어볼 만합니다.', en: 'Worth walking an unfamiliar town or neighbourhood.', ja: '知らない街を歩く価値があります。', zh: '值得去陌生的城市或街区走走。', fr: "Cela vaut la peine d'arpenter un quartier inconnu.", es: 'Vale la pena caminar un barrio desconocido.' },
  { ko: '남에게 설명하다 내 생각이 정리됩니다.', en: 'Explaining it to someone sorts out your own thinking.', ja: '人に説明していて自分の考えが整います。', zh: '向别人解释时，自己的思路就理顺了。', fr: "En l'expliquant, votre propre pensée s'ordonne.", es: 'Al explicarlo, tu propio pensamiento se ordena.' },
  { ko: '기다리던 답이 다른 형태로 도착합니다.', en: 'The answer you waited for arrives in a different shape.', ja: '待っていた答えが別の形で届きます。', zh: '等待的答案会以另一种形式抵达。', fr: 'La réponse attendue arrive sous une autre forme.', es: 'La respuesta esperada llega con otra forma.' },
];

const ADVICE: L[] = [
  { ko: '조언: 작게 시작하되 매일 이어가세요.', en: 'Advice: start small, but keep it daily.', ja: '助言: 小さく始め、毎日続けて。', zh: '建议：从小处开始，每天坚持。', fr: 'Conseil : commencez petit, mais chaque jour.', es: 'Consejo: empieza pequeño, pero a diario.' },
  { ko: '조언: 거절할 것을 먼저 정하세요.', en: 'Advice: decide first what to decline.', ja: '助言: 断ることから決めて。', zh: '建议：先决定要拒绝什么。', fr: 'Conseil : décidez d’abord ce que vous refusez.', es: 'Consejo: decide primero qué rechazar.' },
  { ko: '조언: 한 사람에게 진심을 전하세요.', en: 'Advice: bring your honesty to one person.', ja: '助言: 一人に本心を伝えて。', zh: '建议：向一个人袒露真心。', fr: 'Conseil : soyez sincère avec une personne.', es: 'Consejo: sé sincero con una persona.' },
  { ko: '조언: 오늘의 기록이 다음 기회를 부릅니다.', en: 'Advice: today’s notes summon tomorrow’s chance.', ja: '助言: 今日の記録が次の機会を呼ぶ。', zh: '建议：今天的记录会带来下次机会。', fr: 'Conseil : vos notes d’aujourd’hui appellent la chance de demain.', es: 'Consejo: tus notas de hoy invocan la próxima oportunidad.' },
  { ko: '조언: 서두르지 말고 순서를 지키세요.', en: "Advice: don't rush — keep things in order.", ja: '助言: 急がず順序を守って。', zh: '建议：不要急躁，按部就班。', fr: "Conseil : ne vous précipitez pas, respectez l'ordre des choses.", es: 'Consejo: no te apresures, respeta el orden de las cosas.' },
  { ko: '조언: 완벽보다 완료를 목표로 하세요.', en: 'Advice: aim to finish, not to be perfect.', ja: '助言: 完璧より完了を目指して。', zh: '建议：以完成为目标，而非追求完美。', fr: 'Conseil : visez à terminer, pas à être parfait.', es: 'Consejo: apunta a terminar, no a ser perfecto.' },
  { ko: '조언: 도움을 구하는 것도 능력입니다.', en: 'Advice: asking for help is a skill too.', ja: '助言: 助けを求めることも能力です。', zh: '建议：懂得求助也是一种能力。', fr: "Conseil : demander de l'aide est aussi une compétence.", es: 'Consejo: pedir ayuda también es una habilidad.' },
  { ko: '조언: 오늘 하루는 비교하지 마세요.', en: "Advice: don't compare yourself to others today.", ja: '助言: 今日一日は比べないで。', zh: '建议：今天不要拿自己和别人比较。', fr: "Conseil : ne vous comparez pas aujourd'hui.", es: 'Consejo: hoy no te compares con nadie.' },
  { ko: '조언: 몸이 보내는 신호를 무시하지 마세요.', en: "Advice: don't ignore the signals your body sends.", ja: '助言: 体が送るサインを無視しないで。', zh: '建议：不要忽视身体发出的信号。', fr: "Conseil : n'ignorez pas les signaux de votre corps.", es: 'Consejo: no ignores las señales de tu cuerpo.' },
  { ko: '조언: 확신이 없다면 하루만 더 지켜보세요.', en: 'Advice: if unsure, watch and wait just one more day.', ja: '助言: 確信がなければもう一日様子を見て。', zh: '建议：如果没把握，不妨再多观察一天。', fr: 'Conseil : en cas de doute, attendez encore un jour.', es: 'Consejo: si no estás seguro, espera un día más.' },
  { ko: '조언: 결정하기 전에 소리 내어 말해보세요.', en: 'Advice: say it out loud before you decide.', ja: '助言: 決める前に声に出してみて。', zh: '建议：决定前先说出声来。', fr: 'Conseil : dites-le à voix haute avant de décider.', es: 'Consejo: dilo en voz alta antes de decidir.' },
  { ko: '조언: 오늘은 답장을 하루 미뤄도 됩니다.', en: 'Advice: it is fine to delay one reply by a day.', ja: '助言: 今日は返信を一日遅らせても構いません。', zh: '建议：今天把一条回复推迟一天也无妨。', fr: "Conseil : reporter une réponse d'un jour est acceptable.", es: 'Consejo: está bien retrasar una respuesta un día.' },
  { ko: '조언: 가장 하기 싫은 일을 먼저 끝내세요.', en: 'Advice: finish the thing you least want to do, first.', ja: '助言: 一番やりたくない事を先に終えて。', zh: '建议：先做最不想做的那件事。', fr: "Conseil : terminez d'abord ce que vous aimez le moins.", es: 'Consejo: termina primero lo que menos quieres hacer.' },
  { ko: '조언: 숫자로 적어보면 불안이 줄어듭니다.', en: 'Advice: write it down as numbers and the anxiety shrinks.', ja: '助言: 数字にして書くと不安が減ります。', zh: '建议：写成数字，焦虑会变小。', fr: "Conseil : mettez-le en chiffres, l'anxiété diminue.", es: 'Consejo: ponlo en números y la ansiedad se reduce.' },
  { ko: '조언: 한 가지만 남기고 나머지는 내일로 미루세요.', en: 'Advice: keep one thing, push the rest to tomorrow.', ja: '助言: 一つだけ残し、他は明日に回して。', zh: '建议：只留一件，其余推到明天。', fr: 'Conseil : gardez une chose, remettez le reste à demain.', es: 'Consejo: quédate con una cosa y deja el resto para mañana.' },
  { ko: '조언: 고맙다는 말을 미루지 마세요.', en: 'Advice: do not postpone saying thank you.', ja: '助言: ありがとうを後回しにしないで。', zh: '建议：别把道谢推后。', fr: 'Conseil : ne remettez pas vos remerciements.', es: 'Consejo: no pospongas dar las gracias.' },
  { ko: '조언: 익숙한 길 대신 다른 길로 돌아오세요.', en: 'Advice: come back by a different route than usual.', ja: '助言: いつもと違う道で帰ってみて。', zh: '建议：换一条不同的路回来。', fr: "Conseil : rentrez par un autre chemin que d'habitude.", es: 'Consejo: vuelve por un camino distinto al de siempre.' },
  { ko: '조언: 확실하지 않은 것은 확실하지 않다고 말하세요.', en: 'Advice: say you are unsure when you are unsure.', ja: '助言: 不確かな事は不確かだと言って。', zh: '建议：不确定的事就说不确定。', fr: "Conseil : dites que vous n'êtes pas sûr quand c'est le cas.", es: 'Consejo: di que no estás seguro cuando no lo estés.' },
  { ko: '조언: 오늘 산 것보다 오늘 버린 것을 세어보세요.', en: 'Advice: count what you let go of today, not what you bought.', ja: '助言: 今日買った物より手放した物を数えて。', zh: '建议：数一数今天放下的，而不是买下的。', fr: 'Conseil : comptez ce que vous avez lâché, pas acheté.', es: 'Consejo: cuenta lo que soltaste hoy, no lo que compraste.' },
  { ko: '조언: 잘 풀릴 때일수록 기록을 남기세요.', en: 'Advice: when things go well, that is when to take notes.', ja: '助言: 上手くいく時こそ記録を残して。', zh: '建议：越顺利越要留下记录。', fr: 'Conseil : quand tout va bien, prenez des notes.', es: 'Consejo: cuando todo va bien, toma notas.' },
  { ko: '조언: 오늘 결정한 이유를 한 줄로 적어두세요.', en: 'Advice: write down in one line why you decided.', ja: '助言: 決めた理由を一行で書き残して。', zh: '建议：用一行写下你决定的理由。', fr: 'Conseil : notez en une ligne pourquoi vous avez décidé.', es: 'Consejo: anota en una línea por qué decidiste.' },
  { ko: '조언: 상대의 말을 그대로 한 번 되풀이해 보세요.', en: 'Advice: repeat back what the other person said, word for word.', ja: '助言: 相手の言葉をそのまま一度返して。', zh: '建议：把对方的话原样复述一遍。', fr: "Conseil : répétez mot pour mot ce qu'on vous a dit.", es: 'Consejo: repite palabra por palabra lo que te dijeron.' },
  { ko: '조언: 오늘은 새로 사지 말고 있는 것을 쓰세요.', en: 'Advice: use what you have instead of buying new today.', ja: '助言: 今日は買わずに手持ちを使って。', zh: '建议：今天别买新的，用现有的。', fr: "Conseil : aujourd'hui, utilisez ce que vous avez.", es: 'Consejo: hoy usa lo que tienes en vez de comprar.' },
  { ko: '조언: 하루의 첫 한 시간을 남에게 주지 마세요.', en: "Advice: don't give away the first hour of your day.", ja: '助言: 一日の最初の一時間を人に渡さないで。', zh: '建议：别把一天的头一个小时交给别人。', fr: 'Conseil : ne cédez pas la première heure de la journée.', es: 'Consejo: no regales la primera hora del día.' },
  { ko: '조언: 마음에 걸리는 쪽을 먼저 확인하세요.', en: 'Advice: check the thing that nags at you first.', ja: '助言: 引っかかる方を先に確かめて。', zh: '建议：先去确认让你介意的那一边。', fr: "Conseil : vérifiez d'abord ce qui vous chiffonne.", es: 'Consejo: comprueba primero lo que te inquieta.' },
  { ko: '조언: 기한을 정하지 않은 약속은 하지 마세요.', en: "Advice: don't make a promise without a date on it.", ja: '助言: 期限のない約束はしないで。', zh: '建议：不要做没有期限的承诺。', fr: 'Conseil : ne promettez rien sans échéance.', es: 'Consejo: no prometas nada sin una fecha.' },
  { ko: '조언: 잘 안 되는 이유를 한 번만 소리 내어 말해보세요.', en: "Advice: say out loud, just once, why it isn't working.", ja: '助言: 上手くいかない理由を一度だけ声に出して。', zh: '建议：把不顺的原因大声说一次就好。', fr: 'Conseil : dites tout haut, une seule fois, pourquoi ça coince.', es: 'Consejo: di en voz alta, solo una vez, por qué no funciona.' },
  { ko: '조언: 오늘은 두 번째 의견을 구해보세요.', en: 'Advice: get a second opinion today.', ja: '助言: 今日はセカンドオピニオンを。', zh: '建议：今天去听听第二个意见。', fr: "Conseil : demandez un second avis aujourd'hui.", es: 'Consejo: pide una segunda opinión hoy.' },
  { ko: '조언: 끝난 일에 마침표를 찍고 넘어가세요.', en: "Advice: put a period on what's finished and move on.", ja: '助言: 終わった事に句点を打って進んで。', zh: '建议：给已了之事画个句号再走。', fr: 'Conseil : mettez un point final et avancez.', es: 'Consejo: pon el punto final y sigue.' },
  { ko: '조언: 답장 전에 한 번 걸어보세요.', en: 'Advice: take a walk before you reply.', ja: '助言: 返信の前に少し歩いて。', zh: '建议：回复之前先走一走。', fr: 'Conseil : marchez un peu avant de répondre.', es: 'Consejo: camina un poco antes de responder.' },
  { ko: '조언: 가장 작은 단위로 쪼개서 시작하세요.', en: 'Advice: split it to the smallest unit and start there.', ja: '助言: 最小単位に割って始めて。', zh: '建议：拆到最小单位再开始。', fr: 'Conseil : découpez au plus petit et commencez là.', es: 'Consejo: divídelo al mínimo y empieza ahí.' },
  { ko: '조언: 오늘 만난 사람의 이름을 기억해 두세요.', en: 'Advice: remember the name of someone you met today.', ja: '助言: 今日会った人の名前を覚えて。', zh: '建议：记住今天见到的人的名字。', fr: "Conseil : retenez le nom d'une personne rencontrée aujourd'hui.", es: 'Consejo: recuerda el nombre de alguien que conociste hoy.' },
  { ko: '조언: 싫은 소리를 들으면 메모만 하고 답은 내일 하세요.', en: 'Advice: when criticised, take notes today and answer tomorrow.', ja: '助言: 苦言は今日メモし、返答は明日に。', zh: '建议：听到批评先记下，明天再回应。', fr: "Conseil : notez la critique aujourd'hui, répondez demain.", es: 'Consejo: anota la crítica hoy y responde mañana.' },
  { ko: '조언: 하고 싶은 말의 절반만 하세요.', en: 'Advice: say only half of what you want to say.', ja: '助言: 言いたい事の半分だけ言って。', zh: '建议：想说的话只说一半。', fr: 'Conseil : ne dites que la moitié de ce que vous voulez.', es: 'Consejo: di solo la mitad de lo que quieres decir.' },
  { ko: '조언: 오늘 쓴 시간을 세 덩어리로 나눠 보세요.', en: "Advice: split today's hours into three blocks and look at them.", ja: '助言: 今日使った時間を三つに分けて眺めて。', zh: '建议：把今天的时间分成三块看看。', fr: "Conseil : découpez vos heures d'aujourd'hui en trois blocs.", es: 'Consejo: divide las horas de hoy en tres bloques.' },
  { ko: '조언: 부탁은 구체적인 숫자와 함께 하세요.', en: 'Advice: make your ask with a specific number attached.', ja: '助言: 頼み事は具体的な数字と一緒に。', zh: '建议：提请求时带上具体数字。', fr: 'Conseil : formulez votre demande avec un chiffre précis.', es: 'Consejo: pide con un número concreto.' },
  { ko: '조언: 오늘 하루만 알림을 꺼두세요.', en: 'Advice: turn notifications off for just today.', ja: '助言: 今日だけ通知を切って。', zh: '建议：就今天一天关掉通知。', fr: "Conseil : coupez les notifications rien qu'aujourd'hui.", es: 'Consejo: apaga las notificaciones solo por hoy.' },
  { ko: '조언: 감사보다 구체적인 칭찬을 건네세요.', en: 'Advice: give specific praise rather than generic thanks.', ja: '助言: 感謝より具体的な称賛を。', zh: '建议：给出具体的赞美，而非泛泛的感谢。', fr: "Conseil : offrez un éloge précis plutôt qu'un merci vague.", es: 'Consejo: da un elogio concreto en vez de un gracias vago.' },
  { ko: '조언: 남은 것 말고 남길 것을 정하세요.', en: "Advice: decide what to leave behind, not what's left over.", ja: '助言: 残った物でなく残す物を決めて。', zh: '建议：决定要留下什么，而不是剩下什么。', fr: 'Conseil : décidez ce que vous laissez, pas ce qui reste.', es: 'Consejo: decide qué dejas, no qué sobra.' },
  { ko: '조언: 계획을 줄이고 여백을 늘리세요.', en: 'Advice: cut the plan and grow the margin.', ja: '助言: 計画を減らし余白を増やして。', zh: '建议：减少计划，增加留白。', fr: 'Conseil : réduisez le plan, agrandissez la marge.', es: 'Consejo: recorta el plan y amplía el margen.' },
  { ko: '조언: 오늘 한 사람에게만 솔직하세요.', en: 'Advice: be honest with exactly one person today.', ja: '助言: 今日は一人にだけ正直に。', zh: '建议：今天只对一个人坦白。', fr: "Conseil : soyez franc avec une seule personne aujourd'hui.", es: 'Consejo: sé sincero hoy con una sola persona.' },
  { ko: '조언: 되돌릴 수 있는 선택부터 시도하세요.', en: 'Advice: try the reversible option first.', ja: '助言: 取り消せる選択から試して。', zh: '建议：先试可以撤回的选项。', fr: "Conseil : essayez d'abord l'option réversible.", es: 'Consejo: prueba primero la opción reversible.' },
  { ko: '조언: 오늘 배운 것 하나를 남에게 말해보세요.', en: 'Advice: tell someone one thing you learned today.', ja: '助言: 今日学んだ事を一つ人に話して。', zh: '建议：把今天学到的一件事讲给别人听。', fr: "Conseil : racontez à quelqu'un une chose apprise aujourd'hui.", es: 'Consejo: cuéntale a alguien algo que aprendiste hoy.' },
  { ko: '조언: 무리한 일정을 하나 취소하세요.', en: "Advice: cancel one appointment you shouldn't have taken.", ja: '助言: 無理な予定を一つ取り消して。', zh: '建议：取消一个勉强的安排。', fr: 'Conseil : annulez un rendez-vous de trop.', es: 'Consejo: cancela un compromiso de más.' },
  { ko: '조언: 상대가 아니라 상황을 지적하세요.', en: 'Advice: point at the situation, not at the person.', ja: '助言: 人ではなく状況を指して。', zh: '建议：指出情况，而不是指责人。', fr: 'Conseil : visez la situation, pas la personne.', es: 'Consejo: señala la situación, no a la persona.' },
  { ko: '조언: 오늘 못 한 일 목록은 지우세요.', en: "Advice: delete today's list of what you didn't do.", ja: '助言: できなかった事のリストは消して。', zh: '建议：把今天没做的清单删掉。', fr: "Conseil : effacez la liste de ce que vous n'avez pas fait.", es: 'Consejo: borra la lista de lo que no hiciste hoy.' },
  { ko: '조언: 처음 떠오른 답을 한 번 의심해 보세요.', en: 'Advice: doubt your first answer once.', ja: '助言: 最初に浮かんだ答えを一度疑って。', zh: '建议：怀疑一次你的第一反应。', fr: 'Conseil : doutez une fois de votre première réponse.', es: 'Consejo: duda una vez de tu primera respuesta.' },
  { ko: '조언: 몸이 무거우면 계획을 고치세요, 의지를 탓하지 말고.', en: "Advice: if your body is heavy, fix the plan — don't blame your will.", ja: '助言: 体が重いなら意志でなく計画を直して。', zh: '建议：身体沉重时改计划，别怪意志力。', fr: 'Conseil : si le corps est lourd, corrigez le plan, pas la volonté.', es: 'Consejo: si el cuerpo pesa, corrige el plan, no la voluntad.' },
  { ko: '조언: 오늘은 가장 조용한 사람의 의견을 물어보세요.', en: 'Advice: ask the quietest person in the room what they think.', ja: '助言: 今日は一番静かな人の意見を聞いて。', zh: '建议：今天去问问最安静的那个人怎么想。', fr: 'Conseil : demandez son avis à la personne la plus discrète.', es: 'Consejo: pregunta a la persona más callada qué piensa.' },
  { ko: '조언: 잘 안 풀리면 순서를 거꾸로 해보세요.', en: "Advice: if it won't come together, try the steps in reverse.", ja: '助言: 行き詰まったら順序を逆にしてみて。', zh: '建议：卡住时，把顺序倒过来试试。', fr: "Conseil : si ça bloque, inversez l'ordre des étapes.", es: 'Consejo: si se atasca, invierte el orden de los pasos.' },
  { ko: '조언: 오늘 산 것의 값을 시간으로 환산해 보세요.', en: "Advice: convert today's purchase into hours of your work.", ja: '助言: 今日買った物を働いた時間に換算して。', zh: '建议：把今天买的东西换算成工作时长。', fr: 'Conseil : convertissez votre achat du jour en heures de travail.', es: 'Consejo: convierte la compra de hoy en horas de trabajo.' },
  { ko: '조언: 답을 아는 척하지 말고 모른다고 하세요.', en: "Advice: say you don't know instead of pretending you do.", ja: '助言: 分かったふりをせず知らないと言って。', zh: '建议：别装懂，直接说不知道。', fr: 'Conseil : dites que vous ne savez pas plutôt que de faire semblant.', es: 'Consejo: di que no sabes en vez de aparentar que sí.' },
  { ko: '조언: 하루에 한 번은 화면에서 눈을 떼세요.', en: 'Advice: look away from a screen at least once today.', ja: '助言: 一日に一度は画面から目を離して。', zh: '建议：今天至少有一次把眼睛从屏幕上移开。', fr: "Conseil : détachez les yeux d'un écran au moins une fois.", es: 'Consejo: aparta la vista de la pantalla al menos una vez.' },
  { ko: '조언: 걱정을 종이 한 장에 다 적고 접어두세요.', en: 'Advice: write every worry on one sheet, then fold it away.', ja: '助言: 心配を一枚に書いて畳んでおいて。', zh: '建议：把担忧写满一张纸，然后折起来。', fr: 'Conseil : écrivez tous vos soucis sur une feuille, puis pliez-la.', es: 'Consejo: escribe cada preocupación en una hoja y dóblala.' },
  { ko: '조언: 남이 시작한 싸움에 이름을 올리지 마세요.', en: "Advice: don't put your name on a fight someone else started.", ja: '助言: 他人が始めた争いに名前を貸さないで。', zh: '建议：别把名字借给别人挑起的争端。', fr: "Conseil : ne mettez pas votre nom sur la querelle d'un autre.", es: 'Consejo: no pongas tu nombre en la pelea de otro.' },
  { ko: '조언: 되풀이되는 문제라면 사람이 아니라 구조를 보세요.', en: 'Advice: if it keeps happening, look at the structure, not the person.', ja: '助言: 繰り返すなら人でなく仕組みを見て。', zh: '建议：反复发生就看结构，别看人。', fr: 'Conseil : si ça se répète, regardez la structure, pas la personne.', es: 'Consejo: si se repite, mira la estructura, no a la persona.' },
  { ko: '조언: 오늘 고른 것을 내일 다시 고를지 물어보세요.', en: "Advice: ask whether you'd choose today's choice again tomorrow.", ja: '助言: 今日の選択を明日も選ぶか自問して。', zh: '建议：问问自己明天还会做同样的选择吗。', fr: 'Conseil : demandez-vous si vous referiez ce choix demain.', es: 'Consejo: pregúntate si mañana elegirías lo mismo.' },
  { ko: '조언: 큰 결정 앞에서는 배가 고프지 않은지 먼저 보세요.', en: "Advice: before a big decision, check whether you're just hungry.", ja: '助言: 大きな決断の前に空腹でないか確かめて。', zh: '建议：做大决定前先看看是不是饿了。', fr: "Conseil : avant une grande décision, vérifiez que vous n'avez pas faim.", es: 'Consejo: antes de decidir algo grande, mira si solo tienes hambre.' },
  { ko: '조언: 좋았던 하루의 조건을 기록해 두세요.', en: 'Advice: write down what made a good day good.', ja: '助言: 良かった日の条件を書き留めて。', zh: '建议：记下让好日子成为好日子的条件。', fr: 'Conseil : notez ce qui a rendu bonne une bonne journée.', es: 'Consejo: anota qué hizo buena una buena jornada.' },
  { ko: '조언: 오늘은 이기려 하지 말고 이해하려 해보세요.', en: 'Advice: try to understand today rather than to win.', ja: '助言: 今日は勝つより理解しようとして。', zh: '建议：今天试着去理解，而不是赢。', fr: "Conseil : cherchez à comprendre plutôt qu'à gagner.", es: 'Consejo: intenta comprender en vez de ganar.' },
  { ko: '조언: 마음이 급하면 걸음을 늦추세요.', en: 'Advice: when the mind races, slow the feet.', ja: '助言: 心が急く時は歩幅を緩めて。', zh: '建议：心急时把脚步放慢。', fr: "Conseil : quand l'esprit s'emballe, ralentissez le pas.", es: 'Consejo: si la mente corre, frena los pies.' },
  { ko: '조언: 오늘 하나만 남기고 나머지는 눈에서 치우세요.', en: 'Advice: keep one thing in sight today and clear the rest away.', ja: '助言: 今日は一つだけ残し他は視界から外して。', zh: '建议：今天只留一件在眼前，其余收起来。', fr: 'Conseil : gardez une seule chose en vue, rangez le reste.', es: 'Consejo: deja una sola cosa a la vista y guarda el resto.' },
  { ko: '조언: 감사 인사는 그 자리에서 하세요.', en: 'Advice: say thank you on the spot, not later.', ja: '助言: 感謝はその場で伝えて。', zh: '建议：道谢就当场说。', fr: 'Conseil : remerciez sur le moment, pas plus tard.', es: 'Consejo: da las gracias en el momento, no después.' },
  { ko: '조언: 잘 자는 것이 오늘의 가장 큰 성과일 수 있습니다.', en: "Advice: sleeping well may be today's biggest achievement.", ja: '助言: よく眠る事が今日一番の成果かもしれません。', zh: '建议：睡个好觉也许是今天最大的成就。', fr: 'Conseil : bien dormir est peut-être votre plus grande réussite du jour.', es: 'Consejo: dormir bien puede ser tu mayor logro de hoy.' },
  { ko: '조언: 부탁을 거절할 때 이유를 길게 설명하지 마세요.', en: "Advice: when you decline, don't over-explain why.", ja: '助言: 断る時に理由を長々と説明しないで。', zh: '建议：拒绝时不要长篇解释理由。', fr: "Conseil : en refusant, n'expliquez pas trop.", es: 'Consejo: al rechazar, no des tantas explicaciones.' },
  { ko: '조언: 오늘 만든 것을 누군가에게 보여주세요.', en: 'Advice: show someone what you made today.', ja: '助言: 今日作った物を誰かに見せて。', zh: '建议：把今天做的东西给人看看。', fr: "Conseil : montrez à quelqu'un ce que vous avez fait aujourd'hui.", es: 'Consejo: enséñale a alguien lo que hiciste hoy.' },
  { ko: '조언: 확인할 수 없는 소문은 옮기지 마세요.', en: "Advice: don't pass along what you cannot verify.", ja: '助言: 確かめられない噂は運ばないで。', zh: '建议：无法核实的传言就别传。', fr: 'Conseil : ne relayez pas ce que vous ne pouvez vérifier.', es: 'Consejo: no repitas lo que no puedes verificar.' },
  { ko: '조언: 오늘은 계획 대신 방향만 정하세요.', en: 'Advice: set a direction today, not a plan.', ja: '助言: 今日は計画でなく方向だけ決めて。', zh: '建议：今天只定方向，不定计划。', fr: "Conseil : fixez une direction aujourd'hui, pas un plan.", es: 'Consejo: hoy fija un rumbo, no un plan.' },
  { ko: '조언: 오래된 사과가 있다면 오늘 하세요.', en: 'Advice: if you owe an old apology, make it today.', ja: '助言: 遅れた謝罪があるなら今日を選んで。', zh: '建议：若有欠着的道歉，今天说。', fr: "Conseil : si vous devez des excuses anciennes, faites-les aujourd'hui.", es: 'Consejo: si debes una disculpa vieja, dala hoy.' },
  { ko: '조언: 잘 되는 것을 굳이 바꾸지 마세요.', en: "Advice: don't fix what is already working.", ja: '助言: 上手くいっている物をわざわざ変えないで。', zh: '建议：正常运转的东西别去动。', fr: 'Conseil : ne réparez pas ce qui fonctionne.', es: 'Consejo: no arregles lo que ya funciona.' },
  { ko: '조언: 오늘 쓴 돈보다 오늘 아낀 시간을 세어보세요.', en: 'Advice: count the time you saved today, not the money you spent.', ja: '助言: 使った金より節約した時間を数えて。', zh: '建议：数一数今天省下的时间，而不是花掉的钱。', fr: "Conseil : comptez le temps gagné, pas l'argent dépensé.", es: 'Consejo: cuenta el tiempo que ahorraste, no el dinero gastado.' },
  { ko: '조언: 판단이 서지 않으면 조건을 하나만 더 모으세요.', en: "Advice: if you can't decide, gather exactly one more fact.", ja: '助言: 決められないなら条件を一つだけ足して。', zh: '建议：拿不定主意时，只再多收集一个条件。', fr: 'Conseil : si vous hésitez, réunissez un seul élément de plus.', es: 'Consejo: si no decides, reúne un dato más, solo uno.' },
  { ko: '조언: 오늘 처음 해보는 일을 하나 넣으세요.', en: 'Advice: slot one first-time thing into today.', ja: '助言: 今日初めての事を一つ入れて。', zh: '建议：给今天安排一件第一次做的事。', fr: 'Conseil : glissez dans votre journée une première fois.', es: 'Consejo: mete en el día algo que hagas por primera vez.' },
  { ko: '조언: 미안하다는 말 대신 무엇을 고칠지 말하세요.', en: "Advice: instead of sorry, say what you'll change.", ja: '助言: ごめんの代わりに何を直すか言って。', zh: '建议：与其说抱歉，不如说要改什么。', fr: 'Conseil : au lieu de pardon, dites ce que vous changerez.', es: 'Consejo: en vez de perdón, di qué vas a cambiar.' },
  { ko: '조언: 오늘 하루 남의 속도를 세지 마세요.', en: "Advice: don't keep score of anyone else's pace today.", ja: '助言: 今日は人の速度を数えないで。', zh: '建议：今天别去计算别人的速度。', fr: "Conseil : ne comptez pas le rythme des autres aujourd'hui.", es: 'Consejo: hoy no midas el ritmo de nadie más.' },
  { ko: '조언: 물건보다 자리를 먼저 정하세요.', en: 'Advice: decide the place before you buy the thing.', ja: '助言: 物より置き場所を先に決めて。', zh: '建议：先定位置，再买东西。', fr: "Conseil : décidez de la place avant d'acheter l'objet.", es: 'Consejo: decide el sitio antes de comprar la cosa.' },
  { ko: '조언: 반복되는 일은 오늘 자동으로 만들어두세요.', en: 'Advice: automate today whatever you do again and again.', ja: '助言: 繰り返す作業は今日のうちに自動化して。', zh: '建议：把重复的事今天就自动化。', fr: "Conseil : automatisez aujourd'hui ce que vous refaites sans cesse.", es: 'Consejo: automatiza hoy lo que repites siempre.' },
  { ko: '조언: 화가 날 때는 문장을 짧게 쓰세요.', en: 'Advice: when angry, write in short sentences.', ja: '助言: 腹が立つ時は短い文で書いて。', zh: '建议：生气时把句子写短。', fr: 'Conseil : en colère, écrivez court.', es: 'Consejo: enfadado, escribe frases cortas.' },
  { ko: '조언: 오늘 한 번은 먼저 인사하세요.', en: 'Advice: greet someone first, once, today.', ja: '助言: 今日一度は自分から挨拶して。', zh: '建议：今天主动打一次招呼。', fr: "Conseil : saluez le premier, une fois, aujourd'hui.", es: 'Consejo: saluda tú primero, una vez, hoy.' },
  { ko: '조언: 기대치를 낮추지 말고 기한을 늘리세요.', en: 'Advice: extend the deadline rather than lower the bar.', ja: '助言: 期待を下げるより期限を延ばして。', zh: '建议：与其降低期待，不如延长期限。', fr: 'Conseil : allongez le délai plutôt que de baisser la barre.', es: 'Consejo: alarga el plazo en vez de bajar el listón.' },
  { ko: '조언: 오늘 배운 것을 한 문장으로 줄여보세요.', en: 'Advice: compress what you learned today into one sentence.', ja: '助言: 今日学んだ事を一文に縮めて。', zh: '建议：把今天学到的压缩成一句话。', fr: 'Conseil : résumez en une phrase ce que vous avez appris.', es: 'Consejo: comprime en una frase lo aprendido hoy.' },
  { ko: '조언: 남의 성공에 진심으로 축하해 보세요.', en: "Advice: congratulate someone's success and mean it.", ja: '助言: 人の成功を本心から祝ってみて。', zh: '建议：真心为别人的成功道贺。', fr: "Conseil : félicitez sincèrement la réussite d'un autre.", es: 'Consejo: felicita de verdad el éxito ajeno.' },
  { ko: '조언: 오늘은 답장보다 확인을 먼저 하세요.', en: 'Advice: verify before you reply today.', ja: '助言: 今日は返信より確認を先に。', zh: '建议：今天先核实再回复。', fr: "Conseil : vérifiez avant de répondre aujourd'hui.", es: 'Consejo: hoy verifica antes de responder.' },
  { ko: '조언: 잃은 것을 세기 전에 남은 것을 세세요.', en: "Advice: count what remains before counting what's lost.", ja: '助言: 失った物を数える前に残る物を数えて。', zh: '建议：数损失之前先数剩下的。', fr: 'Conseil : comptez ce qui reste avant ce qui est perdu.', es: 'Consejo: cuenta lo que queda antes que lo perdido.' },
  { ko: '조언: 오늘 하나를 버리면 내일 하나가 들어옵니다.', en: 'Advice: let one thing go today and one arrives tomorrow.', ja: '助言: 今日一つ手放せば明日一つ入ってきます。', zh: '建议：今天放下一件，明天就进来一件。', fr: "Conseil : lâchez une chose aujourd'hui, une autre viendra demain.", es: 'Consejo: suelta algo hoy y mañana entra otra cosa.' },
  { ko: '조언: 결과를 보고하기 전에 과정을 한 줄 붙이세요.', en: 'Advice: add one line about the process before reporting the result.', ja: '助言: 結果の前に過程を一行添えて。', zh: '建议：汇报结果前加一行过程。', fr: 'Conseil : ajoutez une ligne sur le processus avant le résultat.', es: 'Consejo: añade una línea del proceso antes del resultado.' },
  { ko: '조언: 오늘 하루는 예의보다 정확함을 택하세요.', en: 'Advice: choose accuracy over politeness today.', ja: '助言: 今日は礼儀より正確さを選んで。', zh: '建议：今天选择准确，而不是客气。', fr: "Conseil : préférez l'exactitude à la politesse aujourd'hui.", es: 'Consejo: hoy elige exactitud antes que cortesía.' },
  { ko: '조언: 아직 준비되지 않았다는 말은 한 번만 쓰세요.', en: "Advice: you get to say I'm not ready once — then start.", ja: '助言: まだ準備できていないは一度だけ。', zh: '建议：还没准备好这句话只用一次。', fr: "Conseil : dites une seule fois que vous n'êtes pas prêt.", es: 'Consejo: di solo una vez que no estás listo.' },
  { ko: '조언: 오늘 도움을 받았다면 그 사람에게 알려주세요.', en: 'Advice: if someone helped, tell them it helped.', ja: '助言: 助けられたならそう伝えて。', zh: '建议：受了帮助就告诉对方。', fr: 'Conseil : si on vous a aidé, dites-le à cette personne.', es: 'Consejo: si te ayudaron, díselo.' },
  { ko: '조언: 하기 싫은 이유와 못 하는 이유를 구분하세요.', en: "Advice: separate don't want to from cannot.", ja: '助言: やりたくないとできないを分けて。', zh: '建议：分清不想做和做不到。', fr: 'Conseil : distinguez je ne veux pas de je ne peux pas.', es: 'Consejo: separa no quiero de no puedo.' },
  { ko: '조언: 오늘은 요약하지 말고 전부 들어보세요.', en: 'Advice: listen to the whole thing today instead of summarizing.', ja: '助言: 今日は要約せず最後まで聞いて。', zh: '建议：今天别急着总结，听完整。', fr: "Conseil : écoutez tout aujourd'hui au lieu de résumer.", es: 'Consejo: hoy escucha entero en vez de resumir.' },
  { ko: '조언: 잘 모르는 분야에서는 질문이 실력입니다.', en: 'Advice: outside your field, asking is the skill.', ja: '助言: 不慣れな分野では質問が実力です。', zh: '建议：在陌生领域，提问就是本事。', fr: "Conseil : hors de votre domaine, la compétence c'est la question.", es: 'Consejo: fuera de tu campo, preguntar es la destreza.' },
  { ko: '조언: 오늘 만든 규칙은 일주일만 지켜보세요.', en: "Advice: try today's new rule for exactly one week.", ja: '助言: 今日決めた規則は一週間だけ試して。', zh: '建议：今天定的规矩先守一周看看。', fr: 'Conseil : testez la règle du jour pendant une semaine.', es: 'Consejo: prueba la regla de hoy exactamente una semana.' },
  { ko: '조언: 답이 두 개면 더 지루한 쪽을 고르세요.', en: 'Advice: when two answers work, pick the more boring one.', ja: '助言: 答えが二つなら退屈な方を選んで。', zh: '建议：两个答案都行时，选无聊的那个。', fr: 'Conseil : entre deux bonnes réponses, choisissez la plus ennuyeuse.', es: 'Consejo: entre dos respuestas válidas, elige la más aburrida.' },
  { ko: '조언: 오늘 미룬 일의 첫 5분만 해보세요.', en: 'Advice: do only the first five minutes of what you postponed.', ja: '助言: 先延ばした事の最初の五分だけやって。', zh: '建议：把拖延的事只做头五分钟。', fr: 'Conseil : faites seulement les cinq premières minutes.', es: 'Consejo: haz solo los primeros cinco minutos.' },
  { ko: '조언: 오늘 본 것 중 하나를 사진으로 남기세요.', en: 'Advice: photograph one thing you saw today.', ja: '助言: 今日見た物を一つ写真に残して。', zh: '建议：把今天看到的拍一张下来。', fr: "Conseil : photographiez une chose vue aujourd'hui.", es: 'Consejo: fotografía una cosa que viste hoy.' },
];


const CAUTION: L[] = [
  { ko: '주의: 확답을 서두르면 나중에 되돌리기 어렵습니다.', en: 'Watch out: a rushed yes is hard to take back later.', ja: '注意: 即答を急ぐと後で戻しにくくなります。', zh: '注意：仓促答应，日后难以收回。', fr: 'Attention : un oui précipité se retire difficilement.', es: 'Cuidado: un sí apresurado cuesta retirarlo después.' },
  { ko: '주의: 피곤할 때 보낸 메시지를 조심하세요.', en: 'Watch out: be careful with messages sent while tired.', ja: '注意: 疲れている時のメッセージに気をつけて。', zh: '注意：小心疲惫时发出的消息。', fr: 'Attention : méfiez-vous des messages envoyés fatigué.', es: 'Cuidado con los mensajes enviados cuando estás cansado.' },
  { ko: '주의: 남의 속도에 맞추다 내 리듬을 잃기 쉽습니다.', en: "Watch out: matching another's pace can cost you your own.", ja: '注意: 人の速度に合わせて自分のリズムを失いがち。', zh: '注意：迁就他人节奏容易丢失自己的节奏。', fr: "Attention : suivre le rythme d'autrui peut vous coûter le vôtre.", es: 'Cuidado: seguir el ritmo ajeno puede costarte el tuyo.' },
  { ko: '주의: 소문으로 들은 정보는 한 번 더 확인하세요.', en: 'Watch out: verify anything you heard secondhand.', ja: '注意: 又聞きの情報はもう一度確認を。', zh: '注意：道听途说的信息请再确认一次。', fr: 'Attention : vérifiez ce que vous avez appris de seconde main.', es: 'Cuidado: verifica lo que oíste de segunda mano.' },
  { ko: '주의: 작은 약속을 가볍게 넘기면 신뢰가 샙니다.', en: 'Watch out: brushing off small promises leaks trust.', ja: '注意: 小さな約束を軽く見ると信頼が漏れます。', zh: '注意：轻视小承诺会流失信任。', fr: 'Attention : négliger les petites promesses fuit la confiance.', es: 'Cuidado: descuidar promesas pequeñas fuga confianza.' },
  { ko: '주의: 지출은 금액보다 빈도를 살펴야 합니다.', en: 'Watch out: with spending, check frequency before amount.', ja: '注意: 支出は金額より頻度を見るべきです。', zh: '注意：支出要先看频率再看金额。', fr: 'Attention : pour les dépenses, regardez la fréquence avant le montant.', es: 'Cuidado: en gastos, mira la frecuencia antes que el monto.' },
  { ko: '주의: 완벽하게 준비될 때를 기다리다 때를 놓칩니다.', en: 'Watch out: waiting to be fully ready is how the moment passes.', ja: '注意: 完璧に整うのを待つと時機を逃します。', zh: '注意：等到完全准备好，时机就过了。', fr: "Attention : attendre d'être prêt fait passer le moment.", es: 'Cuidado: esperar a estar listo hace que pase el momento.' },
  { ko: '주의: 감정이 실린 판단은 하루 뒤에 다시 보세요.', en: 'Watch out: revisit emotionally charged calls a day later.', ja: '注意: 感情の乗った判断は一日後に見直して。', zh: '注意：带情绪的判断请隔天再看。', fr: 'Attention : revoyez un jour plus tard les décisions émotives.', es: 'Cuidado: revisa un día después las decisiones emocionales.' },
  { ko: '주의: 도움을 준 사람에게 설명 없이 사라지지 마세요.', en: 'Watch out: do not vanish on someone who helped you.', ja: '注意: 助けてくれた人の前から黙って消えないで。', zh: '注意：别对帮过你的人不告而别。', fr: 'Attention : ne disparaissez pas sans un mot pour qui vous a aidé.', es: 'Cuidado: no desaparezcas sin decir nada de quien te ayudó.' },
  { ko: '주의: 여러 개를 동시에 시작하면 하나도 남지 않습니다.', en: 'Watch out: start too many at once and none survives.', ja: '注意: 同時にいくつも始めると何も残りません。', zh: '注意：同时开始太多，最后一件也留不下。', fr: 'Attention : trop de départs simultanés et rien ne reste.', es: 'Cuidado: empezar muchas a la vez y no queda ninguna.' },
  { ko: '주의: 비교는 정보가 아니라 소모입니다.', en: 'Watch out: comparison is not information, it is depletion.', ja: '注意: 比較は情報ではなく消耗です。', zh: '注意：比较不是信息，是消耗。', fr: "Attention : la comparaison n'informe pas, elle épuise.", es: 'Cuidado: comparar no informa, agota.' },
  { ko: '주의: 침묵을 동의로 읽지 마세요.', en: 'Watch out: do not read silence as agreement.', ja: '注意: 沈黙を同意と読まないで。', zh: '注意：不要把沉默当作同意。', fr: 'Attention : ne prenez pas le silence pour un accord.', es: 'Cuidado: no leas el silencio como acuerdo.' },
  { ko: '주의: 잘 안다고 생각한 사람에게서 예상 밖의 반응이 옵니다.', en: 'Watch out: an unexpected reaction from someone you thought you knew.', ja: '注意: よく知るはずの人から予想外の反応が来ます。', zh: '注意：以为熟悉的人会有意外反应。', fr: "Attention : une réaction inattendue d'un proche.", es: 'Cuidado: una reacción inesperada de alguien conocido.' },
  { ko: '주의: 급하게 고른 것은 오래 씁니다.', en: 'Watch out: what you pick in a hurry, you use for a long time.', ja: '注意: 急いで選んだ物ほど長く使う事になります。', zh: '注意：匆忙选的东西往往要用很久。', fr: "Attention : ce qu'on choisit vite, on le garde longtemps.", es: 'Cuidado: lo elegido con prisa se usa mucho tiempo.' },
  { ko: '주의: 여러 채널에 같은 말을 반복하면 신뢰가 흐려집니다.', en: 'Watch out: repeating the same line on every channel dilutes trust.', ja: '注意: 同じ話を各所で繰り返すと信頼が薄まります。', zh: '注意：在多个场合重复同一套说辞会稀释信任。', fr: 'Attention : répéter partout le même discours dilue la confiance.', es: 'Cuidado: repetir lo mismo en todos lados diluye la confianza.' },
  { ko: '주의: 돈보다 시간을 먼저 잃는 제안을 조심하세요.', en: 'Watch out: offers that cost you time before money.', ja: '注意: 金より先に時間を失う話に注意。', zh: '注意：小心那些先耗时间再耗钱的提议。', fr: "Attention : les offres qui coûtent du temps avant de l'argent.", es: 'Cuidado con ofertas que cuestan tiempo antes que dinero.' },
  { ko: '주의: 완성 직전에 손대면 처음부터 다시가 됩니다.', en: 'Watch out: touching it right before the finish sends you back to the start.', ja: '注意: 完成直前に手を入れると振り出しに戻ります。', zh: '注意：临近完成时改动会回到起点。', fr: 'Attention : y toucher juste avant la fin vous ramène au départ.', es: 'Cuidado: tocarlo justo antes del final te devuelve al principio.' },
  { ko: '주의: 좋은 소식을 너무 일찍 알리면 김이 샙니다.', en: 'Watch out: announcing good news too early lets the air out.', ja: '注意: 良い知らせを早く言い過ぎると気が抜けます。', zh: '注意：好消息说得太早会泄气。', fr: 'Attention : annoncer trop tôt une bonne nouvelle la dégonfle.', es: 'Cuidado: anunciar la buena noticia muy pronto la desinfla.' },
  { ko: '주의: 스스로 정한 규칙을 먼저 어기게 됩니다.', en: "Watch out: the rule you'll break first is your own.", ja: '注意: 最初に破るのは自分で決めた規則です。', zh: '注意：你最先破的是自己定的规矩。', fr: "Attention : la règle que vous briserez d'abord est la vôtre.", es: 'Cuidado: la regla que romperás primero es la tuya.' },
  { ko: '주의: 오래된 갈등을 새 자리에서 꺼내지 마세요.', en: "Watch out: don't bring an old conflict into a new room.", ja: '注意: 古い対立を新しい場に持ち込まないで。', zh: '注意：别把旧矛盾带到新场合。', fr: "Attention : n'amenez pas un vieux conflit dans un lieu neuf.", es: 'Cuidado: no lleves un viejo conflicto a un sitio nuevo.' },
  { ko: '주의: 아무도 반대하지 않는 계획이 가장 위험합니다.', en: 'Watch out: the plan nobody objects to is the risky one.', ja: '注意: 誰も反対しない計画が一番危ない。', zh: '注意：没人反对的计划最危险。', fr: 'Attention : le plan que personne ne conteste est le plus risqué.', es: 'Cuidado: el plan que nadie objeta es el más arriesgado.' },
  { ko: '주의: 피로를 성실로 착각하지 마세요.', en: "Watch out: don't mistake exhaustion for diligence.", ja: '注意: 疲れを勤勉と取り違えないで。', zh: '注意：别把疲惫误当作勤奋。', fr: "Attention : ne confondez pas l'épuisement avec la rigueur.", es: 'Cuidado: no confundas agotamiento con diligencia.' },
  { ko: '주의: 대신 결정해 주면 책임까지 따라옵니다.', en: 'Watch out: decide for someone and the blame comes with it.', ja: '注意: 代わりに決めると責任まで付いてきます。', zh: '注意：替人做决定，责任也会跟来。', fr: "Attention : décider pour autrui, c'est en porter la faute.", es: 'Cuidado: decidir por otro trae también la culpa.' },
  { ko: '주의: 한 번 낮춘 가격은 다시 올리기 어렵습니다.', en: 'Watch out: a price once lowered is hard to raise again.', ja: '注意: 一度下げた価格は戻しにくい。', zh: '注意：降过的价格很难再涨回去。', fr: 'Attention : un prix baissé se relève difficilement.', es: 'Cuidado: un precio bajado cuesta volver a subirlo.' },
  { ko: '주의: 정리한 줄 알았던 일이 다른 이름으로 돌아옵니다.', en: 'Watch out: something you thought was settled returns under a new name.', ja: '注意: 片づいたはずの件が別名で戻ります。', zh: '注意：以为了结的事会换个名字回来。', fr: 'Attention : une affaire close revient sous un autre nom.', es: 'Cuidado: algo que creías cerrado vuelve con otro nombre.' },
  { ko: '주의: 조언을 구하는 척하며 동의만 찾고 있지 않은지 보세요.', en: "Watch out: check whether you're seeking agreement, not advice.", ja: '注意: 助言を装って同意だけ求めていないか。', zh: '注意：看看你是不是在求认同而非建议。', fr: 'Attention : cherchez-vous un conseil ou juste un accord ?', es: 'Cuidado: ¿buscas consejo o solo que te den la razón?' },
  { ko: '주의: 마감이 없는 일이 마감 있는 일을 갉아먹습니다.', en: 'Watch out: deadline-free work eats the work with deadlines.', ja: '注意: 締切のない仕事が締切のある仕事を食います。', zh: '注意：没有截止日的事会吃掉有截止日的事。', fr: 'Attention : le travail sans échéance dévore celui qui en a.', es: 'Cuidado: lo que no tiene plazo se come lo que sí lo tiene.' },
  { ko: '주의: 익명의 평가에 하루를 내주지 마세요.', en: "Watch out: don't hand a whole day to an anonymous review.", ja: '注意: 匿名の評価に一日を明け渡さないで。', zh: '注意：别把一整天交给匿名评价。', fr: 'Attention : ne cédez pas votre journée à un avis anonyme.', es: 'Cuidado: no le entregues el día a una reseña anónima.' },
  { ko: '주의: 모두를 만족시키려다 아무도 만족시키지 못합니다.', en: 'Watch out: aiming to satisfy everyone satisfies no one.', ja: '注意: 全員を満たそうとすると誰も満たせません。', zh: '注意：想让所有人满意，结果谁都不满意。', fr: 'Attention : viser tout le monde ne satisfait personne.', es: 'Cuidado: querer contentar a todos no contenta a nadie.' },
  { ko: '주의: 저장하지 않은 작업과 확인하지 않은 발신을 조심하세요.', en: 'Watch out: unsaved work and unchecked messages, both today.', ja: '注意: 保存していない作業と確認前の送信に注意。', zh: '注意：未保存的工作与未核对的发送。', fr: 'Attention : travail non sauvegardé et envois non relus.', es: 'Cuidado con el trabajo sin guardar y los envíos sin revisar.' },
  { ko: '주의: 남의 성공 속도를 내 기준선으로 삼지 마세요.', en: "Watch out: don't make someone else's pace your baseline.", ja: '注意: 他人の速度を自分の基準にしないで。', zh: '注意：别把别人的速度当成自己的基准。', fr: "Attention : ne prenez pas le rythme d'autrui pour référence.", es: 'Cuidado: no tomes el ritmo ajeno como tu línea base.' },
  { ko: '주의: 좋은 조건일수록 서명 전에 하루를 두세요.', en: "Watch out: the better the terms, the more a night's wait is worth.", ja: '注意: 好条件ほど署名前に一晩置いて。', zh: '注意：条件越好，越该签字前放一晚。', fr: "Attention : plus l'offre est bonne, plus dormez dessus.", es: 'Cuidado: cuanto mejor la oferta, más vale consultarlo con la almohada.' },
  { ko: '주의: 좋은 사람이 되려다 필요한 말을 놓칩니다.', en: 'Watch out: trying to be the nice one costs you the necessary word.', ja: '注意: いい人であろうとして必要な一言を逃します。', zh: '注意：想当好人，会漏掉该说的话。', fr: "Attention : vouloir être gentil vous fait taire l'essentiel.", es: 'Cuidado: querer caer bien te calla lo necesario.' },
  { ko: '주의: 처음 제시된 숫자에 생각이 묶입니다.', en: 'Watch out: the first number quoted anchors your thinking.', ja: '注意: 最初に出た数字に考えが縛られます。', zh: '注意：第一个报出的数字会锚住你的判断。', fr: 'Attention : le premier chiffre annoncé ancre votre jugement.', es: 'Cuidado: la primera cifra dicha te ancla el juicio.' },
  { ko: '주의: 바쁜 것과 나아가는 것을 혼동하기 쉽습니다.', en: 'Watch out: busy is easy to mistake for moving forward.', ja: '注意: 忙しさと前進を取り違えやすい。', zh: '注意：容易把忙碌误当成前进。', fr: "Attention : l'agitation se confond aisément avec l'avancée.", es: 'Cuidado: es fácil confundir ajetreo con avance.' },
  { ko: '주의: 반복 결제되는 항목을 잊고 지나갑니다.', en: 'Watch out: a recurring charge slips past unnoticed.', ja: '注意: 定期課金を見落として通り過ぎます。', zh: '注意：会漏看一笔自动续费。', fr: 'Attention : un prélèvement récurrent passe inaperçu.', es: 'Cuidado: un cargo recurrente pasa desapercibido.' },
  { ko: '주의: 예의로 넘긴 무례가 다음에 더 커집니다.', en: 'Watch out: rudeness let slide politely grows next time.', ja: '注意: 礼儀で流した無礼は次に大きくなります。', zh: '注意：出于客气放过的无礼，下次会更大。', fr: "Attention : l'impolitesse tolérée revient plus grande.", es: 'Cuidado: la grosería que dejaste pasar vuelve mayor.' },
  { ko: '주의: 오늘 세운 원칙을 오늘 저녁에 시험받습니다.', en: "Watch out: this morning's principle gets tested tonight.", ja: '注意: 今朝決めた原則が今夜試されます。', zh: '注意：今早定的原则今晚就会被考验。', fr: 'Attention : le principe du matin sera testé ce soir.', es: 'Cuidado: el principio de esta mañana se prueba esta noche.' },
  { ko: '주의: 도움을 주다 결정권까지 가져오게 됩니다.', en: 'Watch out: helping can slide into taking over the decision.', ja: '注意: 手伝ううちに決定権まで奪ってしまいます。', zh: '注意：帮着帮着，会连决定权一起拿走。', fr: 'Attention : aider glisse vite vers décider à la place.', es: 'Cuidado: ayudar se desliza hacia decidir por el otro.' },
  { ko: '주의: 지금 편한 선택이 다음 달의 일을 늘립니다.', en: "Watch out: today's easy option adds to next month's work.", ja: '注意: 今楽な選択が来月の仕事を増やします。', zh: '注意：现在省事的选择会加重下月的活。', fr: "Attention : la facilité d'aujourd'hui charge le mois prochain.", es: 'Cuidado: lo fácil de hoy carga el mes que viene.' },
  { ko: '주의: 오래된 파일을 덮어쓰기 전에 사본을 두세요.', en: 'Watch out: keep a copy before you overwrite anything old.', ja: '注意: 古いファイルを上書きする前に控えを。', zh: '注意：覆盖旧文件前先留个副本。', fr: "Attention : gardez une copie avant d'écraser un ancien fichier.", es: 'Cuidado: guarda copia antes de sobrescribir algo viejo.' },
  { ko: '주의: 상대가 침묵하는 이유를 혼자 짐작하고 있습니다.', en: "Watch out: you're guessing alone at why they went quiet.", ja: '注意: 相手が黙る理由を一人で推測しています。', zh: '注意：你在独自猜测对方沉默的理由。', fr: "Attention : vous devinez seul pourquoi l'autre se tait.", es: 'Cuidado: adivinas a solas por qué el otro calla.' },
  { ko: '주의: 잘하는 일만 하다 새 근육이 굳습니다.', en: "Watch out: doing only what you're good at stiffens the rest.", ja: '注意: 得意な事だけ続けると他が固まります。', zh: '注意：只做擅长的事，别的会僵掉。', fr: 'Attention : ne faire que vos forces raidit le reste.', es: 'Cuidado: hacer solo lo que dominas atrofia el resto.' },
  { ko: '주의: 술자리나 늦은 대화에서 나온 약속을 확인하세요.', en: 'Watch out: confirm any promise made late at night.', ja: '注意: 遅い時間に出た約束は改めて確認を。', zh: '注意：深夜谈出来的承诺要再确认。', fr: 'Attention : reconfirmez toute promesse faite tard le soir.', es: 'Cuidado: reconfirma cualquier promesa hecha de madrugada.' },
  { ko: '주의: 남의 기준에 맞춘 성취는 오래 기쁘지 않습니다.', en: "Watch out: an achievement on someone else's terms doesn't keep.", ja: '注意: 他人の基準で得た成果は長く嬉しくありません。', zh: '注意：按别人标准取得的成就不会久乐。', fr: "Attention : un succès aux critères d'autrui ne dure pas.", es: 'Cuidado: un logro con la vara ajena no alegra mucho.' },
  { ko: '주의: 요약본만 읽고 판단하려 하고 있습니다.', en: "Watch out: you're deciding from the summary alone.", ja: '注意: 要約だけ読んで判断しようとしています。', zh: '注意：你在只凭摘要下判断。', fr: 'Attention : vous décidez à partir du seul résumé.', es: 'Cuidado: estás decidiendo solo con el resumen.' },
  { ko: '주의: 지친 상태에서 새로운 약속을 늘리지 마세요.', en: "Watch out: don't add commitments while you're depleted.", ja: '注意: 疲れている時に新しい約束を増やさないで。', zh: '注意：疲惫时别再加新的承诺。', fr: "Attention : n'ajoutez pas d'engagements quand vous êtes vidé.", es: 'Cuidado: no sumes compromisos estando agotado.' },
  { ko: '주의: 고맙다는 말이 오래 밀리면 빚처럼 굳습니다.', en: 'Watch out: thanks left unsaid too long hardens into debt.', ja: '注意: 感謝を先送りすると借りのように固まります。', zh: '注意：道谢拖久了会凝成亏欠。', fr: 'Attention : un merci trop différé se fige en dette.', es: 'Cuidado: un gracias muy aplazado se endurece en deuda.' },
  { ko: '주의: 성급한 일반화가 한 사람을 놓치게 합니다.', en: 'Watch out: a hasty generalisation loses you one real person.', ja: '注意: 早すぎる一般化が一人を見失わせます。', zh: '注意：草率的以偏概全会让你错过一个人。', fr: "Attention : une généralisation hâtive vous fait perdre quelqu'un.", es: 'Cuidado: generalizar rápido te hace perder a alguien.' },
  { ko: '주의: 미리 사과하며 시작하는 습관이 힘을 깎습니다.', en: 'Watch out: opening with an apology chips away at your standing.', ja: '注意: 謝罪から始める癖が力を削ります。', zh: '注意：一开口就道歉的习惯会削弱你。', fr: "Attention : commencer par s'excuser érode votre poids.", es: 'Cuidado: abrir pidiendo perdón te resta peso.' },
  { ko: '주의: 여러 번 미룬 대화는 첫마디가 더 어려워집니다.', en: 'Watch out: the more you postpone a talk, the harder the first line.', ja: '注意: 先送りするほど最初の一言が難しくなります。', zh: '注意：越拖延的对话，开口越难。', fr: 'Attention : plus on repousse, plus la première phrase pèse.', es: 'Cuidado: cuanto más lo aplazas, más cuesta la primera frase.' },
  { ko: '주의: 도구를 새로 사는 것으로 실행을 대신하고 있습니다.', en: 'Watch out: buying a new tool is standing in for doing the work.', ja: '注意: 新しい道具を買う事で実行を代えています。', zh: '注意：你在用买新工具代替动手。', fr: "Attention : acheter un outil remplace ici le fait d'agir.", es: 'Cuidado: comprar la herramienta sustituye al hacerlo.' },
  { ko: '주의: 자주 확인하는 것이 진행을 늦추고 있습니다.', en: "Watch out: checking too often is what's slowing it down.", ja: '注意: 頻繁な確認が進行を遅らせています。', zh: '注意：频繁查看正在拖慢进度。', fr: "Attention : vérifier trop souvent ralentit l'avancée.", es: 'Cuidado: comprobar tanto es lo que lo frena.' },
  { ko: '주의: 좋아하는 사람의 조언일수록 한 번 걸러 들으세요.', en: 'Watch out: filter advice more, not less, when you like the source.', ja: '注意: 好きな人の助言ほど一度濾して聞いて。', zh: '注意：越喜欢的人给的建议越要过滤。', fr: "Attention : filtrez d'autant plus le conseil d'un proche apprécié.", es: 'Cuidado: filtra más el consejo de quien te cae bien.' },
  { ko: '주의: 어제의 성공 방식이 오늘의 조건과 다릅니다.', en: "Watch out: yesterday's winning method meets different conditions today.", ja: '注意: 昨日の成功法は今日の条件と違います。', zh: '注意：昨天的成功方法遇上了不同的条件。', fr: "Attention : la méthode d'hier rencontre d'autres conditions.", es: 'Cuidado: el método de ayer topa con otras condiciones.' },
  { ko: '주의: 예상보다 오래 걸릴 일을 짧게 잡고 있습니다.', en: "Watch out: you've budgeted too little time for this.", ja: '注意: 長引く仕事を短く見積もっています。', zh: '注意：你把耗时的事估短了。', fr: 'Attention : vous sous-estimez le temps nécessaire.', es: 'Cuidado: has presupuestado muy poco tiempo.' },
  { ko: '주의: 화면 속 사람과 자신의 하루를 견주고 있습니다.', en: "Watch out: you're measuring your day against someone's screen.", ja: '注意: 画面の中の人と自分の一日を比べています。', zh: '注意：你在拿自己的一天比屏幕里的人。', fr: 'Attention : vous comparez votre journée à un écran.', es: 'Cuidado: comparas tu día con el de una pantalla.' },
  { ko: '주의: 마무리 없이 다음 것을 시작하려 합니다.', en: "Watch out: you're starting the next one without closing this one.", ja: '注意: 締めずに次を始めようとしています。', zh: '注意：还没收尾就想开始下一个。', fr: "Attention : vous démarrez la suite sans clore l'actuel.", es: 'Cuidado: empiezas lo siguiente sin cerrar esto.' },
  { ko: '주의: 조언을 구할 사람을 이미 답을 정해두고 고릅니다.', en: "Watch out: you're picking the adviser whose answer you already want.", ja: '注意: 欲しい答えをくれる人を選んでいます。', zh: '注意：你在挑那个会给你想要答案的人。', fr: 'Attention : vous choisissez le conseiller à la réponse voulue.', es: 'Cuidado: eliges al asesor cuya respuesta ya quieres.' },
  { ko: '주의: 사소한 통증을 계속 다음으로 미루고 있습니다.', en: 'Watch out: you keep pushing a small pain to later.', ja: '注意: 小さな痛みを後回しにし続けています。', zh: '注意：你一直把小疼痛推到以后。', fr: 'Attention : vous repoussez sans cesse une petite douleur.', es: 'Cuidado: sigues aplazando un dolor pequeño.' },
  { ko: '주의: 여럿이 정한 일에 아무도 책임지지 않습니다.', en: 'Watch out: what the group decided, no one will own.', ja: '注意: 皆で決めた事は誰も責任を取りません。', zh: '注意：大家一起定的事，没人会负责。', fr: "Attention : ce que le groupe décide, personne ne l'assume.", es: 'Cuidado: lo que decide el grupo no lo asume nadie.' },
  { ko: '주의: 과거의 실수를 근거로 오늘을 낮게 잡고 있습니다.', en: "Watch out: you're pricing today off an old mistake.", ja: '注意: 昔の失敗を根拠に今日を低く見積もっています。', zh: '注意：你在用旧错误低估今天。', fr: "Attention : vous bradez aujourd'hui à cause d'une vieille erreur.", es: 'Cuidado: estás rebajando hoy por un error viejo.' },
  { ko: '주의: 예외를 한 번 허용하면 규칙이 사라집니다.', en: 'Watch out: allow the exception once and the rule is gone.', ja: '注意: 例外を一度許すと規則は消えます。', zh: '注意：破例一次，规则就没了。', fr: 'Attention : une exception accordée et la règle disparaît.', es: 'Cuidado: una excepción y la regla desaparece.' },
  { ko: '주의: 데이터가 아니라 인상으로 결론을 내고 있습니다.', en: "Watch out: you're concluding from impression, not data.", ja: '注意: データでなく印象で結論を出しています。', zh: '注意：你在凭印象而非数据下结论。', fr: 'Attention : vous concluez sur une impression, pas des données.', es: 'Cuidado: concluyes por impresión, no por datos.' },
  { ko: '주의: 상대의 최악을 상상하고 그것에 답하고 있습니다.', en: "Watch out: you're answering the worst version you imagined of them.", ja: '注意: 相手の最悪を想像しそれに返しています。', zh: '注意：你在回应自己想象出的对方最坏的样子。', fr: "Attention : vous répondez au pire que vous imaginez d'eux.", es: 'Cuidado: respondes a la peor versión que imaginaste.' },
  { ko: '주의: 오늘 아낀 시간을 오늘 안에 다 써버립니다.', en: 'Watch out: the time you saved today gets spent by tonight.', ja: '注意: 今日浮いた時間は今日中に消えます。', zh: '注意：今天省下的时间，今天就花光了。', fr: "Attention : le temps gagné aujourd'hui part avant ce soir.", es: 'Cuidado: el tiempo ahorrado hoy se va esta noche.' },
  { ko: '주의: 잘 아는 길일수록 확인을 건너뜁니다.', en: 'Watch out: the more familiar the route, the more checks you skip.', ja: '注意: 慣れた道ほど確認を飛ばします。', zh: '注意：越熟的路越会跳过检查。', fr: 'Attention : plus la route est connue, moins on vérifie.', es: 'Cuidado: cuanto más conocida la ruta, menos compruebas.' },
  { ko: '주의: 남는 시간에 하겠다고 미룬 일은 남지 않습니다.', en: 'Watch out: what you saved for spare time never gets the time.', ja: '注意: 空いた時間にと回した事に時間は来ません。', zh: '注意：留到有空再做的事，永远不会有空。', fr: "Attention : ce qu'on garde pour le temps libre n'en a jamais.", es: 'Cuidado: lo dejado para el tiempo libre nunca lo tiene.' },
  { ko: '주의: 첫인상을 근거로 능력을 판단하고 있습니다.', en: "Watch out: you're judging capability from a first impression.", ja: '注意: 第一印象で能力を判断しています。', zh: '注意：你在凭第一印象判断能力。', fr: 'Attention : vous jugez la compétence sur une première impression.', es: 'Cuidado: juzgas la capacidad por la primera impresión.' },
  { ko: '주의: 계획이 촘촘할수록 어긋났을 때 크게 무너집니다.', en: 'Watch out: the tighter the plan, the harder it falls when it slips.', ja: '注意: 計画が細かいほど崩れた時に大きく崩れます。', zh: '注意：计划越密，一旦错位塌得越狠。', fr: 'Attention : plus le plan est serré, plus la chute est rude.', es: 'Cuidado: cuanto más apretado el plan, peor la caída.' },
  { ko: '주의: 이미 결정된 일을 다시 논의하며 힘을 씁니다.', en: "Watch out: you're spending energy re-debating a settled matter.", ja: '注意: 決まった事を蒸し返して力を使っています。', zh: '注意：你在为已定之事反复讨论而耗力。', fr: 'Attention : vous dépensez à rediscuter ce qui est tranché.', es: 'Cuidado: gastas energía redebatiendo lo ya decidido.' },
  { ko: '주의: 남에게 관대한 기준을 자신에게는 적용하지 않습니다.', en: 'Watch out: the standard you give others, you deny yourself.', ja: '注意: 人に許す基準を自分には適用しません。', zh: '注意：你对别人宽容的标准，从不用在自己身上。', fr: 'Attention : la mesure offerte aux autres, vous vous la refusez.', es: 'Cuidado: la vara que das a otros te la niegas a ti.' },
  { ko: '주의: 여기서 그만두면 아깝다는 생각이 판단을 막습니다.', en: 'Watch out: it would be a waste to stop now is blocking your judgment.', ja: '注意: ここで止めると勿体無いが判断を塞ぎます。', zh: '注意：现在停就可惜了，这念头正堵住你的判断。', fr: "Attention : ce serait dommage d'arrêter bloque votre jugement.", es: 'Cuidado: sería una pena parar te está bloqueando el juicio.' },
  { ko: '주의: 회복을 보상으로 미루지 말고 일정에 넣으세요.', en: 'Watch out: schedule recovery instead of treating it as a reward.', ja: '注意: 回復をご褒美にせず予定に入れて。', zh: '注意：别把恢复当奖励，把它排进日程。', fr: "Attention : planifiez le repos au lieu d'en faire une récompense.", es: 'Cuidado: agenda el descanso en vez de premiarlo.' },
  { ko: '주의: 좋은 의도가 통보의 방식까지 정당화하지는 않습니다.', en: "Watch out: good intent doesn't excuse how you delivered it.", ja: '注意: 善意は伝え方まで正当化しません。', zh: '注意：好意并不能为通知的方式开脱。', fr: "Attention : la bonne intention n'excuse pas la manière.", es: 'Cuidado: la buena intención no justifica el modo.' },
  { ko: '주의: 완성도를 높이는 동안 기회의 창이 닫힙니다.', en: 'Watch out: while you polish, the window is closing.', ja: '注意: 完成度を上げる間に機会の窓が閉じます。', zh: '注意：你在打磨时，机会之窗正在关闭。', fr: 'Attention : pendant que vous peaufinez, la fenêtre se ferme.', es: 'Cuidado: mientras pules, la ventana se cierra.' },
  { ko: '주의: 한 사람의 반대를 전체의 반대로 읽고 있습니다.', en: "Watch out: you're reading one objection as everyone's.", ja: '注意: 一人の反対を全体の反対と読んでいます。', zh: '注意：你把一个人的反对读成了所有人的。', fr: 'Attention : vous lisez une objection comme celle de tous.', es: 'Cuidado: lees una objeción como si fuera de todos.' },
  { ko: '주의: 자주 쓰는 변명이 슬슬 신뢰를 갉습니다.', en: 'Watch out: your go-to excuse is starting to cost you.', ja: '注意: 使い慣れた言い訳が信頼を削り始めます。', zh: '注意：你惯用的借口开始磨损信任。', fr: 'Attention : votre excuse habituelle commence à coûter cher.', es: 'Cuidado: tu excusa de siempre empieza a costarte.' },
  { ko: '주의: 감정이 가라앉기 전에 기록을 남기지 마세요.', en: "Watch out: don't put it in writing before the feeling settles.", ja: '注意: 感情が収まる前に書き残さないで。', zh: '注意：情绪平复前别落成文字。', fr: "Attention : n'écrivez rien avant que l'émotion retombe.", es: 'Cuidado: no lo pongas por escrito antes de calmarte.' },
  { ko: '주의: 모르는 것을 아는 척하면 도움을 받을 기회가 닫힙니다.', en: 'Watch out: faking knowledge closes the door on being helped.', ja: '注意: 知ったふりは助けを受ける道を閉じます。', zh: '注意：装懂会关上求助的门。', fr: "Attention : faire semblant de savoir ferme la porte à l'aide.", es: 'Cuidado: fingir saber cierra la puerta a que te ayuden.' },
  { ko: '주의: 오늘 결정하지 않으면 상황이 대신 결정합니다.', en: "Watch out: if you don't decide today, circumstance decides for you.", ja: '注意: 今日決めなければ状況が代わりに決めます。', zh: '注意：今天不决定，情势会替你决定。', fr: 'Attention : si vous ne tranchez pas, les circonstances le feront.', es: 'Cuidado: si no decides hoy, decide la circunstancia.' },
  { ko: '주의: 신뢰를 시험하려 던진 말이 신뢰를 깎습니다.', en: 'Watch out: words thrown to test trust are what spend it.', ja: '注意: 信頼を試す言葉が信頼を減らします。', zh: '注意：用来试探信任的话，正在消耗信任。', fr: 'Attention : les mots qui testent la confiance la dépensent.', es: 'Cuidado: las palabras que prueban la confianza la gastan.' },
  { ko: '주의: 조용한 불만은 어느 날 형식을 갖춰 돌아옵니다.', en: 'Watch out: quiet discontent returns one day in formal dress.', ja: '注意: 静かな不満はいつか形式を整えて戻ります。', zh: '注意：沉默的不满有一天会带着格式回来。', fr: 'Attention : un mécontentement tu revient un jour formalisé.', es: 'Cuidado: el descontento callado vuelve un día formalizado.' },
  { ko: '주의: 상대의 시간을 무료로 계산하고 있지 않은지 보세요.', en: "Watch out: check whether you're pricing someone's time at zero.", ja: '注意: 相手の時間を無料と数えていないか。', zh: '注意：看看你是不是把对方的时间算成免费。', fr: "Attention : ne comptez pas à zéro le temps d'autrui.", es: 'Cuidado: no cuentes en cero el tiempo del otro.' },
  { ko: '주의: 오늘의 편안함이 내일의 선택지를 줄입니다.', en: "Watch out: today's comfort narrows tomorrow's options.", ja: '注意: 今日の楽が明日の選択肢を狭めます。', zh: '注意：今天的舒适会缩窄明天的选项。', fr: "Attention : le confort d'aujourd'hui réduit les choix de demain.", es: 'Cuidado: la comodidad de hoy estrecha las opciones de mañana.' },
  { ko: '주의: 누구도 묻지 않은 사정을 먼저 설명하고 있습니다.', en: "Watch out: you're explaining circumstances nobody asked about.", ja: '注意: 誰も聞いていない事情を先に説明しています。', zh: '注意：你在解释没人问过的缘由。', fr: "Attention : vous expliquez ce que personne n'a demandé.", es: 'Cuidado: explicas circunstancias que nadie preguntó.' },
  { ko: '주의: 한 번의 예외가 관행이 되는 데는 두 번이면 됩니다.', en: 'Watch out: it takes only twice for an exception to become custom.', ja: '注意: 例外が慣例になるには二度で足ります。', zh: '注意：例外变惯例，两次就够。', fr: "Attention : deux fois suffisent pour qu'une exception fasse règle.", es: 'Cuidado: bastan dos veces para que la excepción sea norma.' },
  { ko: '주의: 잘 되던 관계에 처음으로 계산이 끼어듭니다.', en: 'Watch out: arithmetic enters a relationship that had none.', ja: '注意: 上手くいっていた関係に初めて計算が入ります。', zh: '注意：一向融洽的关系里第一次掺进了算计。', fr: 'Attention : le calcul entre dans une relation qui en manquait.', es: 'Cuidado: el cálculo entra en una relación que no lo tenía.' },
  { ko: '주의: 최선을 다했다는 말로 점검을 건너뛰지 마세요.', en: 'Watch out: I did my best is not a substitute for a review.', ja: '注意: 全力を尽くしたで点検を飛ばさないで。', zh: '注意：别用尽力了跳过复盘。', fr: "Attention : j'ai fait de mon mieux ne remplace pas la revue.", es: 'Cuidado: hice lo que pude no sustituye una revisión.' },
  { ko: '주의: 남이 정리해 준 정보만으로 방향을 잡고 있습니다.', en: "Watch out: you're steering by information someone else curated.", ja: '注意: 人が整理した情報だけで方向を決めています。', zh: '注意：你只凭别人整理的信息定方向。', fr: 'Attention : vous naviguez sur des infos triées par un autre.', es: 'Cuidado: te guías solo con información que curó otro.' },
  { ko: '주의: 익숙한 불편을 문제로 세지 않고 있습니다.', en: "Watch out: a familiar discomfort isn't being counted as a problem.", ja: '注意: 慣れた不便を問題として数えていません。', zh: '注意：习以为常的不便没被算作问题。', fr: "Attention : un inconfort habituel n'est plus compté comme problème.", es: 'Cuidado: una molestia habitual ya no cuenta como problema.' },
  { ko: '주의: 상대의 호의를 능력으로 오해할 수 있습니다.', en: "Watch out: someone's goodwill can be mistaken for your competence.", ja: '注意: 相手の好意を自分の実力と誤解しがちです。', zh: '注意：容易把对方的善意误当成自己的能力。', fr: "Attention : la bienveillance d'autrui se confond avec votre mérite.", es: 'Cuidado: la buena voluntad ajena se confunde con tu mérito.' },
  { ko: '주의: 시작을 알리는 데 힘을 다 쓰고 있습니다.', en: "Watch out: you're spending all the energy on announcing the start.", ja: '注意: 始めると告げる事に力を使い切っています。', zh: '注意：你把力气全花在宣布开始上了。', fr: "Attention : toute l'énergie part dans l'annonce du départ.", es: 'Cuidado: gastas toda la energía en anunciar el comienzo.' },
  { ko: '주의: 답장이 늦는 것을 마음이 식은 것으로 읽지 마세요.', en: 'Watch out: a slow reply is not proof of a cooled heart.', ja: '注意: 返信の遅さを心変わりと読まないで。', zh: '注意：回复慢不等于心冷了。', fr: "Attention : une réponse lente n'est pas un cœur refroidi.", es: 'Cuidado: una respuesta lenta no prueba desafecto.' },
  { ko: '주의: 오늘 미룬 대화가 내일의 오해가 됩니다.', en: "Watch out: the talk you skip today is tomorrow's misunderstanding.", ja: '注意: 今日避けた会話が明日の誤解になります。', zh: '注意：今天避开的对话会变成明天的误会。', fr: "Attention : la discussion évitée aujourd'hui est le malentendu de demain.", es: 'Cuidado: la charla que evitas hoy es el malentendido de mañana.' },
  { ko: '주의: 잘 지내냐는 물음에 반사적으로 대답하지 마세요.', en: "Watch out: don't answer how are you on reflex today.", ja: '注意: 元気かの問いに反射で答えないで。', zh: '注意：别对还好吗条件反射式作答。', fr: 'Attention : ne répondez pas par réflexe à ça va.', es: 'Cuidado: no respondas por reflejo a qué tal.' },
];

const KEYWORD: L[] = [
  { ko: '정리', en: 'Clearing', ja: '整理', zh: '整理', fr: 'Tri', es: 'Orden' },
  { ko: '연결', en: 'Connection', ja: 'つながり', zh: '连接', fr: 'Lien', es: 'Conexión' },
  { ko: '속도', en: 'Pace', ja: '速度', zh: '节奏', fr: 'Rythme', es: 'Ritmo' },
  { ko: '경계', en: 'Boundary', ja: '境界', zh: '界限', fr: 'Limite', es: 'Límite' },
  { ko: '회복', en: 'Recovery', ja: '回復', zh: '恢复', fr: 'Repos', es: 'Descanso' },
  { ko: '시작', en: 'Beginning', ja: '始まり', zh: '开始', fr: 'Départ', es: 'Comienzo' },
  { ko: '마무리', en: 'Closure', ja: '仕上げ', zh: '收尾', fr: 'Clôture', es: 'Cierre' },
  { ko: '용기', en: 'Nerve', ja: '勇気', zh: '勇气', fr: 'Cran', es: 'Valor' },
  { ko: '여백', en: 'Space', ja: '余白', zh: '留白', fr: 'Espace', es: 'Espacio' },
  { ko: '솔직함', en: 'Candor', ja: '率直さ', zh: '坦率', fr: 'Franchise', es: 'Franqueza' },
  { ko: '기다림', en: 'Patience', ja: '待つこと', zh: '等待', fr: 'Patience', es: 'Paciencia' },
  { ko: '호기심', en: 'Curiosity', ja: '好奇心', zh: '好奇', fr: 'Curiosité', es: 'Curiosidad' },
  { ko: '절제', en: 'Restraint', ja: '節度', zh: '克制', fr: 'Retenue', es: 'Mesura' },
  { ko: '표현', en: 'Expression', ja: '表現', zh: '表达', fr: 'Expression', es: 'Expresión' },
  { ko: '신뢰', en: 'Trust', ja: '信頼', zh: '信任', fr: 'Confiance', es: 'Confianza' },
  { ko: '전환', en: 'Turning', ja: '転換', zh: '转向', fr: 'Bascule', es: 'Giro' },
  { ko: '리듬', en: 'Rhythm', ja: 'リズム', zh: '节奏', fr: 'Rythme', es: 'Ritmo' },
  { ko: '거리', en: 'Distance', ja: '距離', zh: '距离', fr: 'Distance', es: 'Distancia' },
  { ko: '복원', en: 'Repair', ja: '修復', zh: '修复', fr: 'Réparation', es: 'Reparación' },
  { ko: '선택', en: 'Choice', ja: '選択', zh: '选择', fr: 'Choix', es: 'Elección' },
  { ko: '증거', en: 'Evidence', ja: '証拠', zh: '证据', fr: 'Preuve', es: 'Prueba' },
  { ko: '초대', en: 'Invitation', ja: '招待', zh: '邀请', fr: 'Invitation', es: 'Invitación' },
  { ko: '무게', en: 'Weight', ja: '重さ', zh: '分量', fr: 'Poids', es: 'Peso' },
  { ko: '반복', en: 'Repetition', ja: '反復', zh: '重复', fr: 'Répétition', es: 'Repetición' },
  { ko: '온도', en: 'Temperature', ja: '温度', zh: '温度', fr: 'Température', es: 'Temperatura' },
  { ko: '문턱', en: 'Threshold', ja: '敷居', zh: '门槛', fr: 'Seuil', es: 'Umbral' },
  { ko: '수선', en: 'Mending', ja: '繕い', zh: '缝补', fr: 'Raccommodage', es: 'Remiendo' },
  { ko: '여유', en: 'Slack', ja: 'ゆとり', zh: '余裕', fr: 'Marge', es: 'Holgura' },
  { ko: '기록', en: 'Record', ja: '記録', zh: '记录', fr: 'Trace', es: 'Registro' },
  { ko: '질문', en: 'Question', ja: '問い', zh: '提问', fr: 'Question', es: 'Pregunta' },
  { ko: '보폭', en: 'Stride', ja: '歩幅', zh: '步幅', fr: 'Foulée', es: 'Zancada' },
  { ko: '정직', en: 'Honesty', ja: '正直', zh: '诚实', fr: 'Honnêteté', es: 'Honestidad' },
  { ko: '경청', en: 'Listening', ja: '傾聴', zh: '倾听', fr: 'Écoute', es: 'Escucha' },
  { ko: '발견', en: 'Discovery', ja: '発見', zh: '发现', fr: 'Découverte', es: 'Descubrimiento' },
  { ko: '지속', en: 'Endurance', ja: '持続', zh: '持续', fr: 'Endurance', es: 'Constancia' },
  { ko: '놓아줌', en: 'Letting go', ja: '手放し', zh: '放手', fr: 'Lâcher-prise', es: 'Soltar' },
  { ko: '담백함', en: 'Plainness', ja: '素直さ', zh: '朴素', fr: 'Sobriété', es: 'Sencillez' },
  { ko: '결', en: 'Grain', ja: '木目', zh: '纹理', fr: 'Grain', es: 'Veta' },
  { ko: '환기', en: 'Airing', ja: '換気', zh: '换气', fr: 'Aération', es: 'Ventilación' },
  { ko: '보류', en: 'Hold', ja: '保留', zh: '搁置', fr: 'Suspens', es: 'Pausa' },
  { ko: '착지', en: 'Landing', ja: '着地', zh: '落地', fr: 'Atterrissage', es: 'Aterrizaje' },
  { ko: '잔여', en: 'Remainder', ja: '残り', zh: '余量', fr: 'Reste', es: 'Resto' },
  { ko: '첫줄', en: 'First line', ja: '一行目', zh: '首行', fr: 'Première ligne', es: 'Primera línea' },
  { ko: '겹침', en: 'Overlap', ja: '重なり', zh: '重叠', fr: 'Chevauchement', es: 'Solapamiento' },
  { ko: '각도', en: 'Angle', ja: '角度', zh: '角度', fr: 'Angle', es: 'Ángulo' },
  { ko: '허용', en: 'Permission', ja: '許容', zh: '容许', fr: 'Permission', es: 'Permiso' },
  { ko: '잔불', en: 'Embers', ja: '残り火', zh: '余烬', fr: 'Braises', es: 'Rescoldo' },
  { ko: '밑그림', en: 'Underdrawing', ja: '下絵', zh: '底稿', fr: 'Esquisse', es: 'Boceto' },
  { ko: '입구', en: 'Entrance', ja: '入口', zh: '入口', fr: 'Entrée', es: 'Entrada' },
  { ko: '체온', en: 'Warmth', ja: '体温', zh: '体温', fr: 'Chaleur', es: 'Calor' },
  { ko: '고백', en: 'Confession', ja: '告白', zh: '坦白', fr: 'Aveu', es: 'Confesión' },
  { ko: '접점', en: 'Contact point', ja: '接点', zh: '接点', fr: 'Point de contact', es: 'Punto de contacto' },
  { ko: '정박', en: 'Anchoring', ja: '停泊', zh: '停泊', fr: 'Mouillage', es: 'Fondeo' },
  { ko: '환산', en: 'Conversion', ja: '換算', zh: '换算', fr: 'Conversion', es: 'Conversión' },
  { ko: '빈손', en: 'Empty hands', ja: '手ぶら', zh: '空手', fr: 'Mains vides', es: 'Manos vacías' },
  { ko: '표면', en: 'Surface', ja: '表面', zh: '表面', fr: 'Surface', es: 'Superficie' },
  { ko: '징검다리', en: 'Stepping stone', ja: '飛び石', zh: '踏石', fr: 'Pierre de gué', es: 'Peldaño' },
  { ko: '잔향', en: 'Resonance', ja: '余韻', zh: '余韵', fr: 'Résonance', es: 'Resonancia' },
  { ko: '초점', en: 'Focus', ja: '焦点', zh: '焦点', fr: 'Mise au point', es: 'Foco' },
  { ko: '잠복', en: 'Latency', ja: '潜伏', zh: '潜伏', fr: 'Latence', es: 'Latencia' },
  { ko: '환대', en: 'Welcome', ja: 'もてなし', zh: '款待', fr: 'Accueil', es: 'Acogida' },
  { ko: '문장', en: 'Sentence', ja: '一文', zh: '句子', fr: 'Phrase', es: 'Frase' },
  { ko: '교차', en: 'Crossing', ja: '交差', zh: '交叉', fr: 'Croisement', es: 'Cruce' },
  { ko: '두께', en: 'Thickness', ja: '厚み', zh: '厚度', fr: 'Épaisseur', es: 'Grosor' },
  { ko: '초대장', en: 'Invitation card', ja: '招待状', zh: '请柬', fr: "Carton d'invitation", es: 'Invitación' },
  { ko: '낙차', en: 'Drop', ja: '落差', zh: '落差', fr: 'Dénivelé', es: 'Desnivel' },
  { ko: '환절기', en: 'Turning season', ja: '季節の変わり目', zh: '换季', fr: 'Entre-saison', es: 'Cambio de estación' },
  { ko: '보폭 조절', en: 'Pacing', ja: 'ペース配分', zh: '调步', fr: 'Allure', es: 'Dosificación' },
  { ko: '여운', en: 'Afterglow', ja: '余情', zh: '余味', fr: 'Persistance', es: 'Poso' },
  { ko: '실마리', en: 'Loose thread', ja: '糸口', zh: '线头', fr: 'Fil conducteur', es: 'Cabo suelto' },
  { ko: '굳은살', en: 'Callus', ja: 'たこ', zh: '老茧', fr: 'Corne', es: 'Callo' },
  { ko: '환류', en: 'Backflow', ja: '還流', zh: '回流', fr: 'Reflux', es: 'Reflujo' },
  { ko: '반보', en: 'Half step', ja: '半歩', zh: '半步', fr: 'Demi-pas', es: 'Medio paso' },
  { ko: '정오', en: 'Noon', ja: '正午', zh: '正午', fr: 'Midi', es: 'Mediodía' },
  { ko: '기울기', en: 'Slope', ja: '傾き', zh: '斜度', fr: 'Pente', es: 'Pendiente' },
  { ko: '빈자리', en: 'Empty seat', ja: '空席', zh: '空位', fr: 'Place vide', es: 'Asiento vacío' },
  { ko: '호명', en: 'Being named', ja: '呼名', zh: '点名', fr: 'Appel', es: 'Ser nombrado' },
  { ko: '해빙', en: 'Thaw', ja: '雪解け', zh: '解冻', fr: 'Dégel', es: 'Deshielo' },
  { ko: '결선', en: 'Final round', ja: '決勝', zh: '决赛', fr: 'Finale', es: 'Final' },
  { ko: '눈높이', en: 'Eye level', ja: '目線', zh: '视线高度', fr: 'Hauteur des yeux', es: 'Altura de los ojos' },
  { ko: '여백 두기', en: 'Leaving margin', ja: '余白を取る', zh: '留白', fr: 'Garder la marge', es: 'Dejar margen' },
  { ko: '실측', en: 'Measuring', ja: '実測', zh: '实测', fr: 'Mesure réelle', es: 'Medición' },
  { ko: '장마', en: 'Long rain', ja: '長雨', zh: '连雨', fr: 'Longue pluie', es: 'Lluvia larga' },
  { ko: '첫눈', en: 'First snow', ja: '初雪', zh: '初雪', fr: 'Première neige', es: 'Primera nieve' },
  { ko: '귀가', en: 'Coming home', ja: '帰宅', zh: '归家', fr: 'Retour', es: 'Regreso' },
  { ko: '잔잔함', en: 'Stillness', ja: '静けさ', zh: '平静', fr: 'Calme', es: 'Quietud' },
  { ko: '바깥', en: 'Outside', ja: '外', zh: '外面', fr: 'Dehors', es: 'Afuera' },
  { ko: '고쳐 쓰기', en: 'Rewriting', ja: '書き直し', zh: '改写', fr: 'Réécriture', es: 'Reescritura' },
  { ko: '느린 답', en: 'Slow answer', ja: '遅い返事', zh: '慢答', fr: 'Réponse lente', es: 'Respuesta lenta' },
  { ko: '한 뼘', en: "A hand's width", ja: '一手', zh: '一拃', fr: 'Un empan', es: 'Un palmo' },
  { ko: '모서리', en: 'Corner', ja: '角', zh: '棱角', fr: 'Coin', es: 'Esquina' },
  { ko: '갈무리', en: 'Wrapping up', ja: '仕舞い', zh: '收束', fr: 'Rangement', es: 'Cierre' },
  { ko: '첫차', en: 'First train', ja: '始発', zh: '首班车', fr: 'Premier train', es: 'Primer tren' },
  { ko: '멀리 보기', en: 'Long view', ja: '遠望', zh: '远望', fr: 'Vue longue', es: 'Mirada larga' },
  { ko: '손끝', en: 'Fingertips', ja: '指先', zh: '指尖', fr: 'Bout des doigts', es: 'Yemas' },
  { ko: '되짚기', en: 'Retracing', ja: '辿り直し', zh: '回溯', fr: 'Retour sur ses pas', es: 'Retrazar' },
];

// 안정적 선택: (기준 + 주기키 + 축이름) 해시로 인덱스
function pick<T>(arr: T[], seed: string): T { return arr[hash(seed) % arr.length]; }

/**
 * 점수 등급이 쓰는 오프닝 어조. 85점 카드에 "마음을 갉아먹습니다"가 뜨면 점수와
 * 문장이 서로를 부정한다 — 2026-09-09 랜딩에서 실제로 1·2위가 그랬다.
 *
 * 등급마다 **하나의 어조**만 쓴다. 예전에는 good 이 up|flat 을 함께 쓰는 식으로
 * 겹쳤는데, 겹치는 풀은 순환 추첨의 보장을 깬다: 같은 문장이 어제는 great 스트림
 * 에서, 오늘은 good 스트림에서 나와 **하루 만에 재등장**했다(실측 최소 간격 1일).
 * 어조당 스트림 하나로 두면 등급이 매일 바뀌어도 t 가 하루씩 전진하므로 보장이
 * 그대로 유지된다.
 */
const TONE_FOR: Record<'great' | 'good' | 'normal' | 'careful', Tone> = {
  great: 'up',
  good: 'up',
  normal: 'flat',
  careful: 'down',
};

export interface FortuneReading {
  opening: string; focus: string; advice: string; caution: string; keyword: string;
}
export function reading(
  elementIdx: number, period: Period, base: string, locale: Locale, d = new Date(),
  /** 점수 등급. 주면 오프닝 어조를 등급에 맞춰 고른다. */
  scoreGrade?: 'great' | 'good' | 'normal' | 'careful',
): FortuneReading {
  const el = FIVE_ELEMENTS[elementIdx];
  const t = stepIndex(period, d);
  // 오행 고유 풀 + 공용 풀. 오행 풀만 쓰면 한 카드가 10문장 안에서만 돈다.
  const all = [...OPENING[el], ...SHARED_OPENING];
  const tone = scoreGrade ? TONE_FOR[scoreGrade] : null;
  const pool = tone ? all.filter((o) => o.t === tone) : all;
  // 순환 추첨 — 풀을 한 바퀴 다 돌기 전에는 같은 문장이 다시 나오지 않는다.
  // 시드는 어조까지만 담는다(등급이 아니라). 축마다 시드를 달리해 다섯 축이
  // 나란히 갱신되지 않게 한다.
  const open = pickCycled(pool.length ? pool : all, `${base}|open|${tone ?? 'any'}`, t);
  const foc = pickCycled(FOCUS, `${base}|focus`, t);
  const adv = pickCycled(ADVICE, `${base}|advice`, t);
  const cau = pickCycled(CAUTION, `${base}|caution`, t);
  const key = pickCycled(KEYWORD, `${base}|keyword`, t);
  return { opening: open[locale], focus: foc[locale], advice: adv[locale], caution: cau[locale], keyword: key[locale] };
}

/** 코퍼스 조합 수 — 페이지 카피에서 "몇 가지 조합인가"를 주장할 때 이 값을 쓴다. */
export const CORPUS_COMBINATIONS =
  (Object.values(OPENING).reduce((n, arr) => n + arr.length, 0) / FIVE_ELEMENTS.length + SHARED_OPENING.length)
  * FOCUS.length * ADVICE.length * CAUTION.length * KEYWORD.length;

/**
 * 한 카드가 같은 문장을 다시 보기까지 걸리는 최소 주기 수. 순환 추첨이 풀을
 * 한 바퀴 다 돌기 때문에, 가장 얕은 축·등급의 실효 풀 크기가 곧 그 거리다.
 */
export const MIN_CYCLE_BEFORE_REPEAT = Math.min(
  ...[FOCUS.length, ADVICE.length, CAUTION.length, KEYWORD.length].map(guaranteedGap),
  // 오프닝은 등급별 어조 필터를 거치므로, 등급이 실제로 쓰는 합집합이 하한이다.
  // 오프닝은 어조별 스트림이므로 가장 얕은 어조 풀이 하한이다.
  ...Object.values(TONE_FOR).map((tone) =>
    Math.min(...FIVE_ELEMENTS.map((e) =>
      guaranteedGap([...OPENING[e], ...SHARED_OPENING].filter((o) => o.t === tone).length)))),
);

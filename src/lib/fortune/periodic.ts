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
export function pickCycled<T>(arr: T[], seed: string, t: number): T {
  const n = arr.length;
  if (n <= 1) return arr[0];
  const cycle = Math.floor(t / n);
  const pos = t - cycle * n;
  const perm = permutation(n, seed, cycle);
  // 회차 경계에서만 같은 항목이 연달아 나올 수 있다. 그때는 순열의 앞 두 항을
  // **맞바꾼다.** 첫 항만 건너뛰면 그 항이 pos 0 과 1 에 연달아 나와, 막으려던
  // 붙어 나오기가 한 칸 뒤로 옮겨갈 뿐이다.
  if (n > 2 && perm[0] === permutation(n, seed, cycle - 1)[n - 1]) {
    if (pos === 0) return arr[perm[1]];
    if (pos === 1) return arr[perm[0]];
  }
  return arr[perm[pos]];
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
];

// 안정적 선택: (기준 + 주기키 + 축이름) 해시로 인덱스
function pick<T>(arr: T[], seed: string): T { return arr[hash(seed) % arr.length]; }

/** 점수 등급이 허용하는 오프닝 어조. 85점 카드에 "마음을 갉아먹습니다"가 뜨면
 *  점수와 문장이 서로를 부정한다 — 2026-09-09 랜딩에서 실제로 1·2위가 그랬다. */
const TONES_FOR: Record<'great' | 'good' | 'normal' | 'careful', Tone[]> = {
  great: ['up'],
  good: ['up', 'flat'],
  normal: ['flat', 'up'],
  careful: ['down', 'flat'],
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
  const allowed = scoreGrade ? TONES_FOR[scoreGrade] : null;
  const pool = allowed
    // 허용 어조 안에서만 고른다. 어느 등급에도 후보가 0이 되지 않도록
    // 비면 전체 풀로 되돌린다.
    ? all.filter((o) => allowed.includes(o.t))
    : all;
  // 순환 추첨 — 풀을 한 바퀴 다 돌기 전에는 같은 문장이 다시 나오지 않는다.
  // 축마다 시드를 달리해 다섯 축이 나란히 갱신되지 않게 한다.
  const open = pickCycled(pool.length ? pool : all, `${base}|open|${scoreGrade ?? 'any'}`, t);
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
  FOCUS.length, ADVICE.length, CAUTION.length, KEYWORD.length,
  // 오프닝은 등급별 어조 필터를 거치므로, 등급이 실제로 쓰는 합집합이 하한이다.
  ...Object.values(TONES_FOR).map((tones) =>
    Math.min(...FIVE_ELEMENTS.map((e) =>
      [...OPENING[e], ...SHARED_OPENING].filter((o) => tones.includes(o.t)).length))),
);

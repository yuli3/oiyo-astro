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
    { ko: '곧게 자라나려는 의지가 강해지는 시기입니다.', en: 'The will to grow straight and tall is strengthening.', ja: 'まっすぐ伸びようとする意志が強まる時期です。', zh: '想要笔直生长的意志正在增强。', fr: 'La volonté de croître droit et haut se renforce.', es: 'La voluntad de crecer recto y alto se fortalece.' },
    { ko: '새로운 가지를 뻗어볼 좋은 타이밍입니다.', en: 'A good time to branch out into something new.', ja: '新しい枝を伸ばすのに良いタイミングです。', zh: '是伸展新枝的好时机。', fr: 'Un bon moment pour vous ouvrir à quelque chose de nouveau.', es: 'Un buen momento para abrirte a algo nuevo.' },
    { ko: '뿌리내림과 성장 사이에서 균형을 찾아야 합니다.', en: 'Find the balance between putting down roots and growing upward.', ja: '根を張ることと成長の間でバランスを取るべきです。', zh: '需要在扎根与成长之间找到平衡。', fr: "Trouvez l'équilibre entre enraciner et grandir.", es: 'Encuentra el equilibrio entre echar raíces y crecer.' },
  ],
  fire: [
    { ko: '열정이 분명한 성과로 이어질 시기입니다.', en: 'Passion is poised to turn into visible results.', ja: '情熱が成果に変わる時期です。', zh: '热情正要化为可见的成果。', fr: 'La passion se transforme en résultats visibles.', es: 'La pasión se vuelve resultados visibles.' },
    { ko: '드러내되 다 태우지 않는 균형이 중요합니다.', en: 'Shine, but keep the balance not to burn out.', ja: '輝きつつ燃え尽きない均衡が大切。', zh: '发光但别耗尽，平衡最重要。', fr: 'Brillez sans vous consumer.', es: 'Brilla sin quemarte.' },
    { ko: '안에서 타오르는 열기가 겉으로 드러나기 시작합니다.', en: 'The heat burning within begins to show on the outside.', ja: '内で燃える熱が外に現れ始めます。', zh: '内心燃烧的热情开始显现于外。', fr: 'La chaleur qui brûle en vous commence à se voir.', es: 'El calor que arde dentro empieza a notarse fuera.' },
    { ko: '밝게 비추는 존재감이 주변을 끌어당깁니다.', en: 'A brightly shining presence draws others in.', ja: '明るく照らす存在感が周りを引き寄せます。', zh: '明亮的存在感吸引着周围的人。', fr: 'Une présence rayonnante attire les autres.', es: 'Una presencia radiante atrae a los demás.' },
    { ko: '속도보다 지속하는 불꽃이 필요한 때입니다.', en: 'A moment that calls for a flame that lasts, not just burns fast.', ja: '速さより長く続く炎が必要な時です。', zh: '此刻需要的是持久而非急速的火焰。', fr: 'Un moment qui demande une flamme durable, pas seulement rapide.', es: 'Un momento que pide una llama duradera, no solo rápida.' },
  ],
  earth: [
    { ko: '단단히 다지는 안정의 흐름입니다.', en: 'A steady, grounding flow of stability.', ja: '地に足のついた安定の流れ。', zh: '踏实稳固的稳定气流。', fr: 'Un flux stable qui vous ancre.', es: 'Un flujo estable que te ancla.' },
    { ko: '약속과 신뢰가 자산이 됩니다.', en: 'Promises kept become real assets.', ja: '約束と信頼が資産になります。', zh: '守信将成为你的资产。', fr: 'Les promesses tenues deviennent des atouts.', es: 'Las promesas cumplidas se vuelven activos.' },
    { ko: '천천히 그러나 확실하게 기반이 다져집니다.', en: 'Slowly but surely, the foundation solidifies.', ja: 'ゆっくりだが確実に基盤が固まります。', zh: '根基正在缓慢而稳固地夯实。', fr: 'Lentement mais sûrement, les bases se consolident.', es: 'Lenta pero firmemente, la base se consolida.' },
    { ko: '현실적인 계획이 오히려 큰 힘을 냅니다.', en: 'A realistic plan turns out to carry real power.', ja: '現実的な計画がむしろ大きな力を発揮します。', zh: '务实的计划反而能发挥更大的力量。', fr: 'Un plan réaliste se révèle étonnamment puissant.', es: 'Un plan realista resulta sorprendentemente poderoso.' },
    { ko: '주변 사람을 품는 넉넉함이 빛을 발합니다.', en: 'A generous spirit that embraces others shines through.', ja: '周りの人を包む余裕が輝きを放ちます。', zh: '包容他人的宽厚之心正在闪光。', fr: 'Une générosité qui accueille les autres se met à briller.', es: 'Una generosidad que acoge a los demás empieza a brillar.' },
  ],
  metal: [
    { ko: '정리하고 벼려낼수록 날카로워집니다.', en: 'The more you refine and cut away, the sharper you become.', ja: '整え研ぐほど鋭くなります。', zh: '越是整理磨砺，越显锋利。', fr: 'Plus vous affinez, plus vous êtes tranchant.', es: 'Cuanto más pules, más afilado estás.' },
    { ko: '원칙을 지키는 선택이 결실을 부릅니다.', en: 'Choices that hold your principles bear fruit.', ja: '原則を守る選択が実を結びます。', zh: '坚守原则的选择会结果。', fr: 'Les choix fidèles à vos principes portent leurs fruits.', es: 'Las decisiones fieles a tus principios dan fruto.' },
    { ko: '불필요한 것을 덜어낼수록 본질이 선명해집니다.', en: 'The more you cut away the unnecessary, the clearer the essence becomes.', ja: '不要なものを削るほど本質が鮮明になります。', zh: '越是删繁就简，本质越发清晰。', fr: "Plus vous éliminez le superflu, plus l'essentiel s'éclaircit.", es: 'Cuanto más eliminas lo innecesario, más claro se vuelve lo esencial.' },
    { ko: '명확한 기준이 흔들리던 상황을 정리합니다.', en: 'A clear standard settles a situation that had been unstable.', ja: '明確な基準が揺れていた状況を整理します。', zh: '明确的标准会理清一度动摇的局面。', fr: "Un critère clair remet de l'ordre dans une situation instable.", es: 'Un criterio claro ordena una situación inestable.' },
    { ko: '결단이 필요한 순간에 주저하지 않는 것이 유리합니다.', en: 'When a decision is needed, not hesitating works in your favor.', ja: '決断が必要な瞬間にためらわないことが有利です。', zh: '在需要决断之时不犹豫会对你有利。', fr: 'Ne pas hésiter au moment de décider joue en votre faveur.', es: 'No dudar en el momento de decidir juega a tu favor.' },
  ],
  water: [
    { ko: '흐르듯 적응하는 지혜가 빛납니다.', en: 'The wisdom to adapt like water shines.', ja: '水のように適応する知恵が光ります。', zh: '如水般顺应的智慧闪光。', fr: "La sagesse de s'adapter comme l'eau brille.", es: 'Brilla la sabiduría de fluir como el agua.' },
    { ko: '깊이 관찰하면 기회의 물길이 보입니다.', en: 'Observe deeply and the channel of opportunity appears.', ja: '深く観れば機会の水路が見えます。', zh: '深观则见机会之流。', fr: "Observez en profondeur et le canal de l'opportunité apparaît.", es: 'Observa a fondo y verás el cauce de la oportunidad.' },
    { ko: '막히면 돌아가는 유연함이 길을 열어줍니다.', en: 'The flexibility to go around a blockage opens the way.', ja: '詰まったら回り道する柔軟さが道を開きます。', zh: '受阻时懂得绕行的灵活会为你开路。', fr: 'La souplesse de contourner un obstacle ouvre la voie.', es: 'La flexibilidad de rodear un obstáculo abre el camino.' },
    { ko: '고요히 흐르는 생각이 답을 찾아냅니다.', en: 'Quietly flowing thoughts find their way to the answer.', ja: '静かに流れる思考が答えを見つけ出します。', zh: '静静流淌的思绪会找到答案。', fr: 'Des pensées qui coulent tranquillement trouvent la réponse.', es: 'Pensamientos que fluyen en calma encuentran la respuesta.' },
    { ko: '낮은 곳으로 향하는 겸손함이 신뢰를 쌓습니다.', en: 'A humility that flows to the lowest place builds trust.', ja: '低きに向かう謙虚さが信頼を築きます。', zh: '如水般流向低处的谦逊会积累信任。', fr: 'Une humilité qui coule vers le plus bas construit la confiance.', es: 'Una humildad que fluye hacia lo más bajo construye confianza.' },
  ],
};

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

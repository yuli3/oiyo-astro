// 꿈 상징 사전 SSOT.
//
// 설계 방침(2026-09-02 세운 지시): 상징 하나에 긴 글 한 편씩 붙이는 대신
// **짧은 항목을 넓게** 모은다. 사람들이 실제로 꾸는 꿈의 폭을 몇 화면 안에
// 담는 것이 목표이고, 이 데이터가 해몽 도구의 입력이자 우리 데이터셋이 된다.
//
// 로케일별 텍스트를 필드마다 흩지 않고 l10n 아래 한 덩어리로 묶는다. 필드마다
// Record<Locale, ...> 를 쓰면 상징이 늘 때 같은 상징의 문장들이 파일 곳곳으로
// 흩어져 번역을 맞춰 보기 어렵다.
//
// 태도: 해몽은 문화적 상징 해석이지 예측이 아니다. traditional 과 psych 를
// 필드로 나눠 두는 것이 이 사전의 핵심이다 — 섞이면 관습이 근거처럼,
// 연구가 점술처럼 읽힌다.
import type { Locale } from '../i18n';

// person 은 2026-09-03 에 더했다 — 꿈에 나오는 '사람'은 생물이나 삶의 사건과
// 성격이 다르다. 전 연인·낯선 사람·유명인·돌아가신 분이 여기 들어간다.
export type DreamCategory = 'body' | 'nature' | 'motion' | 'creature' | 'life' | 'place' | 'person';

export interface DreamScene {
  /** 꿈의 장면. "맑은 물이 흐른다" 처럼 짧게. */
  when: string;
  /** 그 장면에 붙어 온 전통적 읽기. */
  reads: string;
}

export interface DreamReading {
  name: string;
  keywords: string[];
  /** 해몽서 계열의 읽기. 관찰이 아니라 유비에서 온 것이라는 전제 위에 쓴다. */
  traditional: string;
  /** 꿈 내용 연구의 관점. 단정하지 않는다. */
  psych: string;
  scenes: DreamScene[];
}

export interface DreamSymbol {
  /** 라우트 세그먼트. /{locale}/dream/{id} */
  id: string;
  emoji: string;
  category: DreamCategory;
  /** 함께 보면 좋은 상징 id. 상호 참조는 양방향으로 맞춘다. */
  related: string[];
  /** 긴 해설이 explainers 컬렉션에 따로 있는 상징. 없으면 이 데이터만 보여 준다. */
  hasArticle?: boolean;
  l10n: Record<Locale, DreamReading>;
}

export const DREAM_CATEGORY_LABELS: Record<DreamCategory, Record<Locale, string>> = {
  body: { ko: '몸', en: 'Body', ja: '身体', zh: '身体', fr: 'Corps', es: 'Cuerpo' },
  nature: { ko: '자연', en: 'Nature', ja: '自然', zh: '自然', fr: 'Nature', es: 'Naturaleza' },
  motion: { ko: '움직임', en: 'Motion', ja: '動き', zh: '动作', fr: 'Mouvement', es: 'Movimiento' },
  creature: { ko: '생물', en: 'Creatures', ja: '生き物', zh: '生物', fr: 'Créatures', es: 'Criaturas' },
  life: { ko: '삶의 사건', en: 'Life events', ja: '人生の出来事', zh: '人生事件', fr: 'Événements de vie', es: 'Sucesos vitales' },
  place: { ko: '장소·사물', en: 'Places & things', ja: '場所・物', zh: '场所与物', fr: 'Lieux et objets', es: 'Lugares y objetos' },
  person: { ko: '사람', en: 'People', ja: '人', zh: '人物', fr: 'Personnes', es: 'Personas' },
};

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    id: 'late', emoji: '⏰', category: 'life', related: ['exam', 'lost', 'chased', 'car'],
    l10n: {
      ko: { name: '늦는 꿈', keywords: ['압박', '준비', '마감', '초조'],
        traditional: '약속이나 시험에 늦는 꿈은 준비가 덜 되었다는 신호로 읽혔습니다. 서둘러도 닿지 않는 장면은 지금 벅찬 일이 있다는 뜻으로 보았습니다.',
        psych: '시험·지각처럼 평가와 마감이 걸린 장면은 스트레스가 높은 시기에 더 자주 보고되는 축에 듭니다. 실제로 늦을 일을 예고하지는 않습니다.',
        scenes: [ { when: '아무리 서둘러도 늦는다', reads: '감당하기 벅찬 일이 있다고 보았습니다.' }, { when: '길이 막혀 못 간다', reads: '바깥 사정에 발이 묶인다고 읽혔습니다.' }, { when: '늦었는데 아무도 뭐라 하지 않는다', reads: '걱정만큼 큰일은 아니라는 뜻으로 보았습니다.' } ] },
      en: { name: 'Being late', keywords: ['pressure', 'preparation', 'deadline', 'urgency'],
        traditional: 'Arriving late to an appointment or exam was read as a sign of not being ready. Hurrying and still not arriving meant something currently beyond your capacity.',
        psych: 'Scenes involving evaluation and deadlines — exams, lateness — are among those reported more often in high-stress periods. They do not forecast an actual delay.',
        scenes: [ { when: 'However much you hurry, you are late', reads: 'Taken as something you feel unable to keep up with.' }, { when: 'The road is blocked and you cannot get there', reads: 'Read as being held up by outside circumstances.' }, { when: 'You are late and nobody minds', reads: 'Seen as the matter being smaller than the worry.' } ] },
      ja: { name: '遅刻する夢', keywords: ['プレッシャー', '準備', '締切', '焦り'],
        traditional: '約束や試験に遅れる夢は、準備が足りない合図として読まれました。急いでも間に合わない場面は、いま手に余る事があるという意と見ました。',
        psych: '試験や遅刻のように評価と締切が絡む場面は、ストレスの高い時期により多く報告される部類に入ります。実際に遅れる事を予告するものではありません。',
        scenes: [ { when: 'どれだけ急いでも遅れる', reads: '手に余る事があると見ました。' }, { when: '道が塞がれて行けない', reads: '外の事情に足を取られると読まれました。' }, { when: '遅れたが誰も咎めない', reads: '心配ほど大事ではない意と見ました。' } ] },
      zh: { name: '迟到的梦', keywords: ['压力', '准备', '截止', '焦躁'],
        traditional: '梦见赴约或赶考迟到，被读作准备不足的信号。再急也赶不到，读作眼下有力所不及之事。',
        psych: '考试、迟到这类牵涉评价与期限的场景，属于高压时期报告更多的一类。它并不预告真的会迟到。',
        scenes: [ { when: '再怎么赶也迟到', reads: '视为有难以跟上的事。' }, { when: '路被堵住去不了', reads: '读作被外部情况绊住。' }, { when: '迟到了却无人在意', reads: '看作事情没有担心的那么大。' } ] },
      fr: { name: 'Être en retard', keywords: ['pression', 'préparation', 'échéance', 'urgence'],
        traditional: "Arriver en retard à un rendez-vous ou un examen se lisait comme un signe de manque de préparation. Se hâter sans arriver signalait une charge présentement au-dessus de vos moyens.",
        psych: "Les scènes mêlant évaluation et échéance — examens, retards — comptent parmi celles davantage rapportées en période de stress. Elles n'annoncent pas un retard réel.",
        scenes: [ { when: 'Vous avez beau vous hâter, vous êtes en retard', reads: "Pris pour quelque chose que vous ne sentez pas pouvoir suivre." }, { when: 'La route est bloquée', reads: 'Lu comme être retenu par des circonstances extérieures.' }, { when: 'Vous arrivez en retard et personne ne réagit', reads: "Vu comme une affaire plus petite que l'inquiétude." } ] },
      es: { name: 'Llegar tarde', keywords: ['presión', 'preparación', 'plazo', 'urgencia'],
        traditional: 'Llegar tarde a una cita o examen se leía como señal de no estar listo. Darse prisa y aun así no llegar señalaba algo que ahora excede tus fuerzas.',
        psych: 'Las escenas con evaluación y plazos —exámenes, tardanzas— están entre las más reportadas en periodos de estrés. No pronostican un retraso real.',
        scenes: [ { when: 'Por más que te apures, llegas tarde', reads: 'Tomado como algo que no sientes poder seguir.' }, { when: 'El camino está bloqueado', reads: 'Leído como quedar retenido por circunstancias externas.' }, { when: 'Llegas tarde y a nadie le importa', reads: 'Visto como un asunto menor que la preocupación.' } ] },
    },
  },
  {
    id: 'car', emoji: '🚗', category: 'motion', related: ['falling', 'late', 'lost'],
    l10n: {
      ko: { name: '자동차가 통제 안 되는 꿈', keywords: ['통제', '브레이크', '방향', '속도'],
        traditional: '수레나 말이 말을 듣지 않는 꿈은 일이 뜻대로 되지 않는 것으로 읽혔습니다. 오늘날의 해몽도 브레이크가 듣지 않는 장면을 감당 못 할 속도로 봅니다.',
        psych: '꿈 내용 연구는 여기에 예언을 붙이지 않습니다. 다만 통제를 잃는 장면 자체가 자주 보고되는 유형이고, 추락 꿈과 같은 계열로 다뤄지기도 합니다.',
        scenes: [ { when: '브레이크가 듣지 않는다', reads: '멈추어야 할 일을 멈추지 못한다고 보았습니다.' }, { when: '뒷좌석에 앉아 있는데 차가 달린다', reads: '내 일인데 내가 몰지 못한다는 뜻으로 읽혔습니다.' }, { when: '길을 벗어난다', reads: '방향을 다시 잡아야 한다고 보았습니다.' } ] },
      en: { name: 'A car out of control', keywords: ['control', 'brakes', 'direction', 'speed'],
        traditional: 'A cart or horse that would not obey was read as matters not going as intended. Modern readings treat failing brakes the same way: a speed you cannot hold.',
        psych: 'Content research attaches no prophecy here. Losing control is, however, a frequently reported scene type, sometimes grouped with falling dreams.',
        scenes: [ { when: 'The brakes do not work', reads: 'Taken as being unable to stop what should stop.' }, { when: 'You are in the back seat while the car drives', reads: 'Read as your own matter being driven by someone else.' }, { when: 'You leave the road', reads: 'Seen as needing to take the direction again.' } ] },
      ja: { name: '車が制御できない夢', keywords: ['制御', 'ブレーキ', '方向', '速度'],
        traditional: '車や馬が言うことを聞かない夢は、事が思い通りに運ばないこととして読まれました。今日の読み方もブレーキが効かない場面を、手に負えない速度と見ます。',
        psych: '夢内容の研究はここに予言を付けません。ただ制御を失う場面自体はよく報告される類型で、落下の夢と同じ系列として扱われることもあります。',
        scenes: [ { when: 'ブレーキが効かない', reads: '止めるべき事を止められないと見ました。' }, { when: '後部座席にいるのに車が走る', reads: '自分の事なのに自分が運転していない意と読まれました。' }, { when: '道を外れる', reads: '方向を取り直す必要があると見ました。' } ] },
      zh: { name: '车失控的梦', keywords: ['控制', '刹车', '方向', '速度'],
        traditional: '车马不听使唤的梦，被读作事情不遂人意。今天的解读也把刹车失灵看作难以掌控的速度。',
        psych: '内容研究不在此附加预言。不过"失去控制"本身是常被报告的场景类型，有时与坠落梦归为一类。',
        scenes: [ { when: '刹车不灵', reads: '视为该停的事停不下来。' }, { when: '坐在后座车却自行开动', reads: '读作自己的事却不由自己把方向。' }, { when: '偏离道路', reads: '看作需要重新校准方向。' } ] },
      fr: { name: 'Une voiture incontrôlable', keywords: ['contrôle', 'freins', 'direction', 'vitesse'],
        traditional: "Un attelage ou un cheval qui n'obéit pas se lisait comme des affaires qui ne vont pas comme voulu. Les lectures actuelles traitent de même les freins qui lâchent : une vitesse que l'on ne tient pas.",
        psych: "La recherche sur le contenu n'y attache aucune prophétie. La perte de contrôle est toutefois un type de scène fréquemment rapporté, parfois rapproché des rêves de chute.",
        scenes: [ { when: 'Les freins ne répondent pas', reads: "Pris comme l'incapacité d'arrêter ce qui devrait s'arrêter." }, { when: "Vous êtes à l'arrière et la voiture roule", reads: 'Lu comme votre affaire conduite par un autre.' }, { when: 'Vous quittez la route', reads: 'Vu comme la nécessité de reprendre la direction.' } ] },
      es: { name: 'Un coche sin control', keywords: ['control', 'frenos', 'dirección', 'velocidad'],
        traditional: 'Un carro o caballo que no obedece se leía como asuntos que no van según lo previsto. Las lecturas actuales tratan igual los frenos que fallan: una velocidad que no puedes sostener.',
        psych: 'La investigación de contenido no añade profecía aquí. Perder el control sí es un tipo de escena reportado con frecuencia, a veces agrupado con los sueños de caída.',
        scenes: [ { when: 'Los frenos no responden', reads: 'Tomado como no poder detener lo que debería detenerse.' }, { when: 'Vas atrás y el coche avanza solo', reads: 'Leído como que tu asunto lo conduce otro.' }, { when: 'Te sales de la carretera', reads: 'Visto como la necesidad de retomar el rumbo.' } ] },
    },
  },
  {
    id: 'ghost', emoji: '👻', category: 'creature', related: ['deceased', 'chased', 'paralysis'],
    l10n: {
      ko: { name: '귀신·유령', keywords: ['두려움', '미해결', '경계', '가위'],
        traditional: '귀신이 나오는 꿈은 풀리지 않은 일이나 조심할 자리로 읽혔습니다. 쫓아내는 장면은 액을 물리치는 것으로, 붙잡히는 장면은 아직 놓지 못한 것으로 보았습니다.',
        psych: '꿈 내용 연구는 여기에 실체를 붙이지 않습니다. 특히 잠들거나 깨는 경계에서 나타나는 인기척은 수면 마비와 함께 오는 감각 경험으로 설명되는 편입니다.',
        scenes: [ { when: '귀신을 쫓아낸다', reads: '걸려 있던 일이 풀린다고 보았습니다.' }, { when: '귀신에게 붙잡힌다', reads: '아직 매듭짓지 못한 일이 있다고 읽혔습니다.' }, { when: '귀신이 말을 건넨다', reads: '들어야 할 말이 있다는 뜻으로 보았습니다.' } ] },
      en: { name: 'A ghost', keywords: ['fear', 'unresolved', 'threshold', 'paralysis'],
        traditional: 'A ghost was read as something unresolved or a place to be careful. Driving it away meant warding off misfortune; being seized meant something not yet let go.',
        psych: 'Content research attaches no entity here. A sensed presence at the edge of falling asleep or waking is generally explained as part of the sensory experience that accompanies sleep paralysis.',
        scenes: [ { when: 'You drive the ghost away', reads: 'Taken as a stuck matter loosening.' }, { when: 'The ghost seizes you', reads: 'Read as something still unfinished.' }, { when: 'The ghost speaks to you', reads: 'Seen as words you need to hear.' } ] },
      ja: { name: '幽霊', keywords: ['恐れ', '未解決', '境目', '金縛り'],
        traditional: '幽霊が出る夢は、解けていない事や用心すべき場として読まれました。追い払う場面は厄を退けること、捕まる場面はまだ手放せていない事と見ました。',
        psych: '夢内容の研究はここに実体を付けません。特に寝入りや目覚めの境目に現れる人の気配は、金縛りに伴う感覚体験として説明される方です。',
        scenes: [ { when: '幽霊を追い払う', reads: '引っかかっていた事が解けると見ました。' }, { when: '幽霊に捕まる', reads: 'まだ片づいていない事があると読まれました。' }, { when: '幽霊が話しかける', reads: '聞くべき言葉があるという意と見ました。' } ] },
      zh: { name: '鬼魂', keywords: ['恐惧', '未了结', '临界', '鬼压床'],
        traditional: '梦见鬼魂被读作尚未了结之事或需当心之处。驱走读作避开灾厄，被抓住读作仍未放下之事。',
        psych: '内容研究不在此赋予实体。尤其在入睡或醒来的临界出现的"有人在场"之感，通常被解释为伴随睡眠瘫痪的感觉体验。',
        scenes: [ { when: '把鬼赶走', reads: '视为卡住的事松动。' }, { when: '被鬼抓住', reads: '读作仍有未了之事。' }, { when: '鬼开口说话', reads: '看作有该听的话。' } ] },
      fr: { name: 'Un fantôme', keywords: ['peur', 'non résolu', 'seuil', 'paralysie'],
        traditional: "Le fantôme se lisait comme un non-résolu ou un lieu où être prudent. Le chasser, c'était écarter le malheur ; être saisi, quelque chose qu'on n'a pas lâché.",
        psych: "La recherche sur le contenu n'y met aucune entité. Une présence ressentie au seuil de l'endormissement ou du réveil s'explique généralement comme part de l'expérience sensorielle accompagnant la paralysie du sommeil.",
        scenes: [ { when: 'Vous chassez le fantôme', reads: "Pris comme une affaire bloquée qui se dénoue." }, { when: 'Le fantôme vous saisit', reads: "Lu comme quelque chose d'encore inachevé." }, { when: 'Le fantôme vous parle', reads: "Vu comme des mots qu'il vous faut entendre." } ] },
      es: { name: 'Un fantasma', keywords: ['miedo', 'sin resolver', 'umbral', 'parálisis'],
        traditional: 'El fantasma se leía como algo sin resolver o un lugar donde ir con cuidado. Ahuyentarlo era apartar la desgracia; ser apresado, algo aún no soltado.',
        psych: 'La investigación de contenido no pone aquí ninguna entidad. Una presencia percibida en el umbral del sueño o del despertar suele explicarse como parte de la experiencia sensorial que acompaña a la parálisis del sueño.',
        scenes: [ { when: 'Ahuyentas al fantasma', reads: 'Tomado como un asunto atascado que se afloja.' }, { when: 'El fantasma te agarra', reads: 'Leído como algo aún inconcluso.' }, { when: 'El fantasma te habla', reads: 'Visto como palabras que necesitas oír.' } ] },
    },
  },
  {
    id: 'paralysis', emoji: '😰', category: 'body', related: ['ghost', 'chased', 'falling'],
    l10n: {
      ko: { name: '가위눌림 (수면 마비)', keywords: ['수면 마비', '깨어 있음', '압박감', '환각'],
        traditional: '가위에 눌린다는 말은 오래 쓰였고, 기운이 눌리거나 잡귀가 든 것으로 읽혔습니다. 소금을 뿌리거나 자리를 옮기는 대응이 함께 전해졌습니다.',
        psych: '이것은 꿈이라기보다 **설명이 있는 생리 현상**입니다. 렘수면에서는 몸의 근육이 일시적으로 움직이지 않는데, 의식이 먼저 깨면 그 상태를 자각하게 됩니다. 가슴이 눌리는 느낌과 사람의 기척은 이때 함께 오는 흔한 감각입니다. 수면 부족과 불규칙한 취침이 빈도를 높인다고 보고됩니다.',
        scenes: [ { when: '몸이 움직이지 않는다', reads: '전통에서는 눌린 것으로 보았고, 지금은 렘수면의 근육 이완이 남아 있는 상태로 설명합니다.' }, { when: '누군가 곁에 있는 느낌이 든다', reads: '이 상태에서 흔히 함께 오는 감각으로 알려져 있습니다.' }, { when: '숨이 막힌다고 느낀다', reads: '가슴 압박감 역시 자주 보고되는 감각입니다.' } ] },
      en: { name: 'Sleep paralysis', keywords: ['sleep paralysis', 'awake', 'pressure', 'hallucination'],
        traditional: 'Being "pressed" in sleep is an old expression, read as being weighed down by a force or visited by a spirit, with remedies such as scattering salt or moving where you sleep.',
        psych: 'This is less a dream than a physiological event with an explanation. During REM sleep the body’s muscles are temporarily immobile; when consciousness wakes first, you become aware of that state. A weight on the chest and a sensed presence are common sensations that come with it. Sleep deprivation and irregular sleep times are reported to raise its frequency.',
        scenes: [ { when: 'Your body will not move', reads: 'Traditionally read as being pressed; now explained as REM muscle atonia persisting into waking.' }, { when: 'You sense someone beside you', reads: 'Known as a sensation that commonly accompanies this state.' }, { when: 'You feel unable to breathe', reads: 'Chest pressure is likewise a frequently reported sensation.' } ] },
      ja: { name: '金縛り（睡眠麻痺）', keywords: ['睡眠麻痺', '覚醒', '圧迫感', '幻覚'],
        traditional: '金縛りという言葉は古くから使われ、気に押される、あるいは霊に憑かれると読まれました。塩をまく、寝る場所を変えるといった対処も伝えられました。',
        psych: 'これは夢というより**説明のある生理現象**です。レム睡眠では体の筋肉が一時的に動かなくなり、意識が先に目覚めるとその状態を自覚します。胸の圧迫感や人の気配は、このとき伴いやすい感覚です。睡眠不足と不規則な就寝が頻度を上げると報告されます。',
        scenes: [ { when: '体が動かない', reads: '伝統では押されたと見ましたが、今はレム睡眠の筋弛緩が残った状態として説明します。' }, { when: '誰かがそばにいる感じがする', reads: 'この状態でよく伴う感覚として知られています。' }, { when: '息が詰まると感じる', reads: '胸の圧迫感もよく報告される感覚です。' } ] },
      zh: { name: '鬼压床（睡眠瘫痪）', keywords: ['睡眠瘫痪', '清醒', '压迫感', '幻觉'],
        traditional: '"鬼压床"是流传已久的说法，被读作被气所压或撞见邪祟，并伴有撒盐、换睡处之类的应对。',
        psych: '与其说是梦，不如说是**有解释的生理现象**。快速眼动睡眠中身体肌肉暂时无法活动；若意识先醒来，你就会察觉到这种状态。胸口受压和"有人在场"的感觉是常伴随的体验。睡眠不足与作息不规律被报告会提高其频率。',
        scenes: [ { when: '身体动不了', reads: '传统读作被压；如今解释为快速眼动期的肌张力缺失延续到清醒。' }, { when: '感到有人在旁', reads: '这是该状态常伴随的感觉。' }, { when: '感觉喘不上气', reads: '胸口压迫同样是常被报告的感觉。' } ] },
      fr: { name: 'La paralysie du sommeil', keywords: ['paralysie du sommeil', 'éveil', 'oppression', 'hallucination'],
        traditional: "Être « pressé » dans le sommeil est une expression ancienne, lue comme un poids ou la visite d'un esprit, avec des remèdes tels que répandre du sel ou changer de place pour dormir.",
        psych: "Il s'agit moins d'un rêve que d'un phénomène physiologique expliqué. En sommeil paradoxal, les muscles du corps sont temporairement immobiles ; si la conscience s'éveille d'abord, on prend conscience de cet état. Un poids sur la poitrine et une présence ressentie sont des sensations fréquentes. Le manque de sommeil et des horaires irréguliers en augmentent la fréquence, d'après les travaux disponibles.",
        scenes: [ { when: 'Votre corps ne bouge pas', reads: "Lu autrefois comme une oppression ; expliqué aujourd'hui par l'atonie musculaire du sommeil paradoxal qui persiste au réveil." }, { when: 'Vous sentez une présence à côté de vous', reads: "Connue comme une sensation qui accompagne couramment cet état." }, { when: 'Vous vous sentez incapable de respirer', reads: "L'oppression thoracique est également une sensation souvent rapportée." } ] },
      es: { name: 'Parálisis del sueño', keywords: ['parálisis del sueño', 'vigilia', 'opresión', 'alucinación'],
        traditional: 'Ser «aplastado» durante el sueño es una expresión antigua, leída como un peso o la visita de un espíritu, con remedios como esparcir sal o cambiar el lugar donde se duerme.',
        psych: 'Más que un sueño, es un fenómeno fisiológico con explicación. En el sueño REM los músculos del cuerpo quedan temporalmente inmóviles; si la consciencia despierta antes, uno se percata de ese estado. El peso en el pecho y la presencia percibida son sensaciones frecuentes. La falta de sueño y los horarios irregulares se reportan como factores que elevan su frecuencia.',
        scenes: [ { when: 'Tu cuerpo no se mueve', reads: 'Antes leído como opresión; hoy se explica por la atonía muscular del sueño REM que persiste al despertar.' }, { when: 'Sientes que alguien está a tu lado', reads: 'Conocida como una sensación que suele acompañar a este estado.' }, { when: 'Sientes que no puedes respirar', reads: 'La opresión en el pecho es también una sensación reportada con frecuencia.' } ] },
    },
  },
  {
    id: 'ex-partner', emoji: '💔', category: 'person', related: ['stranger', 'deceased', 'chased'],
    l10n: {
      ko: { name: '전 연인', keywords: ['미련', '마무리', '자기 일부', '재회'],
        traditional: '해몽서는 옛 인연이 나오는 꿈을 마무리되지 않은 일로 읽었습니다. 다시 만나 웃는 장면은 매듭이 풀리는 것으로, 다투는 장면은 아직 남은 감정으로 보았습니다.',
        psych: '꿈 내용 연구는 이 꿈을 재회의 징조로 보지 않습니다. 오래 함께 지낸 사람은 기억에 깊이 남아 꿈의 재료로 자주 등장하며, 관계가 끝난 직후에 특히 자주 보고됩니다.',
        scenes: [ { when: '웃으며 헤어진다', reads: '남은 감정이 정리된다고 보았습니다.' }, { when: '말없이 지나친다', reads: '아직 할 말이 남았다는 뜻으로 읽혔습니다.' }, { when: '다시 사귀기로 한다', reads: '옛것을 되돌리려는 마음으로 보았습니다.' } ] },
      en: { name: 'An ex-partner', keywords: ['unfinished', 'closure', 'part of self', 'reunion'],
        traditional: 'Manuals read the return of an old tie as something left unfinished. Meeting and smiling was read as a knot loosening; quarrelling, as feeling still left over.',
        psych: 'Content research does not treat this as an omen of reunion. Someone you lived alongside for a long time is deeply encoded and appears often as dream material, and it is reported especially in the period right after a relationship ends.',
        scenes: [ { when: 'You part smiling', reads: 'Taken as leftover feeling settling.' }, { when: 'You pass without speaking', reads: 'Read as words still unsaid.' }, { when: 'You decide to get back together', reads: 'Seen as the wish to restore what was.' } ] },
      ja: { name: '元恋人', keywords: ['未練', '区切り', '自分の一部', '再会'],
        traditional: '夢占書は昔の縁が出る夢を、片づいていない事として読みました。再会して笑う場面は結び目がほどけること、争う場面はまだ残る感情と見ました。',
        psych: '夢内容の研究はこれを再会の兆しとは見ません。長く共に過ごした人は記憶に深く残り夢の素材として頻繁に現れ、関係が終わった直後に特によく報告されます。',
        scenes: [ { when: '笑って別れる', reads: '残った感情が片づくと見ました。' }, { when: '無言ですれ違う', reads: 'まだ言い残しがある意と読まれました。' }, { when: 'また付き合うことにする', reads: '昔に戻したい心と見ました。' } ] },
      zh: { name: '前任', keywords: ['未了', '收尾', '自我的一部分', '复合'],
        traditional: '解梦书把旧缘出现的梦读作尚未了结之事。重逢而笑读作心结松开，争吵读作仍有残留的情绪。',
        psych: '内容研究不把它看作复合的预兆。长期共处的人在记忆中编码很深，常成为梦的素材，尤其在关系刚结束的时期被频繁报告。',
        scenes: [ { when: '笑着道别', reads: '视为残留情绪归于平定。' }, { when: '沉默着擦身而过', reads: '读作仍有未说出口的话。' }, { when: '决定复合', reads: '看作想把从前找回来的心思。' } ] },
      fr: { name: 'Un ex', keywords: ['inachevé', 'clôture', 'part de soi', 'retrouvailles'],
        traditional: "Les manuels lisaient le retour d'un ancien lien comme quelque chose d'inachevé. Se revoir en souriant : un nœud qui se défait ; se disputer : un reste d'émotion.",
        psych: "La recherche sur le contenu n'y voit pas un présage de retrouvailles. Une personne longtemps côtoyée est profondément encodée et revient souvent comme matériau, surtout dans la période qui suit une rupture.",
        scenes: [ { when: 'Vous vous quittez en souriant', reads: "Pris comme un reste d'émotion qui se dépose." }, { when: 'Vous vous croisez sans parler', reads: 'Lu comme des mots encore non dits.' }, { when: 'Vous décidez de vous remettre ensemble', reads: "Vu comme le souhait de restaurer ce qui fut." } ] },
      es: { name: 'Un ex', keywords: ['inconcluso', 'cierre', 'parte de uno', 'reencuentro'],
        traditional: 'Los manuales leían el regreso de un vínculo antiguo como algo sin terminar. Reencontrarse sonriendo: un nudo que se afloja; discutir: emoción todavía pendiente.',
        psych: 'La investigación de contenido no lo trata como presagio de reencuentro. Alguien con quien conviviste mucho queda profundamente codificado y aparece a menudo como material, sobre todo justo después de terminar una relación.',
        scenes: [ { when: 'Os despedís sonriendo', reads: 'Tomado como emoción pendiente que se asienta.' }, { when: 'Pasáis sin hablaros', reads: 'Leído como palabras aún no dichas.' }, { when: 'Decidís volver', reads: 'Visto como el deseo de restaurar lo que fue.' } ] },
    },
  },
  {
    id: 'stranger', emoji: '🧑‍🤝‍🧑', category: 'person', related: ['ex-partner', 'celebrity', 'lost'],
    l10n: {
      ko: { name: '낯선 사람', keywords: ['미지', '새 인연', '내 안의 타인', '경계'],
        traditional: '낯선 이가 나오는 꿈은 새 인연이나 아직 모르는 변화로 읽혔습니다. 반갑게 맞는 장면은 좋은 소식으로, 뒤따라오는 장면은 조심할 일로 보았습니다.',
        psych: '꿈 속 얼굴은 대개 완전히 새로 만들어지기보다 본 적 있는 얼굴의 조합으로 여겨집니다. 낯설게 느껴지는 것과 실제로 처음 보는 것은 다릅니다.',
        scenes: [ { when: '낯선 이가 길을 알려 준다', reads: '뜻밖의 도움이 온다고 보았습니다.' }, { when: '낯선 이가 뒤따라온다', reads: '알 수 없는 불안을 가리킨다고 읽혔습니다.' }, { when: '낯선 집에 초대받는다', reads: '새로운 자리로 들어간다는 뜻으로 보았습니다.' } ] },
      en: { name: 'A stranger', keywords: ['the unknown', 'new tie', 'other within', 'boundary'],
        traditional: 'A stranger was read as a new tie or a change not yet known. Greeting them warmly meant good news; being followed meant something to be careful about.',
        psych: 'Faces in dreams are generally thought to be recombinations of faces already seen rather than wholly new inventions. Feeling unfamiliar and being genuinely new are not the same thing.',
        scenes: [ { when: 'A stranger shows you the way', reads: 'Taken as unexpected help arriving.' }, { when: 'A stranger follows you', reads: 'Read as pointing to an anxiety you cannot name.' }, { when: 'You are invited into an unfamiliar house', reads: 'Seen as entering a new position.' } ] },
      ja: { name: '見知らぬ人', keywords: ['未知', '新しい縁', '内なる他者', '境界'],
        traditional: '見知らぬ人が出る夢は新しい縁やまだ知らない変化として読まれました。快く迎える場面は良い知らせ、後をついてくる場面は用心すべき事と見ました。',
        psych: '夢の中の顔は、まったく新しく作られるより見たことのある顔の組み合わせと考えられています。見慣れなく感じることと、実際に初めて見ることは別です。',
        scenes: [ { when: '見知らぬ人が道を教えてくれる', reads: '思わぬ助けが来ると見ました。' }, { when: '見知らぬ人が後をついてくる', reads: '正体の分からない不安を指すと読まれました。' }, { when: '見知らぬ家に招かれる', reads: '新しい場に入る意と見ました。' } ] },
      zh: { name: '陌生人', keywords: ['未知', '新缘分', '内在的他者', '边界'],
        traditional: '梦见陌生人被读作新的缘分或尚未知晓的变化。热情相迎读作好消息，被尾随读作需要留心之事。',
        psych: '梦中的面孔一般被认为是已见过的面孔的重组，而非全新创造。"感觉陌生"与"确实首次见到"并不相同。',
        scenes: [ { when: '陌生人为你指路', reads: '视为意外的帮助到来。' }, { when: '陌生人尾随你', reads: '读作指向说不清的不安。' }, { when: '被邀入陌生的房子', reads: '看作进入新的位置。' } ] },
      fr: { name: 'Un inconnu', keywords: ['inconnu', 'nouveau lien', "l'autre en soi", 'frontière'],
        traditional: "L'inconnu se lisait comme un lien nouveau ou un changement encore ignoré. L'accueillir chaleureusement : bonne nouvelle ; être suivi : quelque chose dont se méfier.",
        psych: "On pense généralement que les visages du rêve recombinent des visages déjà vus plutôt qu'ils n'en inventent. Se sentir étranger et être réellement nouveau sont deux choses distinctes.",
        scenes: [ { when: 'Un inconnu vous montre le chemin', reads: "Pris comme une aide inattendue qui arrive." }, { when: 'Un inconnu vous suit', reads: "Lu comme une angoisse que vous ne savez pas nommer." }, { when: 'On vous invite dans une maison inconnue', reads: "Vu comme entrer dans une position nouvelle." } ] },
      es: { name: 'Un desconocido', keywords: ['lo desconocido', 'vínculo nuevo', 'el otro interior', 'límite'],
        traditional: 'El desconocido se leía como un vínculo nuevo o un cambio aún ignorado. Recibirlo con calidez: buenas noticias; ser seguido: algo de lo que cuidarse.',
        psych: 'Se piensa que los rostros del sueño recombinan rostros ya vistos más que inventarlos. Sentir extrañeza y ser realmente nuevo no son lo mismo.',
        scenes: [ { when: 'Un desconocido te indica el camino', reads: 'Tomado como ayuda inesperada que llega.' }, { when: 'Un desconocido te sigue', reads: 'Leído como una inquietud que no sabes nombrar.' }, { when: 'Te invitan a una casa desconocida', reads: 'Visto como entrar en una posición nueva.' } ] },
    },
  },
  {
    id: 'celebrity', emoji: '⭐', category: 'person', related: ['stranger', 'naked', 'exam'],
    l10n: {
      ko: { name: '유명인', keywords: ['선망', '인정 욕구', '이미지', '거리'],
        traditional: '귀한 사람을 만나는 꿈은 좋은 소식이나 신분의 상승으로 읽혔습니다. 가까이서 이야기를 나누는 장면일수록 크게 보았습니다.',
        psych: '꿈 내용 연구는 이 꿈을 인연의 징조로 보지 않습니다. 자주 보는 얼굴이 꿈의 재료가 되는 일은 흔하고, 미디어를 오래 본 날에 등장하기 쉽다고 보고됩니다.',
        scenes: [ { when: '유명인과 나란히 걷는다', reads: '좋은 자리에 들어간다고 보았습니다.' }, { when: '유명인에게 무시당한다', reads: '인정받고 싶은 마음이 걸려 있다고 읽혔습니다.' }, { when: '유명인이 내 집에 온다', reads: '뜻밖의 귀한 소식으로 보았습니다.' } ] },
      en: { name: 'A celebrity', keywords: ['aspiration', 'need for recognition', 'image', 'distance'],
        traditional: 'Meeting a person of high standing was read as good news or a rise in station, and the closer the conversation the larger the reading.',
        psych: 'Content research does not treat this as an omen about a connection. Faces seen often become dream material, and such dreams are reported more after a day of heavy media exposure.',
        scenes: [ { when: 'You walk beside a celebrity', reads: 'Taken as entering a good position.' }, { when: 'A celebrity ignores you', reads: 'Read as a wish for recognition being caught on something.' }, { when: 'A celebrity comes to your home', reads: 'Seen as unexpected good news.' } ] },
      ja: { name: '有名人', keywords: ['憧れ', '承認欲求', 'イメージ', '距離'],
        traditional: '貴い人に会う夢は良い知らせや身分の上昇として読まれました。近くで話を交わす場面ほど大きく見ました。',
        psych: '夢内容の研究はこれを縁の兆しとは見ません。よく見る顔が夢の素材になるのはありふれており、メディアを長く見た日に現れやすいと報告されます。',
        scenes: [ { when: '有名人と並んで歩く', reads: '良い場に入ると見ました。' }, { when: '有名人に無視される', reads: '認められたい気持ちが引っかかっていると読まれました。' }, { when: '有名人が家に来る', reads: '思いがけない良い知らせと見ました。' } ] },
      zh: { name: '名人', keywords: ['向往', '被认可的需要', '形象', '距离'],
        traditional: '梦见贵人被读作好消息或身份的提升，交谈越近所读越大。',
        psych: '内容研究不把它看作缘分的预兆。常见的面孔成为梦的素材很普通，且在大量接触媒体的日子后更常被报告。',
        scenes: [ { when: '与名人并肩而行', reads: '视为进入好的位置。' }, { when: '被名人无视', reads: '读作渴望被认可的心思有所卡顿。' }, { when: '名人到你家来', reads: '看作意外的好消息。' } ] },
      fr: { name: 'Une célébrité', keywords: ['aspiration', 'besoin de reconnaissance', 'image', 'distance'],
        traditional: "Rencontrer une personne de haut rang se lisait comme une bonne nouvelle ou une élévation, et plus l'échange était proche, plus la lecture était forte.",
        psych: "La recherche sur le contenu n'y voit pas un présage de lien. Les visages souvent vus deviennent couramment matériau onirique, et ces rêves sont davantage rapportés après une journée de forte exposition médiatique.",
        scenes: [ { when: "Vous marchez aux côtés d'une célébrité", reads: "Pris comme entrer dans une bonne position." }, { when: 'Une célébrité vous ignore', reads: "Lu comme un désir de reconnaissance qui accroche." }, { when: 'Une célébrité vient chez vous', reads: "Vu comme une bonne nouvelle inattendue." } ] },
      es: { name: 'Una celebridad', keywords: ['aspiración', 'necesidad de reconocimiento', 'imagen', 'distancia'],
        traditional: 'Encontrarse con alguien de alto rango se leía como buenas noticias o un ascenso, y cuanto más cercana la conversación, mayor la lectura.',
        psych: 'La investigación de contenido no lo trata como presagio de un vínculo. Los rostros vistos con frecuencia se vuelven material onírico, y estos sueños se reportan más tras un día de mucha exposición a medios.',
        scenes: [ { when: 'Caminas junto a una celebridad', reads: 'Tomado como entrar en una buena posición.' }, { when: 'Una celebridad te ignora', reads: 'Leído como un deseo de reconocimiento que se engancha.' }, { when: 'Una celebridad viene a tu casa', reads: 'Visto como una buena noticia inesperada.' } ] },
    },
  },
  {
    id: 'deceased', emoji: '🕯️', category: 'person', related: ['death', 'ex-partner', 'ghost'],
    l10n: {
      ko: { name: '돌아가신 분', keywords: ['그리움', '애도', '조언', '기일'],
        traditional: '조상이나 돌아가신 분이 나오는 꿈은 전하는 말이 있는 것으로 읽혔습니다. 웃는 얼굴은 평안으로, 무언가를 주는 장면은 좋은 조짐으로 보았습니다. 기일이나 명절 즈음의 꿈에 특히 무게를 두었습니다.',
        psych: '꿈 내용 연구와 애도 연구는 이 꿈을 메시지의 전달로 보지 않습니다. 다만 사별 뒤 이런 꿈이 흔하고, 많은 사람이 위안을 얻었다고 보고하는 것은 반복 관찰됩니다.',
        scenes: [ { when: '웃는 얼굴로 나타난다', reads: '평안하다는 뜻으로 보았습니다.' }, { when: '무언가를 건네준다', reads: '좋은 일이 든다고 읽혔습니다.' }, { when: '말없이 돌아선다', reads: '아직 보내지 못한 마음으로 보았습니다.' } ] },
      en: { name: 'Someone who has died', keywords: ['longing', 'grief', 'counsel', 'anniversary'],
        traditional: 'An ancestor or a departed person appearing was read as having something to convey. A smiling face meant they were at peace; being handed something was a good sign. Dreams near a death anniversary or holiday carried extra weight.',
        psych: 'Dream-content and bereavement research do not treat this as a message delivered. What is repeatedly observed is that such dreams are common after a loss and that many people report finding comfort in them.',
        scenes: [ { when: 'They appear smiling', reads: 'Taken to mean they are at peace.' }, { when: 'They hand you something', reads: 'Read as good fortune coming.' }, { when: 'They turn away without speaking', reads: 'Seen as a grief not yet let go.' } ] },
      ja: { name: '亡くなった方', keywords: ['懐かしさ', '喪', '助言', '命日'],
        traditional: '先祖や亡くなった方が出る夢は、伝えたい言葉があるものとして読まれました。笑顔は安らかさ、何かを渡す場面は良い兆しと見ました。命日や節目の頃の夢には特に重きを置きました。',
        psych: '夢内容の研究と死別研究は、これをメッセージの伝達とは見ません。ただ死別後にこうした夢が多いこと、多くの人が慰めを得たと報告することは繰り返し観察されます。',
        scenes: [ { when: '笑顔で現れる', reads: '安らかである意と見ました。' }, { when: '何かを手渡す', reads: '良い事が入ると読まれました。' }, { when: '何も言わず背を向ける', reads: 'まだ手放せない心と見ました。' } ] },
      zh: { name: '已故的人', keywords: ['思念', '哀悼', '叮嘱', '忌日'],
        traditional: '梦见先人或已故之人，被读作有话要传。笑颜读作安好，递来物件读作吉兆。忌日或节庆前后的梦尤被看重。',
        psych: '梦内容研究与哀伤研究不把它视为讯息的传递。反复被观察到的是：丧亲之后这类梦很常见，且许多人报告从中获得了安慰。',
        scenes: [ { when: '含笑出现', reads: '视为其安好。' }, { when: '递给你东西', reads: '读作好事将至。' }, { when: '不发一语转身离去', reads: '看作尚未放下的心。' } ] },
      fr: { name: 'Une personne décédée', keywords: ['manque', 'deuil', 'conseil', 'anniversaire'],
        traditional: "L'apparition d'un ancêtre ou d'un défunt se lisait comme ayant quelque chose à transmettre. Un visage souriant : la paix ; recevoir un objet : bon signe. Les rêves proches d'un anniversaire de décès pesaient davantage.",
        psych: "La recherche sur le contenu et sur le deuil n'y voit pas la remise d'un message. Ce qui est observé de façon répétée, c'est que ces rêves sont fréquents après une perte et que beaucoup disent y trouver du réconfort.",
        scenes: [ { when: 'La personne apparaît en souriant', reads: "Pris pour dire qu'elle est en paix." }, { when: 'Elle vous tend quelque chose', reads: 'Lu comme une bonne fortune qui vient.' }, { when: 'Elle se détourne sans parler', reads: "Vu comme un deuil pas encore déposé." } ] },
      es: { name: 'Alguien que ha muerto', keywords: ['añoranza', 'duelo', 'consejo', 'aniversario'],
        traditional: 'La aparición de un antepasado o difunto se leía como que traía algo que decir. Rostro sonriente: está en paz; que te entregue algo: buena señal. Los sueños cercanos al aniversario pesaban más.',
        psych: 'La investigación de contenido y la del duelo no lo tratan como la entrega de un mensaje. Lo que sí se observa repetidamente es que estos sueños son frecuentes tras una pérdida y que muchas personas dicen hallar consuelo en ellos.',
        scenes: [ { when: 'Aparece sonriendo', reads: 'Tomado como que está en paz.' }, { when: 'Te entrega algo', reads: 'Leído como buena fortuna que llega.' }, { when: 'Se aparta sin hablar', reads: 'Visto como un duelo aún no soltado.' } ] },
    },
  },
  {
    id: 'tiger', emoji: '🐯', category: 'creature', related: ['dragon', 'snake', 'pig'],
    l10n: {
      ko: { name: '호랑이', keywords: ['권위', '태몽', '위세', '두려움'],
        traditional: '해몽서와 태몽 전승에서 호랑이는 큰 기운과 권위로 읽혔습니다. 태몽으로는 씩씩한 아이를 얻는다고 보았고, 쫓기는 장면이면 감당하기 벅찬 상대나 압력으로 보았습니다.',
        psych: '꿈 내용 연구는 특정 동물에 고정된 뜻을 붙이지 않습니다. 다만 큰 포식 동물은 위협 장면에 자주 등장하는 소재로 보고됩니다.',
        scenes: [ { when: '호랑이가 품으로 들어온다', reads: '태몽으로 큰 인물을 얻는다고 보았습니다.' }, { when: '호랑이에게 쫓긴다', reads: '벅찬 상대나 피하고 있는 일을 가리킨다고 읽혔습니다.' }, { when: '호랑이를 타고 간다', reads: '큰 힘을 부린다는 뜻으로 보았습니다.' } ] },
      en: { name: 'Tiger', keywords: ['authority', 'birth dream', 'power', 'fear'],
        traditional: 'Manuals and Korean conception-dream lore read the tiger as great force and authority. As a conception dream it promised a bold child; being chased was read as a pressure too large to handle.',
        psych: 'Content research assigns no fixed meaning to a species. Large predators are, however, reported as frequent material in threatening dream scenes.',
        scenes: [ { when: 'A tiger comes into your arms', reads: 'Taken as a conception dream promising a formidable child.' }, { when: 'A tiger chases you', reads: 'Read as an opponent or task larger than you feel able to meet.' }, { when: 'You ride a tiger', reads: 'Seen as commanding a great force.' } ] },
      ja: { name: '虎', keywords: ['権威', '胎夢', '威勢', '恐れ'],
        traditional: '夢占書と胎夢の伝承では、虎は大きな気と権威として読まれました。胎夢では勇ましい子を授かるとされ、追われる場面は手に余る相手や圧力と見ました。',
        psych: '夢内容の研究は特定の動物に固定した意味を与えません。ただ大型の捕食動物は脅威場面によく現れる素材として報告されます。',
        scenes: [ { when: '虎が懐に入ってくる', reads: '胎夢として大人物を授かると見ました。' }, { when: '虎に追われる', reads: '手に余る相手や避けている事を指すと読まれました。' }, { when: '虎に乗って行く', reads: '大きな力を操る意と見ました。' } ] },
      zh: { name: '老虎', keywords: ['权威', '胎梦', '威势', '恐惧'],
        traditional: '解梦书与胎梦传承把老虎读作大气运与权威。作胎梦解，预示得一个勇健的孩子；被追赶则读作难以承受的对手或压力。',
        psych: '内容研究不给特定动物固定含义。不过大型捕食动物常被报告为威胁场景中的高频素材。',
        scenes: [ { when: '老虎入怀', reads: '视为胎梦，预示得大人物。' }, { when: '被老虎追赶', reads: '读作力所不及的对手或正在回避之事。' }, { when: '骑虎而行', reads: '看作驾驭大力量。' } ] },
      fr: { name: 'Le tigre', keywords: ['autorité', 'rêve de conception', 'puissance', 'peur'],
        traditional: "Les manuels et la tradition coréenne des rêves de conception lisaient le tigre comme force et autorité. En rêve de conception il annonçait un enfant hardi ; être poursuivi se lisait comme une pression trop grande.",
        psych: "La recherche sur le contenu n'attribue pas de sens fixe à une espèce. Les grands prédateurs sont toutefois signalés comme matériau fréquent des scènes de menace.",
        scenes: [ { when: 'Un tigre vient dans vos bras', reads: 'Pris comme rêve de conception annonçant un enfant remarquable.' }, { when: 'Un tigre vous poursuit', reads: "Lu comme un adversaire ou une tâche plus grande que vos moyens ressentis." }, { when: 'Vous chevauchez un tigre', reads: "Vu comme la maîtrise d'une grande force." } ] },
      es: { name: 'El tigre', keywords: ['autoridad', 'sueño de concepción', 'poder', 'miedo'],
        traditional: 'Los manuales y la tradición coreana de sueños de concepción leían el tigre como gran fuerza y autoridad. Como sueño de concepción prometía un hijo audaz; ser perseguido se leía como una presión demasiado grande.',
        psych: 'La investigación de contenido no asigna significado fijo a una especie. Los grandes depredadores sí se reportan como material frecuente en escenas de amenaza.',
        scenes: [ { when: 'Un tigre entra en tus brazos', reads: 'Tomado como sueño de concepción que promete un hijo notable.' }, { when: 'Un tigre te persigue', reads: 'Leído como un rival o tarea mayor de lo que sientes poder afrontar.' }, { when: 'Cabalgas un tigre', reads: 'Visto como manejar una gran fuerza.' } ] },
    },
  },
  {
    id: 'dragon', emoji: '🐉', category: 'creature', related: ['tiger', 'snake', 'baby'],
    l10n: {
      ko: { name: '용', keywords: ['태몽', '승천', '큰 성취', '변화'],
        traditional: '용은 태몽 가운데 가장 귀하게 여겨졌습니다. 승천하는 용은 크게 이루는 일로, 하늘에 오르지 못한 용은 때를 기다리는 상태로 읽혔습니다. 뱀이 용이 되는 장면은 신분이나 처지의 변화로 보았습니다.',
        psych: '용은 실재하지 않는 상상의 존재이므로, 꿈 내용 연구에서는 문화적으로 학습된 이미지가 꿈에 재료로 들어온 사례로 다뤄집니다.',
        scenes: [ { when: '용이 하늘로 오른다', reads: '큰 성취와 귀한 자식을 얻는 태몽으로 보았습니다.' }, { when: '용을 품에 안는다', reads: '귀한 것을 얻는다고 읽혔습니다.' }, { when: '용이 승천하지 못한다', reads: '때가 아직 이르지 않았다는 뜻으로 보았습니다.' } ] },
      en: { name: 'Dragon', keywords: ['birth dream', 'ascent', 'great achievement', 'change'],
        traditional: 'The dragon was held the most auspicious of conception dreams. A dragon rising was read as great achievement; one that could not rise, as waiting for its time. A snake becoming a dragon was read as a change of station.',
        psych: 'A dragon does not exist, so content research treats it as a culturally learned image entering the dream as material.',
        scenes: [ { when: 'A dragon rises into the sky', reads: 'Read as great achievement and a distinguished child.' }, { when: 'You hold a dragon', reads: 'Taken as receiving something precious.' }, { when: 'A dragon cannot ascend', reads: 'Read as the time not having come yet.' } ] },
      ja: { name: '龍', keywords: ['胎夢', '昇天', '大成', '変化'],
        traditional: '龍は胎夢の中で最も貴いとされました。昇る龍は大きな成就として、昇れない龍は時を待つ状態として読まれました。蛇が龍になる場面は身分や境遇の変化と見ました。',
        psych: '龍は実在しない想像上の存在なので、夢内容の研究では文化的に学習された像が夢の素材として入った例として扱われます。',
        scenes: [ { when: '龍が天に昇る', reads: '大きな成就と貴い子を授かる胎夢と見ました。' }, { when: '龍を抱く', reads: '貴いものを得ると読まれました。' }, { when: '龍が昇れない', reads: 'まだ時が来ていない意と見ました。' } ] },
      zh: { name: '龙', keywords: ['胎梦', '升天', '大成就', '变化'],
        traditional: '龙被视为胎梦中最尊贵者。升天之龙读作大成就，不能升天之龙读作待时。蛇化为龙则读作身份或境遇的转变。',
        psych: '龙并不真实存在，因此内容研究把它视为文化习得的意象进入梦境成为素材的例子。',
        scenes: [ { when: '龙升天', reads: '视为大成就与得贵子的胎梦。' }, { when: '怀抱龙', reads: '读作获得贵重之物。' }, { when: '龙不得升天', reads: '读作时机未到。' } ] },
      fr: { name: 'Le dragon', keywords: ['rêve de conception', 'ascension', 'grande réussite', 'changement'],
        traditional: "Le dragon passait pour le plus faste des rêves de conception. Un dragon qui s'élève se lisait comme une grande réussite ; celui qui n'y parvient pas, comme l'attente de son heure. Un serpent devenant dragon se lisait comme un changement de condition.",
        psych: "Le dragon n'existe pas ; la recherche sur le contenu y voit une image culturellement apprise entrée dans le rêve comme matériau.",
        scenes: [ { when: "Un dragon s'élève dans le ciel", reads: 'Lu comme grande réussite et enfant remarquable.' }, { when: 'Vous tenez un dragon', reads: 'Pris comme recevoir une chose précieuse.' }, { when: "Un dragon ne peut s'élever", reads: "Lu comme l'heure qui n'est pas encore venue." } ] },
      es: { name: 'El dragón', keywords: ['sueño de concepción', 'ascenso', 'gran logro', 'cambio'],
        traditional: 'El dragón se tenía por el más auspicioso de los sueños de concepción. Un dragón que asciende se leía como gran logro; el que no puede, como esperar su momento. Una serpiente que se vuelve dragón se leía como cambio de condición.',
        psych: 'El dragón no existe, así que la investigación de contenido lo trata como una imagen aprendida culturalmente que entra al sueño como material.',
        scenes: [ { when: 'Un dragón asciende al cielo', reads: 'Leído como gran logro y un hijo destacado.' }, { when: 'Sostienes un dragón', reads: 'Tomado como recibir algo precioso.' }, { when: 'Un dragón no logra ascender', reads: 'Leído como que aún no ha llegado el momento.' } ] },
    },
  },
  {
    id: 'fish', emoji: '🐟', category: 'creature', related: ['water', 'sea', 'money'],
    l10n: {
      ko: { name: '물고기', keywords: ['재물', '태몽', '기회', '풍요'],
        traditional: '물고기는 재물과 기회로 읽혔습니다. 잡는 장면은 얻는 것으로, 놓치는 장면은 눈앞의 기회를 흘리는 것으로 보았습니다. 큰 물고기일수록 크게 보았고, 태몽으로도 자주 다뤄졌습니다.',
        psych: '꿈 내용 연구는 물고기에 고정된 뜻을 붙이지 않습니다. 잡거나 놓치는 동작이 있는 장면이라는 점이 기억에 남기 쉬운 조건으로 보입니다.',
        scenes: [ { when: '큰 물고기를 잡는다', reads: '재물이나 좋은 기회를 얻는다고 보았습니다.' }, { when: '잡은 물고기를 놓친다', reads: '다 된 일이 어긋난다는 경고로 읽혔습니다.' }, { when: '물고기 떼가 몰려온다', reads: '풍요가 든다는 뜻으로 보았습니다.' } ] },
      en: { name: 'Fish', keywords: ['fortune', 'birth dream', 'opportunity', 'abundance'],
        traditional: 'Fish were read as fortune and opportunity. Catching meant gaining; losing the catch meant letting a chance slip. The bigger the fish the larger the reading, and it appeared often as a conception dream.',
        psych: 'Content research gives fish no fixed meaning. The presence of catching or losing — an action with an outcome — seems to make such scenes easier to recall.',
        scenes: [ { when: 'You catch a large fish', reads: 'Taken as gaining fortune or a good opportunity.' }, { when: 'The fish you caught slips away', reads: 'Read as a warning that a settled matter may come undone.' }, { when: 'A school of fish arrives', reads: 'Seen as abundance coming in.' } ] },
      ja: { name: '魚', keywords: ['財', '胎夢', '機会', '豊かさ'],
        traditional: '魚は財と機会として読まれました。捕る場面は得ること、逃す場面は目前の機会を取り逃すことと見ました。大きな魚ほど大きく見て、胎夢としてもよく扱われました。',
        psych: '夢内容の研究は魚に固定した意味を与えません。捕る・逃すという結果のある動作がある場面は、記憶に残りやすい条件に見えます。',
        scenes: [ { when: '大きな魚を捕る', reads: '財や良い機会を得ると見ました。' }, { when: '捕った魚を逃す', reads: '決まりかけた事が外れる警告と読まれました。' }, { when: '魚の群れが押し寄せる', reads: '豊かさが入る意と見ました。' } ] },
      zh: { name: '鱼', keywords: ['财运', '胎梦', '机会', '丰饶'],
        traditional: '鱼被读作财运与机会。捕到是得，脱手是错失眼前的机会。鱼越大所读越大，也常作胎梦。',
        psych: '内容研究不给鱼固定含义。有"捕到/失手"这类带结果的动作的场景，似乎更容易被记住。',
        scenes: [ { when: '捕到大鱼', reads: '视为得财或好机会。' }, { when: '捕到的鱼脱手', reads: '读作已成之事可能生变的警示。' }, { when: '鱼群涌来', reads: '看作丰饶将至。' } ] },
      fr: { name: 'Le poisson', keywords: ['fortune', 'rêve de conception', 'occasion', 'abondance'],
        traditional: "Le poisson se lisait comme fortune et occasion. Le prendre, c'était gagner ; le laisser filer, laisser passer sa chance. Plus le poisson était gros, plus la lecture l'était, et il revenait souvent en rêve de conception.",
        psych: "La recherche sur le contenu ne fixe aucun sens au poisson. La présence d'une action à résultat — prendre ou perdre — semble rendre ces scènes plus faciles à retenir.",
        scenes: [ { when: 'Vous prenez un gros poisson', reads: "Pris comme gagner une fortune ou une belle occasion." }, { when: 'Le poisson pris vous échappe', reads: "Lu comme l'avertissement qu'une affaire réglée peut se défaire." }, { when: 'Un banc de poissons arrive', reads: "Vu comme une abondance qui entre." } ] },
      es: { name: 'El pez', keywords: ['fortuna', 'sueño de concepción', 'oportunidad', 'abundancia'],
        traditional: 'El pez se leía como fortuna y oportunidad. Pescarlo era ganar; perderlo, dejar escapar una ocasión. Cuanto mayor el pez, mayor la lectura, y aparecía a menudo como sueño de concepción.',
        psych: 'La investigación de contenido no fija un significado al pez. La presencia de una acción con resultado —pescar o perder— parece hacer esas escenas más fáciles de recordar.',
        scenes: [ { when: 'Pescas un pez grande', reads: 'Tomado como ganar fortuna o una buena oportunidad.' }, { when: 'El pez pescado se te escapa', reads: 'Leído como aviso de que algo ya cerrado puede deshacerse.' }, { when: 'Llega un banco de peces', reads: 'Visto como abundancia que entra.' } ] },
    },
  },
  {
    id: 'sea', emoji: '🌊', category: 'nature', related: ['water', 'fish', 'lost'],
    l10n: {
      ko: { name: '바다', keywords: ['규모', '무의식', '항해', '파도'],
        traditional: '바다는 물보다 큰 것으로, 넓은 세상이나 감당해야 할 큰 판으로 읽혔습니다. 잔잔한 바다는 순조로움, 거친 파도는 시련으로 보았고, 건너는 장면은 단계를 넘는 통과의례로 다뤘습니다.',
        psych: '꿈 내용 연구는 바다에 고정된 뜻을 붙이지 않습니다. 다만 규모가 큰 자연 배경은 자신이 작게 느껴지는 장면과 함께 보고되는 편입니다.',
        scenes: [ { when: '잔잔한 바다를 바라본다', reads: '마음이 가라앉고 일이 순조롭다고 보았습니다.' }, { when: '거친 파도에 휩쓸린다', reads: '감당하기 어려운 상황에 놓인다는 경고로 읽혔습니다.' }, { when: '배를 타고 바다를 건넌다', reads: '다음 단계로 넘어가는 통과의례로 보았습니다.' } ] },
      en: { name: 'Sea', keywords: ['scale', 'unconscious', 'voyage', 'waves'],
        traditional: 'The sea, being larger than water, was read as the wide world or a large arena to face. A calm sea meant smooth going, rough waves meant trial, and crossing it was treated as a rite of passage.',
        psych: 'Content research gives the sea no fixed meaning, though vast natural settings are reported alongside scenes in which the dreamer feels small.',
        scenes: [ { when: 'You look out over a calm sea', reads: 'Taken as the mind settling and matters running smoothly.' }, { when: 'Rough waves sweep you up', reads: 'Read as a warning of a situation beyond your means.' }, { when: 'You cross the sea by boat', reads: 'Seen as a rite of passage into the next stage.' } ] },
      ja: { name: '海', keywords: ['規模', '無意識', '航海', '波'],
        traditional: '海は水より大きなものとして、広い世界や引き受けるべき大きな場と読まれました。凪いだ海は順調、荒波は試練と見て、渡る場面は段階を越える通過儀礼として扱いました。',
        psych: '夢内容の研究は海に固定した意味を与えません。ただ規模の大きい自然の背景は、自分が小さく感じられる場面と共に報告される傾向があります。',
        scenes: [ { when: '凪いだ海を眺める', reads: '心が落ち着き物事が順調と見ました。' }, { when: '荒波にさらわれる', reads: '手に負えない状況に置かれる警告と読まれました。' }, { when: '船で海を渡る', reads: '次の段階へ移る通過儀礼と見ました。' } ] },
      zh: { name: '海', keywords: ['规模', '无意识', '航行', '波浪'],
        traditional: '海比水更大，被读作广阔的世界或需要面对的大局。风平浪静读作顺遂，惊涛骇浪读作试炼，渡海则视为跨越阶段的过渡。',
        psych: '内容研究不给海固定含义。不过宏大的自然背景常与"自觉渺小"的场景一同被报告。',
        scenes: [ { when: '眺望平静的海', reads: '视为心绪平定、诸事顺遂。' }, { when: '被巨浪卷走', reads: '读作陷入力所不及之境的警示。' }, { when: '乘船渡海', reads: '看作进入下一阶段的过渡。' } ] },
      fr: { name: 'La mer', keywords: ['ampleur', 'inconscient', 'traversée', 'vagues'],
        traditional: "La mer, plus vaste que l'eau, se lisait comme le vaste monde ou une grande arène à affronter. Mer calme : cours favorable ; vagues fortes : épreuve ; la traverser était un rite de passage.",
        psych: "La recherche sur le contenu ne fixe pas de sens à la mer, mais les décors naturels immenses sont rapportés avec des scènes où le rêveur se sent petit.",
        scenes: [ { when: 'Vous contemplez une mer calme', reads: "Pris comme un apaisement et des affaires qui vont bien." }, { when: 'Des vagues fortes vous emportent', reads: "Lu comme l'avertissement d'une situation au-dessus de vos moyens." }, { when: 'Vous traversez la mer en bateau', reads: "Vu comme un rite de passage vers l'étape suivante." } ] },
      es: { name: 'El mar', keywords: ['escala', 'inconsciente', 'travesía', 'olas'],
        traditional: 'El mar, mayor que el agua, se leía como el ancho mundo o un gran escenario que afrontar. Mar en calma: marcha suave; olas bravas: prueba; cruzarlo se trataba como rito de paso.',
        psych: 'La investigación de contenido no fija significado al mar, aunque los escenarios naturales vastos se reportan junto a escenas donde quien sueña se siente pequeño.',
        scenes: [ { when: 'Contemplas un mar en calma', reads: 'Tomado como la mente asentándose y los asuntos marchando bien.' }, { when: 'Olas bravas te arrastran', reads: 'Leído como aviso de una situación que excede tus medios.' }, { when: 'Cruzas el mar en barco', reads: 'Visto como rito de paso a la siguiente etapa.' } ] },
    },
  },
  {
    id: 'water', emoji: '💧', category: 'nature', related: ['falling', 'snake', 'fire', 'fish', 'sea'], hasArticle: true,
    l10n: {
      ko: {
        name: '물', keywords: ['감정', '정화', '흐름', '홍수'],
        traditional: '해몽서에서 물은 감정·재물·정화로 읽혔습니다. 물 자체보다 맑은지 탁한지, 알맞은지 넘치는지가 해석을 가릅니다.',
        psych: '꿈 내용 연구는 물에 고정된 뜻을 붙이지 않습니다. 요즘 무엇에 잠겨 있는지와 이어질 가능성이 있는 장면으로 봅니다.',
        scenes: [
          { when: '맑은 물이 넉넉히 흐른다', reads: '일이 순조롭게 풀리고 재물이 든다고 보았습니다.' },
          { when: '탁한 물에 빠진다', reads: '분명치 않은 문제에 휘말린다는 경고로 읽혔습니다.' },
          { when: '강이나 바다를 건넌다', reads: '한 단계에서 다음 단계로 넘어가는 통과의례로 보았습니다.' },
        ],
      },
      en: {
        name: 'Water', keywords: ['emotion', 'cleansing', 'flow', 'flood'],
        traditional: 'Dream manuals read water as emotion, fortune and cleansing. What decides the reading is its state — clear or murky, ample or overflowing.',
        psych: 'Content research attaches no fixed meaning to water. It treats the scene as possibly continuous with what currently absorbs you.',
        scenes: [
          { when: 'Clear water flows abundantly', reads: 'Taken as things running smoothly and fortune arriving.' },
          { when: 'You fall into murky water', reads: 'Read as a warning about being drawn into something unclear.' },
          { when: 'You cross a river or sea', reads: 'Seen as a rite of passage from one stage to the next.' },
        ],
      },
      ja: {
        name: '水', keywords: ['感情', '浄化', '流れ', '洪水'],
        traditional: '夢占書では水を感情・財・浄化として読みました。水そのものより、澄んでいるか濁っているか、適量か溢れているかが解釈を分けます。',
        psych: '夢内容の研究は水に固定した意味を与えません。いま何に浸っているかと繋がりうる場面として扱います。',
        scenes: [
          { when: '澄んだ水が豊かに流れる', reads: '物事が順調に運び、財が入ると見ました。' },
          { when: '濁った水に落ちる', reads: 'はっきりしない問題に巻き込まれる警告と読まれました。' },
          { when: '川や海を渡る', reads: '次の段階へ移る通過儀礼と見ました。' },
        ],
      },
      zh: {
        name: '水', keywords: ['情绪', '净化', '流动', '洪水'],
        traditional: '解梦书把水读作情绪、财运与净化。真正分出解释的不是水本身，而是清是浊、适量还是泛滥。',
        psych: '内容研究不给水固定含义，而把它看作可能与你当下所沉浸之事相连的场景。',
        scenes: [
          { when: '清水充沛流动', reads: '视为诸事顺遂、财运将至。' },
          { when: '落入浊水', reads: '读作卷入不明之事的警示。' },
          { when: '渡河或渡海', reads: '看作由一个阶段进入下一阶段的过渡。' },
        ],
      },
      fr: {
        name: "L'eau", keywords: ['émotion', 'purification', 'flux', 'inondation'],
        traditional: "Les manuels lisent l'eau comme émotion, fortune et purification. Ce qui décide, c'est son état : claire ou trouble, mesurée ou débordante.",
        psych: "La recherche sur le contenu n'attache aucun sens fixe à l'eau ; elle y voit une scène possiblement continue avec ce qui vous absorbe.",
        scenes: [
          { when: "Une eau claire coule en abondance", reads: 'Tenu pour des affaires qui coulent bien et une fortune qui vient.' },
          { when: 'Vous tombez dans une eau trouble', reads: "Lu comme un avertissement : être entraîné dans une affaire confuse." },
          { when: 'Vous traversez un fleuve ou la mer', reads: "Vu comme un rite de passage vers l'étape suivante." },
        ],
      },
      es: {
        name: 'El agua', keywords: ['emoción', 'purificación', 'flujo', 'inundación'],
        traditional: 'Los manuales leen el agua como emoción, fortuna y purificación. Lo que decide la lectura es su estado: clara o turbia, justa o desbordada.',
        psych: 'La investigación de contenido no le asigna un sentido fijo; la trata como escena posiblemente continua con lo que ahora te absorbe.',
        scenes: [
          { when: 'Agua clara fluye en abundancia', reads: 'Se tomaba como asuntos que marchan y fortuna que llega.' },
          { when: 'Caes en agua turbia', reads: 'Leído como aviso de verse envuelto en algo poco claro.' },
          { when: 'Cruzas un río o el mar', reads: 'Visto como rito de paso a la etapa siguiente.' },
        ],
      },
    },
  },
  {
    id: 'falling', emoji: '🕳️', category: 'motion', related: ['water', 'teeth', 'chased', 'flying', 'car', 'paralysis'], hasArticle: true,
    l10n: {
      ko: {
        name: '추락', keywords: ['통제 상실', '불안', '놓침', '높은 곳'],
        traditional: '해몽서에서 추락은 지위·기반·통제력의 상실로 읽혔습니다.',
        psych: '잠들 무렵 떨어지는 느낌은 꿈이 아니라 수면 경련입니다. 서사가 있는 추락 꿈은 통제감이 흔들리는 상태와 이어질 수 있습니다.',
        scenes: [
          { when: '높은 곳에서 떨어진다', reads: '자리나 평판이 흔들린다고 보았습니다.' },
          { when: '떨어지다 깨어난다', reads: '결말이 정해지지 않은 걱정으로 읽혔습니다.' },
          { when: '떨어졌는데 다치지 않는다', reads: '위기를 넘긴다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Falling', keywords: ['loss of control', 'anxiety', 'letting go', 'heights'],
        traditional: 'Manuals read falling as the loss of standing, footing or control.',
        psych: 'The jolt as you drift off is a hypnic jerk, not a dream. A falling dream with a story may track a shaken sense of control.',
        scenes: [
          { when: 'You fall from a height', reads: 'Taken as position or reputation being shaken.' },
          { when: 'You wake mid-fall', reads: 'Read as a worry whose ending is not yet settled.' },
          { when: 'You land unhurt', reads: 'Taken as coming through a crisis.' },
        ],
      },
      ja: {
        name: '落下', keywords: ['制御の喪失', '不安', '手放し', '高所'],
        traditional: '夢占書では落下を地位・基盤・制御の喪失として読みました。',
        psych: '寝入りばなの落ちる感覚は夢ではなくジャーキング（睡眠時痙攣）です。物語のある落下夢は、制御感の揺らぎと繋がりうる場面です。',
        scenes: [
          { when: '高い所から落ちる', reads: '地位や評判が揺らぐと見ました。' },
          { when: '落ちる途中で目が覚める', reads: '結末の定まらない心配と読まれました。' },
          { when: '落ちても無傷', reads: '危機を越えると見ました。' },
        ],
      },
      zh: {
        name: '坠落', keywords: ['失控', '焦虑', '放手', '高处'],
        traditional: '解梦书把坠落读作地位、根基与控制力的丧失。',
        psych: '入睡时的下坠感不是梦，而是入睡抽动。有情节的坠落梦可能与当下控制感的动摇相连。',
        scenes: [
          { when: '从高处坠落', reads: '视为地位或名声动摇。' },
          { when: '坠落途中惊醒', reads: '读作结局未定的忧虑。' },
          { when: '坠落却毫发无伤', reads: '视为渡过危机。' },
        ],
      },
      fr: {
        name: 'La chute', keywords: ['perte de contrôle', 'anxiété', 'lâcher prise', 'hauteur'],
        traditional: 'Les manuels lisent la chute comme perte de rang, d’assise ou de contrôle.',
        psych: "La secousse à l'endormissement est une myoclonie, pas un rêve. Une chute avec récit peut suivre un sentiment de contrôle ébranlé.",
        scenes: [
          { when: "Vous tombez d'une hauteur", reads: 'Tenu pour une position ou une réputation ébranlée.' },
          { when: 'Vous vous réveillez en pleine chute', reads: "Lu comme un souci dont l'issue n'est pas fixée." },
          { when: 'Vous atterrissez indemne', reads: 'Tenu pour une crise surmontée.' },
        ],
      },
      es: {
        name: 'La caída', keywords: ['pérdida de control', 'ansiedad', 'soltar', 'altura'],
        traditional: 'Los manuales leen la caída como pérdida de posición, base o control.',
        psych: 'La sacudida al dormirse es una mioclonía, no un sueño. Una caída con relato puede seguir a una sensación de control quebrada.',
        scenes: [
          { when: 'Caes desde una altura', reads: 'Se tomaba como posición o reputación en peligro.' },
          { when: 'Despiertas en plena caída', reads: 'Leído como una preocupación sin desenlace fijado.' },
          { when: 'Caes sin hacerte daño', reads: 'Se tomaba como superar una crisis.' },
        ],
      },
    },
  },
  {
    id: 'teeth', emoji: '🦷', category: 'body', related: ['falling', 'snake', 'death', 'naked', 'blood'], hasArticle: true,
    l10n: {
      ko: {
        name: '이빨 빠짐', keywords: ['상실', '노화', '말', '가족'],
        traditional: '거의 모든 해몽 전통이 상실로 읽습니다. 한국에서는 어느 이가 빠졌는지로 가족의 일을 나누어 보는 관습이 더해졌습니다.',
        psych: '이갈이로 생긴 턱·치아 압박 감각이 꿈 장면에 섞여 들 수 있습니다. 자주 꾸고 아침에 턱이 뻐근하면 치과가 먼저입니다.',
        scenes: [
          { when: '앞니가 빠진다', reads: '가까운 사람의 일로 보았습니다.' },
          { when: '피가 나며 빠진다', reads: '손실이나 다툼에 대한 경고로 읽혔습니다.' },
          { when: '새 이가 난다', reads: '잃은 자리를 대신할 것이 온다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Teeth falling out', keywords: ['loss', 'aging', 'speech', 'family'],
        traditional: 'Almost every tradition reads this as loss. Korean practice adds a family reading keyed to which tooth fell.',
        psych: 'Jaw and tooth pressure from night-time grinding can bleed into the dream. Frequent dreams plus a sore jaw point to a dentist first.',
        scenes: [
          { when: 'A front tooth falls out', reads: 'Taken as concerning someone close.' },
          { when: 'It falls out bleeding', reads: 'Read as a warning of loss or conflict.' },
          { when: 'A new tooth grows in', reads: 'Taken as something arriving to replace what was lost.' },
        ],
      },
      ja: {
        name: '歯が抜ける', keywords: ['喪失', '老い', '発話', '家族'],
        traditional: 'ほとんどの伝統が喪失として読みます。韓国ではどの歯が抜けたかで家族の出来事を分ける慣習が加わりました。',
        psych: '歯ぎしりによる顎や歯の圧迫感が夢の場面に混じることがあります。頻繁に見て朝に顎が重いなら、まず歯科です。',
        scenes: [
          { when: '前歯が抜ける', reads: '身近な人の出来事と見ました。' },
          { when: '血が出て抜ける', reads: '損失や争いの警告と読まれました。' },
          { when: '新しい歯が生える', reads: '失った場所を埋めるものが来ると見ました。' },
        ],
      },
      zh: {
        name: '牙齿脱落', keywords: ['丧失', '衰老', '言语', '家人'],
        traditional: '几乎所有传统都读作丧失。朝鲜半岛还添了按脱落位置对应家人的读法。',
        psych: '夜间磨牙造成的颌与牙压迫感可能混入梦境。常做此梦且晨起颌部酸胀，应先看牙医。',
        scenes: [
          { when: '门牙脱落', reads: '视为身边亲近之人的事。' },
          { when: '带血脱落', reads: '读作损失或争执的警示。' },
          { when: '长出新牙', reads: '视为有物来补所失之位。' },
        ],
      },
      fr: {
        name: 'Perdre ses dents', keywords: ['perte', 'vieillissement', 'parole', 'famille'],
        traditional: 'Presque toutes les traditions y lisent une perte. L’usage coréen y ajoute une lecture familiale selon la dent tombée.',
        psych: "La pression sur mâchoire et dents due au bruxisme peut s'infiltrer dans le rêve. Rêve fréquent et mâchoire douloureuse : voyez d'abord un dentiste.",
        scenes: [
          { when: 'Une incisive tombe', reads: 'Tenu pour concerner un proche.' },
          { when: 'Elle tombe en saignant', reads: "Lu comme l'annonce d'une perte ou d'un conflit." },
          { when: 'Une dent nouvelle pousse', reads: 'Tenu pour ce qui vient remplacer le perdu.' },
        ],
      },
      es: {
        name: 'Perder los dientes', keywords: ['pérdida', 'envejecimiento', 'habla', 'familia'],
        traditional: 'Casi toda tradición lo lee como pérdida. El uso coreano añade una lectura familiar según qué diente cayó.',
        psych: 'La presión en mandíbula y dientes por bruxismo puede colarse en el sueño. Si se repite y amaneces con la mandíbula dolorida, primero el dentista.',
        scenes: [
          { when: 'Se cae un incisivo', reads: 'Se tomaba como algo relativo a alguien cercano.' },
          { when: 'Cae sangrando', reads: 'Leído como aviso de pérdida o conflicto.' },
          { when: 'Sale un diente nuevo', reads: 'Se tomaba como algo que viene a ocupar lo perdido.' },
        ],
      },
    },
  },
  {
    id: 'snake', emoji: '🐍', category: 'creature', related: ['water', 'teeth', 'baby', 'pig', 'tiger', 'dragon'], hasArticle: true,
    l10n: {
      ko: {
        name: '뱀', keywords: ['재물', '태몽', '변화', '허물벗기'],
        traditional: '동아시아 해몽에서 뱀은 재물과 태몽으로 읽혔습니다. 곳간을 지키던 동물이라는 배경이 재물 해석에 깔려 있습니다.',
        psych: '같은 뱀 꿈이라도 편안히 지나간 꿈과 쫓긴 꿈은 전혀 다른 경험입니다. 상징의 뜻보다 꿈에서 느낀 감정이 읽을 만합니다.',
        scenes: [
          { when: '뱀이 집에 들어온다', reads: '재물이 들어온다고 보았습니다.' },
          { when: '뱀이 몸을 감는다', reads: '태몽으로 자주 꼽혔습니다.' },
          { when: '뱀이 허물을 벗는다', reads: '묵은 것을 벗고 달라진다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Snake', keywords: ['fortune', 'conception dream', 'change', 'shedding'],
        traditional: 'East Asian manuals read the snake as fortune and as a conception dream — behind it lies the snake that guarded granaries.',
        psych: 'A snake that passes calmly and a snake that chases you are different experiences. The feeling in the dream reads better than the symbol.',
        scenes: [
          { when: 'A snake enters the house', reads: 'Taken as fortune coming in.' },
          { when: 'A snake coils around you', reads: 'Often counted as a conception dream.' },
          { when: 'A snake sheds its skin', reads: 'Taken as shedding the old and changing.' },
        ],
      },
      ja: {
        name: '蛇', keywords: ['財', '胎夢', '変化', '脱皮'],
        traditional: '東アジアの夢占書では蛇を財と胎夢として読みました。蔵を守る生き物だった背景が財の解釈にあります。',
        psych: '穏やかに通り過ぎる蛇と追ってくる蛇はまったく別の体験です。象徴の意味より、夢で感じた感情のほうが読む価値があります。',
        scenes: [
          { when: '蛇が家に入ってくる', reads: '財が入ると見ました。' },
          { when: '蛇が体に巻きつく', reads: '胎夢としてよく挙げられました。' },
          { when: '蛇が脱皮する', reads: '古いものを脱いで変わると見ました。' },
        ],
      },
      zh: {
        name: '蛇', keywords: ['财运', '胎梦', '变化', '蜕皮'],
        traditional: '东亚解梦书把蛇读作财运与胎梦，背后是蛇曾看守粮仓的生活经验。',
        psych: '安然游过的蛇与追赶你的蛇是两种体验。比起象征含义，梦中感受更值得读。',
        scenes: [
          { when: '蛇进家门', reads: '视为财运临门。' },
          { when: '蛇缠绕身体', reads: '常被列为胎梦。' },
          { when: '蛇蜕皮', reads: '视为褪去旧物而更新。' },
        ],
      },
      fr: {
        name: 'Le serpent', keywords: ['fortune', 'rêve de conception', 'changement', 'mue'],
        traditional: "Les manuels d'Asie orientale lisent le serpent comme fortune et rêve de conception — derrière, le serpent qui gardait les greniers.",
        psych: "Un serpent qui passe calmement et un serpent qui poursuit sont deux expériences. L'émotion du rêve se lit mieux que le symbole.",
        scenes: [
          { when: 'Un serpent entre dans la maison', reads: 'Tenu pour la fortune qui arrive.' },
          { when: "Un serpent s'enroule autour de vous", reads: 'Souvent compté comme rêve de conception.' },
          { when: 'Un serpent mue', reads: "Tenu pour se défaire de l'ancien et changer." },
        ],
      },
      es: {
        name: 'La serpiente', keywords: ['fortuna', 'sueño de concepción', 'cambio', 'muda'],
        traditional: 'Los manuales de Asia oriental leen la serpiente como fortuna y sueño de concepción; detrás está la serpiente que guardaba los graneros.',
        psych: 'Una serpiente que pasa tranquila y una que persigue son experiencias distintas. La emoción del sueño se lee mejor que el símbolo.',
        scenes: [
          { when: 'Una serpiente entra en casa', reads: 'Se tomaba como fortuna que llega.' },
          { when: 'Una serpiente se enrosca en tu cuerpo', reads: 'A menudo contado como sueño de concepción.' },
          { when: 'Una serpiente muda la piel', reads: 'Se tomaba como despojarse de lo viejo y cambiar.' },
        ],
      },
    },
  },
  {
    id: 'fire', emoji: '🔥', category: 'nature', related: ['water', 'chased'],
    l10n: {
      ko: {
        name: '불', keywords: ['재물', '분노', '소멸', '정화'],
        traditional: '해몽서에서 불은 크게 번지면 재물, 사람이나 집을 태우면 다툼과 손실로 갈려 읽혔습니다.',
        psych: '불은 강한 정서가 실리는 장면이라 기억에 잘 남습니다. 자주 꾼다는 인상이 실제 빈도보다 클 수 있습니다.',
        scenes: [
          { when: '불길이 크게 번진다', reads: '기세가 오르고 재물이 인다고 보았습니다.' },
          { when: '집이 탄다', reads: '기반이 흔들리는 일로 읽혔습니다.' },
          { when: '불을 끈다', reads: '갈등을 가라앉힌다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Fire', keywords: ['fortune', 'anger', 'consumption', 'cleansing'],
        traditional: 'Manuals split it: fire spreading wide reads as fortune, fire burning a person or house as conflict and loss.',
        psych: 'Fire scenes carry strong affect and are well remembered, so they can feel more frequent than they are.',
        scenes: [
          { when: 'Flames spread widely', reads: 'Taken as momentum rising and fortune building.' },
          { when: 'A house burns', reads: 'Read as the ground under you being shaken.' },
          { when: 'You put the fire out', reads: 'Taken as settling a conflict.' },
        ],
      },
      ja: {
        name: '火', keywords: ['財', '怒り', '焼失', '浄化'],
        traditional: '夢占書では、大きく燃え広がる火は財、人や家を焼く火は争いと損失として分けて読みました。',
        psych: '火は強い情動を伴う場面で記憶に残りやすく、実際の頻度より「よく見る」と感じられがちです。',
        scenes: [
          { when: '炎が大きく広がる', reads: '勢いが増し財が起こると見ました。' },
          { when: '家が燃える', reads: '基盤が揺らぐ出来事と読まれました。' },
          { when: '火を消す', reads: '争いを鎮めると見ました。' },
        ],
      },
      zh: {
        name: '火', keywords: ['财运', '愤怒', '焚毁', '净化'],
        traditional: '解梦书分而读之：火势大张为财，焚人焚屋则为争执与损失。',
        psych: '火的场面情绪强烈、易被记住，因而"常做"的印象可能高于实际频率。',
        scenes: [
          { when: '火势大张', reads: '视为气势上扬、财运兴起。' },
          { when: '房屋起火', reads: '读作根基动摇之事。' },
          { when: '把火扑灭', reads: '视为平息争端。' },
        ],
      },
      fr: {
        name: 'Le feu', keywords: ['fortune', 'colère', 'consumation', 'purification'],
        traditional: "Les manuels distinguent : un feu qui s'étend se lit comme fortune, un feu qui brûle une personne ou une maison comme conflit et perte.",
        psych: "Les scènes de feu portent un affect fort et se retiennent bien : elles paraissent plus fréquentes qu'elles ne le sont.",
        scenes: [
          { when: "Les flammes s'étendent largement", reads: "Tenu pour un élan qui monte et une fortune qui se bâtit." },
          { when: 'Une maison brûle', reads: 'Lu comme le sol qui se dérobe sous vous.' },
          { when: 'Vous éteignez le feu', reads: "Tenu pour l'apaisement d'un conflit." },
        ],
      },
      es: {
        name: 'El fuego', keywords: ['fortuna', 'ira', 'consumación', 'purificación'],
        traditional: 'Los manuales lo dividen: fuego que se extiende se lee como fortuna; fuego que quema a alguien o una casa, como conflicto y pérdida.',
        psych: 'Las escenas de fuego cargan mucho afecto y se recuerdan bien, así que parecen más frecuentes de lo que son.',
        scenes: [
          { when: 'Las llamas se extienden', reads: 'Se tomaba como impulso que sube y fortuna que crece.' },
          { when: 'Arde una casa', reads: 'Leído como el suelo que se mueve bajo tus pies.' },
          { when: 'Apagas el fuego', reads: 'Se tomaba como calmar un conflicto.' },
        ],
      },
    },
  },
  {
    id: 'chased', emoji: '🏃', category: 'motion', related: ['falling', 'fire', 'exam', 'late', 'ghost', 'paralysis', 'ex-partner'],
    l10n: {
      ko: {
        name: '쫓기는 꿈', keywords: ['회피', '압박', '마감', '두려움'],
        traditional: '해몽서는 쫓기는 꿈을 피하고 있는 일이나 갚아야 할 것이 있다는 뜻으로 읽었습니다.',
        psych: '꿈 내용 연구에서 가장 자주 보고되는 유형 가운데 하나입니다. 무엇에게 쫓기는지보다 도망치는 상황 자체가 반복되는 것이 특징입니다.',
        scenes: [
          { when: '누군가에게 쫓긴다', reads: '미뤄 둔 일이나 회피하는 관계로 읽혔습니다.' },
          { when: '달리는데 몸이 안 움직인다', reads: '뜻대로 되지 않는 상황을 가리킨다고 보았습니다.' },
          { when: '숨어서 들키지 않는다', reads: '고비를 넘긴다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Being chased', keywords: ['avoidance', 'pressure', 'deadline', 'fear'],
        traditional: 'Manuals read being chased as something you are avoiding, or a debt of some kind coming due.',
        psych: 'One of the most commonly reported dream types. What recurs is the situation of fleeing rather than the identity of the pursuer.',
        scenes: [
          { when: 'Someone chases you', reads: 'Read as postponed work or an avoided relationship.' },
          { when: 'You run but cannot move', reads: 'Taken as a situation that will not go your way.' },
          { when: 'You hide and are not found', reads: 'Taken as getting past the hard part.' },
        ],
      },
      ja: {
        name: '追われる夢', keywords: ['回避', '圧迫', '締切', '恐れ'],
        traditional: '夢占書は追われる夢を、避けている事柄や返すべきものがあることとして読みました。',
        psych: '夢内容研究で最も多く報告される型の一つです。追う者の正体より、逃げるという状況自体が反復されるのが特徴です。',
        scenes: [
          { when: '誰かに追われる', reads: '先延ばしにした事や避けている関係と読まれました。' },
          { when: '走っても体が動かない', reads: '思うようにならない状況を指すと見ました。' },
          { when: '隠れて見つからない', reads: '山場を越えると見ました。' },
        ],
      },
      zh: {
        name: '被追赶', keywords: ['回避', '压力', '期限', '恐惧'],
        traditional: '解梦书把被追赶读作有事在躲、有债要还。',
        psych: '这是内容研究中报告最多的梦型之一。反复出现的是"逃"这一处境，而非追赶者是谁。',
        scenes: [
          { when: '被人追赶', reads: '读作拖延之事或回避的关系。' },
          { when: '想跑却动不了', reads: '视为力不从心的处境。' },
          { when: '躲起来没被发现', reads: '视为过了难关。' },
        ],
      },
      fr: {
        name: 'Être poursuivi', keywords: ['évitement', 'pression', 'échéance', 'peur'],
        traditional: "Les manuels y lisent une chose que vous fuyez, ou une dette qui arrive à échéance.",
        psych: "L'un des types de rêve les plus rapportés. Ce qui revient, c'est la situation de fuite, non l'identité du poursuivant.",
        scenes: [
          { when: "Quelqu'un vous poursuit", reads: 'Lu comme un travail remis à plus tard ou une relation évitée.' },
          { when: 'Vous courez sans avancer', reads: 'Tenu pour une situation qui ne cède pas.' },
          { when: 'Vous vous cachez sans être trouvé', reads: 'Tenu pour un passage difficile franchi.' },
        ],
      },
      es: {
        name: 'Ser perseguido', keywords: ['evitación', 'presión', 'plazo', 'miedo'],
        traditional: 'Los manuales lo leen como algo que estás evitando, o una deuda que vence.',
        psych: 'Uno de los tipos de sueño más reportados. Lo que se repite es la situación de huir, no quién persigue.',
        scenes: [
          { when: 'Alguien te persigue', reads: 'Leído como trabajo aplazado o relación evitada.' },
          { when: 'Corres y no avanzas', reads: 'Se tomaba como una situación que no cede.' },
          { when: 'Te escondes y no te encuentran', reads: 'Se tomaba como superar el tramo difícil.' },
        ],
      },
    },
  },
  {
    id: 'death', emoji: '⚰️', category: 'life', related: ['teeth', 'flying', 'baby', 'deceased'],
    l10n: {
      ko: {
        name: '죽음', keywords: ['전환', '끝맺음', '역몽', '두려움'],
        traditional: '한국 해몽에서 죽는 꿈은 흔히 역몽(逆夢)으로 읽혀 새로 태어남·장수·경사로 보았습니다. 나쁜 꿈이 아니라는 쪽이 우세합니다.',
        psych: '죽음 꿈이 실제 죽음과 이어진다는 근거는 없습니다. 큰 변화를 앞둔 시기에 보고가 늘어난다는 관찰이 있을 뿐입니다.',
        scenes: [
          { when: '자신이 죽는다', reads: '새로 시작한다는 역몽으로 보았습니다.' },
          { when: '남이 죽는 것을 본다', reads: '그 사람과의 관계가 달라진다고 읽혔습니다.' },
          { when: '장례를 치른다', reads: '한 시기를 매듭짓는다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Death', keywords: ['transition', 'ending', 'reverse dream', 'fear'],
        traditional: 'Korean practice often reads a death dream as a reverse dream — rebirth, long life, an auspicious event. The reading is mostly not ominous.',
        psych: 'There is no evidence linking death dreams to actual death. What is observed is that reports rise around periods of major change.',
        scenes: [
          { when: 'You die', reads: 'Taken as a reverse dream: a fresh start.' },
          { when: 'You watch someone else die', reads: 'Read as a change in that relationship.' },
          { when: 'You hold a funeral', reads: 'Taken as closing out a chapter.' },
        ],
      },
      ja: {
        name: '死', keywords: ['転換', '区切り', '逆夢', '恐れ'],
        traditional: '韓国の夢解きでは死ぬ夢を逆夢として読み、生まれ変わり・長寿・慶事と見ることが多くあります。凶ではないとする読みが優勢です。',
        psych: '死の夢が実際の死と結びつくという根拠はありません。大きな変化の時期に報告が増えるという観察があるだけです。',
        scenes: [
          { when: '自分が死ぬ', reads: '新しく始まる逆夢と見ました。' },
          { when: '他人が死ぬのを見る', reads: 'その人との関係が変わると読まれました。' },
          { when: '葬儀を行う', reads: '一つの時期を区切ると見ました。' },
        ],
      },
      zh: {
        name: '死亡', keywords: ['转变', '收束', '反梦', '恐惧'],
        traditional: '朝鲜半岛的解梦常把死亡之梦读作反梦——重生、长寿、喜事。多数读法并不视为凶兆。',
        psych: '没有证据表明死亡之梦与真实死亡相连。只有一项观察：重大变动期的报告会增多。',
        scenes: [
          { when: '梦见自己死去', reads: '视为重新开始的反梦。' },
          { when: '看见他人死去', reads: '读作与那人的关系将变。' },
          { when: '办丧事', reads: '视为为一个时期收尾。' },
        ],
      },
      fr: {
        name: 'La mort', keywords: ['transition', 'clôture', 'rêve inversé', 'peur'],
        traditional: "L'usage coréen lit souvent le rêve de mort comme un rêve inversé : renaissance, longue vie, événement heureux. La lecture n'est majoritairement pas funeste.",
        psych: "Rien ne relie les rêves de mort à une mort réelle. On observe seulement que les récits augmentent autour des grands changements.",
        scenes: [
          { when: 'Vous mourez', reads: 'Tenu pour un rêve inversé : un nouveau départ.' },
          { when: "Vous voyez quelqu'un mourir", reads: 'Lu comme un changement dans cette relation.' },
          { when: 'Vous menez des funérailles', reads: "Tenu pour la clôture d'un chapitre." },
        ],
      },
      es: {
        name: 'La muerte', keywords: ['transición', 'cierre', 'sueño inverso', 'miedo'],
        traditional: 'La práctica coreana suele leer el sueño de muerte como sueño inverso: renacer, larga vida, suceso feliz. La lectura en general no es aciaga.',
        psych: 'No hay evidencia que ligue los sueños de muerte con la muerte real. Solo se observa que los relatos aumentan en épocas de gran cambio.',
        scenes: [
          { when: 'Mueres tú', reads: 'Se tomaba como sueño inverso: un comienzo nuevo.' },
          { when: 'Ves morir a alguien', reads: 'Leído como un cambio en esa relación.' },
          { when: 'Celebras un funeral', reads: 'Se tomaba como cerrar una etapa.' },
        ],
      },
    },
  },
  {
    id: 'flying', emoji: '🕊️', category: 'motion', related: ['falling', 'death'],
    l10n: {
      ko: {
        name: '나는 꿈', keywords: ['자유', '해방', '성취', '통제'],
        traditional: '해몽서에서 나는 꿈은 뜻을 펴고 이름을 얻는 일로 읽혔습니다. 높이 오를수록 좋게 보았습니다.',
        psych: '자각몽(꿈인 줄 알면서 꾸는 꿈)에서 자주 보고되는 장면입니다. 통제감이 높은 상태와 함께 나타나는 경향이 있습니다.',
        scenes: [
          { when: '높이 자유롭게 난다', reads: '뜻을 펴고 좋은 일이 있다고 보았습니다.' },
          { when: '날다가 자꾸 내려온다', reads: '뜻과 여건이 어긋난다고 읽혔습니다.' },
          { when: '날고 싶은데 못 난다', reads: '막혀 있는 상황을 가리킨다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Flying', keywords: ['freedom', 'release', 'achievement', 'control'],
        traditional: 'Manuals read flying as ambition realised and a name made. The higher, the better the reading.',
        psych: 'A scene frequently reported in lucid dreams — dreams in which you know you are dreaming. It tends to co-occur with a high sense of control.',
        scenes: [
          { when: 'You fly high and freely', reads: 'Taken as ambition unfolding, good news coming.' },
          { when: 'You keep sinking while flying', reads: 'Read as intention and circumstance out of step.' },
          { when: 'You want to fly but cannot', reads: 'Taken as a situation that is blocked.' },
        ],
      },
      ja: {
        name: '空を飛ぶ夢', keywords: ['自由', '解放', '達成', '制御'],
        traditional: '夢占書では飛ぶ夢を、志を広げ名を得ることとして読みました。高く上がるほど良いと見ました。',
        psych: '明晰夢（夢と気づいて見る夢）でよく報告される場面です。制御感の高い状態と共に現れる傾向があります。',
        scenes: [
          { when: '高く自由に飛ぶ', reads: '志が広がり良い事があると見ました。' },
          { when: '飛んでも下がってしまう', reads: '志と条件が噛み合わないと読まれました。' },
          { when: '飛びたいのに飛べない', reads: '塞がった状況を指すと見ました。' },
        ],
      },
      zh: {
        name: '飞翔', keywords: ['自由', '解脱', '成就', '掌控'],
        traditional: '解梦书把飞翔读作施展抱负、扬名立身。飞得越高，读法越好。',
        psych: '这是清明梦（知道自己在做梦）中常被报告的场景，往往与较高的掌控感同时出现。',
        scenes: [
          { when: '高高地自在飞翔', reads: '视为抱负得展、有喜事将至。' },
          { when: '飞着却不断下坠', reads: '读作心志与条件不合。' },
          { when: '想飞却飞不起来', reads: '视为处境受阻。' },
        ],
      },
      fr: {
        name: 'Voler', keywords: ['liberté', 'libération', 'accomplissement', 'contrôle'],
        traditional: "Les manuels lisent le vol comme une ambition qui se déploie et un nom qui se fait. Plus haut, meilleure est la lecture.",
        psych: "Scène souvent rapportée dans les rêves lucides — ceux où l'on sait qu'on rêve. Elle accompagne volontiers un fort sentiment de contrôle.",
        scenes: [
          { when: 'Vous volez haut et librement', reads: "Tenu pour une ambition qui se déploie et de bonnes nouvelles." },
          { when: 'Vous redescendez sans cesse en volant', reads: 'Lu comme un décalage entre intention et circonstances.' },
          { when: 'Vous voulez voler sans y parvenir', reads: 'Tenu pour une situation bloquée.' },
        ],
      },
      es: {
        name: 'Volar', keywords: ['libertad', 'liberación', 'logro', 'control'],
        traditional: 'Los manuales leen el vuelo como ambición que se despliega y nombre que se gana. Cuanto más alto, mejor la lectura.',
        psych: 'Escena muy reportada en sueños lúcidos —aquellos en que sabes que sueñas—. Suele acompañar a una alta sensación de control.',
        scenes: [
          { when: 'Vuelas alto y libre', reads: 'Se tomaba como ambición que se despliega y buenas nuevas.' },
          { when: 'Vuelas pero te hundes', reads: 'Leído como desajuste entre intención y circunstancias.' },
          { when: 'Quieres volar y no puedes', reads: 'Se tomaba como una situación bloqueada.' },
        ],
      },
    },
  },
  {
    id: 'house', emoji: '🏠', category: 'place', related: ['money', 'lost'],
    l10n: {
      ko: {
        name: '집', keywords: ['기반', '가정', '자기 자신', '상태'],
        traditional: '해몽서에서 집은 나 자신과 가정의 형편으로 읽혔습니다. 집의 상태가 곧 그 사람의 형편이라는 유비입니다.',
        psych: '집은 꿈에 자주 나오는 배경입니다. 특정한 뜻보다 그 집이 어디였는지(어릴 적 집인지 지금 집인지)가 더 많은 것을 말해 줍니다.',
        scenes: [
          { when: '넓고 밝은 집에 있다', reads: '형편이 펴진다고 보았습니다.' },
          { when: '집이 무너지거나 새어 든다', reads: '기반이 흔들린다는 경고로 읽혔습니다.' },
          { when: '모르는 방을 발견한다', reads: '몰랐던 몫이 생긴다고 보았습니다.' },
        ],
      },
      en: {
        name: 'House', keywords: ['foundation', 'family', 'the self', 'condition'],
        traditional: 'Manuals read the house as yourself and the state of your household — the condition of the house standing in for the condition of the person.',
        psych: 'Houses are a frequent dream setting. Which house it was — childhood or current — usually tells you more than any fixed meaning.',
        scenes: [
          { when: 'You are in a large, bright house', reads: 'Taken as circumstances opening up.' },
          { when: 'The house collapses or leaks', reads: 'Read as a warning that your footing is unsteady.' },
          { when: 'You find a room you did not know', reads: 'Taken as a share you did not know you had.' },
        ],
      },
      ja: {
        name: '家', keywords: ['基盤', '家庭', '自分自身', '状態'],
        traditional: '夢占書では家を自分自身と家庭の有様として読みました。家の状態がその人の状態だという類比です。',
        psych: '家は夢によく出る舞台です。固定した意味より、それがどの家だったか（幼い頃の家か今の家か）のほうが多くを語ります。',
        scenes: [
          { when: '広く明るい家にいる', reads: '暮らし向きが開けると見ました。' },
          { when: '家が崩れる・雨漏りする', reads: '基盤が揺らぐ警告と読まれました。' },
          { when: '知らない部屋を見つける', reads: '知らなかった分け前ができると見ました。' },
        ],
      },
      zh: {
        name: '房子', keywords: ['根基', '家庭', '自我', '状态'],
        traditional: '解梦书把房子读作自身与家庭的状况——屋况即人况的类比。',
        psych: '房子是梦中常见的场景。比起固定含义，那是哪一处房子（童年的还是现在的）往往说明更多。',
        scenes: [
          { when: '身处宽敞明亮的房子', reads: '视为境况转好。' },
          { when: '房屋倒塌或漏雨', reads: '读作根基不稳的警示。' },
          { when: '发现从不知道的房间', reads: '视为多出一份未知的份额。' },
        ],
      },
      fr: {
        name: 'La maison', keywords: ['fondation', 'famille', 'le soi', 'état'],
        traditional: "Les manuels lisent la maison comme vous-même et l'état de votre foyer : l'état de la maison vaut pour celui de la personne.",
        psych: "La maison est un décor fréquent. Laquelle c'était — celle de l'enfance ou celle d'aujourd'hui — en dit souvent plus qu'un sens fixe.",
        scenes: [
          { when: 'Vous êtes dans une maison vaste et claire', reads: 'Tenu pour une situation qui se dégage.' },
          { when: "La maison s'effondre ou prend l'eau", reads: 'Lu comme un avertissement sur votre assise.' },
          { when: 'Vous découvrez une pièce inconnue', reads: 'Tenu pour une part que vous ignoriez avoir.' },
        ],
      },
      es: {
        name: 'La casa', keywords: ['base', 'familia', 'el yo', 'estado'],
        traditional: 'Los manuales leen la casa como uno mismo y el estado del hogar: el estado de la casa vale por el de la persona.',
        psych: 'La casa es un escenario frecuente. Cuál era —la de la infancia o la actual— suele decir más que cualquier sentido fijo.',
        scenes: [
          { when: 'Estás en una casa amplia y luminosa', reads: 'Se tomaba como circunstancias que se abren.' },
          { when: 'La casa se derrumba o gotea', reads: 'Leído como aviso sobre tu base.' },
          { when: 'Encuentras una habitación desconocida', reads: 'Se tomaba como una parte que no sabías que tenías.' },
        ],
      },
    },
  },
  {
    id: 'money', emoji: '💰', category: 'place', related: ['house', 'pig', 'blood', 'fish'],
    l10n: {
      ko: {
        name: '돈', keywords: ['재물', '가치', '역몽', '불안'],
        traditional: '해몽에서 돈은 자주 역몽으로 읽혔습니다. 돈을 줍는 꿈은 오히려 나가는 일로, 잃는 꿈은 드는 일로 보는 관습이 있습니다.',
        psych: '돈 꿈이 실제 수입과 이어진다는 근거는 없습니다. 다만 돈 걱정이 큰 시기에 보고가 늘어나는 것은 연속성 가설로 설명됩니다.',
        scenes: [
          { when: '돈을 줍는다', reads: '역몽으로 보아 지출을 조심하라고 읽혔습니다.' },
          { when: '돈을 잃어버린다', reads: '오히려 들어올 일이 있다고 보았습니다.' },
          { when: '돈을 세고 또 센다', reads: '마음이 놓이지 않는 상태로 읽혔습니다.' },
        ],
      },
      en: {
        name: 'Money', keywords: ['fortune', 'value', 'reverse dream', 'worry'],
        traditional: 'Money is often read in reverse: picking money up is taken as money going out, losing it as money coming in.',
        psych: 'No evidence links money dreams to actual income. That reports rise when money worries are heavy fits the continuity hypothesis.',
        scenes: [
          { when: 'You pick up money', reads: 'Read in reverse as a warning to watch spending.' },
          { when: 'You lose money', reads: 'Taken as something coming in instead.' },
          { when: 'You count it over and over', reads: 'Read as a mind that will not settle.' },
        ],
      },
      ja: {
        name: 'お金', keywords: ['財', '価値', '逆夢', '不安'],
        traditional: '夢解きでお金はしばしば逆夢として読まれます。拾う夢は出ていく事、失う夢は入る事と見る慣習があります。',
        psych: 'お金の夢が実際の収入と結びつく根拠はありません。金銭の心配が重い時期に報告が増えるのは連続性仮説で説明されます。',
        scenes: [
          { when: 'お金を拾う', reads: '逆夢と見て出費に気をつけよと読まれました。' },
          { when: 'お金を失くす', reads: 'むしろ入る事があると見ました。' },
          { when: '何度も数え直す', reads: '心が落ち着かない状態と読まれました。' },
        ],
      },
      zh: {
        name: '钱', keywords: ['财运', '价值', '反梦', '忧虑'],
        traditional: '解梦中钱常作反梦读：拾钱视为破财，丢钱反视为进财。',
        psych: '没有证据表明梦见钱与实际收入相关。金钱压力大时报告增多，可用连续性假说解释。',
        scenes: [
          { when: '捡到钱', reads: '作反梦读，提醒留心开支。' },
          { when: '丢了钱', reads: '反而视为有进项。' },
          { when: '反复数钱', reads: '读作心神难安。' },
        ],
      },
      fr: {
        name: "L'argent", keywords: ['fortune', 'valeur', 'rêve inversé', 'souci'],
        traditional: "L'argent se lit souvent à l'envers : le ramasser vaut pour de l'argent qui sort, le perdre pour de l'argent qui entre.",
        psych: "Rien ne relie les rêves d'argent aux revenus réels. Que les récits augmentent en période de soucis d'argent relève de l'hypothèse de continuité.",
        scenes: [
          { when: "Vous ramassez de l'argent", reads: 'Lu à rebours : surveillez vos dépenses.' },
          { when: "Vous perdez de l'argent", reads: "Tenu au contraire pour une rentrée." },
          { when: 'Vous le recomptez sans fin', reads: "Lu comme un esprit qui ne se pose pas." },
        ],
      },
      es: {
        name: 'El dinero', keywords: ['fortuna', 'valor', 'sueño inverso', 'preocupación'],
        traditional: 'El dinero suele leerse al revés: recogerlo vale por dinero que sale; perderlo, por dinero que entra.',
        psych: 'Nada liga los sueños de dinero con los ingresos reales. Que los relatos aumenten en épocas de apuros encaja con la hipótesis de continuidad.',
        scenes: [
          { when: 'Recoges dinero', reads: 'Leído al revés: vigila los gastos.' },
          { when: 'Pierdes dinero', reads: 'Se tomaba, al contrario, como un ingreso.' },
          { when: 'Lo cuentas una y otra vez', reads: 'Leído como una mente que no se asienta.' },
        ],
      },
    },
  },
  {
    id: 'pig', emoji: '🐷', category: 'creature', related: ['money', 'snake', 'tiger'],
    l10n: {
      ko: {
        name: '돼지', keywords: ['재물', '복', '태몽', '풍요'],
        traditional: '한국에서 돼지꿈은 재물의 대표 상징입니다. 돼지를 안거나 집에 들이는 꿈을 특히 좋게 보았습니다.',
        psych: '돼지꿈과 실제 재물이 이어진다는 근거는 없습니다. 이 상징이 유독 강한 것은 한국 문화 안에서의 위치 때문입니다.',
        scenes: [
          { when: '돼지를 안는다', reads: '재물이 들어온다고 보았습니다.' },
          { when: '돼지가 집에 들어온다', reads: '복이 들어온다고 읽혔습니다.' },
          { when: '돼지를 놓친다', reads: '기회를 흘린다는 경고로 보았습니다.' },
        ],
      },
      en: {
        name: 'Pig', keywords: ['fortune', 'luck', 'conception dream', 'abundance'],
        traditional: 'In Korea the pig is the headline symbol of fortune. Holding one, or letting one into the house, was read especially well.',
        psych: 'No evidence connects pig dreams to actual gain. The symbol is unusually strong because of its place in Korean culture, not because of the animal.',
        scenes: [
          { when: 'You hold a pig', reads: 'Taken as fortune coming in.' },
          { when: 'A pig enters the house', reads: 'Read as good luck arriving.' },
          { when: 'A pig gets away from you', reads: 'Taken as letting an opportunity slip.' },
        ],
      },
      ja: {
        name: '豚', keywords: ['財', '福', '胎夢', '豊かさ'],
        traditional: '韓国では豚の夢が財の代表的な象徴です。豚を抱く、家に入れる夢を特に良いと見ました。',
        psych: '豚の夢と実際の利得が結びつく根拠はありません。この象徴が際立って強いのは韓国文化の中での位置によります。',
        scenes: [
          { when: '豚を抱く', reads: '財が入ると見ました。' },
          { when: '豚が家に入ってくる', reads: '福が入ると読まれました。' },
          { when: '豚を逃がす', reads: '機会を逃す警告と見ました。' },
        ],
      },
      zh: {
        name: '猪', keywords: ['财运', '福气', '胎梦', '丰饶'],
        traditional: '在朝鲜半岛，猪梦是财运的头号象征。抱猪、猪入门的梦尤被视为吉。',
        psych: '没有证据把猪梦与实际获利相连。这个象征之所以格外有力，来自它在韩国文化中的位置，而非动物本身。',
        scenes: [
          { when: '抱住猪', reads: '视为财运临门。' },
          { when: '猪进家门', reads: '读作福气进门。' },
          { when: '让猪跑掉', reads: '视为错失机会的警示。' },
        ],
      },
      fr: {
        name: 'Le cochon', keywords: ['fortune', 'chance', 'rêve de conception', 'abondance'],
        traditional: "En Corée, le cochon est le symbole phare de la fortune. Le tenir, ou le faire entrer chez soi, se lisait particulièrement bien.",
        psych: "Rien ne relie les rêves de cochon à un gain réel. Le symbole est si fort à cause de sa place dans la culture coréenne, non de l'animal.",
        scenes: [
          { when: 'Vous tenez un cochon', reads: 'Tenu pour une fortune qui arrive.' },
          { when: 'Un cochon entre dans la maison', reads: 'Lu comme une chance qui vient.' },
          { when: "Un cochon vous échappe", reads: 'Tenu pour une occasion laissée filer.' },
        ],
      },
      es: {
        name: 'El cerdo', keywords: ['fortuna', 'suerte', 'sueño de concepción', 'abundancia'],
        traditional: 'En Corea el cerdo es el símbolo estrella de la fortuna. Sostenerlo, o dejarlo entrar en casa, se leía especialmente bien.',
        psych: 'Nada conecta los sueños de cerdo con una ganancia real. El símbolo es tan fuerte por su lugar en la cultura coreana, no por el animal.',
        scenes: [
          { when: 'Sostienes un cerdo', reads: 'Se tomaba como fortuna que llega.' },
          { when: 'Un cerdo entra en casa', reads: 'Leído como suerte que viene.' },
          { when: 'Se te escapa un cerdo', reads: 'Se tomaba como dejar escapar una oportunidad.' },
        ],
      },
    },
  },
  {
    id: 'baby', emoji: '👶', category: 'life', related: ['snake', 'death', 'dragon'],
    l10n: {
      ko: {
        name: '아기', keywords: ['태몽', '시작', '돌봄', '책임'],
        traditional: '아기 꿈은 태몽으로 자주 읽혔고, 그 밖에는 새로 시작하는 일이나 돌봐야 할 것이 생긴다는 뜻으로 보았습니다.',
        psych: '태몽의 힘은 적중률이 아니라 가족이 아이를 맞이하는 이야기를 만드는 데 있습니다. 그 기능은 꿈이 맞든 아니든 작동합니다.',
        scenes: [
          { when: '아기를 안는다', reads: '새로 맡을 일이 생긴다고 보았습니다.' },
          { when: '아기가 웃는다', reads: '좋은 시작으로 읽혔습니다.' },
          { when: '아기가 우는데 달랠 수 없다', reads: '감당하기 벅찬 책임으로 보았습니다.' },
        ],
      },
      en: {
        name: 'Baby', keywords: ['conception dream', 'beginning', 'care', 'responsibility'],
        traditional: 'Baby dreams were often read as conception dreams; otherwise as something new starting, or something arriving that needs care.',
        psych: 'The power of a conception dream is not accuracy but the story it gives a family for welcoming a child. That works whether or not the dream is right.',
        scenes: [
          { when: 'You hold a baby', reads: 'Taken as a new charge coming to you.' },
          { when: 'The baby smiles', reads: 'Read as a good beginning.' },
          { when: 'The baby cries and will not settle', reads: 'Taken as a responsibility beyond your capacity.' },
        ],
      },
      ja: {
        name: '赤ん坊', keywords: ['胎夢', '始まり', '世話', '責任'],
        traditional: '赤ん坊の夢は胎夢としてよく読まれ、それ以外では新しく始まる事や世話すべきものができる意と見ました。',
        psych: '胎夢の力は的中率ではなく、家族が子を迎える物語を作る点にあります。その働きは夢が当たるかどうかと関係なく生じます。',
        scenes: [
          { when: '赤ん坊を抱く', reads: '新たに引き受ける事ができると見ました。' },
          { when: '赤ん坊が笑う', reads: '良い始まりと読まれました。' },
          { when: '泣き止ませられない', reads: '抱えきれない責任と見ました。' },
        ],
      },
      zh: {
        name: '婴儿', keywords: ['胎梦', '开始', '照料', '责任'],
        traditional: '婴儿之梦常读作胎梦；此外也视为新事将起，或有需要照料之物到来。',
        psych: '胎梦的力量不在准不准，而在于它为家庭迎接孩子提供了一段故事。这一功能与梦是否应验无关。',
        scenes: [
          { when: '抱着婴儿', reads: '视为将有新的担子。' },
          { when: '婴儿在笑', reads: '读作好的开端。' },
          { when: '婴儿哭闹哄不住', reads: '视为力不能及的责任。' },
        ],
      },
      fr: {
        name: 'Le bébé', keywords: ['rêve de conception', 'commencement', 'soin', 'responsabilité'],
        traditional: "Les rêves de bébé se lisaient souvent comme rêves de conception ; sinon comme un commencement, ou quelque chose qui arrive et demande des soins.",
        psych: "La force d'un rêve de conception n'est pas son exactitude mais le récit qu'il donne à une famille pour accueillir un enfant. Cela opère qu'il dise vrai ou non.",
        scenes: [
          { when: 'Vous tenez un bébé', reads: 'Tenu pour une charge nouvelle qui vous revient.' },
          { when: 'Le bébé sourit', reads: 'Lu comme un bon commencement.' },
          { when: 'Le bébé pleure sans se calmer', reads: 'Tenu pour une responsabilité au-dessus de vos forces.' },
        ],
      },
      es: {
        name: 'El bebé', keywords: ['sueño de concepción', 'comienzo', 'cuidado', 'responsabilidad'],
        traditional: 'Los sueños de bebé se leían a menudo como sueños de concepción; si no, como algo que empieza o que llega y pide cuidado.',
        psych: 'La fuerza del sueño de concepción no está en acertar, sino en el relato que da a una familia para recibir a un hijo. Eso funciona acierte o no.',
        scenes: [
          { when: 'Sostienes a un bebé', reads: 'Se tomaba como un nuevo encargo que te llega.' },
          { when: 'El bebé sonríe', reads: 'Leído como un buen comienzo.' },
          { when: 'El bebé llora y no se calma', reads: 'Se tomaba como una responsabilidad que te supera.' },
        ],
      },
    },
  },
  {
    id: 'exam', emoji: '📝', category: 'life', related: ['chased', 'lost', 'naked', 'late', 'celebrity'],
    l10n: {
      ko: {
        name: '시험', keywords: ['평가', '준비 부족', '압박', '오래된 기억'],
        traditional: '해몽서는 시험 꿈을 앞둔 관문과 남의 평가로 읽었습니다.',
        psych: '학교를 떠난 지 오래인 사람도 자주 꾸는 대표적인 꿈입니다. 지금 평가받는다고 느끼는 상황이 옛 장면을 빌려 나타나는 것으로 봅니다.',
        scenes: [
          { when: '준비 없이 시험장에 앉는다', reads: '준비 부족에 대한 경고로 읽혔습니다.' },
          { when: '시험지가 백지다', reads: '내놓을 것이 없다는 압박으로 보았습니다.' },
          { when: '시간이 모자란다', reads: '쫓기는 일정과 겹쳐 읽혔습니다.' },
        ],
      },
      en: {
        name: 'Exam', keywords: ['assessment', 'unprepared', 'pressure', 'old memory'],
        traditional: 'Manuals read the exam dream as a gate ahead and the judgement of others.',
        psych: 'A classic dream reported by people who left school decades ago. It is treated as a present feeling of being judged borrowing an old scene.',
        scenes: [
          { when: 'You sit down unprepared', reads: 'Read as a warning about being unready.' },
          { when: 'The paper is blank', reads: 'Taken as the pressure of having nothing to show.' },
          { when: 'You run out of time', reads: 'Read alongside a schedule that is chasing you.' },
        ],
      },
      ja: {
        name: '試験', keywords: ['評価', '準備不足', '重圧', '古い記憶'],
        traditional: '夢占書は試験の夢を、前に控えた関門と他者の評価として読みました。',
        psych: '学校を離れて久しい人もよく見る代表的な夢です。いま評価されていると感じる状況が、古い場面を借りて現れると見ます。',
        scenes: [
          { when: '準備なしで席に着く', reads: '準備不足への警告と読まれました。' },
          { when: '答案が白紙', reads: '出せるものが無い重圧と見ました。' },
          { when: '時間が足りない', reads: '追われる日程と重ねて読まれました。' },
        ],
      },
      zh: {
        name: '考试', keywords: ['评价', '准备不足', '压力', '旧记忆'],
        traditional: '解梦书把考试之梦读作眼前的关口与他人的评断。',
        psych: '离开学校多年的人也常做的典型梦。它被视为当下"被评价"之感借用了旧场景。',
        scenes: [
          { when: '毫无准备地坐进考场', reads: '读作准备不足的警示。' },
          { when: '试卷一片空白', reads: '视为拿不出东西的压力。' },
          { when: '时间不够用', reads: '与被追赶的日程叠着读。' },
        ],
      },
      fr: {
        name: "L'examen", keywords: ['évaluation', 'impréparation', 'pression', 'vieux souvenir'],
        traditional: "Les manuels lisent le rêve d'examen comme une porte à franchir et le jugement d'autrui.",
        psych: "Un classique, rapporté par des gens sortis de l'école depuis des décennies. On y voit un sentiment présent d'être jugé qui emprunte une vieille scène.",
        scenes: [
          { when: "Vous vous asseyez sans avoir révisé", reads: "Lu comme un avertissement sur votre impréparation." },
          { when: 'La copie est blanche', reads: "Tenu pour la pression de n'avoir rien à montrer." },
          { when: 'Le temps vous manque', reads: 'Lu avec un agenda qui vous poursuit.' },
        ],
      },
      es: {
        name: 'El examen', keywords: ['evaluación', 'falta de preparación', 'presión', 'recuerdo antiguo'],
        traditional: 'Los manuales leen el sueño de examen como una puerta por pasar y el juicio ajeno.',
        psych: 'Un clásico que reportan personas que dejaron la escuela hace décadas. Se ve como una sensación actual de ser juzgado que toma prestada una escena vieja.',
        scenes: [
          { when: 'Te sientas sin haber estudiado', reads: 'Leído como aviso sobre tu falta de preparación.' },
          { when: 'La hoja está en blanco', reads: 'Se tomaba como la presión de no tener qué mostrar.' },
          { when: 'Se te acaba el tiempo', reads: 'Leído junto a una agenda que te persigue.' },
        ],
      },
    },
  },
  {
    id: 'lost', emoji: '🧭', category: 'motion', related: ['house', 'exam', 'late', 'car', 'stranger', 'sea'],
    l10n: {
      ko: {
        name: '길 잃음', keywords: ['방향', '선택', '지연', '낯섦'],
        traditional: '해몽서는 길을 잃는 꿈을 갈피를 못 잡는 형편과 늦어지는 일로 읽었습니다.',
        psych: '목적지에 닿지 못하는 꿈은 자주 보고되는 형태입니다. 어디로 가려 했는지가 그 사람의 관심사를 드러냅니다.',
        scenes: [
          { when: '아는 길인데 낯설다', reads: '익숙하던 일이 달라졌다고 보았습니다.' },
          { when: '가도 가도 도착하지 못한다', reads: '지연되는 일로 읽혔습니다.' },
          { when: '길을 물어도 통하지 않는다', reads: '도움을 청하기 어려운 처지로 보았습니다.' },
        ],
      },
      en: {
        name: 'Getting lost', keywords: ['direction', 'choice', 'delay', 'unfamiliarity'],
        traditional: 'Manuals read losing your way as circumstances you cannot get a grip on, and as things running late.',
        psych: 'Never arriving is a frequently reported dream shape. Where you were trying to get to says more about you than the being-lost does.',
        scenes: [
          { when: 'A familiar road feels strange', reads: 'Taken as something familiar having changed.' },
          { when: 'You walk on and never arrive', reads: 'Read as a matter being delayed.' },
          { when: 'You ask directions and are not understood', reads: 'Taken as being in a place where help is hard to reach.' },
        ],
      },
      ja: {
        name: '道に迷う', keywords: ['方向', '選択', '遅れ', '不慣れ'],
        traditional: '夢占書は道に迷う夢を、見当がつかない状況と遅れる物事として読みました。',
        psych: '目的地に着けない夢はよく報告される型です。どこへ行こうとしていたかが、その人の関心を映します。',
        scenes: [
          { when: '知っている道なのに見知らぬ', reads: '慣れた事が変わったと見ました。' },
          { when: '行っても行っても着かない', reads: '遅れる物事と読まれました。' },
          { when: '道を尋ねても通じない', reads: '助けを求めにくい立場と見ました。' },
        ],
      },
      zh: {
        name: '迷路', keywords: ['方向', '选择', '延迟', '陌生'],
        traditional: '解梦书把迷路读作摸不着头绪的处境与拖延之事。',
        psych: '"到不了目的地"是常见的梦型。你本想去哪里，比"迷路"本身更能说明你的关切。',
        scenes: [
          { when: '熟路却觉陌生', reads: '视为熟悉之事已然改变。' },
          { when: '走了又走仍到不了', reads: '读作事情被拖延。' },
          { when: '问路却说不通', reads: '视为难以求助的处境。' },
        ],
      },
      fr: {
        name: 'Se perdre', keywords: ['direction', 'choix', 'retard', 'étrangeté'],
        traditional: "Les manuels lisent l'égarement comme une situation qu'on ne maîtrise pas et des affaires qui traînent.",
        psych: "Ne jamais arriver est une forme fréquemment rapportée. Où vous vouliez aller en dit plus que le fait d'être perdu.",
        scenes: [
          { when: 'Une route connue devient étrange', reads: "Tenu pour du familier qui a changé." },
          { when: "Vous marchez sans jamais arriver", reads: 'Lu comme une affaire qui prend du retard.' },
          { when: "Vous demandez votre chemin sans être compris", reads: "Tenu pour un endroit où l'aide est hors de portée." },
        ],
      },
      es: {
        name: 'Perderse', keywords: ['dirección', 'elección', 'retraso', 'extrañeza'],
        traditional: 'Los manuales leen perderse como una situación que no logras asir y asuntos que se demoran.',
        psych: 'No llegar nunca es una forma muy reportada. Adónde ibas dice más de ti que el hecho de estar perdido.',
        scenes: [
          { when: 'Un camino conocido se vuelve extraño', reads: 'Se tomaba como algo familiar que cambió.' },
          { when: 'Andas y andas sin llegar', reads: 'Leído como un asunto que se retrasa.' },
          { when: 'Preguntas y no te entienden', reads: 'Se tomaba como estar donde la ayuda no alcanza.' },
        ],
      },
    },
  },
  {
    id: 'naked', emoji: '🫥', category: 'body', related: ['teeth', 'exam', 'celebrity'],
    l10n: {
      ko: {
        name: '알몸', keywords: ['수치', '드러남', '준비 부족', '평가'],
        traditional: '해몽서는 남 앞에서 벗은 꿈을 감추던 것이 드러나는 일로 읽었습니다.',
        psych: '문화를 가리지 않고 보고되는 꿈입니다. 특징은 꿈속 남들이 대개 무심하다는 점인데, 수치는 보는 쪽이 아니라 꾸는 쪽에서 나옵니다.',
        scenes: [
          { when: '남들 앞에서 벗고 있다', reads: '감추던 것이 드러난다고 보았습니다.' },
          { when: '아무도 신경 쓰지 않는다', reads: '걱정이 실제보다 크다는 뜻으로 읽혔습니다.' },
          { when: '가릴 것을 찾는다', reads: '준비가 덜 됐다는 신호로 보았습니다.' },
        ],
      },
      en: {
        name: 'Being naked', keywords: ['shame', 'exposure', 'unprepared', 'judgement'],
        traditional: 'Manuals read being undressed in public as something hidden coming to light.',
        psych: 'Reported across cultures. What is telling is that the onlookers are usually indifferent — the shame comes from the dreamer, not the crowd.',
        scenes: [
          { when: 'You are undressed in front of others', reads: 'Taken as something concealed being revealed.' },
          { when: 'Nobody seems to notice', reads: 'Read as the worry being larger than the reality.' },
          { when: 'You search for something to cover up', reads: 'Taken as a sign of not being ready.' },
        ],
      },
      ja: {
        name: '裸', keywords: ['羞恥', '露見', '準備不足', '評価'],
        traditional: '夢占書は人前で裸の夢を、隠していたものが露わになる事として読みました。',
        psych: '文化を問わず報告される夢です。特徴は夢の中の他人がたいてい無関心なことで、羞恥は見る側でなく見る本人から出ています。',
        scenes: [
          { when: '人前で裸でいる', reads: '隠していたものが露わになると見ました。' },
          { when: '誰も気にしていない', reads: '心配が実際より大きいと読まれました。' },
          { when: '隠すものを探す', reads: '準備が足りない印と見ました。' },
        ],
      },
      zh: {
        name: '赤身', keywords: ['羞耻', '暴露', '准备不足', '评价'],
        traditional: '解梦书把当众赤身之梦读作所藏之事被揭。',
        psych: '这是跨文化都会报告的梦。值得注意的是梦里旁人多半毫不在意——羞耻来自做梦者，而非人群。',
        scenes: [
          { when: '在人前赤身', reads: '视为所藏之事被揭。' },
          { when: '没人在意', reads: '读作忧虑大过实情。' },
          { when: '四处找东西遮挡', reads: '视为尚未准备好的信号。' },
        ],
      },
      fr: {
        name: 'Être nu', keywords: ['honte', 'exposition', 'impréparation', 'jugement'],
        traditional: "Les manuels lisent la nudité en public comme une chose cachée qui vient au jour.",
        psych: "Rapporté dans toutes les cultures. Fait notable : les témoins y sont le plus souvent indifférents — la honte vient du rêveur, pas de la foule.",
        scenes: [
          { when: 'Vous êtes nu devant les autres', reads: 'Tenu pour du dissimulé qui se révèle.' },
          { when: "Personne n'y prête attention", reads: "Lu comme un souci plus grand que la réalité." },
          { when: 'Vous cherchez de quoi vous couvrir', reads: "Tenu pour un signe que vous n'êtes pas prêt." },
        ],
      },
      es: {
        name: 'Estar desnudo', keywords: ['vergüenza', 'exposición', 'falta de preparación', 'juicio'],
        traditional: 'Los manuales leen la desnudez en público como algo oculto que sale a la luz.',
        psych: 'Se reporta en todas las culturas. Lo llamativo es que los presentes suelen ser indiferentes: la vergüenza viene del soñante, no del público.',
        scenes: [
          { when: 'Estás desnudo ante otros', reads: 'Se tomaba como lo escondido que se revela.' },
          { when: 'Nadie parece notarlo', reads: 'Leído como una preocupación mayor que la realidad.' },
          { when: 'Buscas con qué cubrirte', reads: 'Se tomaba como señal de no estar listo.' },
        ],
      },
    },
  },
  {
    id: 'blood', emoji: '🩸', category: 'body', related: ['teeth', 'money'],
    l10n: {
      ko: {
        name: '피', keywords: ['재물', '생명력', '손상', '역몽'],
        traditional: '한국 해몽에서 피는 흔히 재물로 읽혔습니다. 피를 보는 꿈을 나쁘게만 보지 않는 것이 이 전통의 특징입니다.',
        psych: '피는 강한 정서를 부르는 이미지라 잘 기억됩니다. 몸 어딘가가 아픈 상태가 꿈에 섞여 드는 경우도 있습니다.',
        scenes: [
          { when: '피를 많이 본다', reads: '재물이 든다고 보았습니다.' },
          { when: '피가 옷에 묻는다', reads: '뜻밖의 이득으로 읽히기도 했습니다.' },
          { when: '피가 멎지 않는다', reads: '기운이 새어 나가는 상태로 보았습니다.' },
        ],
      },
      en: {
        name: 'Blood', keywords: ['fortune', 'vitality', 'injury', 'reverse dream'],
        traditional: 'Korean practice often reads blood as fortune. That the sight of blood is not taken as simply bad is distinctive to this tradition.',
        psych: 'Blood is a high-affect image and is well remembered. Pain somewhere in the body can also bleed into the dream.',
        scenes: [
          { when: 'You see a great deal of blood', reads: 'Taken as fortune coming in.' },
          { when: 'Blood stains your clothes', reads: 'Sometimes read as an unexpected gain.' },
          { when: 'The bleeding will not stop', reads: 'Taken as vitality draining away.' },
        ],
      },
      ja: {
        name: '血', keywords: ['財', '生命力', '損傷', '逆夢'],
        traditional: '韓国の夢解きでは血をしばしば財として読みます。血を見る夢を悪いとだけ見ないのがこの伝統の特徴です。',
        psych: '血は強い情動を呼ぶ像で記憶に残りやすいものです。体のどこかの痛みが夢に混じることもあります。',
        scenes: [
          { when: '血をたくさん見る', reads: '財が入ると見ました。' },
          { when: '血が服につく', reads: '思わぬ利得と読まれることもありました。' },
          { when: '血が止まらない', reads: '気力が漏れ出る状態と見ました。' },
        ],
      },
      zh: {
        name: '血', keywords: ['财运', '生命力', '损伤', '反梦'],
        traditional: '朝鲜半岛的解梦常把血读作财。见血之梦不被一概视为凶，是这一传统的特点。',
        psych: '血是情绪强度高的意象，容易被记住。身体某处的疼痛也可能混入梦境。',
        scenes: [
          { when: '见到大量的血', reads: '视为财运进门。' },
          { when: '血沾到衣服上', reads: '有时读作意外之得。' },
          { when: '血止不住', reads: '视为气力外泄之状。' },
        ],
      },
      fr: {
        name: 'Le sang', keywords: ['fortune', 'vitalité', 'blessure', 'rêve inversé'],
        traditional: "L'usage coréen lit souvent le sang comme fortune. Que la vue du sang ne soit pas tenue pour simplement néfaste est propre à cette tradition.",
        psych: "Le sang est une image à forte charge, bien mémorisée. Une douleur quelque part dans le corps peut aussi s'infiltrer dans le rêve.",
        scenes: [
          { when: 'Vous voyez beaucoup de sang', reads: 'Tenu pour une fortune qui arrive.' },
          { when: 'Du sang tache vos vêtements', reads: 'Parfois lu comme un gain inattendu.' },
          { when: "Le saignement ne s'arrête pas", reads: 'Tenu pour une vitalité qui se vide.' },
        ],
      },
      es: {
        name: 'La sangre', keywords: ['fortuna', 'vitalidad', 'herida', 'sueño inverso'],
        traditional: 'La práctica coreana suele leer la sangre como fortuna. Que ver sangre no se tome como simplemente malo distingue a esta tradición.',
        psych: 'La sangre es una imagen de alta carga y se recuerda bien. Un dolor en alguna parte del cuerpo también puede colarse en el sueño.',
        scenes: [
          { when: 'Ves mucha sangre', reads: 'Se tomaba como fortuna que llega.' },
          { when: 'La sangre mancha tu ropa', reads: 'A veces leído como una ganancia inesperada.' },
          { when: 'La hemorragia no para', reads: 'Se tomaba como vitalidad que se escapa.' },
        ],
      },
    },
  },
];

export const DREAM_SYMBOL_BY_ID: Record<string, DreamSymbol> = Object.fromEntries(
  DREAM_SYMBOLS.map((s) => [s.id, s]),
);

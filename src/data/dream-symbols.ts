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

export type DreamCategory = 'body' | 'nature' | 'motion' | 'creature' | 'life' | 'place';

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
};

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    id: 'water', emoji: '💧', category: 'nature', related: ['falling', 'snake', 'fire'], hasArticle: true,
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
    id: 'falling', emoji: '🕳️', category: 'motion', related: ['water', 'teeth', 'chased', 'flying'], hasArticle: true,
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
    id: 'teeth', emoji: '🦷', category: 'body', related: ['falling', 'snake', 'death'], hasArticle: true,
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
    id: 'snake', emoji: '🐍', category: 'creature', related: ['water', 'teeth'], hasArticle: true,
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
    id: 'chased', emoji: '🏃', category: 'motion', related: ['falling', 'fire'],
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
    id: 'death', emoji: '⚰️', category: 'life', related: ['teeth', 'flying'],
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
];

export const DREAM_SYMBOL_BY_ID: Record<string, DreamSymbol> = Object.fromEntries(
  DREAM_SYMBOLS.map((s) => [s.id, s]),
);
